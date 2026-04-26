import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Flame } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useDirectChat } from '../hooks/useDirectChat';
import { api } from '../services/api';
import type { ChatDto } from '../types';

export const Header: React.FC = () => {
  const { theme } = useTheme();
  const { totalUnreadCount, unreadByChatId } = useDirectChat();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [userChats, setUserChats] = useState<ChatDto[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadItems = useMemo(() => {
    const unreadChatIds = Object.keys(unreadByChatId).filter((chatId) => (unreadByChatId[chatId] ?? 0) > 0);
    const byId = new Map(userChats.map((chat) => [chat.id, chat]));
    return unreadChatIds.map((chatId) => ({
      chatId,
      unreadCount: unreadByChatId[chatId] ?? 0,
      name: byId.get(chatId)?.name || 'Direct Chat',
      lastMessageAt: byId.get(chatId)?.lastMessageAt,
    }));
  }, [unreadByChatId, userChats]);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const fetchChats = async () => {
      try {
        setIsLoadingNotifications(true);
        const chats = await api.getUserChats();
        setUserChats(chats);
      } catch (error) {
        console.error('Failed to load chats for notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    void fetchChats();
  }, [isNotificationsOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current) {
        return;
      }

      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  const handleOpenNotificationChat = (chatId: string) => {
    localStorage.setItem('pendingDirectChatId', chatId);
    window.dispatchEvent(new Event('lp:navigate-chat'));
    setIsNotificationsOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 ${theme === 'light' ? 'bg-white/95 border-gray-200 shadow-sm' : 'bg-gray-950/95 border-gray-800 shadow-none'} backdrop-blur-sm border-b`}>
      <div className="container-custom h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-md ${theme === 'dark' ? 'shadow-lg shadow-purple-500/20' : ''}`}>
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              Little Phoenix
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              RAG Assistant
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`hidden md:flex items-center gap-8`}>
          <a href="#" className={`${theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-gray-400 hover:text-purple-400'} transition-colors font-medium`}>
            Chat
          </a>
          <a href="#" className={`${theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-gray-400 hover:text-purple-400'} transition-colors font-medium`}>
            Documents
          </a>
          <a href="#" className={`${theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-gray-400 hover:text-purple-400'} transition-colors font-medium`}>
            History
          </a>
          <a href="#" className={`${theme === 'light' ? 'text-gray-600 hover:text-purple-600' : 'text-gray-400 hover:text-purple-400'} transition-colors font-medium`}>
            Settings
          </a>
        </nav>

        <div className="flex items-center gap-3" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`relative p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-gray-800 text-gray-300'}`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                {Math.min(totalUnreadCount, 99)}
                {totalUnreadCount > 99 ? '+' : ''}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={`absolute top-14 right-4 md:right-6 w-80 rounded-xl border shadow-xl z-50 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
              <div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                <h3 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Notifications
                </h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <p className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Loading...
                  </p>
                ) : unreadItems.length === 0 ? (
                  <p className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No unread messages.
                  </p>
                ) : (
                  unreadItems.map((item) => (
                    <button
                      key={item.chatId}
                      onClick={() => handleOpenNotificationChat(item.chatId)}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${theme === 'light' ? 'border-gray-100 hover:bg-gray-50' : 'border-gray-800 hover:bg-gray-800'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {item.name}
                          </p>
                          <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.unreadCount} unread message{item.unreadCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                          {Math.min(item.unreadCount, 99)}
                          {item.unreadCount > 99 ? '+' : ''}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
