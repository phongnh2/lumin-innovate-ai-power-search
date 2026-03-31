/* eslint-disable global-require */
import { Injectable, forwardRef, Inject } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Types } from 'mongoose';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { UploadFileTypeEnum } from 'Common/validator/FileValidator/file.validator.interface';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import {
  DocumentRoleEnum,
  DocumentOwnerTypeEnum,
  DocumentStorageEnum,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { DocumentServiceMobile } from 'Document/document.service.mobile';
import {
  IDocument,
} from 'Document/interfaces/document.interface';
import { LoggerService } from 'Logger/Logger.service';
import {
  IOrganization,
} from 'Organization/interfaces/organization.interface';
import {
  PaymentPlanEnums,
} from 'Payment/payment.enum';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { UserService } from 'User/user.service';

import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationServiceMobile {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly awsService: AwsService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly organizationService: OrganizationService,
    private readonly documentServiceMobile: DocumentServiceMobile,
    private readonly loggerService: LoggerService,
  ) { }

  public async convertPersonalDocToLuminByUpload(data: {
    uploader: Record<string, any>;
    files: [FileData];
    documentId: string;
  }): Promise<IDocument> {
    const { uploader, files, documentId } = data;
    const documentPermission = await this.documentService.getOneDocumentPermission(
      uploader._id as string,
      { documentId, role: DocumentRoleEnum.OWNER },
    );
    if (!documentPermission) throw GraphErrorException.Forbidden('You do not have permission', ErrorCode.Common.NO_PERMISSION);

    const pdfFile = files.find((file) => file.type === UploadFileTypeEnum.Document);

    const keyFile = await this.awsService.uploadDocumentWithBuffer(pdfFile.fileBuffer, pdfFile.mimetype);

    const documentData: any = {
      remoteId: keyFile,
      service: DocumentStorageEnum.S3,
      lastModifiedBy: new Types.ObjectId(uploader._id as string),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const createdDocument = await this.documentService.updateDocument(documentId, documentData);
    const ownerUser = await this.userService.findUserById(uploader._id as string);
    // Store activity in db
    const [organization] = await this.organizationService.findOrganization({ _id: documentPermission.workspace.refId });
    this.organizationService.createDocumentEventAndPublishUpdate({ ownerUser, createdDocument, organization });
    return createdDocument;
  }

  public async uploadDocument(data: {
    uploader: Record<string, any>;
    clientId: string;
    documentOwnerType: DocumentOwnerTypeEnum;
    files: [FileData];
    context: IOrganization;
    folderId?: string;
    isNotify?: boolean;
  }): Promise<IDocument> {
    const {
      uploader,
      clientId,
      documentOwnerType,
      files,
      context,
      folderId,
      isNotify,
    } = data;

    const pdfFile = files.find((file) => file.type === UploadFileTypeEnum.Document);
    const thumbnailFile = files.find((file) => file.type === UploadFileTypeEnum.Thumbnail);
    const isPremium = context.payment.type !== PaymentPlanEnums.FREE;

    const startTime = performance.now();
    this.loggerService.info({
      context: 'uploadDocument',
      message: 'Start upload document',
      extraInfo: {
        fileSize: pdfFile.filesize,
        clientId,
      },
    });

    if (
      !this.rateLimiterService.verifyUploadFilesSize(isPremium, [
        { size: pdfFile.filesize },
      ], true)
    ) {
      if (isPremium) {
        throw GraphErrorException.BadRequest(
          ErrorMessage.DOCUMENT.FILE_SIZE.PAID,
          ErrorCode.Document.OVER_FILE_SIZE_PREMIUM,
        );
      }
      throw GraphErrorException.BadRequest(
        ErrorMessage.DOCUMENT.FILE_SIZE.FREE,
        ErrorCode.Document.OVER_FILE_SIZE_FREE,
      );
    }

    const organization: IOrganization = context;

    const [uploadedUser, document] = await Promise.all([
      this.userService.findUserById(uploader._id as string),
      this.documentServiceMobile.createDocumentWithBufferData({
        clientId,
        doc: pdfFile,
        thumbnail: thumbnailFile,
        uploader,
        docType: documentOwnerType,
        folderId,
      }),
    ]);

    const result = await this.organizationService.processAfterUpdateDocumentToDb({
      uploadedUser,
      clientId,
      document,
      documentOwnerType,
      uploader,
      organization,
      isNotify,
    });

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    this.loggerService.info({
      context: 'uploadDocument',
      message: 'End upload document',
      extraInfo: {
        durationMs,
        fileSize: pdfFile.filesize,
        clientId,
      },
    });
    return result;
  }
}
