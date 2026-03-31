import {
  NotiInterface, NotiActor, NotiEntity, NotiTarget,
} from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

export abstract class NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {}

  createActor(): NotiActor {
    const { user: actorUser, actorData } = this.notiOrganization.actor;
    return {
      actorId: actorUser._id,
      actorName: actorUser.name,
      type: 'user',
      avatarRemoteId: actorUser.avatarRemoteId,
      actorData,
    };
  }

  createEntity(): NotiEntity {
    const { organization: entityOrg } = this.notiOrganization.entity;
    return {
      entityId: entityOrg._id,
      entityName: entityOrg.name,
      entityData: {
        orgId: entityOrg._id,
        orgUrl: entityOrg.url,
        orgName: entityOrg.name,
      },
      type: 'organization',
    };
  }

  derive(): NotiInterface {
    const { actionType, notificationType } = this.notiOrganization;
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
