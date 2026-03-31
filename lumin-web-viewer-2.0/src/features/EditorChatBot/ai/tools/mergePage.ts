/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { TFunction } from 'i18next';
import { get } from 'lodash';
import { AnyAction } from 'redux';

import { setBackDropMessage } from 'actions/customActions';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

import logger from 'helpers/logger';

import { getDocumentSize } from 'utils/getDocumentSize';
import { syncFileToS3 } from 'utils/syncFileToS3';

import { AttachedFileType } from 'features/AIChatBot/interface';
import { documentSyncActions } from 'features/Document/slices';
import { MERGE_PAGE_POSITION } from 'features/EditorChatBot/constants';
import { useEditorChatBotAbortStore } from 'features/EditorChatBot/hooks/useEditorChatBotAbortStore';
import { setIsAiProcessing, setMergeFiles } from 'features/EditorChatBot/slices';

import { LOGGER, STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

const getInsertPosition = (currentPageCount: number, position: string) => {
  switch (position) {
    case MERGE_PAGE_POSITION.FIRST:
      return 1;
    case MERGE_PAGE_POSITION.LAST:
      return currentPageCount + 1;
    default:
      return currentPageCount + 1;
  }
};

const handleSyncDocument = async (handleSyncThirdParty: () => void, currentDocument: IDocumentBase): Promise<void> => {
  const abortSignal = useEditorChatBotAbortStore.getState().abortController?.signal;
  const documentService = get(currentDocument, 'service', '');

  if (documentService === STORAGE_TYPE.S3) {
    await syncFileToS3({ signal: abortSignal, increaseVersion: true });
    return;
  }

  handleSyncThirdParty();
};
const initializeMergeProcess = (t: TFunction) => {
  store.dispatch(setIsAiProcessing(true));
  store.dispatch(
    setBackDropMessage(t('viewer.chatbot.mergePage.merging'), {
      status: 'loading',
    })
  );
  store.dispatch(documentSyncActions.setIsSyncing({ isSyncing: true, increaseVersion: true }));
};

const cleanupMergeProcess = () => {
  store.dispatch(setBackDropMessage(null));
  store.dispatch(setIsAiProcessing(false));
  store.dispatch(setMergeFiles([]));
};

export const mergePage = async ({
  position,
  handleSyncThirdParty,
  currentDocument,
  t,
  uploadedFiles,
}: {
  position: string;
  handleSyncThirdParty: () => void;
  currentDocument: IDocumentBase;
  t: TFunction;
  uploadedFiles: AttachedFileType[];
}): Promise<string> => {
  try {
    initializeMergeProcess(t);
    const currentPdfDoc = await core.getDocument().getPDFDoc();
    const currentPageCount = await currentPdfDoc.getPageCount();

    let insertPosition = getInsertPosition(currentPageCount, position);

    for (const file of uploadedFiles) {
      const uploadedDocInstance = await core.CoreControls.createDocument(file.buffer);
      const uploadedPdfDoc = await uploadedDocInstance.getPDFDoc();
      const uploadedPageCount = await uploadedPdfDoc.getPageCount();
      const pageRange = Array.from({ length: uploadedPageCount }, (_, index) => index + 1);

      await core.getDocument().insertPages(uploadedDocInstance, pageRange, insertPosition);
      insertPosition += uploadedPageCount;
    }
    cleanupMergeProcess();
    await handleSyncDocument(handleSyncThirdParty, currentDocument);
    store.dispatch(documentSyncActions.setIsSyncing({ isSyncing: false }));
    const documentSize = await getDocumentSize();
    store.dispatch(actions.updateCurrentDocument({ size: documentSize }) as AnyAction);
    store.dispatch(setMergeFiles([]));
    return `Merged successfully`;
  } catch (error) {
    logger.logError({
      error: error as Error,
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    return `Failed to merge`;
  }
};
