const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'Unknown error',
  INVALID_FILE_PATH: 'Invalid file path provided',
  INVALID_DATA: 'Invalid data provided - must be string',
  PATH_NOT_FILE: 'Path is not a file',
  FAILED_READ_FILE: 'Failed to read file:',
  FAILED_WRITE_FILE: 'Failed to write file:',
  FAILED_OPEN_FILE: 'Failed to open file:',
  FAILED_INITIALIZE_APP: 'Failed to initialize application:',
  FAILED_SETUP_SERVICES: 'Failed to setup services:',
  FAILED_HANDLE_PROTOCOL_URL: 'Failed to handle protocol URL:',
  INVALID_URL: 'Invalid URL provided',
  MAIN_WINDOW_NOT_AVAILABLE: 'Main window not available',
  GOOGLE_PICKER_CLIENT_ID_NOT_SET: 'Google picker client ID is not set',
  MICROSOFT_CLIENT_ID_NOT_SET: 'Microsoft client ID is not set',
  AUTHENTICATION_FAILED: 'Authentication failed:',
  AUTHENTICATION_FAILED_NO_TOKEN: 'Authentication failed: No access token received',
  FAILED_GET_USER_INFO: 'Failed to get user info:',
  FAILED_PARSE_AUTH_RESPONSE: 'Failed to parse authentication response:',
  NO_TOKEN_DATA_RECEIVED: 'No token data received from authentication',
  FAILED_STORE_AUTH_TOKEN: 'Failed to store authentication token:',
};

module.exports = {
  ERROR_MESSAGES,
};
