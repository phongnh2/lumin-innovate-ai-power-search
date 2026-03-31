/* eslint-disable @typescript-eslint/unbound-method */
import {
  AdminRuleValidationData,
  IAdminRuleHandler,
  OperationRuleHandler,
  IRequestData,
} from 'Admin/interfaces/admin.guard.interface';

import { AdminService } from 'Admin/admin.service';
import { AdminOperationRule } from 'Admin/admin.enum';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

export class AdminRuleHandler implements IAdminRuleHandler {
  async validate(requestData: AdminRuleValidationData): Promise<boolean> {
    const { data, rules, injectService } = requestData;
    const validationResults = await Promise.all(rules.map((rule) => {
      const handler = this.getHandler(rule);
      return handler(data, injectService);
    }));
    const isValid = validationResults.every(Boolean);
    if (!isValid) {
      throw GraphErrorException.Forbidden('You doesn\'t satisfy some pre-conditions to do this action');
    }
    return true;
  }

  getHandler(rule: AdminOperationRule): OperationRuleHandler {
    let handler: OperationRuleHandler;
    switch (rule) {
      case AdminOperationRule.HIGHER_ROLE_REQUIRED:
        handler = this.validateHigherRoleRule;
        break;
      default:
        handler = () => true;
        break;
    }
    return handler;
  }

  private validateHigherRoleRule(data: IRequestData, injectService: { adminService: AdminService }): Promise<boolean> {
    const { actor: { _id: actorId }, target: { _id: targetId } } = data;
    const { adminService } = injectService;
    return adminService.checkHigherRoleActor(actorId, targetId);
  }
}
