import React from 'react';
import { useSelector } from 'react-redux';

import { NotificationTabs } from 'constants/notificationConstant';
import selectors from 'selectors';

import EmptyGeneralNotification from './components/EmptyGeneralNotification';
import EmptyInviteNotification from './components/EmptyInviteNotification';

const EMPTY_TAB_MAPPING = {
  [NotificationTabs.GENERAL]: EmptyGeneralNotification,
  [NotificationTabs.INVITES]: EmptyInviteNotification,
  [NotificationTabs.REQUESTS]: EmptyInviteNotification,
};

function EmptyNotification() {
  const tab = useSelector(selectors.getCurrentNotificationTab);

  const Component = EMPTY_TAB_MAPPING[tab];

  return Component && <Component tab={tab} />;
}

export default EmptyNotification;
