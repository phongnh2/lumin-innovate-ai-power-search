const { AUTH_WINDOW_CONFIG, DEFAULT_SCOPES, AUTH_DEFAULTS } = require('./config/OAuthConfig');
const { OAuthService } = require('./OAuthService');
const {
  OAUTH2_PARAMS,
  OAUTH2_VALUES,
  GOOGLE_API_ENDPOINTS,
  ERROR_MESSAGES,
  WINDOW_TITLES,
} = require('../../constants');
const { ELECTRON_ROUTERS } = require('../../constants/routers');

class GoogleOAuthService extends OAuthService {
  buildAuthUrl(options = {}) {
    const { prompt = AUTH_DEFAULTS.GOOGLE.prompt, loginHint = '', scope: additionalScopes = [] } = options;

    const scopes = [...DEFAULT_SCOPES.GOOGLE, ...additionalScopes];

    const clientId = this.envService.googlePickerClientId;

    if (!clientId) {
      throw new Error(ERROR_MESSAGES.GOOGLE_PICKER_CLIENT_ID_NOT_SET);
    }

    const params = new URLSearchParams({
      [OAUTH2_PARAMS.CLIENT_ID]: clientId,
      [OAUTH2_PARAMS.RESPONSE_TYPE]: OAUTH2_VALUES.TOKEN,
      [OAUTH2_PARAMS.SCOPE]: scopes.join(' '),
      [OAUTH2_PARAMS.REDIRECT_URI]: `${this.baseUrl}${ELECTRON_ROUTERS.OAUTH2_CALLBACK}`,
      [OAUTH2_PARAMS.STATE]: OAUTH2_VALUES.ELECTRON_BROWSERWINDOW_AUTH,
      [OAUTH2_PARAMS.PROMPT]: prompt,
    });

    if (loginHint) {
      params.append('login_hint', loginHint);
    }

    return `${GOOGLE_API_ENDPOINTS.OAUTH2_AUTH}?${params.toString()}`;
  }

  getWindowConfig() {
    return AUTH_WINDOW_CONFIG.GOOGLE;
  }

  getWindowTitle() {
    return WINDOW_TITLES.GOOGLE_AUTHENTICATION;
  }

  getCallbackRoute() {
    return ELECTRON_ROUTERS.OAUTH2_CALLBACK;
  }

  shouldSetupBlurHandler() {
    return true;
  }

  async handleRedirect(url, resolve, reject) {
    try {
      if (url.includes(ELECTRON_ROUTERS.OAUTH2_CALLBACK)) {
        const parsedUrl = new URL(url);
        const hash = parsedUrl.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get(OAUTH2_PARAMS.ACCESS_TOKEN);
        const scope = params.get(OAUTH2_PARAMS.SCOPE);
        const error = params.get(OAUTH2_PARAMS.ERROR);

        if (error) {
          this.cleanup();
          reject(
            new Error(`${ERROR_MESSAGES.AUTHENTICATION_FAILED} ${params.get(OAUTH2_PARAMS.ERROR_DESCRIPTION) || error}`)
          );
          return;
        }

        if (!accessToken) {
          this.cleanup();
          reject(new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED_NO_TOKEN));
          return;
        }

        try {
          const userInfoResponse = await fetch(GOOGLE_API_ENDPOINTS.USER_INFO, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const userInfo = await userInfoResponse.json();

          const tokenData = {
            access_token: accessToken,
            scope: scope || '',
            email: userInfo.email,
          };

          this.cleanup();
          resolve(tokenData);
        } catch (apiError) {
          this.cleanup();
          reject(
            new Error(
              `${ERROR_MESSAGES.FAILED_GET_USER_INFO} ${
                apiError instanceof Error ? apiError.message : ERROR_MESSAGES.UNKNOWN_ERROR
              }`
            )
          );
        }
      }
    } catch (parseError) {
      this.cleanup();
      reject(
        new Error(
          `${ERROR_MESSAGES.FAILED_PARSE_AUTH_RESPONSE} ${
            parseError instanceof Error ? parseError.message : ERROR_MESSAGES.UNKNOWN_ERROR
          }`
        )
      );
    }
  }
}

module.exports = { GoogleOAuthService };
