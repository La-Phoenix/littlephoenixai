import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageCircle, Loader, AlertCircle, Trash2, Clock, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useDirectChat } from '../hooks/useDirectChat';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { ChatDto, ChatType } from '../types';
import UserSearch from './UserSearch';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
  typeFilter?: ChatType;
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  selectedChatId,
  typeFilter,
}) => {
  const { theme } = useTheme();
  const { createDirectChat, isTyping, activeChat, unreadByChatId } = useDirectChat();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [chats, setChats] = useState<ChatDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load chats on mount and when filter changes
  useEffect(() => {
    loadChats();
  }, [typeFilter]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await api.searchChats(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search chats error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userChats = await api.getUserChats(typeFilter);
      setChats(userChats);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load chats';
      setError(errorMsg);
      console.error('Load chats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async (user: any) => {
    try {
      const chatId = await createDirectChat(user.id);
      // Reload chats to show the new one
      await loadChats();
      // Select the newly created chat
      onSelectChat(chatId);
      addToast(`Chat started with ${user.name}`, 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create chat';
      addToast(errorMsg, 'error');
      console.error('Create chat error:', err);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await api.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      addToast('Chat deleted', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete chat';
      addToast(errorMsg, 'error');
      console.error('Delete chat error:', err);
    }
  };

  const getLastMessageTime = (lastMessageAt: string) => {
    const date = new Date(lastMessageAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isChatTyping = (chat: ChatDto): boolean => {
    if (activeChat?.id !== chat.id) {
      return false;
    }

    const otherParticipant = chat.members.find(
      (m) => !m.isAssistant && (m.userId || m.id) !== user?.id
    ) || chat.members.find((m) => !m.isAssistant);

    const typingKey = otherParticipant?.userId || otherParticipant?.id;
    return !!(typingKey && typingKey !== user?.id && isTyping[typingKey]);
  };

  return (
    <div
      className={`flex flex-col h-full ${
        theme === 'light' ? 'bg-white border-r border-gray-200' : 'bg-gray-900 border-r border-gray-800'
      }`}
    >
      {/* Header */}
      <div className={`${theme === 'light' ? 'bg-gray-50 border-b border-gray-200' : 'bg-gray-800 border-b border-gray-700'} px-4 py-4 space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            Chats
          </h2>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2"
            title="Start a new chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          theme === 'light'
            ? 'bg-white border-gray-300 focus-within:border-purple-500'
            : 'bg-gray-700 border-gray-600 focus-within:border-purple-500'
        }`}>
          <Search className={`w-4 h-4 flex-shrink-0 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 outline-none text-sm bg-transparent ${
              theme === 'light' ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${
                theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isSearching && <Loader className="w-4 h-4 animate-spin text-purple-600 flex-shrink-0" />}
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        )}

        {error && (
          <div className={`m-4 p-4 rounded-lg flex items-gap-2 border ${
            theme === 'light'
              ? 'bg-red-50 border-red-200'
              : 'bg-red-900/20 border-red-800'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
              theme === 'light' ? 'text-red-600' : 'text-red-400'
            }`} />
            <div className="ml-2">
              <p className={`text-sm ${
                theme === 'light' ? 'text-red-700' : 'text-red-300'
              }`}>
                {error}
              </p>
              <button
                onClick={loadChats}
                className={`text-xs mt-1 underline ${
                  theme === 'light' ? 'text-red-600' : 'text-red-400'
                }`}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && chats.length === 0 && !searchQuery && (
          <div className={`flex flex-col items-center justify-center h-32 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-xs text-purple-600 hover:text-purple-700 mt-2 underline"
            >
              Start a chat
            </button>
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className={`flex flex-col items-center justify-center h-32 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No chats found</p>
          </div>
        )}

        {(searchQuery ? searchResults : chats).map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full px-4 py-3 border-b transition-colors flex items-center gap-3 cursor-pointer ${
              selectedChatId === chat.id
                ? theme === 'light'
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-purple-900/20 border-purple-700'
                : theme === 'light'
                  ? 'border-gray-100 hover:bg-gray-50'
                  : 'border-gray-800 hover:bg-gray-800'
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {chat.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {chat.name}
              </p>
              {isChatTyping(chat) ? (
                <p className={`text-xs font-medium animate-pulse ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                  Typing...
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-xs truncate ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {getLastMessageTime(chat.lastMessageAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Message Count Badge */}
            {(unreadByChatId[chat.id] ?? 0) > 0 && (
              <div className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold flex-shrink-0">
                {Math.min(unreadByChatId[chat.id] ?? 0, 99)}
                {(unreadByChatId[chat.id] ?? 0) > 99 ? '+' : ''}
              </div>
            )}

            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteChat(chat.id, e)}
              className={`p-1.5 rounded opacity-0 hover:opacity-100 transition-all ${
                theme === 'light'
                  ? 'hover:bg-red-100 text-red-600'
                  : 'hover:bg-red-900/30 text-red-400'
              }`}
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* User Search Modal */}
      <UserSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

export default ChatList;
