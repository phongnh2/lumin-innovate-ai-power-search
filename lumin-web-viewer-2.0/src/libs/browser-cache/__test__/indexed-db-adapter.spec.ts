import { IndexedDBAdapter } from '../adapters/indexed-db-adapter';
import { CacheItem } from '../cache-base.interface';
import { INDEXED_DB_VERSION } from 'constants/indexedDbVersion';

describe('IndexedDBAdapter', () => {
  let indexedDBAdapter: IndexedDBAdapter;
  const defaultDbName = 'cachebase';
  const defaultStoreName = 'cache_store';
  const customDbName = 'test_db';
  const customStoreName = 'test_store';
  
  const mockDB = {
    objectStoreNames: {
      contains: jest.fn().mockReturnValue(false)
    },
    createObjectStore: jest.fn(),
    transaction: jest.fn(),
    close: jest.fn()
  };
  
  const mockObjectStore = {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn()
  };
  
  const mockTransaction = {
    objectStore: jest.fn().mockReturnValue(mockObjectStore)
  };
  
  const mockRequest = {
    onsuccess: null as any,
    onerror: null as any,
    onupgradeneeded: null as any,
    result: null as any,
    error: null as any
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    indexedDBAdapter = new IndexedDBAdapter();
    
    global.indexedDB = {
      open: jest.fn().mockReturnValue(mockRequest)
    } as any;
    
    mockDB.transaction = jest.fn().mockReturnValue(mockTransaction);
    
    mockRequest.result = mockDB;
    mockRequest.error = null;
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('constructor', () => {
    it('should use default database and store names when not provided', () => {
      const adapter = new IndexedDBAdapter();
      expect((adapter as any).dbName).toBe(defaultDbName);
      expect((adapter as any).storeName).toBe(defaultStoreName);
    });
    
    it('should use custom database and store names when provided', () => {
      const adapter = new IndexedDBAdapter(customDbName, customStoreName);
      expect((adapter as any).dbName).toBe(customDbName);
      expect((adapter as any).storeName).toBe(customStoreName);
    });
  });
  
  describe('openDatabase', () => {
    it('should open the database with correct name and version', async () => {
      const openPromise = indexedDBAdapter.openDatabase();
      
      setTimeout(() => {
        mockRequest.onsuccess({ target: { result: mockDB } } as any);
      }, 0);
      
      const db = await openPromise;
      
      expect(global.indexedDB.open).toHaveBeenCalledWith(defaultDbName, INDEXED_DB_VERSION);
      expect(db).toBe(mockDB);
    });
    
    it('should create object store if it does not exist', async () => {
      const openPromise = indexedDBAdapter.openDatabase();
      
      setTimeout(() => {
        mockRequest.onupgradeneeded({ target: { result: mockDB } } as any);
        mockRequest.onsuccess({ target: { result: mockDB } } as any);
      }, 0);
      
      await openPromise;
      
      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith(defaultStoreName);
      expect(mockDB.createObjectStore).toHaveBeenCalledWith(defaultStoreName);
    });
    
    it('should not create object store if it already exists', async () => {
      mockDB.objectStoreNames.contains = jest.fn().mockReturnValue(true);
      
      const openPromise = indexedDBAdapter.openDatabase();
      
      setTimeout(() => {
        mockRequest.onupgradeneeded({ target: { result: mockDB } } as any);
        mockRequest.onsuccess({ target: { result: mockDB } } as any);
      }, 0);
      
      await openPromise;
      
      expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith(defaultStoreName);
      expect(mockDB.createObjectStore).not.toHaveBeenCalled();
    });
    
    it('should return existing database if already open', async () => {
      const openPromise1 = indexedDBAdapter.openDatabase();
      setTimeout(() => {
        mockRequest.onsuccess({ target: { result: mockDB } } as any);
      }, 0);
      await openPromise1;
      
      (global.indexedDB.open as jest.Mock).mockClear();
      
      const db = await indexedDBAdapter.openDatabase();
      
      expect(global.indexedDB.open).not.toHaveBeenCalled();
      expect(db).toBe(mockDB);
    });
    
    it('should reject if there is an error opening the database', async () => {
      const openPromise = indexedDBAdapter.openDatabase();
      
      setTimeout(() => {
        mockRequest.error = new Error('Failed to open database');
        mockRequest.onerror({ target: mockRequest } as any);
      }, 0);
      
      await expect(openPromise).rejects.toThrow('Failed to open database');
    });
  });
  
  describe('get', () => {
    it('should retrieve a stored value from IndexedDB', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = testItem;
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      const result = await indexedDBAdapter.get<{ name: string }>(key);
      
      expect(mockDB.transaction).toHaveBeenCalledWith(defaultStoreName, 'readonly');
      expect(mockObjectStore.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(testItem);
    });
    
    it('should return null for non-existent keys', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = null;
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      const result = await indexedDBAdapter.get('nonExistentKey');
      
      expect(result).toBeNull();
    });
    
    it('should handle errors when retrieving data', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Failed to get item');
          request.onerror({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await expect(indexedDBAdapter.get('key')).rejects.toThrow('Failed to get item');
    });
  });
  
  describe('set', () => {
    it('should store a value in IndexedDB', async () => {
      const key = 'testKey';
      const testItem: CacheItem<{ name: string }> = {
        value: { name: 'Test Value' },
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await indexedDBAdapter.set(key, testItem);
      
      expect(mockDB.transaction).toHaveBeenCalledWith(defaultStoreName, 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledWith(testItem, key);
    });
    
    it('should handle errors when storing data', async () => {
      const testItem: CacheItem<string> = { 
        value: 'test', 
        expiry: Date.now() + 1000, 
        createdAt: Date.now() 
      };
      
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Failed to set item');
          request.onerror({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await expect(indexedDBAdapter.set('key', testItem)).rejects.toThrow('Failed to set item');
    });
  });
  
  describe('remove', () => {
    it('should remove an item from IndexedDB', async () => {
      const key = 'testKey';
      
      mockObjectStore.delete.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await indexedDBAdapter.remove(key);
      
      expect(mockDB.transaction).toHaveBeenCalledWith(defaultStoreName, 'readwrite');
      expect(mockObjectStore.delete).toHaveBeenCalledWith(key);
    });
    
    it('should handle errors when removing data', async () => {
      mockObjectStore.delete.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Failed to remove item');
          request.onerror({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await expect(indexedDBAdapter.remove('key')).rejects.toThrow('Failed to remove item');
    });
  });
  
  describe('clear', () => {
    it('should clear all items in the store', async () => {
      mockObjectStore.clear.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await indexedDBAdapter.clear();
      
      expect(mockDB.transaction).toHaveBeenCalledWith(defaultStoreName, 'readwrite');
      expect(mockObjectStore.clear).toHaveBeenCalled();
    });
    
    it('should handle errors when clearing data', async () => {
      mockObjectStore.clear.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Failed to clear store');
          request.onerror({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await expect(indexedDBAdapter.clear()).rejects.toThrow('Failed to clear store');
    });
  });
  
  describe('keys', () => {
    it('should return all keys in the store', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      
      mockObjectStore.getAllKeys.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockKeys;
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      const keys = await indexedDBAdapter.keys();
      
      expect(mockDB.transaction).toHaveBeenCalledWith(defaultStoreName, 'readonly');
      expect(mockObjectStore.getAllKeys).toHaveBeenCalled();
      expect(keys).toEqual(mockKeys);
    });
    
    it('should convert non-string keys to strings', async () => {
      const mockKeys = ['key1', 2, { toString: () => 'key3' }];
      
      mockObjectStore.getAllKeys.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockKeys;
          request.onsuccess({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      const keys = await indexedDBAdapter.keys();
      
      expect(keys).toEqual(['key1', '2', 'key3']);
    });
    
    it('should handle errors when getting keys', async () => {
      mockObjectStore.getAllKeys.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Failed to get keys');
          request.onerror({ target: request } as any);
        }, 0);
        return request;
      });
      
      jest.spyOn(indexedDBAdapter, 'openDatabase').mockResolvedValue(mockDB as any);
      
      await expect(indexedDBAdapter.keys()).rejects.toThrow('Failed to get keys');
    });
  });
}); 