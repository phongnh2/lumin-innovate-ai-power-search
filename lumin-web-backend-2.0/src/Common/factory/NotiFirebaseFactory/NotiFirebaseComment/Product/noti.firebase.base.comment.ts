import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseInterface } from '../../noti.firebase.interface';
import { NotiFirebaseCommentInterface } from '../noti.firebase.comment.interface';

export abstract class NotiFirebaseCommentBase {
  constructor(
    protected readonly notiFirebaseComment: NotiFirebaseCommentInterface,
  ) {}

  derive(): NotiFirebaseInterface {
    const { notificationData, notificationContent, notificationContentForTargetUser } = this.notiFirebaseComment;
    return {
      notificationContent: {
        ...notificationContent,
        body: this.createContent(),
      },
      notificationData: {
        ...notificationData,
        ...this.createEntity(),
      },
      notificationContentForTargetUser: {
        ...notificationContentForTargetUser,
        body: this.createContentForTargetUser(),
      },
    };
  }

  abstract createContent(): string;

  abstract createEntity(): IEntityFirebaseNotificationData;

  abstract createContentForTargetUser(): string;
}
