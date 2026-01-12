export type Phase = 'understand' | 'plan' | 'execute' | 'reflect' | 'answer';

export interface ToolCallStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface Task {
  id: string;
  description: string;
  taskType: 'use_tools' | 'reason';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  toolCalls?: ToolCallStatus[];
  startTime?: number;
  endTime?: number;
}

export interface AgentProgress {
  currentPhase: Phase;
  understandComplete: boolean;
  planComplete: boolean;
  executeComplete: boolean;
  reflectComplete: boolean;
  tasks: Task[];
  isAnswering: boolean;
  progressMessage?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  progress?: AgentProgress;
}

export interface Settings {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  financialDatasetsApiKey?: string;
  tavilyApiKey?: string;
  ollamaBaseUrl?: string;
  selectedModel: string;
  selectedProvider: string;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  envVar: string;
  description: string;
  required: boolean;
  placeholder: string;
}

export const API_KEYS: ApiKeyConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    description: 'Required for GPT models',
    required: false,
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    envVar: 'ANTHROPIC_API_KEY',
    description: 'Required for Claude models',
    required: false,
    placeholder: 'sk-ant-...',
  },
  {
    id: 'google',
    name: 'Google',
    envVar: 'GOOGLE_API_KEY',
    description: 'Required for Gemini models',
    required: false,
    placeholder: 'AIza...',
  },
  {
    id: 'financialDatasets',
    name: 'Financial Datasets',
    envVar: 'FINANCIAL_DATASETS_API_KEY',
    description: 'Required for financial data (stocks, filings, etc.)',
    required: true,
    placeholder: 'Your API key from financialdatasets.ai',
  },
  {
    id: 'tavily',
    name: 'Tavily',
    envVar: 'TAVILY_API_KEY',
    description: 'Optional - enables web search capability',
    required: false,
    placeholder: 'tvly-...',
  },
];

export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-5.2', 'gpt-5-mini', 'gpt-4.1'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4.5', 'claude-haiku-3.5'] },
  { id: 'google', name: 'Google', models: ['gemini-3', 'gemini-3-flash'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3', 'mistral', 'codellama'] },
];
