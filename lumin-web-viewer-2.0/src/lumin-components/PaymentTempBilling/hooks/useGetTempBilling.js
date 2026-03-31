import { capitalize } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetPlanName, useMatchPaymentRoute, useTranslation } from 'hooks';
import { useGetPricingBaseOnPlan } from 'hooks/pricingRefactors';

import { paymentUtil, numberUtils } from 'utils';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { PERIOD, Plans, PRICING_VERSION } from 'constants/plan';

export const useGetTempBilling = ({ billingInfo, currentOrganization, canUpgrade }) => {
  const { t } = useTranslation();
  const planName = useGetPlanName();
  const { period, plan, isMonthly } = useMatchPaymentRoute();

  const isUpgradeOnOldPlan = plan === Plans.BUSINESS;
  const priceVersion = isUpgradeOnOldPlan ? PRICING_VERSION.V2 : PRICING_VERSION.V3;
  const { price } = useGetPricingBaseOnPlan({
    organization: currentOrganization,
    period,
    plan,
    priceVersion,
  });
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const { quantity, currency } = billingInfo;
  const { payment: orgPayment = {} } = currentOrganization || {};
  const { docStackStorage: orgDocStack = {} } = currentOrganization || {};
  const { nextDocStack, totalBlock } = paymentUtil.getNextDocStack({
    quantity,
    nextPlan: plan,
    nextPeriod: period,
    currentPeriod: orgPayment.period,
    currentPlan: orgPayment.type,
    currentStatus: orgPayment.status,
    totalDocStackUsed: orgDocStack?.totalUsed || 0,
  });

  const getUnitOnMonthPeriod = () => (isUpgradeOnOldPlan ? price : price * totalBlock);

  const getUnitOnAnnualPeriod = () => {
    const unitPrice = numberUtils.formatTwoDigits(price / NUMBER_OF_MONTHS_IN_YEAR);
    return isUpgradeOnOldPlan ? unitPrice : unitPrice * totalBlock;
  };

  const getUnitPrice = () => (isMonthly ? getUnitOnMonthPeriod() : getUnitOnAnnualPeriod());

  const getCurrencySymbol = () => paymentUtil.convertCurrencySymbol(currency);

  const getPlanName = () => {
    const isAnnual = period.toUpperCase() === PERIOD.ANNUAL;
    let text = null;

    if (isUpgradeOnOldPlan) {
      text = isAnnual
        ? t('payment.oldAnnualPlanName', { planName, quantity })
        : t('payment.oldMonthlyPlanName', { planName, quantity });
    } else {
      text = isAnnual ? t('payment.newAnnualPlanName', { planName }) : t('payment.newMonthylyPlanName', { planName });
    }

    return text;
  };

  const getChooseOrgText = () =>
    Boolean(availablePaidOrgs.length) && !currentOrganization && t('payment.chooseOrgToViewPrice');

  const getPlanPrice = () => {
    const { convertFromTeam: isConvertFromTeam } = currentOrganization || {};
    return paymentUtil.getOrganizationPrice({ plan, period, quantity, isConvertFromTeam });
  };

  const getOrgPriceText = () => {
    if (!canUpgrade) {
      return null;
    }

    const price = `${getCurrencySymbol()}${numberUtils.formatDecimal(getUnitPrice())} ${currency}`;
    return isUpgradeOnOldPlan
      ? t('payment.oldOrgPriceText', { price })
      : t('payment.newOrgPriceText', { price, nextDocStack });
  };

  const isNewSubscription = () => !availablePaidOrgs.length || (currentOrganization && orgPayment.type === Plans.FREE);

  const getChangeOrgPlanText = () =>
    canUpgrade &&
    !isNewSubscription() &&
    isUpgradeOnOldPlan && (
      <Trans
        i18nKey="payment.changeOrgPlanText"
        components={{ b: <b /> }}
        values={{
          period: capitalize(orgPayment.period),
          quantity: orgPayment.quantity,
          newPeriod: capitalize(period),
          newQuantity: quantity,
        }}
      />
    );

  return {
    planName: getPlanName(),
    chooseOrgText: getChooseOrgText(),
    changeOrgPlanText: getChangeOrgPlanText(),
    orgPriceText: getOrgPriceText(),
    currencySymbol: getCurrencySymbol(),
    isNewSubscription: isNewSubscription(),
    planPrice: getPlanPrice(),
    eventPlanName: `${planName} ${capitalize(period)} Plan`,
  };
};
