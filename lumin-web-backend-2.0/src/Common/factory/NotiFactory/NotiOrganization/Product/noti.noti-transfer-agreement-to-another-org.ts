/* eslint-disable import/extensions */
import { NotiActor, NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

import { NotiOrganizationBase } from './noti.base.organization';
import { NotiOrganizationInterface } from '../noti.organization.interface';

export class NotiTransferAgreementToAnotherOrg extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    const { user: actorUser } = this.notiOrganization.actor;
    return {
      actorId: actorUser._id,
      actorName: actorUser.name,
      type: 'user',
      avatarRemoteId: actorUser.avatarRemoteId,
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrganization, targetData } = this.notiOrganization.target;
    return {
      targetId: targetOrganization._id,
      targetName: targetOrganization.name,
      type: 'organization',
      targetData: {
        orgId: targetOrganization._id,
        orgName: targetOrganization.name,
        orgUrl: targetOrganization.url,
        existAgreement: targetData.existAgreement,
        existAgreementGenDocuments: targetData.existAgreementGenDocuments,
      },
    };
  }

  createEntity(): NotiEntity {
    const { organization: entityOrganization } = this.notiOrganization.entity;
    return {
      entityId: entityOrganization._id,
      entityName: entityOrganization.name,
      type: 'organization',
      entityData: {
        orgId: entityOrganization._id,
        orgName: entityOrganization.name,
        orgUrl: entityOrganization.url,
      },
    };
  }
}
