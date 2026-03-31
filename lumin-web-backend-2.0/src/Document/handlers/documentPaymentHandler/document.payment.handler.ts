import {
  ExecutionContext,
} from '@nestjs/common';

import { DocumentService } from 'Document/document.service';
import { IUpdateDocStackCommand } from 'Document/handlers/documentPaymentHandler/interface/document.payment.request';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';

class DocumentPaymentHandler {
  constructor(
    private readonly documentService: DocumentService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationService,
    private readonly organizationDocStackService: OrganizationDocStackService,
  ) {}

  async getDefaultDocumentPermissionTarget(documentId: string): Promise<{ _id: string, info: IOrganization }> {
    return this.documentService.getOrganizationOwnedDocument(documentId);
  }

  destructGraphqlContext(context: ExecutionContext): { documentId: string, operation: string } {
    const {
      documentId, input,
    } = context.getArgs()[1];
    const targetDocumentId = input ? input.documentId : documentId;
    const operation = context.getArgs()[3].fieldName;
    return {
      documentId: targetDocumentId,
      operation,
    };
  }

  destructWsContext(context: ExecutionContext): { documentId: string, operation: string } {
    const operation = context.getHandler().name;
    const documentId = context.getArgByIndex(1)?.documentId || '';
    return {
      documentId,
      operation,
    };
  }

  destructProperty(context: ExecutionContext): { documentId: string, operation: string } {
    const contextType = context.getType();
    switch (contextType) {
      case 'ws':
        return this.destructWsContext(context);
      default:
        return this.destructGraphqlContext(context);
    }
  }

  async execUpdateRequest(updatedCommand: IUpdateDocStackCommand): Promise<void> {
    await this.organizationDocStackService.updateManyDocStack(updatedCommand);
    this.organizationDocStackService.notifyStackChanged(updatedCommand.conditions.orgId);
  }
}

export default DocumentPaymentHandler;
