import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import getDontShowFreeTrialModalAgainClicked from '../helpers/getDontShowFreeTrialModalAgainClicked';

type Params = {
  currentOrg: IOrganization;
};

const useGetDontShowFreeTrialModalAgainClicked = ({ currentOrg }: Params) => {
  const currentUser = useShallowSelector<IUser>(selectors.getCurrentUser);
  const dontShowFreeTrialModalAgainClicked = getDontShowFreeTrialModalAgainClicked({
    userId: currentUser?._id,
    orgUrl: currentOrg?.url,
  });

  return { dontShowFreeTrialModalAgainClicked };
};

export default useGetDontShowFreeTrialModalAgainClicked;
