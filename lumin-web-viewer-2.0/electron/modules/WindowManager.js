/* eslint-disable class-methods-use-this */
const crypto = require('crypto');
const { BrowserWindow, dialog, shell, app } = require('electron');
const path = require('path');

const { GoogleOAuthService } = require('./auth/GoogleOAuthService');
const { MicrosoftOAuthService } = require('./auth/MicrosoftOAuthService');
const {
  BROWSER_WINDOW_EVENTS,
  WEB_CONTENTS_EVENTS,
  DIALOG_TYPES,
  DIALOG_BUTTONS,
  DIALOG_TITLES,
  DIALOG_MESSAGES,
  ERROR_MESSAGES,
  ENVIRONMENT,
  OS_PLATFORM,
} = require('../constants');
const { isAllowedDomain } = require('../constants/domains');
const { IPC_DROPBOX_AUTH_COMPLETED } = require('../constants/ipcEvents');
const { IPC_WINDOW_MAXIMIZED, IPC_WINDOW_UNMAXIMIZED } = require('../constants/ipcEvents');
const { NETWORK_ERRORS } = require('../constants/networkErrors');
const { PROTOCOL_RETRY_CONNECTION } = require('../constants/protocols');
const { EnvironmentService } = require('../services/EnvironmentService');

const DROPBOX_AUTH_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Window Manager for Electron application
 */
class WindowManager {
  constructor() {
    /** @type {Electron.BrowserWindow | null} */
    this.mainWindow = null;

    const envService = EnvironmentService.getInstance();
    this.baseUrl = envService.baseUrl;
    this.isDev = process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;

    this.googleOAuthService = null;
    this.microsoftOAuthService = null;
    this.dropboxAuthSession = null;
  }

  /**
   * @returns {Electron.BrowserWindow}
   */
  createMainWindow() {
    const defaultSize = app.isPackaged ? { width: 1200, height: 800 } : { width: 1600, height: 1000 };

    this.mainWindow = new BrowserWindow({
      width: defaultSize.width,
      height: defaultSize.height,
      minWidth: defaultSize.width,
      minHeight: defaultSize.height,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
        webSecurity: false,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        sandbox: false,
      },
      icon: path.join(__dirname, '../../assets/favicon/favicon.ico'),
      show: false,
    });

    this.setupWindowEvents();
    this.setupWebContentsEvents();

    this.mainWindow.loadURL(this.baseUrl);

    if (!app.isPackaged) {
      this.mainWindow.webContents.openDevTools();
    }

