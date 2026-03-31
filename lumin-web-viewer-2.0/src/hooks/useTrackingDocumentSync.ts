import { useEffect, useRef } from 'react';

import selectors from 'selectors';

import { eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import useShallowSelector from './useShallowSelector';

export const useTrackingDocumentSync = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const documentServiceRef = useRef(currentDocument?.service);

  useEffect(() => {
    documentServiceRef.current = currentDocument?.service;
  }, [currentDocument?.service]);

  const handleTrackDocumentSync = () => {
    const isTracked = Boolean(sessionStorage.getItem(SESSION_STORAGE_KEY.HAS_TRACKED_DOCUMENT_SYNC));
    if (isTracked) {
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.HAS_TRACKED_DOCUMENT_SYNC, 'true');
    eventTracking(UserEventConstants.EventType.SYNC_DOCUMENT, { source: documentServiceRef.current }) as unknown;
  };

  return {
    handleTrackDocumentSync,
  };
};
