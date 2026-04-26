import React, { useState, useCallback } from 'react';
import { Search, X, Loader, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { User } from '../types';

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  onSelectUser,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, isSearchingState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      isSearchingState(true);
      setError(null);

      const results = await api.searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Search failed';
      setError(errorMsg);
      console.error('User search error:', err);
    } finally {
      isSearchingState(false);
    }
  }, []);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
    addToast(`Starting chat with ${user.name}`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        } rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`${
            theme === 'light'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700'
              : 'bg-gradient-to-r from-purple-700 to-purple-900'
          } px-6 py-4 flex items-center justify-between`}
        >
          <h2 className="text-white font-semibold">Start a Chat</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'} p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors`}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div
          className={`max-h-96 overflow-y-auto ${
            theme === 'light' ? 'bg-white' : 'bg-gray-900'
          }`}
        >
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-purple-600" />
            </div>
          )}

          {error && (
            <div
              className={`m-4 p-4 rounded-lg flex items-gap-2 border ${
                theme === 'light'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  theme === 'light' ? 'text-red-600' : 'text-red-400'
                }`}
              />
              <p
                className={`ml-2 text-sm ${
                  theme === 'light' ? 'text-red-700' : 'text-red-300'
                }`}
              >
                {error}
              </p>
            </div>
          )}

          {!isSearching && !error && searchResults.length === 0 && searchQuery && (
            <div className={`text-center py-8 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-sm">No users found matching "{searchQuery}"</p>
            </div>
          )}

          {!isSearching && !error && searchResults.length === 0 && !searchQuery && (
            <div className={`text-center py-8 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-sm">Search for users to start a chat</p>
            </div>
          )}

          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`w-full px-4 py-3 flex items-center gap-3 border-b transition-colors ${
                theme === 'light'
                  ? 'border-gray-100 hover:bg-gray-50'
                  : 'border-gray-800 hover:bg-gray-800'
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {user.name}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
