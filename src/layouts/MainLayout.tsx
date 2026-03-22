import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Sidebar, MobileMenuButton } from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header with Mobile Menu Button */}
      <div className="flex items-center justify-between md:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
        <Header />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
