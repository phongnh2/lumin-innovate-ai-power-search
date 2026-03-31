import { LANGUAGES } from 'constants/language';

import { isClientSide } from './commonUtils';

export const getLanguageFromUrl = (url: string) => {
  const languageRegex = /^.*\/([a-z]{2})\/.*$/;
  const languageRegexWithoutSlash = /^.*\/([a-z]{2})$/;
  const result = url.match(languageRegex) || url.match(languageRegexWithoutSlash);
  const language = result ? result[1] : '';
  const isSupportedLanguage = Object.values(LANGUAGES).includes(language as LANGUAGES);

  return isSupportedLanguage ? language : '';
};

export const getFullPathWithLanguageFromUrl = (path = '') => {
  if (!isClientSide()) {
    return '';
  }
  const url = window.location.pathname;
  const languageFromUrl = getLanguageFromUrl(url as string);
  if (!languageFromUrl) {
    return path;
  }
  return `/${languageFromUrl}${path}`;
};
