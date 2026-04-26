import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader, AlertCircle, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DirectChatContext } from '../context/DirectChatContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';

interface DirectChatProps {
  otherUserId: string;
  chatId?: string; // If provided, loads existing chat instead of creating new
}

export const DirectChat: React.FC<DirectChatProps> = ({
  otherUserId,
  chatId,
}) => {
  const { theme } = useTheme();
  const {
    activeChat,
    messages,
    isTyping,
    onlineByUserId,
    isLoadingChat,
    isSendingMessage,
    isConnected,
    error,
    createDirectChat,
    selectChat,
    sendMessage,
    setTyping,
    markAsRead,
    clearError,
  } = React.useContext(DirectChatContext);
  const { user } = useAuth();

  const { addToast } = useToast();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingInactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSentTypingTrueRef = useRef(false);
  const lastMarkedReadOrderRef = useRef<Record<string, number>>({});

  // Initialize chat
  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
    } else {
      createDirectChat(otherUserId);
    }
  }, [chatId, otherUserId, createDirectChat, selectChat]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getLatestMessageOrder = useCallback((): number => {
    if (messages.length === 0) return 0;
    return messages.reduce((max, msg) => Math.max(max, Number(msg.order) || 0), 0);
  }, [messages]);

  const isNearBottom = useCallback((): boolean => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    return remaining <= 120;
  }, []);

  const markLatestAsRead = useCallback(async () => {
    if (!activeChat?.id) return;
    const latestOrder = getLatestMessageOrder();
    const alreadyMarked = lastMarkedReadOrderRef.current[activeChat.id] ?? 0;
    if (latestOrder <= alreadyMarked) {
      return;
    }
    lastMarkedReadOrderRef.current[activeChat.id] = latestOrder;
    await markAsRead(latestOrder);
  }, [activeChat?.id, getLatestMessageOrder, markAsRead]);

  useEffect(() => {
    if (!activeChat?.id) return;
    void markLatestAsRead();
  }, [activeChat?.id, markLatestAsRead]);

  useEffect(() => {
    const onFocusOrVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!isNearBottom()) return;
      void markLatestAsRead();
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [isNearBottom, markLatestAsRead]);

  useEffect(() => {
    if (document.visibilityState !== 'visible') return;
    if (!isNearBottom()) return;
    void markLatestAsRead();
  }, [messages, isNearBottom, markLatestAsRead]);

  useEffect(() => {
    return () => {
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      if (typingInactivityTimeoutRef.current) {
        clearTimeout(typingInactivityTimeoutRef.current);
      }
    };
  }, []);

  const scheduleTypingStop = () => {
    if (typingInactivityTimeoutRef.current) {
      clearTimeout(typingInactivityTimeoutRef.current);
    }

    typingInactivityTimeoutRef.current = setTimeout(() => {
      hasSentTypingTrueRef.current = false;
      void setTyping(false);
    }, 1800);
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    if (typingDebounceTimeoutRef.current) {
      clearTimeout(typingDebounceTimeoutRef.current);
    }
    if (typingInactivityTimeoutRef.current) {
      clearTimeout(typingInactivityTimeoutRef.current);
    }

    hasSentTypingTrueRef.current = false;
    void setTyping(false);

    sendMessage(text);
    setInput('');
  };

  // Handle input change for typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInput(nextValue);

    if (!nextValue.trim()) {
      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }
      if (typingInactivityTimeoutRef.current) {
        clearTimeout(typingInactivityTimeoutRef.current);
      }
      if (hasSentTypingTrueRef.current) {
        hasSentTypingTrueRef.current = false;
        void setTyping(false);
      }
      return;
    }

    if (typingDebounceTimeoutRef.current) {
      clearTimeout(typingDebounceTimeoutRef.current);
    }

    typingDebounceTimeoutRef.current = setTimeout(() => {
      if (!hasSentTypingTrueRef.current) {
        hasSentTypingTrueRef.current = true;
        void setTyping(true);
      }
      scheduleTypingStop();
    }, 300);
  };

  // Handle copy message
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      addToast('Copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      addToast('Failed to copy', 'error');
      console.error('Copy error:', err);
    }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split('\n*');

    if (parts.length === 1) {
      return <p className="text-sm md:text-base leading-relaxed pr-8">{content}</p>;
    }

    const firstPart = parts[0];

    return (
      <div className="text-sm md:text-base leading-relaxed pr-8">
        {firstPart && <p className="mb-2">{firstPart}</p>}
        <ul className="space-y-1 ml-4">
          {parts.slice(1).map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-current">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const otherParticipant = activeChat?.members.find(
    (m) => !m.isAssistant && (m.userId || m.id) !== user?.id
  ) || activeChat?.members.find((m) => !m.isAssistant);

  const chatDisplayName =
    otherParticipant?.displayName ||
    activeChat?.name?.replace(/^Direct:\s*/, '').split(' & ')[0] ||
    'Chat';

  const otherParticipantPictureUrl = (otherParticipant as { pictureUrl?: string | null } | undefined)?.pictureUrl;

  const otherPresenceKey = otherParticipant?.userId || otherParticipant?.id;
  const hasPresenceSignal = !!otherPresenceKey && Object.prototype.hasOwnProperty.call(onlineByUserId, otherPresenceKey);
  const otherIsOnline = !!(otherPresenceKey && onlineByUserId[otherPresenceKey]);
  const isOtherTyping = !!(otherPresenceKey && isTyping[otherPresenceKey] && otherPresenceKey !== user?.id);

  const chatStatus = hasPresenceSignal
    ? (otherIsOnline ? '🟢 Online' : '⚪ Offline')
    : (isConnected ? '🟢 Online' : '⚪ Offline');

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div
        className={`border-b ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-950'} px-4 md:px-6 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <Avatar
            pictureUrl={otherParticipantPictureUrl}
            name={chatDisplayName}
            size="md"
          />
          <div>
            <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {chatDisplayName}
            </h2>
            {isOtherTyping ? (
              <p className={`text-xs font-medium animate-pulse ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                Typing...
              </p>
            ) : (
              <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {chatStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={() => {
          if (isNearBottom()) {
            void markLatestAsRead();
          }
        }}
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}
      >
        {messages.map((message) => {
          const senderMember = activeChat?.members.find(
            (m) => m.id === message.senderId || m.userId === message.senderId
          );

          const isSenderCurrentUser = !!user?.id && (
            senderMember?.userId === user.id ||
            senderMember?.id === user.id ||
            message.senderId === user.id
          );
          const isSenderMessage = isSenderCurrentUser;

          return (
            <div
              key={message.id}
              className={`flex ${isSenderMessage ? 'justify-start' : 'justify-end'} animate-fade-in group`}
            >
              <div
                className={`max-w-xs md:max-w-2xl rounded-lg px-4 py-3 relative ${
                  isSenderMessage
                    ? 'bg-purple-600 text-white rounded-bl-none'
                    : `${
                        theme === 'light'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-gray-700 text-white'
                      } rounded-br-none`
                }`}
              >
                <div className="relative">
                  {renderMessageContent(message.content)}
                </div>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 ${
                    copiedId === message.id
                      ? isSenderMessage
                        ? 'bg-purple-700 text-white'
                        : theme === 'light'
                          ? 'bg-gray-200'
                          : 'bg-gray-600'
                      : isSenderMessage
                        ? 'bg-purple-700/50 text-white hover:bg-purple-700'
                        : theme === 'light'
                          ? 'bg-gray-200 hover:bg-gray-300'
                          : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title="Copy message"
                >
                  {copiedId === message.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Typing Indicators */}
        {Object.entries(isTyping).map(([userId, typing]) =>
          typing ? (
            userId !== user?.id &&
            <div key={userId} className="flex justify-start animate-fade-in mb-3">
              <div
                className={`${
                  theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                } rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2`}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* Loading State */}
        {(isSendingMessage || isLoadingChat) && (
          <div className="flex justify-start animate-fade-in">
            <div
              className={`${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
              } rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2`}
            >
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-start animate-fade-in">
            <div
              className={`max-w-xs md:max-w-2xl rounded-lg px-4 py-3 flex items-gap-2 border ${
                theme === 'light'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 ${
                  theme === 'light' ? 'text-red-600' : 'text-red-400'
                } flex-shrink-0 mt-0.5`}
              />
              <div className="ml-2">
                <p
                  className={`text-sm ${
                    theme === 'light' ? 'text-red-700' : 'text-red-300'
                  }`}
                >
                  {error}
                </p>
                <button
                  onClick={clearError}
                  className={`text-xs mt-1 underline ${
                    theme === 'light' ? 'text-red-600' : 'text-red-400'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`border-t ${
          theme === 'light'
            ? 'border-gray-200 bg-white'
            : 'border-gray-800 bg-gray-950'
        } p-4 md:p-6`}
      >
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={!isConnected || isLoadingChat}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                  : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <button
              type="submit"
              disabled={!isConnected || isLoadingChat || !input.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingMessage ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectChat;
