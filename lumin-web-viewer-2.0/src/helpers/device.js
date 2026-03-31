import { isStandaloneMode } from 'helpers/pwa';

export const Client = {
  PWA: 'PWA',
};
export const isDesktop = () => window.innerWidth > 900;
export const isSmallDesktop = () => window.innerWidth >= 1200;
export const isTablet = () => window.innerWidth < 1024;
export const isTabletOrMobile = () => window.innerWidth <= 900;
export const isMobile = () => window.innerWidth < 640;
export const isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
export const isIEEdge = navigator.userAgent.indexOf('Edg') > -1;
export const isIE11 = navigator.userAgent.indexOf('Trident/7.0') > -1;
export const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
export const isIE = isIE11;
// https://stackoverflow.com/a/58064481
const checkForIOS13 = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isIOS = Boolean(window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) || checkForIOS13;
export const isAndroid = Boolean(window.navigator.userAgent.match(/Android/i));
export const isAndroidOrIOS = isAndroid || isIOS;
export const isMobileDevice =
  isIOS || isAndroid || Boolean(window.navigator.userAgent.match(/webOS|BlackBerry|IEMobile|Opera Mini/i));
export const isMac = navigator.appVersion.indexOf('Mac') > -1;

export const isChrome = (function () {
  // opera, edge, and maxthon have chrome in their useragent string so we need to be careful!
  const opera = window.navigator.userAgent.match(/OPR/);
  const maxthon = window.navigator.userAgent.match(/Maxthon/);
  const edge = window.navigator.userAgent.match(/Edge/);

  return (window.navigator.userAgent.match(/Chrome\/(.*?) /) && window.navigator.vendor === 'Google Inc.' && !opera && !maxthon && !edge);
}());

const isAppleComp = window.navigator.vendor === 'Apple Computer, Inc.';
export const isSafari = isAppleComp && (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (/^((?!chrome|android).)*$/.test(navigator.userAgent) && isIOS));

export const isChromeOniOS = window.navigator.userAgent.match(/CriOS\/(.*?) /);

export const isFirefoxOniOS = window.navigator.userAgent.match(/FxiOS\/(.*?) /);

export const getUserBrowser = () => {
  if (isOpera) {
    return 'Opera';
  }
  if (isIEEdge) {
    return 'Edge';
  }
  if (isFirefox) {
    return 'Firefox';
  }
  if (isChrome) {
    return 'Chrome';
  }
  if (isSafari) {
    return 'Safari';
  }
  return 'Unknown';
};

export const getUserBrowserForAllDevices = () => {
  if (isOpera) {
    return 'Opera';
  }
  if (isIEEdge) {
    return 'Edge';
  }
  if (isFirefox || isFirefoxOniOS) {
    return 'Firefox';
  }
  if (isChrome || isChromeOniOS) {
    return 'Chrome';
  }
  if (isSafari) {
    return 'Safari';
  }
  return 'Unknown';
};

export const getUserOs = () => {
  const { userAgent } = window.navigator;
  // something like "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.54"
  return userAgent.split('(')[1].split(')')[0];
};

export const isWindow10 = () => getUserOs().search(/(Windows (NT)?\s?10\.0)/g) > -1;

export const isTouchDevice = () => 'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

export const getClientType = () => {
  if (isIOS) return 'Apple';
  if (isAndroid) return 'Android';
  if (isStandaloneMode || window.lMode === 'PWA') return 'PWA';

  return 'Web';
};
