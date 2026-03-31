import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { OrganizationService } from '../organization.service';

@Injectable()
export class OrganizationScimGuard implements CanActivate {
  constructor(
    private readonly organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const { organization } = request;

    let orgId: string | null = null;

    // Try to get organization from context first
    if (organization) {
      orgId = organization._id;
    } else {
      // If organization is not in context, try to get orgId from arguments
      const args = context.getArgs();
      const inputArgs = args[1] || {};

      // Check for orgId in different possible locations
      orgId = inputArgs.orgId || inputArgs.input?.orgId;
    }

    if (!orgId) {
      return true;
    }

    // Check if SCIM provisioning is enabled for the organization
    const isScimEnabled = await this.isScimProvisioningEnabled(orgId);

    if (isScimEnabled) {
      throw GraphErrorException.Forbidden(
        'Action failed because SCIM provisioning is enabled for this organization',
        ErrorCode.Org.ACTION_BLOCKED_BY_SCIM,
      );
    }

    return true;
  }

  private async isScimProvisioningEnabled(orgId: string): Promise<boolean> {
    try {
      const organization = await this.organizationService.getOrgById(orgId);
      return !!(organization?.sso?.scimSsoClientId);
    } catch (error) {
      return false;
    }
  }
}
