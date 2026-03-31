/* eslint-disable import/extensions */
import { NotiDocument } from 'Common/constants/NotificationConstants';
import { NotiAbstractFactory } from 'Common/factory/NotiFactory/noti.abstract.factory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';

import { NotiDocumentInterface } from './noti.document.interface';
import { NotiDocumentBase } from './Product/noti.base.document';
import { NotiDeleteDocument } from './Product/noti.delete.document';
import { NotiRestoreDocumentVersion } from './Product/noti.restore.document.version';
import { NotiRestoreOriginalDocument } from './Product/noti.restore.original.document';
import { NotiUploadDocumentOrganizationTeam } from './Product/noti.upload-document.organization-team';
import { NotiUploadDocumentOrganization } from './Product/noti.upload.document-organization';

export class NotiDocumentFactory extends NotiAbstractFactory {
  public create(type: number, notificationInterface: Partial<NotiDocumentInterface>): NotiInterface {
    const notificationInitialize = {
      ...notificationInterface,
      actionType: type,
      notificationType: 'DocumentNotification',
    } as NotiDocumentInterface;

    let ConstructType: new (noti: NotiDocumentInterface) => NotiDocumentBase;

    switch (type) {
      case NotiDocument.DELETE:
        ConstructType = NotiDeleteDocument;
        break;
      case NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION:
        ConstructType = NotiUploadDocumentOrganization;
        break;
      case NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM:
        ConstructType = NotiUploadDocumentOrganizationTeam;
        break;
      case NotiDocument.RESTORE_ORIGINAL_VERSION:
        ConstructType = NotiRestoreOriginalDocument;
        break;
      case NotiDocument.RESTORE_DOCUMENT_VERSION:
        ConstructType = NotiRestoreDocumentVersion;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
