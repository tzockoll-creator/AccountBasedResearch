import React, { useState, useMemo } from 'react';
import { Search, Trash2, Clock, X, AlertTriangle, Hash } from 'lucide-react';

/**
 * Research History sidebar panel.
 *
 * Shows saved research entries with search/filter, click-to-reload, and a
 * clear-all button with confirmation modal.
 *
 * @param {Object} props
 * @param {import('../types/index.js').ResearchHistoryEntry[]} props.history
 * @param {(entry: import('../types/index.js').ResearchHistoryEntry) => void} props.onSelect
 * @param {() => void} props.onClearAll
 * @param {string | null} props.activeId - ID of currently viewed entry
 */
export default function ResearchHistory({ history, onSelect, onClearAll, activeId }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return history;
    const q = filterQuery.trim().toLowerCase();
    return history.filter((e) => e.companyName.toLowerCase().includes(q));
  }, [history, filterQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">History</span>
          <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            title="Clear all history"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Search filter */}
      {history.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by company..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* History list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            {history.length === 0 ? (
              <>
                <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No research history yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  Completed research will appear here
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">No matches for "{filterQuery}"</p>
            )}
          </div>
        ) : (
          <ul className="py-1">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() => onSelect(entry)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    activeId === entry.id
                      ? 'bg-slate-700/60 border-l-2 border-red-500'
                      : 'hover:bg-slate-800/60 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {entry.companyName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1.5">
                    {formatDate(entry.dateTime)}
                  </p>
                  {entry.topThemes && entry.topThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.topThemes.slice(0, 3).map((theme, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400 truncate max-w-[120px]"
                        >
                          {theme.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Clear All History</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete all {history.length} saved research
              {history.length === 1 ? '' : ' entries'}? This will permanently remove all
              cached results.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearModal(false);
                  setFilterQuery('');
                }}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}
