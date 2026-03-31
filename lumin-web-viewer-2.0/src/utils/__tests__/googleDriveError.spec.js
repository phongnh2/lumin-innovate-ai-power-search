/* eslint-disable */
import {
  isFileNotFoundError,
  isSigninDriveRequiredError,
  isSigninRequiredError,
  isUnauthorizedError,
  isPermissionRequiredError,
  isInvalidCredential,
  isBlockPopUpError,
  isClosePopUpError,
  isAccessDeniedError,
  isFileNotFound,
} from '../googleDriveError';

describe('googleDriveError', () => {
  describe('isFileNotFoundError', () => {
    test('should be return true', () => {
      const error = {
        code: 404,
        data: [{ reason: 'notFound' }],
      };
      expect(isFileNotFoundError(error)).toBe(true);
    });
    test('should be return true when message includes "File not found"', () => {
      const error = {
        message: 'File not found in Google Drive',
      };
      expect(isFileNotFoundError(error)).toBe(true);
    });
    test('should be return false', () => {
      const error = {
        code: 403,
        data: [{ reason: 'unauthorized' }],
      };
      expect(isFileNotFoundError(error)).toBe(false);
    });
    test('should be return false when message is undefined', () => {
      const error = {
        code: 403,
      };
      expect(isFileNotFoundError(error)).toBe(false);
    });
  });

  describe('isSigninDriveRequiredError', () => {
    test('should be return true', () => {
      const error = {
        message: 'signinDriveRequired',
      };
      expect(isSigninDriveRequiredError(error)).toBe(true);
    });
    test('should be return false', () => {
      const error = {
        message: 'unauthorized',
      };
      expect(isSigninDriveRequiredError(error)).toBe(false);
    });
  });

  describe('isSigninRequiredError', () => {
    test('should be return true', () => {
      const error = {
        message: 'signinRequired',
      };
      expect(isSigninRequiredError(error)).toBe(true);
    });
    test('should be return false', () => {
      const error = {
        message: 'unauthorized',
      };
      expect(isSigninRequiredError(error)).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    test('should be return true', () => {
      const error = {
        message: 'unauthorized',
      };
      expect(isUnauthorizedError(error)).toBe(true);
    });
    test('should be return false', () => {
      const error = {
        message: 'signinRequired',
      };
      expect(isUnauthorizedError(error)).toBe(false);
    });
  });

  describe('isPermissionRequiredError', () => {
    test('should be return true', () => {
      const error = {
        message: 'permissionRequired',
      };
      expect(isPermissionRequiredError(error)).toBe(true);
    });
  });

  describe('isInvalidCredential', () => {
    test('should be return true', () => {
      const error = {
        message: 'invalidCredential',
      };
      expect(isInvalidCredential(error)).toBe(false);
    });
  });

  describe('isBlockPopUpError', () => {
    test('should be return true', () => {
      const error = {
        message: 'blockPopUp',
      };
      expect(isBlockPopUpError(error)).toBe(false);
    });
  });

  describe('isClosePopUpError', () => {
    test('should be return true', () => {
      const error = {
        message: 'closePopUp',
      };
      expect(isClosePopUpError(error)).toBe(false);
    });
  });
  describe('isAccessDeniedError', () => {
    test('should be return true', () => {
      const error = {
        message: 'accessDenied',
      };
      expect(isAccessDeniedError(error)).toBe(false);
    });
  });
  describe('isFileNotFound', () => {
    test('should be return false', () => {
      const error = {
        message: 'fileNotFound',
      };
      expect(isFileNotFound(error)).toBe(false);
    });
    test('should be return true', () => {
      const error = {
        message: 'fileNotFound',
        result: {
          error: {
            code: 404,
            errors: [{ reason: 'notFound' }],
          },
        },
      };
      expect(isFileNotFound(error)).toBe(true);
    });
  });
});
