import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Sparkles } from 'lucide-react';
import { Layout } from './components/Layout';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AgentProgress } from './components/AgentProgress';
import { useChat } from './hooks/useChat';
import { useSettings } from './hooks/useSettings';

function EmptyState() {
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
        {[
          "What was Apple's revenue growth over the last 4 quarters?",
          "Compare Microsoft and Google's operating margins",
          "Analyze Tesla's cash flow trends",
          "What is Amazon's debt-to-equity ratio?",
        ].map((query, i) => (
          <button
            key={i}
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
  const {
    messages,
    isProcessing,
    currentProgress,
    streamingContent,
    sendMessage,
    cancelQuery,
  } = useChat(settings.selectedModel);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, currentProgress]);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isProcessing ? (
            <EmptyState />
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
              onSend={sendMessage}
              onCancel={cancelQuery}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
