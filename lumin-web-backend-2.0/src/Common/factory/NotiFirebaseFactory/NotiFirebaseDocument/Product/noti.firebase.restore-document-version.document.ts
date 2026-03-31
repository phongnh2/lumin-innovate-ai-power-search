import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseRestoreDocumentVersionDocument extends NotiFirebaseDocumentBase {
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
    const { actor, document } = this.notiFirebaseDocument;
    return `${actor.name} restored a version of the document ${document.name}`;
  }
}
