import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { documentStorage } from 'constants/documentConstants';
import { SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

export type UseSyncOnContentChangePayload = [() => Promise<void>, { isLoading: boolean; isError: boolean }];

export const useSyncOnContentChange = (): UseSyncOnContentChangePayload => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const syncFileMutation = useCallback(() => {
    try {
      if (currentDocument.service === documentStorage.s3) {
        socketService.modifyDocumentContent(currentDocument._id, { status: 'preparing', increaseVersion: false });
      }
      return documentServices.syncFileToS3Exclusive(currentDocument, {
        increaseVersion: false,
        action: SAVE_OPERATION_TYPES.CONTENT_EDIT,
      });
    } catch (error) {
      socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', increaseVersion: false });
      throw error;
    }
  }, [currentDocument]);

  const {
    mutateAsync: triggerMutate,
    isLoading,
    isError,
  } = useMutation({
    mutationKey: ['sync-on-content-change', currentDocument?._id],
    mutationFn: syncFileMutation,
  });

  const sync = useCallback(async () => {
    if (currentDocument) {
      fireEvent(CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE);
      await triggerMutate();
    }
  }, [currentDocument, triggerMutate]);

  return useMemo(() => [sync, { isLoading, isError }], [sync, isLoading, isError]);
};
