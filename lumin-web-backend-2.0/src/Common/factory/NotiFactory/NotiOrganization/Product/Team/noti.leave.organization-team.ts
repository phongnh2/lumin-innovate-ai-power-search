import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from '../noti.base.organization';

export class NotiLeaveOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    return null;
  }

  createEntity(): NotiEntity {
    const { team: entityTeam, organization } = this.notiOrganization.entity;
    return {
      entityId: entityTeam._id,
      entityName: entityTeam.name,
      entityData: {
        orgId: organization._id,
        orgName: organization.name,
        orgUrl: organization.url,
      },
      type: 'team',
    };
  }
}
