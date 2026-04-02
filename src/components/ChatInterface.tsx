import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useConversation } from '../hooks/useConversation';

export const ChatInterface: React.FC = () => {
  const { theme } = useTheme();
  const { messages, sendMessage, isSendingMessage, isLoadingMessages, chatError } = useConversation();

  const [input, setInput] = useState('');
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
    if (!text) return;

    setInput('');
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-xs md:max-w-2xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : `${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-700 text-white'} rounded-bl-none`
              }`}
            >
              <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {(isSendingMessage || isLoadingMessages) && (
          <div className="flex justify-start animate-fade-in">
            <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2`}>
              <Loader className="w-4 h-4 animate-spin" />
              <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {isLoadingMessages ? 'Loading conversation...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        {chatError && (
          <div className="flex justify-start animate-fade-in">
            <div className={`max-w-xs md:max-w-2xl rounded-lg px-4 py-3 flex items-gap-2 border ${theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-800'}`}>
              <AlertCircle className={`w-4 h-4 ${theme === 'light' ? 'text-red-600' : 'text-red-400'} flex-shrink-0 mt-0.5`} />
              <p className={`text-sm ${theme === 'light' ? 'text-red-700' : 'text-red-300'} ml-2`}>{chatError}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-950'} p-4 md:p-6`}>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Ask me anything about your documents..."
              disabled={isSendingMessage || isLoadingMessages}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                theme === 'light'
                  ? 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                  : 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
              }`}
            />
            <button
              type="submit"
              disabled={isSendingMessage || isLoadingMessages || !input.trim()}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
            Press Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
};
