import { renderHook } from '@testing-library/react';
import { useHandleError } from '../hooks/useHandleError';

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) {
        let result = key;
        Object.entries(params).forEach(([k, v]) => {
          result += ` ${k}:${v}`;
        });
        return result;
      }
      return key;
    },
  }),
}));

// Mock services
jest.mock('services', () => ({
  oneDriveServices: {
    getCurrentAccountEmailInCache: jest.fn().mockReturnValue('current@test.com'),
  },
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  logInfo: jest.fn(),
}));

// Mock error utilities
jest.mock('utils', () => ({
  dropboxError: {
    isFileNotFoundError: jest.fn(),
  },
  googleDriveError: {
    isBlockPopUpError: jest.fn(),
    isFileNotFoundError: jest.fn(),
    isUnauthorizedError: jest.fn(),
    isClosePopUpError: jest.fn(),
    isAccessDeniedError: jest.fn(),
  },
}));

jest.mock('utils/oneDriveError', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      isClosePopUpError: jest.fn().mockReturnValue(false),
      isPopupBlockedError: jest.fn().mockReturnValue(false),
      isFileNotFound: jest.fn().mockReturnValue(false),
      isAccessDenied: jest.fn().mockReturnValue(false),
      isAuthenticationError: jest.fn().mockReturnValue(false),
      isInvalidRequestError: jest.fn().mockReturnValue(false),
      getErrorData: { errorMessage: 'Unknown error', errorCode: 'UNKNOWN', statusCode: 500 },
    })),
    ErrorBase: class ErrorBase {},
  };
});

import { googleDriveError, dropboxError } from 'utils';
import OneDriveErrorUtils from 'utils/oneDriveError';
import { ErrorType } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';

const mockGoogleDriveError = googleDriveError as jest.Mocked<typeof googleDriveError>;
const mockDropboxError = dropboxError as jest.Mocked<typeof dropboxError>;
const MockOneDriveErrorUtils = OneDriveErrorUtils as jest.MockedClass<typeof OneDriveErrorUtils>;

