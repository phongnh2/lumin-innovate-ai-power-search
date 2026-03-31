import { NotiDocumentInterface } from 'Common/factory/NotiFactory/NotiDocument/noti.document.interface';
import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiDocumentBase } from './noti.base.document';

export class NotiUploadDocumentOrganization extends NotiDocumentBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {
    super(notiDocument);
  }

  createEntity(): NotiEntity {
    const { document: documentUploaded, entityData = {} } = this.notiDocument.entity;
    return {
      entityId: documentUploaded._id,
      entityName: documentUploaded.name,
      entityData: {
        multipleDocument: entityData.multipleDocument,
      },
      type: 'document',
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrganization } = this.notiDocument.target;
    return {
      targetId: targetOrganization._id,
      targetName: targetOrganization.name,
      type: 'organization',
    };
  }
}
