/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Query,
  Res,
  Req,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation, ApiProduces, ApiResponse,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Types } from 'mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
  SUBSCRIPTION_DOCUMENT_INFO_THUMBNAIL, SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { AllowProfessionalUserGuard } from 'Common/guards/allow-professional-user.guard';
import { imageValidationRules } from 'Common/validator/FileValidator/file.validator.pipe';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { LambdaAuthGuard } from 'Auth/guards/lambda.auth.guard';
import { RestAttachUserGuard } from 'Auth/guards/rest.attachUser';
import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { TOKEN_EXPIRED_TIME_1D } from 'constant';
import {
  DocumentOwnerTypeEnum,
  DocumentRoleEnum,
  DocumentStorageEnum,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { DocumentOutlineService } from 'Document/documentOutline.service';
import { GetFileDocumentDto } from 'Document/dtos/getFileDocument.document.dto';
import { SendSignedUrlDto } from 'Document/dtos/lambda.document.dto';
import { SyncFileToS3Dto } from 'Document/dtos/syncFileToS3.document.dto';
import { GetPresignedUrlDto, UploadFileDto } from 'Document/dtos/uploadFile.document.dto';
import { UploadThumbnailDto } from 'Document/dtos/uploadThumbnail.document.dto';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { DocumentGuestLevelPipe } from 'Document/guards/Rest/GuestPipe/document.guest.permission.pipe';
import { DocumentVersioningService } from 'DocumentVersioning/documentVersioning.service';
import { EnvironmentService } from 'Environment/environment.service';
import { DocumentEventNames, EventScopes } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { FolderPermissionPipe } from 'Folder/guards/Rest/folder.permission.pipe';
import { Document, UploadDocFrom } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import {
  DocumentResponseDto, GetPresignedUrlForStaticToolUploadResponse, SystemFileSyncResponseDto,
} from 'swagger/schemas';
import { UploadDocMetaKey } from 'Upload/upload.constant';
import { UploadService } from 'Upload/upload.service';
import { UserService } from 'User/user.service';

import { MAX_THUMBNAIL_SIZE } from './documentConstant';
import { DocumentSyncService } from './documentSync.service';

@Controller('document')
export class DocumentsController {
  constructor(
    private readonly documentSyncService: DocumentSyncService,
    private readonly membershipService: MembershipService,
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly redisService: RedisService,
    private readonly eventService: EventServiceFactory,
    private readonly rateLimiterService: RateLimiterService,
    private readonly folderService: FolderService,
    private readonly loggerService: LoggerService,
    private readonly uploadService: UploadService,
    private readonly documentVersioningService: DocumentVersioningService,
    private readonly documentOutlineService: DocumentOutlineService,
    private readonly environmentService: EnvironmentService,
  ) { }

  @ApiOperation({
    summary: 'Upload document thumbnail',
    description: 'Uploads a thumbnail image for a document and updates the document record. Requires editor permissions or higher.',
  })
  @ApiBody({ type: UploadThumbnailDto })
  @ApiResponse({
    status: 200,
    description: 'Thumbnail uploaded successfully, returns a signed URL to access the uploaded thumbnail',
    type: 'string',
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard)
  @Post('v2/upload-thumbnail')
  @UsePipes(new ValidationPipeRest(), DocumentGuestLevelPipe(OrganizationDocumentRoles.ALL, TeamRoles.ALL, IndividualRoles.EDITOR))
  async uploadThumbnail(@Body() uploadThumbnailDto: UploadThumbnailDto, @Request() request) {
    const { user } = request;
    const { documentId, encodedUploadData } = uploadThumbnailDto;
    const { thumbnailRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const thumbnailMetadata = await this.awsService.getThumbnailMetadata(thumbnailRemoteId);
    if (thumbnailMetadata.ContentLength > MAX_THUMBNAIL_SIZE) {
      throw HttpErrorException.BadRequest(ErrorMessage.COMMON.EXCEED_THUMBNAIL_SIZE, ErrorCode.Common.EXCEED_THUMBNAIL_SIZE);
    }
    const document = await this.documentService.updateDocument(documentId, { thumbnail: thumbnailRemoteId });
    const owner = await this.userService.findUserById(document.ownerId);
    this.documentService.publishUpdateDocument(
      [user._id],
      {
        document: Object.assign(document, { ownerName: owner.name }),
        type: SUBSCRIPTION_DOCUMENT_INFO_THUMBNAIL,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
    );
    const bucketName = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
    return this.awsService.getSignedUrl({ keyFile: thumbnailRemoteId, bucketName });
  }

  @ApiOperation({
    summary: 'Upload document file',
    // eslint-disable-next-line max-len
    description: 'Uploads a new document file or updates an existing document. Supports PDF, PNG, JPG, and JPEG formats. File size limits apply based on user subscription.',
  })
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: 200,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  @UseGuards(RateLimiterGuard, AllowProfessionalUserGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard)
  @UsePipes(new ValidationPipeRest(), FolderPermissionPipe(FolderRoleEnum.OWNER))
  @Post('v2/upload')
  async uploadFile(@Body() uploadFileDto: UploadFileDto, @Request() request): Promise<Document> {
    const {
      clientId,
      documentId,
      folderId,
      fileName,
      encodedUploadData,
    } = uploadFileDto;
    const { user } = request;
    const { documentRemoteId: fileRemoteId, thumbnailRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const fileMetadata = await this.awsService.getDocumentMetadata(fileRemoteId);
    if (!this.documentService.verifyUploadFiles([{ mimetype: fileMetadata.ContentType }])) {
      throw HttpErrorException.Forbidden('Invalid file type. File must be in pdf/png/jpg/jpeg format', ErrorCode.Common.INVALID_FILE_TYPE);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const uploaderInfo = await this.userService.findUserById(user._id);
    const isPremium = await this.userService.isAvailableUsePremiumFeature(uploaderInfo);
    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, [{ size: fileMetadata.ContentLength }])) {
      if (isPremium) {
        throw HttpErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM);
      }
      throw HttpErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE);
    }

    const isPersonal = user._id === clientId;
    if (!isPersonal) {
      throw HttpErrorException.BadRequest('Invalid input', ErrorCode.Common.INVALID_INPUT);
    }

    if (folderId) {
      const [folderPermission] = await this.folderService.findFolderPermissionsByCondition({
        folderId,
        refId: clientId,
      });
      if (!folderPermission) {
        throw GraphErrorException.Forbidden('You aren\'t allowed to access this folder');
      }
    }

    let document: Document;
    const listDocumentCreated = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userInfo = await this.userService.findUserById(user._id);
    const documentData: Document & {
      service: DocumentStorageEnum;
      manipulationStep?: string;
    } = {
      ...fileName && { name: fileName },
      remoteId: fileRemoteId,
      mimeType: fileMetadata.ContentType,
      size: fileMetadata.ContentLength,
      service: 's3' as DocumentStorageEnum,
      isPersonal,
      lastModifiedBy: user._id,
      ownerId: user._id,
      shareSetting: {},
      thumbnail: '',
    };

    if (folderId) {
      documentData.folderId = folderId;
    }

    if (documentId) {
      const documentPermission = await this.documentService.getOneDocumentPermission(user._id as string, { documentId });
      if (!documentPermission) throw HttpErrorException.Forbidden('You do not have permission', ErrorCode.Common.NO_PERMISSION);

      document = await this.documentService.getDocumentByDocumentId(documentId) as unknown as Document;
      if (document.thumbnail) {
        documentData.thumbnail = document.thumbnail;
      }
      documentData.name = document.name;
      document = await this.documentService.updateDocument(document._id, documentData) as unknown as Document;
    } else {
      if (thumbnailRemoteId) {
        const thumbnailMetadata = await this.awsService.getThumbnailMetadata(thumbnailRemoteId);
        const shouldUploadThumbnail = this.documentService.verifyUploadThumbnailSize({
          size: thumbnailMetadata.ContentLength,
        }) && imageValidationRules.includes(thumbnailMetadata.ContentType);
        documentData.thumbnail = shouldUploadThumbnail ? thumbnailRemoteId : null;
      }

      const folderType = isPersonal ? DocumentOwnerTypeEnum.PERSONAL : DocumentOwnerTypeEnum.TEAM;
      documentData.name = await this.documentService.getDocumentNameAfterNaming({
        clientId, fileName, documentFolderType: folderType, mimetype: fileMetadata.ContentType, folderId,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      document = await this.documentService.createDocument(documentData) as unknown as Document;
    }
    listDocumentCreated.push(JSON.stringify(document));
    if (!documentId) {
      const documentPermission = {
        documentId: document._id,
        refId: user._id,
        role: 'owner',
      };
      const createdDocumentPermissions = await this.documentService.createDocumentPermissions([documentPermission]);
      if (!createdDocumentPermissions) {
        throw new Error('Create document permission error');
      }
    }

    // Store activity in db
    this.eventService.createEvent({
      eventName: DocumentEventNames.DOCUMENT_UPLOADED,
      actor: userInfo,
      eventScope: EventScopes.PERSONAL,
      document,
    });
    const subcriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const ownerUser = await this.userService.findUserById(user._id);
    listDocumentCreated.forEach((createdDocument) => {
      const documentUploaded = this.documentService.cloneDocument(createdDocument, {
        ownerName: ownerUser.name,
        ownerAvatarRemoteId: ownerUser.avatarRemoteId,
        roleOfDocument: 'OWNER',
      });
      this.documentService.publishUpdateDocument(
        [user._id],
        {
          document: documentUploaded,
          type: subcriptionType,
        },
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
      );
    });
    return document;
  }

  @ApiOperation({
    summary: 'Sync file to S3',
    // eslint-disable-next-line max-len
    description: 'Synchronizes a modified document file to S3 storage. Updates document metadata, clears outlines and form fields, and creates a version record if applicable.',
  })
  @ApiBody({ type: SyncFileToS3Dto })
  @ApiResponse({
    status: 200,
    description: 'File synced successfully',
    type: SystemFileSyncResponseDto,
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard)
  @Post('v2/sync-file-s3')
  @UsePipes(new ValidationPipeRest(), DocumentGuestLevelPipe(
    OrganizationDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  ))
  async syncFileToS3(
    @Req() request: ExpressRequest,
    @Body() body: SyncFileToS3Dto,
  ) {
    const { user } = request;
    const socketId = request.headers[CommonConstants.SOCKET_ID_HEADER] as string;
    const { encodedUploadData, documentId, increaseVersion } = body;
    const { documentRemoteId, versionId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const fileMetadata = await this.awsService.getDocumentMetadata(documentRemoteId);
    const documentETag = fileMetadata.ETag.replace(/"/g, '');
    const isSystemFile = documentId.includes(CommonConstants.SYSTEM_FILE_PREFIX_ID);
    const uploadDocFrom = fileMetadata.Metadata[UploadDocMetaKey.UploadDocFrom] as UploadDocFrom;
    const isUsedEditPdf = uploadDocFrom === UploadDocFrom.EditPdf;
    const updateUserPromise = isUsedEditPdf
      ? this.userService.findOneAndUpdate({
        _id: user._id as string,
      }, {
        $inc: { 'metadata.exploredFeatures.editPdf': 1 },
      })
      : Promise.resolve();

    if (!isSystemFile) {
      const document = await this.documentService.getDocumentByDocumentId(documentId);
      await Promise.all([
        this.documentService.updateDocument(documentId, {
          manipulationStep: '',
          mimeType: fileMetadata.ContentType,
          size: fileMetadata.ContentLength,
          lastModify: Date.now(),
          ...increaseVersion && { version: Number(document.version) + 1 },
        }),
        this.documentOutlineService.clearOutlineOfDocument(documentId),
        this.documentService.deleteFormFieldFromDocument(documentId),
        this.documentService.clearAnnotationOfDocument({ documentId }),
        updateUserPromise,
      ]);

      if (versionId && (document.service as DocumentStorageEnum) === DocumentStorageEnum.S3) {
        await this.documentVersioningService.createVersionFromFileContentChange({
          documentId: new Types.ObjectId(documentId),
          userData: user,
        });
      }
      this.redisService.removeDocumentIsSyncing(documentId);
      if (!socketId) {
        const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(documentId);
        return { etag: fileMetadata.ETag.replace(/"/g, ''), isSyncing };
      }
      await this.documentSyncService.clearDocumentSyncStatus(documentId, socketId);
      const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(documentId);
      this.documentSyncService.publishSyncStatusToAllSessions(socketId, {
        documentId,
        documentService: document.service as DocumentStorageEnum,
        remoteId: documentRemoteId,
      }, { increaseVersion, isSyncing, etag: documentETag });

      this.documentService.updateDocumentIndexingWithDebounce(document);

      return { etag: documentETag, isSyncing };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Sync file successfully',
    };
  }

  @ApiOperation({
    summary: 'Get document file',
    // eslint-disable-next-line max-len
    description: 'Streams the document file content. Supports partial content requests with Range headers. Requires appropriate permissions based on document sharing settings.',
  })
  @ApiProduces('application/pdf', 'image/png', 'image/jpeg', 'application/octet-stream')
  @ApiResponse({
    status: 206,
    description: 'Partial Content - Document file stream',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  /**
   * @deprecated
   * FALLBACK ENDPOINT - Do not use as primary method to get document
   * This endpoint should only be used when can not get document from presigned URL
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseGuards(RestAttachUserGuard)
  @UsePipes(new ValidationPipeRest(), DocumentGuestLevelPipe(TeamRoles.ALL, IndividualRoles.ALL))
  @Get('getdocument')
  async getFileDocument(@Body() body, @Res() response, @Query() getFileDocumentDto: GetFileDocumentDto, @Req() request) {
    const { documentId } = getFileDocumentDto;
    const { user } = request;
    this.loggerService.info({
      context: 'getdocument',
      userId: user?._id,
      extraInfo: {
        documentId,
      },
    });
    const document = await this.documentService.getDocumentByDocumentId(documentId);
    if (!document) {
      throw HttpErrorException.NotFound('You have no document with this documentId', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }
    if (document.shareSetting.linkType !== 'ANYONE') {
      if (user) {
        if (document.isPersonal) {
          const documentPermission = await this.documentService.getOneDocumentPermission(user._id as string, { documentId });
          if (!documentPermission) {
            throw HttpErrorException.Forbidden('You have no permission', ErrorCode.Common.NO_PERMISSION);
          }
        } else {
          const documentPermission = await this.documentService.getDocumentPermissionsByDocId(documentId, { role: DocumentRoleEnum.TEAM });
          const membershipUser = await this.membershipService.findOne({
            userId: user._id,
            teamId: documentPermission[0].refId,
          });
          if (!membershipUser) {
            const externalPermission = await this.documentService.getOneDocumentPermission(user._id as string, { documentId });
            if (!externalPermission) {
              throw HttpErrorException.Forbidden('You have no permission', ErrorCode.Common.NO_PERMISSION);
            }
          }
        }
      } else {
        throw HttpErrorException.NotFound('You have no document with this documentId', ErrorCode.Document.DOCUMENT_NOT_FOUND);
      }
    }
    const metadata = await this.awsService.getDocumentMetadata(document.remoteId);
    const ranges = request.headers.range ? request.headers.range : 'bytes=0-';
    const bytes = ranges.replace(/bytes=/, '').split('-');
    const start = bytes[0] ? parseInt(bytes[0] as string, 10) : 0;
    const total = metadata.ContentLength;
    const end = bytes[1] ? parseInt(bytes[1] as string, 10) : total - 1;
    const chunksize = end - start + 1;
    const stream = await this.awsService.getStreamFromDocumentBucket(document.remoteId, ranges);
    this.loggerService.info({
      ...this.loggerService.getCommonHttpAttributes(request as ExpressRequest),
    });
    response.status(206);
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Access-Control-Max-Age', 3000);
    response.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length , Content-Range, Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
    response.setHeader('Content-Length', chunksize);

    return stream.pipe(response);
  }

  @ApiOperation({
    summary: 'Receive conversion result',
    // eslint-disable-next-line max-len
    description: 'Endpoint for Lambda function to send back the pre-signed URL of a converted document or error message if conversion failed. Protected by API key authentication.',
  })
  @ApiBody({ type: SendSignedUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed URL received successfully',
  })
  @LambdaAuthGuard(EnvConstants.CONVERT_DOCX_API_KEY)
  @Post('conversion')
  sendSignedUrl(@Body() body: SendSignedUrlDto) {
    const { fileName, preSignedUrl, errorMessage } = body;
    this.documentService.sendPreSignedUrlForConvertOfficeFile(fileName, preSignedUrl, errorMessage);
  }

  @ApiOperation({
    summary: 'Receive OCR processing result',
    // eslint-disable-next-line max-len
    description: 'Endpoint for Lambda function to send back the OCR processing results including pre-signed URL, position data, or error message if processing failed. Protected by API key authentication.',
  })
  @ApiBody({ type: SendSignedUrlDto })
  @ApiResponse({
    status: 200,
    description: 'OCR results received successfully',
  })
  @LambdaAuthGuard(EnvConstants.OCR_API_KEY)
  @Post('ocr')
  handleFinishOCR(@Body() body: SendSignedUrlDto) {
    const {
      fileName, preSignedUrl, errorMessage, position,
    } = body;
    this.documentService.sendPreSignedUrlForOCR({
      fileName,
      preSignedUrl,
      errorMessage,
      position,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Get presigned url for static tool upload',
    type: GetPresignedUrlForStaticToolUploadResponse,
  })
  @ApiOperation({
    summary: 'Get presigned url for static tool upload',
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.INGRESS_COOKIE)
  @UsePipes(new ValidationPipeRest())
  @Get('get-presigned-url-for-static-tool-upload')
  async getPresignedUrlForStaticToolUpload(
    @Request() request,
    @Query() param: GetPresignedUrlDto,
  ) {
    const { user } = request;
    const {
      documentMimeType,
      thumbnailMimeType,
      thumbnailKey,
      documentKey,
      documentName,
    } = param;

    const [document, thumbnail] = await Promise.all([
      this.uploadService.getPresignedUrlForStaticToolUpload({ mimeType: documentMimeType, key: documentKey }),
      thumbnailMimeType ? this.uploadService.getThumbnailPresignedUrl({ mimeType: thumbnailMimeType, key: thumbnailKey }) : null,
    ]);

    const encodedUploadData = this.uploadService.createToken({
      documentRemoteId: document.fields.key,
      ...thumbnail && { thumbnailRemoteId: thumbnail.fields.key },
      ...user && { userId: user._id },
      ...documentName && { documentName },
    }, TOKEN_EXPIRED_TIME_1D);
    return {
      document,
      thumbnail,
      encodedUploadData,
    };
  }

  @GrpcMethod('WorkerService', 'MigrateDocumentDriveMetadataSharer')
  async migrateDocumentDriveMetadataSharer(): Promise<void> {
    await this.documentService.migrateDocumentDriveMetadataSharer();
  }
}
