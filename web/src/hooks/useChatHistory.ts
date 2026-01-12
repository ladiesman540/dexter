import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../types';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'dexter-chat-history';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function loadSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage full or unavailable
  }
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);

    // Set current session to most recent, or create new one
    if (loaded.length > 0) {
      setCurrentSessionId(loaded[0].id);
    }
  }, []);

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  // Create new session
  const createSession = useCallback((): string => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });

    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Update session messages
  const updateSessionMessages = useCallback(
    (sessionId: string, messages: Message[]) => {
      setSessions((prev) => {
        const updated = prev.map((session) => {
          if (session.id !== sessionId) return session;

          // Generate title from first user message if still "New Chat"
          let title = session.title;
          if (title === 'New Chat' && messages.length > 0) {
            const firstUserMsg = messages.find((m) => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
            }
          }

          return {
            ...session,
            title,
            messages,
            updatedAt: Date.now(),
          };
        });

        // Sort by most recent
        updated.sort((a, b) => b.updatedAt - a.updatedAt);
        saveSessions(updated);
        return updated;
      });
    },
    []
  );

  // Switch to session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        saveSessions(updated);

        // If we deleted current session, switch to another
        if (sessionId === currentSessionId) {
          setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
        }

        return updated;
      });
    },
    [currentSessionId]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    updateSessionMessages,
    switchSession,
    deleteSession,
    clearHistory,
  };
}
