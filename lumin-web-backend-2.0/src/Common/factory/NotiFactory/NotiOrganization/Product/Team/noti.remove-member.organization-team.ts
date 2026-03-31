import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from '../noti.base.organization';

export class NotiRemoveMemberOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { user: targetUser } = this.notiOrganization.target;
    return {
      targetId: targetUser._id,
      targetName: targetUser.name,
      type: 'user',
    };
  }

  createEntity(): NotiEntity {
    const { team: entityTeam, organization } = this.notiOrganization.entity;
    return {
      entityId: entityTeam._id,
      entityName: entityTeam.name,
      entityData: {
        orgId: organization._id,
        orgUrl: organization.url,
        orgName: organization.name,
      },
      type: 'team',
    };
  }
}
