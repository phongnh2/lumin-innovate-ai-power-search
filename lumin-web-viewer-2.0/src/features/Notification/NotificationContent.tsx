import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { NotificationStatus } from 'redux/selectors/notificationSelectors';

import actions from 'actions';
import selectors from 'selectors';

import { userServices } from 'services';

import { INotificationBase } from 'interfaces/notification/notification.interface';

import NotificationHeader from './components/NotificationHeader';
import NotificationList from './components/NotificationList';
import NotificationTabs from './components/NotificationTabs/NotificationTabs';

interface NotificationContentProps {
  error: boolean;
  notifications: INotificationBase[];
  loading: boolean;
  fetchMore: () => void;
  hasNextPage: boolean;
  closePopper: () => void;
}

function NotificationContent({
  error,
  notifications,
  loading,
  fetchMore,
  hasNextPage,
  closePopper,
}: NotificationContentProps) {
  const dispatch = useDispatch();
  const tab = useSelector(selectors.getCurrentNotificationTab);
  const notificationStatus = useSelector(selectors.getUserNotificationStatus, shallowEqual);

  const hasNoti = notificationStatus[tab.toLowerCase() as keyof NotificationStatus].hasNewNoti;

  useEffect(() => {
    const updateSeenNotificationsTab = () => {
      if (!hasNoti) {
        return;
      }
      userServices
        .seenNewNotificationsTab(tab)
        .then((user) => {
          dispatch(actions.updateCurrentUser(user));
        })
        .catch(() => {});
    };
    updateSeenNotificationsTab();
  }, [tab, hasNoti, dispatch]);
  return (
    <>
      <NotificationHeader />
      <NotificationTabs />
      <NotificationList
        error={error}
        notifications={notifications}
        loading={loading}
        fetchMore={fetchMore}
        hasNextPage={hasNextPage}
        closePopper={closePopper}
      />
    </>
  );
}

export default NotificationContent;
