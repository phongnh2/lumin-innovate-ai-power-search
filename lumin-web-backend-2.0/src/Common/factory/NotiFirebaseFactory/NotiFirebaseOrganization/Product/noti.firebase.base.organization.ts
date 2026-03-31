import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseInterface } from '../../noti.firebase.interface';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export abstract class NotiFirebaseOrganizationBase {
  constructor(
    protected readonly notiFirebaseOrganization: NotiFirebaseOrganizationInterface,
  ) {}

  derive(): NotiFirebaseInterface {
    const {
      notificationData,
      notificationContent,
      notificationContentForTargetUser,
    } = this.notiFirebaseOrganization;
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
