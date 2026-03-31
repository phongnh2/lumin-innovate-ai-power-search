import {
  IFirebaseNotification,
  IFirebaseNotificationData,
} from 'Notication/interfaces/notification.interface';

export interface NotiFirebaseInterface {
  notificationData: IFirebaseNotificationData;
  notificationContent: IFirebaseNotification;
  notificationContentForTargetUser?: IFirebaseNotification;
}
