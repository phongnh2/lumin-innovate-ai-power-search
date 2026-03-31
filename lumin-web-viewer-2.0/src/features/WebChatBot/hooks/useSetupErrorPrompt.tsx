import { Message } from '@ai-sdk/react';
import { get } from 'lodash';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { setFeedbackHidden } from 'features/EditorChatBot/slices';

import { DefaultErrorCode } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';

import { useSetupDailyRequestsErrorPrompt } from './useSetupDailyRequestsErrorPrompt';
import { useSetupFreeRequestsErrorPrompt } from './useSetupFreeRequestsErrorPrompt';
import { UseChatErrorType } from '../types';
import { ErrorExtractor } from '../utils/errorExtractor';

function createMessage(role: 'user' | 'assistant', content: string) {
  return {
    id: v4(),
    role,
    content,
  };
}

export const useSetupErrorPrompt = ({
  setMessages,
  setInput,
  inputPromptRef,
}: {
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  inputPromptRef: React.MutableRefObject<HTMLDivElement>;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentOrganization = useGetCurrentOrganization();
  const canUseChatbotDaily = get(currentOrganization, 'aiChatbotDailyLimit', 0);

  const showRequestsLimitMessage = useCallback(
    ({ input, message }: { input: string; message: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        createMessage('user', input),
        createMessage('assistant', message),
      ]);
      setInput('');
      if (inputPromptRef.current) {
        inputPromptRef.current.innerText = '';
      }

      dispatch(setFeedbackHidden(true));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setMessages, setInput, inputPromptRef]
  );

  const { checkFreeRequestsLimit, getFreeRequestsLimitMessage, setUpFreeRequestsErrorPrompt } =
    useSetupFreeRequestsErrorPrompt({ showRequestsLimitMessage });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const setupErrorPrompt = useCallback(
    (error: Error) => {
      logger.logError({
        error,
        reason: LOGGER.Service.WEB_CHAT_BOT,
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
        createMessage('assistant', getAssistantMessage({ code, details, resetAt })),
      ]);

      dispatch(setFeedbackHidden(true));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getAssistantMessage, setMessages, setUpDailyRequestsErrorPrompt, setUpFreeRequestsErrorPrompt]
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
