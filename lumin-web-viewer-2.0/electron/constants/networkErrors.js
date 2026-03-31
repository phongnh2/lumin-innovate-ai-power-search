/**
 * Network error codes used by Chromium/Electron
 * Reference: https://chromium.googlesource.com/chromium/src/+/master/net/base/net_error_list.h
 */

/**
 * @enum {number}
 */
const NETWORK_ERROR_CODES = {
  ERR_INTERNET_DISCONNECTED: -106,
  ERR_NAME_NOT_RESOLVED: -105,
  ERR_CONNECTION_TIMED_OUT: -118,
};

const NETWORK_ERRORS = Object.values(NETWORK_ERROR_CODES);

module.exports = {
  NETWORK_ERROR_CODES,
  NETWORK_ERRORS,
};
