import { SearchUserStatus, UserStatus } from 'constants/lumin-common';

export const isGuestUser = (_user) => !_user._id;

export const isUnavailableUser = (_name) => UserStatus.UNAVAILABLE === _name;

export const isAdded = (user) => user.status === SearchUserStatus.USER_ADDED;

export const isDeleted = (user) => SearchUserStatus.USER_DELETING === user.status;

export const getInvalidStatus = (status) => [
  SearchUserStatus.USER_ADDED,
  SearchUserStatus.USER_DELETING,
  SearchUserStatus.USER_UNAVAILABLE,
].find((_status) => status === _status);
