import { Message } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import { TFunction } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import core from 'core';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import useShallowSelector from 'hooks/useShallowSelector';

import { AI_MODE } from 'features/AIChatBot/constants/mode';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useChatbotStore } from './useChatbotStore';
import {
  AGENT_MODE_MAX_DOCUMENT_SIZE_BYTES,
  AGENT_MODE_MAX_DOCUMENT_SIZE_MB,
  AGENT_MODE_MAX_PAGE_COUNT,
  ASK_MODE_MAX_DOCUMENT_SIZE_BYTES,
  ASK_MODE_MAX_DOCUMENT_SIZE_MB,
  ASK_MODE_MAX_PAGE_COUNT,
  CANNY_URL_FEEDBACK_CHATBOT,
} from '../constants';
import { setFeedbackHidden } from '../slices';

const ERROR_MESSAGE_DISPLAY_DELAY_MS = 500;

type UseCheckDocumentValidityParams = {
  input: string;
  inputPromptRef: React.RefObject<HTMLDivElement>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
};

type DocumentValidationResult = {
  isValid: boolean;
  invalidReason?: 'size' | 'pages' | 'tokens';
  message?: string;
};

export const useCheckDocumentValidity = ({
  input,
  inputPromptRef,
  setInput,
  setMessages,
}: UseCheckDocumentValidityParams) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const { setIsValidateDocument } = useChatbotStore();
  const dispatch = useDispatch();
  const latestErrorMessage = useRef<string>();
  const addUserMessageToChat = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: v4(),
        role: 'user',
        content: input,
      },
    ]);
    setInput('');
    inputPromptRef.current.textContent = '';
  };

  const addErrorMessageToChat = (content: string) => {
    timeoutIdRef.current = setTimeout(() => {
      const id = v4();
      latestErrorMessage.current = id;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id,
          role: 'assistant',
          content,
        },
      ]);
      dispatch(setFeedbackHidden(true));
    }, ERROR_MESSAGE_DISPLAY_DELAY_MS);
  };

  useEffect(() => {
    const handleAssistantMessageAnimated = ({ detail }: CustomEvent<{ messageId: string }>) => {
      const { messageId } = detail;
      if (messageId === latestErrorMessage.current) {
        setIsValidateDocument(false);
        latestErrorMessage.current = undefined;
      }
    };
    window.addEventListener(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, handleAssistantMessageAnimated);
    return () => {
      window.removeEventListener(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, handleAssistantMessageAnimated);
    };
  }, []);

  const showInvalidDocumentMessage = (message: string) => {
    addUserMessageToChat();
    addErrorMessageToChat(message);
  };

  const validateDocument = (t: TFunction, AIMode: string): DocumentValidationResult => {
    const totalPages = core.getTotalPages();
    const documentSize = currentDocument.size;

    if (documentSize > ASK_MODE_MAX_DOCUMENT_SIZE_BYTES || totalPages > ASK_MODE_MAX_PAGE_COUNT) {
      return {
        isValid: false,
        invalidReason: 'size',
        message: t('viewer.chatbot.documentValid.askModeMessage', {
          pages: ASK_MODE_MAX_PAGE_COUNT,
          size: ASK_MODE_MAX_DOCUMENT_SIZE_MB,
          feedbackUrl: CANNY_URL_FEEDBACK_CHATBOT,
        }),
      };
    }

    if (
      (documentSize > AGENT_MODE_MAX_DOCUMENT_SIZE_BYTES || totalPages > AGENT_MODE_MAX_PAGE_COUNT) &&
      AIMode === AI_MODE.AGENT_MODE
    ) {
      return {
        isValid: false,
        invalidReason: 'size',
        message: t('viewer.chatbot.documentValid.agentModeMessage', {
          pages: AGENT_MODE_MAX_PAGE_COUNT,
          size: AGENT_MODE_MAX_DOCUMENT_SIZE_MB,
        }),
      };
    }
    return { isValid: true };
  };

  const checkDocumentValidity = (t: TFunction, AIMode: string): boolean => {
    setIsValidateDocument(true);
    const validationResult = validateDocument(t, AIMode);

    if (!validationResult.isValid) {
      showInvalidDocumentMessage(validationResult?.message);
      return false;
    }

    setIsValidateDocument(false);
    return true;
  };

  useCleanup(() => {
    clearTimeout(timeoutIdRef.current);
  }, []);

  return { checkDocumentValidity };
};
