import React, { Suspense, lazy } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { useTheme } from '../context/ThemeContext';

const DocumentUpload = lazy(() => import('../components/DocumentUpload').then(m => ({ default: m.DocumentUpload })));
const Search = lazy(() => import('../components/Search').then(m => ({ default: m.Search })));

export const ChatPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-hidden ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
      {/* Main Chat Area */}
      <div className="flex-1 lg:flex-[2] min-h-0 lg:min-h-full">
        <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-2xl shadow-md ${theme === 'dark' ? 'dark:shadow-lg' : ''} border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} h-full flex flex-col overflow-hidden`}>
          <ChatInterface />
        </div>
      </div>

      {/* Desktop-only side panel */}
      <div className="hidden lg:flex lg:w-80 flex-col gap-4 min-h-0 lg:overflow-y-auto lg:max-h-full">
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
  );
};
