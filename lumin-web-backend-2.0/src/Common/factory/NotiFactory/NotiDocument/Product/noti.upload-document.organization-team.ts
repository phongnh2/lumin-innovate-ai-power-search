import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiDocumentInterface } from 'Common//factory/NotiFactory/NotiDocument/noti.document.interface';
import { NotiDocumentBase } from 'Common//factory/NotiFactory/NotiDocument/Product/noti.base.document';

export class NotiUploadDocumentOrganizationTeam extends NotiDocumentBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {
    super(notiDocument);
  }

  createEntity(): NotiEntity {
    const { document, entityData = {} } = this.notiDocument.entity;
    return {
      entityId: document._id,
      entityName: document.name,
      entityData: {
        multipleDocument: entityData.multipleDocument,
      },
      type: 'document',
    };
  }

  createTarget(): NotiTarget {
    const { organization, team: targetTeam } = this.notiDocument.target;
    return {
      targetId: targetTeam._id,
      targetName: targetTeam.name,
      targetData: {
        orgId: organization._id,
        orgName: organization.name,
        orgUrl: organization.url,
      },
      type: 'team',
    };
  }
}
