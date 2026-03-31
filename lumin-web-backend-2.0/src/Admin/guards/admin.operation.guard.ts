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

import { AdminOperationRule } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';
import { AdminRuleHandler } from 'Admin/guards/Helper/admin.rule.handler';
import { IRequestData } from 'Admin/interfaces/admin.guard.interface';

@Injectable()
export class AdminOperationGuardInstance implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly reflector: Reflector,
  ) { }

  private readonly adminRuleHandler = new AdminRuleHandler();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<AdminOperationRule[]>('rules', context.getHandler());

    if (!rules) {
      throw GraphErrorException.NotAcceptable('Conditions are not defined');
    }

    const interceptedData = this.interceptRequestData(context);
    return this.adminRuleHandler.validate({
      rules,
      data: interceptedData,
      injectService: {
        adminService: this.adminService,
      },
    });
  }

  private interceptRequestData(context: ExecutionContext): IRequestData {
    const request = Utils.getGqlRequest(context);
    const { user: { _id: actorId, email: actorEmail } } = request;
    const {
      input, adminId, email,
    } = context.getArgs()[1];
    return {
      actor: {
        _id: actorId,
        email: actorEmail,
      },
      target: {
        _id: input?.adminId || adminId,
        email: input?.email || email,
      },
    };
  }
}

export function AdminOperationGuard(...rules: string[]) {
  return applyDecorators(
    SetMetadata('rules', rules),
    UseGuards(AdminOperationGuardInstance),
  );
}
