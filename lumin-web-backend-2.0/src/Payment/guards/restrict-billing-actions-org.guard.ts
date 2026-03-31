import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { OrganizationService } from 'Organization/organization.service';

@Injectable()
export class RestrictBillingActionsOrgGuard implements CanActivate {
  private readonly restrictedBillingActionsOrgIds: string[];

  constructor(private readonly organizationService: OrganizationService) {}

  canActivate(context: ExecutionContext) {
    const request = Utils.getGqlRequest(context);
    const {
      body: {
        variables: {
          clientId: queryId,
          input: { clientId: mutationId = '' } = {},
        },
      },
      organization,
    } = request;
    const clientId = queryId || mutationId || organization?._id;

    if (
      this.organizationService.isRestrictedBillingActions(clientId as string)
    ) {
      throw GraphErrorException.Forbidden('You do not have permission!', ErrorCode.Payment.ACTION_RESTRICTED);
    }

    return true;
  }
}
