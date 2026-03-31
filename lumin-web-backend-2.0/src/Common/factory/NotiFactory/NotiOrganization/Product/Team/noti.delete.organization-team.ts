import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from '../noti.base.organization';

export class NotiDeleteOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    const { organization: entityOrg } = this.notiOrganization.target;
    return {
      targetId: entityOrg._id,
      targetName: entityOrg.name,
      targetData: {
        orgId: entityOrg._id,
        orgName: entityOrg.name,
        orgUrl: entityOrg.url,
      },
      type: 'organization',
    };
  }

  createEntity(): NotiEntity {
    const { team: entityTeam } = this.notiOrganization.entity;
    return {
      entityId: entityTeam._id,
      entityName: entityTeam.name,
      type: 'team',
    };
  }
}
