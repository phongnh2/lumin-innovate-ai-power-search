import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiFirebaseMemberUpgradeSubscriptionOrganization extends NotiFirebaseOrganizationBase {
  constructor(
    protected readonly notiFirebaseOrganization: NotiFirebaseOrganizationInterface,
  ) {
    super(notiFirebaseOrganization);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { organization } = this.notiFirebaseOrganization;
    return {
      orgUrl: organization.url,
    };
  }

  createContent(): string {
    const { organization, actor } = this.notiFirebaseOrganization;
    return `${actor.name} was granted to Admin as they had upgraded the subscription of ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
