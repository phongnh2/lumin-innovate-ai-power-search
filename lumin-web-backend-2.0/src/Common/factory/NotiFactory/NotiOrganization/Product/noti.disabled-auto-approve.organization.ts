import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiActor, NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiDisabledAutoApproveOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    return null;
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
    return null;
  }
}
