import { CommonConstants } from 'Common/constants/CommonConstants';
import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseOrganizationBase } from './noti.firebase.base.organization';
import { NotiFirebaseOrganizationInterface } from '../noti.firebase.organization.interface';

export class NotiRemoveAssociateDomainOrganization extends NotiFirebaseOrganizationBase {
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
    const { organization, removedDomain } = this.notiFirebaseOrganization;
    return `${CommonConstants.LUMIN_ADMIN} disassociated  ${removedDomain} domain from ${organization.name}'s ${ORGANIZATION_TEXT}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
