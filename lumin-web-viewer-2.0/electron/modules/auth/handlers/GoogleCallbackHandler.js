const { OAuthCallbackHandler } = require('./OAuthCallbackHandler');
const { ERROR_MESSAGES, DIALOG_TYPES, DIALOG_TITLES, DIALOG_BUTTONS } = require('../../../constants');
const { OAUTH2_PARAMS } = require('../../../constants/oauthConstants');
const { ELECTRON_ROUTERS } = require('../../../constants/routers');
const { EnvironmentService } = require('../../../services/EnvironmentService');

class GoogleCallbackHandler extends OAuthCallbackHandler {
  constructor(windowManager) {
    super(windowManager);
    this.environmentService = EnvironmentService.getInstance();
  }

  async handleCallback(params) {
    const tokenParam = params.get(OAUTH2_PARAMS.TOKEN);

    if (!tokenParam) {
      await this.showError(ERROR_MESSAGES.NO_TOKEN_DATA_RECEIVED);
      return;
    }

    try {
      this.storeOAuthToken(tokenParam);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.showError(`${ERROR_MESSAGES.FAILED_STORE_AUTH_TOKEN} ${errorMessage}`);
    }
  }

  storeOAuthToken(token) {
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow?.webContents) {
      throw new Error(ERROR_MESSAGES.MAIN_WINDOW_NOT_AVAILABLE);
    }

    const newUrl = `${this.environmentService.authServiceUrl}${ELECTRON_ROUTERS.OAUTH2_CALLBACK}?token=${token}`;
    this.windowManager.loadUrl(newUrl);
  }

  async showError(error) {
    await this.windowManager.showMessageBox({
      type: DIALOG_TYPES.ERROR,
      title: DIALOG_TITLES.AUTHENTICATION_FAILED,
      message: `${ERROR_MESSAGES.AUTHENTICATION_FAILED} ${error}`,
      buttons: [DIALOG_BUTTONS.OK],
    });
  }
}

module.exports = { GoogleCallbackHandler };
