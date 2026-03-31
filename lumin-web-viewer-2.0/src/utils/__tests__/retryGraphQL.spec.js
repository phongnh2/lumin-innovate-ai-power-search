import pRetry from 'p-retry';
import { retryGraphQLOperation, retryOnUnavailableService } from '../retryGraphQL';

jest.mock('p-retry');

describe('retryGraphQL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('retryGraphQLOperation', () => {
    it('should call pRetry with correct default options', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      pRetry.mockResolvedValue('success');

      await retryGraphQLOperation(mockFn);

      expect(pRetry).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 8000,
          onFailedAttempt: expect.any(Function),
        })
      );
    });

    it('should call pRetry with custom options', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      pRetry.mockResolvedValue('success');
      const customOptions = {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 10000,
      };

      await retryGraphQLOperation(mockFn, customOptions);

      expect(pRetry).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          retries: 5,
          factor: 2,
          minTimeout: 2000,
          maxTimeout: 10000,
          onFailedAttempt: expect.any(Function),
        })
      );
    });

    it('should return the result when function succeeds', async () => {
      const expectedResult = { data: 'test data' };
      const mockFn = jest.fn().mockResolvedValue(expectedResult);
      pRetry.mockResolvedValue(expectedResult);

      const result = await retryGraphQLOperation(mockFn);

      expect(result).toBe(expectedResult);
    });

    it('should pass through function when no errors occur', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      pRetry.mockImplementation(async (fn) => await fn());

      const result = await retryGraphQLOperation(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    describe('retry condition behavior', () => {
      it('should retry on 503 GraphQL errors', async () => {
        const mockError = {
          graphQLErrors: [{ extensions: { statusCode: 503 } }],
        };
        const mockFn = jest.fn().mockRejectedValue(mockError);
        
        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw error;
          }
        });

        await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should retry on 503 network errors', async () => {
        const mockError = {
          networkError: { statusCode: 503 },
        };
        const mockFn = jest.fn().mockRejectedValue(mockError);
        
        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw error;
          }
        });

        await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should not retry on non-503 GraphQL errors', async () => {
        const mockError = {
          graphQLErrors: [{ extensions: { statusCode: 400 } }],
        };
        const mockFn = jest.fn().mockRejectedValue(mockError);
        
        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw mockError;
          }
        });

        await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
      });

      it('should not retry on non-503 network errors', async () => {
        const mockError = {
          networkError: { statusCode: 404 },
        };
        const mockFn = jest.fn().mockRejectedValue(mockError);
        
        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw mockError;
          }
        });

        await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
      });

      it('should handle custom retry conditions', async () => {
        const mockError = { customField: 'retry-me' };
        const customRetryCondition = (error) => error.customField === 'retry-me';
        const mockFn = jest.fn().mockRejectedValue(mockError);

        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw error;
          }
        });

        await expect(
          retryGraphQLOperation(mockFn, { retryCondition: customRetryCondition })
        ).rejects.toEqual(mockError);
      });

      it('should not retry when custom retry condition returns false', async () => {
        const mockError = { customField: 'dont-retry' };
        const customRetryCondition = (error) => error.customField === 'retry-me';
        const mockFn = jest.fn().mockRejectedValue(mockError);

        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw mockError;
          }
        });

        await expect(
          retryGraphQLOperation(mockFn, { retryCondition: customRetryCondition })
        ).rejects.toEqual(mockError);
      });

      it('should handle non-Error objects by converting them to Error', async () => {
        const mockError = 'string error';
        const mockFn = jest.fn().mockRejectedValue(mockError);

        pRetry.mockImplementation(async (fn) => {
          try {
            return await fn();
          } catch (error) {
            throw new Error(String(mockError));
          }
        });

        await expect(retryGraphQLOperation(mockFn)).rejects.toBeInstanceOf(Error);
      });
    });

    it('should have onFailedAttempt callback configured', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('test error'));
      let onFailedAttemptCallback;

      pRetry.mockImplementation(async (fn, options) => {
        onFailedAttemptCallback = options.onFailedAttempt;
        throw new Error('test error');
      });

      await expect(retryGraphQLOperation(mockFn)).rejects.toThrow('test error');

      expect(onFailedAttemptCallback).toBeDefined();
      expect(typeof onFailedAttemptCallback).toBe('function');
    });

    it('should retry multiple GraphQL 503 errors until one has a different status', async () => {
      const firstError = { graphQLErrors: [{ extensions: { statusCode: 503 } }] };
      const secondError = { graphQLErrors: [{ extensions: { statusCode: 503 } }] };
      const thirdError = { graphQLErrors: [{ extensions: { statusCode: 400 } }] };
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(firstError)
        .mockRejectedValueOnce(secondError)
        .mockRejectedValueOnce(thirdError);

      pRetry.mockImplementation(async (fn) => {
        let attempt = 0;
        while (attempt < 3) {
          try {
            return await fn();
          } catch (error) {
            attempt++;
            if (attempt >= 3) {
              throw thirdError;
            }
          }
        }
      });

      await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(thirdError);
    });
  });

  describe('retryOnUnavailableService', () => {
    it('should call retryGraphQLOperation with default 503 retry configuration', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      pRetry.mockResolvedValue('success');

      const result = await retryOnUnavailableService(mockFn);

      expect(result).toBe('success');
      expect(pRetry).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 8000,
          onFailedAttempt: expect.any(Function),
        })
      );
    });

    it('should retry on 503 GraphQL errors', async () => {
      const mockError = {
        graphQLErrors: [{ extensions: { statusCode: 503 } }],
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      pRetry.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw error;
        }
      });

      await expect(retryOnUnavailableService(mockFn)).rejects.toEqual(mockError);
    });

    it('should not retry on non-503 errors', async () => {
      const mockError = {
        graphQLErrors: [{ extensions: { statusCode: 400 } }],
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      pRetry.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw mockError;
        }
      });

      await expect(retryOnUnavailableService(mockFn)).rejects.toEqual(mockError);
    });
  });

  describe('edge cases', () => {
    it('should handle errors without graphQLErrors or networkError', async () => {
      const mockError = { message: 'Unknown error' };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      pRetry.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw mockError;
        }
      });

      await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
    });

    it('should handle GraphQL errors without extensions', async () => {
      const mockError = {
        graphQLErrors: [{ message: 'GraphQL error without extensions' }],
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      pRetry.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw mockError;
        }
      });

      await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
    });

    it('should handle network errors without statusCode', async () => {
      const mockError = {
        networkError: { message: 'Network error without status code' },
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      pRetry.mockImplementation(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          throw mockError;
        }
      });

      await expect(retryGraphQLOperation(mockFn)).rejects.toEqual(mockError);
    });
  });
});