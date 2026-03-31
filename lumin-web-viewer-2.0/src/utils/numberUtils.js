/// <reference path="./numberUtils.d.ts" />
import { getLanguage } from './getLanguage';

const formatTwoDigits = (number) => (Number.isInteger(number) ? number : Number.parseFloat(number).toFixed(2));

const formatDecimal = (number) => {
  const locale = getLanguage() || undefined;
  return Intl.NumberFormat(locale).format(number);
};

const formatTwoDigitsDecimal = (number) => {
  const locale = getLanguage() || undefined;
  return Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFactionDigits: 2,
  }).format(number);
};

export default {
  formatTwoDigits,
  formatDecimal,
  formatTwoDigitsDecimal,
};
