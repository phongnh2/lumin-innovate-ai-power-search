import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { t } from 'i18next';

dayjs.extend(calendar);

export const formatDate = (value: string | Date, noteDateFormat = 'MMM DD, YYYY. HH:mm'): string =>
  dayjs(value).calendar(null, {
    sameDay: `[${t('option.notesPanel.separator.today')}], HH:mm`,
    lastDay: `[${t('option.notesPanel.separator.yesterday')}], HH:mm`,
    lastWeek: `[${t('option.notesPanel.separator.last')}] ddd, HH:mm`,
    sameElse: noteDateFormat,
  });
