import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { IVerifyData, IPreprocessData, IRequestData } from 'Organization/guards/guards.organization.interface';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';

export interface OrganizationAlgorithm {
  executeAlgorithm(verifyData: IVerifyData): Promise<boolean>;
}

export async function preprocess(resourceAccess: string, preprocessData: IPreprocessData): Promise<IVerifyData> {
  const {
    organizationService,
    organizationTeamService,
    injectCallback, data: requestData,
  } = preprocessData;
  const { orgUrl, orgId, orgTeamId } = requestData.resource;
  const { email: actorEmail } = requestData.actor;
  const actorEmailDomain = Utils.getEmailDomain(actorEmail);
  const team = orgTeamId && await organizationTeamService.getOrgTeamById(orgTeamId);
  const organization = (orgId && await organizationService.getOrgById(orgId))
  || (orgUrl && await organizationService.getOrgByUrl(orgUrl))
  || (team?.belongsTo && await organizationService.getOrgById(team.belongsTo as string));

  switch (resourceAccess) {
    case Resource.ORGANIZATION:
      if (!organization) {
        throw GraphErrorException.NotFound('Organization not found', ErrorCode.Common.NOT_FOUND);
      }
      break;
    case Resource.ORGANIZATION_TEAM: {
      if ((orgTeamId && !team) || !organization) {
        throw GraphErrorException.NotFound('Organization team not found', ErrorCode.Common.NOT_FOUND);
      }
      break;
    }
    default:
      break;
  }

  injectCallback({ organization, team });

  return {
    organizationService,
    organizationTeamService,
    data: {
      ...requestData,
      resource: {
        ...requestData.resource,
        resourceAccess,
        orgId: organization?._id,
        orgTeamId: team?._id,
        extraInfo: {
          isPremiumOrganization: organization?.payment && organization.payment.type !== 'FREE',
          isInternalMember: organization.associateDomains.includes(actorEmailDomain) || organization.domain === actorEmailDomain,
          securitySetting: organization?.settings,
          orgDomain: organization?.domain,
          inScheduledDelete: Boolean(organization?.deletedAt),
          orgPlan: organization.payment.type,
          associatedDomains: [
            ...organization.associateDomains,
          ],
          premiumProducts: PaymentUtilsService.getPremiumProducts(organization.payment),
        },
      },
    },
  } as IVerifyData;
}

export function verifyOrganizationSecurity({ actor, resource }: IRequestData): boolean {
  const { googleSignIn } = resource.extraInfo.securitySetting;
  if (googleSignIn && resource.extraInfo.isInternalMember) {
    return actor.isLoginWithGoogle;
  }
  return true;
}

export function isScheduledDelete({ resource } : IRequestData): boolean {
  return resource.extraInfo.inScheduledDelete;
}
