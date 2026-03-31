import { Observable } from 'rxjs';

import { ActionTypeOfUserInOrg } from 'LuminContract/luminContract.constant';
import { IOrganizationProto } from 'Organization/interfaces/organization.interface';

export interface TransferAgreementGenDocumentsToAnotherOrgRequest {
  userId: string;
  organization: IOrganizationProto;
  destinationOrgId: string;
  actionType: ActionTypeOfUserInOrg;
}

export interface OrganizationService {
  transferAgreementGenDocumentsToAnotherOrg(req: TransferAgreementGenDocumentsToAnotherOrgRequest): Observable<{
    existAgreementGenDocuments: boolean;
  }>;
}
