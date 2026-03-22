import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import './App.css';

// Inner component to use the toast hook
const AppContent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <MainLayout>
        <ChatPage />
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
