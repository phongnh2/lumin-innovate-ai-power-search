import { useEffect, useState } from 'react';

import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const useFileHasChanged = ({ enabled }: { enabled: boolean }) => {
  const { loaded: documentViewerLoaded } = useDocumentViewerLoaded();
  const [fileHasChanged, setFileHasChanged] = useState(false);

  useEffect(() => {
    const onPagesUpdated = () => {
      setFileHasChanged(true);
    };

    if (enabled && documentViewerLoaded) {
      window.addEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, onPagesUpdated);
    }

    return () => {
      setFileHasChanged(false);
      window.removeEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, onPagesUpdated);
    };
  }, [enabled, documentViewerLoaded]);

  useEffect(() => {
    const onStartSyncOnContentChange = () => {
      setFileHasChanged(false);
    };
    document.addEventListener(CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE, onStartSyncOnContentChange);

    return () => {
      document.removeEventListener(CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE, onStartSyncOnContentChange);
    };
  }, []);

  return { fileHasChanged, setFileHasChanged };
};
