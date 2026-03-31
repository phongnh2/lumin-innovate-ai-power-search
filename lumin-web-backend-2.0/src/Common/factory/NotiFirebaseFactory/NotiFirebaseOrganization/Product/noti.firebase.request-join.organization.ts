import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiFirebaseRequestJoinOrganization extends NotiFirebaseOrganizationBase {
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
    const { actor, organization } = this.notiFirebaseOrganization;
    return `${actor.name} requested to join ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
