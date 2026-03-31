import { Injectable, NotFoundException } from '@nestjs/common';

import { AwsService } from 'Aws/aws.service';

import { DocumentStorageEnum } from 'Document/document.enum';
import { IDocument } from 'Document/interfaces';
import { DocumentInfo } from 'Document/interfaces/documentGrpc.interface';

import { DocumentService } from '../document.service';
import { DocumentOutlineService } from '../documentOutline.service';

@Injectable()
export class DocumentPageToolsService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly awsService: AwsService,
    private readonly documentOutlineService: DocumentOutlineService,
  ) {}

  async getFormFieldByDocumentId(documentId: string, {
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }) {
    const actualLimit = limit + 1;
    const formFields = (await this.documentService.getFormFieldByDocumentId(documentId, null, {
      skip,
      limit: actualLimit,
    }));
    const hasMore = formFields.length > limit;
    const slicedFormFields = hasMore ? formFields.slice(0, limit) : formFields;

    return {
      data: slicedFormFields,
      hasMore,
    };
  }

  async getOutlineByDocumentId(documentId: string, {
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }) {
    const actualLimit = limit + 1;
    const outlines = await this.documentOutlineService.findDocumentOutlines({ documentId }, null, {
      skip,
      limit: actualLimit,
    });
    const hasMore = outlines.length > limit;
    const slicedOutlines = hasMore ? outlines.slice(0, limit) : outlines;

    return {
      data: slicedOutlines,
      hasMore,
    };
  }

  async getSignedUrl({ document, keyFile }: { document: IDocument, keyFile: string }) {
    if (document.service as DocumentStorageEnum === DocumentStorageEnum.S3) {
      return this.awsService.getSignedUrl({
        keyFile,
      });
    }
    if (document.service as DocumentStorageEnum === DocumentStorageEnum.GOOGLE && document.temporaryRemoteId) {
      return this.awsService.getSignedUrl({
        keyFile: document.temporaryRemoteId,
      });
    }
    return null;
  }

  async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
    const document = await this.documentService.findOneById(documentId, {
      _id: 1,
      name: 1,
      service: 1,
      mimeType: 1,
      size: 1,
      remoteId: 1,
      shareSetting: 1,
      temporaryRemoteId: 1,
      manipulationStep: 1,
      createdAt: 1,
      externalStorageAttributes: 1,
    });
    if (!document) {
      throw new NotFoundException('Document not found or deleted');
    }

    const [signedUrl, imageSignedUrls] = await Promise.all([
      this.getSignedUrl({ document, keyFile: document.remoteId }),
      this.documentService.getImageSignedUrlsById(documentId),
    ]);
    return {
      ...document,
      signedUrl,
      imageSignedUrls,
    };
  }
}
