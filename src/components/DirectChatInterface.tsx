import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, AlertCircle, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useDirectChat } from '../hooks/useDirectChat';
import { useToast } from '../context/ToastContext';
import { MessageRole } from '../types';

export const DirectChatInterface: React.FC = () => {
  const { theme } = useTheme();
  const { messages, isTyping, sendMessage, isSendingMessage, isLoadingChat, isConnecting, error, setTyping, isConnected } = useDirectChat();
  const { addToast } = useToast();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || isSendingMessage) return;

    // Clear typing indicator
    setIsLocalTyping(false);
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setInput('');
    await sendMessage(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Send typing indicator
    if (!isLocalTyping) {
      setIsLocalTyping(true);
      setTyping(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      setTyping(false);
    }, 3000);
  };

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

  const otherTypingUsers = Object.entries(isTyping)
    .filter(([, isTypingVal]) => isTypingVal)
    .map(([userId]) => userId);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}
      >
        {isLoadingChat || isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {isLoadingChat ? 'Loading chat...' : 'Connecting to chat...'}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 p-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg w-full ${theme === 'light' ? 'bg-red-50 text-red-700' : 'bg-red-900/20 text-red-400'}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
                {error.includes('Connection') && (
                  <p className="text-xs mt-1 opacity-75">Check your internet connection and try again</p>
                )}
              </div>
            </div>
            {!isConnected && (
              <div className={`text-xs px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-yellow-50 text-yellow-700' : 'bg-yellow-900/20 text-yellow-400'}`}>
                ⚠️ Connection status: Disconnected
              </div>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUserMessage = message.role === MessageRole.User;
              return (
              <div
                key={message.id}
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} animate-fade-in group`}
              >
                <div
                  className={`max-w-xs md:max-w-2xl rounded-lg px-4 py-3 relative ${
                    isUserMessage
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : `${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-700 text-white'} rounded-bl-none`
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-75">{message.senderId}</p>
                  <p className="text-sm md:text-base leading-relaxed pr-8">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <button
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 ${
                      isUserMessage
                        ? 'hover:bg-purple-700 text-white'
                        : `hover:bg-gray-${theme === 'light' ? '200' : '600'}`
                    }`}
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
            {otherTypingUsers.length > 0 && (
              <div className="flex justify-start">
                <div
                  className={`px-4 py-3 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`border-t p-4 md:p-6 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}
      >
        {!isConnected && !isConnecting && (
          <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 text-sm ${theme === 'light' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'}`}>
            <div className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500"></div>
            <p>Not connected. Reconnecting...</p>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder={isConnecting ? 'Connecting...' : 'Type a message... (Shift+Enter for new line)'}
            rows={1}
            className={`flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none max-h-32 ${
              theme === 'light'
                ? 'bg-white text-gray-900 border-gray-200 placeholder-gray-400'
                : 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
            }`}
            onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as unknown as React.FormEvent);
              }
            }}
            disabled={isSendingMessage || isLoadingChat || isConnecting}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSendingMessage || isLoadingChat || isConnecting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg p-3 transition-colors duration-200"
            title={isConnecting ? 'Connecting to chat...' : !isConnected ? 'Reconnecting...' : 'Send message'}
          >
            {isSendingMessage ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
