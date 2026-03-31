import { StorageAdapter, CacheItem } from '../cache-base.interface';

export class MemoryAdapter implements StorageAdapter {
  private storage: Map<string, any> = new Map();

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const item = this.storage.get(key) as CacheItem<T> | undefined;
    return Promise.resolve(item);
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    this.storage.set(key, item);
    return Promise.resolve();
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  async clear(): Promise<void> {
    await Promise.resolve(this.storage.clear());
  }

  async keys(): Promise<string[]> {
    return Promise.resolve(Array.from(this.storage.keys()));
  }
}
