import React from 'react';
import { Flame } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { theme } = useTheme();

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

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};