describe('useHandleError', () => {
  const mockDoc = {
    _id: 'doc-1',
    name: 'test.pdf',
    remoteEmail: 'owner@test.com',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all google drive error checks to false
    mockGoogleDriveError.isBlockPopUpError.mockReturnValue(false);
    mockGoogleDriveError.isFileNotFoundError.mockReturnValue(false);
    mockGoogleDriveError.isUnauthorizedError.mockReturnValue(false);
    mockGoogleDriveError.isClosePopUpError.mockReturnValue(false);
    mockGoogleDriveError.isAccessDeniedError.mockReturnValue(false);
    
    // Reset dropbox error checks
    mockDropboxError.isFileNotFoundError.mockReturnValue(false);
  });

  describe('getGoogleDriveErrorMessage', () => {
    it('should return block popup error', () => {
      mockGoogleDriveError.isBlockPopUpError.mockReturnValue(true);
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error: new Error('Popup blocked'),
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('openDrive.blockByBrowser');
      expect(errorType).toBe(ErrorType.BLOCK_POPUP);
    });

    it('should return file not found error', () => {
      mockGoogleDriveError.isFileNotFoundError.mockReturnValue(true);
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error: new Error('File not found'),
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('multipleDownload.documentDeletedOrAccessRevoked');
      expect(errorType).toBe(ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS);
    });

    it('should return unauthorized error with account info', () => {
      mockGoogleDriveError.isUnauthorizedError.mockReturnValue(true);
      
      const error = new Error('Unauthorized');
      (error as any).cause = { tokenInfo: { email: 'different@test.com' } };
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error,
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('multipleDownload.errorDifferentAccount');
      expect(errorType).toBe(ErrorType.INCORRECT_UPLOADED_ACCOUNT);
    });

    it('should return access denied for close popup error', () => {
      mockGoogleDriveError.isClosePopUpError.mockReturnValue(true);
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error: new Error('Popup closed'),
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('openDrive.accessDenied');
      expect(errorType).toBe(ErrorType.ACCESS_DENIED);
    });

    it('should return access denied for access denied error', () => {
      mockGoogleDriveError.isAccessDeniedError.mockReturnValue(true);
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error: new Error('Access denied'),
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('openDrive.accessDenied');
      expect(errorType).toBe(ErrorType.ACCESS_DENIED);
    });

    it('should return default error message for unknown errors', () => {
      const { result } = renderHook(() => useHandleError());
      const error = new Error('Some unknown error');
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error,
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('Some unknown error');
      expect(errorType).toBe(ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS);
    });

    it('should handle error without message', () => {
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getGoogleDriveErrorMessage({
        error: {} as Error,
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('');
      expect(errorType).toBe(ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS);
    });
  });

  describe('getOneDriveErrorMessage', () => {
    const createOneDriveError = () => ({
      errors: [{ error: { code: 'test', message: 'test' } }],
    });

    it('should return access denied for close popup error', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(true),
        isPopupBlockedError: jest.fn().mockReturnValue(false),
        isFileNotFound: jest.fn().mockReturnValue(false),
        isAccessDenied: jest.fn().mockReturnValue(false),
        isAuthenticationError: jest.fn().mockReturnValue(false),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: '', errorCode: '', statusCode: 0 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('openDrive.accessDenied');
      expect(errorType).toBe(ErrorType.ACCESS_DENIED);
    });

    it('should return popup blocked error', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(false),
        isPopupBlockedError: jest.fn().mockReturnValue(true),
        isFileNotFound: jest.fn().mockReturnValue(false),
        isAccessDenied: jest.fn().mockReturnValue(false),
        isAuthenticationError: jest.fn().mockReturnValue(false),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: '', errorCode: '', statusCode: 0 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('openDrive.popupBrowserBlocked');
      expect(errorType).toBe(ErrorType.BLOCK_POPUP);
    });

    it('should return file not found error', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(false),
        isPopupBlockedError: jest.fn().mockReturnValue(false),
        isFileNotFound: jest.fn().mockReturnValue(true),
        isAccessDenied: jest.fn().mockReturnValue(false),
        isAuthenticationError: jest.fn().mockReturnValue(false),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: '', errorCode: '', statusCode: 0 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('multipleDownload.documentDeletedOrAccessRevoked');
      expect(errorType).toBe(ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS);
    });

    it('should return different account error for access denied', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(false),
        isPopupBlockedError: jest.fn().mockReturnValue(false),
        isFileNotFound: jest.fn().mockReturnValue(false),
        isAccessDenied: jest.fn().mockReturnValue(true),
        isAuthenticationError: jest.fn().mockReturnValue(false),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: '', errorCode: '', statusCode: 0 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('multipleDownload.errorDifferentAccount');
      expect(errorType).toBe(ErrorType.INCORRECT_UPLOADED_ACCOUNT);
    });

    it('should return different account error for authentication error', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(false),
        isPopupBlockedError: jest.fn().mockReturnValue(false),
        isFileNotFound: jest.fn().mockReturnValue(false),
        isAccessDenied: jest.fn().mockReturnValue(false),
        isAuthenticationError: jest.fn().mockReturnValue(true),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: '', errorCode: '', statusCode: 0 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toContain('multipleDownload.errorDifferentAccount');
      expect(errorType).toBe(ErrorType.INCORRECT_UPLOADED_ACCOUNT);
    });

    it('should return default error for unknown errors', () => {
      MockOneDriveErrorUtils.mockImplementation(() => ({
        isClosePopUpError: jest.fn().mockReturnValue(false),
        isPopupBlockedError: jest.fn().mockReturnValue(false),
        isFileNotFound: jest.fn().mockReturnValue(false),
        isAccessDenied: jest.fn().mockReturnValue(false),
        isAuthenticationError: jest.fn().mockReturnValue(false),
        isInvalidRequestError: jest.fn().mockReturnValue(false),
        getErrorData: { errorMessage: 'Unknown error', errorCode: 'UNKNOWN', statusCode: 500 },
      } as any));
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getOneDriveErrorMessage({
        error: createOneDriveError() as any,
        doc: mockDoc,
      });
      
      expect(errorMessage).toBe('Unknown error');
      expect(errorType).toBe(ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS);
    });
  });

  describe('getDropboxErrorMessage', () => {
    it('should return file not found error', () => {
      mockDropboxError.isFileNotFoundError.mockReturnValue(true);
      
      const error = new Error('File not found');
      (error as any).response = { data: { error: 'path/not_found' } };
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getDropboxErrorMessage({ error });
      
      expect(errorMessage).toContain('multipleDownload.documentDeletedOrAccessRevoked');
      expect(errorType).toBe(ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS);
    });

    it('should return default error for unknown errors', () => {
      mockDropboxError.isFileNotFoundError.mockReturnValue(false);
      
      const error = new Error('Some dropbox error');
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getDropboxErrorMessage({ error });
      
      expect(errorMessage).toBe('Some dropbox error');
      expect(errorType).toBe(ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS);
    });

    it('should return translated error when error message is empty', () => {
      mockDropboxError.isFileNotFoundError.mockReturnValue(false);
      
      const error = {} as Error;
      
      const { result } = renderHook(() => useHandleError());
      const { errorMessage, errorType } = result.current.getDropboxErrorMessage({ error });
      
      expect(errorMessage).toBe('common.somethingWentWrong');
      expect(errorType).toBe(ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS);
    });
  });

  describe('hook return value', () => {
    it('should return all error handler functions', () => {
      const { result } = renderHook(() => useHandleError());
      
      expect(typeof result.current.getGoogleDriveErrorMessage).toBe('function');
      expect(typeof result.current.getOneDriveErrorMessage).toBe('function');
      expect(typeof result.current.getDropboxErrorMessage).toBe('function');
    });
  });
});

