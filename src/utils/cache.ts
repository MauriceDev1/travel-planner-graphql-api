interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    const maxAge = ttl || this.defaultTTL;
    const isExpired = Date.now() - entry.timestamp > maxAge;

    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new Cache();

// Run cleanup every 10 minutes
setInterval(() => cache.cleanup(), 600000);

export default cache;