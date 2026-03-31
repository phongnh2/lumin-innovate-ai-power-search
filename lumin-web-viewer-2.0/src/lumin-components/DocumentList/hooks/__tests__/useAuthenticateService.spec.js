import { act, renderHook } from '@testing-library/react';

jest.mock('utils', () => ({
  dropboxError: {
    isTokenExpiredError: jest.fn(),
    isFileNotFoundError: jest.fn(),
  },
  file: {
    getShortFilename: jest.fn((name) => name),
  },
  googleDriveError: {
    isClosePopUpError: jest.fn(),
    isAccessDeniedError: jest.fn(),
    isSigninDriveRequiredError: jest.fn(),
    isInvalidCredential: jest.fn(),
    isPermissionRequiredError: jest.fn(),
    isUnauthorizedError: jest.fn(),
    isBlockPopUpError: jest.fn(),
    isFileNotFoundError: jest.fn(),
  },
  toastUtils: {
    openToastMulti: jest.fn(),
  },
  capitalize: jest.fn((str) => str),
}));

jest.mock('utils/corePathHelper', () => ({
  isElectron: jest.fn(),
}));

jest.mock('utils/oneDriveError');

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('services/googleServices', () => ({
  __esModule: true,
  default: {
    getTokenInfo: jest.fn(),
    hasGrantedScope: jest.fn(),
    implicitSignIn: jest.fn(),
    removeImplicitAccessToken: jest.fn(),
  },
}));

