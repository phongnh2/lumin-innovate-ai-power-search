import {
  NotiComment,
  NotificationType,
} from 'Common/constants/NotificationConstants';

import { NotiFirebaseCommentInterface } from './noti.firebase.comment.interface';
import { NotiFirebaseCommentBase } from './Product/noti.firebase.base.comment';
import { NotiFirebaseCreateComment } from './Product/noti.firebase.create.comment';
import { NotiFirebaseDeleteComment } from './Product/noti.firebase.delete.comment';
import { NotiFirebaseMentionComment } from './Product/noti.firebase.mention.comment';
import { NotiFirebaseReplyComment } from './Product/noti.firebase.reply.comment';
import { NotiFirebaseAbstractFactory } from '../noti.firebase.abstract.factory';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export class NotiFirebaseCommentFactory extends NotiFirebaseAbstractFactory {
  public create(
    type: number,
    notificationFirebase: Partial<NotiFirebaseCommentInterface>,
  ): NotiFirebaseInterface {
    const notificationInitialize = {
      ...notificationFirebase,
      notificationData: {
        actionType: type.toString(),
        notificationType: NotificationType.COMMENT,
      },
      notificationContentForTargetUser: {
        title: 'Lumin PDF',
      },
      notificationContent: {
        title: 'Lumin PDF',
      },
    } as NotiFirebaseCommentInterface;

    let ConstructType: new (
      noti: NotiFirebaseInterface,
    ) => NotiFirebaseCommentBase;

    switch (type) {
      case NotiComment.REPLY:
        ConstructType = NotiFirebaseReplyComment;
        break;
      case NotiComment.CREATE:
        ConstructType = NotiFirebaseCreateComment;
        break;
      case NotiComment.DELETE:
        ConstructType = NotiFirebaseDeleteComment;
        break;
      case NotiComment.MENTION:
        ConstructType = NotiFirebaseMentionComment;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
