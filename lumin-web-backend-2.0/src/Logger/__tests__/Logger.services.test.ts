import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../Logger.service';
import { EnvironmentService } from '../../Environment/environment.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let environmentService: jest.Mocked<EnvironmentService>;
  let setIntervalSpy: jest.SpyInstance;

  beforeAll(() => {
    setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation((() => {
      return {} as NodeJS.Timeout;
    }) as any);
  });

  afterAll(() => {
    setIntervalSpy.mockRestore();
  });

  beforeEach(async () => {
    const mockEnvironmentService = {
      getByKey: jest.fn((key: string) => {
        if (key === 'LOG_LEVEL') return 'info';
        if (key === 'VERSION') return '1.0.0';
        if (key === 'ENV') return 'test';
        return '';
      }),
      isDevelopment: false,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: EnvironmentService,
          useValue: mockEnvironmentService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    environmentService = module.get(EnvironmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('filterSensitiveDataRecursive', () => {
    describe('depth limiting', () => {
      it('should return data as-is when depth exceeds 10', () => {
        const deepObject = { sensitive: 'value' };
        const result = service['filterSensitiveDataRecursive'](deepObject, 11);
        expect(result).toEqual(deepObject);
      });

      it('should process data when depth is exactly 10', () => {
        const data = { normalField: 'value', password: 'secret' };
        const result = service['filterSensitiveDataRecursive'](data, 10);
        expect(result).toEqual({ normalField: 'value' });
      });
    });

    describe('nil values', () => {
      it('should return null as-is', () => {
        const result = service['filterSensitiveDataRecursive'](null);
        expect(result).toBeNull();
      });

      it('should return undefined as-is', () => {
        const result = service['filterSensitiveDataRecursive'](undefined);
        expect(result).toBeUndefined();
      });
    });

    describe('primitive values', () => {
      it('should return string values as-is', () => {
        const result = service['filterSensitiveDataRecursive']('test string');
        expect(result).toBe('test string');
      });

      it('should return number values as-is', () => {
        const result = service['filterSensitiveDataRecursive'](42);
        expect(result).toBe(42);
      });

      it('should return boolean values as-is', () => {
        const result = service['filterSensitiveDataRecursive'](true);
        expect(result).toBe(true);
      });
    });

    describe('arrays', () => {
      it('should process array items recursively', () => {
        const data = [
          { name: 'John', password: 'secret1' },
          { name: 'Jane', apiKey: 'secret2' },
        ];
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual([
          { name: 'John' },
          { name: 'Jane' },
        ]);
      });

      it('should handle nested arrays', () => {
        const data = [
          [{ field: 'value', token: 'secret' }],
        ];
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual([
          [{ field: 'value' }],
        ]);
      });

      it('should handle empty arrays', () => {
        const data = [];
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual([]);
      });
    });

    describe('sensitive field filtering', () => {
      it('should filter out password fields', () => {
        const data = { username: 'john', password: 'secret123' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ username: 'john' });
      });

      it('should filter out email fields', () => {
        const data = { name: 'John', email: 'john@example.com', userEmail: 'john@test.com' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ name: 'John' });
      });

      it('should filter out token fields', () => {
        const data = { id: '123', token: 'abc123', authToken: 'xyz789' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ id: '123' });
      });

      it('should filter out apiKey fields', () => {
        const data = { service: 'test', apiKey: 'key123', serviceKey: 'key456' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ service: 'test' });
      });

      it('should filter out secret fields', () => {
        const data = { config: 'value', secret: 'mysecret', apiSecret: 'apisecret' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ config: 'value' });
      });

      it('should filter out authorization fields', () => {
        const data = { user: 'john', authorization: 'Bearer token' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ user: 'john' });
      });

      it('should filter out personal information fields', () => {
        const data = {
          name: 'John',
          ssn: '123-45-6789',
          phone: '+1234567890',
          dob: '1990-01-01',
        };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ name: 'John' });
      });

      it('should filter out cookie fields', () => {
        const data = { userId: 'active', cookie: 'sessionid=abc123' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ userId: 'active' });
      });

      it('should filter out payment fields', () => {
        const data = { orderId: '123', creditCard: '4111111111111111', cvv: '123' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ orderId: '123' });
      });

      it('should filter out access and refresh tokens', () => {
        const data = { userId: '123', accessToken: 'token1', refreshToken: 'token2' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ userId: '123' });
      });

      it('should filter out private and public keys', () => {
        const data = { keyId: '123', privateKey: 'key1', publicKey: 'key2' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ keyId: '123' });
      });

      it('should filter out session fields', () => {
        const data = { userId: '123', sessionId: 'sess123', sessionToken: 'token456' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({ userId: '123' });
      });
    });

    describe('nested objects', () => {
      it('should filter sensitive fields in nested objects', () => {
        const data = {
          user: {
            name: 'John',
            email: 'john@example.com',
            profile: {
              bio: 'Developer',
              password: 'secret',
            },
          },
        };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({
          user: {
            name: 'John',
            profile: {
              bio: 'Developer',
            },
          },
        });
      });

      it('should handle deeply nested structures', () => {
        const data = {
          level1: {
            level2: {
              level3: {
                level4: {
                  data: 'value',
                  secret: 'hidden',
                },
              },
            },
          },
        };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({
          level1: {
            level2: {
              level3: {
                level4: {
                  data: 'value',
                },
              },
            },
          },
        });
      });
    });

    describe('circular references', () => {
      it('should handle circular references in objects', () => {
        const data: any = { name: 'test' };
        data.self = data;
        
        const result = service['filterSensitiveDataRecursive'](data);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('name', 'test');
      });

      it('should handle circular references with sensitive fields', () => {
        const data: any = { name: 'test', password: 'secret' };
        data.self = data;
        
        const result = service['filterSensitiveDataRecursive'](data);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('name', 'test');
        expect(result).not.toHaveProperty('password');
      });
    });

    describe('mixed data structures', () => {
      it('should handle objects with mixed types', () => {
        const data = {
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          array: [1, 2, 3],
          nested: { field: 'value', count: 10 },
          password: 'secret',
        };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          array: [1, 2, 3],
          nested: { field: 'value', count: 10 },
        });
      });

      it('should handle arrays with mixed types', () => {
        const data = [
          'string',
          42,
          true,
          { field: 'value', token: 'secret' },
          [1, 2, 3],
        ];
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual([
          'string',
          42,
          true,
          { field: 'value' },
          [1, 2, 3],
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty objects', () => {
        const data = {};
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({});
      });

      it('should handle objects with only sensitive fields', () => {
        const data = { password: 'secret', token: 'abc123', apiKey: 'key456' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual({});
      });

      it('should preserve objects with no sensitive fields', () => {
        const data = { name: 'John', age: 30, city: 'New York' };
        const result = service['filterSensitiveDataRecursive'](data);
        expect(result).toEqual(data);
      });
    });
  });

  describe('isSensitiveField', () => {
    it('should identify email fields as sensitive', () => {
      expect(service['isSensitiveField']('email')).toBe(true);
      expect(service['isSensitiveField']('userEmail')).toBe(true);
      expect(service['isSensitiveField']('emailAddress')).toBe(true);
    });

    it('should identify auth fields as sensitive', () => {
      expect(service['isSensitiveField']('password')).toBe(true);
      expect(service['isSensitiveField']('token')).toBe(true);
      expect(service['isSensitiveField']('secret')).toBe(true);
      expect(service['isSensitiveField']('apiKey')).toBe(true);
      expect(service['isSensitiveField']('authorization')).toBe(true);
    });

    it('should identify personal information as sensitive', () => {
      expect(service['isSensitiveField']('ssn')).toBe(true);
      expect(service['isSensitiveField']('phone')).toBe(true);
      expect(service['isSensitiveField']('dob')).toBe(true);
    });

    it('should not identify normal fields as sensitive', () => {
      expect(service['isSensitiveField']('name')).toBe(false);
      expect(service['isSensitiveField']('age')).toBe(false);
      expect(service['isSensitiveField']('description')).toBe(false);
    });
  });

  describe('handleCircularReferences', () => {
    it('should handle objects without circular references', () => {
      const data = { name: 'test', value: 123 };
      const result = service['handleCircularReferences'](data);
      expect(result).toEqual(data);
    });

    it('should handle circular references', () => {
      const data: any = { name: 'test' };
      data.self = data;
      
      const result = service['handleCircularReferences'](data);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name', 'test');
    });

    it('should handle nested circular references', () => {
      const parent: any = { name: 'parent' };
      const child: any = { name: 'child', parent };
      parent.child = child;
      
      const result = service['handleCircularReferences'](parent);
      
      expect(result).toBeDefined();
    });
  });

  describe('getCommonErrorAttributes', () => {
    it('should extract error attributes correctly', () => {
      const error = new Error('Test error');
      (error as any).code = 'TEST_ERROR';
      
      const result = service.getCommonErrorAttributes(error);
      
      expect(result).toHaveProperty('errorCode', 'TEST_ERROR');
      expect(result).toHaveProperty('stack');
      expect(result).toHaveProperty('error', 'Test error');
    });

    it('should handle empty error', () => {
      const result = service.getCommonErrorAttributes(null);
      expect(result).toEqual({});
    });

    it('should handle error without code', () => {
      const error = new Error('Test error');
      const result = service.getCommonErrorAttributes(error);
      
      expect(result.errorCode).toBeUndefined();
      expect(result).toHaveProperty('error', 'Test error');
      expect(result).toHaveProperty('stack');
      expect(result.stack).toBeDefined();
    });
  });

  describe('error', () => {
    it('should log error with filtered sensitive data', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const message = {
        context: 'test',
        error: 'Test error',
        extraInfo: {
          username: 'john',
          password: 'secret123',
        },
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.objectContaining({
          context: 'test',
          extraInfo: expect.objectContaining({
            username: 'john',
          }),
        }),
      );
    });

    it('should handle error message as string', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const message = {
        context: 'test',
        error: 'Simple error message',
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        'Simple error message',
        expect.objectContaining({
          context: 'test',
          error: 'Simple error message',
        }),
      );
    });

    it('should handle Error object and extract message', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const error = new Error('Test error message');
      const message = {
        context: 'test',
        error,
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        'Test error message',
        expect.objectContaining({
          context: 'test',
        }),
      );
    });

    it('should handle error object with response data', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const error = {
        response: {
          data: {
            message: 'API error message',
          },
        },
      };
      const message = {
        context: 'test',
        error,
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        'API error message',
        expect.objectContaining({
          context: 'test',
        }),
      );
    });

    it('should handle plain object errors', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const error = { code: 'ERR_TEST', details: 'Some details' };
      const message = {
        context: 'test',
        error,
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        JSON.stringify(error),
        expect.objectContaining({
          context: 'test',
        }),
      );
    });

    it('should handle message without error field', () => {
      const logSpy = jest.spyOn(service['_logger'], 'log');
      
      const message = {
        context: 'test',
      };
      
      service.error(message);
      
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        JSON.stringify(message),
        expect.objectContaining({
          context: 'test',
        }),
      );
    });
  });

  describe('extractErrorMessage', () => {
    it('should return "Unknown error" for null/undefined', () => {
      expect(service['extractErrorMessage'](null)).toBe('Unknown error');
      expect(service['extractErrorMessage'](undefined)).toBe('Unknown error');
    });

    it('should return string as-is', () => {
      expect(service['extractErrorMessage']('Error message')).toBe('Error message');
    });

    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(service['extractErrorMessage'](error)).toBe('Test error');
    });

    it('should handle Error without message', () => {
      const error = new Error();
      expect(service['extractErrorMessage'](error)).toBe('Error occurred');
    });

    it('should extract message from response data', () => {
      const error = {
        response: {
          data: {
            message: 'API Error',
          },
        },
      };
      expect(service['extractErrorMessage'](error)).toBe('API Error');
    });

    it('should stringify plain objects', () => {
      const error = { code: 'ERR', detail: 'Details' };
      expect(service['extractErrorMessage'](error)).toBe(JSON.stringify(error));
    });

    it('should handle objects with message property', () => {
      const error = { message: 'Custom message', code: 'ERR' };
      expect(service['extractErrorMessage'](error)).toBe('Custom message');
    });

    it('should convert primitives to string', () => {
      expect(service['extractErrorMessage'](123)).toBe('123');
      expect(service['extractErrorMessage'](true)).toBe('true');
    });
  });
});

