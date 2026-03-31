import selectors from 'selectors';

import { Nullable } from 'interfaces/common';
import { IUser } from 'interfaces/user/user.interface';

import { useShallowSelector } from './useShallowSelector';

export const useGetCurrentUser = (): Nullable<IUser> => useShallowSelector(selectors.getCurrentUser);

export default useGetCurrentUser;
