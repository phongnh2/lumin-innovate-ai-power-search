import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { AwsDocumentVersioningService } from 'Aws/aws.document-versioning.service';

import { DocumentService } from 'Document/document.service';

@Injectable()
export class DocumentVersioningStorageService {
  constructor(
    private readonly awsDocumentVersioningService: AwsDocumentVersioningService,
    private readonly documentService: DocumentService,
  ) {}

  createUploadAnnotationPresignedUrl({
    versionId,
    documentId,
    userId,
  }: {
    versionId?: string;
    documentId: Types.ObjectId;
    userId: Types.ObjectId;
  }) {
    return this.awsDocumentVersioningService.createUploadAnnotationPresignedUrl(
      { versionId, documentId, userId },
    );
  }

  async generateGetVersionPresignedUrl({
    versionId,
    documentId,
    annotationPath,
  }: {
    versionId: string;
    documentId: Types.ObjectId;
    annotationPath: string;
  }): Promise<{
    fileContentPresignedUrl: string;
    annotationPresignedUrl: string;
  }> {
    const document = await this.documentService.findOneById(String(documentId));
    if (!document) {
      throw GraphErrorException.NotFound(`Document not found: ${documentId}`);
    }
    return this.awsDocumentVersioningService.generateGetVersionPresignedUrl({
      versionId,
      documentRemoteId: document.remoteId,
      annotationPath,
    });
  }
}
