import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { Nullable } from 'interfaces/common';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';

const useGetCurrentOrganization = (): Nullable<IOrganization> => {
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const { data } = useSelector<unknown, IOrganizationData>(selectors.getCurrentOrganization, shallowEqual);
  return data;
};

export default useGetCurrentOrganization;
