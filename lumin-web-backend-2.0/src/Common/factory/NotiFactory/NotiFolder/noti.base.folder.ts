/* eslint-disable import/extensions */
import {
  NotiInterface, NotiActor, NotiEntity, NotiTarget,
} from 'Common/factory/NotiFactory/noti.interface';
import { NotiFolderInterface } from './noti.folder.interface';

export abstract class NotiFolderBase {
  constructor(protected readonly notiFolder: NotiFolderInterface) {}

  createActor(): NotiActor {
    const { user: actorUser } = this.notiFolder.actor;
    return {
      actorId: actorUser._id,
      actorName: actorUser.name,
      avatarRemoteId: actorUser.avatarRemoteId,
      type: 'user',
    };
  }

  createEntity(): NotiEntity {
    const { folder } = this.notiFolder.entity;
    return {
      entityId: folder._id,
      entityName: folder.name,
      type: 'folder',
    };
  }

  derive(): NotiInterface {
    const { actionType, notificationType } = this.notiFolder;
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
