import { Effect } from 'Organization/organization.enum';

export interface Permission {
  name: string;
  effect: Effect;
}
export interface IOrganizationGroupPermissionModel {
  name: string;
  resource: string;
  refId: any;
  permissions: Permission[];
  version: number;
  createdAt: Date;
}

export interface IOrganizationGroupPermission extends IOrganizationGroupPermissionModel {
  _id: string;
}

export interface IOrganizationGroupPermissionData {
  name: string;
  resource: string;
  refId: string;
  permissions: Permission[];
  version: number;
  createdAt?: Date;
}
