import { useState, useCallback, useRef } from 'react';
import type { Message, AgentProgress } from '../types';

interface UseChatOptions {
  model: string;
  profileContext?: string;
}

export function useChat({ model, profileContext }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<AgentProgress | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    if (isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setStreamingContent('');
    setCurrentProgress(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model, profileContext }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send query');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);

            if (event.type === 'progress') {
              setCurrentProgress(event.data);
            } else if (event.type === 'answer_chunk') {
              fullContent += event.data;
              setStreamingContent(fullContent);
            } else if (event.type === 'complete') {
              // Add assistant message
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
              };
              setMessages(prev => [...prev, assistantMessage]);
              setStreamingContent('');
              setCurrentProgress(null);
            } else if (event.type === 'error') {
              throw new Error(event.data);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled
        return;
      }

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [isProcessing, model, profileContext]);

  const cancelQuery = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setCurrentProgress(null);
    setStreamingContent('');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    isProcessing,
    currentProgress,
    streamingContent,
    sendMessage,
    cancelQuery,
    clearMessages,
  };
}
