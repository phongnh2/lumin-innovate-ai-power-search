import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { PaymentHelpers } from 'utils/payment';

import useGetDontShowFreeTrialModalAgainClicked from 'features/CNC/hooks/useGetDontShowFreeTrialModalAgainClicked';

import { ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_ORG_PAGE } from 'constants/growthBookConstant';
import { Plans } from 'constants/plan';

import { ITrialInfo } from 'interfaces/payment/payment.interface';
import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';

type Payload = Pick<ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_ORG_PAGE>;

const useGetAttributesInOrgPage = (): Payload => {
  const { data: currentOrg } = useSelector<unknown, IOrganizationData>(selectors.getCurrentOrganization, shallowEqual);
  const { _id: orgId, payment, userRole: orgRole } = currentOrg || {};
  const { type: paymentType, status: paymentStatus, customerRemoteId, trialInfo = {} } = payment || {};
  const isCircleCanceledPlan = paymentType === Plans.FREE && Boolean(customerRemoteId);
  const canStartTrialPlan = PaymentHelpers.evaluateTrialPlan(trialInfo as ITrialInfo);
  const billingWarning = useSelector(selectors.getBillingWarning, shallowEqual) || {};
  const { subCancelPayload } = billingWarning[orgId] || {};
  const { remainingDay: circleRemainingCancelDays, lastSubscriptionEndedAt } = subCancelPayload || {};
  const { dontShowFreeTrialModalAgainClicked } = useGetDontShowFreeTrialModalAgainClicked({ currentOrg });

  return useMemo(
    (): Payload => ({
      orgId,
      circleRole: orgRole?.toUpperCase(),
      circlePlan: paymentType,
      circlePlanStatus: paymentStatus,
      isCircleCanceledPlan,
      canStartTrialPlan,
      circleRemainingCancelDays,
      circleCanceledAt: lastSubscriptionEndedAt,
      dontShowFreeTrialModalAgainClicked,
    }),
    [
      orgId,
      orgRole,
      paymentType,
      paymentStatus,
      isCircleCanceledPlan,
      canStartTrialPlan,
      circleRemainingCancelDays,
      lastSubscriptionEndedAt,
      dontShowFreeTrialModalAgainClicked,
    ]
  );
};

export default useGetAttributesInOrgPage;
