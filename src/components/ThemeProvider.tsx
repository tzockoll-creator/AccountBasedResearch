import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../config/appConfig';

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: true, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

/**
 * Provides class-based dark mode toggle persisted to localStorage.
 * Adds/removes 'dark' class on <html> element for Tailwind dark: variants.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.darkMode);
      // Default to dark mode if no preference stored
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.darkMode, String(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
