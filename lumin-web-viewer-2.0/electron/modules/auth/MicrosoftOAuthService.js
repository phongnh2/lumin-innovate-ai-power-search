const { AUTH_WINDOW_CONFIG, DEFAULT_SCOPES, AUTH_DEFAULTS } = require('./config/OAuthConfig');
const { MicrosoftOAuthHandler } = require('./handlers/MicrosoftOAuthHandler');
const { OAuthService } = require('./OAuthService');
const { ERROR_MESSAGES, WINDOW_TITLES } = require('../../constants');
const { ELECTRON_ROUTERS } = require('../../constants/routers');

class MicrosoftOAuthService extends OAuthService {
  constructor(mainWindow, options = {}) {
    super(mainWindow);
    this.oauthHandler = options.oauthHandler || new MicrosoftOAuthHandler({ isDev: options.isDev });
  }

  buildAuthUrl(options = {}) {
    const { prompt = AUTH_DEFAULTS.MICROSOFT.prompt, loginHint = '', scopes = [], authority = '' } = options;

    const clientId = this.envService.microsoftClientId;

    if (!clientId) {
      throw new Error(ERROR_MESSAGES.MICROSOFT_CLIENT_ID_NOT_SET);
    }

    const requestedScopes = scopes.length > 0 ? scopes : DEFAULT_SCOPES.MICROSOFT;
    const finalScopes = [...new Set([...DEFAULT_SCOPES.MICROSOFT_REQUIRED, ...requestedScopes])];

    const authUrl = authority || AUTH_DEFAULTS.MICROSOFT.authority;
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: AUTH_DEFAULTS.MICROSOFT.responseType,
      redirect_uri: `${this.baseUrl}${ELECTRON_ROUTERS.MICROSOFT_OAUTH_CALLBACK}`,
      scope: finalScopes.join(' '),
      response_mode: AUTH_DEFAULTS.MICROSOFT.responseMode,
      prompt,
      nonce: Date.now().toString(),
    });

    if (loginHint) {
      params.append('login_hint', loginHint);
    }

    return `${authUrl}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  getWindowConfig() {
    return AUTH_WINDOW_CONFIG.MICROSOFT;
  }

  getWindowTitle() {
    return WINDOW_TITLES.MICROSOFT_AUTHENTICATION;
  }

  getCallbackRoute() {
    return ELECTRON_ROUTERS.MICROSOFT_OAUTH_CALLBACK;
  }

  shouldSetupBlurHandler() {
    return false;
  }

  async handleRedirect(url, resolve, reject) {
    try {
      const tokenData = this.oauthHandler.handleRedirect(url, ELECTRON_ROUTERS.MICROSOFT_OAUTH_CALLBACK);

      if (tokenData) {
        this.cleanup();
        resolve(tokenData);
      }
    } catch (error) {
      this.cleanup();
      reject(error instanceof Error ? error : new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }
  }
}

module.exports = { MicrosoftOAuthService };
