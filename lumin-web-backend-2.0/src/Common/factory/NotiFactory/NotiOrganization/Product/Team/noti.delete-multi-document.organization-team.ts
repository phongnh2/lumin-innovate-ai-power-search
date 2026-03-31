import { NotiOrganizationInterface } from 'Common//factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiOrganizationBase } from 'Common//factory/NotiFactory/NotiOrganization/Product/noti.base.organization';
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

export class NotiDeleteMultiDocumentOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiDocument: NotiOrganizationInterface) {
    super(notiDocument);
  }

  createEntity(): NotiEntity {
    const { document, totalDocument } = this.notiDocument.entity;
    return {
      entityId: document._id,
      entityName: document.name,
      entityData: {
        totalDocument,
      },
      type: 'document',
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg, team: targetTeam } = this.notiDocument.target;
    return {
      targetId: targetTeam._id,
      targetName: targetTeam.name,
      targetData: {
        orgId: targetOrg._id,
        orgName: targetOrg.name,
        orgUrl: targetOrg.url,
      },
      type: 'team',
    };
  }
}
