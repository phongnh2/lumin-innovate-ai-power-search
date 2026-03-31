const { DropboxCallbackHandler } = require('./auth/handlers/DropboxCallbackHandler');
const { GoogleCallbackHandler } = require('./auth/handlers/GoogleCallbackHandler');
const { MicrosoftCallbackHandler } = require('./auth/handlers/MicrosoftCallbackHandler');
const {
  OAUTH2_PARAMS,
  DIALOG_TYPES,
  DIALOG_BUTTONS,
  DIALOG_TITLES,
  ERROR_MESSAGES,
  OAUTH2_PROVIDERS,
} = require('../constants');
const { PROTOCOL_SCHEME } = require('../constants/protocols');
const { ELECTRON_ROUTERS } = require('../constants/routers');
const { EnvironmentService } = require('../services/EnvironmentService');
const { ElectronModuleError } = require('../types');

/**
 * Protocol Handler for custom URL schemes
 */
class ProtocolHandler {
  /**
   * @param {import('../types').IWindowManager} windowManager
   */
  constructor(windowManager) {
    this.windowManager = windowManager;
    const envService = EnvironmentService.getInstance();
    this.baseUrl = envService.baseUrl;

    this.oauthHandlers = new Map();
    this.oauthHandlers.set(OAUTH2_PROVIDERS.GOOGLE, new GoogleCallbackHandler(windowManager));
    this.oauthHandlers.set(OAUTH2_PROVIDERS.MICROSOFT, new MicrosoftCallbackHandler(windowManager));
    this.oauthHandlers.set(OAUTH2_PROVIDERS.DROPBOX, new DropboxCallbackHandler(windowManager));
  }

  async handleStartupProtocol() {
    const protocolUrl = process.argv.find((arg) => arg.startsWith(PROTOCOL_SCHEME));
    if (protocolUrl) {
      await this.handleProtocolUrl(protocolUrl);
    }
  }

  /**
   * @param {string} url
   */
  async handleProtocolUrl(url) {
    try {
      const { fullPath, params } = this.parseCustomProtocolUrl(url);

      if (fullPath === ELECTRON_ROUTERS.OAUTH2_CALLBACK) {
        await this.handleOAuthCallback(params);
        return;
      }

      this.navigateToUrl(fullPath, params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error handling protocol URL:', error);
      throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_HANDLE_PROTOCOL_URL} ${errorMessage}`, 'ProtocolHandler');
    }
  }

  cleanup() {
    // No cleanup needed
  }

  /**
   * @param {string} url
   * @returns {import('../types').ProtocolUrlData}
   */
  parseCustomProtocolUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new ElectronModuleError(ERROR_MESSAGES.INVALID_URL, 'ProtocolHandler');
    }

    const urlWithoutProtocol = url.replace(PROTOCOL_SCHEME, '');
    const [pathPart, queryPart] = urlWithoutProtocol.split('?');
    const params = new URLSearchParams(queryPart || '');
    const fullPath = `/${pathPart}`;

    return {
      fullPath,
      params,
    };
  }

  /**
   * @param {URLSearchParams} params
   */
  async handleOAuthCallback(params) {
    const provider = params.get(OAUTH2_PARAMS.PROVIDER);
    const error = params.get(OAUTH2_PARAMS.ERROR);

    if (error) {
      const errorDescription = params.get(OAUTH2_PARAMS.ERROR_DESCRIPTION) || error;

      if (provider === OAUTH2_PROVIDERS.DROPBOX) {
        this.windowManager.completeDropboxAuth({
          error: errorDescription,
          state: params.get(OAUTH2_PARAMS.STATE),
        });
      }

      await this.showOAuthError(`${ERROR_MESSAGES.AUTHENTICATION_FAILED} ${errorDescription}`);
      return;
    }

    const handler = this.oauthHandlers.get(provider);

    if (handler) {
      await handler.handleCallback(params);
    } else {
      await this.showOAuthError(`Unknown OAuth provider: ${provider || 'not specified'}`);
    }
  }

  /**
   * @param {string} error
   */
  async showOAuthError(error) {
    await this.windowManager.showMessageBox({
      type: DIALOG_TYPES.ERROR,
      title: DIALOG_TITLES.AUTHENTICATION_FAILED,
      message: `${ERROR_MESSAGES.AUTHENTICATION_FAILED} ${error}`,
      buttons: [DIALOG_BUTTONS.OK],
    });
  }

  /**
   * @param {string} fullPath
   * @param {URLSearchParams} params
   */
  navigateToUrl(fullPath, params) {
    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow) {
      const targetUrl = `${this.baseUrl}${fullPath}?${params.toString()}`;
      this.windowManager.loadUrl(targetUrl);
    }
  }
}

module.exports = { ProtocolHandler };
