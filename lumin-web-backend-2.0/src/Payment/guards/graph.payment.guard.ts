/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { PaymentType } from 'graphql.schema';
import { OrganizationService } from 'Organization/organization.service';
import { UserService } from 'User/user.service';

@Injectable()
export default class GqlPaymentGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
    private readonly organizationService: OrganizationService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    const request = Utils.getGqlRequest(context);
    const {
      user,
      body: {
        variables: {
          clientId: queryId,
          input: {
            clientId: mutationId = '',
          } = {},
        },
      },
    } = request;
    const { _id } = user;
    const clientId = queryId || mutationId;

    const isPersonal = _id === clientId;

    if (!clientId || isPersonal) {
      request.data = await this.userService.findUserById(_id);
      request.data.resourceType = PaymentType.INDIVIDUAL;
    } else {
      const orgMembership = await this.organizationService.getMembershipByOrgAndUser(clientId, _id);
      if (!orgMembership) {
        throw GraphErrorException.Unauthorized('You have no permission');
      }
      if (!permissions.includes(orgMembership.role)) {
        throw GraphErrorException.Unauthorized('You have no permission');
      }
      request.data = await this.organizationService.getOrgById(clientId);
      request.data.resourceType = PaymentType.ORGANIZATION;
    }
    return true;
  }
}
