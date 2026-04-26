import React, { Suspense, lazy, useState, useEffect } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { ChatList } from '../components/ChatList';
import { DirectChat } from '../components/DirectChat';
import { useDirectChat } from '../hooks/useDirectChat';
import { useTheme } from '../context/ThemeContext';
import { MessageCircle, Menu, X } from 'lucide-react';

const DocumentUpload = lazy(() => import('../components/DocumentUpload').then(m => ({ default: m.DocumentUpload })));
const Search = lazy(() => import('../components/Search').then(m => ({ default: m.Search })));

export const ChatPage: React.FC = () => {
  return <ChatPageContent />;
};

const ChatPageContent: React.FC = () => {
  const { theme } = useTheme();
  const { totalUnreadCount } = useDirectChat();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detect mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Restore selected chat from localStorage on mount
  useEffect(() => {
    const pendingDirectChatId = localStorage.getItem('pendingDirectChatId');
    if (pendingDirectChatId) {
      setSelectedChatId(pendingDirectChatId);
      setShowDirectChat(false);
      localStorage.removeItem('pendingDirectChatId');
      return;
    }

    const savedChatId = localStorage.getItem('selectedChatId');
    if (savedChatId) {
      setSelectedChatId(savedChatId);
      // Only auto-open sidebar on desktop, keep it closed on mobile
      if (!isMobile) {
        setShowDirectChat(true);
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const handleShowChatList = () => {
      setSelectedChatId(null);
      setShowDirectChat(true);
      localStorage.removeItem('pendingDirectChatId');
    };

    const handleOpenDirectChat = () => {
      const pendingChatId = localStorage.getItem('pendingDirectChatId');
      if (!pendingChatId) {
        return;
      }

      setSelectedChatId(pendingChatId);
      setShowDirectChat(false);
      localStorage.removeItem('pendingDirectChatId');
    };

    window.addEventListener('lp:show-chat-list', handleShowChatList as EventListener);
    window.addEventListener('lp:navigate-chat', handleOpenDirectChat as EventListener);

    return () => {
      window.removeEventListener('lp:show-chat-list', handleShowChatList as EventListener);
      window.removeEventListener('lp:navigate-chat', handleOpenDirectChat as EventListener);
    };
  }, []);

  // Persist selected chat to localStorage
  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('selectedChatId', selectedChatId);
    } else {
      localStorage.removeItem('selectedChatId');
    }
  }, [selectedChatId]);

  return (
      <div className={`h-full flex flex-col lg:flex-row gap-0 overflow-hidden ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
        {/* Chat List Sidebar - Mobile drawer or Desktop sidebar */}
        {showDirectChat && (
          <>
            {/* Mobile overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowDirectChat(false)}
            />
            {/* Sidebar */}
            <div className={`fixed lg:static left-0 top-0 h-full w-64 z-50 lg:z-auto border-r ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'} flex flex-col lg:flex`}>
              {/* Mobile close button */}
              <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Chats
                </h2>
                <button
                  onClick={() => setShowDirectChat(false)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                >
                  ✕
                </button>
              </div>
              <ChatList
                onSelectChat={(chatId) => {
                  setSelectedChatId(chatId);
                  setShowDirectChat(false); // Close sidebar on mobile after selection
                }}
                selectedChatId={selectedChatId || undefined}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {selectedChatId ? (
            <>
              {/* Mobile Header */}
              <div className={`lg:hidden p-4 border-b flex items-center justify-between ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <button
                  onClick={() => setShowDirectChat(true)}
                  className={`relative p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-gray-700 text-gray-400'}`}
                  title="Open chat list"
                >
                  <Menu className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                      {Math.min(totalUnreadCount, 99)}
                      {totalUnreadCount > 99 ? '+' : ''}
                    </span>
                  )}
                </button>
                <h2 className={`flex-1 text-center text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Chat
                </h2>
                <button
                  onClick={() => {
                    setSelectedChatId(null);
                    setShowDirectChat(false);
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-gray-700 text-gray-400'}`}
                  title="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Chat Content */}
              <div className={`flex-1 min-h-0 overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                <DirectChat otherUserId="" chatId={selectedChatId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-hidden h-full">
              {/* RAG Chat Section */}
              <div className="flex-1 lg:flex-[2] min-h-0 lg:min-h-full flex flex-col gap-4">
                {/* Mobile Chat List Toggle */}
                <button
                  onClick={() => setShowDirectChat(true)}
                  className={`lg:hidden relative px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                      : 'border-purple-500 text-purple-400 hover:bg-purple-900/20'
                  }`}
                >
                  <Menu className="w-5 h-5" />
                  Open Chats
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                      {Math.min(totalUnreadCount, 99)}
                      {totalUnreadCount > 99 ? '+' : ''}
                    </span>
                  )}
                </button>

                {/* Direct Chat Button for Desktop */}
                <button
                  onClick={() => setShowDirectChat(true)}
                  className={`hidden md:flex relative px-4 py-3 rounded-lg border-2 items-center justify-center gap-2 font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                      : 'border-purple-500 text-purple-400 hover:bg-purple-900/20'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Direct Chat
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                      {Math.min(totalUnreadCount, 99)}
                      {totalUnreadCount > 99 ? '+' : ''}
                    </span>
                  )}
                </button>

                {/* Chat Interface */}
                <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-2xl shadow-md ${theme === 'dark' ? 'dark:shadow-lg' : ''} border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} flex-1 min-h-0 flex flex-col overflow-hidden`}>
                  <ChatInterface />
                </div>
              </div>

              {/* Desktop-only side panel */}
              <div className="hidden lg:flex lg:w-80 flex-col gap-4 min-h-0 lg:overflow-y-auto lg:max-h-full">
                {/* Direct Chat Button */}
                <button
                  onClick={() => setShowDirectChat(true)}
                  className={`relative px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                      : 'border-purple-500 text-purple-400 hover:bg-purple-900/20'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Direct Chat
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                      {Math.min(totalUnreadCount, 99)}
                      {totalUnreadCount > 99 ? '+' : ''}
                    </span>
                  )}
                </button>

                {/* Search */}
                <Suspense fallback={<div className="card h-40 animate-pulse" />}>
                  <Search />
                </Suspense>

                {/* Document Upload */}
                <Suspense fallback={<div className="card h-40 animate-pulse" />}>
                  <DocumentUpload />
                </Suspense>

                {/* Info Card */}
                <div className={`rounded-xl border ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'} p-6 shadow-md`}>
                  <div className="mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'} mb-2`}>
                      About Little Phoenix
                    </h3>
                  </div>
                  <ul className={`space-y-3 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-semibold">📚</span>
                      <span>Upload documents to train the AI</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-semibold">💬</span>
                      <span>Ask questions based on your documents</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-semibold">🔄</span>
                      <span>Get context-aware answers instantly</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-semibold">🌙</span>
                      <span>Beautiful dark/light mode support</span>
                    </li>
                  </ul>
                </div>

                {/* Tips Card */}
                <div className={`rounded-xl border p-6 ${theme === 'light' ? 'from-purple-50 to-purple-100 bg-gradient-to-br border-purple-200 text-purple-900' : 'dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800/50 dark:text-purple-300 from-purple-900/20 to-purple-800/20 border-purple-800/50 text-purple-300'}`}>
                  <h4 className="font-semibold mb-2">
                    💡 Pro Tips
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Upload multiple documents for better context</li>
                    <li>• Use specific questions for accurate answers</li>
                    <li>• Check conversation history anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ChatPage;
