import { CacheBase, createLocalStorageCache, createMemoryCache, createSessionStorageCache, createIndexedDBCache } from '../cache-base';
import { MemoryAdapter } from '../adapters/memory-adapter';
import { LocalStorageAdapter } from '../adapters/local-storage-adapter';
import { SessionStorageAdapter } from '../adapters/session-storage-adapter';
import { IndexedDBAdapter } from '../adapters/indexed-db-adapter';
import { CacheItem, StorageAdapter } from '../cache-base.interface';

jest.mock('../adapters/local-storage-adapter');
jest.mock('../adapters/session-storage-adapter');
jest.mock('../adapters/indexed-db-adapter');
jest.mock('../adapters/memory-adapter');

describe('CacheBase', () => {
  let cache: CacheBase;
  let mockAdapter: jest.Mocked<StorageAdapter>;

  beforeEach(() => {
    mockAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
    };

    cache = new CacheBase(mockAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null if item does not exist', async () => {
      mockAdapter.get.mockResolvedValue(null);
      
      const result = await cache.get('nonexistent');
      
      expect(result).toBeNull();
      expect(mockAdapter.get).toHaveBeenCalledWith('nonexistent');
    });

    it('should return value if item exists and is not expired', async () => {
      const mockItem: CacheItem<string> = {
        value: 'test-value',
        expiry: Date.now() + 1000,
        createdAt: Date.now(),
      };
      
      mockAdapter.get.mockResolvedValue(mockItem);
      
      const result = await cache.get<string>('test-key');
      
      expect(result).toBe('test-value');
      expect(mockAdapter.get).toHaveBeenCalledWith('test-key');
    });

    it('should remove and return null if item is expired', async () => {
      const mockItem: CacheItem<string> = {
        value: 'expired-value',
        expiry: Date.now() - 1000, // Expired
        createdAt: Date.now() - 2000,
      };
      
      mockAdapter.get.mockResolvedValue(mockItem);
      mockAdapter.remove.mockResolvedValue();
      
      const result = await cache.get<string>('expired-key');
      
      expect(result).toBeNull();
      expect(mockAdapter.get).toHaveBeenCalledWith('expired-key');
      expect(mockAdapter.remove).toHaveBeenCalledWith('expired-key');
    });

    it('should handle items with null expiry', async () => {
      const mockItem: CacheItem<string> = {
        value: 'never-expires',
        expiry: null,
        createdAt: Date.now() - 10000,
      };
      
      mockAdapter.get.mockResolvedValue(mockItem);
      
      const result = await cache.get<string>('permanent-key');
      
      expect(result).toBe('never-expires');
      expect(mockAdapter.get).toHaveBeenCalledWith('permanent-key');
      expect(mockAdapter.remove).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set item with default TTL', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      await cache.set('test-key', 'test-value');
      
      expect(mockAdapter.set).toHaveBeenCalledWith('test-key', {
        value: 'test-value',
        expiry: now + 60 * 60 * 1000, // Default TTL
        createdAt: now,
      });
    });

    it('should set item with custom TTL', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      await cache.set('test-key', 'test-value', 5000);
      
      expect(mockAdapter.set).toHaveBeenCalledWith('test-key', {
        value: 'test-value',
        expiry: now + 5000,
        createdAt: now,
      });
    });

    it('should set item with null TTL (never expires)', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      await cache.set('test-key', 'test-value', null);
      
      expect(mockAdapter.set).toHaveBeenCalledWith('test-key', {
        value: 'test-value',
        expiry: null,
        createdAt: now,
      });
    });
  });

  describe('remove', () => {
    it('should call adapter remove method', async () => {
      mockAdapter.remove.mockResolvedValue();
      
      await cache.remove('test-key');
      
      expect(mockAdapter.remove).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should call adapter clear method', async () => {
      mockAdapter.clear.mockResolvedValue();
      
      await cache.clear();
      
      expect(mockAdapter.clear).toHaveBeenCalled();
    });
  });

  describe('keys', () => {
    it('should return keys from adapter', async () => {
      mockAdapter.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      
      const result = await cache.keys();
      
      expect(result).toEqual(['key1', 'key2', 'key3']);
      expect(mockAdapter.keys).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should return true if key exists', async () => {
      const mockItem: CacheItem<string> = {
        value: 'test-value',
        expiry: Date.now() + 1000,
        createdAt: Date.now(),
      };
      
      mockAdapter.get.mockResolvedValue(mockItem);
      
      const result = await cache.has('test-key');
      
      expect(result).toBe(true);
      expect(mockAdapter.get).toHaveBeenCalledWith('test-key');
    });

    it('should return false if key does not exist', async () => {
      mockAdapter.get.mockResolvedValue(null);
      
      const result = await cache.has('nonexistent');
      
      expect(result).toBe(false);
      expect(mockAdapter.get).toHaveBeenCalledWith('nonexistent');
    });

    it('should return false if item is expired', async () => {
      const mockItem: CacheItem<string> = {
        value: 'expired-value',
        expiry: Date.now() - 1000, // Expired
        createdAt: Date.now() - 2000,
      };
      
      mockAdapter.get.mockResolvedValue(mockItem);
      mockAdapter.remove.mockResolvedValue();
      
      const result = await cache.has('expired-key');
      
      expect(result).toBe(false);
      expect(mockAdapter.get).toHaveBeenCalledWith('expired-key');
      expect(mockAdapter.remove).toHaveBeenCalledWith('expired-key');
    });
  });

  describe('getAll', () => {
    it('should return all non-expired values', async () => {
      mockAdapter.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      
      const mockImplementation = (key: string) => {
        if (key === 'key1') {
          return Promise.resolve({
            value: 'value1',
            expiry: Date.now() + 1000,
            createdAt: Date.now(),
          });
        } else if (key === 'key2') {
          return Promise.resolve({
            value: 'value2',
            expiry: Date.now() - 1000, // Expired
            createdAt: Date.now() - 2000,
          });
        } else if (key === 'key3') {
          return Promise.resolve({
            value: 'value3',
            expiry: null,
            createdAt: Date.now(),
          });
        }
        return Promise.resolve(null);
      };
      
      mockAdapter.get.mockImplementation(mockImplementation);
      mockAdapter.remove.mockResolvedValue();
      
      const result = await cache.getAll<string>();
      
      expect(result.size).toBe(2);
      expect(result.get('key1')).toBe('value1');
      expect(result.has('key2')).toBe(false); // Expired, should be removed
      expect(result.get('key3')).toBe('value3');
      
      expect(mockAdapter.remove).toHaveBeenCalledWith('key2');
    });
  });

  describe('getMany', () => {
    it('should return requested non-expired values', async () => {
      // Mock get for each key
      const mockImplementation = (key: string) => {
        if (key === 'key1') {
          return Promise.resolve({
            value: 'value1',
            expiry: Date.now() + 1000,
            createdAt: Date.now(),
          });
        } else if (key === 'key2') {
          return Promise.resolve({
            value: 'value2',
            expiry: Date.now() - 1000, // Expired
            createdAt: Date.now() - 2000,
          });
        } else if (key === 'key3') {
          return Promise.resolve({
            value: 'value3',
            expiry: null,
            createdAt: Date.now(),
          });
        }
        return Promise.resolve(null);
      };
      
      mockAdapter.get.mockImplementation(mockImplementation);
      mockAdapter.remove.mockResolvedValue();
      
      const result = await cache.getMany<string>(['key1', 'key2', 'key3', 'key4']);
      
      expect(result.size).toBe(2);
      expect(result.get('key1')).toBe('value1');
      expect(result.has('key2')).toBe(false); // Expired, should be removed
      expect(result.get('key3')).toBe('value3');
      expect(result.has('key4')).toBe(false); // Doesn't exist
      
      expect(mockAdapter.remove).toHaveBeenCalledWith('key2');
    });
  });

  describe('setMany', () => {
    it('should set multiple items with Map input', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const items = new Map<string, string>();
      items.set('key1', 'value1');
      items.set('key2', 'value2');
      
      await cache.setMany(items);
      
      expect(mockAdapter.set).toHaveBeenCalledTimes(2);
      expect(mockAdapter.set).toHaveBeenCalledWith('key1', {
        value: 'value1',
        expiry: now + 60 * 60 * 1000,
        createdAt: now,
      });
      expect(mockAdapter.set).toHaveBeenCalledWith('key2', {
        value: 'value2',
        expiry: now + 60 * 60 * 1000,
        createdAt: now,
      });
    });

    it('should set multiple items with Record input', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const items = {
        key1: 'value1',
        key2: 'value2',
      };
      
      await cache.setMany(items, 5000);
      
      expect(mockAdapter.set).toHaveBeenCalledTimes(2);
      expect(mockAdapter.set).toHaveBeenCalledWith('key1', {
        value: 'value1',
        expiry: now + 5000,
        createdAt: now,
      });
      expect(mockAdapter.set).toHaveBeenCalledWith('key2', {
        value: 'value2',
        expiry: now + 5000,
        createdAt: now,
      });
    });
  });

  describe('removeMany', () => {
    it('should remove multiple keys', async () => {
      mockAdapter.remove.mockResolvedValue();
      
      await cache.removeMany(['key1', 'key2', 'key3']);
      
      expect(mockAdapter.remove).toHaveBeenCalledTimes(3);
      expect(mockAdapter.remove).toHaveBeenCalledWith('key1');
      expect(mockAdapter.remove).toHaveBeenCalledWith('key2');
      expect(mockAdapter.remove).toHaveBeenCalledWith('key3');
    });
  });

  describe('cleanup', () => {
    it('should remove expired items and return count', async () => {
      mockAdapter.keys.mockResolvedValue(['key1', 'key2', 'key3', 'key4']);
      
      // Mock adapter.get for each key
      mockAdapter.get.mockImplementation((key: string) => {
        if (key === 'key1') {
          return Promise.resolve({
            value: 'value1',
            expiry: Date.now() + 1000, // Not expired
            createdAt: Date.now() - 1000,
          });
        } else if (key === 'key2') {
          return Promise.resolve({
            value: 'value2',
            expiry: Date.now() - 1000, // Expired
            createdAt: Date.now() - 2000,
          });
        } else if (key === 'key3') {
          return Promise.resolve({
            value: 'value3',
            expiry: null, // Never expires
            createdAt: Date.now() - 3000,
          });
        } else if (key === 'key4') {
          return Promise.resolve({
            value: 'value4',
            expiry: Date.now() - 2000, // Expired
            createdAt: Date.now() - 3000,
          });
        }
        return Promise.resolve(null);
      });
      
      mockAdapter.remove.mockResolvedValue();
      
      const removedCount = await cache.cleanup();
      
      expect(removedCount).toBe(2);
      expect(mockAdapter.remove).toHaveBeenCalledTimes(2);
      expect(mockAdapter.remove).toHaveBeenCalledWith('key2');
      expect(mockAdapter.remove).toHaveBeenCalledWith('key4');
    });
  });

  describe('setAdapter', () => {
    it('should change the adapter', async () => {
      const newMockAdapter: jest.Mocked<StorageAdapter> = {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        keys: jest.fn(),
      };
      
      newMockAdapter.get.mockResolvedValue({
        value: 'new-adapter-value',
        expiry: null,
        createdAt: Date.now(),
      });
      
      cache.setAdapter(newMockAdapter);
      
      const result = await cache.get<string>('test-key');
      
      expect(result).toBe('new-adapter-value');
      expect(newMockAdapter.get).toHaveBeenCalledWith('test-key');
      expect(mockAdapter.get).not.toHaveBeenCalled();
    });
  });
});

