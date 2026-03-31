import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { Utils } from 'Common/utils/Utils';

import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { IUser } from 'User/interfaces/user.interface';

import { IntegrationOrganizationService } from '../Integration.organization.service';

export interface GrpcRequestWithOrganization {
  organization?: IOrganization;
  membership?: IOrganizationMember;
  user?: IUser;
  [key: string]: any;
}

export interface ValidatedOrganizationData {
  organization: IOrganization;
  membership: IOrganizationMember;
  user: IUser;
}

export const ValidatedOrganization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ValidatedOrganizationData => {
    const request = Utils.getRpcRequest(ctx) as GrpcRequestWithOrganization;
    if (!request.organization || !request.membership || !request.user) {
      throw GrpcErrorException.Internal(
        'You do not have permission.',
        ErrorCode.Common.NO_PERMISSION,
      );
    }
    return {
      organization: request.organization,
      membership: request.membership,
      user: request.user,
    };
  },
);

export const GrpcInput = createParamDecorator(
  <T>(_: unknown, ctx: ExecutionContext): T => {
    const args = ctx.getArgs();
    return args[0] as T;
  },
);

@Injectable()
export class OrganizationMembershipGuardInstance implements CanActivate {
  constructor(
    private readonly integrationOrganizationService: IntegrationOrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getRpcRequest(context) as GrpcRequestWithOrganization;
    const args = context.getArgs();

    const input = args[0] as {
      workspace_id?: string;
      user_id?: string;
      [key: string]: any;
    };

    const organizationId = input.workspace_id;
    const userId = input.user_id;

    if (!organizationId) {
      throw GrpcErrorException.InvalidArgument(
        'Workspace ID is required',
        ErrorCode.Common.INVALID_INPUT,
      );
    }

    if (!userId) {
      throw GrpcErrorException.InvalidArgument(
        'User ID is required',
        ErrorCode.Common.INVALID_INPUT,
      );
    }

    const { organization, membership, user } = await this.integrationOrganizationService.validateOrganizationAndMembership(
      organizationId,
      userId,
    );

    request.organization = organization;
    request.membership = membership;
    request.user = user;

    return true;
  }
}

export function OrganizationMembershipGuard() {
  return applyDecorators(UseGuards(OrganizationMembershipGuardInstance));
}
