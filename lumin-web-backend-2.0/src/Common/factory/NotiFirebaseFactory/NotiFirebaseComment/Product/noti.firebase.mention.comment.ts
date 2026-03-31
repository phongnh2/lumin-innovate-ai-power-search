import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseCommentBase } from './noti.firebase.base.comment';
import { NotiFirebaseCommentInterface } from '../noti.firebase.comment.interface';

export class NotiFirebaseMentionComment extends NotiFirebaseCommentBase {
  constructor(
    protected readonly notiFirebaseComment: NotiFirebaseCommentInterface,
  ) {
    super(notiFirebaseComment);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { document, annotationId } = this.notiFirebaseComment;
    return {
      annotationId: annotationId || '',
      documentId: document._id,
    };
  }

  createContent(): string {
    const { actor, document, annotationTypeShowed } = this.notiFirebaseComment;
    return `${actor.name} mentioned you in a ${annotationTypeShowed} on ${document.name}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
