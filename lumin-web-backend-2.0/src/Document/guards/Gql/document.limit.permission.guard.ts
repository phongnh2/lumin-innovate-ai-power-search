import {
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { DocumentService } from 'Document/document.service';
import DocumentPaymentHandler from 'Document/handlers/documentPaymentHandler/document.payment.handler';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';

@Injectable()
export class DocumentPaymentGuard implements CanActivate {
  private handler: DocumentPaymentHandler;

  constructor(
      protected readonly documentService: DocumentService,
      protected readonly teamService: TeamService,
      protected readonly organizationService: OrganizationService,
      protected readonly organizationDocStackService: OrganizationDocStackService,
      protected readonly reflector: Reflector,
  ) {
    this.handler = new DocumentPaymentHandler(
      documentService,
      teamService,
      organizationService,
      organizationDocStackService,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { documentId, totalDocumentInput } = this.getDocumentId(context);
    if (!documentId) {
      return true;
    }
    const contextRequest = Utils.getGqlRequest(context);
    const isRequestFromMobile = await Utils.isRequestFromMobile(contextRequest);
    if (isRequestFromMobile) {
      return true;
    }
    const { info: orgInfo } = await this.handler.getDefaultDocumentPermissionTarget(documentId);
    if (!orgInfo) {
      return true;
    }
    const hasFinishedDocument = await this.organizationDocStackService.hasFinishedDocument({ documentId, orgId: orgInfo._id });
    if (!hasFinishedDocument) {
      const canFinishDocument = await this.organizationDocStackService.validateIncreaseDocStack(orgInfo, {
        totalNewDocument: totalDocumentInput,
      });
      if (!canFinishDocument) {
        throw GraphErrorException.NotAcceptable(
          'You currently reached monthly document stack limitation',
          ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT,
        );
      }
    }
    return true;
  }

  public getDocumentId(context: ExecutionContext): { documentId: string, totalDocumentInput: number } {
    const {
      documentId, documentIds, input,
    } = context.getArgs()[1];
    const targetDocumentId = input ? input.documentId : documentId;
    const targetDocumentIds = (input ? input.documentIds : documentIds) as string[];

    const totalDocumentInput = targetDocumentId ? 1 : targetDocumentIds.length;

    const docId = targetDocumentId || targetDocumentIds.length && targetDocumentIds[0];

    return {
      documentId: docId,
      totalDocumentInput,
    };
  }
}
