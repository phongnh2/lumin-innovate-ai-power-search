import { IUserResult } from 'interfaces/user/user.interface';

const DEFAULT_NUMBER_OF_SELECTED_USERS = 5;

const getPrioritizedUsers = (users: Array<IUserResult>) => {
  const prioritizedUsers = [...users].sort((a, b) => Number(a._id === null) - Number(b._id === null));
  return prioritizedUsers.slice(0, DEFAULT_NUMBER_OF_SELECTED_USERS);
};

export default getPrioritizedUsers;
