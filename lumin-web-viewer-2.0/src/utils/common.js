/// <reference path="./common.d.ts" />
import { upperFirst } from 'lodash';

import { getLanguage } from './getLanguage';
import { LANGUAGES } from '../constants/language';

function convertHexToDec(hexValue) {
  return parseInt(hexValue, 16);
}

function getDomainFromEmail(email) {
  return email.split('@')[1];
}

function changeDomainToUrl(email) {
  return email.replaceAll('.', '-');
}

function isVowel(word) {
  return ['u', 'e', 'o', 'a', 'i'].includes(word[0]);
}

function getHOCDisplayName(HOCName, WrappedComponent) {
  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return `${HOCName}(${wrappedName})`;
}

export function formatTitleCaseByLocale(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  const language = getLanguage();
  return language === LANGUAGES.EN ? text : upperFirst(text.toLowerCase());
}

export function replaceSpecialCharactersWithEscapse(id) {
  // Replace any special characters with an escape character
  return id.replace(/[^\w\s]/gi, '-');
}

export const commonUtils = {
  convertHexToDec,
  getDomainFromEmail,
  changeDomainToUrl,
  getHOCDisplayName,
  isVowel,
  formatTitleCaseByLocale,
  replaceSpecialCharactersWithEscapse,
};

export default commonUtils;
