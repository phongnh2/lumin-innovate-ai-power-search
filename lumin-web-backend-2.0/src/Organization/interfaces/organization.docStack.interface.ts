export interface IOrganizationDocStackModel {
  orgId: string;
  documentId: string;
  expireAt: Date;
  createdAt: Date;
}

export interface IOrganizationDocStack extends IOrganizationDocStackModel {
  _id: string;
}
