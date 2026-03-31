import { NotiOrganizationInterface } from 'Common//factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiOrganizationBase } from 'Common//factory/NotiFactory/NotiOrganization/Product/noti.base.organization';
import { NotiEntity, NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

export class NotiDeleteTemplateOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiTemplate: NotiOrganizationInterface) {
    super(notiTemplate);
  }

  createEntity(): NotiEntity {
    const { template } = this.notiTemplate.entity;
    return {
      entityId: template._id,
      entityName: template.name,
      type: 'template',
    };
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg } = this.notiTemplate.target;
    return {
      targetId: targetOrg._id,
      targetName: targetOrg.name,
      targetData: {
        orgId: targetOrg._id,
        orgName: targetOrg.name,
        orgUrl: targetOrg.url,
      },
      type: 'organization',
    };
  }
}
