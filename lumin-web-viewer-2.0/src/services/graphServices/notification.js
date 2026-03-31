import cloneDeep from 'lodash/cloneDeep';
import produce from 'immer';
import {
  READ_NOTIFICATIONS,
  GET_NOTIFICATIONS,
  READ_ALL_NOTIFICATIONS,
  REJECT_INVITATION,
  GET_NOTIFICATION_BY_ID,
} from 'graphQL/NotificationGraph';
import { client } from '../../apollo';

export function markReadNotifications(notificationIds) {
  return client.mutate({
    mutation: READ_NOTIFICATIONS,
    variables: {
      input: {
        notificationIds,
      },
    },
  });
}
/**
 * Update notification using immer
 * @param {Function} decorator (draft) => {}
 * @param {String} tab NotificationTabs
 */
export function updateNotificationsCache(decorator, tab) {
  const oldNotifications = client.readQuery({
    query: GET_NOTIFICATIONS,
    variables: {
      input: {
        cursor: '',
        tab,
      },
    },
  });
  const notificationsClone = cloneDeep(oldNotifications);
  if (!notificationsClone) {
    return;
  }
  client.writeQuery({
    query: GET_NOTIFICATIONS,
    variables: {
      input: {
        cursor: '',
        tab,
      },
    },
    data: {
      ...notificationsClone,
      notifications: {
        ...notificationsClone.notifications,
        notifications: produce(notificationsClone.notifications.notifications, decorator),
      },
    },
  });
}

export function markReadAllNotifications() {
  return client.mutate({
    mutation: READ_ALL_NOTIFICATIONS,
  });
}

export function rejectJoinedOrgInvitation(input) {
  return client.mutate({
    mutation: REJECT_INVITATION,
    variables: {
      input,
    },
  });
}

export function getNotificationById(notificationId) {
  return client.query({
    query: GET_NOTIFICATION_BY_ID,
    variables: {
      notificationId,
    },
  });
}
export default {
  markReadNotifications,
  updateNotificationsCache,
  rejectJoinedOrgInvitation,
  getNotificationById,
};
