import * as DataLoader from 'dataloader';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { IEnterpriseInvoice } from 'Admin/interfaces/admin.interface';
import { OrganizationService } from 'Organization/organization.service';

export class EnterpriseUpgradesLoader {
  public static create(organizationService: OrganizationService): DataLoader<string, IEnterpriseInvoice> {
    return new DataLoader<string, IEnterpriseInvoice>(async (ids: string[]) => {
      const enterpriseUpgrades = await organizationService.getEnterpriseUpgrades(ids);
      const enterpriseUpgradesMap = enterpriseUpgrades.reduce((map: Record<string, IEnterpriseInvoice>, enterprise) => {
        const existingEnterprise = map[enterprise.orgId.toHexString()];
        if (existingEnterprise && existingEnterprise.status === UpgradeEnterpriseStatus.PENDING) {
          // Prioritize PENDING over EXPIRED status
          return map;
        }
        map[enterprise.orgId.toHexString()] = enterprise;
        return map;
      }, {});
      return ids.map((id) => enterpriseUpgradesMap[id]);
    });
  }
}
