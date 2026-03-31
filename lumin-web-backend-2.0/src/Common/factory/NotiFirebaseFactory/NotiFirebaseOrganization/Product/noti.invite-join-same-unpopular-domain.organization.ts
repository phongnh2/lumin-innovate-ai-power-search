import { CommonConstants } from 'Common/constants/CommonConstants';
import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiInviteJoinSameUnpopularDomainOrganization extends NotiFirebaseOrganizationBase {
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
    const {
      actor, organization, targetUser, actorType,
    } = this.notiFirebaseOrganization;
    return `${
      actorType === APP_USER_TYPE.SALE_ADMIN
        ? CommonConstants.LUMIN_ADMIN
        : actor.name
    } invited ${targetUser.name} to ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    const { actor, organization, actorType } = this.notiFirebaseOrganization;
    return `${
      actorType === APP_USER_TYPE.SALE_ADMIN
        ? CommonConstants.LUMIN_ADMIN
        : actor.name
    } invited you to ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }
}
