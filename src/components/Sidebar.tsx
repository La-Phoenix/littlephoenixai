import React, { useState } from 'react';
import { Menu, X, Plus, FileText, Clock, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [conversations] = useState([
    { id: '1', title: 'About React Fundamentals' },
    { id: '2', title: 'TypeScript Best Practices' },
    { id: '3', title: 'Web Performance Tips' },
  ]);

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
        className={`fixed md:relative left-0 top-0 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto transition-transform duration-300 z-40 md:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close Button (Mobile) */}
          <div className="md:hidden flex items-center justify-between p-4 m-0 pb-0">
            <h2 className="font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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

          {/* Conversations */}
          <div className="flex-1 px-4 pt-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 mb-3">
              Recent Conversations
            </h3>
            <div className="space-y-2 mb-6">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {conv.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
              <FileText className="w-4 h-4" />
              Documents
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Mobile Menu Button
export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      aria-label="Toggle menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};
