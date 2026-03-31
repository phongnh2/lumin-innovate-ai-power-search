import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseInterface } from '../../noti.firebase.interface';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export abstract class NotiFirebaseTeamBase {
  constructor(protected readonly notiFirebaseTeam: NotiFirebaseTeamInterface) {}

  derive(): NotiFirebaseInterface {
    const {
      notificationData,
      notificationContent,
      notificationContentForTargetUser,
    } = this.notiFirebaseTeam;
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

  abstract createContentForTargetUser(): string;

  abstract createEntity(): IEntityFirebaseNotificationData;
}
