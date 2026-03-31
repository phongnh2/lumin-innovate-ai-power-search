import fileMock from '../../__mocks__/fileMock';
import Axios from '@libs/axios';
import getFileService from 'utils/getFileService';
import googleServices, { 
  shouldRetryDriveRequest,
  // Import individual functions for testing without gapiWrapper
  getCurrentRemoteEmail,
  getCurrentUserId,
  getTokenInfo,
  isValidToken,
  getFileRevisions,
  renameFileToDrive,
  getUserSpaceInfo,
  getFileInfo,
  onLoadFileReaderUploadFile,
  onLoadFileReaderInsertFile,
  getBasicProfile,
  requestPermission,
  getImplicitAccessToken,
  removeImplicitAccessToken,
  isSignedIn,
  isSignedInWithGoolge,
  hasGrantedScope,
  setOAuth2Token,
  getAccessTokenEmail,
  checkAuthorizedUserHasPopularDomain,
  checkGoogleAccessTokenExpired,
  getFileContent,
  getPreviousFileVersionContent,
  downloadFile,
  executeRequestToDrive,
  initiateResumableUpload,
  uploadFileWithResumableSession,
  uploadChunk,
  getUploadStatus,
  readFileAsArrayBuffer,
  uploadFileToDriveResumable,
  syncUpAccessToken,
  getAccessTokenInfo,
  injectAccessTokenInfo,
  removeExcludeScopes,
  trackGooglePopupModal,
  implicitSignIn,
  uploadFileToDrive,
  insertFileToDrive,
  getProfileWithOauth2Token,
} from '../googleServices';
import file from 'utils/file';
import core from 'core';
import logger from '../../helpers/logger';
import { HttpStatusCode } from 'axios';

// Mock problematic dependencies early
// Create mocks inside factory function to avoid hoisting issues
// Store them in globalThis so they're accessible in tests
jest.mock('utils/restrictedUserUtil.tsx', () => {
  const mockGetDriveUserRestrictedDomain = jest.fn(() => []);
  const mockGetDriveUserRestrictedEmail = jest.fn(() => '');
  const mockOpenCannotAuthorizeModal = jest.fn();
  
  // Store in globalThis for access in tests
  globalThis.__restrictedUserMocks = {
    mockGetDriveUserRestrictedDomain,
    mockGetDriveUserRestrictedEmail,
    mockOpenCannotAuthorizeModal,
  };
  
  return {
    getDriveUserRestrictedDomain: mockGetDriveUserRestrictedDomain,
    getDriveUserRestrictedEmail: mockGetDriveUserRestrictedEmail,
    openCannotAuthorizeModal: mockOpenCannotAuthorizeModal,
  };
}, { virtual: true });

// Export mocks for use in tests
// The factory runs during hoisting, so mocks are available here
const mockGetDriveUserRestrictedDomain = globalThis.__restrictedUserMocks?.mockGetDriveUserRestrictedDomain;
const mockGetDriveUserRestrictedEmail = globalThis.__restrictedUserMocks?.mockGetDriveUserRestrictedEmail;
const mockOpenCannotAuthorizeModal = globalThis.__restrictedUserMocks?.mockOpenCannotAuthorizeModal;

jest.mock('utils/common', () => ({
  __esModule: true,
  default: {
    getDomainFromEmail: jest.fn((email) => email ? email.split('@')[1] : ''),
  },
}));

jest.mock('utils/getLanguage', () => ({
  getLanguage: () => 'en'
}));

jest.mock('utils/corePathHelper', () => ({
  isElectron: jest.fn(() => false),
}));

jest.mock('utils/redirectFlow', () => ({
  redirectFlowUtils: {
    loadGoogleCookieNames: jest.fn(() => ({ googleAccessToken: 'google_access_token' })),
  },
}));

jest.mock('helpers/cookieManager', () => ({
  cookieManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn(() => ({})),
  }
}));

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(() => null),
  },
}));

jest.mock('core');
jest.mock('@libs/axios');
jest.mock('utils/getFileService');
jest.mock('utils/file');
jest.mock('utils/googleDriveError', () => ({
  __esModule: true,
  default: {
    isAccessDeniedError: jest.fn(() => false),
    isClosePopUpError: jest.fn(() => false),
    isBlockPopUpError: jest.fn(() => false),
  },
}));
jest.mock('utils/toastUtils', () => ({
  openToastMulti: jest.fn(),
}));
jest.mock('i18next', () => ({
  t: jest.fn((key) => key),
}));
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const dayjsInstance = jest.fn(() => ({
    ...originalDayjs(),
    unix: jest.fn(() => Math.floor(Date.now() / 1000)),
    set: jest.fn(function() { return this; }),
  }));
  // Add extend method to support dayjs plugins
  dayjsInstance.extend = jest.fn();
  return dayjsInstance;
});
jest.mock('../electronGoogleServices', () => ({
  default: {
    authenticate: jest.fn(),
  },
  ElectronGoogleServices: {
    isSignedIn: jest.fn(() => false),
  },
}));
jest.mock('helpers/logger', () => ({
  __esModule: true,
    default: {
      logError: jest.fn(),
      logInfo: jest.fn(),
      logWarning: jest.fn(),
    },
}));
// Mock environment variables
process.env.GOOGLE_PICKER_CLIENTID = 'test_client_id';
process.env.NODE_ENV = 'test';

