export default class Handler {
  constructor(mediator) {
    this.mediator = mediator;
    this.eventHandler = {};
  }

  static isOfflineEnabled = false;

  static NAMESPACE = {
    NONCE: 11101998,
    STORAGE: 'lumin-files',
    SOURCE: 'lumin-source',
  };

  static EVENTS = {
    UPDATE_SOURCE: 'updateSource',
    DOWNLOAD_FILE: 'downloadFile',
    INSERT_CACHING_FILE: 'insertCachingFile',
    STARTING_DOWNLOAD: 'startCachingFile',
    FINISHED_DOWNLOAD: 'finishedCachingFile',
    DELETE_CACHING_FILE: 'deleteCachingFileSuccess',
    INSERT_SYSTEM_FILE: 'insertSystemFile',
    DELETE_SYSTEM_FILE: 'deleteSystemFile',
    UPDATE_SYSTEM_FILE: 'updateSystemFile',
    CHANGE_STAR_SYSTEM_FILE: 'changeStarSystemFile',
    UPDATE_CACHING_FILE: 'updateCachingFile',
    DOWNLOAD_IMAGE_FOR_ANNOT: 'downloadImageForAnnotation',
    DELETE_IMAGES: 'deleteImages',
    DOWNLOAD_FAILED: 'cachingFileFailed',
  };

  addEventListener = (event, handler) => {
    if (this.eventHandler[event]) {
      this.eventHandler[event].push(handler);
    } else {
      this.eventHandler[event] = [handler];
    }
  };

  removeEventListener = (event, handler) => {
    if (!this.eventHandler[event]) return;

    const index = this.eventHandler[event].indexOf(handler);
    if (index !== -1) this.eventHandler[event].splice(index, 1);
  };

  removeAllEventListener = () => {
    this.eventHandler = {};
  };

  fireEvent = (event, data = {}) => {
    navigator.serviceWorker.ready.then((registration) => {
      if (!registration.active) {
        return;
      }

      registration.active.postMessage({
        action: event,
        tFlag: {
          key: `lumin-${Handler.NAMESPACE.NONCE}`,
        },
        data,
      });
    });
    if (!this.eventHandler[event]) return;

    this.eventHandler[event].forEach((handler) => handler(data));
  };
}
