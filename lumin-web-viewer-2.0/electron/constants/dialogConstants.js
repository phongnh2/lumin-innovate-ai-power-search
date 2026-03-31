const DIALOG_TYPES = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  QUESTION: 'question',
};

const DIALOG_BUTTONS = {
  OK: 'OK',
  CANCEL: 'Cancel',
  YES: 'Yes',
  NO: 'No',
  RETRY: 'Retry',
  QUIT: 'Quit',
  RESTART: 'Restart',
  LATER: 'Later',
  EXIT: 'Exit',
};

const DIALOG_TITLES = {
  CONNECTION_ERROR: 'Connection Error',
  UPDATE_AVAILABLE: 'Update available',
  UPDATE_READY: 'Update ready',
  UPDATE_ERROR: 'Update Error',
  AUTHENTICATION_FAILED: 'Authentication Failed',
  ABOUT_LUMIN_PDF: 'About Lumin PDF',
  APPLICATION_STARTUP_FAILED: 'Application Startup Failed',
};

const DIALOG_MESSAGES = {
  CONNECTION_ERROR: 'Unable to connect to Lumin PDF',
  CONNECTION_ERROR_DETAIL: 'Please check your internet connection and try again.',
  UPDATE_AVAILABLE: 'A new version is available. It will be downloaded in the background.',
  UPDATE_READY: 'Update downloaded. The application will restart to apply the update.',
  UPDATE_ERROR: 'An error occurred while checking for updates.',
  AUTHENTICATION_FAILED: 'Authentication failed:',
  ABOUT_LUMIN_PDF: 'Lumin PDF Desktop Application',
  APPLICATION_STARTUP_FAILED: 'Lumin PDF failed to start',
};

const WINDOW_TITLES = {
  GOOGLE_AUTHENTICATION: 'Google Authentication',
  MICROSOFT_AUTHENTICATION: 'Microsoft Authentication',
};

module.exports = {
  DIALOG_TYPES,
  DIALOG_BUTTONS,
  DIALOG_TITLES,
  DIALOG_MESSAGES,
  WINDOW_TITLES,
};
