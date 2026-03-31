import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';

// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from '../noti.base.organization';

export class NotiActionToMemberOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createEntity(): NotiEntity {
    const { user: entityUser } = this.notiOrganization.entity;
    return {
      entityId: entityUser._id,
      entityName: entityUser.name,
      type: 'user',
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg, team: targetTeam } = this.notiOrganization.target;
    return {
      targetId: targetTeam._id,
      targetName: targetTeam.name,
      targetData: {
        orgId: targetOrg._id,
        orgName: targetOrg.name,
        orgUrl: targetOrg.url,
      },
      type: 'team',
    };
  }
}
