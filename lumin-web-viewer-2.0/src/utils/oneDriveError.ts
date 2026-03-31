import { BrowserAuthError } from '@azure/msal-browser';
import { isAxiosError, AxiosError } from 'axios';

import {
  OneDriveBrowserError,
  OneDriveAxiosError,
  OneDriveError,
  OneDriveErrorCode,
  OneDriveAuthenticationError,
  OneDriveAuthenticationCancelledError,
  OneDriveAccessDeniedError,
  OneDriveFileNotFoundError,
  OneDrivePopupBlockedError,
  OneDriveInvalidRequestError,
  OneDriveTokenError,
  OneDriveUserCancelledError,
  isOneDriveError,
  isOneDriveAuthenticationError,
  isOneDriveAuthenticationCancelledError,
  isOneDriveAccessDeniedError,
  isOneDriveFileNotFoundError,
  isOneDrivePopupBlockedError,
  isOneDriveInvalidRequestError,
  isOneDriveTokenError,
  isOneDriveUserCancelledError,
  isClosePopUpError as helperIsClosePopUpError,
  isExpectedAuthError as helperIsExpectedAuthError,
} from 'services/oneDriveServices';

import { STATUS_CODE } from 'constants/lumin-common';

export type ErrorBase = {
  error: OneDriveBrowserError | OneDriveAxiosError | BrowserAuthError | OneDriveError;
};

type ErrorData = {
  statusCode?: number;
  errorCode: string;
  errorMessage: string;
};

/**
 * @deprecated This class is kept for backward compatibility.
 * Use typed error instances (OneDriveError and its subclasses) and helper functions instead.
 * @example
 * // Modern approach
 * if (isOneDriveFileNotFoundError(error)) { ... }
 *
 * // Legacy approach (backward compatible)
 * const errorUtils = new OneDriveErrorUtils([{ error }]);
 * if (errorUtils.isFileNotFound()) { ... }
 */
class OneDriveErrorUtils {
  private errorBase: ErrorBase;

  private errorData: ErrorData;

  constructor(errors: readonly [ErrorBase]) {
    const [errorBase] = errors;
    this.errorBase = errorBase;
    this.errorData = this.extractError();
  }

  private extractError(): ErrorData {
    if (!this.errorBase?.error) {
      return this.getEmptyErrorData();
    }

    const { error } = this.errorBase;

    if (isOneDriveError(error)) {
      return this.extractOneDriveError(error);
    }

    if (this.isOneDriveBrowserError(error)) {
      return this.extractBrowserError(error);
    }

    if (isAxiosError(error)) {
      return this.extractAxiosError(error);
    }

    return this.getUnknownErrorData();
  }

  private getEmptyErrorData(): ErrorData {
    return {
      errorCode: '',
      errorMessage: '',
    };
  }

  private isOneDriveBrowserError(
    error: OneDriveBrowserError | OneDriveAxiosError | BrowserAuthError | OneDriveError
  ): error is OneDriveBrowserError {
    if (isOneDriveError(error)) {
      return false;
    }
    return 'correlationId' in error || 'errorCode' in error;
  }

  private extractOneDriveError(error: OneDriveError): ErrorData {
    return {
      statusCode: error.statusCode,
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  private extractBrowserError(error: OneDriveBrowserError): ErrorData {
    return {
      errorCode: error.errorCode || '',
      errorMessage: error.errorMessage || '',
    };
  }

  private extractAxiosError(error: AxiosError): ErrorData {
    if (error.response) {
      const response = error.response as OneDriveAxiosError['response'];
      return {
        statusCode: response.status,
        errorCode: response.data?.error?.code || '',
        errorMessage: response.data?.error?.message || '',
      };
    }

    return {
      statusCode: error.status,
      errorCode: error.code || '',
      errorMessage: error.message || '',
    };
  }

  private getUnknownErrorData(): ErrorData {
    return {
      errorCode: '',
      errorMessage: 'Unknown error',
    };
  }

  private getErrorFromProp():
    | (OneDriveBrowserError | OneDriveAxiosError | BrowserAuthError | OneDriveError)
    | undefined {
    return this.errorBase?.error;
  }

  public isClosePopUpError() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveError(error)) {
      return helperIsClosePopUpError(error);
    }
    const { errorCode } = this.errorData;
    return errorCode === 'user_cancelled' || errorCode === 'access_denied';
  }

  public isFileNotFound() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveFileNotFoundError(error)) {
      return true;
    }
    const { statusCode, errorCode } = this.errorData;
    return statusCode === STATUS_CODE.NOT_FOUND && errorCode === 'itemNotFound';
  }

  public isAccessDenied() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveAccessDeniedError(error)) {
      return true;
    }
    const { statusCode, errorCode } = this.errorData;
    return statusCode === STATUS_CODE.FORBIDDEN && errorCode === 'accessDenied';
  }

  public isPopupBlockedError() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDrivePopupBlockedError(error)) {
      return true;
    }
    return this.errorData.errorCode === 'popup_window_error';
  }

  public isAuthenticationError() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveAuthenticationError(error)) {
      return true;
    }
    const { statusCode, errorCode } = this.errorData;
    return statusCode === STATUS_CODE.BAD_REQUEST && errorCode === 'AuthenticationError';
  }

  public isInvalidRequestError() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveInvalidRequestError(error)) {
      return true;
    }
    const { statusCode, errorCode } = this.errorData;
    return statusCode === STATUS_CODE.BAD_REQUEST && errorCode === 'invalidRequest';
  }

  public isAuthenticationCancelled() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveAuthenticationCancelledError(error)) {
      return true;
    }
    const { errorMessage } = this.errorData;
    return errorMessage === 'Authentication cancelled by user';
  }

  public isExpectedAuthError() {
    const error = this.getErrorFromProp();
    if (!error) {
      return false;
    }
    if (isOneDriveError(error)) {
      return helperIsExpectedAuthError(error);
    }
    const { errorMessage, errorCode } = this.errorData;
    return (
      errorMessage?.includes('Authentication failed:') ||
      errorMessage?.includes('No access token received') ||
      errorMessage?.includes('Authentication cancelled by user') ||
      errorCode === 'TokenValidationError' ||
      errorCode === 'TokenParseError' ||
      errorCode === 'AuthenticationError'
    );
  }

  get getErrorData() {
    return this.errorData;
  }
}

export {
  OneDriveError,
  OneDriveErrorCode,
  OneDriveAuthenticationError,
  OneDriveAuthenticationCancelledError,
  OneDriveAccessDeniedError,
  OneDriveFileNotFoundError,
  OneDrivePopupBlockedError,
  OneDriveInvalidRequestError,
  OneDriveTokenError,
  OneDriveUserCancelledError,
  isOneDriveError,
  isOneDriveAuthenticationError,
  isOneDriveAuthenticationCancelledError,
  isOneDriveAccessDeniedError,
  isOneDriveFileNotFoundError,
  isOneDrivePopupBlockedError,
  isOneDriveInvalidRequestError,
  isOneDriveTokenError,
  isOneDriveUserCancelledError
};

export default OneDriveErrorUtils;
