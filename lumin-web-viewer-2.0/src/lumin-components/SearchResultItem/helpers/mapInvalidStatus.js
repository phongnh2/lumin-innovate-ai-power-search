import { SearchUserStatus } from 'constants/lumin-common';

export default {
  [SearchUserStatus.USER_ADDED]: 'Added',
  [SearchUserStatus.USER_DELETING]: 'Deactivated',
  [SearchUserStatus.USER_RESTRICTED]: 'Unavailable',
};
