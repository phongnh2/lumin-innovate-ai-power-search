export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';

export interface StorageAdapter {
  get<T>(key: string): Promise<CacheItem<T> | null>;
  set<T>(key: string, item: CacheItem<T>): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface CacheItem<T> {
  value: T;
  expiry: number | null;
  createdAt: number;
}
