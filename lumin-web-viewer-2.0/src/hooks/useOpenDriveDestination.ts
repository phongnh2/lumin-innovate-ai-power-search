import { shallowEqual, useSelector } from 'react-redux';
import { get } from 'lodash';

import selectors from 'selectors';
import { IUser } from 'interfaces/user/user.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { ORGANIZATION_CREATION_TYPE } from 'constants/organizationConstants';

type Payload = {
  loading: boolean;
  destinationId: string;
};

function useOpenDriveDestination(): Payload {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { data: organizations, loading } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const defaultWorkspace = get(currentUser, 'setting.defaultWorkspace') as string;

  if (!currentUser || loading) {
    return {
      loading: true,
      destinationId: null,
    };
  }

  const getDestinationId = (): string => {
    if (!organizations.length) {
      return null;
    }

    if (defaultWorkspace) {
      return defaultWorkspace;
    }

    if (organizations.length === 1) {
      return organizations[0].organization._id;
    }

    const orgList = organizations.map(({ organization }) => organization);
    const mainOrgs = orgList.filter(({ creationType }) => creationType === ORGANIZATION_CREATION_TYPE.AUTOMATIC);
    if (mainOrgs.length === 1) {
      return mainOrgs[0]._id;
    }

    return null;
  };

  return {
    loading: false,
    destinationId: getDestinationId(),
  };
}

export default useOpenDriveDestination;
