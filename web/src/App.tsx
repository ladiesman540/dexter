import { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Sparkles } from 'lucide-react';
import { Layout } from './components/Layout';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AgentProgress } from './components/AgentProgress';
import { useChat } from './hooks/useChat';
import { useSettings } from './hooks/useSettings';
import { useChatHistory } from './hooks/useChatHistory';
import { useProfile } from './hooks/useProfile';

interface EmptyStateProps {
  onQueryClick: (query: string) => void;
}

function EmptyState({ onQueryClick }: EmptyStateProps) {
  const queries = [
    "What was Apple's revenue growth over the last 4 quarters?",
    "Compare Microsoft and Google's operating margins",
    "Analyze Tesla's cash flow trends",
    "What is Amazon's debt-to-equity ratio?",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-dexter-500 to-dexter-600 rounded-2xl flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Welcome to Dexter
      </h2>
      <p className="text-gray-400 max-w-md mb-8">
        Your AI-powered financial research assistant. Ask me anything about
        stocks, companies, financial statements, or market trends.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
        {queries.map((query, i) => (
          <button
            key={i}
            onClick={() => onQueryClick(query)}
            className="text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { settings } = useSettings();
  const { getProfileContext } = useProfile();
  const {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    updateSessionMessages,
    switchSession,
    deleteSession,
  } = useChatHistory();

  const profileContext = getProfileContext();

  const {
    messages,
    isProcessing,
    currentProgress,
    streamingContent,
    sendMessage: sendChatMessage,
    cancelQuery,
    setMessages,
  } = useChat({ model: settings.selectedModel, profileContext });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, currentSession, setMessages]);

  // Save messages when they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      updateSessionMessages(currentSessionId, messages);
    }
  }, [messages, currentSessionId, updateSessionMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, currentProgress]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    (query: string) => {
      // Create a new session if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = createSession();
      }
      sendChatMessage(query);
    },
    [currentSessionId, createSession, sendChatMessage]
  );

  // Handle new chat
  const handleNewChat = useCallback(() => {
    createSession();
    setMessages([]);
  }, [createSession, setMessages]);

  return (
    <Layout
      sessions={sessions}
      currentSessionId={currentSessionId}
      onNewChat={handleNewChat}
      onSelectSession={switchSession}
      onDeleteSession={deleteSession}
    >
      <div className="flex flex-col h-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isProcessing ? (
            <EmptyState onQueryClick={handleSendMessage} />
          ) : (
            <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Current processing state */}
              {isProcessing && (
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dexter-500 to-dexter-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {currentProgress && (
                      <AgentProgress progress={currentProgress} />
                    )}

                    {streamingContent && (
                      <div className="bg-gray-800 rounded-2xl px-5 py-3">
                        <div className="markdown-content">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              onCancel={cancelQuery}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
