import { AdminStatus, UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { AdminSetRole, AdminRole } from 'graphql.schema';
import { UpgradeInvoicePlanEnums } from 'Payment/payment.enum';

export interface IAdminModel {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  timezoneOffset: number;
  createdAt: Date;
  avatarRemoteId: string;
  status: AdminStatus;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAdmin extends IAdminModel {
  _id: string
}

export type CreatedAdmin = Omit<Partial<IAdmin>, keyof { role: AdminRole }> & { role: AdminSetRole }

export interface IEnterpriseInvoiceModel {
  orgId: any;
  invoiceId: string;
  status: UpgradeEnterpriseStatus;
  plan: UpgradeInvoicePlanEnums;
}

export interface IEnterpriseInvoice extends IEnterpriseInvoiceModel {
  _id: string
}

export interface ICreateEnterpriseInvoice {
  orgId: string;
  invoiceId: string;
  status: UpgradeEnterpriseStatus;
  plan: UpgradeInvoicePlanEnums;
}
