import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import { ToolsPage } from './pages/ToolsPage';
import './App.css';

type AppPage = 'chat' | 'tools';

// Inner component to use the toast hook
const AppContent = () => {
  const { toasts, removeToast } = useToast();
  const [activePage, setActivePage] = useState<AppPage>('chat');

  return (
    <>
      <MainLayout activePage={activePage} onNavigate={setActivePage}>
        {activePage === 'chat' ? <ChatPage /> : <ToolsPage />}
      </MainLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
