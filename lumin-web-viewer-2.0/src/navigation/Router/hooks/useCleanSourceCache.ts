import { useEffect } from 'react';

import logger from 'helpers/logger';

import { LocalStorageKey } from 'constants/localStorageKey';

/**
 * Temporary solution for the issue: service worker fetchs the old CSP file
 */
const useCleanSourceCache = (): void => {
  useEffect(() => {
    if (!(localStorage.getItem(LocalStorageKey.HAS_CLEANED_SOURCE_CACHE) === 'true') && 'caches' in window) {
      caches.delete('lumin-source').catch((err: { message: string }) => {
        logger.logError({
          reason: 'FAILED_TO_DELETE_SOURCE_CACHE',
          error: err,
        });
      });
      localStorage.setItem(LocalStorageKey.HAS_CLEANED_SOURCE_CACHE, 'true');
    }
  }, []);
};

export default useCleanSourceCache;
