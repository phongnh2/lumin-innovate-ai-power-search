import { useCallback, useEffect } from 'react';

import { isSyncableFile } from 'helpers/autoSync';

import { exitEditPdfMode } from 'utils/editPDF';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';

export default function useEndContentEditMode({ currentDocument, changeQueueRef, handleSyncFile }) {
  const { service, mimeType, _id: documentId } = currentDocument;
  const onContentEditUpdated = useCallback(async () => {
    if (
      changeQueueRef.current.some(
        (action) =>
          action.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE) || action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF)
      )
    ) {
      handleSyncFile(`${AUTO_SYNC_CHANGE_TYPE.EDIT_PDF}:${documentId}`);
    }
    exitEditPdfMode();
  }, [changeQueueRef, documentId, handleSyncFile]);

  useEffect(() => {
    if (
      isSyncableFile({
        service,
        mimeType,
      })
    ) {
      window.addEventListener('content_edit_updated', onContentEditUpdated);
    }
    return () => {
      if (isSyncableFile({ service, mimeType })) {
        window.removeEventListener('content_edit_updated', onContentEditUpdated);
      }
    };
  }, [service, mimeType, onContentEditUpdated]);
}
