import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './context/ThemeContext';
import { ToastContainer } from './components/Toast';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import { ToolsPage } from './pages/ToolsPage';
import { AuthPage } from './pages/AuthPage';
import './App.css';

type AppPage = 'chat' | 'tools';

// Inner component to use the toast hook and auth
const AppContent = () => {
  const { toasts, removeToast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [activePage, setActivePage] = useState<AppPage>('chat');

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-gradient-to-br from-gray-50 via-white to-purple-50' : 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin ${theme === 'light' ? 'border-purple-200 border-t-purple-600' : 'border-purple-900 border-t-purple-400'}`} />
          <p className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <MainLayout activePage={activePage} onNavigate={setActivePage}>
          {activePage === 'chat' ? <ChatPage /> : <ToolsPage />}
        </MainLayout>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
