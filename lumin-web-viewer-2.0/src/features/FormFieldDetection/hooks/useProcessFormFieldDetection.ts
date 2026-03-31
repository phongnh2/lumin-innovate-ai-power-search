import produce from 'immer';
import { useRef } from 'react';
import { batch, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { documentServices } from 'services';

import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { getFileData } from 'utils/getFileService';

import { DataElements } from 'constants/dataElement';
import { SOCKET_ON } from 'constants/socketConstant';

import useSetupDetectionResult from './useSetupDetectionResult';
import useShowModal from './useShowModal';
import { socket } from '../../../socket';
import { FORM_FIELD_DETECTION_TIMEOUT } from '../constants/detectionField.constant';
import { setHasEnteredFormFieldDetection } from '../slice';
import { splitPagesForFFD } from '../utils/batchRequestFFD';
import { uploadFileToS3ForDetection } from '../utils/uploadFileToS3ForDetection';

type GetPresignedUrlsFFDType = {
  blockTime: number;
  presignedUrl: string;
  sessionId: string;
  usage: number;
  isExceeded?: boolean;
};

export const useProcessFormFieldDetection = () => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { handleSetupDetectionResult } = useSetupDetectionResult();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { showLoadingModal, showUnprocessableModal } = useShowModal();

  const temporaryUploadFileForDetection = async (presignedUrl: string, { signal }: { signal: AbortSignal }) => {
    await core.getDocument().getDocumentCompletePromise();
    const xfdfString = await exportAnnotations();
    const fileBuffer = await getFileData({ xfdfString });
    return uploadFileToS3ForDetection({
      presignedUrl,
      fileBuffer,
      documentName: currentDocument.name,
      options: {
        signal,
      },
    });
  };

  const updateUserConsent = () => {
    const newUser = produce(currentUser, (draft) => {
      draft.metadata.formFieldDetectionConsentGranted = true;
    });
    dispatch(actions.updateCurrentUser(newUser));
  };

  const processBatchUploadTemporaryFile = async (presignedUrl: string, { signal }: { signal: AbortSignal }) => {
    await temporaryUploadFileForDetection(presignedUrl, { signal });
  };

  const setupDetectionResultsForAllBatches = async (
    batchResults: GetPresignedUrlsFFDType[],
    { signal }: { signal: AbortSignal }
  ) => {
    clearTimeout(timeoutRef.current);
    const listSocketMessage: string[] = [];
    const detectionPromises = batchResults.map(({ sessionId }) => {
      const socketMessage = `${SOCKET_ON.FORM_FIELD_DETECTION_COMPLETED}-${sessionId}`;
      listSocketMessage.push(socketMessage);
      return handleSetupDetectionResult({ sessionId, socketMessage }, { signal });
    });
    try {
      timeoutRef.current = setTimeout(() => {
        listSocketMessage.forEach((socketMessage) => {
          socket.removeListener({ message: socketMessage });
        });
      }, FORM_FIELD_DETECTION_TIMEOUT);
      await Promise.all(detectionPromises);
    } catch (error) {
      logger.logError({ error: new Error('Failed to process form field detection', { cause: error }) });
    } finally {
      clearTimeout(timeoutRef.current);
    }
  };
  const uploadFilesForAllBatches = async (
    batchResults: GetPresignedUrlsFFDType[],
    { signal }: { signal: AbortSignal }
  ) => {
    const uploadPromises = batchResults.map(({ presignedUrl }) =>
      processBatchUploadTemporaryFile(presignedUrl, { signal })
    );
    await Promise.all(uploadPromises);
  };
  const getPresignedUrlsForBatches = async (batches: number[][], { signal }: { signal: AbortSignal }) =>
    documentServices.batchCreatePresignedFormFieldDetectionUrl(
      {
        documentId: currentDocument._id,
        pages: batches,
      },
      { signal }
    );

  const processFormFieldDetection = async () => {
    const controller = new AbortController();
    const { signal } = controller;
    const totalPages = core.getTotalPages();

    try {
      updateUserConsent();
      dispatch(setHasEnteredFormFieldDetection(true));
      const batches = splitPagesForFFD(totalPages);
      const cancelProcess = () => {
        controller.abort();
      };

      showLoadingModal({ cancelProcess, currentStep: 0 });
      toggleFormFieldCreationMode(DataElements.FORM_BUILD_PANEL, {}, { isFormFieldDetecting: true });

      const batchResults = await getPresignedUrlsForBatches(batches, { signal });
      if (batchResults.length > 0) {
        const firstResult = batchResults[0];
        const { usage, blockTime, isExceeded } = firstResult;
        dispatch(actions.updateCurrentUser({ toolQuota: { formFieldDetection: { usage, blockTime, isExceeded } } }));
      }
      showLoadingModal({ cancelProcess, currentStep: 1 });

      await uploadFilesForAllBatches(batchResults, { signal });
      await setupDetectionResultsForAllBatches(batchResults, { signal });
    } catch (e: unknown) {
      if (!signal.aborted) {
        showUnprocessableModal();
        logger.logError({ error: new Error('Failed to process form field detection', { cause: e }) });
      }
    } finally {
      batch(() => {
        dispatch(actions.closeElement(DataElements.VIEWER_LOADING_MODAL) as AnyAction);
        dispatch(actions.resetViewerLoadingModal() as AnyAction);
      });
    }
  };

  return () => processFormFieldDetection();
};
