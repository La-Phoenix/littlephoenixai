import React, { Suspense, lazy } from 'react';
import { useTheme } from '../context/ThemeContext';

const DocumentUpload = lazy(() => import('../components/DocumentUpload').then(m => ({ default: m.DocumentUpload })));
const Search = lazy(() => import('../components/Search').then(m => ({ default: m.Search })));

export const ToolsPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full p-4 md:p-6 overflow-auto ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className={`rounded-xl border p-5 ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'}`}>
          <h2 className={`text-xl font-semibold mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            Knowledge Tools
          </h2>
          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Upload content and run semantic searches without crowding the mobile chat screen.
          </p>
        </div>

        <Suspense fallback={<div className="card h-40 animate-pulse" />}>
          <Search />
        </Suspense>

        <Suspense fallback={<div className="card h-40 animate-pulse" />}>
          <DocumentUpload />
        </Suspense>
      </div>
    </div>
  );
};
