/* eslint-disable class-methods-use-this */
import { OFFLINE_STORAGE_ACTION } from 'constants/offlineConstant';
import { store } from 'src/redux/store';
import selectors from 'selectors';
import {
  indexedDBService,
} from 'services';
import Handler from './Handler';

class StorageHandler extends Handler {
    getFile = async (url) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      return fileCache.match(url);
    };

    putCustomFile = async (url, response) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      return fileCache.put(url, response);
    };

    deleteFile = async (signedUrl) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      fileCache.delete(signedUrl);
    };

    addFile = async (signedUrl) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      await fileCache.add(signedUrl);
      return fileCache.match(signedUrl);
    };

    putFile = async (url) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      const response = await fetch(url, { mode: 'no-cors' });
      await fileCache.put(url, response);
      return fileCache.match(url);
    };

    updateFile = async (oldSignedUrl, newSignedUrl) => {
      const fileCache = await caches.open(Handler.NAMESPACE.STORAGE);
      try {
        await fileCache.add(newSignedUrl);
      } catch (error) {
        const oldCachedResponse = await fileCache.match(oldSignedUrl);
        await fileCache.put(newSignedUrl, oldCachedResponse);
      }
      fileCache.delete(oldSignedUrl);
      return fileCache.match(newSignedUrl);

    };

    downloadSource = () => {
      const currentUser = selectors.getCurrentUser(store.getState());
      indexedDBService.setCurrentUser(currentUser);
      indexedDBService.setAccountEnabledOffline({ _id: currentUser._id, email: currentUser.email });
      navigator.serviceWorker.ready.then((registration) => {
        if (!registration.active) {
          return;
        }

        registration.active.postMessage({
          action: OFFLINE_STORAGE_ACTION.SOURCE_CACHING,
          id: Handler.NAMESPACE.SOURCE,
          tFlag: {
            key: `lumin-${Handler.NAMESPACE.NONCE}`,
          },
          input: {
            version: process.env.VERSION,
          },
        });
      });
    };

    updateSource = ({ manualUpdate = false } = {}) => {
      navigator.serviceWorker.ready.then((registration) => {
        if (!registration.active) {
          return;
        }

        registration.active.postMessage({
          action: OFFLINE_STORAGE_ACTION.SOURCE_UPDATE,
          id: Handler.NAMESPACE.SOURCE,
          tFlag: {
            key: `lumin-${Handler.NAMESPACE.NONCE}`,
          },
          input: {
            newVersion: process.env.VERSION,
            manualUpdate,
          },
        });
      });
    };

    cleanSource = () => {
      navigator.serviceWorker.ready.then((registration) => {
        if (!registration.active) {
          return;
        }

        registration.active.postMessage({
          action: OFFLINE_STORAGE_ACTION.CLEAN_SOURCE,
          id: Handler.NAMESPACE.SOURCE,
          tFlag: {
            key: `lumin-${Handler.NAMESPACE.NONCE}`,
          },
        });
      });
    };

    hasAvailableOfflineStorage = async () => {
      // The required available storage is 10GB
      const { usage, quota } = await navigator.storage.estimate();
      const remainingStorage = quota - usage;
      return Math.round(remainingStorage / 1024**3) >= 10;
    };
}

export default StorageHandler;
