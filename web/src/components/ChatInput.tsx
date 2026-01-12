import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function ChatInput({ onSend, onCancel, disabled, isProcessing }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3 bg-gray-900 border border-gray-700 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-dexter-500 focus-within:border-transparent transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about stocks, financials, market trends..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-gray-100 placeholder-gray-500 max-h-[200px]"
        />

        {isProcessing ? (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            <Square className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="p-2 bg-dexter-600 hover:bg-dexter-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
