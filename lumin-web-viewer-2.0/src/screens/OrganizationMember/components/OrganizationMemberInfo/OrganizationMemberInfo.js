import { Divider, IconButton, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import { LastJoinedOrgTooltip } from 'luminComponents/LastJoinedOrgTooltip';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import * as Styled from './OrganizationMemberInfo.styled';

import styles from './OrganizationMemberInfo.module.scss';

const propTypes = {
  toggleInfoDialog: PropTypes.func,
  handleLeaveOrg: PropTypes.func,
  toggleEditDialog: PropTypes.func,
  currentUserRole: PropTypes.string.isRequired,
  totalMembers: PropTypes.number,

};

const defaultProps = {
  toggleInfoDialog: () => { },
  handleLeaveOrg: () => { },
  toggleEditDialog: () => { },
  totalMembers: 0,

};

const OrganizationMemberInfo = ({
  toggleInfoDialog, handleLeaveOrg, toggleEditDialog, currentUserRole,
  totalMembers,
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  // eslint-disable-next-line react/prop-types
  const renderPopperContent = ({ closePopper }) => (
    <Styled.List>
      <Styled.Item
        onClick={() => {
          toggleInfoDialog();
          closePopper();
        }}
      >
        <Icomoon className="doc-info" size={16} />
        <Styled.Text>{t('common.orgInfo')}</Styled.Text>
      </Styled.Item>
      <Styled.Divider />
      {organizationServices.isManager(currentUserRole) && (
        <Styled.Item
          onClick={() => {
            toggleEditDialog(true);
            closePopper();
          }}
        >
          <Icomoon className="edit-mode" size={16} />
          <Styled.Text>{t('memberPage.editOrg')}</Styled.Text>
        </Styled.Item>
      )}
      {totalMembers > 1 && (
        <LastJoinedOrgTooltip title={t('orgSettings.tooltipLeaveLastJoinedOrg')} placement="left">
          <Styled.Item onClick={handleLeaveOrg}>
            <Icomoon className="signout" size={16} />
            <Styled.Text>{t('memberPage.leaveOrg')}</Styled.Text>
          </Styled.Item>
        </LastJoinedOrgTooltip>
      )}
    </Styled.List>
  );

  if (isEnableReskin) {
    return (
      <Menu
        classNames={{ dropdown: styles.menuDropdown }}
        ComponentTarget={
          <IconButton icon="dots-vertical-lg" size="lg" iconColor="var(--kiwi-colors-surface-on-surface-variant)" />
        }
        position="bottom-end"
      >
        <MenuItem leftIconProps={{ type: 'info-circle-md' }} onClick={() => toggleInfoDialog()}>
          {t('common.orgInfo')}
        </MenuItem>
        <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        {organizationServices.isManager(currentUserRole) && (
          <MenuItem leftIconProps={{ type: 'pencil-md' }} onClick={() => toggleEditDialog(true)}>
            {t('memberPage.editOrg')}
          </MenuItem>
        )}
        {totalMembers > 1 && (
          <LastJoinedOrgTooltip
            title={t('orgSettings.tooltipLeaveLastJoinedOrg')}
            placement="bottom"
            isReskin
            maxWidth={218}
          >
            <MenuItem leftIconProps={{ type: 'logout-md' }} onClick={handleLeaveOrg}>
              {t('memberPage.leaveOrg')}
            </MenuItem>
          </LastJoinedOrgTooltip>
        )}
      </Menu>
    );
  }
  return (
    <Styled.PopperButton
      renderPopperContent={renderPopperContent}
      popperProps={{
        placement: 'bottom-end',
      }}
    >
      <Icomoon className="more-v" size={14} />
    </Styled.PopperButton>
  );
};

OrganizationMemberInfo.propTypes = propTypes;
OrganizationMemberInfo.defaultProps = defaultProps;

export default OrganizationMemberInfo;
