import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { TFunction } from 'react-i18next';

dayjs.extend(calendar);

export const getFeatureResetTime = ({ t, resetTime }: { t: TFunction; resetTime: number }): string => {
  if (!resetTime) {
    return '';
  }

  return dayjs(resetTime)
    .calendar(null, {
      sameDay: `HH:mm [${t('viewer.formFieldDetection.overQuotaTooltip.today')}]`,
      nextDay: `HH:mm [${t('viewer.formFieldDetection.overQuotaTooltip.tomorrow')}]`,
      sameElse: 'HH:mm',
    });
};
