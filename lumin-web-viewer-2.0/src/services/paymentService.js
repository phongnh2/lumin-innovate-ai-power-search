/// <reference path="./paymentService.d.ts" />

import * as paymentGraph from 'services/graphServices/payment';

import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';
import { PeriodIndex, PlanIndex, Plans } from 'constants/plan';

export async function createFreeTrialSubcription({
  orgId,
  issuedId,
  issuer,
  period,
  currency,
  plan,
  stripeAccountId,
  isBlockedPrepaidCardOnTrial,
}) {
  const { data } = await paymentGraph.createFreeTrialSubcription({
    orgId,
    issuedId,
    issuer,
    period,
    currency,
    plan,
    stripeAccountId,
    isBlockedPrepaidCardOnTrial,
  });

  return data;
}

export async function createFreeTrialUnifySubscription({
  orgId,
  paymentMethod,
  period,
  currency,
  stripeAccountId,
  isBlockedPrepaidCardOnTrial,
  subscriptionItems,
}) {
  const { data } = await paymentGraph.createFreeTrialUnifySubscription({
    orgId,
    paymentMethod,
    period,
    currency,
    stripeAccountId,
    isBlockedPrepaidCardOnTrial,
    subscriptionItems,
  });

  return data;
}

export function getBillingEmail({ clientId, type }) {
  return paymentGraph.getBillingEmail({ clientId, type });
}

export function getRemainingPlan({ plan, period, currency, type, clientId, quantity, couponCode, fetchOptions }) {
  return paymentGraph.getRemainingPlan({
    plan,
    period,
    currency,
    type,
    clientId,
    quantity,
    couponCode,
    fetchOptions,
  });
}

export function subscription({ clientId, type }) {
  return paymentGraph.subscription({ clientId, type });
}

function canOrganizationUpgrade(currentPayment, nextPayment) {
  const currentPeriodIndex = PeriodIndex[currentPayment.period] || 0;
  const nextPeriodIndex = PeriodIndex[nextPayment.period] || 0;
  if (currentPeriodIndex < nextPeriodIndex) {
    return true;
  }
  if (currentPeriodIndex === nextPeriodIndex) {
    return currentPayment.quantity < nextPayment.quantity;
  }
  return !(currentPeriodIndex > nextPeriodIndex);
}

function canUserUpgrade(currentPayment, nextPayment) {
  const { type: currentPlan, period: currentPeriod } = currentPayment;
  const { plan: nextPlan, period: nextPeriod } = nextPayment;
  const isFree = Plans.FREE === currentPlan;
  const isDownradePeriod = PeriodIndex[currentPeriod] > PeriodIndex[nextPeriod];
  const isSamePeriod = PeriodIndex[currentPeriod] === PeriodIndex[nextPeriod];
  const isDowngradePlan = PlanIndex[currentPlan] > PlanIndex[nextPlan];
  const isSamePlan = PlanIndex[currentPlan] === PlanIndex[nextPlan];
  if (isFree) {
    return true;
  }

  return !(isDowngradePlan || isDownradePeriod || (isSamePeriod && isSamePlan));
}

function getCard({ type, clientId, fetchOptions }) {
  return paymentGraph.getCard({ type, clientId, fetchOptions });
}

function cancelSubscription({ clientId, type }) {
  return paymentGraph.cancelSubscription({ clientId, type });
}

async function reactivateSubscription() {
  const result = await paymentGraph.reactivateSubscription();
  const {
    data: { planRemoteId: planId, type: planName },
  } = result;
  eventTracking(UserEventConstants.EventType.USER_REACTIVATED_PAID, {
    stripePlanOrPriceId: planId,
    planName,
  });
  return result;
}

function applyCouponCode({ period, currency, plan, couponCode, orgId, stripeAccountId }) {
  return paymentGraph.applyCouponCode({
    period,
    currency,
    plan,
    couponCode,
    orgId,
    stripeAccountId,
  });
}

function getBillingWarning(clientId, type) {
  return paymentGraph.getBillingWarning(clientId, type);
}

function changeCardInfo({ clientId, paymentMethodId, email, type }) {
  return paymentGraph.changeCardInfo({
    clientId,
    paymentMethodId,
    email,
    type,
  });
}

function closeBillingWarningBanner(clientId, bannerType) {
  return paymentGraph.closeBillingWarningBanner(clientId, bannerType);
}

function retryFailedSubscription(clientId) {
  return paymentGraph.retryFailedSubscription(clientId);
}

