import { capitalize } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetPlanName, useMatchPaymentRoute, useTranslation } from 'hooks';
import { useGetPricingBaseOnPlan } from 'hooks/pricingRefactors';

import { paymentUtil, numberUtils } from 'utils';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { PERIOD, Plans, PRICING_VERSION } from 'constants/plan';
import { PaymentPlans, PaymentPeriod, PaymentStatus, PaymentCurrency } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { BillingInfo } from '../../OrganizationCheckout/OrganizationCheckoutContext';

type Props = {
  billingInfo: BillingInfo;
  currentOrganization: IOrganization;
  canUpgrade: boolean;
  isFreeTrial: boolean;
};

export const useGetCheckoutTempBilling = ({ billingInfo, currentOrganization, canUpgrade, isFreeTrial }: Props) => {
  const { t } = useTranslation();
  const planName = useGetPlanName();
  const { period, plan, isMonthly } = useMatchPaymentRoute();

  const priceVersion = PRICING_VERSION.V3;
  const { price } = useGetPricingBaseOnPlan({
    organization: currentOrganization,
    period,
    plan,
    priceVersion,
  });
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const { quantity, currency } = billingInfo;
  const { payment: orgPayment } = currentOrganization || {};
  const { docStackStorage: orgDocStack } = currentOrganization || {};
  const { nextDocStack, totalBlock } = paymentUtil.getNextDocStack({
    quantity,
    nextPlan: plan as PaymentPlans,
    nextPeriod: period as PaymentPeriod,
    currentPeriod: orgPayment.period as PaymentPeriod,
    currentPlan: orgPayment.type,
    currentStatus: orgPayment.status as PaymentStatus,
    totalDocStackUsed: orgDocStack?.totalUsed || 0,
  });

  const getUnitOnMonthPeriod = () => price * totalBlock;

  const getUnitOnAnnualPeriod = () => {
    const unitPrice = numberUtils.formatTwoDigits(price / NUMBER_OF_MONTHS_IN_YEAR);
    return Number(unitPrice) * totalBlock;
  };

  const getUnitPrice = () => (isMonthly ? getUnitOnMonthPeriod() : getUnitOnAnnualPeriod());

  const getCurrencySymbol = () => paymentUtil.convertCurrencySymbol(currency as PaymentCurrency);

  const getPlanName = () => {
    const isAnnual = period.toUpperCase() === PERIOD.ANNUAL;
    if (isFreeTrial) {
      switch (plan) {
        case Plans.ORG_PRO:
          return t('common.proFreeTrial');
        case Plans.ORG_BUSINESS:
          return t('common.businessFreeTrial');
        default:
          return t('common.starterFreeTrial');
      }
    }
    return isAnnual ? t('payment.newAnnualPlanName', { planName }) : t('payment.newMonthylyPlanName', { planName });
  };

  const getPlanPrice = () => {
    if (isFreeTrial) {
      return null;
    }
    return paymentUtil.getOrganizationPrice({
      plan: plan as PaymentPlans,
      period: period as PaymentPeriod,
      quantity,
      isConvertedFromTeam: false,
    });
  };

  const getOrgPriceText = () => {
    if (!canUpgrade || isFreeTrial) {
      return null;
    }

    const _price = `${getCurrencySymbol()}${numberUtils.formatDecimal(getUnitPrice())} ${currency}`;
    return t('payment.newOrgPriceText', { price: _price, nextDocStack });
  };

  const isNewSubscription = () => !availablePaidOrgs.length || (currentOrganization && orgPayment.type === Plans.FREE);

  return {
    planName: getPlanName(),
    orgPriceText: getOrgPriceText(),
    currencySymbol: getCurrencySymbol(),
    isNewSubscription: isNewSubscription(),
    planPrice: getPlanPrice(),
    eventPlanName: `${planName} ${capitalize(period)} Plan`,
  };
};
