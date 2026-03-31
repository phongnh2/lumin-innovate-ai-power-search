import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { Avatar, Button, Icomoon, Menu, Text, Checkbox as KiwiCheckbox } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { css } from 'styled-components';

import UserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import selectors from 'selectors';

import ButtonPermission from 'lumin-components/ButtonPermission';
import RequestAccessButtonGroup from 'lumin-components/RequestAccessButtonGroup';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import { ShareModalContext } from 'lumin-components/ShareModal/ShareModalContext';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import PopperButton from 'luminComponents/PopperButton';
import SvgElement from 'luminComponents/SvgElement';

import { avatar } from 'utils';
import { getDocumentRoleIndex } from 'utils/permission';

import { DocumentRole, UserSharingType } from 'constants/documentConstants';
import { DOCUMENT_ROLES, THEME_MODE } from 'constants/lumin-common';

import SharePermissionPopover from './components/SharePermissionPopover';

import './ShareListItem.scss';
import styles from './ShareListItem.module.scss';

const getPermissionsText = (t) => ({
  spectator: t('sharePermission.canView'),
  viewer: t('sharePermission.canComment'),
  editor: t('sharePermission.canEdit'),
  sharer: t('sharePermission.canShare'),
  owner: t('sharePermission.docOwner'),
});

const propTypes = {
  highlight: PropTypes.bool,
  member: PropTypes.object,
  className: PropTypes.string,
  canShare: PropTypes.bool,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  primaryText: PropTypes.node,
  handleAccept: PropTypes.func,
  handleReject: PropTypes.func,
  isTransfering: PropTypes.bool,
  requestLoading: PropTypes.bool,
  checkboxProps: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      onChange: PropTypes.func,
      checked: PropTypes.bool,
      disabled: PropTypes.bool,
    }),
  ]),
  disabled: PropTypes.bool,
  currentUser: PropTypes.object,
  t: PropTypes.func,
  isEnableReskin: PropTypes.bool,
  scrollElement: PropTypes.instanceOf(HTMLElement),
};

const defaultProps = {
  highlight: false,
  member: {},
  className: '',
  canShare: false,
  themeMode: THEME_MODE.LIGHT,
  primaryText: undefined,
  isTransfering: false,
  requestLoading: false,
  handleAccept: () => {},
  handleReject: () => {},
  checkboxProps: false,
  disabled: false,
  currentUser: {},
  t: () => {},
  isEnableReskin: false,
  scrollElement: null,
};
class ShareListItem extends React.PureComponent {
  isRequestAccess = () => this.props.member.type === UserSharingType.REQUEST_ACCESS;

  isMe = () => {
    const { member, currentUser } = this.props;
    return member._id === currentUser._id;
  };

  hasHigherPermission = () => {
    const { member } = this.props;
    const { userRole } = this.context;
    return getDocumentRoleIndex(userRole) < getDocumentRoleIndex(member.role);
  };

  canUpdatePermission = () => !this.isMe() && this.props.canShare && this.hasHigherPermission();

  renderExternalMemberInfo = () => {
    const {
      member,
      themeMode,
      handleAccept,
      handleReject,
      requestLoading,
      isTransfering,
      t,
      isEnableReskin,
      scrollElement,
    } = this.props;
    const { handleChangePermission, handleRemoveMember, userRole } = this.context;
    const permissions = getPermissionsText(t);

    if (this.isRequestAccess()) {
      const isSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(userRole.toLowerCase());
      return (
        isSharer && (
          <RequestAccessButtonGroup
            loading={requestLoading || isTransfering}
            handleAccept={handleAccept}
            handleReject={handleReject}
          />
        )
      );
    }

    if (isEnableReskin) {
      const extraMenuProps = scrollElement
        ? {
            closeOnScroll: {
              elementRef: { current: scrollElement },
            },
          }
        : {};
      return this.canUpdatePermission() ? (
        <Menu
          position="bottom-end"
          width={180}
          ComponentTarget={
            <Button
              variant="text"
              endIcon={<Icomoon type="chevron-down-md" size="md" />}
              data-cy="share_permision_selector"
            >
              {permissions[member.role]}
            </Button>
          }
          padding="var(--kiwi-spacing-1)"
          {...extraMenuProps}
        >
          <SharePermissionPopover
            value={member.role}
            handleChangePermission={(role) => handleChangePermission(member, role)}
            handleRemoveMember={() => handleRemoveMember(member)}
            canDelete
            /**
             * @deprecated
             * Remove after releasing the 100% reskin
             */
            closePopper={() => {}}
          />
        </Menu>
      ) : (
        <Text type="label" size="md" className={styles.roleText}>
          {permissions[member.role]}
        </Text>
      );
    }

    return this.canUpdatePermission() ? (
      <PopperButton
        ButtonComponent={ButtonPermission}
        popperProps={{
          placement: 'bottom-end',
          disablePortal: false,
          parentOverflow: 'viewport',
          classes: `theme-${themeMode}`,
        }}
        renderPopperContent={({ closePopper }) => (
          <SharePermissionPopover
            value={member.role}
            closePopper={closePopper}
            handleChangePermission={(role) => handleChangePermission(member, role)}
            handleRemoveMember={() => handleRemoveMember(member)}
            canDelete
          />
        )}
      >
        {permissions[member.role]}
      </PopperButton>
    ) : (
      <span className="ShareListItem__role">{permissions[member.role]}</span>
    );
  };

