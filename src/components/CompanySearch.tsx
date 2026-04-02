import React, { useEffect, useRef } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';

interface CompanySearchProps {
  companyInput: string;
  onCompanyInputChange: (value: string) => void;
  onSearch: () => void;
  onAbort: () => void;
  isLoading: boolean;
  disabled: boolean;
  validationError?: string | null;
}

export default function CompanySearch({
  companyInput,
  onCompanyInputChange,
  onSearch,
  onAbort,
  isLoading,
  disabled,
  validationError
}: CompanySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    } else if (e.key === 'Escape') {
      onCompanyInputChange('');
      inputRef.current?.blur();
    }
  }

  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={companyInput}
          onChange={e => onCompanyInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter company name (e.g., Dell, Vizient, HEB, E2Open)"
          className={`w-full pl-12 pr-16 py-3.5 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 text-sm transition-colors ${
            validationError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 hidden sm:inline">
          {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}K
        </kbd>
        {validationError && (
          <p className="absolute -bottom-5 left-0 text-xs text-red-400">{validationError}</p>
        )}
      </div>
      {isLoading ? (
        <button
          onClick={onAbort}
          className="px-6 py-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      ) : (
        <button
          onClick={onSearch}
          disabled={disabled || !companyInput.trim()}
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          Research
        </button>
      )}
    </div>
  );
}
