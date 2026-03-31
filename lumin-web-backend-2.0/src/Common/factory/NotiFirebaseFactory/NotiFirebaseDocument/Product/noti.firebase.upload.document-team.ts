import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseDocumentBase } from './noti.firebase.base.document';
import { NotiFirebaseDocumentInterface } from '../noti.firebase.document.interface';

export class NotiFirebaseUploadDocumentTeam extends NotiFirebaseDocumentBase {
  constructor(
    protected readonly notiFirebaseDocument: NotiFirebaseDocumentInterface,
  ) {
    super(notiFirebaseDocument);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const {
      document, organization, team, isMultipleDocs,
    } = this.notiFirebaseDocument;
    return {
      orgUrl: organization.url,
      teamId: team._id,
      ...(!isMultipleDocs && { documentId: document?._id }),
    };
  }

  createContent(): string {
    const {
      document,
      isMultipleDocs,
      actor,
      team,
      totalDocuments,
    } = this.notiFirebaseDocument;
    return isMultipleDocs
      ? `${actor.name} uploaded ${totalDocuments} documents to ${team.name}`
      : `${actor.name} uploaded ${document.name} to ${team.name}`;
  }
}
