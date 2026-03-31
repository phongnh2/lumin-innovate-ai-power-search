import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseCommentBase } from './noti.firebase.base.comment';
import { NotiFirebaseCommentInterface } from '../noti.firebase.comment.interface';

export class NotiFirebaseCreateComment extends NotiFirebaseCommentBase {
  constructor(
    protected readonly notiFirebaseComment: NotiFirebaseCommentInterface,
  ) {
    super(notiFirebaseComment);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { annotationId, document } = this.notiFirebaseComment;
    return {
      annotationId: annotationId || '',
      documentId: document._id,
    };
  }

  createContent(): string {
    const { actor, document } = this.notiFirebaseComment;
    return `${actor.name} commented on ${document.name}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
