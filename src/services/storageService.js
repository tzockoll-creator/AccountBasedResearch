/**
 * Storage Service
 *
 * Abstraction layer for persisting research history.
 * Currently backed by localStorage; structured for easy swap to Supabase or
 * any other backend by implementing the same interface.
 *
 * Interface:
 *   saveResearch(entry)      → void
 *   getHistory()             → ResearchHistoryEntry[]
 *   getById(id)              → ResearchHistoryEntry | null
 *   deleteById(id)           → void
 *   clearAll()               → void
 *   search(query)            → ResearchHistoryEntry[]
 */

/** @typedef {import('../types/index.js').ResearchHistoryEntry} ResearchHistoryEntry */

const STORAGE_KEY = 'account-research-history';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Public API (localStorage implementation) ───────────────────────────────

/**
 * Save a research result to history.
 * Deduplicates by company name — if a result for the same company already
 * exists, it is replaced with the new one (keeping the new ID & timestamp).
 *
 * @param {ResearchHistoryEntry} entry
 */
export function saveResearch(entry) {
  const entries = readStore();
  // Remove any existing entry for the same company (case-insensitive)
  const filtered = entries.filter(
    (e) => e.companyName.toLowerCase() !== entry.companyName.toLowerCase()
  );
  const toSave = {
    id: entry.id || generateId(),
    companyName: entry.companyName,
    dateTime: entry.dateTime || new Date().toISOString(),
    topThemes: entry.topThemes || [],
    fullResults: entry.fullResults || null,
    secData: entry.secData || null,
  };
  writeStore([toSave, ...filtered]);
}

/**
 * Get all saved research entries, sorted most-recent first.
 * @returns {ResearchHistoryEntry[]}
 */
export function getHistory() {
  return readStore().sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
}

/**
 * Get a single entry by ID.
 * @param {string} id
 * @returns {ResearchHistoryEntry | null}
 */
export function getById(id) {
  return readStore().find((e) => e.id === id) || null;
}

/**
 * Delete a single entry by ID.
 * @param {string} id
 */
export function deleteById(id) {
  writeStore(readStore().filter((e) => e.id !== id));
}

/**
 * Delete all history entries.
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/**
 * Search/filter history entries by company name (case-insensitive substring match).
 * @param {string} query
 * @returns {ResearchHistoryEntry[]}
 */
export function search(query) {
  if (!query || !query.trim()) return getHistory();
  const q = query.trim().toLowerCase();
  return getHistory().filter((e) => e.companyName.toLowerCase().includes(q));
}
