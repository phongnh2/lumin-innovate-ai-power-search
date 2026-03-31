import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { OrganizationService } from 'Organization/organization.service';

export class OrgMembershipLoader {
  public static create(organizationService: OrganizationService): DataLoader<string, IOrganizationMember> {
    return new DataLoader<string, IOrganizationMember>(async (ids: string[]) => {
      // Key: `${userId}-{orgId}`
      const orgIds = ids.map((id) => id.split('-')[1]);
      const userId = ids[0].split('-')[0];
      const membershipsOfUser = await organizationService.getMemberships({ userId, orgId: { $in: orgIds } });
      const membershipsOfUserMap = Utils.createKeyedMap(
        membershipsOfUser,
        (membership) => `${membership.userId.toHexString()}-${membership.orgId.toHexString()}`,
      );
      return ids.map((id) => membershipsOfUserMap[id]);
    });
  }
}
