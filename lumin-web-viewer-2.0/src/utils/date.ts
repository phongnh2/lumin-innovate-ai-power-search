import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { TFunction } from 'i18next';

import { LANGUAGES } from 'constants/language';

import { getLanguage } from './getLanguage';

export const DEFAULT_DATE_FORMAT = 'll';
const DEFAULT_FULL_DATE_NAME_FORMAT = 'LL';
const DEFAULT_FULL_DATE_FORMAT = 'lll';
const DEFAULT_FULL_TIME_FORMAT = 'll, LTS';
const DEFAULT_DATE_AND_MONTH_FORMAT = 'MMM D';
const LOCALE_DATE_AND_MONTH_FORMAT = 'D MMM';

dayjs.extend(localizedFormat);
dayjs.extend(calendar);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(date: Date) {
  const day = date.getDate();
  // if (day % 10 === 1 && day !== 11) {
  //   day += 'st';
  // } else if (day % 10 === 2 && day !== 12) {
  //   day += 'nd';
  // } else if (day % 10 === 3 && day !== 13) {
  //   day += 'rd';
  // } else {
  //   day += 'th';
  // }
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthNames[monthIndex]}, ${year}`;
}

function formatFullDate(date: Date | string | number) {
  return dayjs(date).format(DEFAULT_FULL_DATE_FORMAT);
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function formatDateAndMonth(date: Date | string | number) {
  const language = getLanguage();
  const format = language === LANGUAGES.EN ? DEFAULT_DATE_AND_MONTH_FORMAT : LOCALE_DATE_AND_MONTH_FORMAT;

  return dayjs(date).format(format);
}

function convertToRelativeTime(date: number, translator: TFunction) {
  const relativeTime = (Date.now() - date) / 1000 / 60;
  if (relativeTime < 60) {
    if (relativeTime < 1) {
      return translator('option.status.aFewSecondsAgo');
    }

    const minute = Math.ceil(relativeTime);
    return `${minute} ${translator('option.status.minutesAgo', { count: minute })}`;
  }

  const hour = Math.ceil(relativeTime / 60);
  if (hour < 24) {
    return `${hour} ${translator('option.status.hoursAgo', { count: hour })}`;
  }

  const days = Math.ceil(hour / 24);
  if (days < 6) {
    return `${days} ${translator('option.status.daysAgo', { count: days })}`;
  }

  return formatDateAndMonth(new Date(date));
}

function formatMDYTime(date: Date | string | number) {
  return dayjs(date).format(DEFAULT_DATE_FORMAT);
}

function formatFullTime(date: Date | string | number) {
  return dayjs(date).format(DEFAULT_FULL_TIME_FORMAT);
}

function formatDeleteAccountTime(date: Date | string | number) {
  const day = dayjs(date).date();
  const time = dayjs(date).set('date', day + 3);

  return dayjs(time).format(DEFAULT_DATE_FORMAT);
}

export function getFormatDateStampByLanguage() {
  const language = getLanguage();
  return language === LANGUAGES.EN ? 'MMM DD, YYYY' : 'DD/MM/YYYY';
}

export function formatFullDateName(date: Date | string | number) {
  return dayjs(date).format(DEFAULT_FULL_DATE_NAME_FORMAT);
}

export function formatHourMinute(date: Date | string | number) {
  return dayjs(date).format('h:mm A');
}

export default {
  formatDate,
  formatFullDate,
  addDays,
  convertToRelativeTime,
  formatDateAndMonth,
  formatMDYTime,
  formatFullTime,
  formatDeleteAccountTime,
  getFormatDateStampByLanguage,
  formatFullDateName,
  formatHourMinute,
};
