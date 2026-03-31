import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiFirebaseTransferOwnerOrganization extends NotiFirebaseOrganizationBase {
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
    const { organization, actor, targetUser } = this.notiFirebaseOrganization;
    return `${actor.name} transferred the ownership of ${organization.name}'s ${ORGANIZATION_TEXT} to ${targetUser.name}`;
  }

  createContentForTargetUser(): string {
    const { organization, actor } = this.notiFirebaseOrganization;
    return `${actor.name} transferred the ownership of ${organization.name}'s ${ORGANIZATION_TEXT} to you`;
  }
}
