import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseInterface } from '../../noti.firebase.interface';
import { NotiFirebaseFolderInterface } from '../noti.firebase.folder.interface';

export abstract class NotiFirebaseFolderBase {
  constructor(
    protected readonly notiFirebaseFolder: NotiFirebaseFolderInterface,
  ) {}

  derive(): NotiFirebaseInterface {
    const { notificationData, notificationContent } = this.notiFirebaseFolder;
    return {
      notificationContent: {
        ...notificationContent,
        body: this.createContent(),
      },
      notificationData: {
        ...notificationData,
        ...this.createEntity(),
      },
    };
  }

  abstract createContent(): string;

  abstract createEntity(): IEntityFirebaseNotificationData;
}
