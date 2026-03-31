import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { Handler, storageHandler } from 'HOC/OfflineStorageHOC';

import documentServices from 'services/documentServices';

import { handleTrackTimeDocumentSaving } from 'utils/calculateTimeTracking';
import { executeWithCancellation } from 'utils/executeWithCancellation';
import fileUtils from 'utils/file';
import { getLinearizedDocumentFile } from 'utils/getFileService';

import { socket } from '@socket';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { SOCKET_EMIT } from 'constants/socketConstant';

const getDocumentThumbnail = async (document: Core.Document): Promise<File> => {
  const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(document, {});
  return fileUtils.convertThumnailCanvasToFile(thumbnailCanvas);
};

export const syncFileToS3 = async ({
  signal,
  increaseVersion = false,
}: { signal?: AbortSignal; increaseVersion?: boolean } = {}) => {
  const state = store.getState();
  const currentDocument = selectors.getCurrentDocument(state);
  if (!currentDocument) {
    return;
  }
  let hasCanceled = false;

  const { remoteId, _id: documentId, thumbnailRemoteId, name, signedUrl } = currentDocument;
  const document = core.getDocument();

  const file = await getLinearizedDocumentFile(name, null, { signal });
  if (signal.aborted) {
    return;
  }

  const thumbnail = await executeWithCancellation({
    callback: () => getDocumentThumbnail(document),
    signal,
    onCancel: () => {
      hasCanceled = true;
      socket.emit(SOCKET_EMIT.CANCEL_SYNC_SESSION, { documentId });
    },
  })();
  const { data } = await executeWithCancellation({
    callback: () =>
      handleTrackTimeDocumentSaving(
        documentServices.overrideDocumentToS3({
          file,
          remoteId,
          documentId,
          thumbnail,
          thumbnailRemoteId,
          increaseVersion,
          signal,
        }),
        currentDocument.service
      ),
    signal,
    onCancel: () => {
      if (!hasCanceled) {
        socket.emit(SOCKET_EMIT.CANCEL_SYNC_SESSION, { documentId });
      }
    },
  })();

  await executeWithCancellation({
    callback: async () => {
      const isOfflineEnable = Handler.isOfflineEnabled && currentDocument.isOfflineValid;
      if (isOfflineEnable) {
        const response = new Response(file);
        await storageHandler.deleteFile(signedUrl);
        await storageHandler.putCustomFile(signedUrl, response);
      }

      documentCacheBase.updateCache({ key: getCacheKey(documentId), etag: data.etag, file }).catch(() => {});
    },
    signal,
  })();
};
