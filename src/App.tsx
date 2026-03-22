import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <ChatPage />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
