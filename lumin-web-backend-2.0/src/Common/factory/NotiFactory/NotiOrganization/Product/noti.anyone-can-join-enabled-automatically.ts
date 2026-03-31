import {
  NotiActor,
  NotiEntity,
  NotiTarget,
} from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

import { NotiOrganizationBase } from './noti.base.organization';

export class NotiAnyoneCanJoinEnabledAutomatically extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    return null;
  }

  createEntity(): NotiEntity {
    const { organization } = this.notiOrganization.entity;
    return {
      entityId: organization._id,
      entityName: organization.name,
      entityData: {
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
