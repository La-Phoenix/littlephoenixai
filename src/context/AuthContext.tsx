import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { User, AuthResponse, APIError } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Checking authentication with /api/auth/me');
      const response: AuthResponse = await api.checkAuth();
      console.log('Auth check successful:', response);
      console.log('Setting user:', response.user);
      console.log('Setting isAuthenticated to:', response.isAuthenticated);
      setUser(response.user);
      setIsAuthenticated(response.isAuthenticated);
      console.log('State updated.');
    } catch (err) {
      const apiError = err as APIError;
      console.log('Auth check failed:', apiError);
      console.error('Full error object:', err);
      setIsAuthenticated(false);
      setUser(null);
      
      // 401 is expected when not logged in - don't set error for it
      if (apiError.statusCode === 401) {
        console.log('User is not authenticated (401)');
      } else {
        // Other errors should be displayed
        setError(apiError.message || 'Authentication check failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      setError(null);
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
