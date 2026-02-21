import React from 'react';
import { Search, TrendingUp, Loader2, X } from 'lucide-react';

export default function CompanySearch({
  companyInput,
  onCompanyInputChange,
  onSearch,
  onAbort,
  isLoading,
  disabled
}) {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={companyInput}
          onChange={e => onCompanyInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isLoading && onSearch()}
          placeholder="Enter company name (e.g., Dell, Vizient, HEB, E2Open)"
          className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
        />
      </div>
      {isLoading ? (
        <button
          onClick={onAbort}
          className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      ) : (
        <button
          onClick={onSearch}
          disabled={disabled || !companyInput.trim()}
          className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-medium text-sm hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          Research
        </button>
      )}
    </div>
  );
}
