import get from 'lodash/get';

export const isFileNotFoundError = (error) => get(error, 'path[".tag"]', '') === 'not_found';

export const isTokenExpiredError = (error) => ['expired_access_token', 'invalid_access_token'].includes(get(error, '[".tag"]', ''));

export const isWrongPath = (error) => get(error, '[".tag"]', '') === 'path' && get(error, 'reason[".tag"]', '') === 'malformed_path';

export default {
  isFileNotFoundError,
  isTokenExpiredError,
  isWrongPath,
};
