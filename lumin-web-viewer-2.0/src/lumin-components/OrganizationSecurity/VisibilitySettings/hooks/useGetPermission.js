import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { SORTED_ORG_PLAN_TYPE } from 'constants/plan';

const plans = Object.values(SORTED_ORG_PLAN_TYPE);

const useGetPermission = () => {
  const { payment } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { type } = payment || {};
  const orgPlanIndex = plans.findIndex((plan) => plan === type);
  const checkPermission = (acceptedPlan) => orgPlanIndex >= plans.findIndex((plan) => plan === acceptedPlan);

  return {
    canEdit: checkPermission(SORTED_ORG_PLAN_TYPE.ORG_STARTER),
    canDelete: true,
    canCreate: checkPermission(SORTED_ORG_PLAN_TYPE.ORG_STARTER),
    canModifySecurity: checkPermission(SORTED_ORG_PLAN_TYPE.BUSINESS),
  };
};

export { useGetPermission };
