import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseUploadDocumentOrganization extends NotiFirebaseDocumentBase {
  constructor(
    protected readonly notiFirebaseDocument: NotiFirebaseDocumentInterface,
  ) {
    super(notiFirebaseDocument);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { document, organization, isMultipleDocs } = this.notiFirebaseDocument;
    return {
      orgUrl: organization.url,
      ...(!isMultipleDocs && { documentId: document?._id }),
    };
  }

  createContent(): string {
    const {
      actor, organization, document, isMultipleDocs, totalDocuments,
    } = this.notiFirebaseDocument;
    return isMultipleDocs
      ? `${actor.name} uploaded ${totalDocuments} documents to All ${organization.name}`
      : `${actor.name} uploaded ${document.name} to All ${organization.name}`;
  }
}
