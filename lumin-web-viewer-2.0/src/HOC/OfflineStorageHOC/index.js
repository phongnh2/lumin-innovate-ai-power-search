import Handler from './Handler/Handler';

import SystemFileHandler from './Handler/SystemFileHandler';
import CachingFileHandler from './Handler/CachingFileHandler';
import StorageHandler from './Handler/StorageHandler';
import CommandHandler from './Handler/CommandHandler';

import offlineMediator from './Mediator/OfflineMediator';
import withOffline from './OfflineStorageHOC';
import OfflineDocumentIntercept from './OfflineInterceptHOC';

const systemFileHandler = new SystemFileHandler(offlineMediator);
const cachingFileHandler = new CachingFileHandler(offlineMediator);
const storageHandler = new StorageHandler(offlineMediator);
const commandHandler = new CommandHandler(offlineMediator);

offlineMediator.addHandler({
  systemFileHandler,
  cachingFileHandler,
  storageHandler,
  commandHandler,
});

export {
  withOffline,
  OfflineDocumentIntercept,
  systemFileHandler,
  cachingFileHandler,
  storageHandler,
  commandHandler,
  Handler,
};
