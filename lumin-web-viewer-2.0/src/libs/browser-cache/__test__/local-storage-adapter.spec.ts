import { LocalStorageAdapter } from '../adapters/local-storage-adapter';
import { CacheItem } from '../cache-base.interface';

describe('LocalStorageAdapter', () => {
  let localStorageAdapter: LocalStorageAdapter;
  const defaultPrefix = 'cache_';
  const customPrefix = 'test_prefix_';
  
  beforeEach(() => {
    window.localStorage.clear();
    localStorageAdapter = new LocalStorageAdapter();
  });
  
  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });
  
  describe('constructor', () => {
    it('should use default prefix when not provided', () => {
      const adapter = new LocalStorageAdapter();
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      adapter.set('testKey', testItem);
      
      expect(localStorage.getItem(`${defaultPrefix}testKey`)).not.toBeNull();
    });
    
    it('should use custom prefix when provided', () => {
      const adapter = new LocalStorageAdapter(customPrefix);
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      adapter.set('testKey', testItem);
      
      expect(localStorage.getItem(`${customPrefix}testKey`)).not.toBeNull();
    });
  });
  
  describe('get', () => {
    it('should retrieve a stored value from localStorage', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      localStorage.setItem(`${defaultPrefix}${key}`, JSON.stringify(testItem));
      
      const retrievedValue = await localStorageAdapter.get<{ name: string }>(key);
      expect(retrievedValue).toEqual(testItem);
    });
    
    it('should return null for non-existent keys', async () => {
      const retrievedValue = await localStorageAdapter.get('nonExistentKey');
      expect(retrievedValue).toBeNull();
    });
    
    it('should return null when JSON parse fails', async () => {
      localStorage.setItem(`${defaultPrefix}invalidJson`, '{invalid json}');
      
      const result = await localStorageAdapter.get('invalidJson');
      expect(result).toBeNull();
    });
    
    it('should handle localStorage errors', async () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      await expect(localStorageAdapter.get('key')).rejects.toThrow();
      
      getItemSpy.mockRestore();
    });
  });
  
  describe('set', () => {
    it('should store a value in localStorage with correct prefix', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      await localStorageAdapter.set(key, testItem);
      
      const storedValue = JSON.parse(localStorage.getItem(`${defaultPrefix}${key}`) || '');
      expect(storedValue).toEqual(testItem);
    });
    
    it('should handle primitive values', async () => {
      const stringItem: CacheItem<string> = { value: 'test string', expiry: Date.now() + 1000, createdAt: Date.now() };
      const numberItem: CacheItem<number> = { value: 42, expiry: Date.now() + 1000, createdAt: Date.now() };
      const booleanItem: CacheItem<boolean> = { value: true, expiry: Date.now() + 1000, createdAt: Date.now() };
      
      await localStorageAdapter.set('stringKey', stringItem);
      await localStorageAdapter.set('numberKey', numberItem);
      await localStorageAdapter.set('booleanKey', booleanItem);
      
      expect(JSON.parse(localStorage.getItem(`${defaultPrefix}stringKey`) || '')).toEqual(stringItem);
      expect(JSON.parse(localStorage.getItem(`${defaultPrefix}numberKey`) || '')).toEqual(numberItem);
      expect(JSON.parse(localStorage.getItem(`${defaultPrefix}booleanKey`) || '')).toEqual(booleanItem);
    });
    
    it('should handle localStorage errors', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      const testItem: CacheItem<string> = { value: 'test', expiry: Date.now() + 1000, createdAt: Date.now() };
      await expect(localStorageAdapter.set('key', testItem)).rejects.toThrow();
      
      setItemSpy.mockRestore();
    });
  });
  
  describe('remove', () => {
    it('should remove an item from localStorage', async () => {
      const key = 'testKey';
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      
      localStorage.setItem(`${defaultPrefix}${key}`, JSON.stringify(testItem));
      
      await localStorageAdapter.remove(key);
      
      expect(localStorage.getItem(`${defaultPrefix}${key}`)).toBeNull();
    });
    
    it('should not throw when removing non-existent keys', async () => {
      await expect(localStorageAdapter.remove('nonExistentKey')).resolves.not.toThrow();
    });
    
    it('should handle localStorage errors', async () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      await expect(localStorageAdapter.remove('key')).rejects.toThrow();
      
      removeItemSpy.mockRestore();
    });
  });
  
  describe('clear', () => {
    it('should clear all items with the adapter prefix', async () => {
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      localStorage.setItem(`${defaultPrefix}key1`, JSON.stringify(testItem));
      localStorage.setItem(`${defaultPrefix}key2`, JSON.stringify(testItem));
      
      localStorage.setItem('other_key', JSON.stringify(testItem));
      
      await localStorageAdapter.clear();
      
      expect(localStorage.getItem(`${defaultPrefix}key1`)).toBeNull();
      expect(localStorage.getItem(`${defaultPrefix}key2`)).toBeNull();
      
      expect(localStorage.getItem('other_key')).not.toBeNull();
    });
    
    it('should handle localStorage errors', async () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      await localStorageAdapter.clear();
      expect(removeItemSpy).toHaveBeenCalledTimes(0);
      removeItemSpy.mockRestore();
    });
  });
  
  describe('keys', () => {
    it('should return all keys with the adapter prefix', async () => {
      const testItem: CacheItem<string> = { value: 'test value', expiry: Date.now() + 1000, createdAt: Date.now() };
      localStorage.setItem(`${defaultPrefix}key1`, JSON.stringify(testItem));
      localStorage.setItem(`${defaultPrefix}key2`, JSON.stringify(testItem));
      
      localStorage.setItem('other_key', JSON.stringify(testItem));
      
      const keys = await localStorageAdapter.keys();
      
      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).not.toContain('other_key');
    });
    
    it('should return an empty array when no keys match', async () => {
      localStorage.setItem('other_key', 'value');
      
      const keys = await localStorageAdapter.keys();
      
      expect(keys).toHaveLength(0);
    });
    
    it('should handle localStorage errors', async () => {
      const keySpy = jest.spyOn(Storage.prototype, 'key').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      await expect(localStorageAdapter.keys()).resolves.toEqual([]);
      
      keySpy.mockRestore();
    });
  });
});
