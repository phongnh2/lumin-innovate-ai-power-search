import classNames from 'classnames';
import { Avatar, Button, ButtonSize, ButtonVariant, Icomoon, Menu, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import UserTag from 'luminComponents/AddShareMemberInput/components/UserTag';

import { avatar, string } from 'utils';

import { OrganizationRoles } from 'constants/organization.enum';
import { PlanTypeLabel } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useHandleInviteSharedUsersModal from './hooks/useHandleInviteSharedUsersModal';

import styles from './InviteSharedUsersModal.module.scss';

type UserTagType = {
  _id: string;
  email: string;
  name: string;
};

type Props = {
  organization: IOrganization;
  userTags: UserTagType[];
  pendingUserList: [];
  onClose: () => void;
  setShowDiscardModal: (value: boolean) => void;
  handleResetShareModalList: () => void;
};

const ROLE = [
  { title: 'Admin', role: OrganizationRoles.BILLING_MODERATOR },
  { title: 'Member', role: OrganizationRoles.MEMBER },
];

const ROLE_TEXT = {
  [OrganizationRoles.ORGANIZATION_ADMIN]: 'Owner',
  [OrganizationRoles.BILLING_MODERATOR]: 'Admin',
  [OrganizationRoles.MEMBER]: 'Member',
};

const InviteSharedUsersModal = ({
  organization,
  userTags,
  pendingUserList,
  onClose,
  setShowDiscardModal,
  handleResetShareModalList,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { name: orgName, avatarRemoteId, userRole, payment, totalMember } = organization || {};
  const { type } = payment || {};
  const isAdmin = [OrganizationRoles.ORGANIZATION_ADMIN, OrganizationRoles.BILLING_MODERATOR].includes(
    userRole as OrganizationRoles
  );
  const shouldShowTooltip = orgName?.length > 30;

  const {
    users,
    role,
    setRole,
    inviting,
    handleDelete,
    hasEmailIncluded,
    handleInvite,
    handleDismiss,
    canRemoveUserTag,
  } = useHandleInviteSharedUsersModal({
    organization,
    userTags,
    onClose,
    setShowDiscardModal,
    handleResetShareModalList,
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <p className={styles.title}>
          Add users to{' '}
          <PlainTooltip
            content={shouldShowTooltip ? orgName : ''}
            position="top"
            maw={400}
            className={styles.nameWrapper}
          >
            {string.getShortStringWithLimit(orgName, 30)}
          </PlainTooltip>{' '}
          Workspace
        </p>
        <p className={styles.label}>Adding users is free</p>
      </div>
      <div className={styles.userSection}>
        <p className={styles.userSectionTitle}>Do you want to add these people to the Workspace?</p>
        <div className={styles.userTags}>
          {users.map((tag) => (
            <UserTag
              key={tag.email}
              tag={tag}
              pendingUserList={pendingUserList}
              handleDelete={handleDelete}
              hasEmailIncluded={hasEmailIncluded}
              canDelete={canRemoveUserTag}
            />
          ))}
        </div>
      </div>
      <div className={styles.roleSection}>
        <p className={styles.roleTitle}>With role</p>
        <Menu
          width={432}
          position="bottom"
          ComponentTarget={
            <button
              className={classNames([
                styles.buttonRole,
                !isAdmin && styles.buttonRoleDisabled,
                open && styles.buttonRoleActive,
              ])}
            >
              <p>{ROLE_TEXT[role]}</p>
              {isAdmin && <Icomoon type="caret-down-filled-lg" />}
            </button>
          }
          itemSize="regular"
          opened={open}
          onChange={(opened) => {
            setOpen(opened);
          }}
          zIndex="var(--zindex-modal-high)"
        >
          {ROLE.filter(({ role: currentRole }) => currentRole !== role).map((item) => (
            <MenuItem
              key={item.title}
              className={classNames([styles.menuItem, !open && styles.hideMenuItem])}
              onClick={() => setRole(item.role)}
            >
              {item.title}
            </MenuItem>
          ))}
        </Menu>
      </div>
      <div className={styles.divider} />
      <div className={styles.orgSection}>
        <p className={styles.circleTitle}>Workspace information</p>
        <div className={styles.circleInfo}>
          <Avatar size="lg" src={avatar.getAvatar(avatarRemoteId)} />
          <div>
            <PlainTooltip content={shouldShowTooltip ? orgName : ''} position="top" maw={400}>
              <p className={styles.circleName}>{string.getShortStringWithLimit(orgName, 30)}</p>
            </PlainTooltip>
            <p className={styles.circleDescription}>
              {totalMember} member(s) - {PlanTypeLabel[type]} plan
            </p>
          </div>
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        <Button onClick={handleDismiss} size={ButtonSize.lg} variant={ButtonVariant.text} disabled={inviting}>
          Skip for now
        </Button>
        <Button onClick={handleInvite} size={ButtonSize.lg} loading={inviting}>
          Invite for free
        </Button>
      </div>
    </div>
  );
};

export default InviteSharedUsersModal;
