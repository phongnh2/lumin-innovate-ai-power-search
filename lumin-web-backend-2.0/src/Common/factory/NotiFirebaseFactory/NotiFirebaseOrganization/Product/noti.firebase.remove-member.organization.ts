import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiFirebaseRemoveMemberOrganization extends NotiFirebaseOrganizationBase {
  constructor(
    protected readonly notiFirebaseOrganization: NotiFirebaseOrganizationInterface,
  ) {
    super(notiFirebaseOrganization);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { organization, targetUser } = this.notiFirebaseOrganization;
    return {
      orgUrl: organization.url,
      targetId: targetUser._id,
    };
  }

  createContent(): string {
    const { organization, actor, targetUser } = this.notiFirebaseOrganization;
    return `${actor.name} removed ${targetUser.name} from ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    const { organization } = this.notiFirebaseOrganization;
    return `You are removed from ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }
}
