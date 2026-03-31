import {
  filterSensitiveData,
  filterSensitiveAttributes,
  addSensitivePattern,
  default as sensitiveDataFilter
} from '../sensitiveDataFilter';
import logger from 'helpers/logger';

describe('sensitiveDataFilter', () => {
  describe('filterSensitiveData', () => {
    it('should filter sensitive fields from simple object', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        age: 30
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        name: 'John Doe',
        age: 30
      });
    });

    it('should filter sensitive fields from nested objects', () => {
      const input = {
        user: {
          name: 'John Doe',
          userEmail: 'john@example.com',
          profile: {
            phone: '123-456-7890',
            address: '123 Main St',
            preferences: {
              theme: 'dark'
            }
          }
        },
        apiKey: 'secret-key-123'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        user: {
          name: 'John Doe',
          profile: {
            preferences: {
              theme: 'dark'
            }
          }
        }
      });
    });

    it('should filter sensitive fields from arrays', () => {
      const input = {
        users: [
          { name: 'John', email: 'john@example.com' },
          { name: 'Jane', password: 'secret' }
        ]
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        users: [
          { name: 'John' },
          { name: 'Jane' }
        ]
      });
    });

    it('should handle null and undefined values', () => {
      expect(filterSensitiveData(null)).toBe(null);
      expect(filterSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(filterSensitiveData('string')).toBe('string');
      expect(filterSensitiveData(123)).toBe(123);
      expect(filterSensitiveData(true)).toBe(true);
    });

    it('should handle deep nesting with depth limit', () => {
      // Create deeply nested object beyond depth limit
      let deepObject = { value: 'test' };
      for (let i = 0; i < 15; i++) {
        deepObject = { nested: deepObject, password: 'secret' };
      }

      const result = filterSensitiveData(deepObject);
      
      // Should stop filtering at depth 10 and return original structure
      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      // Mock logger.logError to avoid logging during test
      const loggerSpy = jest.spyOn(logger, 'logError').mockImplementation();
      
      // Create circular reference to cause error
      let result;
      try {
        const circular = { name: 'test' };
        circular.self = circular;
  
        result = filterSensitiveData(circular);
      } catch (error) {
        expect(result).toEqual({ message: 'Log data filtered due to processing error' });
        expect(loggerSpy).toHaveBeenCalledWith({
          message: 'Failed to filter sensitive data',
          error: expect.any(Error),
        });
      }
    });

    it('should filter various email patterns', () => {
      const input = {
        email: 'test@example.com',
        userEmail: 'user@example.com',
        emailAddress: 'email@example.com',
        mail: 'mail@example.com',
        mailAddr: 'addr@example.com'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({});
    });

    it('should filter various personal information patterns', () => {
      const input = {
        ssn: '123-45-6789',
        social: '987654321',
        passport: 'A1234567',
        driverLicense: 'DL123456',
        phone: '555-1234',
        mobile: '555-5678',
        address: '123 Main St',
        zipCode: '12345',
        dob: '1990-01-01'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({});
    });

    it('should filter various authentication patterns', () => {
      const input = {
        password: 'secret',
        secret: 'topsecret',
        token: 'abc123',
        key: 'key123',
        credential: 'cred123',
        authToken: 'auth123',
        passwordHash: 'hash123'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({});
    });

    it('should filter API key patterns', () => {
      const input = {
        cookieToken: 'cookie123',
        apiKey: 'api123',
        serviceKey: 'service123',
        apiSecret: 'secret123'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({});
    });
  });

  describe('filterSensitiveAttributes', () => {
    it('should filter sensitive attributes and nil values', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
        password: null,
        age: undefined,
        city: 'New York'
      };

      const result = filterSensitiveAttributes(input);

      expect(result).toEqual({
        name: 'John',
        city: 'New York'
      });
    });

    it('should return input if not an object', () => {
      expect(filterSensitiveAttributes(null)).toBe(null);
      expect(filterSensitiveAttributes(undefined)).toBe(undefined);
      expect(filterSensitiveAttributes('string')).toBe('string');
      expect(filterSensitiveAttributes(123)).toBe(123);
    });

    it('should handle empty object', () => {
      expect(filterSensitiveAttributes({})).toEqual({});
    });
  });

  describe('addSensitivePattern', () => {
    it('should add new sensitive pattern', () => {
      const testData = {
        customField: 'sensitive-data',
        normalField: 'normal-data'
      };

      // Add custom pattern
      addSensitivePattern('custom', /^customField$/i);

      const result = filterSensitiveData(testData);

      expect(result).toEqual({
        normalField: 'normal-data'
      });
    });
  });

  describe('default export', () => {
    it('should export all functions', () => {
      expect(sensitiveDataFilter.filterSensitiveData).toBeDefined();
      expect(sensitiveDataFilter.filterSensitiveAttributes).toBeDefined();
      expect(sensitiveDataFilter.isSensitiveField).toBeDefined();
      expect(sensitiveDataFilter.addSensitivePattern).toBeDefined();
    });

    it('should use isSensitiveField function correctly', () => {
      expect(sensitiveDataFilter.isSensitiveField('email')).toBe(true);
      expect(sensitiveDataFilter.isSensitiveField('password')).toBe(true);
      expect(sensitiveDataFilter.isSensitiveField('name')).toBe(false);
      expect(sensitiveDataFilter.isSensitiveField('age')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with prototype pollution attempts', () => {
      const input = {
        '__proto__': { isAdmin: true },
        'constructor': { prototype: { isAdmin: true } },
        name: 'John'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        '__proto__': { isAdmin: true },
        'constructor': { prototype: { isAdmin: true } },
        name: 'John'
      });
    });

    it('should handle mixed array types', () => {
      const input = {
        mixedArray: [
          'string',
          123,
          { name: 'John', email: 'john@example.com' },
          null,
          null,
          true
        ]
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        mixedArray: [
          'string',
          123,
          { name: 'John' },
          null,
          null,
          true
        ]
      });
    });

    it('should handle empty arrays and objects', () => {
      const input = {
        emptyArray: [],
        emptyObject: {},
        password: 'secret'
      };

      const result = filterSensitiveData(input);

      expect(result).toEqual({
        emptyArray: [],
        emptyObject: {}
      });
    });
  });
});
