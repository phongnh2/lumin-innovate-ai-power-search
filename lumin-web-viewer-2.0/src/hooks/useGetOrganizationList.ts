import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

const useGetOrganizationList = () => {
  const { loading, data } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  return { loading, organizationList: data || [] };
};

export default useGetOrganizationList;
