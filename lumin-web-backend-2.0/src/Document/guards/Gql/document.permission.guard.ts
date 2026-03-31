import {
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isArray } from 'lodash';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase, ValidationStrategy } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

@Injectable()
export class DocumentPermissionGuard implements CanActivate {
  constructor(
      protected readonly documentService: DocumentService,
      protected readonly membershipService: MembershipService,
      protected readonly organizationService: OrganizationService,
      protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());

    const requestData: IRequestData | IRequestData[] = this.getRequestData(request, context);
    const validationStrategy = isArray(requestData) ? ValidationStrategy.MULTIPLE_DOCUMENT : ValidationStrategy.SINGLE_DOCUMENT;

    const documentValidatorId = validationStrategy === ValidationStrategy.MULTIPLE_DOCUMENT
      ? requestData[0].documentId
      : (requestData as IRequestData).documentId;
    this.documentService.getDocumentPermissionsByDocId(documentValidatorId as string, {
      role: { $nin: ['organization', 'organization_team'] },
    });

    return VerifyDocumentPermissionBase.Organization({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      nextFunc: () => {},
      errorCallback: () => GraphErrorException.Forbidden('You have no permission'),
      data: {
        requestData,
        permissions,
      },
    }, validationStrategy);
  }

  public getRequestData(request: IGqlRequest, context: ExecutionContext): IRequestData | IRequestData[] {
    const {
      clientId, documentId, documentIds, input,
    } = context.getArgs()[1];
    const userId = request.user?._id;
    const targetClientId = input ? input.clientId : clientId;
    let targetDocumentId = input ? input.documentId : documentId;
    const targetDocumentIds = (input ? input.documentIds : documentIds) as string[];
    if (targetDocumentIds?.length) {
      if (targetDocumentIds.length > 1) {
        return targetDocumentIds.map((docId) => ({
          _id: userId,
          clientId: targetClientId,
          documentId: docId,
        }));
      }
      [targetDocumentId] = targetDocumentIds;
    }
    return {
      _id: userId,
      clientId: targetClientId,
      documentId: targetDocumentId,
    };
  }
}
