/* eslint-disable no-use-before-define */

import { updateEventTrackingQueue } from 'actions/customActions';

import selectors from 'selectors';

import indexedDBService from 'services/indexedDBService';

import { Client } from 'helpers/device';
import { isStandaloneMode } from 'helpers/pwa';

import { DocumentRole, SHARE_LINK_TYPE } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { OPEN_PDF_DOCUMENT } from 'constants/timeTracking';

import eventCollection from './Factory/EventCollection/EventCollection';
import { store } from '../redux/store';

export const WHO_CAN_OPEN_MAPPING = {
  [SHARE_LINK_TYPE.ANYONE]: 'anyoneWithLink',
  [SHARE_LINK_TYPE.INVITED]: 'invited',
};

export const SHARE_PERMISSION_MAPPING = {
  [DocumentRole.SHARER]: 'share',
  [DocumentRole.EDITOR]: 'edit',
  [DocumentRole.VIEWER]: 'comment',
  [DocumentRole.SPECTATOR]: 'view',
};

const ALLOWED_EVENTS_FOR_GUEST_USERS = [OPEN_PDF_DOCUMENT];

export const storeGetter = () => {
  const { dispatch, getState } = store;
  const state = getState();
  const currentUser = selectors.getCurrentUser(state);
  const currentDocument = selectors.getCurrentDocument(state);
  const organizationList = selectors.getOrganizationList(state);
  const currentOrganization = selectors.getCurrentOrganization(state);
  const isOffline = selectors.isOffline(state);

  return {
    dispatch,
    currentUser,
    currentDocument,
    organizationList,
    currentOrganization,
    isOffline,
  };
};

export const getClientTypeAttr = () => {
  if (isStandaloneMode || window.lMode === 'PWA') return 'PWA';
  return 'Web';
};

export const isPWAMode = () => getClientTypeAttr() === Client.PWA;

export const trackEventUserSharedDocument = (sharedUsers, linkType, sharePermission, docId) => {
  sharedUsers.forEach((user) => {
    const sharedTo = user._id || 'pendingUser';
    const whoCanOpen = WHO_CAN_OPEN_MAPPING[linkType] || '';
    const permission = SHARE_PERMISSION_MAPPING[sharePermission] || '';
    eventTracking(UserEventConstants.EventType.USER_SHARED_DOCUMENT, { sharedTo, whoCanOpen, permission, docId });
  });
};

export const eventTracking = async (name, additionalAttributes, metrics, options = {}) => {
  const { dispatch, currentUser, organizationList, isOffline } = storeGetter();
  const { ignoreQueue = false } = options;
  const shouldAdd = [
    UserEventConstants.EventType.HEADER_BUTTON,
    UserEventConstants.EventType.RIGHT_SIDE_BAR_BUTTON,
  ].includes(name);

  if (shouldAdd && isOffline) {
    indexedDBService.addOfflineTrackingEvents({
      name,
      additionalAttributes: { ...additionalAttributes, isOfflineMode: true },
      metrics,
    });
  }

  const { signInRequired = true, ...restMetrics } = metrics || {};

  if (ALLOWED_EVENTS_FOR_GUEST_USERS.includes(name)) {
    eventCollection.record({
      name,
      attributes: additionalAttributes,
      metrics: restMetrics,
    });
    return;
  }

  /** EventTracking will only be called until having enough organization list and user info */
  if ((organizationList?.loading || !currentUser?._id) && signInRequired && !ignoreQueue) {
    dispatch(updateEventTrackingQueue(() => eventTracking(name, additionalAttributes, restMetrics)));
    return;
  }
  eventCollection.record({
    name,
    attributes: additionalAttributes,
    metrics: restMetrics,
  });
};

export const getNodeIndex = (target) => {
  if (!target.parentNode) {
    return 0;
  }

  const allowedTypes = [target.nodeType];
  if (target.nodeType === Node.CDATA_SECTION_NODE) {
    allowedTypes.push(Node.TEXT_NODE);
  }

  const elements = Array.from(target.parentNode.childNodes).filter(
    (element) => allowedTypes.indexOf(element.nodeType) >= 0 && element.localName === target.localName
  );

  if (elements.length) {
    // xPath starts from 1
    return elements.indexOf(target) + 1;
  }
  return 0;
};

const getNodeValue = (target, optimized) => {
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

export const getElementXPath = (target, optimized) => {
  const { nodeType, parentNode } = target;
  const targetValue = getNodeValue(target, optimized);
  let xpath = '';

  if (nodeType === Node.DOCUMENT_NODE) {
    return '/';
  }

  if (optimized && targetValue.indexOf('@id') > 0) {
    return targetValue;
  }

  if (parentNode) {
    xpath += getElementXPath(parentNode, false);
  }
  xpath += targetValue;

  return xpath;
};

export const getCurrentFormXPath = (target, optimized) => {
  const trackedForm = target.closest('[data-lumin-form-name]');
  return getElementXPath(trackedForm, optimized);
};
