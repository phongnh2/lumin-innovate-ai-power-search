import { NotiOrganizationInterface } from 'Common//factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiOrganizationBase } from 'Common//factory/NotiFactory/NotiOrganization/Product/noti.base.organization';
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

export class NotiTeamMemberInvited extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createEntity(): NotiEntity {
    const { team: entityTeam, organization } = this.notiOrganization.entity;
    return {
      entityId: entityTeam._id,
      entityName: entityTeam.name,
      entityData: {
        orgUrl: organization.url,
      },
      type: 'team',
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