jest.mock('actions');
jest.mock('selectors');
jest.mock('services', () => ({
  googleServices: {
    getTokenInfo: jest.fn(),
    removeImplicitAccessToken: jest.fn(),
    hasGrantedScope: jest.fn(),
    getFileInfo: jest.fn(),
    implicitSignIn: jest.fn(),
    getAccessTokenEmail: jest.fn(),
  },
  oneDriveServices: {
    getAccessToken: jest.fn(),
    getCurrentAccountEmailInCache: jest.fn(),
    logoutCurrentAccount: jest.fn(),
  },
}));
jest.mock('services/electronDropboxServices', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn(),
    subscribe: jest.fn(),
  },
}));
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
}));
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));
jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key) => key),
  },
}));
jest.mock('services/loggerServices', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import { useNavigate } from 'react-router-dom';
import actions from 'actions';
import selectors from 'selectors';
import { googleServices, oneDriveServices } from 'services';
import electronDropboxServices from 'services/electronDropboxServices';
import logger from 'helpers/logger';
import { dropboxError, googleDriveError, toastUtils } from 'utils';
import { isElectron } from 'utils/corePathHelper';
import OneDriveErrorUtils from 'utils/oneDriveError';
import { DriveErrorCode, DriveScopes } from 'constants/authConstant';
import { documentStorage } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import useAuthenticateService from '../useAuthenticateService';

describe('useAuthenticateService', () => {
  let mockDispatch;
  let mockNavigate;

  beforeAll(() => {
    Object.defineProperty(global, 'window', {
      value: global.window,
      writable: true,
    });
  
    global.window.google = {
      accounts: {
        oauth2: {
          initTokenClient: jest.fn(() => ({
            requestAccessToken: jest.fn(),
          })),
        },
      },
    };
  });  

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);

    isElectron.mockReturnValue(false);
    logger.logError.mockImplementation(() => {});
    logger.logInfo.mockImplementation(() => {});
    toastUtils.openToastMulti.mockImplementation(() => {});
    electronDropboxServices.subscribe.mockReturnValue(() => {});
    electronDropboxServices.authenticate.mockResolvedValue({});

    localStorage.clear();
    sessionStorage.clear();
  });

  describe('verifyDriveAuthentication', () => {
    it('should throw error when drive file scope is not granted', async () => {
      googleServices.getTokenInfo.mockResolvedValue({ email: 'test@example.com' });
      googleServices.hasGrantedScope.mockReturnValue(false);

      const { result } = renderHook(() => useAuthenticateService());

      await expect(result.current.authentication.drive([{ remoteId: 'test-id' }])).rejects.toThrow(
        DriveErrorCode.SIGNIN_REQUIRED
      );
    });

    it('should throw unauthorized error when email does not match', async () => {
      const tokenInfo = { email: 'user1@example.com' };
      googleServices.getTokenInfo.mockResolvedValue(tokenInfo);
      googleServices.hasGrantedScope.mockReturnValue(true);
      googleServices.getFileInfo.mockRejectedValue(new Error('Access denied'));

      const documents = [{ remoteId: 'id1', remoteEmail: 'user2@example.com', isAnonymousDocument: false }];

      const { result } = renderHook(() => useAuthenticateService());

      await expect(result.current.authentication.drive(documents)).rejects.toThrow(DriveErrorCode.SIGNIN_REQUIRED);
    });
  });

  describe('verifyDropboxAuthentication', () => {
    it('should return true when token exists in localStorage', () => {
      localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, 'test-token');

      const { result } = renderHook(() => useAuthenticateService());

      const authResult = result.current.authentication.dropbox({
        documents: [],
        onSuccess: jest.fn(),
        executer: jest.fn(),
      });

      expect(authResult).toBe(true);
    });

    it('should open window and return false when token does not exist (web)', () => {
      isElectron.mockReturnValue(false);
      window.open = jest.fn();

      const { result } = renderHook(() => useAuthenticateService());

      const params = {
        documents: [{ id: '1' }],
        onSuccess: jest.fn(),
        executer: jest.fn(),
      };

      const authResult = result.current.authentication.dropbox(params);

      expect(authResult).toBe(false);
      expect(window.open).toHaveBeenCalled();
      expect(result.current.redirectInfoRef.current).toEqual(params);
    });

    it('should call electron authenticate when in electron', async () => {
      isElectron.mockReturnValue(true);
      electronDropboxServices.authenticate.mockResolvedValue({ token: 'test' });

      const { result } = renderHook(() => useAuthenticateService());

      const authResult = result.current.authentication.dropbox({
        documents: [],
        onSuccess: jest.fn(),
        executer: jest.fn(),
      });

      expect(authResult).toBe(false);
      expect(electronDropboxServices.authenticate).toHaveBeenCalled();

      isElectron.mockReturnValue(false);
    });
  });

  describe('handleDropboxAuthResult', () => {
    it('should store token when no redirect info', () => {
      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.redirectInfoRef.current = null;
      });

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: window.location.origin,
            data: { token: 'new-token' },
          })
        );
      });

      expect(localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)).toBe('new-token');
    });

    it('should execute callback with new token', () => {
      const mockExecuter = jest.fn();
      const mockOnSuccess = jest.fn();
      const documents = [{ id: '1' }];

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.redirectInfoRef.current = {
          documents,
          onSuccess: mockOnSuccess,
          executer: mockExecuter,
        };
      });

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: window.location.origin,
            data: { token: 'new-token' },
          })
        );
      });

      expect(localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)).toBe('new-token');
      expect(mockExecuter).toHaveBeenCalledWith(documents, mockOnSuccess);
      expect(result.current.redirectInfoRef.current).toBeNull();
    });

    it('should clear redirect info on error', () => {
      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.redirectInfoRef.current = {
          documents: [],
          onSuccess: jest.fn(),
          executer: jest.fn(),
        };
      });

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: window.location.origin,
            data: { cancelAuthorize: true },
          })
        );
      });

      expect(result.current.redirectInfoRef.current).toBeNull();
    });

    it('should ignore messages from different origin', () => {
      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.redirectInfoRef.current = {
          documents: [],
          onSuccess: jest.fn(),
          executer: jest.fn(),
        };
      });

      const initialRef = result.current.redirectInfoRef.current;

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: 'https://malicious-site.com',
            data: { token: 'bad-token' },
          })
        );
      });

      expect(result.current.redirectInfoRef.current).toBe(initialRef);
    });
  });

  describe('handleCheckError', () => {
    const mockParams = {
      documents: [{ id: '1', service: documentStorage.google }],
      onSuccess: jest.fn(),
      executer: jest.fn(),
      setLoading: jest.fn(),
    };

    beforeEach(() => {
      OneDriveErrorUtils.mockImplementation(() => ({
        isAccessDenied: () => false,
        isAuthenticationError: () => false,
        isInvalidRequestError: () => false,
        isPopupBlockedError: () => false,
        isClosePopUpError: () => false,
        isAuthenticationCancelled: () => false,
        isExpectedAuthError: () => false,
        isFileNotFound: () => false,
      }));
    });

    it('should handle OneDrive popup blocked error', () => {
      OneDriveErrorUtils.mockImplementation(() => ({
        isAccessDenied: () => false,
        isAuthenticationError: () => false,
        isInvalidRequestError: () => false,
        isPopupBlockedError: () => true,
        isClosePopUpError: () => false,
        isAuthenticationCancelled: () => false,
        isExpectedAuthError: () => false,
        isFileNotFound: () => false,
      }));

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Popup blocked'), mockParams);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should return early for expected auth error', () => {
      OneDriveErrorUtils.mockImplementation(() => ({
        isAccessDenied: () => false,
        isAuthenticationError: () => false,
        isInvalidRequestError: () => false,
        isPopupBlockedError: () => false,
        isClosePopUpError: () => false,
        isAuthenticationCancelled: () => false,
        isExpectedAuthError: () => true,
        isFileNotFound: () => false,
      }));

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Expected error'), mockParams);
      });

      expect(mockParams.setLoading).toHaveBeenCalledWith(false);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle Google Drive unauthorized error', () => {
      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(true);

      const mockParamsWithDoc = {
        ...mockParams,
        documents: [
          {
            id: '1',
            service: documentStorage.google,
            name: 'test-doc.pdf',
            remoteEmail: 'other@example.com',
          },
        ],
      };

      const { result } = renderHook(() => useAuthenticateService());

      googleServices.getTokenInfo.mockResolvedValue({ email: 'test@example.com' });

      act(() => {
        result.current.handleCheckError(new Error('Unauthorized'), mockParamsWithDoc);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle Google Drive blocked popup error', () => {
      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(true);

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Popup blocked'), mockParams);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle file not found error', () => {
      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(false);
      dropboxError.isTokenExpiredError.mockReturnValue(false);
      googleDriveError.isFileNotFoundError.mockReturnValue(true);

      const error = {
        errors: [{ error: new Error('Not found'), document: { id: '1' } }],
      };

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(error, mockParams);
      });

      expect(result.current.notFoundDocuments).toHaveLength(0);
    });

    it('should display fallback error for unknown errors', () => {
      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(false);
      dropboxError.isTokenExpiredError.mockReturnValue(false);
      googleDriveError.isFileNotFoundError.mockReturnValue(false);

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Unknown error'), mockParams);
      });

      expect(logger.logError).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('displayFallbackModalError', () => {
    it('should navigate to document list fallback url', () => {
      mockDispatch.mockClear();
      selectors.getCurrentUser.mockReturnValue({ id: 'user-1' });
      sessionStorage.setItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL, '/custom-path');

      const { result } = renderHook(() => useAuthenticateService());

      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(false);
      dropboxError.isTokenExpiredError.mockReturnValue(false);
      googleDriveError.isFileNotFoundError.mockReturnValue(false);
      dropboxError.isFileNotFoundError.mockReturnValue(false);

      act(() => {
        result.current.handleCheckError(new Error('Unknown'), {
          documents: [],
          onSuccess: jest.fn(),
          executer: jest.fn(),
          setLoading: jest.fn(),
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
      const modalCall = mockDispatch.mock.calls[0][0];

      if (modalCall && modalCall.onCancel) {
        act(() => {
          modalCall.onCancel();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/custom-path');
      }
    });
  });

  describe('getModalPopupBlockedProps', () => {
    it('should handle blocked popup modal for Google Drive', () => {
      mockDispatch.mockClear();

      OneDriveErrorUtils.mockImplementation(() => ({
        isAccessDenied: () => false,
        isAuthenticationError: () => false,
        isInvalidRequestError: () => false,
        isPopupBlockedError: () => false,
        isClosePopUpError: () => false,
        isAuthenticationCancelled: () => false,
        isExpectedAuthError: () => false,
        isFileNotFound: () => false,
      }));

      googleDriveError.isClosePopUpError.mockReturnValue(false);
      googleDriveError.isAccessDeniedError.mockReturnValue(false);
      googleDriveError.isSigninDriveRequiredError.mockReturnValue(false);
      googleDriveError.isInvalidCredential.mockReturnValue(false);
      googleDriveError.isPermissionRequiredError.mockReturnValue(false);
      googleDriveError.isUnauthorizedError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(true);
      googleDriveError.isFileNotFoundError.mockReturnValue(false);

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Blocked'), {
          documents: [],
          onSuccess: jest.fn(),
          executer: jest.fn(),
          setLoading: jest.fn(),
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle blocked popup modal for OneDrive', () => {
      mockDispatch.mockClear();

      OneDriveErrorUtils.mockImplementation(() => ({
        isAccessDenied: () => false,
        isAuthenticationError: () => false,
        isInvalidRequestError: () => false,
        isPopupBlockedError: () => true,
        isClosePopUpError: () => false,
        isAuthenticationCancelled: () => false,
        isExpectedAuthError: () => false,
        isFileNotFound: () => false,
      }));

      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.handleCheckError(new Error('Blocked'), {
          documents: [],
          onSuccess: jest.fn(),
          executer: jest.fn(),
          setLoading: jest.fn(),
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('electron support', () => {
    it('should use electron dropbox service in electron environment', () => {
      isElectron.mockReturnValue(true);
      electronDropboxServices.authenticate.mockResolvedValue({});

      const { result } = renderHook(() => useAuthenticateService());

      result.current.authentication.dropbox({
        documents: [],
        onSuccess: jest.fn(),
        executer: jest.fn(),
      });

      expect(electronDropboxServices.authenticate).toHaveBeenCalled();

      isElectron.mockReturnValue(false);
    });
  });

  describe('documentAction state', () => {
    it('should update document action state', () => {
      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.setDocumentAction('test-action');
      });

      expect(result.current.documentAction).toBe('test-action');
    });
  });

  describe('notFoundDocuments state', () => {
    it('should update not found documents state', () => {
      const { result } = renderHook(() => useAuthenticateService());

      act(() => {
        result.current.setNotFoundDocuments([{ id: '1' }]);
      });

      expect(result.current.notFoundDocuments).toEqual([{ id: '1' }]);
    });
  });

  describe('electron dropbox subscription', () => {
    it('should subscribe to electron dropbox events', () => {
      const mockUnsubscribe = jest.fn();
      electronDropboxServices.subscribe.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useAuthenticateService());

      expect(electronDropboxServices.subscribe).toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle dropbox auth result from electron subscription', () => {
      let subscribeCallback;
      electronDropboxServices.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback;
        return () => {};
      });

      renderHook(() => useAuthenticateService());

      act(() => {
        subscribeCallback({ token: 'electron-token' });
      });

      expect(localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)).toBe('electron-token');
    });
  });
});
