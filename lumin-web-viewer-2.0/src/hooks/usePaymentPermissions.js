import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useMatchPaymentRoute } from 'hooks';

import { paymentServices } from 'services';

import { PaymentUtilities } from 'utils/Factory/Payment';

import { PERIOD, Plans } from 'constants/plan';

export const usePaymentPermissions = ({
  currentOrganization,
  billingInfo,
}) => {
  const { period, isFreeTrial: isOnTrialRouter, plan } = useMatchPaymentRoute();
  const isPurchasing = useSelector(selectors.getPurchaseState);
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const hasJoinedAnyOrgs = availablePaidOrgs.length;
  const paymentUtilities = new PaymentUtilities(currentOrganization?.payment);
  const isOnOldPaymentRoute = plan === Plans.BUSINESS;

  const getPlanIndex = (planType) =>
    ({
      [Plans.ORG_STARTER]: 1,
      [Plans.ORG_PRO]: 2,
      [Plans.ORG_BUSINESS]: 3,
    }[planType] || 0);

  const getPeriodIndex = (_period) =>
    ({
      [PERIOD.MONTHLY]: 1,
      [PERIOD.ANNUAL]: 2,
    }[_period] || 0);

  const isHigherOrSamePeriod = () => getPeriodIndex(period) >= getPeriodIndex(paymentUtilities.getPeriod());

  const isHigherPeriod = () => getPeriodIndex(period) > getPeriodIndex(paymentUtilities.getPeriod());

  const isHigherOrSamePlan = () => getPlanIndex(plan) >= getPlanIndex(paymentUtilities.getType());

  const isUpgradeFromTrial = () => paymentUtilities.isFreeTrial() && !isOnTrialRouter;

  const canOrganizationUpgrade = () => {
    if (!hasJoinedAnyOrgs || isUpgradeFromTrial()) {
      return true;
    }
    if (!currentOrganization) {
      return false;
    }
    if (isOnOldPaymentRoute) {
      if (!paymentUtilities.isBusiness() || (paymentUtilities.isBusiness() && isHigherPeriod())) {
        return false;
      }
      return paymentServices.canOrganizationUpgrade(currentOrganization.payment, {
        quantity: billingInfo.quantity,
        period,
      });
    }

    return isHigherOrSamePeriod() && isHigherOrSamePlan();
  };

  const isInputDisabled = () => {
    const isDisabledInputOrgUpgrade = Boolean(
      hasJoinedAnyOrgs ? !currentOrganization : billingInfo.organizationId
    );
    return isPurchasing || isDisabledInputOrgUpgrade;
  };

  const getPaymentOfEntity = () => {
    const selectedEntity = currentOrganization || { payment: null };
    return selectedEntity.payment;
  };

  const isStripeLimitCurrency = () => billingInfo.stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;

  const isCurrencyDisabled = () => {
    const payment = getPaymentOfEntity() || {};
    const hasSubscribeAnyPlan =
      ![Plans.FREE, Plans.FREE_TRIAL].includes(payment.type) || Boolean(payment.customerRemoteId);
    const hasSubscribe = hasJoinedAnyOrgs && hasSubscribeAnyPlan;

    return isOnTrialRouter || hasSubscribe || isInputDisabled() || isStripeLimitCurrency();
  };

  return {
    isInputDisabled: isInputDisabled(),
    isCurrencyDisabled: isCurrencyDisabled(),
    canUpgrade: canOrganizationUpgrade(),
    clientId: billingInfo.organizationId,
    isCreateNewOrg: !hasJoinedAnyOrgs && billingInfo.organizationId,
  };
};
