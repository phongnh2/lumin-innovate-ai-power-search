import get from 'lodash/get';

export const isFileNotFoundError = (error) =>
  (error.code === 404 && get(error, 'data[0].reason') === 'notFound') ||
  error.message?.includes('File not found') ||
  false;

export const isSigninRequiredError = (error) => error.message === 'signinRequired';

export const isSigninDriveRequiredError = (error) => error.message === 'signinDriveRequired';

export const isPermissionRequiredError = (error) => error.message === 'permissionRequired';

export const isUnauthorizedError = (error) => error.message === 'unauthorized';

export const isBlockPopUpError = (error) => error.type === 'popup_failed_to_open';

export const isInvalidCredential = (error) => error && error.code === 401;

export const isFileNotFound = (error) =>
  get(error, 'result.error.code') === 404 && get(error, 'result.error.errors[0].reason') === 'notFound';

export const isClosePopUpError = (error) => error && error.type === 'popup_closed';

export const isAccessDeniedError = (error) => error && error.message === 'access_denied';

export default {
  isFileNotFoundError,
  isSigninRequiredError,
  isSigninDriveRequiredError,
  isUnauthorizedError,
  isFileNotFound,
  isInvalidCredential,
  isPermissionRequiredError,
  isBlockPopUpError,
  isClosePopUpError,
  isAccessDeniedError,
};
