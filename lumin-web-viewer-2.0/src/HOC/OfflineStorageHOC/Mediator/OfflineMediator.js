import Handler from '../Handler/Handler';

class OfflineMediator {
  constructor() {
    this.handlers = {};
  }

  addHandler({
    systemFileHandler,
    cachingFileHandler,
    storageHandler,
    commandHandler,
  }) {
    this.handlers = {
      systemFileHandler,
      cachingFileHandler,
      storageHandler,
      commandHandler,
    };
  }

  async notify(message, data) {
    const response = {
      message: 'Exec success',
      data: {},
    };
    switch (message) {
      case Handler.EVENTS.DELETE_CACHING_FILE:
        this.handlers.storageHandler.deleteFile(data.signedUrl);
        this.handlers.storageHandler.deleteFile(data.thumbnail);
        this.handlers.commandHandler.deleteAllCommands(data.documentId);
        this.handlers.commandHandler.deleteTempAction(data.documentId);
        Promise.all(data.imageSignedUrls.map((signedUrl) => this.handlers.storageHandler.deleteFile(signedUrl)));
        break;
      case Handler.EVENTS.DOWNLOAD_FILE: {
        const [cachedFile, cachedThumbnail] = await Promise.all([
          this.handlers.storageHandler.addFile(data.signedUrl),
          this.handlers.storageHandler.putFile(data.thumbnail),
        ]);
        response.data = { cachedFile, cachedThumbnail };
      } break;
      case Handler.EVENTS.UPDATE_CACHING_FILE: {
        const cachedFile = await this.handlers.storageHandler.updateFile(data.oldSignedUrl, data.newSignedUrl);
        response.data = { cachedFile };
        this.handlers.commandHandler.deleteTempAction(data.documentId);
      } break;
      case Handler.EVENTS.UPDATE_SOURCE:
        this.handlers.storageHandler.updateSource();
        break;
      case Handler.EVENTS.DOWNLOAD_IMAGE_FOR_ANNOT:
        Promise.all(data.imageSignedUrls.map((signedUrl) => this.handlers.storageHandler.addFile(signedUrl)));
        break;
      case Handler.EVENTS.DELETE_IMAGES:
        Promise.all(data.deletedImages.map((signedUrl) => this.handlers.storageHandler.deleteFile(signedUrl)));
        break;
      default:
        break;
    }

    return response;
  }
}

export default new OfflineMediator();
