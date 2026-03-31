import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseInterface } from '../../noti.firebase.interface';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export abstract class NotiFirebaseDocumentBase {
  constructor(
    protected readonly notiFirebaseDocument: NotiFirebaseDocumentInterface,
  ) {}

  derive(): NotiFirebaseInterface {
    const { notificationData, notificationContent } = this.notiFirebaseDocument;
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
