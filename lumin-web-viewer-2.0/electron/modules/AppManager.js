const { app, shell } = require('electron');

const { IpcHandlers } = require('./IpcHandlers');
const { MenuBuilder } = require('./MenuBuilder');
const { ProtocolHandler } = require('./ProtocolHandler');
const { UpdaterService } = require('./UpdaterService');
const { WindowManager } = require('./WindowManager');
const { ELECTRON_APP_EVENTS, OS_PLATFORM, ENVIRONMENT, ERROR_MESSAGES } = require('../constants');
const { PROTOCOL_SCHEME } = require('../constants/protocols');
const { ElectronModuleError } = require('../types');

/**
 * Main Application Manager
 */
class AppManager {
  constructor() {
    /** @type {WindowManager | null} */
    this.windowManager = null;
    /** @type {ProtocolHandler | null} */
    this.protocolHandler = null;
    /** @type {IpcHandlers | null} */
    this.ipcHandlers = null;
    /** @type {MenuBuilder | null} */
    this.menuBuilder = null;
    /** @type {UpdaterService | null} */
    this.updaterService = null;

    this.isDev = process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
    this.pendingFilePaths = [];
  }

  async initialize() {
    try {
      this.ensureSingleInstance();
      AppManager.setupProtocolClient();
      this.setupEventHandlers();

      await app.whenReady();
      this.setupServices();

      if (!this.isDev && this.updaterService) {
        this.updaterService.checkForUpdates();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_INITIALIZE_APP} ${errorMessage}`, 'AppManager');
    }
  }

  ensureSingleInstance() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on(ELECTRON_APP_EVENTS.SECOND_INSTANCE, (event, commandLine) => {
      if (this.windowManager) {
        this.windowManager.focusMainWindow();
      }

      const protocolUrl = commandLine.find((arg) => arg.startsWith(PROTOCOL_SCHEME));
      if (protocolUrl && this.protocolHandler) {
        this.protocolHandler.handleProtocolUrl(protocolUrl);
      }

      const filePaths = commandLine.filter((arg) => arg.endsWith('.pdf') && !arg.startsWith('-'));

      if (filePaths.length > 0 && this.windowManager) {
        this.handleFileAssociation(filePaths);
      }
    });
  }

  static setupProtocolClient() {
    app.setAsDefaultProtocolClient(PROTOCOL_SCHEME.replace('://', ''));
  }

  setupEventHandlers() {
    app.on(ELECTRON_APP_EVENTS.OPEN_URL, (event, url) => {
      event.preventDefault();
      if (this.protocolHandler) {
        this.protocolHandler.handleProtocolUrl(url);
      }
    });

    app.on(ELECTRON_APP_EVENTS.OPEN_FILE, (event, filePath) => {
      event.preventDefault();
      if (this.windowManager) {
        this.handleFileAssociation([filePath]);
      } else {
        this.pendingFilePaths.push(filePath);
      }
    });

    app.on(ELECTRON_APP_EVENTS.ACTIVATE, () => {
      // On macOS, show the existing window or create a new one
      if (process.platform === OS_PLATFORM.DARWIN) {
        if (this.windowManager?.getMainWindow()) {
          this.windowManager.showMainWindow();
        } else if (!this.windowManager?.hasWindows()) {
          this.windowManager?.createMainWindow();
        }
      } else if (!this.windowManager?.hasWindows()) {
        this.windowManager?.createMainWindow();
      }
    });

    app.on(ELECTRON_APP_EVENTS.WINDOW_ALL_CLOSED, () => {
      this.handleWindowAllClosed();
    });

    app.on(ELECTRON_APP_EVENTS.BEFORE_QUIT, () => {
      app.isQuitting = true;
      this.cleanup();
    });

    // Security: Prevent new window creation from renderer
    app.on(ELECTRON_APP_EVENTS.WEB_CONTENTS_CREATED, (event, contents) => {
      // Note: 'new-window' event is deprecated, relying on WindowManager's setWindowOpenHandler
      contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url).catch((error) => {
          console.error('Error opening external URL:', error);
        });
        return { action: 'deny' };
      });
    });
  }

  setupServices() {
    try {
      this.windowManager = new WindowManager();
      this.ipcHandlers = new IpcHandlers(this.windowManager);
      this.protocolHandler = new ProtocolHandler(this.windowManager);
      this.menuBuilder = new MenuBuilder(this.windowManager);
      this.updaterService = new UpdaterService(this.windowManager, this.isDev);

      // ⚠️ Initialize services in the correct order
      this.windowManager.createMainWindow();
      this.protocolHandler.handleStartupProtocol();
      this.ipcHandlers.registerHandlers();
      this.menuBuilder.buildAndSetMenu();

      if (this.pendingFilePaths.length > 0) {
        this.handleFileAssociation(this.pendingFilePaths);
        this.pendingFilePaths = [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_SETUP_SERVICES} ${errorMessage}`, 'AppManager');
    }
  }

  handleFileAssociation(filePaths) {
    if (!this.windowManager?.getMainWindow()) {
      return;
    }

    const filePathsParam = encodeURIComponent(JSON.stringify(filePaths));
    const openLuminUrl = `${this.windowManager.baseUrl}/open/lumin?files=${filePathsParam}`;

    this.windowManager.loadUrl(openLuminUrl);
  }

  handleWindowAllClosed() {
    this.cleanup();
    if (process.platform !== OS_PLATFORM.DARWIN) {
      app.quit();
    }
  }

  cleanup() {
    try {
      this.windowManager?.cancelDropboxAuthentication?.();

      if (this.protocolHandler) {
        this.protocolHandler.cleanup();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

module.exports = { AppManager };
