import dayjs from 'dayjs';

import { dateUtil } from 'utils';

import { INotificationBase } from 'interfaces/notification/notification.interface';

export const formatTime = (notification: INotificationBase): string => {
  const date = new Date(notification.createdAt);
  const isToday = dayjs().isSame(date, 'day');

  if (isToday) {
    return dateUtil.formatHourMinute(date);
  }
  return dateUtil.formatMDYTime(date);
};
