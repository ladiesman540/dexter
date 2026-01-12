import { Agent } from '../../src/agent/orchestrator.js';
import { MessageHistory } from '../../src/utils/message-history.js';
import { config } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const ENV_PATH = resolve(PROJECT_ROOT, '.env');

// Load environment variables
config({ path: ENV_PATH });

const PORT = 3001;

// In-memory message history per session (in production, use a database)
const messageHistories = new Map<string, MessageHistory>();

function getMessageHistory(sessionId: string): MessageHistory {
  if (!messageHistories.has(sessionId)) {
    messageHistories.set(sessionId, new MessageHistory());
  }
  return messageHistories.get(sessionId)!;
}

// Check if API key exists in .env
function checkApiKeyExists(keyName: string): boolean {
  // Check process.env first
  const value = process.env[keyName];
  if (value && value.trim() && !value.trim().startsWith('your-')) {
    return true;
  }

  // Check .env file directly
  if (existsSync(ENV_PATH)) {
    const envContent = readFileSync(ENV_PATH, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key.trim() === keyName) {
          const val = valueParts.join('=').trim();
          if (val && !val.startsWith('your-')) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Save API key to .env file
function saveApiKeyToEnv(keyName: string, keyValue: string): boolean {
  try {
    let lines: string[] = [];
    let keyUpdated = false;

    if (existsSync(ENV_PATH)) {
      const existingContent = readFileSync(ENV_PATH, 'utf-8');
      for (const line of existingContent.split('\n')) {
        const stripped = line.trim();
        if (!stripped || stripped.startsWith('#')) {
          lines.push(line);
        } else if (stripped.includes('=')) {
          const key = stripped.split('=')[0].trim();
          if (key === keyName) {
            lines.push(`${keyName}=${keyValue}`);
            keyUpdated = true;
          } else {
            lines.push(line);
          }
        } else {
          lines.push(line);
        }
      }

      if (!keyUpdated) {
        lines.push(`${keyName}=${keyValue}`);
      }
    } else {
      lines.push('# Dexter API Keys');
      lines.push(`${keyName}=${keyValue}`);
    }

    writeFileSync(ENV_PATH, lines.join('\n'));

    // Update process.env
    process.env[keyName] = keyValue;

    return true;
  } catch (err) {
    console.error('Failed to save API key:', err);
    return false;
  }
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
  config({ override: true, path: ENV_PATH });

  return getSettings();
}

// Handle query with streaming
async function handleQuery(
  query: string,
  model: string,
  sessionId: string,
  profileContext: string | undefined,
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  const encoder = new TextEncoder();
  const messageHistory = getMessageHistory(sessionId);
  let isClosed = false;

  // Prepend profile context to query if available
  const fullQuery = profileContext
    ? `[USER PROFILE]\n${profileContext}\n\n[QUERY]\n${query}`
    : query;

  // Promise to track when answer stream is fully consumed
  let answerStreamDone: (() => void) | null = null;
  const answerStreamPromise = new Promise<void>((resolve) => {
    answerStreamDone = resolve;
  });

  const sendEvent = (type: string, data: unknown) => {
    if (isClosed) return; // Don't write to closed stream
    try {
      const event = `data: ${JSON.stringify({ type, data })}\n\n`;
      writer.write(encoder.encode(event));
    } catch {
      isClosed = true; // Mark as closed if write fails
    }
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
        onAnswerStream: (stream) => {
          // Consume the stream asynchronously
          (async () => {
            try {
              let fullAnswer = '';
              for await (const chunk of stream) {
                fullAnswer += chunk;
                sendEvent('answer_chunk', chunk);
              }
              // Save to message history
              await messageHistory.addMessage(query, fullAnswer);
              sendEvent('complete', { answer: fullAnswer });
            } catch (err) {
              sendEvent('error', (err as Error).message);
            } finally {
              answerStreamDone?.();
            }
          })();
        },
      },
    });

    await agent.run(fullQuery, messageHistory);

    // Wait for answer stream to be fully consumed
    await answerStreamPromise;
  } catch (error) {
    sendEvent('error', (error as Error).message);
  } finally {
    if (!isClosed) {
      try {
        writer.write(encoder.encode('data: [DONE]\n\n'));
        writer.close();
      } catch {
        // Stream already closed, ignore
      }
    }
    isClosed = true;
  }
}

// Create server
const server = Bun.serve({
  port: PORT,
  idleTimeout: 120, // 2 minutes for streaming responses
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
        const { query, model, profileContext } = body;
        const sessionId = req.headers.get('x-session-id') || 'default';

        // Create streaming response
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        // Start processing in background
        handleQuery(query, model, sessionId, profileContext, writer);

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
