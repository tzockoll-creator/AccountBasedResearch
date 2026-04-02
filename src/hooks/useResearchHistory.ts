import { useState, useCallback } from 'react';
import { STORAGE_KEYS, HISTORY_CONFIG } from '../config/appConfig';
import type { HistoryEntry } from '../types';

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.history);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Hook for managing research history in localStorage.
 */
export function useResearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
    setHistory(prev => {
      const filtered = prev.filter(
        e => e.companyName.toLowerCase() !== entry.companyName.toLowerCase()
      );
      const updated: HistoryEntry[] = [
        {
          companyName: entry.companyName,
          timestamp: Date.now(),
          leadCount: entry.leadCount || 0,
          topLeadName: entry.topLeadName || null,
          topLeadTitle: entry.topLeadTitle || null,
          productName: entry.productName || ''
        },
        ...filtered
      ].slice(0, HISTORY_CONFIG.maxEntries);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.history);
  }, []);

  return { history, addEntry, clearHistory };
}
