/* eslint-disable import/extensions */
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

import { NotiOrganizationBase } from './noti.base.organization';
import { NotiOrganizationInterface } from '../noti.organization.interface';

export class NotiDeleteMultiFolderOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { organization: targetOrganization } = this.notiOrganization.target;
    return {
      targetId: targetOrganization._id,
      targetName: targetOrganization.name,
      type: 'organization',
      targetData: {
        orgId: targetOrganization._id,
        orgName: targetOrganization.name,
        orgUrl: targetOrganization.url,
      },
    };
  }

  createEntity(): NotiEntity {
    const { totalFolder, folder } = this.notiOrganization.entity;
    return {
      entityId: folder._id,
      entityName: folder.name,
      type: 'folder',
      entityData: {
        totalFolder,
      },
    };
  }
}
