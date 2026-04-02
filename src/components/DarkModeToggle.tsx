import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

/**
 * Dark mode toggle button. Reads/writes via ThemeProvider context.
 */
export default function DarkModeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
        bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200
        transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
