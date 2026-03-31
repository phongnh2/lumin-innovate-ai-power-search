import { BrowserAuthError } from '@azure/msal-browser';
import { AxiosError } from 'axios';

export enum OneDriveErrorCode {
  ACCESS_DENIED = 'accessDenied',
  ITEM_NOT_FOUND = 'itemNotFound',
  QUOTA_LIMIT_REACHED = 'quotaLimitReached',
  AUTHENTICATION_ERROR = 'AuthenticationError',
  AUTHENTICATION_CANCELLED = 'authenticationCancelled',
  INVALID_REQUEST = 'invalidRequest',
  POPUP_BLOCKED = 'popup_window_error',
  USER_CANCELLED = 'user_cancelled',
  TOKEN_VALIDATION_ERROR = 'TokenValidationError',
  TOKEN_PARSE_ERROR = 'TokenParseError',
  NO_ACCESS_TOKEN = 'noAccessToken',
  UNKNOWN_ERROR = 'unknownError',
}

export interface OneDriveErrorDetails {
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  correlationId?: string;
  subError?: string;
  [key: string]: any;
}

export class OneDriveError extends Error {
  public readonly code: OneDriveErrorCode;

  public readonly statusCode?: number;

  public readonly details?: OneDriveErrorDetails;

  public readonly originalError?: Error | BrowserAuthError | AxiosError;

  constructor(
    message: string,
    code: OneDriveErrorCode,
    statusCode?: number,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message);
    this.name = 'OneDriveError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.originalError = originalError;

    Object.setPrototypeOf(this, OneDriveError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

export class OneDriveAuthenticationError extends OneDriveError {
  constructor(
    message = 'Authentication failed',
    statusCode?: number,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.AUTHENTICATION_ERROR, statusCode, details, originalError);
    this.name = 'OneDriveAuthenticationError';
    Object.setPrototypeOf(this, OneDriveAuthenticationError.prototype);
  }
}

export class OneDriveAuthenticationCancelledError extends OneDriveError {
  constructor(
    message = 'Authentication cancelled by user',
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.AUTHENTICATION_CANCELLED, undefined, details, originalError);
    this.name = 'OneDriveAuthenticationCancelledError';
    Object.setPrototypeOf(this, OneDriveAuthenticationCancelledError.prototype);
  }
}

export class OneDriveAccessDeniedError extends OneDriveError {
  constructor(
    message = 'Access denied',
    statusCode = 403,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.ACCESS_DENIED, statusCode, details, originalError);
    this.name = 'OneDriveAccessDeniedError';
    Object.setPrototypeOf(this, OneDriveAccessDeniedError.prototype);
  }
}

export class OneDriveFileNotFoundError extends OneDriveError {
  constructor(
    message = 'File not found',
    statusCode = 404,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.ITEM_NOT_FOUND, statusCode, details, originalError);
    this.name = 'OneDriveFileNotFoundError';
    Object.setPrototypeOf(this, OneDriveFileNotFoundError.prototype);
  }
}

export class OneDrivePopupBlockedError extends OneDriveError {
  constructor(
    message = 'Popup window was blocked',
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.POPUP_BLOCKED, undefined, details, originalError);
    this.name = 'OneDrivePopupBlockedError';
    Object.setPrototypeOf(this, OneDrivePopupBlockedError.prototype);
  }
}

export class OneDriveInvalidRequestError extends OneDriveError {
  constructor(
    message = 'Invalid request',
    statusCode = 400,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.INVALID_REQUEST, statusCode, details, originalError);
    this.name = 'OneDriveInvalidRequestError';
    Object.setPrototypeOf(this, OneDriveInvalidRequestError.prototype);
  }
}

export class OneDriveTokenError extends OneDriveError {
  constructor(
    message: string,
    code:
      | OneDriveErrorCode.TOKEN_VALIDATION_ERROR
      | OneDriveErrorCode.TOKEN_PARSE_ERROR
      | OneDriveErrorCode.NO_ACCESS_TOKEN,
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, code, undefined, details, originalError);
    this.name = 'OneDriveTokenError';
    Object.setPrototypeOf(this, OneDriveTokenError.prototype);
  }
}

export class OneDriveUserCancelledError extends OneDriveError {
  constructor(
    message = 'User cancelled the operation',
    details?: OneDriveErrorDetails,
    originalError?: Error | BrowserAuthError | AxiosError
  ) {
    super(message, OneDriveErrorCode.USER_CANCELLED, undefined, details, originalError);
    this.name = 'OneDriveUserCancelledError';
    Object.setPrototypeOf(this, OneDriveUserCancelledError.prototype);
  }
}
