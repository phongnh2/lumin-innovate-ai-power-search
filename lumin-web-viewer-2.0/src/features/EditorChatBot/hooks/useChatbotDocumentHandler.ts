import { Message } from '@ai-sdk/react';
import { TFunction } from 'react-i18next';
import { v4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { getLinearizedDocumentFile } from 'utils/getFileService';
import { queryClient } from 'utils/queryClient';

import { LOGGER } from 'constants/lumin-common';

import { useChatbotStore } from './useChatbotStore';
import { useCheckDocumentValidity } from './useCheckDocumentValidity';
import { useProcessDocumentForChatbotQuery } from './useProcessDocumentForChatbotQuery';
import { ProcessDocumentForChatbotPayload } from '../apis';

type UseUploadDocumentForChatbotParams = {
  input: string;
  inputPromptRef: React.RefObject<HTMLDivElement>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: () => Promise<string>;
  getAbortController: () => AbortController;
  stop: () => void;
  resetAbortController: () => void;
};

export const useChatbotDocumentHandler = ({
  input,
  inputPromptRef,
  setInput,
  setMessages,
  reload,
  getAbortController,
  resetAbortController,
}: UseUploadDocumentForChatbotParams) => {
  const { setIsUploadingDocument, setNeedToUpload, needToUpload, hasStartChatbotSession } = useChatbotStore(
    useShallow((state) => ({
      setIsUploadingDocument: state.setIsUploadingDocument,
      setNeedToUpload: state.setNeedToUpload,
      needToUpload: state.needToUpload,
      hasStartChatbotSession: state.hasStartChatbotSession,
    }))
  );
  const { checkDocumentValidity } = useCheckDocumentValidity({
    input,
    inputPromptRef,
    setInput,
    setMessages,
  });
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { data: processDocumentForChatbotData, refetch: refetchProcessDocumentForChatbot } =
    useProcessDocumentForChatbotQuery({
      documentId: currentDocument._id,
      requestNewPutObjectUrl: needToUpload && hasStartChatbotSession,
    });
  const uploadFile = async (presignedUrl: string): Promise<void> => {
    try {
      const file = await getLinearizedDocumentFile('file.pdf', {
        shouldRemoveJavaScript: true,
        shouldRemoveSecurity: true,
      });
      await documentServices.uploadFileToS3({
        file,
        presignedUrl,
        options: {
          signal: getAbortController().signal,
        },
      });
    } catch (error) {
      logger.logError({
        error: error as Error,
        reason: LOGGER.Service.EDITOR_CHATBOT,
        message: 'Upload file for processing failed',
      });
    }
  };

  const updateChatbotMessages = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: v4(),
        role: 'user',
        content: input,
      },
    ]);
    setInput('');
    if (inputPromptRef.current) {
      inputPromptRef.current.innerText = '';
    }
  };

  const setUpChatbotSession = () => {
    setIsUploadingDocument(true);
    updateChatbotMessages();
  };

  const resetChatbotSession = () => {
    setIsUploadingDocument(false);
    resetAbortController();
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
      if (getAbortController().signal?.aborted) {
        return;
      }
      reload().catch(() => {});
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
      resetChatbotSession();
    }
  };

  const uploadOrTriggerReload = async () => {
    setUpChatbotSession();
    const { data } = (await refetchProcessDocumentForChatbot()) || {};
    if (data?.needToUpload) {
      await handleUploadDocument(data.putObjectUrl);
      return;
    }

    if (!getAbortController().signal?.aborted) {
      reload().catch(() => {});
    }
    resetChatbotSession();
  };

  const checkDocumentUploadAvailable = async (t: TFunction, AIMode: string) => {
    try {
      const isValid = checkDocumentValidity(t, AIMode);
      if (!isValid) {
        return true;
      }

      if (!processDocumentForChatbotData) {
        await uploadOrTriggerReload();
        return true;
      }

      if (processDocumentForChatbotData?.needToUpload || needToUpload) {
        setUpChatbotSession();
        await handleUploadDocument();
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

  return { checkDocumentUploadAvailable };
};
