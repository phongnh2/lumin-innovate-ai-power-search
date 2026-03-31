import Grid from '@mui/material/Grid';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { Avatar, Text, Checkbox as KiwiCheckbox } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { css } from 'styled-components';

import UserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import { Checkbox } from 'lumin-components/Shared/Checkbox';
import Tooltip from 'lumin-components/Shared/Tooltip';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import SvgElement from 'luminComponents/SvgElement';

import { useTabletMatch, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { avatar } from 'utils';

import { UserStatus } from 'constants/lumin-common';
import { OrganizationRoles } from 'constants/organization.enum';
import { ORGANIZATION_ROLE_TEXT, SHOW_USER_ROLE_RESOLUTION, ORGANIZATION_ROLES } from 'constants/organizationConstants';

import styles from '../ShareListItem/ShareListItem.module.scss';

import './MemberItem.scss';

const propTypes = {
  highlight: PropTypes.bool,
  user: PropTypes.object,
  rightElement: PropTypes.node,
  containerStyle: PropTypes.object,
  active: PropTypes.bool,
  hover: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  moreRightElement: PropTypes.bool,
  size: PropTypes.oneOf(['medium', 'large']),
  className: PropTypes.string,
  isShowUserRole: PropTypes.bool,
  isOwner: PropTypes.bool,
  selfControl: PropTypes.bool,
  customLeftSpacing: PropTypes.number,
  customRightSpacing: PropTypes.number,
  fontSize: PropTypes.number,
  isMe: PropTypes.bool,
  primaryText: PropTypes.node,
  isRequestAccess: PropTypes.bool,
  checkboxProps: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      onChange: PropTypes.func,
      checked: PropTypes.bool,
    }),
  ]),
  isReskin: PropTypes.bool,
};

const defaultProps = {
  highlight: false,
  user: {},
  rightElement: undefined,
  containerStyle: {},
  hover: true,
  active: false,
  disabled: false,
  onClick: () => {},
  moreRightElement: false,
  size: 'medium',
  className: '',
  isShowUserRole: false,
  isOwner: false,
  selfControl: false,
  customLeftSpacing: null,
  customRightSpacing: null,
  fontSize: 12,
  isMe: false,
  primaryText: undefined,
  isRequestAccess: false,
  checkboxProps: undefined,
  isReskin: false,
};

const renderTeamAdminRoleText = (type, t) =>
  type === SHOW_USER_ROLE_RESOLUTION.PC ? `(${t('common.teamAdmin')})` : t('common.teamAdmin');

