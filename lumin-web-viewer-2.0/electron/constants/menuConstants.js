const MENU_ROLES = {
  UNDO: 'undo',
  REDO: 'redo',
  CUT: 'cut',
  COPY: 'copy',
  PASTE: 'paste',
  SELECT_ALL: 'selectAll',
  RELOAD: 'reload',
  FORCE_RELOAD: 'forceReload',
  TOGGLE_DEV_TOOLS: 'toggleDevTools',
  RESET_ZOOM: 'resetZoom',
  ZOOM_IN: 'zoomIn',
  ZOOM_OUT: 'zoomOut',
  TOGGLE_FULLSCREEN: 'togglefullscreen',
  MINIMIZE: 'minimize',
  CLOSE: 'close',
  ABOUT: 'about',
  SERVICES: 'services',
  HIDE: 'hide',
  HIDE_OTHERS: 'hideOthers',
  UNHIDE: 'unhide',
  QUIT: 'quit',
  ZOOM: 'zoom',
  FRONT: 'front',
};

const MENU_LABELS = {
  FILE: 'File',
  EDIT: 'Edit',
  VIEW: 'View',
  WINDOW: 'Window',
  HELP: 'Help',
  NEW: 'New',
  OPEN: 'Open',
  SAVE: 'Save',
  EXIT: 'Exit',
  ABOUT: 'About',
};

const MENU_ACCELERATORS = {
  NEW_DOCUMENT: 'CmdOrCtrl+N',
  OPEN_DOCUMENT: 'CmdOrCtrl+O',
  SAVE_DOCUMENT: 'CmdOrCtrl+S',
  QUIT_MAC: 'Cmd+Q',
  QUIT_WINDOWS: 'Ctrl+Q',
};

module.exports = {
  MENU_ROLES,
  MENU_LABELS,
  MENU_ACCELERATORS,
};
