import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_ORG_PAGE } from 'constants/growthBookConstant';
import { Plans } from 'constants/plan';
import { UrlSearchParam } from 'constants/UrlSearchParam';

type Payload = Pick<ATTRIBUTES_GROWTH_BOOK, ATTRIBUTES_IN_ORG_PAGE>;

const useGetAttributesInPaymentPage = (): Payload => {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get(UrlSearchParam.PAYMENT_ORG_TARGET);
  const { organization: currentOrg } =
    useShallowSelector((state) => selectors.getOrganizationById(state, organizationId)) || {};

  const { _id: orgId, payment, userRole: orgRole } = currentOrg || {};
  const { type: paymentType, status: paymentStatus, customerRemoteId } = payment || {};
  const isCircleCanceledPlan = paymentType === Plans.FREE && Boolean(customerRemoteId);

  return useMemo(
    (): Payload => ({
      orgId,
      circleRole: orgRole?.toUpperCase(),
      circlePlan: paymentType,
      circlePlanStatus: paymentStatus,
      isCircleCanceledPlan,
    }),
    [orgId, orgRole, paymentType, paymentStatus, isCircleCanceledPlan]
  );
};

export default useGetAttributesInPaymentPage;
