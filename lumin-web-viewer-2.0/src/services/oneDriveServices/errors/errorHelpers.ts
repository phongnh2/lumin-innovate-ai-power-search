import {
  OneDriveError,
  OneDriveAuthenticationError,
  OneDriveAuthenticationCancelledError,
  OneDriveAccessDeniedError,
  OneDriveFileNotFoundError,
  OneDrivePopupBlockedError,
  OneDriveInvalidRequestError,
  OneDriveTokenError,
  OneDriveUserCancelledError,
  OneDriveErrorCode,
} from './OneDriveError';

export function isOneDriveError(error: unknown): error is OneDriveError {
  return error instanceof OneDriveError;
}

export function isOneDriveAuthenticationError(error: unknown): error is OneDriveAuthenticationError {
  return error instanceof OneDriveAuthenticationError;
}

export function isOneDriveAuthenticationCancelledError(error: unknown): error is OneDriveAuthenticationCancelledError {
  return error instanceof OneDriveAuthenticationCancelledError;
}

export function isOneDriveAccessDeniedError(error: unknown): error is OneDriveAccessDeniedError {
  return error instanceof OneDriveAccessDeniedError;
}

export function isOneDriveFileNotFoundError(error: unknown): error is OneDriveFileNotFoundError {
  return error instanceof OneDriveFileNotFoundError;
}

export function isOneDrivePopupBlockedError(error: unknown): error is OneDrivePopupBlockedError {
  return error instanceof OneDrivePopupBlockedError;
}

export function isOneDriveInvalidRequestError(error: unknown): error is OneDriveInvalidRequestError {
  return error instanceof OneDriveInvalidRequestError;
}

export function isOneDriveTokenError(error: unknown): error is OneDriveTokenError {
  return error instanceof OneDriveTokenError;
}

export function isOneDriveUserCancelledError(error: unknown): error is OneDriveUserCancelledError {
  return error instanceof OneDriveUserCancelledError;
}

export function isClosePopUpError(error: unknown): boolean {
  if (!isOneDriveError(error)) {
    return false;
  }
  return error.code === OneDriveErrorCode.USER_CANCELLED || error.code === OneDriveErrorCode.ACCESS_DENIED;
}

export function isExpectedAuthError(error: unknown): boolean {
  if (!isOneDriveError(error)) {
    return false;
  }

  const authenticationFailedMessage = error.message?.includes('Authentication failed:');
  const noAccessTokenMessage = error.message?.includes('No access token received');
  const authCancelledMessage = error.message?.includes('Authentication cancelled by user');

  return (
    authenticationFailedMessage ||
    noAccessTokenMessage ||
    authCancelledMessage ||
    error.code === OneDriveErrorCode.TOKEN_VALIDATION_ERROR ||
    error.code === OneDriveErrorCode.TOKEN_PARSE_ERROR ||
    error.code === OneDriveErrorCode.AUTHENTICATION_ERROR
  );
}
