import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getEffectiveTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
  if (themeMode === 'dark') {
    return 'dark';
  } else if (themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const applyThemeToDOM = (effectiveTheme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'light';
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    const mode = storedMode || 'light';
    return getEffectiveTheme(mode);
  });

  // Update theme when themeMode changes
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(themeMode);
    setThemeState(effectiveTheme);
    applyThemeToDOM(effectiveTheme);
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      applyThemeToDOM(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setTheme = useCallback((newThemeMode: ThemeMode) => {
    setThemeModeState(newThemeMode);
    localStorage.setItem('theme-mode', newThemeMode);
  }, []);

  const toggleTheme = useCallback(() => {
    // Toggle based on the currently displayed theme, not localStorage
    setThemeModeState((currentMode) => {
      const currentEffective = getEffectiveTheme(currentMode);
      const newMode: ThemeMode = currentEffective === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
