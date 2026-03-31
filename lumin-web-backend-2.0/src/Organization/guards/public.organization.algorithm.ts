import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { IVerifyData } from 'Organization/guards/guards.organization.interface';
import { OrganizationAlgorithm } from 'Organization/guards/strategy.organization.algorithm';
import { Resource } from 'Organization/Policy/architecture/policy.enum';

export class PublicOrganizationAlgorithm implements OrganizationAlgorithm {
  async executeAlgorithm(verifyData: IVerifyData): Promise<boolean> {
    const { organizationService, organizationTeamService, data } = verifyData;
    const { orgId, orgTeamId, resourceAccess } = data.resource;
    const { _id: actorId } = data.actor;

    switch (resourceAccess) {
      case Resource.ORGANIZATION: {
        const orgMembership = await organizationService.getMembershipByOrgAndUser(orgId, actorId, { _id: 1 });
        if (!orgMembership) {
          throw GraphErrorException.Forbidden('You don\'t have permission to do this action', ErrorCode.Common.NO_PERMISSION);
        }
      }
        break;
      case Resource.ORGANIZATION_TEAM: {
        const teamMembership = await organizationTeamService.getOrgTeamMembershipOfUser(actorId, orgTeamId, { _id: 1 });
        if (!teamMembership) {
          throw GraphErrorException.Forbidden('You don\'t have permission to do this action', ErrorCode.Common.NO_PERMISSION);
        }
      }

        break;

      default:
        break;
    }

    return true;
  }
}
