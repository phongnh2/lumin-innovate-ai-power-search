import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseDeleteDocument extends NotiFirebaseDocumentBase {
  constructor(
    protected readonly notiFirebaseDocument: NotiFirebaseDocumentInterface,
  ) {
    super(notiFirebaseDocument);
  }

  createEntity(): IEntityFirebaseNotificationData {
    return null;
  }

  createContent(): string {
    const { document, actor } = this.notiFirebaseDocument;
    return `${actor.name} deleted ${document.name}`;
  }
}
