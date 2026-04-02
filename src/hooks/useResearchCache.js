import { useRef, useCallback } from 'react';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * In-memory cache for API responses keyed by company name.
 * Entries expire after 30 minutes.
 */
export function useResearchCache() {
  const cacheRef = useRef(new Map());

  const get = useCallback((companyName) => {
    const key = companyName.trim().toLowerCase();
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cacheRef.current.delete(key);
      return null;
    }
    return entry.data;
  }, []);

  const set = useCallback((companyName, data) => {
    const key = companyName.trim().toLowerCase();
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((companyName) => {
    const key = companyName.trim().toLowerCase();
    cacheRef.current.delete(key);
  }, []);

  const has = useCallback((companyName) => {
    const key = companyName.trim().toLowerCase();
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cacheRef.current.delete(key);
      return false;
    }
    return true;
  }, []);

  return { get, set, invalidate, has };
}