const MemberItem = ({
  highlight,
  user,
  rightElement,
  moreRightElement,
  containerStyle,
  hover,
  active,
  disabled,
  onClick,
  size,
  fontSize,
  className,
  isShowUserRole,
  isOwner,
  selfControl,
  customLeftSpacing,
  customRightSpacing,
  isMe,
  primaryText,
  isRequestAccess,
  checkboxProps,
  isReskin,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const { t } = useTranslation();
  const isTabletMatched = useTabletMatch();
  const avatarSize = size === 'medium' ? 32 : 40;
  const isMemberRole = user.role === ORGANIZATION_ROLES.MEMBER;
  const isTeamAdmin = user.role === ORGANIZATION_ROLES.TEAM_ADMIN;
  const pendingLabel =
    user.status === UserStatus.UNAVAILABLE
      ? t('orgDashboardSecurity.unavailable')
      : t('orgDashboardSecurity.pendingUser');

  const leftSpacing = () => {
    if (selfControl) {
      return isTabletMatched ? 9 : 8;
    }
    if (rightElement) {
      return moreRightElement ? 7 : 8;
    }
    return 12;
  };

  const rightSpacing = () => {
    if (selfControl) {
      return isTabletMatched ? 3 : 4;
    }
    return moreRightElement ? 5 : 4;
  };

  const renderUserRoleText = (type) => {
    const userRoleText =
      type === SHOW_USER_ROLE_RESOLUTION.PC
        ? `(${t(ORGANIZATION_ROLE_TEXT[user.role])})`
        : t(ORGANIZATION_ROLE_TEXT[user.role]);
    return !isMemberRole && userRoleText;
  };

  const renderOwnerRole = (type) =>
    organizationServices.isManager(user.role)
      ? renderUserRoleText(type)
      : isTeamAdmin && renderTeamAdminRoleText(type, t);

  const renderUserRole = (type) => {
    const userRoleElement = isOwner ? renderOwnerRole(type) : renderUserRoleText(type);
    const getClassName = () => {
      if (isReskin) {
        return classNames(
          user?.role?.toLowerCase() === OrganizationRoles.ORGANIZATION_ADMIN ? styles.orgOwnerRole : styles.adminRole
        );
      }
      return classNames(`MemberItem__roleText ${type} MemberItem__roleText--${user?.role?.toLowerCase()}`, {
        'MemberItem__roleText--owner': isOwner,
      });
    };
    return isShowUserRole && <span className={getClassName()}>{userRoleElement}</span>;
  };

  const avatarElement = user.name ? (
    <MaterialAvatar
      containerClasses="MemberItem__rowAvatar"
      size={avatarSize}
      fontSize={fontSize}
      src={avatar.getAvatar(user.avatarRemoteId)}
    >
      {avatar.getTextAvatar(user.name)}
    </MaterialAvatar>
  ) : (
    <SvgElement
      content="invited-user"
      alt="Invited user"
      className="MemberItem__avatar"
      styleInline
      width={avatarSize}
      height={avatarSize}
    />
  );

  const nameElement = user.name ? (
    <div className="MemberItem__textContainer">
      <p className="MemberItem__text ellipsis">
        {' '}
        <Tooltip placement="top" title={user.name}>
          <b>{user.name}</b>
        </Tooltip>{' '}
        {isMe && `(${t('common.you').toLowerCase()})`}
      </p>
      {renderUserRole(SHOW_USER_ROLE_RESOLUTION.PC)}
    </div>
  ) : (
    <p className="MemberItem__text MemberItem__text-pending">{pendingLabel}</p>
  );

  const name = user.name ? (
    <>
      <Tooltip placement="top" title={user.name}>
        <b>{user.name}</b>
      </Tooltip>{' '}
      {isMe && `(${t('common.you').toLowerCase()})`}&nbsp;
      {renderUserRole(SHOW_USER_ROLE_RESOLUTION.PC)}
    </>
  ) : (
    pendingLabel
  );

  if (isReskin) {
    return (
      <div className={styles.wrapper} data-cy={`share_list_item_${user._id}`}>
        {!isEmpty(checkboxProps) && (
          <KiwiCheckbox
            checked={checkboxProps.checked}
            onChange={checkboxProps.onChange}
            disabled={checkboxProps.disabled}
            borderColor="var(--kiwi-colors-surface-outline)"
            className={styles.checkbox}
          />
        )}
        <div
          className={classNames(styles.shareListItem)}
          data-disabled={disabled}
          data-highlight={highlight}
          data-selected={checkboxProps?.checked || active}
        >
          <div className={styles.container}>
            <Avatar
              variant="outline"
              size="sm"
              src={user.name ? avatar.getAvatar(user.avatarRemoteId) : UserAvatar}
              name={user.name}
              alt="User Avatar"
            />
            <div className={styles.textWrapper}>
              {primaryText || (
                <Text type="title" size="sm" className={classNames(styles.text, { [styles.pendingUser]: !user.name })}>
                  {name}
                </Text>
              )}
              <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-low)" className={styles.text}>
                {user.email}
              </Text>
            </div>
          </div>
          {rightElement && <div className={styles.permissions}>{rightElement}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        margin: 2px 0;
      `}
    >
      {!isEmpty(checkboxProps) && (
        <Checkbox
          alignLeft
          checked={checkboxProps.checked}
          onChange={checkboxProps.onChange}
          disabled={checkboxProps.disabled}
        />
      )}
      <div
        role="button"
        tabIndex={0}
        key={user.email}
        onClick={onClick}
        className={classNames(`MemberItem ${className}`, {
          'MemberItem--hover': hover,
          'MemberItem--active': active,
          'MemberItem--disabled': disabled,
          'MemberItem--highlight': highlight,
          'MemberItem--selected': checkboxProps?.checked,
        })}
        style={containerStyle}
      >
        <Grid container alignItems="center">
          <Grid
            item
            xs={customLeftSpacing || (isRequestAccess ? 12 : leftSpacing())}
            sm={customLeftSpacing || leftSpacing()}
          >
            <div className="MemberItem__row">
              {avatarElement}
              <div className="MemberItem__rowText ellipsis">
                {primaryText ? <div className="MemberItem__text">{primaryText}</div> : nameElement}
                {renderUserRole(SHOW_USER_ROLE_RESOLUTION.MOBILE)}
                <p className="MemberItem__text ellipsis MemberItem__text--secondary">{user.email}</p>
              </div>
            </div>
          </Grid>
          {rightElement && (
            <Grid
              item
              xs={customLeftSpacing || (isRequestAccess ? 12 : rightSpacing())}
              sm={customRightSpacing || rightSpacing()}
            >
              <div
                className={classNames('MemberItem__right-container', {
                  'MemberItem__right-container--request-access': isRequestAccess,
                })}
              >
                {rightElement}
              </div>
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
};

MemberItem.propTypes = propTypes;
MemberItem.defaultProps = defaultProps;

export default MemberItem;
