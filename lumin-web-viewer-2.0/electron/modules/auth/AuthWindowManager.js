const { BrowserWindow } = require('electron');

const { BROWSER_WINDOW_EVENTS, WEB_CONTENTS_EVENTS } = require('../../constants');

class AuthWindowManager {
  constructor(parentWindow = null) {
    this.parentWindow = parentWindow;
    this.authWindow = null;
    this.isAuthCompleted = false;
    this.handleRedirect = null;
    this.handleClosed = null;
    this.handleBlur = null;
  }

  createWindow(config, title) {
    if (this.authWindow && !this.authWindow.isDestroyed()) {
      this.authWindow.destroy();
    }

    this.isAuthCompleted = false;

    this.authWindow = new BrowserWindow({
      width: config.width,
      height: config.height,
      parent: this.parentWindow || undefined,
      modal: config.modal,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        sandbox: true,
      },
      autoHideMenuBar: config.autoHideMenuBar,
      resizable: config.resizable,
      title,
      closable: config.closable,
      alwaysOnTop: config.alwaysOnTop,
      frame: config.frame,
    });

    return this.authWindow;
  }

  setupWindowEvents(onClosed) {
    if (!this.authWindow) {
      return;
    }

    this.handleClosed = () => {
      if (onClosed && !this.isAuthCompleted) {
        onClosed();
      }
      this.authWindow = null;
    };

    this.authWindow.on(BROWSER_WINDOW_EVENTS.CLOSED, this.handleClosed);
  }

  setupRedirectHandlers(redirectCallback, callbackRoute) {
    if (!this.authWindow) return;

    this.handleRedirect = async (event, url) => {
      if (url.includes(callbackRoute)) {
        this.isAuthCompleted = true;
      }
      await redirectCallback(url);
    };

    this.authWindow.webContents.on(WEB_CONTENTS_EVENTS.WILL_REDIRECT, this.handleRedirect);
    this.authWindow.webContents.on(WEB_CONTENTS_EVENTS.DID_NAVIGATE, this.handleRedirect);
  }

  setupBlurHandler() {
    if (!this.authWindow) return;

    this.handleBlur = () => {
      this.close();
    };

    this.authWindow.on(BROWSER_WINDOW_EVENTS.BLUR, this.handleBlur);
  }

  async loadUrl(url) {
    if (!this.authWindow) {
      throw new Error('Auth window not initialized');
    }
    return this.authWindow.loadURL(url);
  }

  /**
   * Removes all event listeners to prevent memory leaks
   */
  removeEventListeners() {
    if (!this.authWindow || this.authWindow.isDestroyed()) {
      return;
    }

    // Remove redirect handlers
    if (this.handleRedirect) {
      this.authWindow.webContents.removeListener(WEB_CONTENTS_EVENTS.WILL_REDIRECT, this.handleRedirect);
      this.authWindow.webContents.removeListener(WEB_CONTENTS_EVENTS.DID_NAVIGATE, this.handleRedirect);
      this.handleRedirect = null;
    }

    // Remove window event handlers
    if (this.handleClosed) {
      this.authWindow.removeListener(BROWSER_WINDOW_EVENTS.CLOSED, this.handleClosed);
      this.handleClosed = null;
    }

    if (this.handleBlur) {
      this.authWindow.removeListener(BROWSER_WINDOW_EVENTS.BLUR, this.handleBlur);
      this.handleBlur = null;
    }
  }

  close() {
    if (this.authWindow && !this.authWindow.isDestroyed()) {
      this.removeEventListeners();
      this.authWindow.destroy();
      this.authWindow = null;
    }
  }

  isActive() {
    return this.authWindow !== null && !this.authWindow.isDestroyed();
  }

  markCompleted() {
    this.isAuthCompleted = true;
  }
}

module.exports = { AuthWindowManager };
