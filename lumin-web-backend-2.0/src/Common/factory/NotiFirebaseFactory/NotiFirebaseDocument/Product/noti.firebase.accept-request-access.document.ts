import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseAcceptRequestAccessDocument extends NotiFirebaseDocumentBase {
  constructor(
    protected readonly notiFirebaseDocument: NotiFirebaseDocumentInterface,
  ) {
    super(notiFirebaseDocument);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { document } = this.notiFirebaseDocument;
    return {
      documentId: document._id,
    };
  }

  createContent(): string {
    const { role, document } = this.notiFirebaseDocument;
    return `Your request for ${role} permission on ${document.name} was approved`;
  }
}
