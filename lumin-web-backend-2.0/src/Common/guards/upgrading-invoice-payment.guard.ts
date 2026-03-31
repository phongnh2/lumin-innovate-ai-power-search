import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentType } from 'graphql.schema';

@Injectable()
export class UpgradingInvoicePayment implements CanActivate {
  constructor(
    private readonly organizationService: OrganizationService,
  ) { }

  async canActivate(context: ExecutionContext) {
    const { orgId, input } = Utils.getGqlArgs(context);
    const organizationId = input ? (input?.orgId || input?.clientId || input?.targetId) : orgId;
    if (input?.clientId && input.type === PaymentType.ORGANIZATION) {
      return this.organizationService.validateUpgradingEnterprise(input?.clientId as string);
    }
    if (!organizationId) {
      throw GraphErrorException.NotAcceptable('Organization id is missing');
    }
    return this.organizationService.validateUpgradingEnterprise(organizationId as string);
  }
}
