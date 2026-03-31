import { merge } from 'lodash';

import logger from 'helpers/logger';

import GaAdapter from 'utils/Factory/GaAdapter';

import { GA_EVENTS } from 'constants/gaEvents';
import { GA4_LOGGER_MESSAGE, LOGGER } from 'constants/lumin-common';
import { GA4_ID } from 'constants/urls';

window.dataLayer = window.dataLayer || [];

export function trackingUser(userId) {
  window.dataLayer.push({
    user_id: userId,
    crm_id: userId,
  });
  window.gtag('config', GA4_ID, {
    send_page_view: false,
    user_id: userId,
  });

  window.gtag('set', 'user_properties', {
    crm_id: userId,
    send_to: GA4_ID,
  });
}

export function trackingSignup({ userId, method }) {
  window.dataLayer.push({
    user_id: userId,
    crm_id: userId,
  });
  window.gtag('config', GA4_ID, {
    send_page_view: false,
    user_id: userId,
  });

  window.gtag('set', 'user_properties', {
    crm_id: userId,
  });
  window.gtag('event', 'sign_up', {
    planName: 'FREE',
    method,
    send_to: GA4_ID,
  });
}

export function trackingAnonymous() {
  window.dataLayer.push({
    user_id: 'anonymous',
    crm_id: 'anonymous',
  });
  window.gtag('config', GA4_ID, {
    send_page_view: false,
    user_id: 'anonymous',
  });

  window.gtag('set', 'user_properties', {
    crm_id: 'anonymous',
  });
}

export function trackingPurchase({
  transactionId,
  value,
  transactionDescription,
  currency,
  items,
  isBusinessDomain,
  extraInfo,
}) {
  const transactionParams = {
    transactionId, // transactionId returned by stripe
    value, // price of the plan
    transactionDescription, // name of the plan
    currency,
    items: items.map((product) => ({ ...product, affiliation: 'Lumin' })),
    isBusinessDomain,
  };

  window.gtag('event', GA_EVENTS.PURCHASE, {});
  GaAdapter.send({
    name: GA_EVENTS.PURCHASE,
    attributes: transactionParams,
    forwardFromPinpoint: false,
  });

  logger.logInfo({
    message: GA4_LOGGER_MESSAGE.PURCHASE_PLAN,
    reason: LOGGER.Service.GA4_EVENT_INFO,
    attributes: merge({}, transactionParams, extraInfo),
  });
}

export function getTransactionId(subscriptionRemoteId, planNameEventId) {
  return `${subscriptionRemoteId}_${planNameEventId}`;
}

export function trackingBeginCheckout({ value, currency, coupon = '', items, isBusinessDomain, extraInfo }) {
  const transactionParams = {
    value, // price of the plan
    currency,
    coupon,
    items: items.map((product) => ({ ...product, affiliation: 'Lumin' })),
    isBusinessDomain,
  };

  window.gtag('event', GA_EVENTS.BEGIN_CHECKOUT, {});
  GaAdapter.send({
    name: GA_EVENTS.BEGIN_CHECKOUT,
    attributes: transactionParams,
    forwardFromPinpoint: false,
  });

  logger.logInfo({
    message: GA4_LOGGER_MESSAGE.BEGIN_CHECKOUT,
    reason: LOGGER.Service.GA4_EVENT_INFO,
    attributes: merge({}, transactionParams, extraInfo),
  });
}
