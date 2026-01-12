import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gray-700'
            : 'bg-gradient-to-br from-dexter-500 to-dexter-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-gray-300" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}
      >
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser
              ? 'bg-dexter-600 text-white'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
