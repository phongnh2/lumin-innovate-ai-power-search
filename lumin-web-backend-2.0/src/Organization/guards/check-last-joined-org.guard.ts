import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';

@Injectable()
export class CheckLastJoinedOrgGuard implements CanActivate {
  constructor(private readonly organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext) {
    const request = Utils.getGqlRequest(context);
    const { user } = request;

    const userInActiveOrgs = await this.organizationService.getOrgListByUser(
      user._id as string,
      {
        filterQuery: {
          $or: [
            { deletedAt: { $exists: false } },
            { deletedAt: { $eq: null } },
          ],
        },
      },
    );
    const isPremiumUser = (user.payment.type as PaymentPlanEnums) !== PaymentPlanEnums.FREE;

    if (userInActiveOrgs.length === 1 && !isPremiumUser) {
      throw GraphErrorException.NotAcceptable(
        'Can not leave/delete last joined organization',
        ErrorCode.Org.LAST_JOINED_ORGANIZATION,
      );
    }

    return true;
  }
}
