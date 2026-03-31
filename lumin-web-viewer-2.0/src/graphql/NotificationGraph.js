import { gql } from '@apollo/client';

import Fragments from './Fragment';

const GET_NOTIFICATIONS = gql`
query getNotifications($input: GetNotificationsInput!) {
  notifications(input: $input) {
    cursor
    hasNextPage
    notifications {
      ...NotificationData
    }
  }
}
${Fragments.NotificationData}
`;

const READ_NOTIFICATIONS = gql`
  mutation readNotifications($input: ReadNotificationsInput!) {
    readNotifications(input: $input) {
      message 
      statusCode
    } 
  }
`;

const READ_ALL_NOTIFICATIONS = gql`
  mutation readAllNotifications {
    readAllNotifications {
      message 
      statusCode
    } 
  }
`;

const SUB_NEW_NOTIFICATIONS = gql`
  subscription newNotification($input: NewNotificationInput!) {
    newNotification(input: $input) {
      ...NotificationData
      
    }
  }
  ${Fragments.NotificationData}
`;

const SUB_DEL_NOTIFICATION = gql`
  subscription deleteNotification($input: DeleteNotificationInput!){
    deleteNotification(input: $input) {
      notificationId
      tab
    }
  }
`;

const REJECT_INVITATION = gql`
  mutation rejectJoinedOrgInvitation($input: RejectInvitationInput!) {
    rejectJoinedOrgInvitation(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_NOTIFICATION_BY_ID = gql`
  query getNotificationById($notificationId: ID!) {
    getNotificationById(notificationId: $notificationId) {
      ...NotificationData
    }
  }
  ${Fragments.NotificationData}
`;

export {
  GET_NOTIFICATIONS,
  READ_NOTIFICATIONS,
  SUB_NEW_NOTIFICATIONS,
  SUB_DEL_NOTIFICATION,
  READ_ALL_NOTIFICATIONS,
  REJECT_INVITATION,
  GET_NOTIFICATION_BY_ID,
};
