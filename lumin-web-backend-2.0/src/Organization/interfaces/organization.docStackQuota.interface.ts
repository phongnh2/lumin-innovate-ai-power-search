export interface IOrganizationDocStackQuotaModel {
  orgId: string;
  docStack: number;
  expireAt: Date;
  createdAt: Date;
}

export interface IOrganizationDocStackQuota extends IOrganizationDocStackQuotaModel {
  _id: string;
}
