import { find } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';
import selectors from 'selectors';

export const useOrganizationPayment = ({ billingInfo }) => {
  const orgList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const organizations = orgList.map(({ organization }) => organization);
  const currentOrganization = find(organizations, { _id: billingInfo.organizationId });

  return {
    currentOrganization,
  };
};
