/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Body,
  UsePipes,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation, ApiResponse, ApiConsumes, ApiBody,
} from '@nestjs/swagger';

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

import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { DocumentOwnerTypeEnum, DocumentStorageEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { UploadFileDtoMobile, UploadFileDtoMobileWithFile } from 'Document/dtos/uploadFile.document.dto';
import { UploadThumbnailDtoMobile, UploadThumbnailDtoMobileWithFile } from 'Document/dtos/uploadThumbnail.document.dto';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles } from 'Document/enums/organization.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { DocumentGuestLevelPipe } from 'Document/guards/Rest/GuestPipe/document.guest.permission.pipe';
import { DocumentEventNames, EventScopes } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { FolderPermissionPipe } from 'Folder/guards/Rest/folder.permission.pipe';
import { Document } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { UserService } from 'User/user.service';

@Controller('document')
export class DocumentsControllerMobile {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly redisService: RedisService,
    private readonly eventService: EventServiceFactory,
    private readonly rateLimiterService: RateLimiterService,
    private readonly folderService: FolderService,
    private readonly loggerService: LoggerService,
    private readonly personalEventService: PersonalEventService,
    private readonly organizationService: OrganizationService,
  ) { }

  @ApiOperation({ summary: 'Upload thumbnail' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadThumbnailDtoMobileWithFile })
  @ApiResponse({
    status: 200,
    description: 'The thumbnail key',
    type: String,
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard)
  @Post('upload-thumbnail')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnailFile' },
  ], {
    fileFilter: (_: Request, file: any, callback: (error: Error, acceptFile: boolean) => void) => {
      if (file.fieldname === 'thumbnailFile' && !imageValidationRules.includes(file.mimetype as string)) {
        callback(HttpErrorException.BadRequest('We only support JPG, JPEG, PNG file type'), false);
      }
      callback(null, true);
    },
  }))
  @UsePipes(new ValidationPipeRest(), DocumentGuestLevelPipe(OrganizationDocumentRoles.ALL, TeamRoles.ALL, IndividualRoles.EDITOR))
  async uploadThumbnail(@UploadedFiles() fileUploads, @Body() uploadThumbnailDtoMobile: UploadThumbnailDtoMobile, @Request() request) {
    const { user } = request;
    const { documentId } = uploadThumbnailDtoMobile;
    const { thumbnailFile } = fileUploads;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (thumbnailFile && !this.documentService.verifyUploadThumbnailsSize(thumbnailFile)) {
      throw HttpErrorException.BadRequest(ErrorMessage.COMMON.EXCEED_THUMBNAIL_SIZE, ErrorCode.Common.EXCEED_THUMBNAIL_SIZE);
    }
    if (thumbnailFile && thumbnailFile.length > 0) {
      const key = await this.awsService.uploadThumbnailToS3(thumbnailFile[0]);
      const document = await this.documentService.updateDocument(documentId, { thumbnail: key });
      const owner = await this.userService.findUserById(document.ownerId);
      this.documentService.publishUpdateDocument(
        [user._id],
        {
          document: Object.assign(document, { ownerName: owner.name }),
          type: SUBSCRIPTION_DOCUMENT_INFO_THUMBNAIL,
        },
        SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
      );
      return key;
    }
  }

  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDtoMobileWithFile })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully uploaded',
    type: 'object',
  })
  @UseGuards(RateLimiterGuard, AllowProfessionalUserGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard)
  @Post('upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files' },
    { name: 'thumbnails' },
  ]))
  @UsePipes(new ValidationPipeRest(), FolderPermissionPipe(FolderRoleEnum.OWNER))
  async uploadFile(@UploadedFiles() fileUploads, @Body() uploadFileDto: UploadFileDtoMobile, @Request() request) {
    const { clientId, documentId, folderId } = uploadFileDto;
    const { user } = request;
    const { files, thumbnails } = fileUploads;
    if (!this.documentService.verifyUploadFiles(files)) {
      throw HttpErrorException.Forbidden('Invalid file type. File must be in pdf/png/jpg/jpeg format', ErrorCode.Common.INVALID_FILE_TYPE);
    }

    const startTime = performance.now();
    this.loggerService.info({
      context: 'uploadFile',
      message: 'Start upload file',
      extraInfo: {
        fileSize: files?.map((file) => file.size),
        clientId,
      },
    });
    const uploaderInfo = await this.userService.findUserById(user._id as string);
    const isPremium = await this.userService.isAvailableUsePremiumFeature(uploaderInfo);
    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, files, true)) {
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
    const userInfo = await this.userService.findUserById(user._id as string);
    const result = await Promise.all(
      // eslint-disable-next-line no-async-promise-executor
      files.map((file, index) => new Promise(async (resolve, reject) => {
        const documentResp = await this.awsService.uploadDocument(file).catch((err) => {
          this.loggerService.info({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            ...this.loggerService.getCommonHttpAttributes(request),
            stack: err,
            errorCode: ErrorCode.Common.THIRD_PARTY_ERROR,
          });
        });
        const documentData: Document & {
          service: DocumentStorageEnum;
          manipulationStep?: string;
        } = {
          name: file.originalname,
          remoteId: documentResp.key,
          mimeType: file.mimetype,
          size: file.size,
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
          if (thumbnails && thumbnails.length > 0) {
            const shouldUploadThumbnail = thumbnails[index]
              && this.documentService.verifyUploadThumbnailSize(thumbnails[index] as { size: number })
              && imageValidationRules.includes(thumbnails[index].mimetype as string);
            documentData.thumbnail = shouldUploadThumbnail ? await this.awsService.uploadThumbnailToS3(thumbnails[index]).catch((err) => {
              this.loggerService.info({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                ...this.loggerService.getCommonHttpAttributes(request),
                stack: err,
                errorCode: ErrorCode.Common.THIRD_PARTY_ERROR,
              });
            }) : '';
          }

          const folderType = isPersonal ? DocumentOwnerTypeEnum.PERSONAL : DocumentOwnerTypeEnum.TEAM;
          documentData.name = await this.documentService.getDocumentNameAfterNaming({
            clientId, fileName: file.originalname, documentFolderType: folderType, mimetype: file.mimetype, folderId,
          });
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
            reject(new Error('create document permission error'));
          }
        }
        resolve({
          data: 'upload file success',
          type: 'individual',
          document,
        });
      })),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ).catch((error) => { throw HttpErrorException.Forbidden(error, ErrorCode.Document.UPLOAD_DOCUMENT_FAIL); });
    // Store activity in db
    this.eventService.createEvent({
      eventName: DocumentEventNames.DOCUMENT_UPLOADED,
      actor: userInfo,
      eventScope: EventScopes.PERSONAL,
      document,
    });
    const subcriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL;
    const ownerUser = await this.userService.findUserById(user._id as string);
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

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    this.loggerService.info({
      context: 'uploadFile',
      message: 'End upload file',
      extraInfo: {
        durationMs,
      },
    });
    return result;
  }
}
