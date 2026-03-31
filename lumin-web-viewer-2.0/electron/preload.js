const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

const {
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
  IPC_MENU_NEW_DOCUMENT,
  IPC_MENU_OPEN_DOCUMENT,
  IPC_MENU_SAVE_DOCUMENT,
  IPC_READ_FILE,
  IPC_WRITE_FILE,
  IPC_OPEN_FILE,
  IPC_FILE_ASSOCIATION,
  IPC_AUTHENTICATE_WITH_GOOGLE,
  IPC_AUTHENTICATE_WITH_MICROSOFT,
  IPC_AUTHENTICATE_WITH_DROPBOX,
  IPC_DROPBOX_AUTH_COMPLETED,
} = require('./constants/ipcEvents');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke(IPC_APP_VERSION),

  windowMinimize: () => ipcRenderer.invoke(IPC_WINDOW_MINIMIZE),
  windowMaximize: () => ipcRenderer.invoke(IPC_WINDOW_MAXIMIZE),
  windowClose: () => ipcRenderer.invoke(IPC_WINDOW_CLOSE),
  windowIsMaximized: () => ipcRenderer.invoke(IPC_WINDOW_IS_MAXIMIZED),

  showMessageBox: (options) => ipcRenderer.invoke(IPC_SHOW_MESSAGE_BOX, options),
  showSaveDialog: (options) => ipcRenderer.invoke(IPC_SHOW_SAVE_DIALOG, options),
  showOpenDialog: (options) => ipcRenderer.invoke(IPC_SHOW_OPEN_DIALOG, options),

  onMenuNewDocument: (callback) => {
    ipcRenderer.on(IPC_MENU_NEW_DOCUMENT, callback);
    return () => ipcRenderer.removeListener(IPC_MENU_NEW_DOCUMENT, callback);
  },

  onMenuOpenDocument: (callback) => {
    ipcRenderer.on(IPC_MENU_OPEN_DOCUMENT, callback);
    return () => ipcRenderer.removeListener(IPC_MENU_OPEN_DOCUMENT, callback);
  },

  onMenuSaveDocument: (callback) => {
    ipcRenderer.on(IPC_MENU_SAVE_DOCUMENT, callback);
    return () => ipcRenderer.removeListener(IPC_MENU_SAVE_DOCUMENT, callback);
  },

  onWindowMaximized: (callback) => {
    ipcRenderer.on(IPC_WINDOW_MAXIMIZED, callback);
    return () => ipcRenderer.removeListener(IPC_WINDOW_MAXIMIZED, callback);
  },

  onWindowUnmaximized: (callback) => {
    ipcRenderer.on(IPC_WINDOW_UNMAXIMIZED, callback);
    return () => ipcRenderer.removeListener(IPC_WINDOW_UNMAXIMIZED, callback);
  },

  onFileAssociation: (callback) => {
    ipcRenderer.on(IPC_FILE_ASSOCIATION, callback);
    return () => ipcRenderer.removeListener(IPC_FILE_ASSOCIATION, callback);
  },

  readFile: (filePath) => ipcRenderer.invoke(IPC_READ_FILE, filePath),

  /**
   *
   * @param {string} filePath
   * @param {string | Buffer | Uint8Array} data
   * @returns
   */
  writeFile: (filePath, data) => ipcRenderer.invoke(IPC_WRITE_FILE, filePath, data),
  openFile: (filePath) => ipcRenderer.invoke(IPC_OPEN_FILE, filePath),

  platform: process.platform,
  isElectron: true,
  isDevelopment: process.env.NODE_ENV === 'development',
  authenticateWithGoogle: (options) => ipcRenderer.invoke(IPC_AUTHENTICATE_WITH_GOOGLE, options),
  authenticateWithMicrosoft: (options) => ipcRenderer.invoke(IPC_AUTHENTICATE_WITH_MICROSOFT, options),
  authenticateWithDropbox: (options) => ipcRenderer.invoke(IPC_AUTHENTICATE_WITH_DROPBOX, options),
  onDropboxAuthCompleted: (callback) => {
    ipcRenderer.on(IPC_DROPBOX_AUTH_COMPLETED, callback);
    return () => ipcRenderer.removeListener(IPC_DROPBOX_AUTH_COMPLETED, callback);
  },
});

contextBridge.exposeInMainWorld('nodeAPI', {
  process: {
    platform: process.platform,
    versions: process.versions,
  },
  path: {
    join: (...args) => path.join(...args),
    dirname: (p) => path.dirname(p),
    basename: (p) => path.basename(p),
    extname: (p) => path.extname(p),
  },
});

// Security: Remove any potentially dangerous globals
// eslint-disable-next-line no-undef
delete window.require;
// eslint-disable-next-line no-undef
delete window.exports;
// eslint-disable-next-line no-undef
delete window.module;
