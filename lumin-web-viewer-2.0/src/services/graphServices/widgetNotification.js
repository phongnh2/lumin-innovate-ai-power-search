import {
  CREATE_WIDGET_NOTIFICATIONS,
  DISMISS_WIDGET_NOTIFICATION,
  PREVIEW_WIDGET_NOTIFICATIONS,
  DISMISS_ALL_WIDGET_NOTIFICATIONS,
  PREVIEW_ALL_WIDGET_NOTIFICATIONS,
  GET_WIDGET_NOTIFICATIONS,
} from 'graphQL/WidgetNotificationGraph';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

export async function createWidgetNotification({ widgetType }) {
  return client.mutate({
    mutation: CREATE_WIDGET_NOTIFICATIONS,
    variables: {
      widgetType,
    },
  });
}

export function dismissWidgetNotification(notificationId) {
  return client.mutate({
    mutation: DISMISS_WIDGET_NOTIFICATION,
    variables: {
      input: {
        notificationId,
      },
    },
  });
}

export function dismissAllWidgetNotifications() {
  return client.mutate({
    mutation: DISMISS_ALL_WIDGET_NOTIFICATIONS,
  });
}

export function previewAllWidgetNotification() {
  return client.mutate({
    mutation: PREVIEW_ALL_WIDGET_NOTIFICATIONS,
  });
}

export function previewWidgetNotification(widgetIds) {
  return client.mutate({
    mutation: PREVIEW_WIDGET_NOTIFICATIONS,
    variables: {
      input: {
        widgetIds,
      },
    },
  });
}

export function getWidgets() {
  return client.query({
    query: GET_WIDGET_NOTIFICATIONS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}

export default {
  createWidgetNotification,
  dismissAllWidgetNotifications,
  previewWidgetNotification,
  dismissWidgetNotification,
  getWidgets,
};