function getNextPaymentInfo({ plan, period, currency, stripeAccountId, orgId }) {
  return paymentGraph.getNextPaymentInfo({ plan, period, currency, stripeAccountId, clientId: orgId });
}

function retrieveSetupIntent({ reCaptchaTokenV3, reCaptchaAction }) {
  return paymentGraph.retrieveSetupIntent({ reCaptchaTokenV3, reCaptchaAction });
}

function retrieveOrganizationSetupIntent({ orgId, type, reCaptchaTokenV3, reCaptchaAction }) {
  return paymentGraph.retrieveOrganizationSetupIntent({ orgId, type, reCaptchaTokenV3, reCaptchaAction });
}

function deactivateSetupIntent(stripeAccountId) {
  return paymentGraph.deactivateSetupIntent(stripeAccountId);
}

function deactivateOrganizationSetupIntent({ orgId, stripeAccountId }) {
  return paymentGraph.deactivateOrganizationSetupIntent({ orgId, stripeAccountId });
}

function getBillingCycleOfPlan({ plan, period, currency, quantity, couponCode, stripeAccountId }) {
  return paymentGraph.getBillingCycleOfPlan({
    plan,
    period,
    currency,
    quantity,
    couponCode,
    stripeAccountId,
  });
}

export async function cancelOrganizationFreeTrial(orgId) {
  return paymentGraph.cancelOrganizationFreeTrial(orgId);
}

async function retrieveBillingInfo(clientId, type) {
  return paymentGraph.retrieveBillingInfo(clientId, type);
}

function previewUpcomingDocStackInvoice({
  orgId,
  plan,
  period,
  currency,
  couponCode,
  startTrial,
  stripeAccountId,
  fetchOptions,
}) {
  return paymentGraph.previewUpcomingDocStackInvoice({
    orgId,
    plan,
    period,
    currency,
    couponCode,
    startTrial,
    stripeAccountId,
    fetchOptions,
  });
}

function previewUpcomingSubscriptionInvoice({
  orgId,
  period,
  currency,
  couponCode,
  startTrial,
  stripeAccountId,
  subscriptionItems,
  fetchOptions,
}) {
  return paymentGraph.previewUpcomingSubscriptionInvoice({
    orgId,
    period,
    currency,
    couponCode,
    startTrial,
    stripeAccountId,
    subscriptionItems,
    fetchOptions,
  });
}

function removePersonalPaymentMethod() {
  return paymentGraph.removePersonalPaymentMethod();
}

function removeOrganizationPaymentMethod(orgId) {
  return paymentGraph.removeOrganizationPaymentMethod(orgId);
}

function getPaymentMethodAndCustomerInfo({ type, clientId, fetchOptions }) {
  return Promise.all([
    paymentGraph.getPaymentMethod({ clientId, fetchOptions }),
    paymentGraph.getCustomerInfo({ type, clientId, fetchOptions }),
  ]);
}

function updatePaymentMethod({ clientId, paymentMethodId, email, type }) {
  return paymentGraph.updatePaymentMethod({
    clientId,
    paymentMethodId,
    email,
    type,
  });
}

function getUnifySubscription({ clientId, type }) {
  return paymentGraph.getUnifySubscription({ clientId, type });
}

function cancelUnifySubscription({ clientId, type, subscriptionItems }) {
  return paymentGraph.cancelUnifySubscription({ clientId, type, subscriptionItems });
}

export default {
  createFreeTrialSubcription,
  createFreeTrialUnifySubscription,
  getBillingEmail,
  subscription,
  getRemainingPlan,
  canOrganizationUpgrade,
  canUserUpgrade,
  getCard,
  cancelSubscription,
  reactivateSubscription,
  applyCouponCode,
  getBillingWarning,
  changeCardInfo,
  closeBillingWarningBanner,
  retryFailedSubscription,
  getNextPaymentInfo,
  retrieveSetupIntent,
  deactivateSetupIntent,
  getBillingCycleOfPlan,
  cancelOrganizationFreeTrial,
  retrieveBillingInfo,
  previewUpcomingDocStackInvoice,
  removePersonalPaymentMethod,
  removeOrganizationPaymentMethod,
  retrieveOrganizationSetupIntent,
  deactivateOrganizationSetupIntent,
  getPaymentMethodAndCustomerInfo,
  updatePaymentMethod,
  previewUpcomingSubscriptionInvoice,
  getUnifySubscription,
  cancelUnifySubscription,
};
