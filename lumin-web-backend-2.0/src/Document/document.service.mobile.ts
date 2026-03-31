// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../global.d.ts" />

import {
  Injectable, forwardRef, Inject,
} from '@nestjs/common';
import * as mime from 'mime-types';
import { v4 as uuid } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { Callback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';
import {
  DocumentOwnerTypeEnum,
  DocumentStorageEnum,
} from 'Document/document.enum';
import {
  IDocument,
} from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import {
  Document,
  TypeOfDocument,
} from 'graphql.schema';

import { DocumentService } from './document.service';

@Injectable()
export class DocumentServiceMobile {
  documentTimeLimit = '';

  staticUrl: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Callback(RedisConstants.REDIS_EXPIRED) private readonly callbackService: CallbackService,

  ) { }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async createDocumentWithBufferData({
    clientId, doc, thumbnail, uploader, docType, folderId,
  }: {
    clientId: string,
    doc: FileData,
    thumbnail: FileData,
    uploader: Record<string, string>,
    docType: DocumentOwnerTypeEnum,
    folderId?: string,
  }, metadata?: {
    documentName?: string,
    thumbnailKey?: string,
    manipulationStep?: string,
  }): Promise<IDocument> {
    const {
      fileBuffer: docBuffer, mimetype: docMimetype, filename: docName, filesize: docSize,
    } = doc;
    const { documentName, thumbnailKey, manipulationStep } = metadata || {};
    const {
      fileBuffer: thumbBuffer, mimetype: thumbMimetype,
    } = thumbnail || {};
    const [docKeyFile, thumbKeyFile] = await Promise.all(
      [this.awsService.uploadDocumentWithBuffer(docBuffer, docMimetype),
        thumbBuffer && this.awsService.uploadThumbnailWithBuffer(thumbBuffer, thumbMimetype)],
    );
    const isPersonal = DocumentOwnerTypeEnum.PERSONAL === docType;
    const newDocumentName = documentName ? `${documentName}.${mime.extension(docMimetype)}` : docName;

    const namingDocument = await this.documentService.getDocumentNameAfterNaming({
      clientId,
      fileName: newDocumentName,
      documentFolderType: docType,
      mimetype: docMimetype,
    });
    const documentThumbnail = thumbKeyFile || thumbnailKey;
    const documentData = {
      name: namingDocument,
      remoteId: docKeyFile,
      mimeType: docMimetype,
      size: docSize,
      service: DocumentStorageEnum.S3,
      isPersonal,
      lastModifiedBy: uploader._id,
      ownerId: uploader._id,
      shareSetting: {},
      ...documentThumbnail && { thumbnail: documentThumbnail },
      manipulationStep,
      ...(folderId && { folderId }),
    };
    return this.documentService.createDocument(documentData);
  }

  async copyDocumentFromFileBuffer(payload: {
    originalDocument: Document,
    file: FileData,
    creatorId: string,
    destinationType: TypeOfDocument,
    destinationId: string,
    documentName: string,
    folderId?: string,
  }): Promise<IDocument> {
    const {
      file, creatorId, destinationId, destinationType, originalDocument, documentName, folderId,
    } = payload;
    if (!file) {
      throw GraphErrorException.BadRequest('File is required when duplicate drive/dropbox document');
    }

    const { thumbnail, manipulationStep } = originalDocument;

    let keyFile;

    if (thumbnail) {
      const thumbnailBucket = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
      const thumbnailRemoteKey = `thumbnails/${uuid()}.${Utils.getExtensionFile(thumbnail)}`;
      const remoteThumbnailSource = `${thumbnailBucket}/${thumbnail}`;

      keyFile = await this.awsService.copyObjectS3(
        remoteThumbnailSource,
        thumbnailBucket,
        thumbnailRemoteKey,
      );
    }

    return this.createDocumentWithBufferData({
      clientId: destinationType === TypeOfDocument.PERSONAL ? creatorId : destinationId,
      doc: file,
      thumbnail: null,
      uploader: { _id: creatorId },
      docType: DocumentOwnerTypeEnum[destinationType],
      folderId,
    }, {
      documentName,
      thumbnailKey: keyFile,
      manipulationStep,
    });
  }
}
