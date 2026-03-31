import { Message } from '@ai-sdk/react';
import { get } from 'lodash';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import { setFeedbackHidden } from 'features/EditorChatBot/slices';

import { DefaultErrorCode } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';

import { useSetupDailyRequestsErrorPrompt } from './useSetupDailyRequestsErrorPrompt';
import { useSetupFreeRequestsErrorPrompt } from './useSetupFreeRequestsErrorPrompt';
import { UseChatErrorType } from '../types';
import { ErrorExtractor } from '../utils/errorExtractor';

export const useSetupErrorPrompt = ({
  setMessages,
  setInput,
  inputPromptRef,
}: {
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  inputPromptRef: React.MutableRefObject<HTMLDivElement>;
}) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();
  const canUseChatbotDaily = get(currentDocument, 'premiumToolsInfo.aiChatbot.daily', 0);
  const dispatch = useDispatch();
  const showRequestsLimitMessage = useCallback(
    ({ input, message }: { input: string; message: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: v4(),
          role: 'user',
          content: input,
        },
        {
          id: v4(),
          role: 'assistant',
          content: message,
        },
      ]);
      setInput('');
      if (inputPromptRef.current) {
        inputPromptRef.current.innerText = '';
      }

      dispatch(setFeedbackHidden(true));
    },
    [setMessages, setInput, inputPromptRef]
  );

  const { checkFreeRequestsLimit, getFreeRequestsLimitMessage, setUpFreeRequestsErrorPrompt } =
    useSetupFreeRequestsErrorPrompt({ currentDocument, showRequestsLimitMessage });
  const { checkDailyRequestsLimit, setUpDailyRequestsErrorPrompt } = useSetupDailyRequestsErrorPrompt({
    showRequestsLimitMessage,
  });

  const getAssistantMessage = useCallback(
    ({ code, details, resetAt }: UseChatErrorType & { resetAt: string }) => {
      if (code !== DefaultErrorCode.TOO_MANY_REQUESTS) {
        return 'There was an error generating the response. Please try again';
      }

      if (details?.blockTime) {
        return t('viewer.chatbot.requestsLimit.dailyLimit', { resetTime: resetAt });
      }

      return getFreeRequestsLimitMessage();
    },
    [getFreeRequestsLimitMessage]
  );

  const setupErrorPrompt = useCallback(
    (error: Error) => {
      logger.logError({
        error,
        reason: LOGGER.Service.EDITOR_CHATBOT,
      });
      const { code, details } = ErrorExtractor.extractUseChatError(error);
      let resetAt = '';
      if (details?.blockTime) {
        const data = setUpDailyRequestsErrorPrompt(details);
        resetAt = data.resetAt;
      } else if (code === DefaultErrorCode.TOO_MANY_REQUESTS) {
        setUpFreeRequestsErrorPrompt();
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: v4(),
          role: 'assistant',
          content: getAssistantMessage({ code, details, resetAt }),
        },
      ]);

      dispatch(setFeedbackHidden(true));
    },
    [getAssistantMessage, setMessages]
  );

  const checkRequestsLimit = useCallback(
    (input: string) => {
      if (canUseChatbotDaily) {
        return checkDailyRequestsLimit(input);
      }

      return checkFreeRequestsLimit(input);
    },
    [canUseChatbotDaily, checkDailyRequestsLimit, checkFreeRequestsLimit]
  );

  return {
    setupErrorPrompt,
    checkRequestsLimit,
  };
};
