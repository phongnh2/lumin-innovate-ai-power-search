import { produce } from 'immer';
import { filter } from 'lodash';
import { Checkbox, Text, Avatar } from 'lumin-ui/kiwi-ui';
import React from 'react';

import DefaultUserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import ScrollAreaAutoSize from 'luminComponents/ScrollAreaAutoSize';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import { UserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { User, UserPayload } from '../../InvitesToAddDocStackModal.types';

import styles from './InviteesList.module.scss';

type InviteesListProps = {
  userList: User[];
  selectedUsers: UserPayload[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserPayload[]>>;
};

const InviteesList = ({ userList, selectedUsers, setSelectedUsers }: InviteesListProps) => {
  const { t } = useTranslation();

  const totalAmount = userList.length;
  const selectedAmount = selectedUsers.length;
  const isIndeterminateState = selectedAmount > 0 && selectedAmount < totalAmount;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedUsers(userList.map(({ email }) => ({ email, role: ORGANIZATION_ROLES.MEMBER })));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleChangeCheckbox = (user: User) => {
    setSelectedUsers((prev) =>
      produce(prev, (draftState) => {
        const selectedUser = draftState.find((item) => user.email === item.email);
        if (selectedUser) {
          return filter(draftState, (item) => user.email !== item.email);
        }
        return [
          {
            email: user.email,
            role: ORGANIZATION_ROLES.MEMBER,
          },
          ...draftState,
        ];
      })
    );
  };

  const getUserAvatarUrl = (user: User) => {
    if (user.remoteName) {
      return user.avatarRemoteId;
    }
    return avatar.getAvatar(user.avatarRemoteId);
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.selected}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-low)">
          {t('invitesToAddDocStackModal.selectToCollaborateWith')}
        </Text>
        <div className={styles.checkboxWrapper}>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {selectedAmount}/{totalAmount} {t('setUpOrg.textSelected')}
          </Text>
          <Checkbox
            size="md"
            borderColor="var(--kiwi-colors-surface-outline)"
            checked={selectedAmount === totalAmount}
            indeterminate={isIndeterminateState}
            onChange={handleSelectAll}
          />
        </div>
      </div>
      <ScrollAreaAutoSize
        classNames={{
          root: styles.root,
          viewport: styles.viewport,
        }}
        scrollbars="y"
        offsetScrollbars="x"
        mah={260}
      >
        <div className={styles.listWrapper}>
          {userList.map((user) => {
            const name = user.name || user.remoteName;
            const avatarRemoteId = getUserAvatarUrl(user);
            const isChecked = selectedUsers.some((_user) => _user.email === user.email);
            const pendingLabel =
              user.status === UserStatus.UNAVAILABLE ? t('common.unavailable') : t('modalShare.pendingUser');
            return (
              <div
                role="presentation"
                className={styles.listItem}
                key={user.email}
                onClick={() => handleChangeCheckbox(user)}
              >
                <div className={styles.collaboratorWrapper}>
                  {name ? (
                    <Avatar key={user.email} size="sm" variant="outline" src={avatarRemoteId} name={name} />
                  ) : (
                    <Avatar size="sm" variant="outline" src={DefaultUserAvatar} />
                  )}
                  <div className={styles.collaboratorInfo}>
                    <Text
                      className={!name && styles.pendingUser}
                      size="sm"
                      type="title"
                      color="var(--kiwi-colors-surface-on-surface)"
                      ellipsis
                    >
                      {name || pendingLabel}
                    </Text>
                    <Text size="sm" type="body" color="var(--kiwi-colors-surface-on-surface-low)" ellipsis>
                      {user.email}
                    </Text>
                  </div>
                </div>
                <Checkbox
                  size="md"
                  borderColor="var(--kiwi-colors-surface-outline)"
                  checked={isChecked}
                  onChange={() => handleChangeCheckbox(user)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })}
        </div>
      </ScrollAreaAutoSize>
    </div>
  );
};

export default InviteesList;
