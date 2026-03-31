/**
 * IPC event constants for Lumin PDF Electron app
 * These constants ensure consistency between main and renderer processes
 */

// App-related events
const IPC_APP_VERSION = 'app-version';

// Window-related events
const IPC_WINDOW_MINIMIZE = 'window-minimize';
const IPC_WINDOW_MAXIMIZE = 'window-maximize';
const IPC_WINDOW_CLOSE = 'window-close';
const IPC_WINDOW_IS_MAXIMIZED = 'window-is-maximized';
const IPC_WINDOW_MAXIMIZED = 'window-maximized';
const IPC_WINDOW_UNMAXIMIZED = 'window-unmaximized';

// Dialog-related events
const IPC_SHOW_MESSAGE_BOX = 'show-message-box';
const IPC_SHOW_SAVE_DIALOG = 'show-save-dialog';
const IPC_SHOW_OPEN_DIALOG = 'show-open-dialog';

// File operation events
const IPC_READ_FILE = 'read-file';
const IPC_WRITE_FILE = 'write-file';
const IPC_OPEN_FILE = 'open-file';

// File association events
const IPC_FILE_ASSOCIATION = 'file-association';

// Menu events
const IPC_MENU_NEW_DOCUMENT = 'menu-new-document';
const IPC_MENU_OPEN_DOCUMENT = 'menu-open-document';
const IPC_MENU_SAVE_DOCUMENT = 'menu-save-document';

// OAuth events
const IPC_AUTHENTICATE_WITH_GOOGLE = 'authenticate-with-google';
const IPC_AUTHENTICATE_WITH_MICROSOFT = 'authenticate-with-microsoft';
const IPC_AUTHENTICATE_WITH_DROPBOX = 'authenticate-with-dropbox';
const IPC_DROPBOX_AUTH_COMPLETED = 'dropbox-auth-completed';

module.exports = {
  IPC_APP_VERSION,
  IPC_WINDOW_MINIMIZE,
  IPC_WINDOW_MAXIMIZE,
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_IS_MAXIMIZED,
  IPC_WINDOW_MAXIMIZED,
  IPC_WINDOW_UNMAXIMIZED,
  IPC_SHOW_MESSAGE_BOX,
  IPC_SHOW_SAVE_DIALOG,
  IPC_SHOW_OPEN_DIALOG,
  IPC_READ_FILE,
  IPC_WRITE_FILE,
  IPC_OPEN_FILE,
  IPC_FILE_ASSOCIATION,
  IPC_MENU_NEW_DOCUMENT,
  IPC_MENU_OPEN_DOCUMENT,
  IPC_MENU_SAVE_DOCUMENT,
  IPC_AUTHENTICATE_WITH_GOOGLE,
  IPC_AUTHENTICATE_WITH_MICROSOFT,
  IPC_AUTHENTICATE_WITH_DROPBOX,
  IPC_DROPBOX_AUTH_COMPLETED,
};
