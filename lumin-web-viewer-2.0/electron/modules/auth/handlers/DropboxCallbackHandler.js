const { OAuthCallbackHandler } = require('./OAuthCallbackHandler');
const { ERROR_MESSAGES, DIALOG_TYPES, DIALOG_TITLES, DIALOG_BUTTONS } = require('../../../constants');
const { OAUTH2_PARAMS } = require('../../../constants/oauthConstants');

class DropboxCallbackHandler extends OAuthCallbackHandler {
  async handleCallback(params) {
    const token = params.get(OAUTH2_PARAMS.TOKEN) || params.get(OAUTH2_PARAMS.ACCESS_TOKEN);
    const errorCode = params.get(OAUTH2_PARAMS.ERROR);
    const errorDescription = params.get(OAUTH2_PARAMS.ERROR_DESCRIPTION);
    const state = params.get(OAUTH2_PARAMS.STATE);

    if (errorCode) {
      const message = errorDescription || errorCode;
      this.windowManager.completeDropboxAuth({ error: message, state });
      await this.showError(message);
      return;
    }

    if (!token) {
      const message = ERROR_MESSAGES.NO_TOKEN_DATA_RECEIVED;
      this.windowManager.completeDropboxAuth({ error: message, state });
      await this.showError(message);
      return;
    }

    this.windowManager.completeDropboxAuth({ token, state });
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

module.exports = { DropboxCallbackHandler };
