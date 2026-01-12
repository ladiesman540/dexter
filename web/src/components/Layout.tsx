import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, TrendingUp, Plus, Trash2 } from 'lucide-react';
import type { ChatSession } from '../hooks/useChatHistory';

interface LayoutProps {
  children: React.ReactNode;
  sessions?: ChatSession[];
  currentSessionId?: string | null;
  onNewChat?: () => void;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
}

export function Layout({
  children,
  sessions = [],
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: LayoutProps) {
  const location = useLocation();
  const isChat = location.pathname === '/';

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-dexter-500 to-dexter-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dexter</h1>
              <p className="text-xs text-gray-500">Financial Research AI</p>
            </div>
          </Link>
        </div>

        {/* New Chat Button */}
        {isChat && onNewChat && (
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dexter-600 hover:bg-dexter-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        )}

        {/* Navigation / Chat History */}
        <nav className="flex-1 overflow-y-auto p-4">
          {isChat && sessions.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                History
              </p>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-dexter-600/20 text-dexter-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                  onClick={() => onSelectSession?.(session.id)}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/'
                      ? 'bg-dexter-600/20 text-dexter-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/settings'
                      ? 'bg-dexter-600/20 text-dexter-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Settings Link (when in chat view with history) */}
        {isChat && sessions.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">Dexter v2.5.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
