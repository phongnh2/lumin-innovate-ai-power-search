import { IconButton, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import useHandleInviteLink from '../hooks/useHandleInviteLink';
import styles from '../InviteLink.module.scss';

const LinkSettings = () => {
  const { t } = useTranslation();
  const { onClickRegenerateInviteLink, roleIsMember, onClickDeactivateInviteLink, onClickChangeRole } =
    useHandleInviteLink();

  const renderChangeRoleItem = () => {
    if (roleIsMember) {
      return (
        <MenuItem
          leftIconProps={{ type: 'admin-setting-md' }}
          onClick={() => onClickChangeRole(ORGANIZATION_ROLES.BILLING_MODERATOR)}
          data-cy="change_role_admin_item"
          data-lumin-btn-name={ButtonName.CHANGE_ROLE_INVITE_LINK}
        >
          {t('inviteLink.inviteAsAdmin')}
        </MenuItem>
      );
    }
    return (
      <MenuItem
        leftIconProps={{ type: 'user-md' }}
        onClick={() => onClickChangeRole(ORGANIZATION_ROLES.MEMBER)}
        data-cy="change_role_member_item"
        data-lumin-btn-name={ButtonName.CHANGE_ROLE_INVITE_LINK}
      >
        {t('inviteLink.inviteAsMember')}
      </MenuItem>
    );
  };

  return (
    <Menu
      ComponentTarget={
        <IconButton
          className={styles.settingsButton}
          icon="settings-md"
          size="md"
          data-cy="invite_link_settings_button"
        />
      }
      position="bottom-start"
      classNames={{ dropdown: styles.menuDropdown }}
    >
      {renderChangeRoleItem()}
      <MenuItem
        leftIconProps={{ type: 'reload-md' }}
        onClick={onClickRegenerateInviteLink}
        data-cy="regenerate_link_item"
        data-lumin-btn-name={ButtonName.REGENERATE_INVITE_LINK}
      >
        {t('inviteLink.regenerateLink')}
      </MenuItem>
      <MenuItem
        leftIconProps={{ type: 'trash-lg' }}
        onClick={onClickDeactivateInviteLink}
        data-cy="deactivate_link_item"
        data-lumin-btn-name={ButtonName.DISABLE_INVITE_LINK}
      >
        {t('inviteLink.deactivateLink')}
      </MenuItem>
    </Menu>
  );
};

export default LinkSettings;
