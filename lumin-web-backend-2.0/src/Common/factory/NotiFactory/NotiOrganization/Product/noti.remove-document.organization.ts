import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiRemoveDocumentOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { organization: targetOrganization } = this.notiOrganization.target;
    return {
      targetId: targetOrganization._id,
      targetName: targetOrganization.name,
      targetData: {
        orgId: targetOrganization._id,
        orgName: targetOrganization.name,
        orgUrl: targetOrganization.url,
      },
      type: 'organization',
    };
  }

  createEntity(): NotiEntity {
    const { document: entityDocument } = this.notiOrganization.entity;
    return {
      entityId: entityDocument._id,
      entityName: entityDocument.name,
      type: 'document',
    };
  }
}
