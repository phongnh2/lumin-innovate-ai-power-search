import { isEmpty, isNil, mapKeys, merge, omitBy } from 'lodash';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';

import selectors from 'selectors';

import { GrowthBookServices } from 'services/growthBookServices';

import authenticationObserver from 'helpers/authenticationObserver';
import { cookieManager } from 'helpers/cookieManager';
import { getUserBrowserForAllDevices, getUserOs } from 'helpers/device';
import logger from 'helpers/logger';
import { isStandaloneMode } from 'helpers/pwa';

import lastAccessOrgs from 'utils/lastAccessOrgs';

import { quickSearchSelectors } from 'features/QuickSearch/slices';

import UserEventConstants from 'constants/eventConstants';
import { EXCLUDED_ATTRIBUTES_GROWTH_BOOK_FOR_EVENT } from 'constants/growthBookConstant';
import { LANGUAGE_TEXT } from 'constants/language';
import { LocalStorageKey } from 'constants/localStorageKey';
import { QUERY_STRING_WHITE_LIST_TRACKING } from 'constants/queryStringWhiteListTracking';

import { getLanguage, getLanguageFromBrowser } from './getLanguage';
import getLanguageName from './getLanguageName';
import { store } from '../redux/store';

export const MAX_PINPOINT_VALUE_CHARACTER = 200;

export const getViewerActiveSideNav = (state) => {
  const isDocumentLoaded = selectors.isDocumentLoaded(state);
  const toolbarValue = selectors.toolbarValue(state);
  if (!isDocumentLoaded) {
    return null;
  }

  const tabMapping = {
    [LEFT_SIDE_BAR.POPULAR]: 'Popular',
    [LEFT_SIDE_BAR.ANNOTATION]: 'Annotate',
    [LEFT_SIDE_BAR.FILL_AND_SIGN]: 'Fill and Sign',
    [LEFT_SIDE_BAR.EDIT_PDF]: 'Edit PDF',
    [LEFT_SIDE_BAR.SECURITY]: 'Security',
    [LEFT_SIDE_BAR.PAGE_TOOLS]: 'Page Tools',
  };

  return tabMapping[toolbarValue] || '[]';
};

const storeGetter = () => {
  const { dispatch, getState } = store;
  const state = getState();
  const currentUser = selectors.getCurrentUser(state);
  const currentDocument = selectors.getCurrentDocument(state);
  const organizationList = selectors.getOrganizationList(state);
  const currentOrganization = selectors.getCurrentOrganization(state);
  const getActionCountDocStack = selectors.getActionCountDocStack(state);
  const isOffline = selectors.isOffline(state);
  const viewerActiveSideNav = getViewerActiveSideNav(state);
  const isOpenQuickSearch = quickSearchSelectors.isOpenQuickSearch(state);

  return {
    dispatch,
    currentUser,
    currentDocument,
    organizationList,
    currentOrganization,
    isOffline,
    syncIsCounted: getActionCountDocStack?.sync,
    viewerActiveSideNav,
    isOpenQuickSearch,
  };
};

export const sliceAllObjectValues = (data, limit) => {
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    result[key] = value?.toString().slice(0, limit - 1);
  });
  return result;
};

export const convertQueryStringToObject = () => {
  const queryString = new URLSearchParams(window.location.search);
  const result = {};
  queryString.forEach((value, key) => {
    if (QUERY_STRING_WHITE_LIST_TRACKING.includes(key)) {
      result[`queryString_${key}`] = value;
    }
  });

  return result;
};

const getStripeAttributes = () => {
  const {
    currentUser,
    currentOrganization: { data: currentOrganization },
  } = storeGetter();
  if (!currentUser) {
    return {};
  }

  // TEMP: log to debug https://app.datadoghq.com/logs?query=Cannot%20read%20properties%20of%20undefined%20%28reading%20%27customerRemoteId%27%29%20env%3Aproduction&agg_q=%40view.url_details.path&cols=host%2Cservice&event=AQAAAYZzFoasuBJrmgAAAABBWVp6Rm9vMUFBQXlZcFJTb0R2YTVnQUM&index=%2A&messageDisplay=inline&sort_m=&sort_t=&stream_sort=time%2Cdesc&top_n=10&top_o=top&viz=pattern&x_missing=true&from_ts=1674634259671&to_ts=1677226259671&live=true
  if (currentUser && isEmpty(currentUser.payment)) {
    logger.logError({ message: `Payment user ${JSON.stringify(currentUser)} not found` });
  }
  if (currentOrganization && isEmpty(currentOrganization.payment)) {
    logger.logError({ message: `Payment organization ${JSON.stringify(currentOrganization)} not found` });
  }

  const payment = currentOrganization ? currentOrganization.payment : currentUser.payment;
  const stripeAttibutes = {
    StripeCustomerId: payment?.customerRemoteId,
    StripeSubscriptionId: payment?.subscriptionRemoteId,
    StripePlanId: payment?.planRemoteId,
  };
  return omitBy(stripeAttibutes, isEmpty);
};

