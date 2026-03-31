import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { CustomRulesGuard } from 'CustomRules/custom.rules.guard';

import { AdminService } from 'Admin/admin.service';
import { AdminRole } from 'graphql.schema';

@Injectable()
export class AdminRoleGuardInstance implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const { user: { _id: userId } } = request;
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    const currentAdminInfo = await this.adminService.findById(userId as string);
    request.user = currentAdminInfo;
    if ((currentAdminInfo.role === AdminRole.OWNER)
      || permissions.includes(currentAdminInfo.role)) {
      return true;
    }
    throw GraphErrorException.Forbidden('You don\'t have permission to do this action');
  }
}

export function AdminRoleGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(AdminRoleGuardInstance, CustomRulesGuard),
  );
}
