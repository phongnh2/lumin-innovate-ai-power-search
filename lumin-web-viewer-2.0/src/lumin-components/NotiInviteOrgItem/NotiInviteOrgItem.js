import React from 'react';
import PropTypes from 'prop-types';
import { NotificationTabs, NotiOrg } from 'constants/notificationConstant';
import InviteToJoin from './components/InviteToJoin';

NotiInviteOrgItem.propTypes = {
  notification: PropTypes.object,
  currentUser: PropTypes.object,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

NotiInviteOrgItem.defaultProps = {
  notification: {},
  currentUser: {},
  open: false,
  setOpen: () => {},
};

function NotiInviteOrgItem(props) {
  const {
    notification, currentUser, open, setOpen,
  } = props;
  const maps = {
    [NotiOrg.INVITE_JOIN]: (
      <InviteToJoin notification={notification} currentUser={currentUser} open={open} onClose={() => setOpen(false)} />
    ),
  };
  /**
   * must return null to fallback incorrect organization notification type
   */
  return notification.tab === NotificationTabs.INVITES && maps[notification.actionType] || null;
}

export default NotiInviteOrgItem;
