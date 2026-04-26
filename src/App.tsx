import { useState, useEffect, useRef } from 'react';
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
import { ConversationProvider } from './context/ConversationContext';
import { DirectChatProvider } from './context/DirectChatContext';
import './App.css';

type AppPage = 'chat' | 'tools';

// Inner component to use the toast hook and auth
const AppContent = () => {
  const { toasts, removeToast } = useToast();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [activePage, setActivePage] = useState<AppPage>('chat');
  const redirectProcessed = useRef(false);
  const wasAuthenticated = useRef(false);

  // Handle OAuth redirect - check for errors and verify cookie
  useEffect(() => {
    // Only process redirect once
    if (redirectProcessed.current) return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      redirectProcessed.current = true;
      console.log('OAuth error detected:', error);
      // Show error from OAuth redirect
      addToast(`Authentication failed: ${decodeURIComponent(error)}`, 'error');
      // Clean up the error param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.size > 0) {
      redirectProcessed.current = true;
      console.log('OAuth redirect detected, checking auth...');
      // OAuth redirect detected, check auth with new cookie
      checkAuth();
      // Clean up params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast, checkAuth]);

  // Show login toast when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current && user) {
      console.log('User logged in, showing success toast');
      addToast(`Welcome, ${user.name || 'Samuel'}! 👋`, 'success');
      wasAuthenticated.current = true;
    } else if (!isAuthenticated) {
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated, user, addToast]);

  useEffect(() => {
    const handleNavigateChat = () => {
      setActivePage('chat');
    };

    window.addEventListener('lp:navigate-chat', handleNavigateChat as EventListener);
    return () => {
      window.removeEventListener('lp:navigate-chat', handleNavigateChat as EventListener);
    };
  }, []);

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
        <ConversationProvider>
          <DirectChatProvider>
            <MainLayout activePage={activePage} onNavigate={setActivePage}>
              {activePage === 'chat' ? <ChatPage /> : <ToolsPage />}
            </MainLayout>
          </DirectChatProvider>
        </ConversationProvider>
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
