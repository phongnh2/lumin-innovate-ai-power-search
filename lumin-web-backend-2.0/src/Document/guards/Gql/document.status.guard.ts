import {
  CanActivate, ExecutionContext, Injectable, UseGuards, SetMetadata, applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DocumentService } from 'Document/document.service';
import { Document } from 'graphql.schema';

@Injectable()
export class DocumentStatusGuardInstance implements CanActivate {
  constructor(
    protected readonly documentService: DocumentService,
    protected readonly reflector: Reflector,
  ) {}

  private async checkDocumentLimited(documentId): Promise<boolean> {
    const document = await this.documentService.getDocumentByDocumentId(documentId as string);
    if (!document) {
      return false;
    }

    const isOverTimeLimit = await this.documentService.hasDocumentBeenLimited(
      document as unknown as Document,
    );

    return !isOverTimeLimit;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const preventIfExpired = this.reflector.get<boolean>('preventIfExpired', context.getHandler());

    const { documentId: inputDocumentId, documentIds: inputDocumentIds, input } = context.getArgs()[1];

    const documentId = input ? input.documentId : inputDocumentId;
    const documentIds = input ? input.documentIds : inputDocumentIds;

    if (preventIfExpired) {
      if (documentIds) {
        const documentStatus = await Promise.all(documentIds.map((item) => this.checkDocumentLimited(item)));
        return documentStatus.every(Boolean);
      }

      return this.checkDocumentLimited(documentId);
    }

    return true;
  }
}

export function DocumentStatusGuard({ preventIfExpired }: Record<string, boolean>) {
  return applyDecorators(
    SetMetadata('preventIfExpired', preventIfExpired),
    UseGuards(DocumentStatusGuardInstance),
  );
}
