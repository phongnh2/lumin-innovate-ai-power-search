import { MemoryAdapter } from '../adapters/memory-adapter';
import { CacheItem } from '../cache-base.interface';

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter();
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await adapter.get('non-existent-key');
      expect(result).toBeUndefined();
    });

    it('should return cached item for existing key', async () => {
      const testItem: CacheItem<string> = {
        value: 'test-value',
        expiry: null,
        createdAt: Date.now()
      };
      
      await adapter.set('test-key', testItem);
      const result = await adapter.get<string>('test-key');
      
      expect(result).not.toBeNull();
      expect(result?.value).toBe('test-value');
      expect(result?.expiry).toBeNull();
      expect(result?.createdAt).toBe(testItem.createdAt);
    });
  });

  describe('set', () => {
    it('should store item in cache', async () => {
      const testItem: CacheItem<number> = {
        value: 42,
        expiry: Date.now() + 1000,
        createdAt: Date.now()
      };
      
      await adapter.set('number-key', testItem);
      const result = await adapter.get<number>('number-key');
      
      expect(result).not.toBeNull();
      expect(result?.value).toBe(42);
      expect(result?.expiry).toBe(testItem.expiry);
    });

    it('should overwrite existing item with same key', async () => {
      const initialItem: CacheItem<string> = {
        value: 'initial-value',
        expiry: null,
        createdAt: Date.now() - 1000
      };
      
      const updatedItem: CacheItem<string> = {
        value: 'updated-value',
        expiry: null,
        createdAt: Date.now()
      };
      
      await adapter.set('update-key', initialItem);
      await adapter.set('update-key', updatedItem);
      
      const result = await adapter.get<string>('update-key');
      
      expect(result).not.toBeNull();
      expect(result?.value).toBe('updated-value');
      expect(result?.createdAt).toBe(updatedItem.createdAt);
    });
  });

  describe('remove', () => {
    it('should remove item from cache', async () => {
      const testItem: CacheItem<string> = {
        value: 'to-be-removed',
        expiry: null,
        createdAt: Date.now()
      };
      
      await adapter.set('remove-key', testItem);
      await adapter.remove('remove-key');
      
      const result = await adapter.get('remove-key');
      expect(result).toBeUndefined();
    });

    it('should not throw error when removing non-existent key', async () => {
      await expect(adapter.remove('non-existent-key')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all items from cache', async () => {
      const items = [
        { key: 'key1', item: { value: 'value1', expiry: null, createdAt: Date.now() } as CacheItem<string> },
        { key: 'key2', item: { value: 'value2', expiry: null, createdAt: Date.now() } as CacheItem<string> },
        { key: 'key3', item: { value: 'value3', expiry: null, createdAt: Date.now() } as CacheItem<string> }
      ];
      
      for (const { key, item } of items) {
        await adapter.set(key, item);
      }
      
      await adapter.clear();
      
      for (const { key } of items) {
        const result = await adapter.get(key);
        expect(result).toBeUndefined();
      }
      
      const keys = await adapter.keys();
      expect(keys.length).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return empty array when cache is empty', async () => {
      const keys = await adapter.keys();
      expect(keys).toEqual([]);
    });

    it('should return all keys in cache', async () => {
      const testKeys = ['key1', 'key2', 'key3'];
      
      for (const key of testKeys) {
        await adapter.set(key, {
          value: `value-${key}`,
          expiry: null,
          createdAt: Date.now()
        } as CacheItem<string>);
      }
      
      const keys = await adapter.keys();
      
      expect(keys.length).toBe(testKeys.length);
      expect(keys).toEqual(expect.arrayContaining(testKeys));
    });
  });

  describe('complex data types', () => {
    it('should handle complex object types', async () => {
      const complexObject = {
        id: 1,
        name: 'Test Object',
        nested: {
          property: 'nested value',
          array: [1, 2, 3]
        },
        tags: ['tag1', 'tag2']
      };
      
      const testItem: CacheItem<typeof complexObject> = {
        value: complexObject,
        expiry: Date.now() + 60000,
        createdAt: Date.now()
      };
      
      await adapter.set('complex-key', testItem);
      const result = await adapter.get<typeof complexObject>('complex-key');
      
      expect(result).not.toBeNull();
      expect(result?.value).toEqual(complexObject);
      expect(result?.value.nested.property).toBe('nested value');
      expect(result?.value.tags).toEqual(['tag1', 'tag2']);
    });
  });
}); 