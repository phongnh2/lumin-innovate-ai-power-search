import { NotiActor, NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiAutoJoinOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    const { user } = this.notiOrganization.actor;
    return {
      actorId: user._id,
      actorName: user.name,
      avatarRemoteId: user.avatarRemoteId,
      type: 'user',
    };
  }

  createEntity(): NotiEntity {
    return null;
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg } = this.notiOrganization.target;
    return {
      targetId: targetOrg._id,
      targetName: targetOrg.name,
      targetData: {
        orgId: targetOrg._id,
        orgUrl: targetOrg.url,
        orgName: targetOrg.name,
      },
      type: 'organization',
    };
  }
}
