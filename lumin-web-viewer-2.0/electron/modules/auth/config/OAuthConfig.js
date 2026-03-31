const { GOOGLE_API_SCOPES, MICROSOFT_API_SCOPES } = require('../../../constants/oauthConstants');

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const AUTH_WINDOW_CONFIG = {
  GOOGLE: {
    width: 800,
    height: 600,
    modal: false,
    resizable: false,
    closable: true,
    alwaysOnTop: true,
    frame: true,
    autoHideMenuBar: true,
  },
  MICROSOFT: {
    width: 800,
    height: 600,
    modal: false,
    resizable: false,
    closable: true,
    alwaysOnTop: true,
    frame: true,
    autoHideMenuBar: true,
  },
};

const DEFAULT_SCOPES = {
  GOOGLE: [GOOGLE_API_SCOPES.PROFILE, GOOGLE_API_SCOPES.EMAIL, GOOGLE_API_SCOPES.DRIVE_FILE],
  MICROSOFT: [
    MICROSOFT_API_SCOPES.OPENID,
    MICROSOFT_API_SCOPES.PROFILE,
    MICROSOFT_API_SCOPES.EMAIL,
    MICROSOFT_API_SCOPES.USER_READ,
    MICROSOFT_API_SCOPES.FILES_READ_WRITE_ALL,
  ],
  MICROSOFT_REQUIRED: [MICROSOFT_API_SCOPES.OPENID, MICROSOFT_API_SCOPES.PROFILE, MICROSOFT_API_SCOPES.EMAIL],
};

const AUTH_DEFAULTS = {
  GOOGLE: {
    prompt: 'select_account',
    responseType: 'token',
  },
  MICROSOFT: {
    prompt: 'select_account',
    responseType: 'token id_token',
    responseMode: 'fragment',
    authority: 'https://login.microsoftonline.com/common',
  },
};

module.exports = {
  TOKEN_EXPIRY_MS,
  AUTH_WINDOW_CONFIG,
  DEFAULT_SCOPES,
  AUTH_DEFAULTS,
};
