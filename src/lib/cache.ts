/**
 * Centralized cache utility for reducing redundant API calls.
 * Uses sessionStorage for cross-component persistence within a session.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  // Check memory cache first
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
    return memEntry.data;
  }

  // Check sessionStorage
  try {
    const stored = sessionStorage.getItem(`cache:${key}`);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp < entry.ttl) {
        memoryCache.set(key, entry);
        return entry.data;
      }
      sessionStorage.removeItem(`cache:${key}`);
    }
  } catch {
    // sessionStorage unavailable
  }

  return null;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 60_000): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function invalidateCache(keyPrefix: string): void {
  // Memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) memoryCache.delete(key);
  }

  // Session storage
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(`cache:${keyPrefix}`)) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
