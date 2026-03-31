/* eslint-disable global-require */
const { ipcMain, app } = require('electron');
const fs = require('fs');

const { AuthenticationError } = require('./auth/errors');
const { ERROR_MESSAGES } = require('../constants');
const {
  IPC_APP_VERSION,
  IPC_SHOW_MESSAGE_BOX,
  IPC_SHOW_SAVE_DIALOG,
  IPC_SHOW_OPEN_DIALOG,
  IPC_READ_FILE,
  IPC_WRITE_FILE,
  IPC_OPEN_FILE,
  IPC_WINDOW_MINIMIZE,
  IPC_WINDOW_MAXIMIZE,
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_IS_MAXIMIZED,
  IPC_AUTHENTICATE_WITH_GOOGLE,
  IPC_AUTHENTICATE_WITH_MICROSOFT,
  IPC_AUTHENTICATE_WITH_DROPBOX,
} = require('../constants/ipcEvents');
const { ElectronModuleError } = require('../types');

const UNKNOWN_ERROR_MESSAGE = 'Unknown error occurred';

/**
 * IPC Handlers for Electron main process
 */
class IpcHandlers {
  /**
   * @param {import('../types').IWindowManager} windowManager
   */
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  registerHandlers() {
    this.registerAppHandlers();
    this.registerDialogHandlers();
    this.registerFileHandlers();
    this.registerWindowHandlers();
    this.registerOAuthHandlers();
  }

  registerAppHandlers() {
    ipcMain.handle(IPC_APP_VERSION, () => app.getVersion());
  }

  registerDialogHandlers() {
    ipcMain.handle(IPC_SHOW_MESSAGE_BOX, async (_, options) => {
      const result = await this.windowManager.showMessageBox(options);
      return result?.response ?? 0;
    });

    ipcMain.handle(IPC_SHOW_SAVE_DIALOG, async (_, options) => this.windowManager.showSaveDialog(options));

    ipcMain.handle(IPC_SHOW_OPEN_DIALOG, async (_, options) => this.windowManager.showOpenDialog(options));
  }

  registerFileHandlers() {
    ipcMain.handle(IPC_READ_FILE, async (_, filePath) => {
      if (!filePath || typeof filePath !== 'string') {
        throw new ElectronModuleError(ERROR_MESSAGES.INVALID_FILE_PATH, 'IpcHandlers');
      }

      try {
        const buffer = await fs.promises.readFile(filePath);
        const stats = await fs.promises.stat(filePath);

        return {
          data: buffer,
          name: require('path').basename(filePath),
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          type: require('mime-types').lookup(filePath),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
        throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_READ_FILE} ${errorMessage}`, 'IpcHandlers');
      }
    });

    ipcMain.handle(IPC_WRITE_FILE, async (_, filePath, data) => {
      if (!filePath || typeof filePath !== 'string') {
        throw new ElectronModuleError(ERROR_MESSAGES.INVALID_FILE_PATH, 'IpcHandlers');
      }

      if (typeof data !== 'string' && !Buffer.isBuffer(data) && !(data instanceof Uint8Array)) {
        throw new ElectronModuleError(ERROR_MESSAGES.INVALID_DATA, 'IpcHandlers');
      }

      try {
        if (typeof data === 'string') {
          await fs.promises.writeFile(filePath, data, 'utf8');
        } else {
          await fs.promises.writeFile(filePath, data);
        }
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
        throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_WRITE_FILE} ${errorMessage}`, 'IpcHandlers');
      }
    });

    ipcMain.handle(IPC_OPEN_FILE, async (_, filePath) => {
      if (!filePath || typeof filePath !== 'string') {
        throw new ElectronModuleError(ERROR_MESSAGES.INVALID_FILE_PATH, 'IpcHandlers');
      }

      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        const stats = await fs.promises.stat(filePath);

        if (!stats.isFile()) {
          throw new ElectronModuleError(ERROR_MESSAGES.PATH_NOT_FILE, 'IpcHandlers');
        }

        this.windowManager.showMainWindow();

        return {
          success: true,
          filePath,
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          type: require('mime-types').lookup(filePath),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
        throw new ElectronModuleError(`${ERROR_MESSAGES.FAILED_OPEN_FILE} ${errorMessage}`, 'IpcHandlers');
      }
    });
  }

  registerWindowHandlers() {
    ipcMain.handle(IPC_WINDOW_MINIMIZE, () => {
      this.windowManager.minimize();
    });

    ipcMain.handle(IPC_WINDOW_MAXIMIZE, () => {
      this.windowManager.toggleMaximize();
    });

    ipcMain.handle(IPC_WINDOW_CLOSE, () => {
      this.windowManager.close();
    });

    ipcMain.handle(IPC_WINDOW_IS_MAXIMIZED, () => this.windowManager.isMaximized());
  }

  registerOAuthHandlers() {
    ipcMain.handle(IPC_AUTHENTICATE_WITH_GOOGLE, async (event, options = {}) => {
      try {
        return await this.windowManager.authenticateWithGoogle(options);
      } catch (error) {
        this.logAuthError('Google', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_AUTHENTICATE_WITH_MICROSOFT, async (event, options = {}) => {
      try {
        return await this.windowManager.authenticateWithMicrosoft(options);
      } catch (error) {
        this.logAuthError('Microsoft', error);

        if (this.isExpectedAuthError(error)) {
          return null;
        }

        throw error;
      }
    });

    ipcMain.handle(IPC_AUTHENTICATE_WITH_DROPBOX, async (event, options = {}) => {
      try {
        return await this.windowManager.authenticateWithDropbox(options);
      } catch (error) {
        this.logAuthError('Dropbox', error);
        throw error;
      }
    });
  }

  logAuthError(provider, error) {
    const errorDetails = {
      provider,
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      timestamp: new Date().toISOString(),
      code: error.code || 'UNKNOWN',
    };

    console.error(`[${errorDetails.timestamp}] ${provider} authentication failed:`, {
      name: errorDetails.name,
      message: errorDetails.message,
      code: errorDetails.code,
    });

    if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  isExpectedAuthError(error) {
    if (!(error instanceof Error)) {
      return false;
    }

    return error instanceof AuthenticationError || error.message.includes('Authentication window was closed by user');
  }
}

module.exports = { IpcHandlers };
