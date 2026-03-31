import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseRequestAccessDocument extends NotiFirebaseDocumentBase {
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
    const { actor, document, role } = this.notiFirebaseDocument;
    return `${actor.name} requested for ${role} permission on ${document.name}`;
  }
}
