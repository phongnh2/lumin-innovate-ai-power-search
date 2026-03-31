import { Message, useChat } from '@ai-sdk/react';
import { type ToolInvocationUIPart } from '@ai-sdk/ui-utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

import { RequestHeaderKeys } from '@libs/axios/constants/request-header-keys.constant';
import { LEFT_PANEL_VALUES } from '@new-ui/components/LuminLeftPanel/constants';
import useLeftPanel from '@new-ui/components/LuminLeftPanel/useLeftPanel';
import { LayoutElements } from '@new-ui/constants';

import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { useLatestRef } from 'hooks/useLatestRef';
import { usePrevious } from 'hooks/usePrevious';
import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { cookieManager } from 'helpers/cookieManager';
import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { eventTracking } from 'utils';
import { queryClient } from 'utils/queryClient';
import SessionUtils from 'utils/session';

import { FEEDBACK_TYPE } from 'features/AIChatBot/constants';
import { useChatBotFeedback } from 'features/AIChatBot/hooks/useChatBotFeedback';
import { ChatBotContextType, CustomMessageType } from 'features/AIChatBot/interface';
import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';
import { onToolCall } from 'features/EditorChatBot/ai/toolCalling';

import { CookieStorageKey } from 'constants/cookieName';
import { CUSTOM_EVENT } from 'constants/customEvent';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { EDITOR_BACKEND_BASE_URL } from 'constants/urls';

import { ProcessDocumentForChatbotPayload } from './apis';
import { EditorChatBot } from './EditorChatBot';
import { useChatbotDocumentHandler } from './hooks/useChatbotDocumentHandler';
import { useChatbotMessageParts } from './hooks/useChatbotMessageParts';
import { useChatbotStore } from './hooks/useChatbotStore';
import { useEditorChatBotAbortStore } from './hooks/useEditorChatBotAbortStore';
import { useInputFocus } from './hooks/useInputFocus';
import { useSetupErrorPrompt } from './hooks/useSetupErrorPrompt';
import {
  selectors as editorChatBotSelectors,
  setChatSessionId,
  setMessages as setMessagesAction,
  setMessageRestriction,
  setIsErrorFlag,
  setLatestTraceId,
  setSplitExtractPages,
  setChatId,
} from './slices';
import { RequestBodyType } from './types';
import { checkGeneratedOutlines } from './utils/checkGeneratedOutlines';
import { hasResponseFromChatbot } from './utils/checkResponseChatbot';
import { getMetadataLangfuse } from './utils/getMedataSendToLangfuse';
import { isEmptyRetryResponseMessage } from './utils/isEmptyResponseMessage';
import { toolCallingQueue } from './utils/toolCallingQueue';
import { ChatBotContext } from '../AIChatBot/components/ChatBotContext';