const getCommonGrowthBookAttributes = () => {
  const growthBookServices = GrowthBookServices.instance();
  const growthBookInstance = growthBookServices.getGrowthBookInstance;
  const commonAttrs = growthBookInstance.getAttributes();

  const omittedAttrs = omitBy(
    commonAttrs,
    (value, key) => isNil(value) || EXCLUDED_ATTRIBUTES_GROWTH_BOOK_FOR_EVENT.includes(key)
  );

  return mapKeys(omittedAttrs, (value, key) => `gb_${key}`);
};

export const getLanguageAttr = async () => {
  const language = LANGUAGE_TEXT[getLanguage().toUpperCase()];
  const browserLanguage = getLanguageFromBrowser();
  let languageName;
  try {
    languageName = await getLanguageName(browserLanguage);
  } catch (err) {
    logger.logError({ message: `Error getting language name: ${err}` });
    languageName = null;
  }
  return { LuminLanguage: language, browserLanguage: languageName };
};

const getClientTypeAttr = () => {
  if (isStandaloneMode || window.lMode === 'PWA') return 'PWA';
  return 'Web';
};

const getOrgIdFromCurrentOrg = () => {
  const { currentOrganization } = storeGetter();
  return currentOrganization.data?._id ?? null;
};

const getOrgIdFromLastAccess = () => {
  const [lastAccessedOrg] = lastAccessOrgs.getFromStorage();

  // In the older implementation, the value of `lastAccessedOrg` was `orgUrl`, which is a string.
  if (!lastAccessedOrg || typeof lastAccessedOrg === 'string') {
    return null;
  }

  return lastAccessedOrg?.id;
};

export const getOrgIdFromOrgList = () => {
  const { currentUser, organizationList } = storeGetter();
  const { lastAccessedOrgUrl } = currentUser || {};
  if (!lastAccessedOrgUrl || !organizationList.data) {
    return null;
  }

  const lastAccessedOrg = organizationList.data.find(
    ({ organization }) => organization.url === lastAccessedOrgUrl
  )?.organization;

  if (!lastAccessedOrg) {
    return null;
  }

  lastAccessOrgs.setToStorage({
    id: lastAccessedOrg._id,
    url: lastAccessedOrg.url,
  });

  return lastAccessedOrg._id;
};

const getOrganizationId = () => getOrgIdFromCurrentOrg() || getOrgIdFromLastAccess() || getOrgIdFromOrgList();

export const getCommonAttributes = async (attributes) => {
  const { currentUser, currentDocument, syncIsCounted, viewerActiveSideNav, isOpenQuickSearch } = storeGetter();
  const userBrowser = getUserBrowserForAllDevices() || 'other browsers';
  const userOS = getUserOs() || '';
  const isSelectFromQuickSearch = isOpenQuickSearch && attributes && attributes.elementName;
  await authenticationObserver.wait();
  const commonAttrs = {
    LuminFileId: currentDocument?._id,
    organizationId: getOrganizationId(),
    LuminUserId: currentUser?._id,
    userBrowser,
    userOS,
    clientType: getClientTypeAttr(),
    url: window.location.origin + window.location.pathname,
    anonymousUserId: cookieManager.anonymousUserId,
    browserMode: localStorage.getItem(LocalStorageKey.BROWSER_MODE) || 'unknown',
    syncIsCounted,
    viewerActiveSideNav,
    ...(isSelectFromQuickSearch && { selectFrom: UserEventConstants.EventType.VIEWER_QUICK_SEARCH }),
  };

  const mergedAttrs = merge(
    {},
    commonAttrs,
    getStripeAttributes(),
    convertQueryStringToObject(),
    attributes,
    getCommonGrowthBookAttributes()
  );

  const { LuminLanguage, browserLanguage } = await getLanguageAttr();
  Object.assign(mergedAttrs, { LuminLanguage, browserLanguage });

  return sliceAllObjectValues(omitBy(mergedAttrs, isNil), MAX_PINPOINT_VALUE_CHARACTER);
};
