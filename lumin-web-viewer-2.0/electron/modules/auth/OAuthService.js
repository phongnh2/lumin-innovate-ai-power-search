const { AuthWindowManager } = require('./AuthWindowManager');
const { EnvironmentService } = require('../../services/EnvironmentService');

class OAuthService {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.authWindowManager = null;
    this.envService = EnvironmentService.getInstance();
    this.baseUrl = this.envService.baseUrl;
  }

  async authenticate(options = {}) {
    return new Promise((resolve, reject) => {
      this.authWindowManager = new AuthWindowManager(this.mainWindow);

      const authUrl = this.buildAuthUrl(options);
      const windowConfig = this.getWindowConfig();
      const windowTitle = this.getWindowTitle();
      const callbackRoute = this.getCallbackRoute();

      this.authWindowManager.createWindow(windowConfig, windowTitle);

      this.authWindowManager.setupWindowEvents(() => {
        reject(new Error('Authentication window was closed by user'));
      });

      this.authWindowManager.setupRedirectHandlers(async (url) => {
        await this.handleRedirect(url, resolve, reject);
      }, callbackRoute);

      if (this.shouldSetupBlurHandler()) {
        this.authWindowManager.setupBlurHandler();
      }

      this.authWindowManager.loadUrl(authUrl).catch(reject);
    });
  }

  buildAuthUrl() {
    throw new Error('buildAuthUrl must be implemented by subclass');
  }

  getWindowConfig() {
    throw new Error('getWindowConfig must be implemented by subclass');
  }

  getWindowTitle() {
    throw new Error('getWindowTitle must be implemented by subclass');
  }

  getCallbackRoute() {
    throw new Error('getCallbackRoute must be implemented by subclass');
  }

  shouldSetupBlurHandler() {
    return false;
  }

  async handleRedirect() {
    throw new Error('handleRedirect must be implemented by subclass');
  }

  cleanup() {
    if (this.authWindowManager) {
      this.authWindowManager.close();
      this.authWindowManager = null;
    }
  }
}

module.exports = { OAuthService };
