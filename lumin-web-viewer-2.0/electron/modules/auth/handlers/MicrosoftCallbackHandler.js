const { OAuthCallbackHandler } = require('./OAuthCallbackHandler');
const { ERROR_MESSAGES, DIALOG_TYPES, DIALOG_TITLES, DIALOG_BUTTONS } = require('../../../constants');
const { OAUTH2_PARAMS } = require('../../../constants/oauthConstants');

class MicrosoftCallbackHandler extends OAuthCallbackHandler {
  async handleCallback(params) {
    const accessToken = params.get(OAUTH2_PARAMS.ACCESS_TOKEN);

    if (!accessToken) {
      await this.showError(ERROR_MESSAGES.NO_TOKEN_DATA_RECEIVED);
      return;
    }

    try {
      this.storeMicrosoftOAuthToken();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.showError(`${ERROR_MESSAGES.FAILED_STORE_AUTH_TOKEN} ${errorMessage}`);
    }
  }

  storeMicrosoftOAuthToken() {
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow?.webContents) {
      throw new Error(ERROR_MESSAGES.MAIN_WINDOW_NOT_AVAILABLE);
    }
    this.windowManager.closeMicrosoftAuthWindow();
    this.windowManager.focusMainWindow();
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

module.exports = { MicrosoftCallbackHandler };
