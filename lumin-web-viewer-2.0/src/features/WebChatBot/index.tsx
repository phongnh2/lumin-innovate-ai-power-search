import { Message, useChat } from '@ai-sdk/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';

import { LayoutElements } from '@new-ui/constants';

import { usePrevious } from 'hooks/usePrevious';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { eventTracking } from 'utils';
import SessionUtils from 'utils/session';

import { ChatBotContext } from 'features/AIChatBot/components/ChatBotContext';
import { ChatBotContextType } from 'features/AIChatBot/interface';

import { AUTHORIZATION_HEADER } from 'constants/authConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { WEB_CHAT_BOT_API_URL } from 'constants/urls';

import { useChatbotMessageParts } from './hooks/useChatbotMessageParts';
import { useGetChatbotPayload } from './hooks/useGetChatbotPayload';
import { useInputFocus } from './hooks/useInputFocus';
import { useSetupErrorPrompt } from './hooks/useSetupErrorPrompt';
import { selectors as webChatBotSelectors, setMessages as setMessagesAction, setChatSessionId } from './slices';
import { WebChatBot } from './WebChatBot';

export default function WebChatBotContainer() {
  const dispatch = useDispatch();
  const storedMessages = useSelector(webChatBotSelectors.getMessages);
  const [shouldTriggerSubmit, setTriggerSubmit] = useState(false);
  const [isMessageAnimated, setIsMessageAnimated] = useState(false);
  const chatSessionId = useSelector(webChatBotSelectors.getChatSessionId);

  const chatbotPayload = useGetChatbotPayload();
  const { messagePartsHandler } = useChatbotMessageParts();

  const { messages, setInput, handleSubmit, status, input, setMessages, error, stop, reload } = useChat({
    api: `${WEB_CHAT_BOT_API_URL}/chat`,
    body: {
      ...chatbotPayload,
    },
    maxSteps: 100,
    initialMessages: storedMessages as Message[],
    sendExtraMessageFields: true,
    onError: (e) => {
      logger.logError({
        error: e,
        reason: LOGGER.Service.WEB_CHAT_BOT,
      });
    },
    async fetch(_input: string, init) {
      const token = await SessionUtils.getAuthorizedToken();
      return fetch(_input, {
        ...init,
        headers: {
          ...init.headers,
          [AUTHORIZATION_HEADER]: `Bearer ${token}`,
          'X-Thread-Id': chatSessionId,
        },
      });
    },
    onFinish: (message) => {
      if (!message) {
        return;
      }

      const messageParts = message.parts;
      messagePartsHandler({ messageId: message.id, messageParts });

      const eventTrackingPayload = {
        responseId: message.id,
        sessionId: chatSessionId,
        responseType: message.parts[0].type,
        // TODO: add error flag and error message when implement Request limit reached, Plan restrictions, etc
        // errorFlag,
        // errorMessage: errorFlag ? (message?.toolInvocations?.[0]?.result as string) : null,
      };
      eventTracking(UserEventConstants.EventType.CHATBOT_MESSAGE_RECEIVED, eventTrackingPayload).catch(() => {});
    },
  });
  const inputPromptRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevStatus = usePrevious(status);
  const lastMessage = messages[messages.length - 1];

  const resetAbortController = useCallback(() => {
    abortControllerRef.current = new AbortController();
  }, []);

  const { setupErrorPrompt, checkRequestsLimit } = useSetupErrorPrompt({ setMessages, setInput, inputPromptRef });

  const closeChatBot = () => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.CHATBOT,
      isOpen: false,
    });
  };

  const isProcessingOrStreaming = status === 'submitted' || status === 'streaming';

  const isAllowedSubmitNextMessage = () => {
    if (!lastMessage) {
      return true;
    }
    if (lastMessage.role === 'assistant') {
      return document.getElementById(lastMessage.id)?.dataset.animated === 'true';
    }
    return true;
  };

  const handleSendMessage = async () => {
    if (!isAllowedSubmitNextMessage()) {
      return;
    }

    const isReachedLimit = checkRequestsLimit(input);
    if (isReachedLimit) {
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    if (!input && !isProcessingOrStreaming) {
      // If the input is empty, don't send anything
      return;
    }

    eventTracking(UserEventConstants.EventType.CHATBOT_MESSAGE_SENT, {
      sessionId: chatSessionId,
    }).catch(() => {});

    try {
      handleSubmit(undefined);

      // Clear the input after sending
      if (inputPromptRef.current) {
        inputPromptRef.current.innerText = '';
      }
    } catch (e) {
      logger.logError({
        error: e,
        reason: LOGGER.Service.WEB_CHAT_BOT,
      });
    } finally {
      resetAbortController();
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (!chatSessionId) {
      dispatch(setChatSessionId(v4()));
    }
  }, [chatSessionId]);

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
      handleAssistantMessageAnimated as EventListener
    );

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener(
        CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED,
        handleAssistantMessageAnimated as EventListener
      );
    };
  }, [lastMessage, status]);

  // Create context value
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
      isProcessing: status === 'submitted',
      isMessageAnimated,
      reload,
    }),
    [input, messages, status, inputPromptRef, isMessageAnimated]
  );

  return (
    <ChatBotContext.Provider value={contextValue}>
      <WebChatBot />
    </ChatBotContext.Provider>
  );
}
