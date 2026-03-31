import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Icomoon from 'lumin-components/Icomoon';
import MaterialPopper from 'lumin-components/MaterialPopper';

import { useTranslation } from 'hooks';

import { commonUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ORGANIZATION_ROLES, ORG_ROLE_KEY } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import * as Styled from './MemberRoleOrganizationPopper.styled';

const defaultProps = {
  open: false,
  anchorEl: null,
  handleClose: () => { },
  currentRole: '',
  onSelected: () => { },
  parentOverflow: 'viewport',
  inviterUserRole: '',
  containerElementId: '',
};

const propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  currentRole: PropTypes.string,
  onSelected: PropTypes.func,
  parentOverflow: PropTypes.oneOf(['scrollParent', 'viewport', 'disabled', 'window']),
  inviterUserRole: PropTypes.string,
  containerElementId: PropTypes.string,
};

function MemberRoleOrganizationPopper(props) {
  const {
    open,
    anchorEl,
    handleClose,
    currentRole,
    onSelected,
    parentOverflow,
    inviterUserRole,
    containerElementId
  } = props;
  const roles = inviterUserRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER
    ? [ORGANIZATION_ROLES.MEMBER] : [ORGANIZATION_ROLES.BILLING_MODERATOR, ORGANIZATION_ROLES.MEMBER];
  const rolesIcons = {
    [ORGANIZATION_ROLES.BILLING_MODERATOR]: 'moderator',
    [ORGANIZATION_ROLES.MEMBER]: 'user',
  };
  const { t } = useTranslation();

  const modifiers = useMemo(() => {
    const containerElement = document.getElementById(containerElementId);
    if (!containerElement) {
      return [];
    }

    return [
      {
        name: 'flip',
        enabled: true,
        options: {
          altBoundary: true,
          boundary: containerElement,
          rootBoundary: parentOverflow,
        },
      },
      {
        name: 'preventOverflow',
        enabled: true,
        options: {
          boundary: containerElement,
          altAxis: true,
          altBoundary: true,
          tether: false,
          rootBoundary: parentOverflow,
        },
      },
    ];
  }, [containerElementId, parentOverflow]);

  return (
    <MaterialPopper
      open={open}
      anchorEl={anchorEl}
      handleClose={handleClose}
      placement="bottom-end"
      parentOverflow={parentOverflow}
      modifiers={modifiers}
    >
      <Styled.Menu>
        {roles.map((role) =>
          currentRole === role ? null : (
            <Styled.Item
              key={role}
              onClick={() => onSelected(role)}
              data-lumin-btn-name={ButtonName[`INVITE_MEMBER_MODAL_MAKE_${role}`]}
            >
              <Icomoon className={`${rolesIcons[role]}`} size={16} color={Colors.NEUTRAL_80} />
              <Styled.Text>
                {commonUtils.formatTitleCaseByLocale(t('memberPage.makeOrg', { orgText: t(ORG_ROLE_KEY[role]) }))}
              </Styled.Text>
            </Styled.Item>
          )
        )}
        <Styled.Item
          id="remove-member"
          key="remove"
          onClick={() => onSelected('remove')}
          data-lumin-btn-name={ButtonName.INVITE_MEMBER_MODAL_REMOVE}
        >
          <Icomoon className="trash" size={16} color={Colors.NEUTRAL_80} />
          <Styled.Text>{t('common.remove')}</Styled.Text>
        </Styled.Item>
      </Styled.Menu>
    </MaterialPopper>
  );
}

MemberRoleOrganizationPopper.propTypes = propTypes;
MemberRoleOrganizationPopper.defaultProps = defaultProps;

export default MemberRoleOrganizationPopper;
