import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { t } from 'i18next';

dayjs.extend(calendar);

export const getFeatureResetTime = ({
  blockTime,
  dataUpdatedAt,
}: {
  blockTime: number;
  dataUpdatedAt: number;
}): string => {
  if (!blockTime || !dataUpdatedAt) {
    return '';
  }

  return dayjs(dataUpdatedAt)
    .add(blockTime, 'second')
    .calendar(null, {
      sameDay: `HH:mm [${t('viewer.formFieldDetection.overQuotaTooltip.today')}]`,
      nextDay: `HH:mm [${t('viewer.formFieldDetection.overQuotaTooltip.tomorrow')}]`,
      sameElse: 'HH:mm',
    });
};
