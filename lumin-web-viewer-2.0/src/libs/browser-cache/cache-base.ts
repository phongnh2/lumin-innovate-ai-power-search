import { IndexedDBAdapter } from './adapters/indexed-db-adapter';
import { LocalStorageAdapter } from './adapters/local-storage-adapter';
import { MemoryAdapter } from './adapters/memory-adapter';
import { SessionStorageAdapter } from './adapters/session-storage-adapter';
import { CacheItem, StorageAdapter } from './cache-base.interface';

export class CacheBase {
  private adapter: StorageAdapter;

  private defaultTTL: number | null;

  constructor(adapter: StorageAdapter, defaultTTL: number | null = 60 * 60 * 1000) {
    this.adapter = adapter;
    this.defaultTTL = defaultTTL;
  }

  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = await this.adapter.get<T>(key);

    if (!item) return null;

    if (item.expiry !== null && item.expiry < Date.now()) {
      await this.remove(key);
      return null;
    }

    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number | null): Promise<void> {
    const effectiveTTL = ttl === undefined ? this.defaultTTL : ttl;

    const item: CacheItem<T> = {
      value,
      expiry: effectiveTTL === null ? null : Date.now() + effectiveTTL,
      createdAt: Date.now(),
    };

    return this.adapter.set(key, item);
  }

  async remove(key: string): Promise<void> {
    return this.adapter.remove(key);
  }

  async clear(): Promise<void> {
    return this.adapter.clear();
  }

  async keys(): Promise<string[]> {
    return this.adapter.keys();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async getAll<T = any>(): Promise<Map<string, T>> {
    const keys = await this.keys();
    const result = new Map<string, T>();

    const values = await Promise.all(keys.map((key) => this.get<T>(key)));

    keys.forEach((key, index) => {
      const value = values[index];
      if (value !== null) {
        result.set(key, value);
      }
    });

    return result;
  }

  async getMany<T = any>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    const values = await Promise.all(keys.map((key) => this.get<T>(key)));

    keys.forEach((key, index) => {
      const value = values[index];
      if (value !== null) {
        result.set(key, value);
      }
    });

    return result;
  }

  async setMany<T = any>(items: Map<string, T> | Record<string, T>, ttl?: number | null): Promise<void> {
    const entries = items instanceof Map ? Array.from(items.entries()) : Object.entries(items);

    await Promise.all(entries.map(([key, value]) => this.set(key, value, ttl)));
  }

  async removeMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.remove(key)));
  }

  async cleanup(): Promise<number> {
    const keys = await this.keys();
    let removedCount = 0;

    const items = await Promise.all(keys.map((key) => this.adapter.get(key)));

    await Promise.all(
      items.map(async (item, index) => {
        const key = keys[index];
        if (item && item.expiry !== null && item.expiry < Date.now()) {
          await this.remove(key);
          removedCount++;
        }
      })
    );

    return removedCount;
  }
}

export function createLocalStorageCache(
  options: {
    prefix?: string;
    defaultTTL?: number | null;
  } = {}
): CacheBase {
  const { prefix = 'cache_', defaultTTL = 60 * 60 * 1000 } = options;

  return new CacheBase(new LocalStorageAdapter(prefix), defaultTTL);
}

export function createSessionStorageCache(
  options: {
    prefix?: string;
    defaultTTL?: number | null;
  } = {}
): CacheBase {
  const { prefix = 'cache_', defaultTTL = 60 * 60 * 1000 } = options;

  return new CacheBase(new SessionStorageAdapter(prefix), defaultTTL);
}

export function createMemoryCache(
  options: {
    defaultTTL?: number | null;
  } = {}
): CacheBase {
  const { defaultTTL = 60 * 60 * 1000 } = options;

  return new CacheBase(new MemoryAdapter(), defaultTTL);
}

export async function createIndexedDBCache(
  options: {
    dbName?: string;
    storeName?: string;
    defaultTTL?: number | null;
  } = {}
): Promise<CacheBase> {
  const { dbName = 'cachebase', storeName = 'cache_store', defaultTTL = 60 * 60 * 1000 } = options;

  const adapter = new IndexedDBAdapter(dbName, storeName);

  await adapter.openDatabase();

  return new CacheBase(adapter, defaultTTL);
}
