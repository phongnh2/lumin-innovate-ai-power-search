import React, { Dispatch, SetStateAction } from 'react';

import { Checkbox } from 'lumin-components/Shared/Checkbox';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { avatar } from 'utils';

import { SearchUserStatus, UserStatus } from 'constants/lumin-common';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import styles from '../ExtraFreeTrialModal.module.scss';
import { handleChangeCheckbox } from '../helper/handleChangeCheckbox';
import { handleParentCheckbox } from '../helper/handleParentCheckbox';

const AddUserCollaborators = ({
  setSelectedUsers,
  selectedUsers,
  userCollaborators,
}: {
  setSelectedUsers: Dispatch<SetStateAction<InviteToOrganizationInput[]>>;
  selectedUsers: InviteToOrganizationInput[];
  userCollaborators: IUserResult[];
}) => {
  const totalUserCollaborator = userCollaborators.length;
  const totalChecked = selectedUsers.length;
  const isChecked = totalUserCollaborator === totalChecked;
  const isIndeterminateState = totalChecked > 0 && totalChecked < totalUserCollaborator;

  const renderList = () => (
    <div className={styles.listItem}>
      {userCollaborators.map((user: IUserResult) => {
        const pendingLabel =
          user?.status === SearchUserStatus.USER_UNAVAILABLE ? UserStatus.UNAVAILABLE : UserStatus.PENDING;
        const _isChecked = selectedUsers.some((_user) => _user.email === user.email);
        return (
          <div className={styles.itemWrapper} key={user.email}>
            <div className={styles.itemContent}>
              <MaterialAvatar size={32} src={user?.avatarRemoteId}>
                {avatar.getTextAvatar(user.name)}
              </MaterialAvatar>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{user.name || pendingLabel}</div>
                <p className={styles.itemEmail}>{user.email}</p>
              </div>
            </div>
            <Checkbox
              className={styles.checkbox}
              checked={_isChecked}
              onChange={() => handleChangeCheckbox({ user, setSelectedUsers })}
              border="var(--kiwi-colors-surface-on-surface)"
            />
          </div>
        );
      })}
    </div>
  );

  if (userCollaborators.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <p className={styles.header}>Select who you want to collaborate with:</p>
        <div className={styles.headerItem}>
          <div className={styles.selectedText}>
            {totalChecked}/{totalUserCollaborator} selected
          </div>
          <Checkbox
            className={styles.checkbox}
            checked={isChecked}
            onChange={(e) => handleParentCheckbox({ e, setSelectedUsers, userCollaborators, selectedUsers })}
            indeterminate={isIndeterminateState}
            border="var(--kiwi-colors-surface-on-surface)"
          />
        </div>
      </div>
      {renderList()}
    </div>
  );
};

export default AddUserCollaborators;
