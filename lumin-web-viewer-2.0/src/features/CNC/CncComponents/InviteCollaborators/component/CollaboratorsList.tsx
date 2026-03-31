import { Avatar, Checkbox, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import DefaultUserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import ScrollAreaAutoSize from 'luminComponents/ScrollAreaAutoSize';

import { avatar } from 'utils';

import { handleChangeCheckbox } from 'features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleChangeCheckbox';
import { handleParentCheckbox } from 'features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleParentCheckbox';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import styles from '../InviteCollaborators.module.scss';

const CollaboratorsList = ({
  selectedUsers,
  setSelectedUsers,
  allUsers,
}: {
  selectedUsers: InviteToOrganizationInput[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<InviteToOrganizationInput[]>>;
  allUsers: IUserResult[];
}) => {
  const { t } = useTranslation();
  const totalSelect = selectedUsers.length;
  const totalUsers = allUsers.length;
  const isIndeterminateState = totalSelect > 0 && totalSelect < totalUsers;

  return (
    <>
      <div className={styles.selected}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {totalSelect}/{totalUsers} {t('setUpOrg.textSelected')}
        </Text>
        <Checkbox
          size="md"
          borderColor="var(--kiwi-colors-surface-outline)"
          checked={totalSelect === totalUsers}
          indeterminate={isIndeterminateState}
          onChange={(e) => handleParentCheckbox({ e, setSelectedUsers, userCollaborators: allUsers, selectedUsers })}
        />
      </div>
      <ScrollAreaAutoSize
        classNames={{
          viewport: styles.viewport,
        }}
        scrollbars="y"
        offsetScrollbars="x"
        mah={270}
      >
        <div className={styles.listWrapper}>
          {allUsers.map((item) => {
            const isChecked = selectedUsers.some((_user) => _user.email === item.email);
            return (
              <div
                role="presentation"
                className={styles.listItemWithCheckbox}
                key={item.email}
                onClick={() => handleChangeCheckbox({ user: item, setSelectedUsers })}
              >
                <div className={styles.collaboratorWrapper}>
                  {item.name ? (
                    <Avatar size="sm" variant="outline" src={avatar.getAvatar(item.avatarRemoteId)} name={item.name} />
                  ) : (
                    <Avatar size="sm" variant="outline" src={DefaultUserAvatar} />
                  )}
                  <div className={styles.collaboratorInfo}>
                    <Text
                      className={!item.name && styles.pendingUser}
                      size="sm"
                      type="title"
                      color="var(--kiwi-colors-surface-on-surface)"
                      ellipsis
                    >
                      {item.name || t('modalShare.pendingUser')}
                    </Text>
                    <Text size="sm" type="body" color="var(--kiwi-colors-surface-on-surface-variant)" ellipsis>
                      {item.email}
                    </Text>
                  </div>
                </div>

                <Checkbox
                  size="md"
                  borderColor="var(--kiwi-colors-surface-outline)"
                  checked={isChecked}
                  onChange={() => handleChangeCheckbox({ user: item, setSelectedUsers })}
                />
              </div>
            );
          })}
        </div>
      </ScrollAreaAutoSize>
    </>
  );
};

export default CollaboratorsList;
