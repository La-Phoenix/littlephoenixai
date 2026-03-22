import React, { Suspense, lazy } from 'react';
import { ChatInterface } from '../components/ChatInterface';

const DocumentUpload = lazy(() => import('../components/DocumentUpload').then(m => ({ default: m.DocumentUpload })));

export const ChatPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6">
      {/* Main Chat Area */}
      <div className="flex-1 lg:flex-[2]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft dark:shadow-none border border-gray-200 dark:border-gray-800 h-full flex flex-col overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Sidebar with Document Upload and Info */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Document Upload */}
        <Suspense fallback={<div className="card h-40 animate-pulse" />}>
          <DocumentUpload />
        </Suspense>

        {/* Info Card */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              About Little Phoenix
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">📚</span>
              <span>Upload documents to train the AI</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">💬</span>
              <span>Ask questions based on your documents</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">🔄</span>
              <span>Get context-aware answers instantly</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">🌙</span>
              <span>Beautiful dark mode support</span>
            </li>
          </ul>
        </div>

        {/* Tips Card */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800/50">
          <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            💡 Pro Tips
          </h4>
          <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
            <li>• Upload multiple documents for better context</li>
            <li>• Use specific questions for accurate answers</li>
            <li>• Check conversation history anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
