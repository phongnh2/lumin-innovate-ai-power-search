import classNames from 'classnames';
import { IconButton, Menu, MenuItem, Button, Divider } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { commonUtils } from 'utils';

import { ORGANIZATION_MEMBER_TYPE, ORGANIZATION_ROLES } from 'constants/organizationConstants';

import styles from './ActionButton.module.scss';

type ActionButtonProps = {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  myRole: string;
  listToShow: string;
  invitationProcessing: {
    isSending: boolean;
    isRemoving: boolean;
  };
  onResendInvitation(): void;
  onRemoveInvitation(): void;
  onTransferOwner(): void;
  onSetMemberRole(role: string): void;
  onRemoveMember(): void;
  onUnassignSeat(): void;
  isMemberRoleUser: boolean;
  isMemberHasSameAdminRole: boolean;
  isMemberRoleBillingModerator: boolean;
  isCurrentUser: boolean;
  canUnassignSeat: boolean;
};

const ActionButton = ({
  opened,
  setOpened,
  myRole,
  listToShow,
  onTransferOwner,
  invitationProcessing: { isRemoving, isSending },
  onResendInvitation,
  onRemoveInvitation,
  onSetMemberRole,
  onRemoveMember,
  onUnassignSeat,
  isMemberRoleUser,
  isMemberHasSameAdminRole,
  isMemberRoleBillingModerator,
  isCurrentUser,
  canUnassignSeat,
}: ActionButtonProps) => {
  const { t } = useTranslation();
  const { bodyScrollRef } = useContext(AppLayoutContext);
  const isProcessing = isRemoving || isSending;

  const textMakeText = (text: string) =>
    commonUtils.formatTitleCaseByLocale(t('memberPage.makeText', { text: text.toLowerCase() }));

  if (listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER) {
    return (
      <div className={classNames(styles.wrapper, styles.withButtons)}>
        {!isMemberHasSameAdminRole && (
          <Button
            className={isProcessing && styles.noActions}
            data-cy="remove_invitation"
            variant="text"
            colorType="error"
            disabled={isRemoving}
            loading={isRemoving}
            onClick={!isProcessing && onRemoveInvitation}
          >
            {t('common.remove')}
          </Button>
        )}
        <Button
          className={isProcessing && styles.noActions}
          data-cy="resend_invitation"
          variant="text"
          colorType="info"
          disabled={isSending}
          loading={isSending}
          onClick={!isProcessing && onResendInvitation}
        >
          {t('memberPage.resendInvite')}
        </Button>
      </div>
    );
  }

  const renderMenuItems = () => {
    if (isCurrentUser && canUnassignSeat) {
      return (
        <MenuItem
          data-cy="unassign_seat"
          leftIconProps={{
            type: 'circle-x-md',
            size: 'md',
          }}
          onClick={onUnassignSeat}
        >
          {t('memberPage.luminSignSeat.unassignSeat')}
        </MenuItem>
      );
    }

    return (
      <>
        {myRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && (
          <MenuItem
            data-cy="transfer_owner"
            leftIconProps={{
              type: 'user-owner-md',
              size: 'md',
            }}
            onClick={onTransferOwner}
          >
            {textMakeText(t('roleText.orgAdmin'))}
          </MenuItem>
        )}
        {organizationServices.isManager(myRole) && isMemberRoleUser && (
          <MenuItem
            data-cy="set_member_role"
            leftIconProps={{
              type: 'admin-setting-md',
              size: 'md',
            }}
            onClick={() => onSetMemberRole(ORGANIZATION_ROLES.BILLING_MODERATOR)}
          >
            {textMakeText(t('roleText.billingModerator'))}
          </MenuItem>
        )}
        {myRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && isMemberRoleBillingModerator && (
          <MenuItem
            data-cy="set_member_role"
            leftIconProps={{
              type: 'user-md',
              size: 'md',
            }}
            onClick={() => onSetMemberRole(ORGANIZATION_ROLES.MEMBER)}
          >
            {textMakeText(t('roleText.member'))}
          </MenuItem>
        )}

        {canUnassignSeat && (
          <>
            <Divider orientation="horizontal" my="var(--kiwi-spacing-1)" />
            <MenuItem
              data-cy="unassign_seat"
              leftIconProps={{
                type: 'circle-x-md',
                size: 'md',
              }}
              onClick={onUnassignSeat}
            >
              {t('memberPage.luminSignSeat.unassignSeat')}
            </MenuItem>
          </>
        )}

        <Divider orientation="horizontal" my="var(--kiwi-spacing-1)" />

        <MenuItem
          data-cy="remove_member"
          leftIconProps={{
            type: 'trash-md',
            size: 'md',
          }}
          onClick={onRemoveMember}
        >
          {t('common.remove')}
        </MenuItem>
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <Menu
        opened={opened}
        ComponentTarget={<IconButton data-cy="more_actions_button" icon="dots-vertical-md" size="md" />}
        onChange={setOpened}
        position="bottom-end"
        closeOnItemClick
        closeOnScroll={{ elementRef: bodyScrollRef }}
      >
        {renderMenuItems()}
      </Menu>
    </div>
  );
};

export default React.memo(ActionButton);
