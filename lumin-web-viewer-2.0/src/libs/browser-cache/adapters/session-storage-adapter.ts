import { StorageAdapter, CacheItem } from '../cache-base.interface';

export class SessionStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'cache_') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const data = sessionStorage.getItem(this.prefix + key);
    if (!data) return null;

    try {
      return await Promise.resolve(JSON.parse(data) as CacheItem<T>);
    } catch (e) {
      return null;
    }
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    await Promise.resolve(sessionStorage.setItem(this.prefix + key, JSON.stringify(item)));
  }

  async remove(key: string): Promise<void> {
    await Promise.resolve(sessionStorage.removeItem(this.prefix + key));
  }

  async clear(): Promise<void> {
    const allKeys = await this.keys();
    await Promise.all(allKeys.map((key) => Promise.resolve(sessionStorage.removeItem(this.prefix + key))));
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return Promise.resolve(keys);
  }
}
