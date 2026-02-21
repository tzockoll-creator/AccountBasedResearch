import { useState, useCallback } from 'react';

const STORAGE_KEY = 'warmlead-ai-history';
const MAX_ENTRIES = 10;

function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Hook for managing research history in localStorage
 *
 * Each entry: { companyName, timestamp, leadCount, topLeadName, topLeadTitle, productName }
 */
export function useResearchHistory() {
  const [history, setHistory] = useState(loadHistory);

  const addEntry = useCallback((entry) => {
    setHistory(prev => {
      // Remove existing entry for same company if present
      const filtered = prev.filter(
        e => e.companyName.toLowerCase() !== entry.companyName.toLowerCase()
      );
      const updated = [
        {
          companyName: entry.companyName,
          timestamp: Date.now(),
          leadCount: entry.leadCount || 0,
          topLeadName: entry.topLeadName || null,
          topLeadTitle: entry.topLeadTitle || null,
          productName: entry.productName || ''
        },
        ...filtered
      ].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, clearHistory };
}
