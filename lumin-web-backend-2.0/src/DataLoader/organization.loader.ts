import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';

export class OrganizationLoader {
  public static create(organizationService: OrganizationService): DataLoader<string, IOrganization> {
    return new DataLoader<string, IOrganization>(async (ids: string[]) => {
      const organizations = await organizationService.findOrganization({ _id: { $in: ids } }, { _id: 1, name: 1 });
      const organizationsMap = Utils.createKeyedMap(organizations, (org) => org._id);
      return ids.map((id) => organizationsMap[id]);
    });
  }
}
