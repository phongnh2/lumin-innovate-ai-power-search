class OAuthCallbackHandler {
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  async handleCallback() {
    throw new Error('handleCallback must be implemented by subclass');
  }

  async showError() {
    throw new Error('showError must be implemented by subclass');
  }
}

module.exports = { OAuthCallbackHandler };
