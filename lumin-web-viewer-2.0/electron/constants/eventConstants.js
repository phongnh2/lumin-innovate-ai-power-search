const ELECTRON_APP_EVENTS = {
  SECOND_INSTANCE: 'second-instance',
  OPEN_URL: 'open-url',
  OPEN_FILE: 'open-file',
  ACTIVATE: 'activate',
  WINDOW_ALL_CLOSED: 'window-all-closed',
  BEFORE_QUIT: 'before-quit',
  WEB_CONTENTS_CREATED: 'web-contents-created',
  READY: 'ready',
};

const BROWSER_WINDOW_EVENTS = {
  READY_TO_SHOW: 'ready-to-show',
  CLOSE: 'close',
  CLOSED: 'closed',
  MAXIMIZE: 'maximize',
  UNMAXIMIZE: 'unmaximize',
  BLUR: 'blur',
};

const WEB_CONTENTS_EVENTS = {
  DID_FAIL_LOAD: 'did-fail-load',
  WILL_NAVIGATE: 'will-navigate',
  WILL_REDIRECT: 'will-redirect',
  DID_NAVIGATE: 'did-navigate',
};

const AUTO_UPDATER_EVENTS = {
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_DOWNLOADED: 'update-downloaded',
  ERROR: 'error',
};

const HTML_EVENT_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  CLICK: 'click',
  LOAD: 'load',
  ERROR: 'error',
};

module.exports = {
  ELECTRON_APP_EVENTS,
  BROWSER_WINDOW_EVENTS,
  WEB_CONTENTS_EVENTS,
  AUTO_UPDATER_EVENTS,
  HTML_EVENT_TYPES,
};
