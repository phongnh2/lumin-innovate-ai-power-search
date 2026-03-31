import { Utils } from 'Common/utils/Utils';

import { TeamRoles } from 'Document/enums/team.roles.enum';
import { Effect } from 'Organization/organization.enum';
import { Principal, Resource } from 'Organization/Policy/architecture/policy.enum';
import { IPolicyRequest } from 'Organization/Policy/architecture/policy.interface';
import { PolicyRetrievalPoint } from 'Organization/Policy/architecture/PRP';
import { PaymentPlanEnums } from 'Payment/payment.enum';

export class PolicyDecisionPoint {
  private readonly PRP: PolicyRetrievalPoint = new PolicyRetrievalPoint();

  public evaluate({ resource, attribute }: IPolicyRequest): boolean {
    const { operation, resourceAccess, extraInfo } = resource;
    const { role: actorRole, permissions } = attribute.actor;
    const { role: targetRole } = attribute.target || { role: null };

    const sid = this.PRP.from(operation).getSid();

    if (!sid) return false;

    const effect = permissions.find((permission) => permission.name === sid)?.effect;

    if (!effect || effect === Effect.DENY) return false;

    const principalKeys = this.PRP.from(operation).getAllPrincipalKey();

    switch (resourceAccess) {
      case Resource.ORGANIZATION:
        return principalKeys.every((key) => {
          switch (key) {
            case Principal.ROLE: {
              const acceptanceRoles = this.PRP.from(operation).getPrincipal(Principal.ROLE);
              return acceptanceRoles.includes(actorRole);
            }
            case Principal.HIGHER_ROLE_REQUIRED: {
              const higherRoleRequired = this.PRP.from(operation).getPrincipal(Principal.HIGHER_ROLE_REQUIRED);
              return targetRole && (!higherRoleRequired || Utils.isHigherRoleInOrg(actorRole, targetRole));
            }
            case Principal.HIGHER_OR_EQUAL_ROLE_REQUIRED: {
              const higherOrEqualRoleRequired = this.PRP.from(operation).getPrincipal(Principal.HIGHER_OR_EQUAL_ROLE_REQUIRED);
              return targetRole && (!higherOrEqualRoleRequired || actorRole === targetRole || Utils.isHigherRoleInOrg(actorRole, targetRole));
            }
            case Principal.PREMIUM_REQUIRED: {
              const premiumRequired = this.PRP.from(operation).getPrincipal(Principal.PREMIUM_REQUIRED);
              return !premiumRequired || extraInfo.isPremiumOrganization;
            }
            case Principal.PREMIUM_PRODUCTS_REQUIRED: {
              const premiumProductsRequired = this.PRP.from(operation).getPrincipal(Principal.PREMIUM_PRODUCTS_REQUIRED) as string[];
              const premiumProducts = extraInfo.premiumProducts || [];
              const isIncludeProducts = premiumProductsRequired.some((product) => premiumProducts.includes(product));
              return !premiumProductsRequired || isIncludeProducts;
            }
            case Principal.INTERNAL_REQUIRED: {
              const internalRequired = this.PRP.from(operation).getPrincipal(Principal.INTERNAL_REQUIRED);
              return !internalRequired || extraInfo.isInternalMember;
            }
            case Principal.PLAN: {
              const plans = this.PRP.from(operation).getPrincipal(Principal.PLAN);
              return !plans.length || plans.includes(extraInfo.orgPlan);
            }
            case Principal.ASSOCIATED_DOMAIN_REQUIRED: {
              const associatedDomainRequired = this.PRP.from(operation).getPrincipal(Principal.ASSOCIATED_DOMAIN_REQUIRED);
              return !associatedDomainRequired || extraInfo.associatedDomains.length !== 0;
            }
            case Principal.ORGANIZATION_FREE_REQUIRED_WITH_ROLE: {
              const isFreeOrganization = extraInfo.orgPlan === PaymentPlanEnums.FREE;
              const acceptanceRoles = this.PRP.from(operation).getPrincipal(Principal.ORGANIZATION_FREE_REQUIRED_WITH_ROLE);
              if (acceptanceRoles.includes(actorRole)) {
                return isFreeOrganization;
              }
              return true;
            }
            case Principal.OLD_PLAN_UNSUPPORTED: {
              const oldPlanUnsupported = this.PRP.from(operation).getPrincipal(Principal.OLD_PLAN_UNSUPPORTED);
              return !oldPlanUnsupported || ![PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(extraInfo.orgPlan);
            }
            default:
          }
          return false;
        });
      case Resource.ORGANIZATION_TEAM: {
        return principalKeys.every((key) => {
          switch (key) {
            case Principal.TEAM_ADMIN_REQUIRED: {
              const adminRoleRequired = this.PRP.from(operation).getPrincipal(Principal.TEAM_ADMIN_REQUIRED);
              return !adminRoleRequired || actorRole === TeamRoles.ADMIN;
            }
            default:
          }
          return false;
        });
      }
      default:
        break;
    }
    return false;
  }
}
