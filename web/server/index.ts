import { Agent } from '../../src/agent/orchestrator.js';
import { MessageHistory } from '../../src/utils/message-history.js';
import {
  checkApiKeyExists,
  saveApiKeyToEnv,
} from '../../src/utils/env.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env' });

const PORT = 3001;

// In-memory message history per session (in production, use a database)
const messageHistories = new Map<string, MessageHistory>();

function getMessageHistory(sessionId: string): MessageHistory {
  if (!messageHistories.has(sessionId)) {
    messageHistories.set(sessionId, new MessageHistory());
  }
  return messageHistories.get(sessionId)!;
}

// Get current settings
function getSettings() {
  return {
    openaiApiKey: checkApiKeyExists('OPENAI_API_KEY') ? '••••••••' : '',
    anthropicApiKey: checkApiKeyExists('ANTHROPIC_API_KEY') ? '••••••••' : '',
    googleApiKey: checkApiKeyExists('GOOGLE_API_KEY') ? '••••••••' : '',
    financialDatasetsApiKey: checkApiKeyExists('FINANCIAL_DATASETS_API_KEY') ? '••••••••' : '',
    tavilyApiKey: checkApiKeyExists('TAVILY_API_KEY') ? '••••••••' : '',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    selectedProvider: process.env.DEXTER_PROVIDER || 'openai',
    selectedModel: process.env.DEXTER_MODEL || 'gpt-5.2',
  };
}

// Save settings
function saveSettings(settings: Record<string, string | undefined>) {
  const keyMappings: Record<string, string> = {
    openaiApiKey: 'OPENAI_API_KEY',
    anthropicApiKey: 'ANTHROPIC_API_KEY',
    googleApiKey: 'GOOGLE_API_KEY',
    financialDatasetsApiKey: 'FINANCIAL_DATASETS_API_KEY',
    tavilyApiKey: 'TAVILY_API_KEY',
    ollamaBaseUrl: 'OLLAMA_BASE_URL',
    selectedProvider: 'DEXTER_PROVIDER',
    selectedModel: 'DEXTER_MODEL',
  };

  for (const [key, value] of Object.entries(settings)) {
    if (value && !value.includes('••••') && keyMappings[key]) {
      saveApiKeyToEnv(keyMappings[key], value);
    }
  }

  // Reload env
  config({ override: true, path: '../.env' });

  return getSettings();
}

// Handle query with streaming
async function handleQuery(
  query: string,
  model: string,
  sessionId: string,
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  const encoder = new TextEncoder();
  const messageHistory = getMessageHistory(sessionId);

  const sendEvent = (type: string, data: unknown) => {
    const event = `data: ${JSON.stringify({ type, data })}\n\n`;
    writer.write(encoder.encode(event));
  };

  try {
    const agent = new Agent({
      model,
      callbacks: {
        onPhaseStart: (phase) => {
          sendEvent('progress', {
            currentPhase: phase,
            understandComplete: false,
            planComplete: false,
            executeComplete: false,
            reflectComplete: false,
            tasks: [],
            isAnswering: phase === 'answer',
          });
        },
        onPhaseComplete: (phase) => {
          const updates: Record<string, boolean> = {};
          if (phase === 'understand') updates.understandComplete = true;
          if (phase === 'plan') updates.planComplete = true;
          if (phase === 'execute') updates.executeComplete = true;
          if (phase === 'reflect') updates.reflectComplete = true;
          sendEvent('progress', updates);
        },
        onPlanCreated: (plan) => {
          sendEvent('progress', {
            tasks: plan.tasks.map((t) => ({
              id: t.id,
              description: t.description,
              taskType: t.taskType,
              status: 'pending',
            })),
          });
        },
        onTaskUpdate: (taskId, status) => {
          sendEvent('task_update', { taskId, status });
        },
        onTaskToolCallsSet: (taskId, toolCalls) => {
          sendEvent('task_tools', {
            taskId,
            toolCalls: toolCalls.map((t) => ({
              name: t.name,
              status: t.status,
            })),
          });
        },
        onToolCallUpdate: (taskId, toolIndex, status) => {
          sendEvent('tool_update', { taskId, toolIndex, status });
        },
        onProgressMessage: (message) => {
          sendEvent('progress', { progressMessage: message });
        },
        onAnswerStream: async (stream) => {
          let fullAnswer = '';
          for await (const chunk of stream) {
            fullAnswer += chunk;
            sendEvent('answer_chunk', chunk);
          }
          // Save to message history
          await messageHistory.addMessage(query, fullAnswer);
          sendEvent('complete', { answer: fullAnswer });
        },
      },
    });

    await agent.run(query, messageHistory);
  } catch (error) {
    sendEvent('error', (error as Error).message);
  } finally {
    writer.write(encoder.encode('data: [DONE]\n\n'));
    writer.close();
  }
}

// Create server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/settings
    if (url.pathname === '/api/settings' && req.method === 'GET') {
      return Response.json(getSettings(), { headers: corsHeaders });
    }

    // POST /api/settings
    if (url.pathname === '/api/settings' && req.method === 'POST') {
      try {
        const body = await req.json();
        const updatedSettings = saveSettings(body);
        return Response.json(updatedSettings, { headers: corsHeaders });
      } catch (error) {
        return Response.json(
          { error: (error as Error).message },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // POST /api/query
    if (url.pathname === '/api/query' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { query, model } = body;
        const sessionId = req.headers.get('x-session-id') || 'default';

        // Create streaming response
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        // Start processing in background
        handleQuery(query, model, sessionId, writer);

        return new Response(readable, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      } catch (error) {
        return Response.json(
          { error: (error as Error).message },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // 404 for unknown routes
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`🚀 Dexter API server running at http://localhost:${PORT}`);
