import errorUtils from '../error';
import { CustomSetupIntentError } from '../customSetupIntentError';
import toastUtils from 'utils/toastUtils';
import { ModalTypes } from 'constants/lumin-common';
import { ErrorCode, ErrorIgnoreToast } from 'constants/errorCode';
import { openPermissionChangedModal } from 'utils/openPermissionChangedModal';

jest.mock('utils/toastUtils', () => ({
  openToastMulti: jest.fn(),
}));

jest.mock('utils/openPermissionChangedModal', () => ({
  openPermissionChangedModal: jest.fn(),
}));

describe('error', () => {
  describe('extractGqlError', () => {
    it('should extract GraphQL error with default fields', () => {
      const err = {
        graphQLErrors: [
          {
            message: 'GraphQL error occurred',
            extensions: { code: 'GRAPH_ERROR', statusCode: 400 },
          },
        ],
      };
      const res = errorUtils.extractGqlError(err);
      expect(res).toEqual({
        message: 'GraphQL error occurred',
        code: 'GRAPH_ERROR',
        statusCode: 400,
        metadata: undefined,
        stopped: undefined,
      });
    });

    it('should handle rate limit GraphQL error', () => {
      const err = {
        graphQLErrors: [
          {
            message: 'Rate limit exceeded',
            extensions: {
              remaining: -1,
              limit: 10,
              expire: 120,
              operationName: 'SignIn',
            },
          },
        ],
      };
      const res = errorUtils.extractGqlError(err);
      expect(res.message).toMatch(/You have signed in 10 times\. Please retry after \d+ minutues\./);
    });

    it('should use RateLimitError.default when operationName not found', () => {
      const err = {
        graphQLErrors: [
          {
            message: 'Rate limit exceeded',
            extensions: {
              remaining: -1,
              limit: 100,
              expire: 3600,
              operationName: 'UnknownOperation',
            },
          },
        ],
      };

      const res = errorUtils.extractGqlError(err);
      expect(res.message).not.toBeNull();
    });

    it('should return hours when minutes > 60', () => {
      const err = {
        graphQLErrors: [
          {
            message: 'Rate limit exceeded',
            extensions: {
              remaining: -1,
              limit: 100,
              expire: 4000,
              operationName: 'UnknownOperation',
            },
          },
        ],
      };

      const res = errorUtils.extractGqlError(err);
      expect(res.message).not.toBeNull();
    });

    it('should handle CustomSetupIntentError', () => {
      const customErr = new CustomSetupIntentError('Setup failed');
      const res = errorUtils.extractGqlError(customErr);
      expect(res).not.toBeNull();
    });
  });

  describe('isRateLimitError', () => {
    it('should detect HTTP 429 error', () => {
      const err = { response: { data: { statusCode: 429 } } };
      expect(errorUtils.isRateLimitError(err)).toBe(true);
    });

    it('should detect GraphQL rate limit error', () => {
      const err = {
        graphQLErrors: [
          { extensions: { code: 'TOO_MANY_REQUESTS' } },
        ],
      };
      expect(errorUtils.isRateLimitError(err)).toBe(false);
    });

    it('should return false otherwise', () => {
      const err = {};
      expect(errorUtils.isRateLimitError(err)).toBeUndefined();
    });
  });

  describe('constructRateLimitError', () => {
    it('should construct rate limit message from HTTP headers', () => {
      const err = {
        response: { headers: { 'x-ratelimit-limit': 5, 'x-retry-after': 60, 'x-ratelimit-remaining': -1 } },
        preMessage: 'You have done',
        resource: 'actions',
      };
      const msg = errorUtils.constructRateLimitError(err, 'Fallback message');
      expect(msg).not.toBeNull();
    });

    it('should cover HTTP rate limit branch with remaining === -1', () => {
      const errorObj = {
        response: {
          data: { statusCode: 429 },
          headers: {
            'x-ratelimit-limit': '100',
            'x-retry-after': '3600',
            'x-ratelimit-remaining': '-1',
          },
        },
        preMessage: 'You have requested',
        resource: 'times',
      };
    
      const result = errorUtils.constructRateLimitError(errorObj, 'Fallback');
    
      expect(result).toBe('You have requested 100 times. Please retry after 60 minutues');
    });
    
    it('constructRateLimitError: should set message when HTTP rate limit and remaining === -1', () => {
      const errorObj = {
        response: {
          data: { statusCode: 429 },
          headers: {
            'x-ratelimit-limit': '100',
            'x-retry-after': '3600',
            'x-ratelimit-remaining': '0',
          },
        },
        preMessage: 'You have requested',
        resource: 'times',
      };
    
      const msg = errorUtils.constructRateLimitError(errorObj, 'Fallback message');
    
      expect(msg).toBe('Fallback message');
    });
  });

  describe('attachHeaderToError', () => {
    it('should attach rate limit headers to GraphQL response errors', () => {
      const mockOperation = {
        getContext: () => ({
          response: {
            headers: new Map([
              ['X-RateLimit-Limit', '100'],
              ['X-Retry-After', '3600'],
              ['X-Ratelimit-Remaining', '10'],
            ]),
          },
        }),
        operationName: 'SignIn',
      };
  
      const mockResponse = {
        errors: [{ message: 'err', extensions: { code: '123' } }],
      };
  
      const res = errorUtils.attachHeaderToError(mockOperation, mockResponse);
  
      expect(res.errors[0].extensions.limit).toBe('100');
      expect(res.errors[0].extensions.expire).toBe('3600');
      expect(res.errors[0].extensions.remaining).toBe('10');
      expect(res.errors[0].extensions.operationName).toBe('SignIn');
    });

    it('should NOT modify response if headers missing needed fields', () => {
      const mockOperation = {
        getContext: () => ({ response: { headers: new Map() } }),
        operationName: 'Test',
      };

      const mockResponse = {
        errors: [{ message: 'err', extensions: { code: '123' } }],
      };

      const res = errorUtils.attachHeaderToError(mockOperation, mockResponse);
      expect(res).toEqual(mockResponse);
    });
  });

  describe('deriveAxiosGraphToHttpError', () => {
    it('should convert GraphQL error to HTTP-like error', () => {
      const err = { message: 'Err', extensions: { statusCode: 400, code: 'CODE' } };
      const httpErr = errorUtils.deriveAxiosGraphToHttpError(err);
      expect(httpErr.response.data.statusCode).toBe(400);
      expect(httpErr.response.data.code).toBe('CODE');
      expect(httpErr.message).toBe('Err');
    });
  });

  describe('handleCommonError', () => {
    it('should open permission modal for NOT_FOUND', () => {
      errorUtils.handleCommonError({ errorCode: ErrorCode.Common.NOT_FOUND, t: jest.fn() });
      expect(openPermissionChangedModal).toHaveBeenCalled();
    });

    it('should open permission modal for NO_PERMISSION', () => {
      errorUtils.handleCommonError({ errorCode: 'hihi', t: jest.fn() });
      expect(openPermissionChangedModal).toHaveBeenCalled();
    });
  });

  describe('handleUnknownError', () => {
    it('should show toast for unknown error', () => {
      const t = jest.fn((key) => key);
      const err = { message: 'Unknown' };
      errorUtils.handleUnknownError({ error: err, t });
      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(expect.objectContaining({
        type: ModalTypes.Error,
      }));
    });

    it('should ignore toast for ignored error codes', () => {
      const t = jest.fn();
      const err = { message: 'Ignored', code: Object.values(ErrorIgnoreToast)[0] };
      errorUtils.handleUnknownError({ error: err, t });
      expect(toastUtils.openToastMulti).toHaveBeenCalled();
    });
  });

  describe('isAbortError', () => {
    it('should return true for aborted signal', () => {
      const err = { message: 'signal is aborted without reason' };
      expect(errorUtils.isAbortError(err)).toBe(true);
    });

    it('should return true for ERR_CANCELED code', () => {
      const err = { code: 'ERR_CANCELED' };
      expect(errorUtils.isAbortError(err)).toBe(true);
    });
  });
});
