import {
  CanActivate, ExecutionContext, Injectable, applyDecorators, UseGuards, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isArray } from 'lodash';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';
import { IRequestTemplateData } from 'Template/guards/request.template.data.interface';
import { VerifyTemplatePermissionBase, ValidationStrategy } from 'Template/guards/template.verify.permission.base';
import { TemplateService } from 'Template/template.service';

@Injectable()
export class TemplateLevelGuardInstance implements CanActivate {
  constructor(
    protected readonly templateSerivce: TemplateService,
    protected readonly membershipService: MembershipService,
    protected readonly organizationService: OrganizationService,
    protected readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const templatePermissions = this.reflector.get<string[]>('templatePermissions', context.getHandler());

    const requestData: IRequestTemplateData | IRequestTemplateData[] = this.getRequestData(request, context);

    const validationStrategy = isArray(requestData) ? ValidationStrategy.MULTIPLE_TEMPLATE : ValidationStrategy.SINGLE_TEMPLATE;

    return VerifyTemplatePermissionBase.All({
      templateService: this.templateSerivce,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      error: GraphErrorException.Forbidden('You have no permission'),
      data: {
        requestData,
        permissions: templatePermissions,
      },
    }, validationStrategy);
  }

  public getRequestData(request: IGqlRequest, context: ExecutionContext): IRequestTemplateData | IRequestTemplateData[] {
    const { input = {}, templateId } = context.getArgs()[1];
    const userId = request.user?._id;
    const targetTemplateId = input.templateId || templateId;
    return {
      userId,
      templateId: targetTemplateId,
    };
  }
}

export function TemplateLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('templatePermissions', permissions),
    UseGuards(GqlAuthGuard, TemplateLevelGuardInstance),
  );
}
