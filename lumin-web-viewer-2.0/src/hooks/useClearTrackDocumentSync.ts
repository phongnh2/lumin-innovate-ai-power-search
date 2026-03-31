import { useEffect } from 'react';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { useCleanup } from './useCleanup';

export const useClearTrackDocumentSync = () => {
  const handleClearTrackingEvent = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY.HAS_TRACKED_DOCUMENT_SYNC);
  };

  useCleanup(() => {
    handleClearTrackingEvent();
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleClearTrackingEvent);

    return () => {
      window.removeEventListener('beforeunload', handleClearTrackingEvent);
    };
  }, []);
};
