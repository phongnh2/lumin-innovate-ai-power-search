import { NotiDocumentInterface } from 'Common/factory/NotiFactory/NotiDocument/noti.document.interface';
import {
  NotiInterface, NotiActor, NotiEntity, NotiTarget,
} from 'Common/factory/NotiFactory/noti.interface';

export abstract class NotiDocumentBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {}

  createActor(): NotiActor {
    const { user: actorUser } = this.notiDocument.actor;
    return {
      actorId: actorUser._id,
      actorName: actorUser.name,
      type: 'user',
      avatarRemoteId: actorUser.avatarRemoteId,
    };
  }

  createEntity(): NotiEntity {
    const { document: entityDocument } = this.notiDocument.entity;
    return {
      entityId: entityDocument._id,
      entityName: entityDocument.name,
      type: 'document',
    };
  }

  derive(): NotiInterface {
    const { actionType, notificationType } = this.notiDocument;
    return {
      actor: this.createActor(),
      target: this.createTarget(),
      entity: this.createEntity(),
      actionType,
      notificationType,
    };
  }

  abstract createTarget(): NotiTarget;
}
