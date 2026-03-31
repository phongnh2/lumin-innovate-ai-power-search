import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useCustomCompareEffect } from 'react-use';

import actions from 'actions';
import selectors from 'selectors';

import { organizationServices } from 'services';

export function useConvertedOrganization(callback = null) {
  const organizationListState = useSelector(selectors.getOrganizationList, shallowEqual);
  const { data: organizations } = organizationListState || {};
  const dispatch = useDispatch();
  const orgIds = useMemo(() => organizations?.map((item) => item.organization._id) || [], [organizations]);

  const subscriptionConvertOrg = useCallback(
    (listOrgId) =>
      organizationServices.subscriptionConvertOrganization(listOrgId, () => {
        callback();
        dispatch(actions.fetchOrganizations());
      }),
    [dispatch]
  );

  const isEqual = (prevDeps, nextDeps) => {
    const prevOrgIds = prevDeps[0] || [];
    const nextOrgIds = nextDeps[0] || [];
    return prevOrgIds.length === nextOrgIds.length && prevOrgIds.every((orgId) => nextOrgIds.includes(orgId));
  };

  useCustomCompareEffect(() => {
    const subscription = orgIds.length && subscriptionConvertOrg(orgIds);
    return () => subscription && subscription.unsubscribe();
  }, [orgIds, subscriptionConvertOrg], isEqual);
}
