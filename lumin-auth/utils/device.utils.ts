export const getUserOs = () => {
  const { userAgent } = window.navigator;
  // something like "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.54"
  return userAgent.split('(')[1].split(')')[0];
};

export const isOpera = () => window.navigator.userAgent.includes('Opera') || window.navigator.userAgent.includes('OPR');
export const isIEEdge = () => navigator.userAgent.includes('Edg') || navigator.userAgent.includes('Edge');
export const isFirefox = () => navigator.userAgent.includes('Firefox');
export const isFirefoxOniOS = () => window.navigator.userAgent.match(/FxiOS\/(.*?) /);

const checkForIOS13 = () => navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
export const isIOS = () => window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i) || checkForIOS13();

export const isChrome = () => {
  // opera, edge, and maxthon have chrome in their useragent string so we need to be careful!
  const opera = window.navigator.userAgent.match(/OPR/);
  const maxthon = window.navigator.userAgent.match(/Maxthon/);
  const edge = window.navigator.userAgent.match(/Edge/);

  return window.navigator.userAgent.match(/Chrome\/(.*?) /) && window.navigator.vendor === 'Google Inc.' && !opera && !maxthon && !edge;
};
export const isChromeOniOS = () => window.navigator.userAgent.match(/CriOS\/(.*?) /);

const isAppleComp = () => window.navigator.vendor === 'Apple Computer, Inc.';
export const isSafari = () =>
  isAppleComp() && (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (/^((?!chrome|android).)*$/.test(navigator.userAgent) && isIOS));

export const getUserBrowserForAllDevices = () => {
  if (isOpera()) {
    return 'Opera';
  }
  if (isIEEdge()) {
    return 'Edge';
  }
  if (isFirefox() || isFirefoxOniOS()) {
    return 'Firefox';
  }
  if (isChrome() || isChromeOniOS()) {
    return 'Chrome';
  }
  if (isSafari()) {
    return 'Safari';
  }
  return 'Unknown';
};
