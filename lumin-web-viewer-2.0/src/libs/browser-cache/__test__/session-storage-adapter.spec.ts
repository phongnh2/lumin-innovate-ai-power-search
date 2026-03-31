import { SessionStorageAdapter } from '../adapters/session-storage-adapter';
import { CacheItem } from '../cache-base.interface';

describe('SessionStorageAdapter', () => {
  let sessionStorageAdapter: SessionStorageAdapter;
  const defaultPrefix = 'cache_';
  const customPrefix = 'test_prefix_';
  
  beforeEach(() => {
    window.sessionStorage.clear();
    sessionStorageAdapter = new SessionStorageAdapter();
  });
  
  afterEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });
  
  describe('constructor', () => {
    it('should use default prefix when not provided', () => {
      const adapter = new SessionStorageAdapter();
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      adapter.set('testKey', testItem);
      
      expect(sessionStorage.getItem(`${defaultPrefix}testKey`)).not.toBeNull();
    });
    
    it('should use custom prefix when provided', () => {
      const adapter = new SessionStorageAdapter(customPrefix);
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      adapter.set('testKey', testItem);
      
      expect(sessionStorage.getItem(`${customPrefix}testKey`)).not.toBeNull();
    });
  });
  
  describe('get', () => {
    it('should retrieve a stored value from sessionStorage', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      sessionStorage.setItem(`${defaultPrefix}${key}`, JSON.stringify(testItem));
      
      const retrievedValue = await sessionStorageAdapter.get<{ name: string }>(key);
      expect(retrievedValue).toEqual(testItem);
    });
    
    it('should return null for non-existent keys', async () => {
      const retrievedValue = await sessionStorageAdapter.get('nonExistentKey');
      expect(retrievedValue).toBeNull();
    });
    
    it('should return null when JSON parse fails', async () => {
      sessionStorage.setItem(`${defaultPrefix}invalidJson`, '{invalid json}');
      
      const result = await sessionStorageAdapter.get('invalidJson');
      expect(result).toBeNull();
    });
    
    it('should handle sessionStorage errors', async () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('sessionStorage is not available');
      });
      
      await expect(sessionStorageAdapter.get('key')).rejects.toThrow();
      
      getItemSpy.mockRestore();
    });
  });
  
  describe('set', () => {
    it('should store a value in sessionStorage with correct prefix', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      await sessionStorageAdapter.set(key, testItem);
      
      const storedValue = JSON.parse(sessionStorage.getItem(`${defaultPrefix}${key}`) || '');
      expect(storedValue).toEqual(testItem);
    });
    
    it('should handle primitive values', async () => {
      const stringItem: CacheItem<string> = { value: 'test string', expiry: Date.now() + 1000, createdAt: Date.now() };
      const numberItem: CacheItem<number> = { value: 42, expiry: Date.now() + 1000, createdAt: Date.now() };
      const booleanItem: CacheItem<boolean> = { value: true, expiry: Date.now() + 1000, createdAt: Date.now() };
      
      await sessionStorageAdapter.set('stringKey', stringItem);
      await sessionStorageAdapter.set('numberKey', numberItem);
      await sessionStorageAdapter.set('booleanKey', booleanItem);
      
      expect(JSON.parse(sessionStorage.getItem(`${defaultPrefix}stringKey`) || '')).toEqual(stringItem);
      expect(JSON.parse(sessionStorage.getItem(`${defaultPrefix}numberKey`) || '')).toEqual(numberItem);
      expect(JSON.parse(sessionStorage.getItem(`${defaultPrefix}booleanKey`) || '')).toEqual(booleanItem);
    });
    
    it('should handle sessionStorage errors', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('sessionStorage is not available');
      });
      
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      await expect(sessionStorageAdapter.set('key', testItem)).rejects.toThrow();
      
      setItemSpy.mockRestore();
    });
  });
  
  describe('remove', () => {
    it('should remove an item from sessionStorage', async () => {
      const key = 'testKey';
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      sessionStorage.setItem(`${defaultPrefix}${key}`, JSON.stringify(testItem));
      
      await sessionStorageAdapter.remove(key);
      
      expect(sessionStorage.getItem(`${defaultPrefix}${key}`)).toBeNull();
    });
    
    it('should not throw when removing non-existent keys', async () => {
      await expect(sessionStorageAdapter.remove('nonExistentKey')).resolves.not.toThrow();
    });
    
    it('should handle sessionStorage errors', async () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('sessionStorage is not available');
      });
      
      await expect(sessionStorageAdapter.remove('key')).rejects.toThrow();
      
      removeItemSpy.mockRestore();
    });
  });
  
  describe('clear', () => {
    it('should clear all items with the adapter prefix', async () => {
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      sessionStorage.setItem(`${defaultPrefix}key1`, JSON.stringify(testItem));
      sessionStorage.setItem(`${defaultPrefix}key2`, JSON.stringify(testItem));
      
      sessionStorage.setItem('other_key', JSON.stringify(testItem));
      
      await sessionStorageAdapter.clear();
      
      expect(sessionStorage.getItem(`${defaultPrefix}key1`)).toBeNull();
      expect(sessionStorage.getItem(`${defaultPrefix}key2`)).toBeNull();
      
      expect(sessionStorage.getItem('other_key')).not.toBeNull();
    });
    
    it('should handle sessionStorage errors', async () => {
      const keySpy = jest.spyOn(Storage.prototype, 'key').mockImplementation(() => {
        throw new Error('sessionStorage is not available');
      });
      
      await expect(sessionStorageAdapter.clear()).resolves.not.toThrow();
      
      keySpy.mockRestore();
    });
  });
  
  describe('keys', () => {
    it('should return all keys with the adapter prefix', async () => {
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      sessionStorage.setItem(`${defaultPrefix}key1`, JSON.stringify(testItem));
      sessionStorage.setItem(`${defaultPrefix}key2`, JSON.stringify(testItem));
      
      sessionStorage.setItem('other_key', JSON.stringify(testItem));
      
      const keys = await sessionStorageAdapter.keys();
      
      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).not.toContain('other_key');
    });
    
    it('should return an empty array when no keys match', async () => {
      sessionStorage.setItem('other_key', 'value');
      
      const keys = await sessionStorageAdapter.keys();
      
      expect(keys).toHaveLength(0);
    });
    
    it('should handle sessionStorage errors', async () => {
      const keySpy = jest.spyOn(Storage.prototype, 'key').mockImplementation(() => {
        throw new Error('sessionStorage is not available');
      });
      
      await expect(sessionStorageAdapter.keys()).resolves.toEqual([]);
      
      keySpy.mockRestore();
    });
  });
}); 