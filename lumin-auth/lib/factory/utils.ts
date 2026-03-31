import { isNil, merge, omitBy } from 'lodash';

import { CookieStorageKey } from '@/constants/cookieKey';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { store } from '@/lib/store';
import { getCurrentUser, getIdentity } from '@/selectors';
import CookieUtils from '@/utils/cookie.utils';
import { getUserOs, getUserBrowserForAllDevices } from '@/utils/device.utils';
import LocalStorageUtils from '@/utils/localStorage.utils';

const MAX_PINPOINT_VALUE_CHARACTER = 200;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStandaloneMode = () => window.matchMedia('(display-mode:standalone)').matches || (window.navigator as any).standalone;

const getClientTypeAttr = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isStandaloneMode() || (window as any).lMode === 'PWA') return 'PWA';
  return 'Web';
};

export const getAnonymousUserId = () => {
  let anonymousUserId = CookieUtils.get(CookieStorageKey.ANONYMOUS_USER_ID);
  if (!anonymousUserId) {
    anonymousUserId = LocalStorageUtils.anonymousUserId;
    CookieUtils.set({ name: CookieStorageKey.ANONYMOUS_USER_ID, value: anonymousUserId, exdays: 360 });
  } else {
    // sync anonymousUserId from cookie to localStorage if not exist
    const existed = LocalStorageUtils.get({ key: LocalStorageKey.ANONYMOUS_USER_ID });
    if (!existed) {
      LocalStorageUtils.set({ key: LocalStorageKey.ANONYMOUS_USER_ID, value: anonymousUserId });
    }
  }
  return anonymousUserId;
};

const sliceAllObjectValues = (data: Record<string, string>, limit: number | undefined) => {
  const result = {} as Record<string, string>;
  Object.entries(data).forEach(([key, value]) => {
    result[key] = value?.toString().slice(0, limit);
  });
  return result;
};

const convertQueryStringToObject = () => {
  const queryString = new URLSearchParams(window.location.search);
  const result = {} as Record<string, string>;
  queryString.forEach((value, key) => {
    result[`queryString_${key}`] = value;
  });

  return result;
};

export const getAttributes = (attributes: Record<string, unknown>) => {
  const state = store?.getState();
  const oryIdentityId = (state && getIdentity(state)?.id) || null;
  const userOS = getUserOs() || null;
  const userBrowser = getUserBrowserForAllDevices() || 'other browsers';
  const LuminUserId = (state && getCurrentUser(state)?._id) || null;
  const storedCity = LocalStorageUtils.get({ key: LocalStorageKey.USER_LOCATION_CITY });
  const storedCountry = LocalStorageUtils.get({ key: LocalStorageKey.USER_LOCATION_COUNTRY });
  const commonAttrs = {
    LuminUserId,
    oryIdentityId,
    userOS,
    userBrowser,
    url: window.location.origin + window.location.pathname,
    clientType: getClientTypeAttr(),
    anonymousUserId: getAnonymousUserId(),
    screenHeightPx: window.screen.height,
    screenWidthPx: window.screen.width,
    browserCity: storedCity ?? null,
    browserCountryCode: storedCountry ?? null
  };

  const mergedAttrs = merge({}, commonAttrs, convertQueryStringToObject(), attributes);

  return sliceAllObjectValues(omitBy(mergedAttrs, isNil), MAX_PINPOINT_VALUE_CHARACTER);
};

const getNodeIndex = (target: HTMLElement) => {
  if (!target.parentNode) {
    return 0;
  }

  const allowedTypes = [target.nodeType];
  if (target.nodeType === Node.CDATA_SECTION_NODE) {
    allowedTypes.push(Node.TEXT_NODE);
  }

  const elements = Array.from(target.parentNode.childNodes as NodeListOf<HTMLElement>).filter(
    (element: HTMLElement): boolean => allowedTypes.indexOf(element.nodeType) >= 0 && element.localName === target.localName
  );

  if (elements.length) {
    // xPath starts from 1
    return elements.indexOf(target) + 1;
  }
  return 0;
};

const getNodeValue = ({ target, optimized }: { target: HTMLElement; optimized: boolean }) => {
  const { nodeType, localName } = target;
  const nodeIndex = getNodeIndex(target);
  let nodeValue = '';

  switch (nodeType) {
    case Node.ELEMENT_NODE: {
      const id = target.getAttribute('id');
      if (optimized && id) {
        return `//*[@id="${id}"]`;
      }
      nodeValue = `/${localName}`;
      break;
    }

    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
      nodeValue = '/text()';
      break;

    case Node.COMMENT_NODE:
      nodeValue = '/comment()';
      break;

    default:
      break;
  }

  // if index is 0 or 1, it can be omitted in xpath
  if (nodeValue && nodeIndex > 1) {
    return `${nodeValue}[${nodeIndex}]`;
  }
  return nodeValue;
};

export const getElementXPath = ({ target, optimized }: { target: HTMLElement; optimized: boolean }) => {
  const { nodeType, parentNode } = target;
  const targetValue = getNodeValue({ target, optimized });
  let xpath = '';

  if (nodeType === Node.DOCUMENT_NODE) {
    return '/';
  }

  if (optimized && targetValue.indexOf('@id') > 0) {
    return targetValue;
  }

  if (parentNode) {
    xpath += getElementXPath({ target: parentNode as HTMLElement, optimized: false });
  }
  xpath += targetValue;

  return xpath;
};
