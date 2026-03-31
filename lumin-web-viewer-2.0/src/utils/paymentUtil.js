/// <reference path="./paymentUtil.d.ts" />

import dayjs from 'dayjs';
import get from 'lodash/get';

import dateUtil from 'utils/date';

import { ORGANIZATION_MAX_MEMBERS, ORGANIZATION_MIN_MEMBERS } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import {
  DOC_STACK_BLOCK,
  NEW_PRICING_PLAN_LIST,
  PaymentTypes,
  Plans,
  PLAN_TYPE_LABEL,
  PRICE,
  TEAM_CONVERT_TO_ORGANIZATION_PRICE,
  STATUS,
} from 'constants/plan';

function convertCurrencySymbol(currency) {
  const currencyConvert = {
    CAD: '$',
    NZD: '$',
    USD: '$',
    EUR: '€',
  };
  return currencyConvert[currency?.toUpperCase()] || '$';
}

function getPlanType(paymentType) {
  return {
    [PaymentTypes.INDIVIDUAL]: Plans.PROFESSIONAL,
    [PaymentTypes.ORGANIZATION]: Plans.BUSINESS,
  }[paymentType.toUpperCase()];
}

function getPrice({ plan, period, isConvertFromTeam = false }) {
  if (isConvertFromTeam) {
    return TEAM_CONVERT_TO_ORGANIZATION_PRICE[period];
  }
  if (NEW_PRICING_PLAN_LIST.includes(plan)) {
    return PRICE.V3[period][plan];
  }
  return PRICE.V2[period][plan];
}

function getOrganizationPrice({ plan, period, quantity, isConvertFromTeam = false }) {
  return getPrice({ plan, period, isConvertFromTeam }) * quantity;
}

function getQuantityInOrgOldPlan(organization) {
  const totalMember = get(organization, 'totalMember', 0);
  const quantity = get(organization, 'payment.quantity', 0);
  return Math.max(quantity, totalMember, ORGANIZATION_MIN_MEMBERS);
}

function isValidQuantity(quantity) {
  return quantity >= ORGANIZATION_MIN_MEMBERS && quantity <= ORGANIZATION_MAX_MEMBERS;
}

function getNextBillingDateFreeTrial() {
  return dateUtil.formatMDYTime(dayjs().add(FREE_TRIAL_DAYS, 'day'));
}

function getStatementDescriptor(customerId) {
  if (!customerId) {
    return '';
  }
  const id = customerId.replace('cus_', '');
  return `Lumin ${id}`.slice(0, 22);
}

function getFreetrialType(paymentType) {
  return PLAN_TYPE_LABEL[paymentType];
}

function isTrialing(status) {
  return status === STATUS.TRIALING;
}

function getNextDocStackBlock({
  quantity = 0,
  currentPlan,
  currentPeriod,
  currentStatus,
  totalDocStackUsed,
  nextPlan,
  nextPeriod,
}) {
  if ([Plans.BUSINESS, Plans.FREE].includes(currentPlan) && NEW_PRICING_PLAN_LIST.includes(nextPlan)) {
    return 1;
  }
  const upcomingDocStackUnit = DOC_STACK_BLOCK[nextPeriod][nextPlan];
  if (isTrialing(currentStatus)) {
    if (upcomingDocStackUnit >= totalDocStackUsed) {
      return 1;
    }
    return Math.ceil(totalDocStackUsed / upcomingDocStackUnit);
  }
  const isUpradeDocStackOnly = currentPlan === nextPlan && currentPeriod === nextPeriod;
  if (isUpradeDocStackOnly) {
    return quantity + 1;
  }
  const isNewPlan = NEW_PRICING_PLAN_LIST.includes(currentPlan);
  const currentTotalDocStack = quantity && isNewPlan ? quantity * DOC_STACK_BLOCK[currentPeriod][currentPlan] : 0;
  if (upcomingDocStackUnit >= currentTotalDocStack) {
    return 1;
  }
  return Math.ceil(currentTotalDocStack / upcomingDocStackUnit);
}

function getNextDocStack({
  quantity = 0,
  currentPlan,
  currentPeriod,
  totalDocStackUsed,
  currentStatus,
  nextPlan,
  nextPeriod,
}) {
  const upcomingDocStackUnit = DOC_STACK_BLOCK[nextPeriod][nextPlan];
  const nextBlock = getNextDocStackBlock({
    quantity,
    currentPlan,
    currentPeriod,
    totalDocStackUsed,
    currentStatus,
    nextPlan,
    nextPeriod,
  });
  return {
    nextDocStack: nextBlock * upcomingDocStackUnit,
    totalBlock: nextBlock,
  };
}

export default {
  convertCurrencySymbol,
  getPlanType,
  getOrganizationPrice,
  getQuantityInOrgOldPlan,
  isValidQuantity,
  getPrice,
  getNextBillingDateFreeTrial,
  getNextDocStackBlock,
  getStatementDescriptor,
  getFreetrialType,
  getNextDocStack,
};