describe('Factory functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLocalStorageCache', () => {
    it('should create cache with LocalStorageAdapter', () => {
      (LocalStorageAdapter as jest.Mock).mockClear();
      
      const cache = createLocalStorageCache();
      
      expect(LocalStorageAdapter).toHaveBeenCalledWith('cache_');
      expect(cache).toBeInstanceOf(CacheBase);
    });

    it('should use custom prefix and TTL', () => {
      (LocalStorageAdapter as jest.Mock).mockClear();
      
      const cache = createLocalStorageCache({
        prefix: 'custom_',
        defaultTTL: 30000,
      });
      
      expect(LocalStorageAdapter).toHaveBeenCalledWith('custom_');
      expect(cache).toBeInstanceOf(CacheBase);
    });
  });

  describe('createSessionStorageCache', () => {
    it('should create cache with SessionStorageAdapter', () => {
      (SessionStorageAdapter as jest.Mock).mockClear();
      
      const cache = createSessionStorageCache();
      
      expect(SessionStorageAdapter).toHaveBeenCalledWith('cache_');
      expect(cache).toBeInstanceOf(CacheBase);
    });
  });

  describe('createMemoryCache', () => {
    it('should create cache with MemoryAdapter', () => {
      (MemoryAdapter as jest.Mock).mockClear();
      
      const cache = createMemoryCache();
      
      expect(MemoryAdapter).toHaveBeenCalled();
      expect(cache).toBeInstanceOf(CacheBase);
    });
  });

  describe('createIndexedDBCache', () => {
    it('should create cache with IndexedDBAdapter', async () => {
      (IndexedDBAdapter as jest.Mock).mockClear();
      const mockAdapter = {
        openDatabase: jest.fn().mockResolvedValue(undefined),
      };
      (IndexedDBAdapter as jest.Mock).mockImplementation(() => mockAdapter);
      
      const cache = await createIndexedDBCache();
      
      expect(IndexedDBAdapter).toHaveBeenCalledWith('cachebase', 'cache_store');
      expect(mockAdapter.openDatabase).toHaveBeenCalled();
      expect(cache).toBeInstanceOf(CacheBase);
    });

    it('should use custom options', async () => {
      (IndexedDBAdapter as jest.Mock).mockClear();
      const mockAdapter = {
        openDatabase: jest.fn().mockResolvedValue(undefined),
      };
      (IndexedDBAdapter as jest.Mock).mockImplementation(() => mockAdapter);
      
      const cache = await createIndexedDBCache({
        dbName: 'custom_db',
        storeName: 'custom_store',
        defaultTTL: 10000,
      });
      
      expect(IndexedDBAdapter).toHaveBeenCalledWith('custom_db', 'custom_store');
      expect(mockAdapter.openDatabase).toHaveBeenCalled();
      expect(cache).toBeInstanceOf(CacheBase);
    });
  });
}); 