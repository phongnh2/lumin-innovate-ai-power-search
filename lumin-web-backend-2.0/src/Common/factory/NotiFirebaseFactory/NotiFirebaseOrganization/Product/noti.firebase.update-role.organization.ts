import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiFirebaseUpdateRoleOrganization extends NotiFirebaseOrganizationBase {
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
    const {
      actor, organization, role, targetUser,
    } = this.notiFirebaseOrganization;
    return `${actor.name} changed ${targetUser.name}'s role to ${role} in ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    const { organization, actor, role } = this.notiFirebaseOrganization;
    return `${actor.name} changed your role to ${role} in ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }
}