export default function EditorChatBotProvider() {
  const dispatch = useDispatch();
  const storedMessages = useSelector(editorChatBotSelectors.getMessages);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const [shouldTriggerSubmit, setTriggerSubmit] = useState(false);
  const [isMessageAnimated, setIsMessageAnimated] = useState(false);
  const { feedbackType, isSubmitted: isSubmittedFeedback } = useSelector(editorChatBotSelectors.getFeedbackStates);
  const chatSessionId = useSelector(editorChatBotSelectors.getChatSessionId);
  const { callbackResetFeedbackStates } = useChatBotFeedback();
  const latestFeedbackType = useLatestRef(feedbackType);
  const splitExtractPages = useSelector(editorChatBotSelectors.getSplitExtractPages);
  const { openLeftPanel } = useLeftPanel();
  const chatId = useSelector(editorChatBotSelectors.getChatId);
  const AIMode = useSelector(editorChatBotSelectors.getAIMode);

  const openOutlinePanel = () => {
    openLeftPanel(LEFT_PANEL_VALUES.OUTLINE);
  };

  const {
    setIsUploadingDocument,
    hasStartChatbotSession,
    setHasStartChatbotSession,
    isUploadingDocument,
    setNeedToUpload,
    isQuickActionOpen,
    setIsQuickActionOpen,
  } = useChatbotStore(
    useShallow((state) => ({
      setIsUploadingDocument: state.setIsUploadingDocument,
      hasStartChatbotSession: state.hasStartChatbotSession,
      setHasStartChatbotSession: state.setHasStartChatbotSession,
      isUploadingDocument: state.isUploadingDocument,
      setNeedToUpload: state.setNeedToUpload,
      needToUpload: state.needToUpload,
      isQuickActionOpen: state.isQuickActionOpen,
      setIsQuickActionOpen: state.setIsQuickActionOpen,
    }))
  );
  const { t } = useTranslation();
  const { createAbortController } = useEditorChatBotAbortStore();
  const { handleSyncThirdParty } = useSyncThirdParty();
  const { messagePartsHandler } = useChatbotMessageParts();

  const { messages, setInput, handleSubmit, status, input, setMessages, error, stop, reload } = useChat({
    api: `${EDITOR_BACKEND_BASE_URL}/chat`,
    onToolCall: ({ toolCall }) =>
      onToolCall({
        toolCall,
        t,
        callback: openOutlinePanel,
        handleSyncThirdParty,
        currentDocument,
      }),
    maxSteps: 4,
    body: {
      documentId: currentDocument._id,
      sessionId: chatSessionId,
      id: chatId,
      totalPage: core.getDocument() ? core.getTotalPages().toString() : '0',
      mode: AIMode,
    },
    initialMessages: storedMessages as Message[],
    async fetch(_input: string, init) {
      const { luminLanguage, browserLanguage, emailDomain } = await getMetadataLangfuse();
      const token = await SessionUtils.getAuthorizedToken();
      const usePreview = cookieManager.get(CookieStorageKey.USE_PREVIEW);
      const traceId = v4();
      dispatch(setLatestTraceId(traceId));
      createAbortController();
      if (init.body && typeof init.body === 'string') {
        const body = JSON.parse(init.body) as RequestBodyType;
        body.traceId = traceId;
        body.metadata = {
          luminLanguage,
          browserLanguage,
          emailDomain,
        };
        init.body = JSON.stringify(body);
      }
      return fetch(_input, {
        ...init,
        headers: {
          ...init.headers,
          'Authorization-V2': `Bearer ${token}`,
          ...(usePreview && { [RequestHeaderKeys.LuminUsePreview]: usePreview }),
        },
      });
    },
    sendExtraMessageFields: true,
    onFinish: async (message) => {
      if (!message) {
        return;
      }
      checkGeneratedOutlines({ message, t });
      const errorFlag = store.getState().editorChatBot.isErrorFlag;
      const messageParts = message.parts;

      messagePartsHandler({ messageId: message.id, messageParts });

      const eventTrackingPayload = {
        documentId: currentDocument._id,
        responseId: message.id,
        sessionId: chatSessionId,
        responseType: message.parts[0].type,
        toolName: message?.toolInvocations?.[0]?.toolName || null,
        errorFlag,
        errorMessage: errorFlag ? (message?.toolInvocations?.[0]?.result as string) : null,
      };
      await eventTracking(UserEventConstants.EventType.CHATBOT_MESSAGE_RECEIVED, eventTrackingPayload);

      // We add toolcall editText to the queue for handle case discard changes in editpdf mode
      const { queueLength, isProcessing } = toolCallingQueue.getStatus();
      if (queueLength !== 0 && !isProcessing) {
        await toolCallingQueue.processQueue();
      }

      const currentMessageRestriction = store.getState().editorChatBot.messageRestriction;

      if (currentMessageRestriction) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: v4(),
            role: 'assistant',
            content: currentMessageRestriction,
          },
        ]);
        dispatch(setMessageRestriction(null));
      }
      if (isEmptyRetryResponseMessage(message)) {
        setMessages((prevMessages) =>
          prevMessages.map((prevMessage) => {
            if (prevMessage.id === message.id) {
              return {
                ...prevMessage,
                content: t('viewer.chatbot.unableToGenerateResponse'),
              };
            }
            return prevMessage;
          })
        );
      }
    },
  });
  const inputPromptRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevStatus = usePrevious(status);
  const lastMessage = messages[messages.length - 1] as CustomMessageType;

  const isProcessingToolCalling = useCallback(() => {
    if (
      !lastMessage ||
      lastMessage.role !== 'assistant' ||
      lastMessage.parts.every(({ type }) => type !== 'tool-invocation')
    ) {
      return false;
    }
    const toolInvocation = lastMessage.parts.find(({ type }) => type === 'tool-invocation') as ToolInvocationUIPart;
    return toolInvocation.toolInvocation.state !== 'result';
  }, [lastMessage]);

  useEffect(() => {
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return;
    }

    const handleAssistantMessageAnimated = (event: CustomEvent<{ messageId: string }>) => {
      if (event.detail.messageId === lastMessage.id) {
        setIsMessageAnimated(true);
      }
    };

    window.addEventListener(
      CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED,
      handleAssistantMessageAnimated as EventListener);

    return () => {
      window.removeEventListener(
        CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED,
        handleAssistantMessageAnimated as EventListener
      );
    };
  }, [lastMessage, status]);

  const getAbortController = useCallback(() => {
    if (abortControllerRef.current !== null) {
      return abortControllerRef.current;
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    return abortController;
  }, []);

  const resetAbortController = useCallback(() => {
    abortControllerRef.current = new AbortController();
  }, []);
  const resetSplitExtractPages = () => {
    if (splitExtractPages.length > 0) {
      store.dispatch(setSplitExtractPages([]));
    }
  };

  const { checkDocumentUploadAvailable } = useChatbotDocumentHandler({
    input,
    inputPromptRef,
    setInput,
    setMessages,
    reload,
    getAbortController,
    stop,
    resetAbortController,
  });
  const { setupErrorPrompt, checkRequestsLimit } = useSetupErrorPrompt({ setMessages, setInput, inputPromptRef });

  const closeChatBot = () => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.CHATBOT,
      isOpen: false,
    });
  };

  const isProcessingOrStreaming = status === 'submitted' || status === 'streaming';

  const checkChatbotSession = () => {
    if (!hasStartChatbotSession) {
      setHasStartChatbotSession(true);
    }
  };

  const isAllowedSubmitNextMessage = () => {
    if (isQuickActionOpen) {
      setIsQuickActionOpen(false);
      return true;
    }
    if (!lastMessage) {
      return true;
    }
    if (lastMessage.role === 'assistant') {
      const { isOldMessage, id: lastMessageId } = lastMessage;
      const isAnimated = document.getElementById(lastMessageId)?.dataset.animated === 'true';
      return isOldMessage || isAnimated;
    }
    return true;
  };

  const handleSendMessage = async () => {
    resetAbortController();
    if (latestFeedbackType.current === FEEDBACK_TYPE.DISLIKE && !isSubmittedFeedback) {
      fireEvent(CUSTOM_EVENT.AUTO_SUBMIT_CHATBOT_FEEDBACK);
    }
    const eventTrackingPayload = {
      documentId: currentDocument._id,
      promptMessage: input,
      sessionId: chatSessionId,
      // TODO: handle after apply suggest prompt
      promptAccepted: false,
      mode: AIMode,
    };
    resetSplitExtractPages();

    eventTracking(UserEventConstants.EventType.CHATBOT_MESSAGE_SENT, eventTrackingPayload).catch(() => {});
    callbackResetFeedbackStates();

    if (!isAllowedSubmitNextMessage()) {
      return;
    }

    const isReachedLimit = checkRequestsLimit(input);
    if (isReachedLimit) {
      return;
    }

    checkChatbotSession();
    const documentUploadAvailable = await checkDocumentUploadAvailable(t, AIMode);
    if (documentUploadAvailable) {
      return;
    }

    if (!input && !isProcessingOrStreaming) {
      // If the input is empty, don't send anything
      return;
    }

    if (store.getState().editorChatBot.isErrorFlag) {
      store.dispatch(setIsErrorFlag(false));
    }

    await eventTracking(UserEventConstants.EventType.CHATBOT_MESSAGE_SENT, eventTrackingPayload);
    try {
      handleSubmit(undefined);
      // Clear the input after sending
      if (inputPromptRef.current) {
        inputPromptRef.current.innerText = '';
      }
    } catch (e) {
      logger.logError({
        error: e,
        reason: LOGGER.Service.EDITOR_CHATBOT,
      });
    } finally {
      const hasChatbotResponse = hasResponseFromChatbot(messages);
      if (hasChatbotResponse) {
        setNeedToUpload(false);
      }
      queryClient.setQueryData<ProcessDocumentForChatbotPayload>(['processDocumentForChatbot'], () => ({
        needToUpload: false,
        putObjectUrl: null,
      }));
      setIsUploadingDocument(false);
    }
  };

  const stopUploadingDocument = () => {
    setIsUploadingDocument(false);
    getAbortController().abort();
  };

  useInputFocus({ inputRef: inputPromptRef });

  useEffect(() => {
    if (shouldTriggerSubmit) {
      handleSendMessage().finally(() => {
        setTriggerSubmit(false);
      });
    }
  }, [shouldTriggerSubmit]);

  useEffect(() => {
    if (error) {
      setupErrorPrompt(error);
    }
  }, [error]);

  useEffect(() => {
    if (prevStatus !== status && (status === 'ready' || status === 'error') && messages.length > 0) {
      dispatch(
        setMessagesAction(
          messages.map((message) => ({
            ...message,
            isOldMessage: true,
          }))
        )
      );
    }
  }, [prevStatus, messages, status]);

  useEffect(() => {
    if (!chatSessionId) {
      dispatch(setChatSessionId(chatId));
    }
  }, [chatId, chatSessionId]);

  useEffect(() => {
    if (!chatId) {
      dispatch(setChatId(v4()));
    }
  }, [chatId]);

  const contextValue: ChatBotContextType = useMemo(
    () => ({
      messages,
      setMessages,
      input,
      setInput,
      status,
      handleSendMessage,
      inputPromptRef,
      setTriggerSubmit,
      onClose: closeChatBot,
      stop,
      stopCallback: stopUploadingDocument,
      isProcessing: status === 'submitted' || isUploadingDocument || isProcessingToolCalling(),
      isMessageAnimated,
      reload,
      chatSessionId,
    }),
    [
      messages,
      setMessages,
      input,
      setInput,
      status,
      handleSendMessage,
      stop,
      stopUploadingDocument,
      isUploadingDocument,
      isProcessingToolCalling,
      isMessageAnimated,
      reload,
      chatSessionId,
    ]
  );

  return (
    <ChatBotContext.Provider value={contextValue}>
      <EditorChatBot />
    </ChatBotContext.Provider>
  );
}
