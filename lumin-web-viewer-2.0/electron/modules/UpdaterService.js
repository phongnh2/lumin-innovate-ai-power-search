/* eslint-disable global-require */
// Only import electron-updater when running in Electron environment
let autoUpdater;
try {
  if (process.versions.electron) {
    autoUpdater = require('electron-updater').autoUpdater;
  }
} catch (error) {
  // electron-updater not available or not in Electron environment
  console.warn('electron-updater not available:', error.message);
}

const {
  AUTO_UPDATER_EVENTS,
  DIALOG_TYPES,
  DIALOG_BUTTONS,
  DIALOG_TITLES,
  DIALOG_MESSAGES,
} = require('../constants');

/**
 * Updater Service for handling application updates
 */
class UpdaterService {
  /**
   * @param {import('../types').IWindowManager} windowManager
   * @param {boolean} isDev
   */
  constructor(windowManager, isDev = false) {
    this.windowManager = windowManager;
    this.isDev = isDev;

    if (!isDev) {
      this.setupEventHandlers();
    }
  }

  async checkForUpdates() {
    if (!this.isDev && autoUpdater) {
      await autoUpdater.checkForUpdatesAndNotify();
    }
  }

  setupEventHandlers() {
    if (!autoUpdater) return;

    autoUpdater.on(AUTO_UPDATER_EVENTS.UPDATE_AVAILABLE, async () => {
      await this.showUpdateAvailableDialog();
    });

    autoUpdater.on(AUTO_UPDATER_EVENTS.UPDATE_DOWNLOADED, async () => {
      await this.showUpdateDownloadedDialog();
    });

    autoUpdater.on(AUTO_UPDATER_EVENTS.ERROR, async (error) => {
      await this.handleUpdateError(error);
    });
  }

  async showUpdateAvailableDialog() {
    await this.windowManager.showMessageBox({
      type: DIALOG_TYPES.INFO,
      title: DIALOG_TITLES.UPDATE_AVAILABLE,
      message: DIALOG_MESSAGES.UPDATE_AVAILABLE,
      buttons: [DIALOG_BUTTONS.OK],
    });
  }

  async showUpdateDownloadedDialog() {
    try {
      const result = await this.windowManager.showMessageBox({
        type: DIALOG_TYPES.INFO,
        title: DIALOG_TITLES.UPDATE_READY,
        message: DIALOG_MESSAGES.UPDATE_READY,
        buttons: [DIALOG_BUTTONS.RESTART, DIALOG_BUTTONS.LATER],
      });

      if (result?.response === 0 && autoUpdater) {
        autoUpdater.quitAndInstall();
      }
    } catch (error) {
      console.error('Error showing update dialog:', error);
    }
  }

  /**
   * @param {Error} error
   */
  async handleUpdateError(error) {
    console.error('Auto updater error:', error);

    if (!this.isDev) {
      await this.windowManager.showMessageBox({
        type: DIALOG_TYPES.ERROR,
        title: DIALOG_TITLES.UPDATE_ERROR,
        message: DIALOG_MESSAGES.UPDATE_ERROR,
        detail: error.message,
        buttons: [DIALOG_BUTTONS.OK],
      });
    }
  }
}

module.exports = { UpdaterService };
