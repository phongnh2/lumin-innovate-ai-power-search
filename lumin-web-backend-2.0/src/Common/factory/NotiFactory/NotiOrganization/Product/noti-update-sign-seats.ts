import { NotiActor, NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiUpdateSignSeats extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    const { user } = this.notiOrganization.actor;
    return {
      actorId: user._id,
      actorName: user.name,
      avatarRemoteId: user.avatarRemoteId,
      actorData: {
        email: user.email,
      },
      type: 'user',
    };
  }

  createEntity(): NotiEntity {
    const { organization: entityOrg } = this.notiOrganization.entity;
    return {
      entityId: entityOrg._id,
      entityName: entityOrg.name,
      entityData: {
        orgId: entityOrg._id,
        orgName: entityOrg.name,
        orgUrl: entityOrg.url,
      },
      type: 'organization',
    };
  }

  createTarget(): NotiTarget {
    const { user: targetUser } = this.notiOrganization.target;
    return {
      targetId: targetUser._id,
      targetName: targetUser.name,
      type: 'user',
    };
  }
}
