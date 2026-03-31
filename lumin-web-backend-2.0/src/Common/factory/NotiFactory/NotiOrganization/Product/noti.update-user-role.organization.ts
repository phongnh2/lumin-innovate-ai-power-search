import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiUpdateUserRole extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { user: targetUser, targetData: { role } } = this.notiOrganization.target;
    return {
      targetId: targetUser._id,
      targetName: targetUser.name,
      type: 'user',
      targetData: {
        role,
      },
    };
  }
}
