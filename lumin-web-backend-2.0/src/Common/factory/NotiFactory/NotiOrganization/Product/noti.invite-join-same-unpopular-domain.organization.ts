import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiInviteJoinSameUnpopularDomainOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { user: targetUser } = this.notiOrganization.target;
    return {
      targetId: targetUser._id || null,
      targetName: targetUser.name || targetUser.email,
      type: targetUser._id ? 'user' : 'non-user',
    };
  }
}
