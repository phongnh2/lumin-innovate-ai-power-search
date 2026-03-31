import { useLocalStorage } from '@mantine/hooks';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { LocalStorageKey } from 'constants/localStorageKey';

import { checkDailyBlockTime } from '../utils/checkDailyBlockTime';

type UseSetupDailyRequestsErrorPromptProps = {
  showRequestsLimitMessage: (props: { input: string; message: string }) => void;
};

export const useSetupDailyRequestsErrorPrompt = ({
  showRequestsLimitMessage,
}: UseSetupDailyRequestsErrorPromptProps) => {
  const { t } = useTranslation();

  const [dailyBlockTime, setDailyBlockTime] = useLocalStorage<number>({
    key: LocalStorageKey.CHATBOT_DAILY_REQUESTS_BLOCK_TIME,
    defaultValue: 0,
  });

  const checkDailyRequestsLimit = useCallback(
    (input: string) => {
      const { isExceeded, resetAt } = checkDailyBlockTime({ resetTime: dailyBlockTime, t });
      if (!isExceeded) {
        showRequestsLimitMessage({
          input,
          message: t('viewer.chatbot.requestsLimit.dailyLimit', { resetTime: resetAt }),
        });
        return true;
      }

      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dailyBlockTime, showRequestsLimitMessage]
  );

  const setUpDailyRequestsErrorPrompt = useCallback(
    ({ blockTime }: { blockTime: number }) => {
      const resetTime = dayjs(new Date()).add(blockTime, 'second').valueOf();
      const { isExceeded, resetAt } = checkDailyBlockTime({ resetTime, t });
      if (!dailyBlockTime || isExceeded) {
        setDailyBlockTime(resetTime);
      }

      return { resetAt };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dailyBlockTime, setDailyBlockTime]
  );

  return {
    checkDailyRequestsLimit,
    setUpDailyRequestsErrorPrompt,
  };
};
