import { useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import selectors from 'selectors';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { getLinearizedDocumentFile } from 'utils/getFileService';
import { queryClient } from 'utils/queryClient';

import { AI_MODE } from 'features/AIChatBot/constants/mode';
import { ProcessDocumentForChatbotPayload } from 'features/EditorChatBot/apis';
import { AGENT_MODE_MAX_DOCUMENT_SIZE_BYTES, AGENT_MODE_MAX_PAGE_COUNT } from 'features/EditorChatBot/constants';
import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { useProcessDocumentForChatbotQuery } from 'features/EditorChatBot/hooks/useProcessDocumentForChatbotQuery';
import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import { LOGGER } from 'constants/lumin-common';

export const useHandleRefreshAI = () => {
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const totalPages = useSelector(selectors.getTotalPages);
  const AIMode = useSelector(editorChatBotSelectors.getAIMode);
  const { setIsUploadingDocument, setNeedToUpload, needToUpload, hasStartChatbotSession, setIsUploadLargeDocument } =
    useChatbotStore(
      useShallow((state) => ({
        setIsUploadingDocument: state.setIsUploadingDocument,
        setNeedToUpload: state.setNeedToUpload,
        needToUpload: state.needToUpload,
        hasStartChatbotSession: state.hasStartChatbotSession,
        setIsUploadLargeDocument: state.setIsUploadLargeDocument,
      }))
    );

  const uploadFile = async (presignedUrl: string): Promise<void> => {
    try {
      const file = await getLinearizedDocumentFile('file.pdf', {
        shouldRemoveJavaScript: true,
        shouldRemoveSecurity: true,
      });
      await documentServices.uploadFileToS3({
        file,
        presignedUrl,
      });
    } catch (error) {
      logger.logError({
        error: error as Error,
        reason: LOGGER.Service.EDITOR_CHATBOT,
        message: 'Upload file for processing failed',
      });
    }
  };
  const { data: processDocumentForChatbotData, refetch: refetchProcessDocumentForChatbot } =
    useProcessDocumentForChatbotQuery({
      documentId: currentDocument._id,
      requestNewPutObjectUrl: needToUpload && hasStartChatbotSession,
    });

  const setUpChatbotSession = () => {
    setIsUploadingDocument(true);
  };

  const clearUploadLargeDocument = () => {
    setIsUploadingDocument(false);
    setIsUploadLargeDocument(false);
  };

  const handleUploadDocument = async (presignedUrl?: string) => {
    try {
      let putObjectUrl = presignedUrl;
      if (!putObjectUrl) {
        const { data } = (await refetchProcessDocumentForChatbot()) || {};
        putObjectUrl = data?.putObjectUrl;
      }

      if (!putObjectUrl) {
        throw new Error('putObjectUrl not found');
      }

      await uploadFile(putObjectUrl);
      setNeedToUpload(false);
    } catch (e) {
      const error = new Error('Upload document failed', { cause: e });
      logger.logError({
        error,
        reason: LOGGER.Service.EDITOR_CHATBOT,
      });
      throw error;
    } finally {
      queryClient.setQueryData<ProcessDocumentForChatbotPayload>(['processDocumentForChatbot'], () => ({
        needToUpload: false,
        putObjectUrl: null,
      }));
    }
  };

  async function uploadOrTriggerReload() {
    setUpChatbotSession();
    const { data } = (await refetchProcessDocumentForChatbot()) || {};
    if (data?.needToUpload) {
      await handleUploadDocument(data.putObjectUrl);
    }
  }

  const handleRefreshDocument = async () => {
    try {
      setIsUploadLargeDocument(true);
      if (!processDocumentForChatbotData) {
        await uploadOrTriggerReload();
        clearUploadLargeDocument();
        return true;
      }

      if (processDocumentForChatbotData?.needToUpload || needToUpload) {
        setUpChatbotSession();
        await handleUploadDocument();
        clearUploadLargeDocument();
        return true;
      }

      return false;
    } catch (e) {
      const error = new Error('Check document upload available failed', { cause: e });
      logger.logError({
        error,
        reason: LOGGER.Service.EDITOR_CHATBOT,
      });
      return false;
    }
  };

  return {
    handleRefreshDocument,
    isShowPopUpRefresh:
      needToUpload &&
      (currentDocument.size > AGENT_MODE_MAX_DOCUMENT_SIZE_BYTES || totalPages > AGENT_MODE_MAX_PAGE_COUNT) &&
      AIMode === AI_MODE.AGENT_MODE,
  };
};
