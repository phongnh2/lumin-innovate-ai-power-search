import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import core from 'core';
import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';
import { usePrevious } from 'hooks/usePrevious';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';

import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

import { useChatbotStore } from './useChatbotStore';

export const useCheckDocumentChange = () => {
  const { needToUpload, setNeedToUpload, hasStartChatbotSession } = useChatbotStore(
    useShallow((state) => ({
      needToUpload: state.needToUpload,
      setNeedToUpload: state.setNeedToUpload,
      hasStartChatbotSession: state.hasStartChatbotSession,
    }))
  );
  const globalSaveStatus = useSelector(documentSyncSelectors.getSaveOperationsGlobalStatus);
  const totalPages = useSelector(selectors.getTotalPages);

  const previousTotalPages = usePrevious(totalPages);
  const shouldUploadDocumentRef = useLatestRef(needToUpload);
  const hasStartChatbotSessionRef = useLatestRef(hasStartChatbotSession);

  useEffect(() => {
    if (hasStartChatbotSessionRef.current && !shouldUploadDocumentRef.current && totalPages !== previousTotalPages) {
      setNeedToUpload(true);
    }
  }, [totalPages, previousTotalPages]);

  useEffect(() => {
    if (
      hasStartChatbotSessionRef.current &&
      !shouldUploadDocumentRef.current &&
      globalSaveStatus === SAVE_OPERATION_STATUS.SAVING
    ) {
      setNeedToUpload(true);
    }
  }, [totalPages, previousTotalPages, globalSaveStatus]);

  useEffect(() => {
    const onDocumentChanged = () => {
      if (!hasStartChatbotSessionRef.current || shouldUploadDocumentRef.current) {
        return;
      }

      setNeedToUpload(true);
    };

    core.addEventListener('annotationChanged', onDocumentChanged);
    core.addEventListener('fieldChanged', onDocumentChanged);
    core.addEventListener('pagesUpdated', onDocumentChanged);
    return () => {
      core.removeEventListener('annotationChanged', onDocumentChanged);
      core.removeEventListener('fieldChanged', onDocumentChanged);
      core.removeEventListener('pagesUpdated', onDocumentChanged);
    };
  }, []);
};
