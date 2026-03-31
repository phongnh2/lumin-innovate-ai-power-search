import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseCommentBase } from './noti.firebase.base.comment';
import { NotiFirebaseCommentInterface } from '../noti.firebase.comment.interface';

export class NotiFirebaseReplyComment extends NotiFirebaseCommentBase {
  constructor(
    protected readonly notiFirebaseComment: NotiFirebaseCommentInterface,
  ) {
    super(notiFirebaseComment);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { document } = this.notiFirebaseComment;
    return {
      documentId: document._id,
    };
  }

  createContent(): string {
    const { actor, document, annotationTypeShowed } = this.notiFirebaseComment;
    return `${actor.name} replied to your ${annotationTypeShowed} on ${document.name}`;
  }

  createContentForTargetUser(): string {
    const { actor, document } = this.notiFirebaseComment;
    return `${actor.name} also commented on ${document.name}`;
  }
}