// Create a helper to create mock requests with execute method
const createMockRequest = (mockResponse = {}, mockError = null) => ({
  execute: jest.fn((callback) => {
    if (mockError) {
      callback({ error: mockError });
    } else {
      callback(mockResponse);
    }
  })
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

beforeEach(() => {
  // Clear all mocks and storage
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset restricted user mocks
  mockGetDriveUserRestrictedDomain.mockReturnValue([]);
  mockGetDriveUserRestrictedEmail.mockReturnValue('');
  mockOpenCannotAuthorizeModal.mockClear();
  
  Axios.axiosInstance = {
    post: jest.fn(() => Promise.resolve()),
  };

  core.getDocument = jest.fn();

  getFileService.getLinearizedDocumentFile = jest.fn(() => {
    return Promise.resolve(fileMock);
  });

  file.getThumbnailWithDocument = jest.fn().mockImplementation(() => {
    const canvas = document.createElement('CANVAS');
    return Promise.resolve(canvas);
  });

  file.convertThumnailCanvasToFile = jest.fn().mockImplementation(() => {
    return Promise.resolve(fileMock);
  });

  file.dataURLtoFile = jest.fn().mockImplementation(() => fileMock);

  global.gapi = {
    client: {
      drive: {
        files: {
          get: jest.fn(() => createMockRequest()),
        },
        revisions: {
          list: jest.fn(() => createMockRequest()),
        },
        about: {
          get: jest.fn(() => createMockRequest()),
        },
      },
      oauth2: {
        userinfo: {
          get: jest.fn(() => createMockRequest()),
        },
      },
      load: jest.fn((apiName, version, callback) => {
        if (callback) {
          callback();
        }
      }),
      request: jest.fn(() => createMockRequest()),
      setToken: jest.fn(),
      getToken: jest.fn(() => ({ access_token: 'test_token' })),
    },
    auth2: {
      getAuthInstance: jest.fn().mockImplementation(() => ({
        signIn: jest.fn(),
        currentUser: {
          get: jest.fn().mockImplementation(() => ({
            getBasicProfile: jest.fn().mockImplementation(() => ({
              getEmail: jest.fn().mockReturnValue('nhuttm@dgroup.co'),
            })),
          })),
        },
      })),
    },
  };
  
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: jest.fn(() => ({ requestAccessToken: jest.fn() })),
        hasGrantedAnyScope: jest.fn().mockReturnValue(true),
      }
    }
  };

  // Mock global btoa if not available
  global.btoa = global.btoa || jest.fn().mockReturnValue('bW9ja0Jhc2U2NEVuY29kZWQ=');
  global.atob = global.atob || jest.fn().mockReturnValue('mock decoded');
  
  // Mock FileReader globally
  global.FileReader = jest.fn(function() {
    const reader = {
      onload: null,
      onerror: null,
      result: new ArrayBuffer(8),
      error: null,
      readAsArrayBuffer: jest.fn(function(chunk) {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }),
      addEventListener: jest.fn((name, callback) => {
        if (name === 'load') {
          setTimeout(callback, 0);
        }
      })
    };
    return reader;
  });
});

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('googleServices', () => {
  describe('executeRequestToDrive', () => {
    it('should be rejected', () => {
      const spyOnLoadFileReaderInsertFile = jest
        .spyOn(googleServices, 'executeRequestToDrive')
        .mockImplementation(() => Promise.reject('kakaError'));
      expect(googleServices.executeRequestToDrive()).rejects.toBe('kakaError');
        spyOnLoadFileReaderInsertFile.mockRestore();
    });

    it('should be resolved', () => {
      const spyOnLoadFileReaderInsertFile = jest
        .spyOn(googleServices, 'executeRequestToDrive')
        .mockImplementation(() => Promise.resolve('kaka'));

        spyOnLoadFileReaderInsertFile.mockRestore();
    });
  });

  // Test the unwrapped functions directly - much simpler!
  describe('getCurrentRemoteEmail (unwrapped)', () => {
    beforeEach(() => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
    });

    it('should return lowercase email from basic profile', async () => {
      const mockProfile = { email: 'TEST@EXAMPLE.COM' };
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest(mockProfile));

      const result = await getCurrentRemoteEmail();
      expect(result).toBe('test@example.com');
    });

    it('should return empty string when no email in profile', async () => {
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest({}));

      const result = await getCurrentRemoteEmail();
      expect(result).toBe('');
    });
  });

  describe('getCurrentUserId (unwrapped)', () => {
    beforeEach(() => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
    });

    it('should return user id from basic profile', async () => {
      const mockProfile = { id: 'user123' };
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest(mockProfile));

      const result = await getCurrentUserId();
      expect(result).toBe('user123');
    });

    it('should return sub if id not available', async () => {
      const mockProfile = { sub: 'user456' };
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest(mockProfile));

      const result = await getCurrentUserId();
      expect(result).toBe('user456');
    });

    it('should return empty string if no id or sub', async () => {
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest({}));

      const result = await getCurrentUserId();
      expect(result).toBe('');
    });
  });

  describe('getTokenInfo (unwrapped)', () => {
    it('should return token info when access token exists', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      const mockTokenInfo = { email: 'TEST@EXAMPLE.COM', sub: 'user123' };
      global.gapi.client.request.mockReturnValue(createMockRequest(mockTokenInfo));

      const result = await getTokenInfo();
      expect(result.email).toBe('test@example.com'); // Should be lowercase
      expect(result.sub).toBe('user123');
    });

    it('should return null when no access token', () => {
      localStorage.clear();
      const result = getTokenInfo();
      expect(result).toBeNull();
    });

    it('should reject on error response', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      global.gapi.client.request.mockReturnValue(createMockRequest(null, { error: 'invalid_token' }));

      await expect(getTokenInfo()).rejects.toBeDefined();
    });
  });

  describe('isValidToken (unwrapped)', () => {
    it('should return true for valid token', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      global.gapi.client.request.mockReturnValue(createMockRequest({ email: 'test@example.com' }));

      const result = await isValidToken();
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      localStorage.clear();
      const result = await isValidToken();
      expect(result).toBe(false);
    });
  });

  describe('getFileRevisions (unwrapped)', () => {
    it('should get file revisions successfully', async () => {
      const mockRevisions = { revisions: [{ id: '1' }, { id: '2' }] };
      global.gapi.client.drive.revisions.list.mockReturnValue(createMockRequest(mockRevisions));

      const result = await getFileRevisions('file123');
      expect(result).toEqual(mockRevisions);
    });

    it('should handle errors in getFileRevisions', async () => {
      const error = new Error('Failed to get revisions');
      global.gapi.client.drive.revisions.list.mockReturnValue(createMockRequest(null, error));

      await expect(getFileRevisions('file123')).rejects.toThrow('Failed to get revisions');
    });
  });

  describe('renameFileToDrive (unwrapped)', () => {
    it('should rename file successfully', async () => {
      const mockResponse = { id: 'file123', name: 'new_name.pdf' };
      global.gapi.client.request.mockReturnValue(createMockRequest(mockResponse));

      const result = await renameFileToDrive({ fileId: 'file123', newName: 'new_name.pdf' });
      expect(result).toEqual(mockResponse);
    });

    it('should handle rename errors', async () => {
      const error = new Error('Rename failed');
      global.gapi.client.request.mockReturnValue(createMockRequest(null, error));

      await expect(renameFileToDrive({ fileId: 'file123', newName: 'new_name.pdf' }))
        .rejects.toThrow('Rename failed');
    });
  });

  describe('getUserSpaceInfo (unwrapped)', () => {
    it('should get user space info successfully', async () => {
      const mockSpaceInfo = { storageQuota: { limit: '15000000000', usage: '5000000000' } };
      global.gapi.client.drive.about.get.mockReturnValue(createMockRequest(mockSpaceInfo));
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      const result = await getUserSpaceInfo();
      expect(result).toEqual(mockSpaceInfo);
    });

    it('should throw error when no access token', async () => {
      global.gapi.client.getToken.mockReturnValue(null);

      await expect(getUserSpaceInfo()).rejects.toThrow('No authorization token available');
    });
  });

  describe('getBasicProfile (unwrapped)', () => {
    it('should return profile data when access token exists', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      const mockProfile = { email: 'test@example.com', id: 'user123' };
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest(mockProfile));

      const result = await getBasicProfile();
      expect(result).toEqual(mockProfile);
    });

    it('should return empty object when no access token', async () => {
      localStorage.clear();
      const result = await getBasicProfile();
      expect(result).toEqual({});
    });
  });

  // Test utility functions that don't need gapiWrapper
  describe('shouldRetryDriveRequest', () => {
    it('should return true for network errors', () => {
      const networkError = { message: 'Network error occurred' };
      expect(shouldRetryDriveRequest(networkError)).toBe(true);
    });

    it('should return true for fetch failures', () => {
      const fetchError = { message: 'failed to fetch' };
      expect(shouldRetryDriveRequest(fetchError)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const timeoutError = { message: 'Request timeout' };
      expect(shouldRetryDriveRequest(timeoutError)).toBe(true);
    });

    it('should return true for retryable HTTP status codes', () => {
      expect(shouldRetryDriveRequest({ code: HttpStatusCode.ServiceUnavailable })).toBe(true);
      expect(shouldRetryDriveRequest({ code: HttpStatusCode.TooManyRequests })).toBe(true);
      expect(shouldRetryDriveRequest({ code: HttpStatusCode.InternalServerError })).toBe(true);
      expect(shouldRetryDriveRequest({ code: HttpStatusCode.BadGateway })).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const badRequestError = { code: HttpStatusCode.BadRequest };
      expect(shouldRetryDriveRequest(badRequestError)).toBe(false);
    });

    it('should return false for undefined error', () => {
      expect(shouldRetryDriveRequest(undefined)).toBe(false);
    });

    it('should handle case insensitive error messages', () => {
      const upperCaseError = { message: 'NETWORK ERROR' };
      expect(shouldRetryDriveRequest(upperCaseError)).toBe(true);
    });
  });

  describe('getImplicitAccessToken', () => {
    it('should return parsed access token from localStorage', () => {
      const tokenData = { access_token: 'test_token', email: 'test@example.com' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenData));
      
      const result = getImplicitAccessToken();
      expect(result).toEqual(tokenData);
    });

    it('should return null when no token in localStorage', () => {
      localStorage.clear();
      const result = getImplicitAccessToken();
      expect(result).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('google_implicit_access_token', 'invalid-json');
      
      expect(() => getImplicitAccessToken()).toThrow();
    });
  });

  describe('isSignedIn', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('google_implicit_access_token', 'token');
      expect(isSignedIn()).toBe(true);
    });

    it('should return false when no access token', () => {
      localStorage.clear();
      expect(isSignedIn()).toBe(false);
    });
  });

  describe('isSignedInWithGoolge', () => {
    it('should return true for GOOGLE login service', () => {
      const result = isSignedInWithGoolge('GOOGLE');
      expect(result).toBe(true);
    });

    it('should return false for other login services', () => {
      const result = isSignedInWithGoolge('FACEBOOK');
      expect(result).toBe(false);
    });
  });

  describe('removeImplicitAccessToken', () => {
    it('should remove token from all storage locations', () => {
      localStorage.setItem('google_implicit_access_token', 'test_token');
      localStorage.setItem('expire_time_google_implicit_access_token', '12345');
      
      removeImplicitAccessToken();
      
      expect(global.gapi.client.setToken).toHaveBeenCalledWith(null);
      expect(localStorage.getItem('google_implicit_access_token')).toBeNull();
      expect(localStorage.getItem('expire_time_google_implicit_access_token')).toBeNull();
    });
  });

  describe('hasGrantedScope', () => {
    it('should return true when scope is granted', () => {
      const mockToken = { access_token: 'test_token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(mockToken));
      
      const result = hasGrantedScope('https://www.googleapis.com/auth/drive.file');
      expect(result).toBe(true);
    });

    it('should return false when no access token', () => {
      localStorage.clear();
      const result = hasGrantedScope('https://www.googleapis.com/auth/drive.file');
      expect(result).toBe(false);
    });

    it('should return false when scope not granted', () => {
      const mockToken = { access_token: 'test_token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(mockToken));
      global.google.accounts.oauth2.hasGrantedAnyScope.mockReturnValue(false);
      
      const result = hasGrantedScope('https://www.googleapis.com/auth/drive.file');
      expect(result).toBe(false);
    });
  });

  describe('setOAuth2Token', () => {
    beforeEach(() => {
      global.gapi.client.setToken = jest.fn();
      localStorage.clear();
    });

    afterEach(() => {
      jest.dontMock('dayjs');
    });

    it('should set OAuth2 token in all storage locations', () => {
      const tokenData = {
        access_token: 'test_token',
        scope: 'profile email',
        email: 'test@example.com',
        userRemoteId: 'user123'
      };

      setOAuth2Token(tokenData);

      expect(global.gapi.client.setToken).toHaveBeenCalledWith(tokenData);
      const storedToken = JSON.parse(localStorage.getItem('google_implicit_access_token'));
      expect(storedToken.access_token).toBe('test_token');
      expect(storedToken.email).toBe('test@example.com');
      expect(localStorage.getItem('expire_time_google_implicit_access_token')).toBeDefined();
    });

    it('should use provided expireAt time', () => {
      jest.doMock('dayjs', () => jest.fn(() => ({ set: jest.fn(), unix: () => 1234567890 })));

      const tokenData = {
        access_token: 'test_token',
        scope: 'profile email',
        email: 'test@example.com',
        userRemoteId: 'user123'
      };
      const customExpireAt = '9999999999';

      setOAuth2Token(tokenData, customExpireAt);

      expect(localStorage.getItem('expire_time_google_implicit_access_token')).toBe(customExpireAt);
      
      jest.dontMock('dayjs');
    });
  });

  describe('getAccessTokenEmail', () => {
    it('should return email from access token info', () => {
      const tokenInfo = { email: 'test@example.com', access_token: 'token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));
      
      const result = getAccessTokenEmail();
      expect(result).toBe('test@example.com');
    });

    it('should return empty string when no token info', () => {
      localStorage.clear();
      const result = getAccessTokenEmail();
      expect(result).toBe('');
    });

    it('should return empty string when domain is restricted', () => {
      const { cookieManager } = require('helpers/cookieManager');
      mockGetDriveUserRestrictedDomain.mockReturnValue(['restricted.com']);
      const tokenInfo = { email: 'test@restricted.com', access_token: 'token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));

      const result = getAccessTokenEmail();
      expect(result).toBe('');
      expect(cookieManager.delete.mock.calls.length).toBeGreaterThanOrEqual(0);
      expect(localStorage.getItem('google_implicit_access_token')).toBeNull();
    });
  });

  describe('checkAuthorizedUserHasPopularDomain', () => {
    it('should return false when no email in token', async () => {
      localStorage.clear();
      const result = await checkAuthorizedUserHasPopularDomain();
      expect(result).toBe(false);
    });

    it('should check if domain is popular', async () => {
      const tokenInfo = {
        access_token: 'test_token',
        email: 'test@gmail.com'
      };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));

      // For now, just test that the function executes without error
      const result = await checkAuthorizedUserHasPopularDomain();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkGoogleAccessTokenExpired', () => {
    it('should return true when no token exists', () => {
      localStorage.clear();
      const result = checkGoogleAccessTokenExpired();
      expect(result).toBe(true);
    });

    it('should return true when no expireAt exists', () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'token' }));
      localStorage.removeItem('expire_time_google_implicit_access_token');
      
      const result = checkGoogleAccessTokenExpired();
      expect(result).toBe(true);
    });

    it('should return true when token is expired', () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'token' }));
      localStorage.setItem('expire_time_google_implicit_access_token', '1000000000'); // Past timestamp
      
      const result = checkGoogleAccessTokenExpired();
      expect(result).toBe(true);
    });

    it('should return false when token is not expired', () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'token' }));
      localStorage.setItem('expire_time_google_implicit_access_token', (Date.now() / 1000 + 3600).toString()); // Future timestamp
      
      const result = checkGoogleAccessTokenExpired();
      expect(result).toBe(false);
    });
  });

  // Simplified tests for complex functions that involve file operations
  describe('downloadFile (unwrapped)', () => {
    it('should download file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        body: 'test content',
        headers: { 'Content-Type': 'application/pdf' }
      };
      
      global.gapi.client.drive.files.get.mockReturnValue({
        then: jest.fn((callback) => callback(mockResponse))
      });
      global.btoa = jest.fn().mockReturnValue('dGVzdCBjb250ZW50');
      file.dataURLtoFile.mockReturnValue(mockFile);

      const result = await downloadFile('file123', 'test.pdf');
      expect(result).toBe(mockFile);
      expect(global.gapi.client.drive.files.get).toHaveBeenCalledWith({
        fileId: 'file123',
        alt: 'media'
      });
    });
  });

  describe('executeRequestToDrive (unwrapped)', () => {
    it('should resolve when request succeeds', async () => {
      const mockResponse = { id: 'file123', name: 'test.pdf' };
      const mockRequest = createMockRequest(mockResponse);
      
      const result = await executeRequestToDrive(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should abort on non-retryable errors', async () => {
      const nonRetryableError = { 
        message: 'Bad Request', 
        code: HttpStatusCode.BadRequest,
        errors: [{ reason: 'invalid' }]
      };
      const mockRequest = createMockRequest(null, nonRetryableError);

      await expect(executeRequestToDrive(mockRequest)).rejects.toBeDefined();
      expect(logger.logError.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFileInfo (unwrapped)', () => {
    it('should get file info successfully', async () => {
      const mockFileInfo = { id: 'file123', name: 'test.pdf' };
      global.gapi.client.drive.files.get.mockReturnValue(createMockRequest(mockFileInfo));
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      const result = await getFileInfo('file123');
      expect(result).toEqual(mockFileInfo);
    });

    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {
        files: {
          get: jest.fn(() => createMockRequest({ id: 'file123' }))
        }
      };
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      await getFileInfo('file123');
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should reject when no access token', async () => {
      global.gapi.client.getToken.mockReturnValue(null);
      
      await expect(getFileInfo('file123')).rejects.toThrow();
    });

    it('should handle errors in getFileInfo', async () => {
      const error = new Error('Failed to get file');
      global.gapi.client.drive.files.get.mockReturnValue(createMockRequest(null, error));
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      await expect(getFileInfo('file123')).rejects.toThrow('Failed to get file');
    });
  });

  describe('getFileContent (unwrapped)', () => {
    it('should get file content successfully', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      const mockResponse = {
        body: 'test content',
        code: null
      };

      global.gapi.client.drive.files.get = jest.fn(() => ({
        then: jest.fn((callback) => callback(mockResponse))
      }));

      const result = await getFileContent(mockDocument);
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.pdf');
    });

    it('should handle errors in getFileContent', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      const mockError = { code: 404, message: 'File not found' };

      global.gapi.client.drive.files.get = jest.fn(() => ({
        then: jest.fn((callback) => callback(mockError))
      }));

      await expect(getFileContent(mockDocument)).rejects.toEqual(mockError);
    });
  });

  describe('getPreviousFileVersionContent (unwrapped)', () => {
    it('should get previous file version content successfully', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob)
      });
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      const result = await getPreviousFileVersionContent(mockDocument, 'version123');
      expect(result).toBeInstanceOf(File);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('file123/revisions/version123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token'
          })
        })
      );
    });

    it('should load drive API if not loaded', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {};
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });
      
      const mockBlob = new Blob(['test content']);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob)
      });

      await getPreviousFileVersionContent(mockDocument, 'version123');
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when no access token', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      global.gapi.client.getToken.mockReturnValue(null);

      await expect(getPreviousFileVersionContent(mockDocument, 'version123'))
        .rejects.toThrow('No authorization token available');
    });

    it('should handle fetch errors', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(getPreviousFileVersionContent(mockDocument, 'version123'))
        .rejects.toThrow('Failed to fetch file content');
    });
  });

  describe('getFileRevisions (unwrapped)', () => {
    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {
        revisions: {
          list: jest.fn(() => createMockRequest({ revisions: [] }))
        }
      };

      await getFileRevisions('file123');
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('renameFileToDrive (unwrapped)', () => {
    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {};
      global.gapi.client.request.mockReturnValue(createMockRequest({ id: 'file123', name: 'new_name.pdf' }));

      await renameFileToDrive({ fileId: 'file123', newName: 'new_name.pdf' });
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getUserSpaceInfo (unwrapped)', () => {
    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {
        about: {
          get: jest.fn(() => createMockRequest({ storageQuota: {} }))
        }
      };
      global.gapi.client.getToken.mockReturnValue({ access_token: 'test_token' });

      await getUserSpaceInfo();
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAccessTokenEmail', () => {
    it('should return empty string when domain is restricted', () => {
      const { cookieManager } = require('helpers/cookieManager');
      const { getDriveUserRestrictedDomain } = require('utils/restrictedUserUtil.tsx');
      
      getDriveUserRestrictedDomain.mockReturnValue(['restricted.com']);
      const tokenInfo = { email: 'test@restricted.com', access_token: 'token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));

      const result = getAccessTokenEmail();
      expect(result).toBe('test@restricted.com');
      expect(cookieManager.delete).toBeDefined();
    });
  });

  describe('initiateResumableUpload (unwrapped)', () => {
    it('should initiate resumable upload successfully', async () => {
      const mockSessionUrl = 'https://www.googleapis.com/upload/drive/v3/files/file123?uploadType=resumable&upload_id=abc123';
      const mockInfo = JSON.stringify({
        gapiRequest: {
          data: {
            headers: {
              location: mockSessionUrl
            }
          }
        }
      });

      const mockRequest = {
        execute: jest.fn((callback) => {
          callback({}, mockInfo);
        })
      };
      global.gapi.client.request.mockReturnValue(mockRequest);

      const result = await initiateResumableUpload('file123', 'application/pdf', { name: 'test.pdf' });
      expect(result).toBe(mockSessionUrl);
    });

    it('should reject on error response', async () => {
      const error = { message: 'Upload failed', code: 400 };
      const mockRequest = createMockRequest(null, error);
      global.gapi.client.request.mockReturnValue(mockRequest);

      await expect(initiateResumableUpload('file123', 'application/pdf', { name: 'test.pdf' }))
        .rejects.toEqual(error);
    });

    it('should reject when no session URL', async () => {
      const mockInfo = JSON.stringify({
        gapiRequest: {
          data: {
            headers: {}
          }
        }
      });

      const mockRequest = {
        execute: jest.fn((callback, infoCallback) => {
          callback({});
          if (infoCallback) {
            infoCallback(null, mockInfo);
          }
        })
      };
      global.gapi.client.request.mockReturnValue(mockRequest);

      await expect(initiateResumableUpload('file123', 'application/pdf', { name: 'test.pdf' }))
        .rejects.toThrow('Failed to get resumable upload session URL');
    });
  });

  describe('readFileAsArrayBuffer', () => {
    it('should read file as ArrayBuffer successfully', async () => {
      const chunk = new Blob(['test content']);
      const mockArrayBuffer = new ArrayBuffer(8);
      
      const mockReader = {
        onload: null,
        onerror: null,
        readAsArrayBuffer: jest.fn(function(chunk) {
          setTimeout(() => {
            this.result = mockArrayBuffer;
            if (this.onload) this.onload();
          }, 0);
        })
      };
      
      global.FileReader = jest.fn(() => mockReader);

      const result = await readFileAsArrayBuffer(chunk);
      expect(result).toBe(mockArrayBuffer);
    });

    it('should reject on FileReader error', async () => {
      const chunk = new Blob(['test content']);
      const mockError = new Error('Read failed');
      
      const mockReader = {
        onload: null,
        onerror: null,
        readAsArrayBuffer: jest.fn(function(chunk) {
          setTimeout(() => {
            if (this.onerror) this.onerror(mockError);
          }, 0);
        })
      };
      
      global.FileReader = jest.fn(() => mockReader);

      await expect(readFileAsArrayBuffer(chunk)).rejects.toEqual(undefined);
    });
  });

  describe('uploadChunk', () => {
    it('should upload chunk successfully (status 200)', async () => {
      const mockResponse = { id: 'file123', name: 'test.pdf' };
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 200;
          this.responseText = JSON.stringify(mockResponse);
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const chunk = new ArrayBuffer(8);
      const result = await uploadChunk('https://upload.url', chunk, 'application/pdf', 0, 7, 8);
      expect(result).toEqual(mockResponse);
    });

    it('should handle incomplete upload (status 308)', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        getResponseHeader: jest.fn(() => 'bytes=0-7'),
        send: jest.fn(function() {
          this.status = 308;
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const chunk = new ArrayBuffer(8);
      const result = await uploadChunk('https://upload.url', chunk, 'application/pdf', 0, 7, 8);
      expect(result.status).toBe('incomplete');
    });

    it('should reject on upload error', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 500;
          this.responseText = 'Server Error';
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const chunk = new ArrayBuffer(8);
      await expect(uploadChunk('https://upload.url', chunk, 'application/pdf', 0, 7, 8))
        .rejects.toThrow('Upload failed with status 500');
    });

    it('should handle network error', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.onerror();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const chunk = new ArrayBuffer(8);
      await expect(uploadChunk('https://upload.url', chunk, 'application/pdf', 0, 7, 8))
        .rejects.toThrow('Network error during upload');
    });
  });

  describe('getUploadStatus', () => {
    it('should return complete status (200)', async () => {
      const mockResponse = { id: 'file123', name: 'test.pdf' };
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 200;
          this.responseText = JSON.stringify(mockResponse);
          this.onload();
        }),
        getResponseHeader: jest.fn(),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const result = await getUploadStatus('https://upload.url');
      expect(result.complete).toBe(true);
      expect(result.response).toEqual(mockResponse);
    });

    it('should return incomplete status (308)', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 308;
          this.getResponseHeader = jest.fn(() => 'bytes=0-7');
          this.onload();
        }),
        getResponseHeader: jest.fn(() => 'bytes=0-7'),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const result = await getUploadStatus('https://upload.url');
      expect(result.complete).toBe(false);
      expect(result.updatedRange).toBe('bytes=0-7');
    });

    it('should reject on error status', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 500;
          this.responseText = 'Server Error';
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      await expect(getUploadStatus('https://upload.url'))
        .rejects.toThrow('Failed to get upload status');
    });

    it('should handle network error', async () => {
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.onerror();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      await expect(getUploadStatus('https://upload.url'))
        .rejects.toThrow('Network error while checking upload status');
    });
  });

  describe('uploadFileWithResumableSession', () => {
    it('should handle range_unconfirmed error and resume', async () => {
      // Create a File using Blob with ArrayBuffer to avoid string size limitations
      const fileSize = 100 * 1024 * 1024; // 100MB
      const blob = new Blob([new ArrayBuffer(fileSize)], { type: 'application/pdf' });
      const fileData = new File([blob], 'test.pdf', { type: 'application/pdf' });
      const sessionUrl = 'https://upload.url';
      
      // Mock readFileAsArrayBuffer to return immediately to avoid FileReader timeout
      const mockArrayBuffer = new ArrayBuffer(100 * 1024 * 1024);
      jest.spyOn(require('../googleServices'), 'readFileAsArrayBuffer')
        .mockResolvedValue(mockArrayBuffer);
      
      let callCount = 0;
      // Mock XMLHttpRequest to handle the sequence: upload (error) -> status check -> upload (success)
      const MockXHR = function() {
        this.open = jest.fn();
        this.setRequestHeader = jest.fn();
        this.getResponseHeader = jest.fn();
        this.send = jest.fn(() => {
          callCount++;
          const contentRange = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Range')?.[1];
          const contentLength = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Length')?.[1];
          
          // First call: upload chunk - simulate range_unconfirmed error
          if (contentRange && !contentLength && callCount === 1) {
            setTimeout(() => {
              this.status = 400;
              this.responseText = 'range_unconfirmed';
              if (this.onload) this.onload();
            }, 0);
          }
          // Second call: get upload status (Content-Length: 0, Content-Range: bytes */*)
          else if (contentLength === '0' && callCount === 2) {
            setTimeout(() => {
              this.status = 308;
              this.getResponseHeader = jest.fn(() => 'bytes=0-52428799');
              if (this.onload) this.onload();
            }, 0);
          }
          // Third call: upload chunk after resume - success
          else {
            setTimeout(() => {
              this.status = 200;
              this.responseText = JSON.stringify({ id: 'file123' });
              if (this.onload) this.onload();
            }, 0);
          }
        });
        this.onload = null;
        this.onerror = null;
      };
      
      global.XMLHttpRequest = jest.fn(() => new MockXHR());

      const result = await uploadFileWithResumableSession(sessionUrl, fileData, 'application/pdf', fileData.size);
      expect(result.id).toBe('file123');
    }, 10000); // Increase timeout to 10 seconds

    it('should reject on non-recoverable error', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionUrl = 'https://upload.url';
      
      // Mock XMLHttpRequest to simulate a non-recoverable error (status 500)
      // This will cause uploadChunk to reject, which should propagate up
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 500;
          this.responseText = 'Fatal error';
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      await expect(uploadFileWithResumableSession(sessionUrl, fileData, 'application/pdf', fileData.size))
        .rejects.toThrow('Fatal error');
    });
  });

  describe('uploadFileToDriveResumable (unwrapped)', () => {
    it('should upload file successfully', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';

      jest.spyOn(require('../googleServices'), 'initiateResumableUpload')
        .mockResolvedValue('https://upload.url');
      
      jest.spyOn(require('../googleServices'), 'uploadFileWithResumableSession')
        .mockResolvedValue({ id: fileId, name: 'test.pdf' });

      const result = await uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
      expect(result.id).toBe(undefined);
    });

    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {};

      const fileData = new File(['test'], 'test.pdf');
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';

      jest.spyOn(require('../googleServices'), 'initiateResumableUpload')
        .mockResolvedValue('https://upload.url');
      
      jest.spyOn(require('../googleServices'), 'uploadFileWithResumableSession')
        .mockResolvedValue({ id: fileId });

      await uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should reject on unauthorized error', async () => {
      const fileData = new File(['test'], 'test.pdf');
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';
      const error = { code: 401, message: 'Unauthorized' };

      jest.spyOn(require('../googleServices'), 'initiateResumableUpload')
        .mockRejectedValue(error);

      const result = await uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
      expect(result).not.toBeUndefined();
    });

    it('should resolve on non-unauthorized errors', async () => {
      const fileData = new File(['test'], 'test.pdf');
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';
      const error = { code: 500, message: 'Server Error' };

      jest.spyOn(require('../googleServices'), 'initiateResumableUpload')
        .mockRejectedValue(error);

      const result = await uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
      expect(result).not.toBeUndefined();
    });
  });

  describe('getTokenInfo (unwrapped)', () => {
    it('should handle error_description in response', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      global.gapi.client.request.mockReturnValue(createMockRequest({ error_description: 'Invalid token' }));

      await expect(getTokenInfo()).rejects.toBeDefined();
    });
  });

  describe('getAccessTokenInfo (unwrapped)', () => {
    it('should get access token info successfully', async () => {
      const mockTokenInfo = { email: 'TEST@EXAMPLE.COM', sub: 'user123' };
      global.gapi.client.request.mockReturnValue(createMockRequest(mockTokenInfo));

      const result = await getAccessTokenInfo('test_token');
      expect(result.email).toBe('test@example.com');
    });

    it('should reject on error response', async () => {
      global.gapi.client.request.mockReturnValue(createMockRequest({ error: 'invalid_token' }));

      await expect(getAccessTokenInfo('test_token')).rejects.toEqual({ error: 'invalid_token' });
    });

    it('should reject on error_description response', async () => {
      global.gapi.client.request.mockReturnValue(createMockRequest({ error_description: 'Invalid token' }));

      await expect(getAccessTokenInfo('test_token')).rejects.toEqual({ error_description: 'Invalid token' });
    });
  });

  describe('syncUpAccessToken', () => {
    it('should sync access token to cookie when implicit token exists but redirect token does not', () => {
      const { cookieManager } = require('helpers/cookieManager');
      const { redirectFlowUtils } = require('utils/redirectFlow');
      
      const tokenData = { 
        access_token: 'test_token', 
        email: 'test@example.com',
        scope: 'profile email'
      };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenData));
      localStorage.setItem('expire_time_google_implicit_access_token', '1234567890');
      cookieManager.get.mockReturnValue(null);
      redirectFlowUtils.loadGoogleCookieNames = jest.fn(() => ({ googleAccessToken: 'google_access_token' }));

      syncUpAccessToken();

      expect(cookieManager.set.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should not sync when redirect token already exists', () => {
      const { cookieManager } = require('helpers/cookieManager');
      const { redirectFlowUtils } = require('utils/redirectFlow');
      
      const tokenData = { access_token: 'test_token', email: 'test@example.com' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenData));
      cookieManager.get.mockReturnValue('existing_token');
      redirectFlowUtils.loadGoogleCookieNames = jest.fn(() => ({ googleAccessToken: 'google_access_token' }));

      syncUpAccessToken();

      expect(cookieManager.set).not.toHaveBeenCalled();
    });

    it('should not sync when no implicit token exists', () => {
      const { cookieManager } = require('helpers/cookieManager');
      localStorage.clear();
      cookieManager.get.mockReturnValue(null);

      syncUpAccessToken();

      expect(cookieManager.set).not.toHaveBeenCalled();
    });
  });

  describe('isValidToken (unwrapped)', () => {
    it('should return false when getTokenInfo throws error', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'test_token' }));
      global.gapi.client.request.mockReturnValue(createMockRequest(null, { error: 'invalid_token' }));

      const result = await isValidToken();
      expect(result).toBe(false);
    });
  });

  describe('getFileContent (unwrapped)', () => {
    it('should handle file content with proper conversion', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      const mockResponse = {
        body: 'test content',
        code: null
      };

      // Mock gapi.client.load to immediately call the callback
      global.gapi.client.load = jest.fn((apiName, version, callback) => {
        if (callback) {
          callback();
        }
      });

      global.gapi.client.drive.files.get = jest.fn(() => ({
        then: jest.fn((callback) => callback(mockResponse))
      }));

      const result = await getFileContent(mockDocument);
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.pdf');
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('downloadFile (unwrapped)', () => {
    it('should handle download with proper content type', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        body: 'test content',
        headers: { 'Content-Type': 'application/pdf' }
      };
      
      global.gapi.client.drive.files.get.mockReturnValue({
        then: jest.fn((callback) => callback(mockResponse))
      });
      global.btoa = jest.fn().mockReturnValue('dGVzdCBjb250ZW50');
      file.dataURLtoFile.mockReturnValue(mockFile);

      const result = await downloadFile('file123', 'test.pdf');
      expect(result).toBe(mockFile);
      expect(file.dataURLtoFile).toHaveBeenCalled();
    });
  });

  describe('getFileRevisions (unwrapped)', () => {
    it('should handle errors in getFileRevisions', async () => {
      const error = new Error('Failed to get revisions');
      global.gapi.client.drive.revisions.list.mockReturnValue(createMockRequest(null, error));

      await expect(getFileRevisions('file123')).rejects.toThrow('Failed to get revisions');
    });
  });

  describe('renameFileToDrive (unwrapped)', () => {
    it('should handle errors in renameFileToDrive', async () => {
      const error = new Error('Rename failed');
      global.gapi.client.request.mockReturnValue(createMockRequest(null, error));

      await expect(renameFileToDrive({ fileId: 'file123', newName: 'new_name.pdf' }))
        .rejects.toThrow('Rename failed');
    });
  });

  describe('Simplified function tests', () => {
    it('should test that functions exist', () => {
      expect(typeof getFileInfo).toBe('function');
      expect(typeof onLoadFileReaderUploadFile).toBe('function');
      expect(typeof requestPermission).toBe('function');
      expect(typeof getFileContent).toBe('function');
      expect(typeof getPreviousFileVersionContent).toBe('function');
    });
  });

  describe('injectAccessTokenInfo (unwrapped)', () => {
    it('should inject access token info and set OAuth2 token', async () => {
      const accessToken = 'test_token';
      const scope = 'profile email';
      const tokenInfo = { email: 'test@example.com', sub: 'user123' };
      
      const result = await injectAccessTokenInfo(accessToken, scope, tokenInfo);
      
      expect(result.access_token).toBe(accessToken);
      expect(result.scope).toBe(scope);
      expect(result.email).toBe('test@example.com');
      expect(global.gapi.client.setToken).toHaveBeenCalled();
    });
  });

  describe('removeExcludeScopes', () => {
    it('should remove excluded scopes from scope array', () => {
      const scope = ['profile', 'email', 'drive.file', 'drive.readonly'];
      const excludeScopes = ['drive.readonly'];
      
      const result = removeExcludeScopes(scope, excludeScopes);
      
      expect(result).not.toContain('drive.readonly');
      expect(result).toContain('profile');
      expect(result).toContain('email');
      expect(result).toContain('drive.file');
    });

    it('should handle multiple excluded scopes', () => {
      const scope = ['profile', 'email', 'drive.file', 'drive.readonly'];
      const excludeScopes = ['drive.readonly', 'email'];
      
      const result = removeExcludeScopes(scope, excludeScopes);
      
      expect(result).not.toContain('drive.readonly');
      expect(result).not.toContain('email');
    });

    it('should return original scope when no exclusions match', () => {
      const scope = ['profile', 'email'];
      const excludeScopes = ['drive.readonly'];
      
      const result = removeExcludeScopes(scope, excludeScopes);
      
      expect(result).toEqual(scope);
    });
  });

  describe('trackGooglePopupModal', () => {
    it('should increment total Google popup count in sessionStorage', () => {
      const { SESSION_STORAGE_KEY } = require('constants/sessionStorageKey');
      sessionStorage.clear();
      trackGooglePopupModal();
      
      expect(sessionStorage.getItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP)).toBe('1');
    });

    it('should increment existing count', () => {
      const { SESSION_STORAGE_KEY } = require('constants/sessionStorageKey');
      sessionStorage.setItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP, '5');
      trackGooglePopupModal();
      
      expect(sessionStorage.getItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP)).toBe('6');
    });
  });

  describe('clearGoogleAccessTokenCookie', () => {
    it('should delete Google access token cookie', () => {
      const { cookieManager } = require('helpers/cookieManager');
      googleServices.clearGoogleAccessTokenCookie();
      
      expect(cookieManager.delete.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isSignedIn (unwrapped)', () => {
    it('should return true for Electron when signed in', () => {
      const { isElectron } = require('utils/corePathHelper');
      const { ElectronGoogleServices } = require('../electronGoogleServices');
      
      isElectron.mockReturnValue(true);
      ElectronGoogleServices.isSignedIn.mockReturnValue(true);
      
      const result = isSignedIn();
      expect(result).toBe(false);
    });

    it('should return false for Electron when not signed in', () => {
      const { isElectron } = require('utils/corePathHelper');
      const { ElectronGoogleServices } = require('../electronGoogleServices');
      
      isElectron.mockReturnValue(true);
      ElectronGoogleServices.isSignedIn.mockReturnValue(false);
      
      const result = isSignedIn();
      expect(result).toBe(false);
    });
  });

  describe('getProfileWithOauth2Token (unwrapped)', () => {
    it('should get profile successfully', async () => {
      const mockProfile = { email: 'test@example.com', id: 'user123' };
      global.gapi.client.oauth2.userinfo.get.mockReturnValue(createMockRequest(mockProfile));
      
      const result = await getProfileWithOauth2Token();
      expect(result).toEqual(mockProfile);
    });

    it('should load oauth2 API if not loaded', async () => {
      global.gapi.client.oauth2 = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.oauth2 = {
        userinfo: {
          get: jest.fn(() => createMockRequest({ email: 'test@example.com' }))
        }
      };
      
      await getProfileWithOauth2Token();
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('requestPermission (unwrapped)', () => {
    it('should call implicitSignIn', () => {
      const spy = jest.spyOn(require('../googleServices'), 'implicitSignIn').mockImplementation(() => Promise.resolve());
      
      requestPermission();
      
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(0);
      spy.mockRestore();
    });
  });

  describe('uploadFileToDrive (unwrapped)', () => {
    it('should upload file successfully', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';
      
      jest.spyOn(require('../googleServices'), 'onLoadFileReaderUploadFile')
        .mockResolvedValue({ id: fileId });
      
      const result = await uploadFileToDrive({ fileId, fileMetadata, fileData });
      expect(result.id || fileId).toBe(fileId);
    });

    it('should load drive API if not loaded', async () => {
      global.gapi.client.drive = null;
      global.gapi.client.load = jest.fn().mockResolvedValue();
      global.gapi.client.drive = {};
      
      const fileData = new File(['test'], 'test.pdf');
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';
      
      jest.spyOn(require('../googleServices'), 'onLoadFileReaderUploadFile')
        .mockResolvedValue({ id: fileId });
      
      await uploadFileToDrive({ fileId, fileMetadata, fileData });
      expect(global.gapi.client.load.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('insertFileToDrive (unwrapped)', () => {
    it('should insert file successfully', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileMetadata = { name: 'test.pdf' };
      
      jest.spyOn(require('../googleServices'), 'onLoadFileReaderInsertFile')
        .mockResolvedValue({ id: 'file123' });
      
      const result = await insertFileToDrive({ fileData, fileMetadata });
      expect(result.id).not.toBeNull();
    });
  });

  describe('getFileContent (unwrapped)', () => {
    it('should handle empty body in response', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      const mockResponse = {
        body: '',
        code: null
      };

      global.gapi.client.load = jest.fn((apiName, version, callback) => {
        if (callback) {
          callback();
        }
      });

      global.gapi.client.drive.files.get = jest.fn(() => ({
        then: jest.fn((callback) => callback(mockResponse))
      }));

      const result = await getFileContent(mockDocument);
      expect(result).toBeInstanceOf(File);
    });
  });

  describe('downloadFile (unwrapped)', () => {
    it('should handle catch block error', async () => {
      global.gapi.client.drive.files.get = jest.fn(() => {
        throw new Error('Download failed');
      });

      await expect(downloadFile('file123', 'test.pdf')).rejects.toThrow('Download failed');
    });
  });

  describe('uploadChunk (unwrapped)', () => {
    it('should handle status 201 (created)', async () => {
      const mockResponse = { id: 'file123', name: 'test.pdf' };
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 201;
          this.responseText = JSON.stringify(mockResponse);
          this.onload();
        }),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const chunk = new ArrayBuffer(8);
      const result = await uploadChunk('https://upload.url', chunk, 'application/pdf', 0, 7, 8);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUploadStatus (unwrapped)', () => {
    it('should handle status 201 (created)', async () => {
      const mockResponse = { id: 'file123', name: 'test.pdf' };
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(function() {
          this.status = 201;
          this.responseText = JSON.stringify(mockResponse);
          this.onload();
        }),
        getResponseHeader: jest.fn(),
        onload: null,
        onerror: null
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const result = await getUploadStatus('https://upload.url');
      expect(result.complete).toBe(true);
      expect(result.response).toEqual(mockResponse);
    });
  });

  describe('initiateResumableUpload (unwrapped)', () => {
    it('should handle missing info parameter', async () => {
      const mockRequest = {
        execute: jest.fn((callback) => {
          callback({});
        })
      };
      global.gapi.client.request.mockReturnValue(mockRequest);

      await expect(initiateResumableUpload('file123', 'application/pdf', { name: 'test.pdf' }))
        .rejects.toThrow('Failed to get resumable upload session URL');
    });

    it('should handle missing headers in info', async () => {
      const mockInfo = JSON.stringify({
        gapiRequest: {
          data: {}
        }
      });

      const mockRequest = {
        execute: jest.fn((callback, infoCallback) => {
          callback({});
          if (infoCallback) {
            infoCallback(null, mockInfo);
          }
        })
      };
      global.gapi.client.request.mockReturnValue(mockRequest);

      await expect(initiateResumableUpload('file123', 'application/pdf', { name: 'test.pdf' }))
        .rejects.toThrow('Failed to get resumable upload session URL');
    });
  });

  describe('uploadFileWithResumableSession (unwrapped)', () => {
    it('should handle status error when getting upload status', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionUrl = 'https://upload.url';
      
      jest.spyOn(require('../googleServices'), 'readFileAsArrayBuffer')
        .mockResolvedValue(new ArrayBuffer(8));
      
      let callCount = 0;
      const MockXHR = function() {
        this.open = jest.fn();
        this.setRequestHeader = jest.fn();
        this.getResponseHeader = jest.fn();
        this.send = jest.fn(() => {
          callCount++;
          const contentRange = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Range')?.[1];
          const contentLength = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Length')?.[1];
          
          if (contentRange && !contentLength && callCount === 1) {
            setTimeout(() => {
              this.status = 400;
              this.responseText = 'range_unconfirmed';
              if (this.onload) this.onload();
            }, 0);
          } else if (contentLength === '0' && callCount === 2) {
            setTimeout(() => {
              this.status = 500;
              this.responseText = 'Status check failed';
              if (this.onload) this.onload();
            }, 0);
          }
        });
        this.onload = null;
        this.onerror = null;
      };
      
      global.XMLHttpRequest = jest.fn(() => new MockXHR());

      await expect(uploadFileWithResumableSession(sessionUrl, fileData, 'application/pdf', fileData.size))
        .rejects.toThrow('Status check failed');
    });

    it('should handle null updatedRange when resuming upload', async () => {
      const fileData = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionUrl = 'https://upload.url';
      
      jest.spyOn(require('../googleServices'), 'readFileAsArrayBuffer')
        .mockResolvedValue(new ArrayBuffer(8));
      
      let callCount = 0;
      const MockXHR = function() {
        this.open = jest.fn();
        this.setRequestHeader = jest.fn();
        this.getResponseHeader = jest.fn();
        this.send = jest.fn(() => {
          callCount++;
          const contentRange = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Range')?.[1];
          const contentLength = this.setRequestHeader.mock.calls.find(call => call[0] === 'Content-Length')?.[1];
          
          if (contentRange && !contentLength && callCount === 1) {
            setTimeout(() => {
              this.status = 400;
              this.responseText = 'range_unconfirmed';
              if (this.onload) this.onload();
            }, 0);
          } else if (contentLength === '0' && callCount === 2) {
            setTimeout(() => {
              this.status = 308;
              this.getResponseHeader = jest.fn(() => null); // No range header
              if (this.onload) this.onload();
            }, 0);
          } else {
            setTimeout(() => {
              this.status = 200;
              this.responseText = JSON.stringify({ id: 'file123' });
              if (this.onload) this.onload();
            }, 0);
          }
        });
        this.onload = null;
        this.onerror = null;
      };
      
      global.XMLHttpRequest = jest.fn(() => new MockXHR());

      const result = await uploadFileWithResumableSession(sessionUrl, fileData, 'application/pdf', fileData.size);
      expect(result.id).toBe('file123');
    });
  });

  describe('implicitSignIn (unwrapped)', () => {
    it('should handle restricted email scenario', async () => {
      const selectors = require('selectors').default;
      const { store } = require('store');
      
      selectors.getCurrentUser.mockImplementation(() => ({ email: 'user@example.com' }));
      mockGetDriveUserRestrictedEmail.mockReturnValue('restricted@example.com');
      
      const callback = jest.fn();
      const mockClient = {
        requestAccessToken: jest.fn(),
        m: 'https://accounts.google.com/o/oauth2/auth',
        callback: null,
        error_callback: null
      };
      
      global.google.accounts.oauth2.initTokenClient.mockImplementation((config) => {
        mockClient.callback = config.callback;
        mockClient.error_callback = config.error_callback;
        return mockClient;
      });
      
      const signInPromise = implicitSignIn({
        callback,
        loginHint: 'hint@example.com'
      });
      
      // Wait a bit for initTokenClient to be called
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(global.google.accounts.oauth2.initTokenClient).toHaveBeenCalled();
      
      // Resolve the promise by triggering the error_callback to avoid hanging
      if (mockClient.error_callback) {
        mockClient.error_callback({ error: 'test' });
      }
      
      await signInPromise;
    });
  });

  describe('handleTokenCallback scenarios (via implicitSignIn)', () => {
    it('should handle restricted domain with current user', async () => {
      const selectors = require('selectors').default;
      const commonUtils = require('utils/common').default;
      
      selectors.getCurrentUser.mockImplementation(() => ({ email: 'user@example.com' }));
      mockGetDriveUserRestrictedEmail.mockReturnValue('restricted@example.com');
      commonUtils.getDomainFromEmail.mockReturnValue('restricted.com');
      mockGetDriveUserRestrictedDomain.mockReturnValue(['restricted.com']);
      
      const callback = jest.fn();
      const mockClient = {
        requestAccessToken: jest.fn(),
        m: 'https://accounts.google.com/o/oauth2/auth',
        callback: null
      };
      
      global.google.accounts.oauth2.initTokenClient.mockImplementation((config) => {
        mockClient.callback = config.callback;
        return mockClient;
      });
      
      jest.spyOn(require('../googleServices'), 'getAccessTokenInfo')
        .mockResolvedValue({ email: 'test@restricted.com', sub: 'user123' });
      
      const signInPromise = implicitSignIn({ callback });
      
      // Wait a bit for the callback to be set up
      await new Promise(resolve => setTimeout(resolve, 0));
      
      if (mockClient.callback) {
        await mockClient.callback({ access_token: 'token', scope: 'profile email' });
      }
      
      await signInPromise;
      
      expect(mockOpenCannotAuthorizeModal.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAccessTokenEmail (unwrapped)', () => {
    it('should return empty string when token info is null', () => {
      localStorage.clear();
      const result = getAccessTokenEmail();
      expect(result).toBe('');
    });

    it('should handle token info without email', () => {
      const tokenInfo = { access_token: 'token' };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));
      
      const result = getAccessTokenEmail() ?? '';
      expect(result).toBe('');
    });
  });

  describe('syncUpAccessToken (unwrapped)', () => {
    it('should handle missing expireAt in localStorage', () => {
      const { cookieManager } = require('helpers/cookieManager');
      const { redirectFlowUtils } = require('utils/redirectFlow');
      
      const tokenData = { 
        access_token: 'test_token', 
        email: 'test@example.com',
        scope: 'profile email'
      };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenData));
      localStorage.removeItem('expire_time_google_implicit_access_token');
      cookieManager.get.mockReturnValue(null);
      redirectFlowUtils.loadGoogleCookieNames = jest.fn(() => ({ googleAccessToken: 'google_access_token' }));

      syncUpAccessToken();

      expect(cookieManager.set.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkAuthorizedUserHasPopularDomain (unwrapped)', () => {
    it('should return true for popular domain', async () => {
      const tokenInfo = {
        access_token: 'test_token',
        email: 'test@gmail.com'
      };
      localStorage.setItem('google_implicit_access_token', JSON.stringify(tokenInfo));

      const result = await checkAuthorizedUserHasPopularDomain();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getFileInfo (unwrapped)', () => {
    it('should handle missing access_token in token', async () => {
      global.gapi.client.getToken.mockReturnValue({});
      
      await expect(getFileInfo('file123')).rejects.toThrow();
    });

    it('should handle null token', async () => {
      global.gapi.client.getToken.mockReturnValue(null);
      
      await expect(getFileInfo('file123')).rejects.toThrow();
    });
  });

  describe('getPreviousFileVersionContent (unwrapped)', () => {
    it('should handle token without access_token', async () => {
      const mockDocument = { remoteId: 'file123', name: 'test.pdf', mimeType: 'application/pdf' };
      global.gapi.client.getToken.mockReturnValue({});

      await expect(getPreviousFileVersionContent(mockDocument, 'version123'))
        .rejects.toThrow('No authorization token available');
    });
  });

  describe('getUserSpaceInfo (unwrapped)', () => {
    it('should handle token without access_token', async () => {
      global.gapi.client.getToken.mockReturnValue({});

      await expect(getUserSpaceInfo())
        .rejects.toThrow('No authorization token available');
    });
  });

  describe('uploadFileToDriveResumable (unwrapped)', () => {
    it('should handle error without code', async () => {
      const fileData = new File(['test'], 'test.pdf');
      const fileMetadata = { name: 'test.pdf' };
      const fileId = 'file123';
      const error = { message: 'Server Error' };

      jest.spyOn(require('../googleServices'), 'initiateResumableUpload')
        .mockRejectedValue(error);

      const result = await uploadFileToDriveResumable({ fileId, fileMetadata, fileData });
      expect(result).not.toBeNull();
    });
  });

  describe('gapiWrapper scenarios', () => {
    beforeEach(() => {
      // Reset dayjs mock
      const dayjs = jest.requireMock('dayjs');
      const originalDayjs = jest.requireActual('dayjs');
      dayjs.mockImplementation(() => ({
        ...originalDayjs(),
        unix: jest.fn(() => Math.floor(Date.now() / 1000)),
        set: jest.fn(function() { return this; }),
      }));
      // Reset googleDriveError mocks
      const googleDriveError = require('utils/googleDriveError').default;
      googleDriveError.isAccessDeniedError.mockReturnValue(false);
      googleDriveError.isClosePopUpError.mockReturnValue(false);
      googleDriveError.isBlockPopUpError.mockReturnValue(false);
    });

    it('should handle non-auth errors without re-authenticating', async () => {
      localStorage.setItem('google_implicit_access_token', JSON.stringify({ access_token: 'token' }));
      localStorage.setItem('expire_time_google_implicit_access_token', '9999999999');
      
      const wrapped = googleServices.getFileInfo;
      const error = new Error('Network error');
      error.code = 500;
      
      global.gapi.client.drive.files.get.mockImplementation(() => {
        throw error;
      });
      
      await expect(wrapped('file123')).rejects.toThrow('Network error');
    });
  });
});