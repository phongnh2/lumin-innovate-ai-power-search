import { get } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';

import { Plans } from 'constants/plan';
import { IUser } from 'interfaces/user/user.interface';
import selectors from 'selectors';

function useAvailablePersonalWorkspace(): boolean {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  return get(currentUser, 'payment.type') !== Plans.FREE;
}

export default useAvailablePersonalWorkspace;
