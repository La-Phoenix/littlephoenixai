import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Sidebar, MobileMenuButton } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
  activePage: 'chat' | 'tools';
  onNavigate: (page: 'chat' | 'tools') => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col h-screen ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-950 text-white'}`}>
      {/* Header with Mobile Menu Button */}
      <div className={`flex items-center justify-between md:hidden px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'}`}>
        <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
        <Header />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-1 overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-gray-950'}`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={(page) => {
            onNavigate(page);
            setSidebarOpen(false);
          }}
        />
        <main className={`flex-1 overflow-auto ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
