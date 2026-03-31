import { NotiTeamInterface } from 'Common/factory/NotiFactory/NotiTeam/noti.team.interface';
import {
  NotiInterface, NotiActor, NotiEntity, NotiTarget,
} from 'Common/factory/NotiFactory/noti.interface';

export abstract class NotiTeamBase {
  constructor(protected readonly notiTeam: NotiTeamInterface) {}

  createActor(): NotiActor {
    const { user: actorUser } = this.notiTeam.actor;
    return {
      actorId: actorUser._id,
      actorName: actorUser.name,
      type: 'user',
      avatarRemoteId: actorUser.avatarRemoteId,
    };
  }

  createEntity(): NotiEntity {
    const { document: entityDocument } = this.notiTeam.entity;
    return {
      entityId: entityDocument._id,
      entityName: entityDocument.name,
      type: 'document',
    };
  }

  derive(): NotiInterface {
    const { actionType, notificationType } = this.notiTeam;
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
