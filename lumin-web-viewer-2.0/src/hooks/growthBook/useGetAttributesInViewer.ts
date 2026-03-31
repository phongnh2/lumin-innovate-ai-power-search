import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import selectors from 'selectors';

import { PaymentHelpers } from 'utils/payment';

import useGetDontShowFreeTrialModalAgainClicked from 'features/CNC/hooks/useGetDontShowFreeTrialModalAgainClicked';

import { ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_VIEWER } from 'constants/growthBookConstant';
import { Plans } from 'constants/plan';
import { RedirectFromPage, UrlSearchParam } from 'constants/UrlSearchParam';

import { ITrialInfo } from 'interfaces/payment/payment.interface';

import useGetOwnCurrentDoc from '../useGetOwnCurrentDoc';
import { useThemeMode } from '../useThemeMode';

type Payload = Pick<ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_VIEWER>;

const useGetAttributesInViewer = (): Payload => {
  const [searchParams] = useSearchParams();
  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();
  const { _id: orgId, payment, userRole: orgRole, createdAt } = orgOwnCurrentDocument || {};
  const { type: paymentType, status: paymentStatus, customerRemoteId, trialInfo = {} } = payment || {};
  const themeMode = useThemeMode();
  const isCircleCanceledPlan = paymentType === Plans.FREE && Boolean(customerRemoteId);
  const canStartTrialPlan = PaymentHelpers.evaluateTrialPlan(trialInfo as ITrialInfo);
  const billingWarning = useSelector(selectors.getBillingWarning, shallowEqual) || {};
  const { subCancelPayload } = billingWarning[orgId] || {};
  const { remainingDay: circleRemainingCancelDays, lastSubscriptionEndedAt } = subCancelPayload || {};
  const isOpenFromTemplates = searchParams.get(UrlSearchParam.FROM_PAGE) === RedirectFromPage.TEMPLATES;
  const { dontShowFreeTrialModalAgainClicked } = useGetDontShowFreeTrialModalAgainClicked({ currentOrg: orgOwnCurrentDocument });
  const orgCreatedAtEpochSeconds = Math.floor(Date.parse(createdAt?.toString()) / 1000);

  return useMemo(
    (): Payload => ({
      orgId,
      circleRole: orgRole?.toUpperCase(),
      circlePlan: paymentType,
      circlePlanStatus: paymentStatus,
      isCircleCanceledPlan,
      themeMode,
      canStartTrialPlan,
      circleRemainingCancelDays,
      circleCanceledAt: lastSubscriptionEndedAt,
      isOpenFromTemplates,
      dontShowFreeTrialModalAgainClicked,
      orgCreatedAtEpochSeconds,
    }),
    [
      orgId,
      orgRole,
      paymentStatus,
      paymentType,
      isCircleCanceledPlan,
      themeMode,
      canStartTrialPlan,
      circleRemainingCancelDays,
      lastSubscriptionEndedAt,
      isOpenFromTemplates,
      dontShowFreeTrialModalAgainClicked,
      orgCreatedAtEpochSeconds,
    ]
  );
};

export default useGetAttributesInViewer;
