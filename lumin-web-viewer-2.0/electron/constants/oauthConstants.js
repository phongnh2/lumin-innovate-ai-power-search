const OAUTH2_PARAMS = {
  PROVIDER: 'provider',
  CLIENT_ID: 'client_id',
  RESPONSE_TYPE: 'response_type',
  SCOPE: 'scope',
  REDIRECT_URI: 'redirect_uri',
  STATE: 'state',
  PROMPT: 'prompt',
  ACCESS_TOKEN: 'access_token',
  ID_TOKEN: 'id_token',
  ERROR: 'error',
  ERROR_DESCRIPTION: 'error_description',
  TOKEN: 'token',
};

const OAUTH2_VALUES = {
  TOKEN: 'token',
  CONSENT: 'consent',
  SELECT_ACCOUNT: 'select_account',
  ELECTRON_BROWSERWINDOW_AUTH: 'electron_browserwindow_auth',
};

const OAUTH2_PROVIDERS = {
  MICROSOFT: 'microsoft',
  GOOGLE: 'google',
  DROPBOX: 'dropbox',
};

const GOOGLE_API_SCOPES = {
  PROFILE: 'profile',
  EMAIL: 'email',
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
};

const GOOGLE_API_ENDPOINTS = {
  OAUTH2_AUTH: 'https://accounts.google.com/o/oauth2/v2/auth',
  USER_INFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

const MICROSOFT_API_SCOPES = {
  OPENID: 'openid',
  PROFILE: 'profile',
  EMAIL: 'email',
  USER_READ: 'User.Read',
  FILES_READ_WRITE_ALL: 'Files.ReadWrite.All',
};

const MICROSOFT_API_ENDPOINTS = {
  OAUTH2_AUTH: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  USER_INFO: 'https://graph.microsoft.com/v1.0/me',
};

module.exports = {
  OAUTH2_PARAMS,
  OAUTH2_VALUES,
  GOOGLE_API_SCOPES,
  GOOGLE_API_ENDPOINTS,
  MICROSOFT_API_SCOPES,
  MICROSOFT_API_ENDPOINTS,
  OAUTH2_PROVIDERS,
};
