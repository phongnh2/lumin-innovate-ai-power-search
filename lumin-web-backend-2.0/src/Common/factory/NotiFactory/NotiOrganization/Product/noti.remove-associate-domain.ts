import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiActor, NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiRemoveAssociateDomain extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    return null;
  }

  createEntity(): NotiEntity {
    const { organization, removedDomain } = this.notiOrganization.entity;
    return {
      entityId: organization._id,
      entityName: organization.name,
      entityData: {
        removedDomain,
        orgUrl: organization.url,
        avatarRemoteId: organization.avatarRemoteId,
      },
      type: 'organization',
    };
  }

  createTarget(): NotiTarget {
    return null;
  }
}
