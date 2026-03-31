import { get } from 'lodash';

import {
  isOneDriveAccessDeniedError,
  isOneDriveAuthenticationError,
  isOneDriveInvalidRequestError,
  isOneDriveError,
} from 'services/oneDriveServices';

import { isTokenExpiredError } from 'utils/dropboxError';
import { isUnauthorizedError, isSigninDriveRequiredError, isPermissionRequiredError } from 'utils/googleDriveError';
import OneDriveErrorUtils, { ErrorBase } from 'utils/oneDriveError';

/**
 * Check if error is a re-authorizable third-party authentication error
 */
export const isReAuthorizableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  // GoogleDrive
  if (isUnauthorizedError(error) || isSigninDriveRequiredError(error) || isPermissionRequiredError(error)) {
    return true;
  }

  // OneDrive
  if (
    isOneDriveAccessDeniedError(error) ||
    isOneDriveAuthenticationError(error) ||
    isOneDriveInvalidRequestError(error)
  ) {
    return true;
  }

  if (!isOneDriveError(error)) {
    const errors = [{ error }] as [ErrorBase];
    const oneDriveErrorUtils = new OneDriveErrorUtils(errors);
    if (
      oneDriveErrorUtils.isAccessDenied() ||
      oneDriveErrorUtils.isAuthenticationError() ||
      oneDriveErrorUtils.isInvalidRequestError()
    ) {
      return true;
    }
  }

  // Dropbox
  return isTokenExpiredError(get(error, 'response.data.error'));
};