    return this.mainWindow;
  }

  /**
   * @returns {Electron.BrowserWindow | null}
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * @returns {boolean}
   */
  hasWindows() {
    return BrowserWindow.getAllWindows().length > 0;
  }

  focusMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }

  /**
   * @param {string} url
   */
  loadUrl(url) {
    if (this.mainWindow) {
      this.mainWindow.loadURL(url);
      this.focusMainWindow();
    }
  }

  /**
   * @param {string} channel
   * @param {...any} args
   */
  sendToRenderer(channel, ...args) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  /**
   * @param {Electron.MessageBoxOptions} options
   * @returns {Promise<Electron.MessageBoxReturnValue | null>}
   */
  async showMessageBox(options) {
    if (this.mainWindow) {
      return dialog.showMessageBox(this.mainWindow, options);
    }
    return null;
  }

  /**
   * @param {Electron.SaveDialogOptions} options
   * @returns {Promise<Electron.SaveDialogReturnValue | null>}
   */
  async showSaveDialog(options) {
    if (this.mainWindow) {
      return dialog.showSaveDialog(this.mainWindow, options);
    }
    return null;
  }

  /**
   * @param {Electron.OpenDialogOptions} options
   * @returns {Promise<Electron.OpenDialogReturnValue | null>}
   */
  async showOpenDialog(options) {
    if (this.mainWindow) {
      return dialog.showOpenDialog(this.mainWindow, options);
    }
    return null;
  }

  setupWindowEvents() {
    if (!this.mainWindow) return;

    this.mainWindow.once(BROWSER_WINDOW_EVENTS.READY_TO_SHOW, () => {
      if (this.mainWindow) {
        this.mainWindow.show();
      }
    });

    this.mainWindow.on(BROWSER_WINDOW_EVENTS.CLOSE, (event) => {
      if (process.platform === OS_PLATFORM.DARWIN && !app.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    this.mainWindow.on(BROWSER_WINDOW_EVENTS.CLOSED, () => {
      this.mainWindow = null;
    });

    this.mainWindow.on(BROWSER_WINDOW_EVENTS.MAXIMIZE, () => {
      this.sendToRenderer(IPC_WINDOW_MAXIMIZED);
    });

    this.mainWindow.on(BROWSER_WINDOW_EVENTS.UNMAXIMIZE, () => {
      this.sendToRenderer(IPC_WINDOW_UNMAXIMIZED);
    });
  }

  setupWebContentsEvents() {
    if (!this.mainWindow) {
      return;
    }

    this.mainWindow.webContents.on(
      WEB_CONTENTS_EVENTS.DID_FAIL_LOAD,
      (event, errorCode, errorDescription, validatedURL) => {
        this.handleLoadFailure(errorCode, errorDescription, validatedURL);
      }
    );

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url).catch((error) => {
        console.error(
          'Error opening external URL:',
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
        );
      });
      return { action: 'deny' };
    });

    this.mainWindow.webContents.on(WEB_CONTENTS_EVENTS.WILL_NAVIGATE, async (event, navigationUrl) => {
      await this.handleNavigation(event, navigationUrl);
    });
  }

  /**
   * @param {number} errorCode
   * @param {string} errorDescription
   * @param {string} validatedURL
   */
  async handleLoadFailure(errorCode, errorDescription, validatedURL) {
    if (this.isDev) {
      console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    }

    if (NETWORK_ERRORS.includes(errorCode) && this.mainWindow) {
      await this.mainWindow.loadFile(path.join(__dirname, '../offline.html'));
    }
  }

  /**
   * @param {string} errorDescription
   */
  async showConnectionErrorDialog(errorDescription) {
    if (!this.mainWindow) {
      return;
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: DIALOG_TYPES.ERROR,
      title: DIALOG_TITLES.CONNECTION_ERROR,
      message: DIALOG_MESSAGES.CONNECTION_ERROR,
      detail: `${DIALOG_MESSAGES.CONNECTION_ERROR_DETAIL}\n\nError: ${errorDescription}`,
      buttons: [DIALOG_BUTTONS.RETRY, DIALOG_BUTTONS.QUIT],
    });

    if (result.response === 0 && this.mainWindow) {
      await this.mainWindow.loadURL(this.baseUrl);
    } else {
      app.quit();
    }
  }

  /**
   * @param {Electron.Event} event
   * @param {string} navigationUrl
   */
  async handleNavigation(event, navigationUrl) {
    if (navigationUrl === PROTOCOL_RETRY_CONNECTION && this.mainWindow) {
      event.preventDefault();
      await this.mainWindow.loadURL(this.baseUrl);
      return;
    }

    try {
      const parsedUrl = new URL(navigationUrl);

      const isLocalDevelopment = parsedUrl.hostname.includes('localhost') && this.isDev;
      if (!isAllowedDomain(parsedUrl.hostname) && !isLocalDevelopment) {
        event.preventDefault();
        await shell.openExternal(navigationUrl);
      }
    } catch (error) {
      event.preventDefault();
    }
  }

  minimize() {
    if (this.mainWindow) {
      this.mainWindow.minimize();
    }
  }

  toggleMaximize() {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    }
  }

  close() {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
  }

  /**
   * @returns {boolean}
   */
  isMaximized() {
    return this.mainWindow ? this.mainWindow.isMaximized() : false;
  }

  showMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  /**
   * @param {Object} options
   * @param {string} [options.prompt='select_account'] - OAuth prompt parameter
   * @param {string} [options.loginHint=''] - Email hint for account selection
   * @param {string[]} [options.scope] - Additional OAuth scopes
   * @returns {Promise<import('../types').GoogleTokenData>}
   */
  async authenticateWithGoogle(options = {}) {
    if (this.googleOAuthService) {
      this.googleOAuthService.cleanup();
    }

    this.googleOAuthService = new GoogleOAuthService(this.mainWindow);

    try {
      return await this.googleOAuthService.authenticate(options);
    } finally {
      this.googleOAuthService = null;
    }
  }

  /**
   * @param {Object} options
   * @param {string} [options.prompt='select_account'] - OAuth prompt parameter
   * @param {string} [options.loginHint=''] - Email hint for account selection
   * @param {string[]} [options.scopes] - OAuth scopes
   * @param {string} [options.authority] - Authority URL for Microsoft OAuth
   * @returns {Promise<import('../types').MicrosoftTokenData>}
   */
  async authenticateWithMicrosoft(options = {}) {
    if (this.microsoftOAuthService) {
      this.microsoftOAuthService.cleanup();
    }

    this.microsoftOAuthService = new MicrosoftOAuthService(this.mainWindow, { isDev: this.isDev });

    try {
      return await this.microsoftOAuthService.authenticate(options);
    } finally {
      this.microsoftOAuthService = null;
    }
  }

  async authenticateWithDropbox(options = {}) {
    const { authorizeUrl, state } = options;

    if (!authorizeUrl || typeof authorizeUrl !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_URL);
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(authorizeUrl);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INVALID_URL);
    }

    const requestState = typeof state === 'string' && state.length ? state : crypto.randomBytes(16).toString('hex');
    parsedUrl.searchParams.set('state', requestState);

    return new Promise((resolve, reject) => {
      if (this.dropboxAuthSession) {
        this.rejectDropboxAuthSession(new Error('Dropbox authentication already in progress'));
      }

      const timeout = setTimeout(() => {
        this.rejectDropboxAuthSession(new Error('Dropbox authentication timed out'), requestState);
      }, DROPBOX_AUTH_TIMEOUT_MS);

      this.dropboxAuthSession = {
        resolve,
        reject,
        state: requestState,
        timeout,
      };

      shell.openExternal(parsedUrl.toString()).catch((error) => {
        this.rejectDropboxAuthSession(error, requestState);
      });
    });
  }

  notifyDropboxAuth(payload) {
    this.sendToRenderer(IPC_DROPBOX_AUTH_COMPLETED, payload);
  }

  clearDropboxAuthSession() {
    if (this.dropboxAuthSession?.timeout) {
      clearTimeout(this.dropboxAuthSession.timeout);
    }
    this.dropboxAuthSession = null;
  }

  rejectDropboxAuthSession(error, stateToMatch) {
    const session = this.dropboxAuthSession;
    if (!session) {
      return;
    }

    if (stateToMatch && session.state && session.state !== stateToMatch) {
      return;
    }

    this.clearDropboxAuthSession();

    const normalizedError =
      error instanceof Error ? error : new Error(typeof error === 'string' ? error : ERROR_MESSAGES.UNKNOWN_ERROR);

    this.notifyDropboxAuth({
      error: normalizedError.message,
      state: stateToMatch || session.state,
    });

    session.reject(normalizedError);
  }

  completeDropboxAuth({ token = null, error = null, state = null } = {}) {
    const session = this.dropboxAuthSession;
    const payload = {
      token,
      error,
      state: state || session?.state || null,
    };

    if (session) {
      if (state && session.state && session.state !== state) {
        this.notifyDropboxAuth(payload);
        return;
      }

      this.clearDropboxAuthSession();
      this.notifyDropboxAuth(payload);

      if (payload.error) {
        session.reject(new Error(payload.error));
        return;
      }

      if (!payload.token) {
        session.reject(new Error(ERROR_MESSAGES.NO_TOKEN_DATA_RECEIVED));
        return;
      }

      session.resolve({ token: payload.token, state: payload.state });
      this.showMainWindow();
      return;
    }

    this.notifyDropboxAuth(payload);
    if (!payload.error && payload.token) {
      this.showMainWindow();
    }
  }

  cancelDropboxAuthentication() {
    if (this.dropboxAuthSession) {
      this.rejectDropboxAuthSession(new Error('Dropbox authentication cancelled'));
    }
  }

  closeMicrosoftAuthWindow() {
    if (this.microsoftOAuthService) {
      this.microsoftOAuthService.cleanup();
    }
  }
}

module.exports = { WindowManager };
