import React, { useState } from 'react';
import { Flame, Loader } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const AuthPage: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    try {
      setIsLoading(true);
      // Redirect to backend OAuth endpoint - backend handles the OAuth flow
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate Google login';
      addToast(message, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${
        theme === 'light'
          ? 'bg-gradient-to-br from-gray-50 via-white to-purple-50'
          : 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950'
      }`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
            theme === 'light'
              ? 'bg-purple-100 opacity-30'
              : 'bg-purple-900 opacity-20'
          } blur-3xl`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
            theme === 'light'
              ? 'bg-blue-100 opacity-30'
              : 'bg-blue-900 opacity-20'
          } blur-3xl`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg ${
                theme === 'dark' ? 'shadow-purple-500/30' : ''
              }`}
            >
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
          >
            Little Phoenix
          </h1>
          <p
            className={`text-lg mb-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            RAG Assistant
          </p>
          <p
            className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
          >
            Your intelligent document companion
          </p>
        </div>

        {/* Login Card */}
        <div
          className={`backdrop-blur-xl rounded-2xl border shadow-2xl p-8 ${
            theme === 'light'
              ? 'bg-white/80 border-gray-200'
              : 'bg-gray-800/80 border-gray-700'
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
          >
            Welcome Back
          </h2>
          <p
            className={`mb-8 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            Sign in with your Google account to continue
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isLoading
                ? `${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-700 text-gray-400'
                  } cursor-not-allowed`
                : `${
                    theme === 'light'
                      ? 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400'
                      : 'bg-gray-700 border-2 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500'
                  } shadow-md hover:shadow-lg`
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Feature highlights */}
          <div
            className={`mt-8 pt-8 border-t ${
              theme === 'light' ? 'border-gray-200' : 'border-gray-700'
            }`}
          >
            <p
              className={`text-xs font-semibold mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              WHAT YOU CAN DO:
            </p>
            <ul className="space-y-3">
              {[
                { icon: '📚', text: 'Upload and manage documents' },
                { icon: '💬', text: 'Chat with your AI assistant' },
                { icon: '🔍', text: 'Search your knowledge base' },
                { icon: '🌙', text: 'Dark & light mode support' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center text-xs mt-8 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          Secure authentication powered by Google OAuth 2.0
        </p>
      </div>
    </div>
  );
};
