import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useLatest } from 'react-use';

import { SUB_NEW_NOTIFICATIONS, SUB_DEL_NOTIFICATION } from 'graphQL/NotificationGraph';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import NotificationContainer from 'luminComponents/NotificationContainer';

import { useConvertedOrganization } from 'hooks';

import { organizationServices } from 'services';
import { updateNotificationsCache } from 'services/graphServices/notification';

import { NotiOrg } from 'constants/notificationConstant';

import NotificationPanelTheme from 'theme-providers/NotificationPanelTheme';

NotificationGroup.propTypes = {
  error: PropTypes.object,
  fetchMore: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  subscribeToMore: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  notifications: PropTypes.array,
  hasNextPage: PropTypes.bool,
  cursor: PropTypes.string,
};

NotificationGroup.defaultProps = {
  error: null,
  notifications: [],
  hasNextPage: false,
  cursor: '',
};

function NotificationGroup({
  fetchMore,
  error,
  loading,
  subscribeToMore,
  refetch,
  notifications,
  hasNextPage,
  cursor,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const tab = useSelector(selectors.getCurrentNotificationTab);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const tabRef = useLatest(tab);
  const locationRef = useLatest(location);
  const navigateRef = useLatest(navigate);

  useConvertedOrganization(refetch);

  const fetchMoreData = useCallback(
    () =>
      fetchMore({
        variables: {
          input: {
            cursor,
            tab,
          },
        },
        updateQuery: (prev, { fetchMoreResult: { notifications: updatedNotifications } }) => {
          if (!updatedNotifications) {
            return prev;
          }
          return {
            notifications: {
              ...prev.notifications,
              cursor: updatedNotifications.cursor,
              hasNextPage: updatedNotifications.hasNextPage,
              notifications: [...prev.notifications.notifications, ...updatedNotifications.notifications],
            },
          };
        },
      }),
    [cursor, fetchMore, tab]
  );

  useEffect(() => {
    const handleShouldUpdateInnerMembersListInOrg = (notiOrganizationId, targetDataChanged, notiActionType) => {
      const { _id: organizationId } = selectors.getCurrentOrganization(store.getState()).data || {};
      if (organizationId !== notiOrganizationId) {
        return;
      }

      organizationServices.handleShouldUpdateInnerMembersListInOrganization(
        targetDataChanged, notiActionType, navigateRef.current, locationRef.current);
    };

    const handleUpdateNotificationWithActionType = (newNotification) => {
      const isCurrentUser = newNotification.target?.targetId === currentUser._id;
      const notiOrganizationId = newNotification.entity?.id;

      switch (newNotification.actionType) {
        case NotiOrg.UPDATE_USER_ROLE: {
          handleShouldUpdateInnerMembersListInOrg(
            notiOrganizationId,
            newNotification.target,
            newNotification.actionType
          );
          break;
        }
        case NotiOrg.REMOVE_MEMBER: {
          if (isCurrentUser) {
            dispatch(actions.removeOrganizationInListById(notiOrganizationId));
          } else {
            handleShouldUpdateInnerMembersListInOrg(
              notiOrganizationId,
              newNotification.target,
              newNotification.actionType
            );
          }
          break;
        }
        case NotiOrg.LEAVE_ORG: {
          if (isCurrentUser) {
            dispatch(actions.removeOrganizationInListById(notiOrganizationId));
          } else {
            handleShouldUpdateInnerMembersListInOrg(
              notiOrganizationId,
              newNotification.actor,
              newNotification.actionType
            );
          }
          break;
        }
        default:
          break;
      }
    };
    let terminate = () => {};
    if (!loading) {
      terminate = subscribeToMore({
        document: SUB_NEW_NOTIFICATIONS,
        variables: {
          input: {
            userId: currentUser._id,
          },
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev;
          }
          const newNotificationItem = subscriptionData.data.newNotification;
          dispatch(actions.increaseNewNotificationCounter(newNotificationItem.tab));

          handleUpdateNotificationWithActionType(newNotificationItem);

          if (tabRef.current !== newNotificationItem.tab) {
            updateNotificationsCache((draft) => {
              draft.unshift(newNotificationItem);
            }, newNotificationItem.tab);
            return prev;
          }

          return {
            notifications: {
              ...prev.notifications,
              notifications: [newNotificationItem, ...prev.notifications.notifications],
            },
          };
        },
      });
    }

    return () => {
      terminate();
    };
  }, [currentUser._id, dispatch, subscribeToMore, loading]);

  useEffect(() => {
    let terminate = () => {};
    if (!loading) {
      terminate = subscribeToMore({
        document: SUB_DEL_NOTIFICATION,
        variables: {
          input: {
            userId: currentUser._id,
          },
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev;
          }

          const { notificationId: deletedNotificationId, tab: notiTab } = subscriptionData.data.deleteNotification;
          dispatch(actions.decreaseNewNotificationCounter(notiTab));
          if (tabRef.current !== notiTab) {
            updateNotificationsCache((draft) => draft.filter((item) => item._id !== deletedNotificationId), notiTab);
            return prev;
          }

          const newNotifications = prev.notifications.notifications.filter(
            (item) => item._id !== deletedNotificationId
          );
          return {
            notifications: {
              ...prev.notifications,
              notifications: newNotifications,
            },
          };
        },
      });
    }

    return () => {
      terminate();
    };
  }, [currentUser._id, subscribeToMore, dispatch, loading]);

  return (
    <NotificationPanelTheme>
      <NotificationContainer
        fetchMoreData={fetchMoreData}
        notifications={notifications}
        loading={loading}
        error={Boolean(error)}
        hasNextPage={hasNextPage}
      />
    </NotificationPanelTheme>
  );
}

export default NotificationGroup;