  render() {
    const { member, className, primaryText, requestLoading, highlight, checkboxProps, disabled, isEnableReskin, t } =
    this.props;
    const permissions = getPermissionsText(t);

    if (!member) {
      return null;
    }

    const isLuminUser = Boolean(member.name);
    const wordYou = this.isMe() ? ` (${t('common.you').toLowerCase()})` : '';
    const getName = () => {
      if (primaryText) {
        return (
          <>
            {primaryText}
            {wordYou}
          </>
        );
      }

      return (
        <Text type="title" size="sm" className={classNames(styles.text, { [styles.pendingUser]: !isLuminUser })}>
          {isLuminUser ? member.name + wordYou : t('memberPage.pendingUser')}
        </Text>
      );
    };

    if (isEnableReskin) {
      return (
        <div className={styles.wrapper} data-cy={`share_list_item_${member._id}`}>
          {!isEmpty(checkboxProps) && (
            <KiwiCheckbox
              checked={checkboxProps.checked}
              onChange={checkboxProps.onChange}
              disabled={checkboxProps.disabled}
              borderColor="var(--kiwi-colors-surface-outline)"
              className={styles.checkbox}
              data-cy="checkbox"
            />
          )}
          <div
            className={classNames(styles.shareListItem, className)}
            data-disabled={requestLoading || disabled}
            data-highlight={highlight}
            data-selected={checkboxProps?.checked}
          >
            <div className={styles.container}>
              <Avatar
                variant="outline"
                size="sm"
                src={isLuminUser ? avatar.getAvatar(member.avatarRemoteId) : UserAvatar}
                name={isLuminUser && member.name}
                alt="User Avatar"
              />
              <div className={styles.textWrapper}>
                {getName()}
                <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-low)" className={styles.text}>
                  {member.email}
                </Text>
              </div>
            </div>
            <div className={styles.permissions}>
              {member.role.toUpperCase() === DOCUMENT_ROLES.OWNER ? (
                <Text type="label" size="md" className={classNames(styles.docOwner, styles.roleText)}>
                  {permissions[member.role]}
                </Text>
              ) : (
                this.renderExternalMemberInfo()
              )}
            </div>
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
        <ListItem
          className={classNames('ShareListItem', className, {
            'ShareListItem--disabled': requestLoading || disabled,
            'ShareListItem--highlight': highlight,
            'ShareListItem--selected': checkboxProps?.checked,
          })}
        >
          <Grid container>
            <Grid item xs={this.isRequestAccess() ? 12 : 8} sm={9}>
              <div className="ShareListItem__row">
                {isLuminUser ? (
                  <MaterialAvatar
                    hasBorder
                    containerClasses="ShareListItem__row__avatar"
                    size={32}
                    src={avatar.getAvatar(member.avatarRemoteId)}
                  >
                    {avatar.getTextAvatar(member.name)}
                  </MaterialAvatar>
                ) : (
                  <SvgElement
                    className="ShareListItem__pendingUserImage"
                    width={36}
                    height={36}
                    content="invited-user"
                    alt="Invited user"
                  />
                )}

                <div className="ShareListItem__row__text">
                  <div
                    className={classNames('primary', {
                      'pending-user': !isLuminUser,
                    })}
                  >
                    <Typography noWrap>
                      {primaryText || (isLuminUser ? member.name : t('memberPage.pendingUser'))} {this.isMe() && `(${t('common.you').toLowerCase()})`}
                    </Typography>
                  </div>
                  <div className="secondary">
                    <Typography noWrap>{member.email}</Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={this.isRequestAccess() ? 12 : 4} sm={3}>
              <div
                className={classNames('ShareListItem__permission', {
                  'ShareListItem__permission--request': this.isRequestAccess(),
                })}
              >
                {member.role.toUpperCase() === DOCUMENT_ROLES.OWNER ? (
                  <span className="ShareListItem__role ShareListItem__role--owner">{permissions[member.role]}</span>
                ) : (
                  this.renderExternalMemberInfo()
                )}
              </div>
            </Grid>
          </Grid>
        </ListItem>
      </div>
    );
  }
}

ShareListItem.propTypes = propTypes;
ShareListItem.defaultProps = defaultProps;
ShareListItem.contextType = ShareModalContext;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default compose(connect(mapStateToProps), withTranslation())(ShareListItem);
