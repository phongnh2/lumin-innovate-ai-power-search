export interface IOrganizationMemberModel {
  userId: any;
  orgId: string;
  groups: string[];
  internal: boolean;
  role: string;
  createdAt?: Date;
}

export interface IOrganizationMember extends IOrganizationMemberModel {
  _id: string;
}
export interface IOrganizationMemberData {
  userId: string;
  orgId: string;
  groups: string[];
  internal: boolean;
  role: string;
  createdAt?: Date;
}
