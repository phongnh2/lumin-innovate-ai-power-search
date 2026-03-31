import { AdminOperationRule } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';

export interface IAdminRequestData {
  _id?: string;
  email?: string;
}

export interface IRequestData {
  actor: IAdminRequestData,
  target: IAdminRequestData,
}

export interface InjectService {
  adminService: AdminService,
}

export interface AdminRuleValidationData {
  rules: AdminOperationRule[],
  data: Record<string, any>,
  injectService: InjectService,
}

export type OperationRuleHandler = (
  data?: Record<string, any>,
  injectService?: InjectService
) => Promise<boolean> | boolean

export interface IAdminRuleHandler {
  validate(data: AdminRuleValidationData): Promise<boolean>,
  getHandler(rule: AdminOperationRule): OperationRuleHandler,
}
