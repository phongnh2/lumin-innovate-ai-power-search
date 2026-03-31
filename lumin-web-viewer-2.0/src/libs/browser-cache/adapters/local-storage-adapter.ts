import { StorageAdapter, CacheItem } from '../cache-base.interface';

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'cache_') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const data = localStorage.getItem(this.prefix + key);
    if (!data) return null;

    try {
      return await Promise.resolve(JSON.parse(data) as CacheItem<T>);
    } catch (e) {
      return null;
    }
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    await Promise.resolve(localStorage.setItem(this.prefix + key, JSON.stringify(item)));
  }

  async remove(key: string): Promise<void> {
    await Promise.resolve(localStorage.removeItem(this.prefix + key));
  }

  async clear(): Promise<void> {
    const allKeys = await this.keys();
    await Promise.all(allKeys.map((key) => Promise.resolve(localStorage.removeItem(this.prefix + key))));
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return Promise.resolve(keys);
  }
}
