import React from 'react';
import { Clock, Trash2, X, Building2 } from 'lucide-react';
import type { HistoryEntry } from '../types';

interface SidebarProps {
  history: HistoryEntry[];
  onHistoryClick: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Collapsible sidebar showing research history.
 * Slides in on mobile via hamburger, always visible on desktop.
 */
export default function Sidebar({
  history,
  onHistoryClick,
  onClearHistory,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-40
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-0 lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Research History</span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="overflow-y-auto h-[calc(100%-57px)]">
          {history.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Building2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No research yet</p>
              <p className="text-xs text-slate-700 mt-1">Results will appear here</p>
            </div>
          ) : (
            <ul className="py-1">
              {history.map((entry, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      onHistoryClick(entry);
                      onClose();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-100 dark:border-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {entry.companyName}
                      </span>
                      <span className="text-xs text-slate-600 shrink-0 ml-2">
                        {entry.leadCount} lead{entry.leadCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-600">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      {entry.productName && (
                        <span className="text-xs text-slate-700 truncate">
                          &#8226; {entry.productName}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
