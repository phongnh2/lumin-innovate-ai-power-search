import { NotiDocumentInterface } from 'Common//factory/NotiFactory/NotiDocument/noti.document.interface';
import { NotiOrganizationBase } from 'Common//factory/NotiFactory/NotiOrganization/Product/noti.base.organization';
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

export class NotiRemoveDocumentOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {
    super(notiDocument);
  }

  createEntity(): NotiEntity {
    const { document } = this.notiDocument.entity;
    return {
      entityId: document._id,
      entityName: document.name,
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
