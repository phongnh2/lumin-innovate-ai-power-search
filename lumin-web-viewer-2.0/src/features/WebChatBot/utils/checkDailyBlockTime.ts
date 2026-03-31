import dayjs from 'dayjs';
import { TFunction } from 'react-i18next';

import { getFeatureResetTime } from './getFeatureResetTime';

export const checkDailyBlockTime = ({
  resetTime,
  t,
}: {
  resetTime: number;
  t: TFunction;
}): { isExceeded: boolean; resetAt: string } => {
  let isExceeded = false;
  let resetAt = '';

  if (dayjs(resetTime).isValid()) {
    isExceeded = dayjs().isAfter(dayjs(resetTime));
    resetAt = getFeatureResetTime({ t, resetTime });
  }

  return { isExceeded, resetAt };
};
