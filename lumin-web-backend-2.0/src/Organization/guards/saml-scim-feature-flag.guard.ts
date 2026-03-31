import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';

import { OrganizationService } from '../organization.service';

@Injectable()
export class SamlScimFeatureFlagGuard implements CanActivate {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const { organization, user } = request;

    let org = organization;

    if (!org) {
      const args = context.getArgs();
      const inputArgs = args[1] || {};
      const orgId = inputArgs.orgId || inputArgs.input?.orgId;

      if (orgId) {
        org = await this.organizationService.getOrgById(orgId as string);
      }
    }

    if (!org) {
      return true;
    }

    if (Boolean(org?.sso?.samlSsoConnectionId)) {
      return true;
    }

    const isFeatureEnabled = await this.featureFlagService.getFeatureIsOn({
      user,
      organization: org,
      featureFlagKey: FeatureFlagKeys.SAML_SCIM_SSO,
    });

    if (!isFeatureEnabled) {
      throw GraphErrorException.Forbidden(
        'SAML/SCIM SSO feature is not available for this organization',
        ErrorCode.Org.SAML_SCIM_NOT_AVAILABLE,
      );
    }

    return true;
  }
}
