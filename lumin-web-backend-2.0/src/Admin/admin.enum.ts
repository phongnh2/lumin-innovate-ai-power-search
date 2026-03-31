import { AdminRole } from 'graphql.schema';

export enum AdminRoleLevel {
  OWNER = 3,
  SUPER_ADMIN = 2,
  ADMIN = 1,
  MODERATOR = 0,
}

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
}

export enum AdminOperationRule {
  HIGHER_ROLE_REQUIRED = 'HIGHER_ROLE_REQUIRED',
}

export type AdminRoleType = keyof typeof AdminRole

export enum UpgradeEnterpriseStatus {
  PENDING = 'pending',
  EXPIRED = 'expired',
}
