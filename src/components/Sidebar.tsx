import React, { useState } from 'react';
import { Menu, X, Plus, FileText, Clock, Settings, LogOut, MessageSquare, Search, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: 'chat' | 'tools';
  onNavigate: (page: 'chat' | 'tools') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, onNavigate }) => {
  const [conversations] = useState([
    { id: '1', title: 'About React Fundamentals' },
    { id: '2', title: 'TypeScript Best Practices' },
    { id: '3', title: 'Web Performance Tips' },
  ]);
  const { theme } = useTheme();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-[calc(100vh-64px)] w-64 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} border-r overflow-y-auto transition-transform duration-300 z-40 md:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close Button (Mobile) */}
          <div className="md:hidden flex items-center justify-between p-4 m-0 pb-0">
            <h2 className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Menu</h2>
            <button
              onClick={onClose}
              className={`p-1 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-lg transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Conversation */}
          <div className="p-4">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
          </div>

          {/* Navigation */}
          <div className="px-4 pb-2">
            <h3 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} uppercase px-2 mb-3`}>
              Navigate
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('chat')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activePage === 'chat'
                    ? theme === 'light'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-900/30 text-purple-300'
                    : theme === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => onNavigate('tools')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activePage === 'tools'
                    ? theme === 'light'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-900/30 text-purple-300'
                    : theme === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Search className="w-4 h-4" />
                Upload & Search
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 px-4 pt-2">
            <h3 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} uppercase px-2 mb-3`}>
              Recent Conversations
            </h3>
            <div className="space-y-2 mb-6">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'} transition-colors truncate flex items-center gap-2`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {conv.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'} space-y-2`}>
            <a
              href="https://my-portfolio-gray-nine.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'} rounded-lg transition-colors text-sm`}
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4" />
                Meet Developer
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <button className={`w-full flex items-center gap-3 px-3 py-2 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'} rounded-lg transition-colors text-sm`}>
              <FileText className="w-4 h-4" />
              Documents
            </button>
            <button className={`w-full flex items-center gap-3 px-3 py-2 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'} rounded-lg transition-colors text-sm`}>
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className={`w-full flex items-center gap-3 px-3 py-2 ${theme === 'light' ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'} rounded-lg transition-colors text-sm`}>
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <p className={`text-xs text-center pt-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              Copyright © {new Date().getFullYear()} Little Phoenix AI
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

// Mobile Menu Button
export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`md:hidden p-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-lg transition-colors`}
      aria-label="Toggle menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};
