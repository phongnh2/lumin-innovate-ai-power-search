/// <reference path="./string.d.ts" />
function getShortString(string) {
  if (!string || string.length === 0) return null;
  let stringLimit = 0;
  if (window.innerWidth < 480) {
    stringLimit = 30;
  } else if (window.innerWidth < 1280) {
    stringLimit = 35;
  } else {
    stringLimit = 40;
  }
  if (string.length < stringLimit) {
    return string;
  }
  const start = string.slice(0, stringLimit);
  return `${start}...`;
}

function getShortStringWithLimit(string, limit) {
  if (!string || string.length === 0) return null;
  if (string.length < limit) {
    return string;
  }
  const start = string.slice(0, limit);
  return `${start}...`;
}

function getShortenStringNotification(string) {
  return getShortStringWithLimit(string, 20);
}

function pixelUnitToNumber(pixel) {
  return Number(pixel.replace(/px$/, ''));
}

function isIgnoreCaseEqual(str1, str2) {
  return String(str1).toLowerCase() === String(str2).toLowerCase();
}

function convertToSnakeCase(str) {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase();
}

function escapeSelector(selector) {
  return selector.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

export default {
  getShortString,
  getShortStringWithLimit,
  getShortenStringNotification,
  pixelUnitToNumber,
  isIgnoreCaseEqual,
  convertToSnakeCase,
  escapeSelector,
};
