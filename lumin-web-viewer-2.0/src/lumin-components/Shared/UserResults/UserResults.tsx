import React from 'react';

import SearchResultItem from 'lumin-components/SearchResultItem';

import { SearchUserStatus } from 'constants/lumin-common';

interface IUserResult {
  _id: string;
  name: string;
  email: string;
  avatarRemoteId: string;
  status: string;
  grantedPermission: boolean;
}

type Props = {
  data: IUserResult;
  onClick: () => void;
  selected: boolean;
  isReskin?: boolean;
};

const UserResults = ({ data, onClick, selected, isReskin = false }: Props): JSX.Element => {
  const { name, avatarRemoteId, email, status, _id } = data || {};
  const invalidStatus = [
    SearchUserStatus.USER_ADDED,
    SearchUserStatus.USER_DELETING,
    SearchUserStatus.USER_UNAVAILABLE,
    SearchUserStatus.USER_RESTRICTED,
  ].find((_status) => status === _status);

  if (!_id) {
    return (
      <SearchResultItem.PendingUserInfo
        email={email}
        onClick={onClick}
        selected={selected}
        invalidStatus={invalidStatus}
        disabled={Boolean(invalidStatus)}
        isReskin={isReskin}
      />
    );
  }
  return (
    <SearchResultItem.UserInfo
      name={name}
      email={email}
      avatarRemoteId={avatarRemoteId}
      onClick={onClick}
      selected={selected}
      invalidStatus={invalidStatus}
      disabled={Boolean(invalidStatus)}
      isReskin={isReskin}
    />
  );
};

export default UserResults;
