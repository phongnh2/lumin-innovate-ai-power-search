import { NotiOrganizationInterface } from 'Common//factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiOrganizationBase } from 'Common//factory/NotiFactory/NotiOrganization/Product/noti.base.organization';
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

export class NotiDeleteMultiFolderOrganizationTeam extends NotiOrganizationBase {
  constructor(protected readonly notiFolder: NotiOrganizationInterface) {
    super(notiFolder);
  }

  createEntity(): NotiEntity {
    const { folder, totalFolder } = this.notiFolder.entity;
    return {
      entityId: folder._id,
      entityName: folder.name,
      entityData: {
        totalFolder,
      },
      type: 'document',
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg, team: targetTeam } = this.notiFolder.target;
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
