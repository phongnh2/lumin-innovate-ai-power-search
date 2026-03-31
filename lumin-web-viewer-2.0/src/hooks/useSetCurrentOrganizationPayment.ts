import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { UrlSearchParam } from 'constants/UrlSearchParam';

import useShallowSelector from './useShallowSelector';

const useSetCurrentOrganizationPayment = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get(UrlSearchParam.PAYMENT_ORG_TARGET);
  const { organization: selectedOrganization } =
    useShallowSelector((state) => selectors.getOrganizationById(state, organizationId)) || {};
  const { _id: orgId } = selectedOrganization || {};

  useEffect(() => {
    if (orgId) {
      dispatch(actions.setCurrentOrganization(selectedOrganization));
    }

    return () => {
      dispatch(actions.resetOrganization());
    };
  }, [orgId]);
};

export default useSetCurrentOrganizationPayment;
