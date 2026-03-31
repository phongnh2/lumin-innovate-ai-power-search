import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiDeleteMultiOrganizationDocument extends NotiOrganizationBase {
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
    const { totalDocument, document } = this.notiOrganization.entity;
    return {
      entityId: document._id,
      entityName: document.name,
      type: 'document',
      entityData: {
        totalDocument,
      },
    };
  }
}
