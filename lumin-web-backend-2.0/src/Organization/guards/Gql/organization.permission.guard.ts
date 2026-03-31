import {
  CanActivate, ExecutionContext, Injectable, UseGuards, applyDecorators, SetMetadata, CustomDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DefaultErrorCode, ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { CustomRulesGuard } from 'CustomRules/custom.rules.guard';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { LoginService } from 'graphql.schema';
import {
  IRequestData, IVerifyData, IPreprocessData, IResourceRequestData, ITargetRequestData,
} from 'Organization/guards/guards.organization.interface';
import { PrivateOrganizationAlgorithm } from 'Organization/guards/private.organization.algorithm';
import { PublicOrganizationAlgorithm } from 'Organization/guards/public.organization.algorithm';
import {
  OrganizationAlgorithm,
  preprocess,
  verifyOrganizationSecurity,
  isScheduledDelete,
} from 'Organization/guards/strategy.organization.algorithm';
import { OrganizationValidationStrategy } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';

@Injectable()
class OrganizationPermissionGuardInstance implements CanActivate {
  constructor(
    protected readonly organizationService: OrganizationService,
    protected readonly organizationTeamService: OrganizationTeamService,
    protected readonly reflector: Reflector,
  ) {}

  private readonly privateStrategy: OrganizationAlgorithm = new PrivateOrganizationAlgorithm();

  private readonly publicStrategy: OrganizationAlgorithm = new PublicOrganizationAlgorithm();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context) as IGqlRequest & Record<string, unknown>;
    const [scope, resourceAccess] = this.reflector.get<string[]>('scope', context.getClass());
    const allowExecInDeleteProcess = this.reflector.get<string>('allowExecInDeleteProcess', context.getHandler());
    const preventExecInDeleteProcess = this.reflector.get<string>('preventExecInDeleteProcess', context.getHandler());
    const requestData: IRequestData = this.getRequestData(request, context);
    const preprocessData = {
      organizationService: this.organizationService,
      organizationTeamService: this.organizationTeamService,
      injectCallback: ({ organization, team }) => {
        Utils.appendMetadataToArgs(context, { organization, team });
        request.organization = organization;
        request.team = team;
      },
      data: requestData,
    } as IPreprocessData;

    const verifyData: IVerifyData = await preprocess(resourceAccess, preprocessData);
    const status = await this.getPermissionStatus(scope, verifyData, {
      privateAllowExec: Boolean(allowExecInDeleteProcess),
      publicPreventExec: Boolean(preventExecInDeleteProcess),
    });

    if (!status.allowExecute) {
      throw (status.reasonIfNotAllow || GraphErrorException.Forbidden('Forbidden Resource', DefaultErrorCode.FORBIDDEN));
    }

    return true;
  }

  private async getPermissionStatus(scope: string, verifyData: IVerifyData, {
    privateAllowExec,
    publicPreventExec,
  }: { privateAllowExec: boolean, publicPreventExec: boolean }): Promise<Record<string, unknown>> {
    switch (scope) {
      case OrganizationValidationStrategy.PRIVATE: {
        if (isScheduledDelete(verifyData.data) && !privateAllowExec) {
          return {
            allowExecute: false,
            reasonIfNotAllow: GraphErrorException.BadRequest('Organization has been processed to delete', ErrorCode.Org.SCHEDULED_DELETE),
          };
        }
        return { allowExecute: verifyOrganizationSecurity(verifyData.data) && await this.privateStrategy.executeAlgorithm(verifyData) };
      }
      case OrganizationValidationStrategy.PUBLIC: {
        if (isScheduledDelete(verifyData.data) && publicPreventExec) {
          return {
            allowExecute: false,
            reasonIfNotAllow: GraphErrorException.BadRequest('Organization has been processed to delete', ErrorCode.Org.SCHEDULED_DELETE),
          };
        }
        return { allowExecute: await this.publicStrategy.executeAlgorithm(verifyData) };
      }
      default:
        return { allowExecute: false };
    }
  }

  private getRequestData(request: IGqlRequest, context: ExecutionContext): IRequestData {
    const inputArgs: Record<string, unknown> = context.getArgs()[1];
    return {
      actor: {
        _id: request.user?._id,
        email: request.user?.email,
        isLoginWithGoogle: request.user?.loginService === LoginService.GOOGLE,
      },
      target: this.interceptRequestTarget(inputArgs),
      resource: {
        ...this.interceptRequestResource(inputArgs),
        operation: context.getArgs()[3].fieldName,
      },
    };
  }

  private interceptRequestTarget(args: Record<string, any>): ITargetRequestData {
    const {
      input, userId, email,
    } = args;
    return {
      _id: input ? input.userId : userId,
      email: input ? input.email : email,
    };
  }

  private interceptRequestResource(args: Record<string, any>): IResourceRequestData {
    const {
      input, orgId, teamId, url,
    } = args;
    return {
      orgId: input ? input.orgId : orgId,
      orgUrl: input ? input.url : url,
      orgTeamId: input ? input.teamId : teamId,
      operation: '',
      resourceAccess: '',
      extraInfo: {
        isPremiumOrganization: false,
        isInternalMember: false,
        securitySetting: null,
        orgDomain: '',
        inScheduledDelete: false,
        orgPlan: PaymentPlanEnums.FREE,
        associatedDomains: [],
        premiumProducts: [],
      },
    };
  }
}

export function OrganizationPermissionGuard(...scope: string[]) {
  return applyDecorators(
    SetMetadata('scope', scope),
    UseGuards(GqlAuthGuard, CustomRulesGuard, OrganizationPermissionGuardInstance),
  );
}

export const AllowInDeleteProcess = (): CustomDecorator<string> => SetMetadata('allowExecInDeleteProcess', true);

export const PreventInDeleteProcess = (): CustomDecorator<string> => SetMetadata('preventExecInDeleteProcess', true);
