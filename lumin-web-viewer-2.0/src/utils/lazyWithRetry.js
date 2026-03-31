/**
 * @link https://raphael-leger.medium.com/react-webpack-chunkloaderror-loading-chunk-x-failed-ac385bd110e0
 */
import loadable from '@loadable/component';

import { LocalStorageKey } from 'constants/localStorageKey';

export const lazyWithRetry = (componentImport, options) =>
  loadable(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(localStorage.getItem(LocalStorageKey.REFRESH_KEY) || 'false');

    try {
      const component = await componentImport();

      localStorage.setItem(LocalStorageKey.REFRESH_KEY, 'false');

      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version of the application.
        // Let's refresh the page immediately.
        window.localStorage.setItem(LocalStorageKey.REFRESH_KEY, 'true');
        /**
         * FIXME: we need to investigate this issue before opening this line https://chat.designveloper.com/lumin-pdf/pl/ejgisxo15trobnztccgdog4kec
         */
        // return window.location.reload();
      }

      // The page has already been reloaded
      // Assuming that user is already using the latest version of the application.
      // Let's let the application crash and raise the error.
      throw error;
    }
  }, options);
