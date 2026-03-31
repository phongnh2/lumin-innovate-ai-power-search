import { Button, Menu, Icomoon, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ORGANIZATION_ROLES, ORG_ROLE_KEY } from 'constants/organizationConstants';

import styles from './MemberRoleOrganizationMenu.module.scss';

interface MemberRoleOrganizationMenuProps {
  open?: boolean;
  anchorEl?: HTMLElement | null;
  handleClose?: () => void;
  currentRole: string;
  onChangeRole: (props: any) => void;
  onSelect?: () => void;
  onClose?: () => void;
  parentOverflow?: string;
  inviterUserRole?: string;
  containerElementId?: string;
  user?: {
    role: string;
    email: string;
  };
}

function MemberRoleOrganizationMenu(
  props: MemberRoleOrganizationMenuProps = {
    open: false,
    anchorEl: null,
    handleClose: () => {},
    currentRole: '',
    onChangeRole: () => {},
    onSelect: () => {},
    onClose: () => {},
    parentOverflow: 'scrollParent',
    inviterUserRole: '',
    user: {
      role: '',
      email: '',
    },
  }
): JSX.Element {
  const { open, currentRole, onChangeRole, inviterUserRole, user, onSelect, onClose } = props;
  const roles =
    inviterUserRole?.toUpperCase() === ORGANIZATION_ROLES.MEMBER
      ? [ORGANIZATION_ROLES.MEMBER]
      : [ORGANIZATION_ROLES.BILLING_MODERATOR, ORGANIZATION_ROLES.MEMBER];
  const rolesIcons = {
    [ORGANIZATION_ROLES.BILLING_MODERATOR]: 'admin-setting-md',
    [ORGANIZATION_ROLES.MEMBER]: 'user-md',
  };
  const { t } = useTranslation();

  const isAdmin = organizationServices.isOrgAdmin(user.role);

  if (isAdmin) {
    return (
      <Button size="md" variant="text" disabled>
        {t(ORG_ROLE_KEY[currentRole])}
      </Button>
    );
  }

  return (
    <Menu
      ComponentTarget={
        <Button size="md" variant="text" endIcon={<Icomoon type="chevron-down-md" size="md" />} onClick={onSelect}>
          {t(ORG_ROLE_KEY[currentRole])}
        </Button>
      }
      position="bottom-end"
      classNames={{
        dropdown: styles.dropdown,
      }}
      onClose={onClose}
      opened={open}
    >
      {roles.map((role: keyof typeof ORGANIZATION_ROLES) =>
        currentRole === role ? null : (
          <MenuItem
            key={role}
            onClick={() => onChangeRole({ role, user })}
            data-lumin-btn-name={ButtonName[`INVITE_MEMBER_MODAL_MAKE_${role}` as keyof typeof ButtonName]}
            leftIconProps={{ size: 'md', type: rolesIcons[role] }}
          >
            {t(ORG_ROLE_KEY[role])}
          </MenuItem>
        )
      )}
      <MenuItem
        id="remove-member"
        key="remove"
        onClick={() => onChangeRole({ role: 'remove', user })}
        data-lumin-btn-name={ButtonName.INVITE_MEMBER_MODAL_REMOVE}
        leftIconProps={{ size: 'md', type: 'trash-md' }}
      >
        {t('common.remove')}
      </MenuItem>
    </Menu>
  );
}

export default MemberRoleOrganizationMenu;
