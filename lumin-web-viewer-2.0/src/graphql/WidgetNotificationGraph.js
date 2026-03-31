import gql from 'graphql-tag';

import Fragments from './Fragment';

export const GET_WIDGET_NOTIFICATIONS = gql`
  query getWidgetNotifications {
    widgetNotifications {
      widgetList {
        ...WidgetNotificationData
      }
    }
  }
  ${Fragments.WidgetNotificationData}
`;

export const CREATE_WIDGET_NOTIFICATIONS = gql`
  mutation createWidgetNotification($widgetType: WidgetType!) {
    createWidgetNotification(widgetType: $widgetType) {
      message
      statusCode
      data
    }
  }
`;

export const DISMISS_WIDGET_NOTIFICATION = gql`
  mutation dismissWidgetNotification($input: DismissWidgetNotificationsInput!) {
    dismissWidgetNotification(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

export const PREVIEW_WIDGET_NOTIFICATIONS = gql`
  mutation previewWidgetNotification($input: WidgetIdsInput!) {
    previewWidgetNotification(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

export const DISMISS_ALL_WIDGET_NOTIFICATIONS = gql`
  mutation dismissAllWidgetNotifications {
    dismissAllWidgetNotifications {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

export const PREVIEW_ALL_WIDGET_NOTIFICATIONS = gql`
  mutation previewAllWidgetNotifications {
    previewAllWidgetNotifications {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;
