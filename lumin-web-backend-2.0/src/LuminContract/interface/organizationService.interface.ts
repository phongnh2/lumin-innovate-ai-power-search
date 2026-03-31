import { Observable } from 'rxjs';

import { SignDocStackStorage } from 'graphql.schema';
import { ActionTypeOfUserInOrg } from 'LuminContract/luminContract.constant';
import { IOrganizationProto } from 'Organization/interfaces/organization.interface';
import { IPaymentProto } from 'Payment/interfaces/payment.interface';

export interface DeleteDataInWorkspaceRequest {
  organization: IOrganizationProto;
  userId: string;
  action: string;
}

export interface TransferAgreementsToAnotherOrgRequest {
  userId: string;
  organization: IOrganizationProto;
  destinationOrgId: string;
  actionType: ActionTypeOfUserInOrg;
}

export interface PublishUpdateOrganizationRequest {
  organization: IOrganizationProto;
  receiverIds: string[];
}

export interface UpdateSubscriptionOfMemberInWorkspaceRequest {
  ownerId: string;
  billingModeratorIds: string[];
  memberIds: string[];
}

export interface GetContractStackInfoRequest {
  organizationId: string;
  userId: string;
}

export interface GetContractStackInfoResponse {
  data: SignDocStackStorage;
}
export interface OrganizationService {
  deleteDataInWorkspace(req: DeleteDataInWorkspaceRequest): Observable<void>;
  transferAgreementsToAnotherOrg(req: TransferAgreementsToAnotherOrgRequest): Observable<{
    existAgreement: boolean;
  }>;
  publishUpdateOrganization(req: PublishUpdateOrganizationRequest): Observable<void>;
  updateSubscriptionOfMemberInWorkspace(req: UpdateSubscriptionOfMemberInWorkspaceRequest): Observable<{
    proUserIds: string[];
    ownerPayment: IPaymentProto;
  }>;
  getContractStackInfo(req: GetContractStackInfoRequest): Observable<GetContractStackInfoResponse>;
}
