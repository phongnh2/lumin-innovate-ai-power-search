import { useLocalStorage } from '@mantine/hooks';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { LocalStorageKey } from 'constants/localStorageKey';

import { getFeatureResetTime } from '../utils/getFeatureResetTime';

type UseSetupDailyRequestsErrorPromptProps = {
  showRequestsLimitMessage: (props: { input: string; message: string }) => void;
};

export const useSetupDailyRequestsErrorPrompt = ({ showRequestsLimitMessage }: UseSetupDailyRequestsErrorPromptProps) => {
  const { t } = useTranslation();

  const [dailyBlockTime, setDailyBlockTime] = useLocalStorage<number>({
    key: LocalStorageKey.CHATBOT_DAILY_REQUESTS_BLOCK_TIME,
    defaultValue: 0,
  });

  const checkDailyBlockTime = useCallback((resetTime: number) => {
    let isExceeded = false;
    let resetAt = '';
    if (dayjs(resetTime).isValid()) {
      isExceeded = dayjs().isAfter(dayjs(resetTime));
      resetAt = getFeatureResetTime({ t, resetTime });
    }
    return { isExceeded, resetAt };
  }, []);

  const checkDailyRequestsLimit = useCallback(
    (input: string) => {
      const { isExceeded, resetAt } = checkDailyBlockTime(dailyBlockTime);
      if (!isExceeded) {
        showRequestsLimitMessage({ input, message: t('viewer.chatbot.requestsLimit.dailyLimit', { resetTime: resetAt }) });
        return true;
      }

      return false;
    },
    [dailyBlockTime, showRequestsLimitMessage]
  );

  const setUpDailyRequestsErrorPrompt = useCallback(({ blockTime }: { blockTime: number }) => {
    const resetTime = dayjs(new Date()).add(blockTime, 'second').valueOf();
    const { isExceeded, resetAt } = checkDailyBlockTime(resetTime);
    if (!dailyBlockTime || isExceeded) {
      setDailyBlockTime(resetTime);
    }

    return { resetAt };
  }, []);

  return {
    checkDailyRequestsLimit,
    setUpDailyRequestsErrorPrompt,
  };
};
