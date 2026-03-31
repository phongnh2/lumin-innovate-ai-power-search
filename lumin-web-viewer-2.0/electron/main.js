const { dialog, app } = require('electron');

const {
  DIALOG_TYPES,
  DIALOG_BUTTONS,
  DIALOG_TITLES,
  DIALOG_MESSAGES,
} = require('./constants');
const { AppManager } = require('./modules');

async function showInitializationError(error) {
  try {
    if (!app.isReady()) {
      await app.whenReady();
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isElectronModuleError = error.name === 'ElectronModuleError';

    const result = await dialog.showMessageBox({
      type: DIALOG_TYPES.ERROR,
      title: DIALOG_TITLES.APPLICATION_STARTUP_FAILED,
      message: DIALOG_MESSAGES.APPLICATION_STARTUP_FAILED,
      detail: isElectronModuleError ? `Module: ${error.module}\n\n${errorMessage}` : errorMessage,
      buttons: [DIALOG_BUTTONS.RESTART, DIALOG_BUTTONS.EXIT],
      defaultId: 0,
      cancelId: 1,
    });

    if (result.response === 0) {
      app.relaunch();
      app.exit(0);
    } else {
      app.quit();
    }
  } catch (dialogError) {
    console.error('Failed to show error dialog:', dialogError);
    app.exit(1);
  }
}

const appManager = new AppManager();
appManager.initialize().catch(async (error) => {
  console.error('Failed to initialize application:', error);

  await showInitializationError(error);
});
