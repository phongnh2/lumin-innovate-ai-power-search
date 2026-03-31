import errorInterceptor from '../errorInterceptor';
import errorExtract from 'utils/error';
import { ErrorCode, DefaultErrorCode } from 'constants/errorCode';
import {
  ERROR_MESSAGE_EMAIL_EXISTED,
  ERROR_MESSAGE_UNKNOWN_ERROR,
  ERROR_MESSAGE_NO_PERMISSION,
} from 'constants/messages';

jest.mock('i18next', () => ({
  t: jest.fn((k) => k),
}));

jest.mock('utils/error', () => ({
  extractGqlError: jest.fn(),
  isRateLimitError: jest.fn(),
}));

describe('errorInterceptor', () => {
  describe('getAuthErrorMessage', () => {
    it('should return EMAIL_EXISTED message', () => {
      errorExtract.extractGqlError.mockReturnValue({
        code: ErrorCode.User.EMAIL_ALREADY_EXISTS,
        metadata: {},
      });

      const msg = errorInterceptor.getAuthErrorMessage(new Error());
      expect(msg).toBe(ERROR_MESSAGE_EMAIL_EXISTED);
    });

    it('should return unknown error when not matched', () => {
      errorExtract.extractGqlError.mockReturnValue({
        code: 'RANDOM_CODE',
        metadata: {},
      });

      const msg = errorInterceptor.getAuthErrorMessage(new Error());
      expect(msg).toBe(ERROR_MESSAGE_UNKNOWN_ERROR);
    });
  });

  describe('getDocumentErrorMessage', () => {
    it('should return NO_PERMISSION', () => {
      errorExtract.extractGqlError.mockReturnValue({
        code: ErrorCode.Common.NO_PERMISSION,
      });
      errorExtract.isRateLimitError.mockReturnValue(false);

      const msg = errorInterceptor.getDocumentErrorMessage(new Error());
      expect(msg).toBe(ERROR_MESSAGE_NO_PERMISSION);
    });

    it('should return TOO_MANY_REQUESTS when rate limited', () => {
      errorExtract.isRateLimitError.mockReturnValue(true);

      const msg = errorInterceptor.getDocumentErrorMessage();
      expect(msg).not.toBeNull();
    });
  });

  describe('getNotificationErrorMessage', () => {
    it('should return UNKNOWN_ERROR when no specific code', () => {
      errorExtract.extractGqlError.mockReturnValue({
        code: 'NOT_EXIST',
      });

      const msg = errorInterceptor.getNotificationErrorMessage(new Error());
      expect(msg).toBe(ERROR_MESSAGE_UNKNOWN_ERROR);
    });
  });

  describe('getTemplateErrorMessage', () => {
    it('should return default unknown', () => {
      errorExtract.extractGqlError.mockReturnValue({
        code: DefaultErrorCode.TOO_MANY_REQUESTS,
      });

      const msg = errorInterceptor.getTemplateErrorMessage(new Error());
      expect(msg).toBe(ERROR_MESSAGE_UNKNOWN_ERROR);
    });
  });
});
