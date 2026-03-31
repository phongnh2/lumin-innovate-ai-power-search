/// <reference path="./getLanguage.d.ts" />
import { cookieManager } from 'helpers/cookieManager';

import { CookieStorageKey } from 'constants/cookieName';
import { LANGUAGES } from 'constants/language';
import { LocalStorageKey } from 'constants/localStorageKey';

const isDevelopment = process.env.NODE_ENV === 'development';

export const getLanguageFromUrl = () => {
  const path = window.location.pathname;

  const languageRegex = /^\/([a-z]{2})\/.*$/;
  const languageRegexWithoutSlash = /^\/([a-z]{2})$/;
  const result = path.match(languageRegex) || path.match(languageRegexWithoutSlash);
  const language = result ? result[1] : '';
  const isSupportedLanguage = Object.values(LANGUAGES).includes(language);

  return isSupportedLanguage ? language : '';
};

export const getFullLanguageFromBrowser = () => window.navigator.userLanguage || window.navigator.language;

export const getLanguageFromBrowser = () => {
  const language = getFullLanguageFromBrowser();
  // eslint-disable-next-line no-magic-numbers
  return language.slice(0, 2);
};

const DAYS_IN_YEAR = 365;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;

const secondsInYear = DAYS_IN_YEAR * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;

export const getLanguage = () => {
  const languageFromUrl = getLanguageFromUrl();
  const languageFromBrowser = getLanguageFromBrowser();
  const languageFromStorage = localStorage.getItem(LocalStorageKey.LANGUAGE);
  const languageFromCookie = cookieManager.get(CookieStorageKey.LUMIN_LANGUAGE);
  let storedLanguage = languageFromCookie;
  // Because those codes on production but has wrong domain in cookie so I need to cover it
  if (!isDevelopment) {
    cookieManager.delete(CookieStorageKey.LUMIN_LANGUAGE, { domain: null });
  }
  // Remove old language key in storage if exist
  if (languageFromStorage) {
    localStorage.removeItem(LocalStorageKey.LANGUAGE);
    if (!languageFromCookie) {
      cookieManager.set({
        name: CookieStorageKey.LUMIN_LANGUAGE,
        value: languageFromStorage,
        maxAge: secondsInYear,
        options: { domain: isDevelopment ? 'localhost' : '.luminpdf.com' },
      });
      storedLanguage = languageFromStorage;
    }
  }
  const language = storedLanguage || languageFromUrl || languageFromBrowser;
  const isSupportedLanguage = Object.values(LANGUAGES).includes(language);

  return isSupportedLanguage ? language : LANGUAGES.EN;
};

export const getUrlWithoutLanguage = () => {
  const path = window.location.pathname;

  // eslint-disable-next-line no-magic-numbers
  return path.substring(3);
};

export const getPathnameWithoutLanguage = () => {
  const language = getLanguageFromUrl();
  if (!language) return window.location.pathname;

  return getUrlWithoutLanguage();
};

export const getFullPathWithPresetLang = (path) => {
  const currentLanguage = getLanguageFromUrl();
  if (!currentLanguage) {
    return path;
  }
  return `/${currentLanguage}${path}`;
};
