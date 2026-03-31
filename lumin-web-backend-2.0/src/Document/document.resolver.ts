import {
  UseGuards, HttpStatus, Inject, UseInterceptors,
} from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Context,
  Subscription,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { get } from 'lodash';
import * as mime from 'mime-types';
import * as moment from 'moment';
import { Types } from 'mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { PDF_MIME_TYPE, IMAGE_MIME_TYPE } from 'Common/constants/DocumentConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { NotiDocument } from 'Common/constants/NotificationConstants';
import { DOC_STACK_PLAN } from 'Common/constants/PaymentConstant';
import { RateLimiterStrategy, RateLimiterFileSize } from 'Common/constants/RateLimiterConstants';
import { USER_SHARING_TYPE } from 'Common/constants/SharingConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
  SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
  SUBSCRIPTION_DOCUMENT_INFO_FAVORITE,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
  SUBSCRIPTION_DOCUMENT_LIST_FAVORITE,
  SUBSCRIPTION_DOCUMENT_BOOKMARK,
  SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
  SUBSCRIPTION_DOCUMENT_SHARING_QUEUE,
} from 'Common/constants/SubscriptionConstants';
import { TeamRole } from 'Common/constants/TeamConstant';
import { LIMIT_USER_CONTACTS } from 'Common/constants/UserConstants';
import { CustomRuleValidator, StorageUploadValidator } from 'Common/decorators/customRule.decorator';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiFirebaseDocumentFactory } from 'Common/factory/NotiFirebaseFactory';
import { AllowProfessionalUserGuard } from 'Common/guards/allow-professional-user.guard';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';
import { CustomRulesGuard, CustomRulesGuards } from 'CustomRules/custom.rules.guard';
import { UPLOADABLE_SERVICES } from 'CustomRules/domain-rules.constants';

import { AsymmetricJwtService } from 'Asymmetric/asymmetric-jwt.service';
import { GqlAttachUserGuard } from 'Auth/guards/graph.attachUser';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { MAX_MEMBERS_FOR_PARTIAL_MENTION, MAXIMUM_NUMBER_SIGNATURE } from 'constant';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import {
  DocumentStorageEnum,
  DocumentRoleEnum,
  DocumentOwnerTypeEnum,
  DocumentMimeType,
  SIGNATURE_MIMETYPE,
  ShareTypeEnum,
  DocumentKindEnum,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import {
  ORIGINAL_DOCUMENT_PERMISSION_ROLE,
  ANNOTATION_IMAGE_BASE_PATH,
  CONVERSION_LIMIT_SIZE,
  OutlineActionEnum,
} from 'Document/documentConstant';
import { DocumentOutlineService } from 'Document/documentOutline.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import {
  OrganizationDocumentRoles,
  OrgTeamDocumentRoles,
  OrganizationRoles,
} from 'Document/enums/organization.roles.enum';
import { SignedUrlFactory } from 'Document/factory/SignedUrlFactory';
import {
  DocumentGuestLevelGuard,
  DocumentGuestAuthLevelGuard,
  RoleGuardForEditorAndHigherPermissions,
} from 'Document/guards/Gql/document.guest.permission.guard';
import { DocumentPaymentGuard } from 'Document/guards/Gql/document.limit.permission.guard';
import { DocumentPersonalLevelGuard } from 'Document/guards/Gql/document.personal.permission.guard';
import { DocumentStatusGuard } from 'Document/guards/Gql/document.status.guard';
import { DocumentTeamLevelGuard } from 'Document/guards/Gql/document.team.permission.guard';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';
import {
  IDocument,
  IManipulation,
} from 'Document/interfaces/document.interface';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { DocumentEventNames, EventScopes } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  Document,
  RenameDocumentInput,
  DeleteDocumentInput,
  ShareDocumentInput,
  UpdateShareSettingInput,
  CreateDocumentsPayload,
  CreateDocumentPermissionInput,
  UpdateDocumentPermissionInput,
  RemoveDocumentPermissionInput,
  CreateDocumentsInput,
  RequestAccessDocumentInput,
  ShareSetting,
  BasicResponse,
  BasicResponseData,
  GetPersonalWorkspaceDocumentsInput,
  GetDocumentPayload,
  GetDocumentByRemoteIdPayload,
  StarDocumentPayload,
  UpdateThumbnailInput,
  UpdateBookmarksInput,
  StarDocumentInput,
  CreatePDFFormInput,
  GetDocumentFormInput,
  CreatePDFFormPayload,
  GetFormListPayload,
  UpdateRequestAccessInput,
  RequestAccessDocsListPayload,
  PDFInfoPayload,
  TypeOfDocument,
  DeleteMultipleDocumentInput,
  GetShareInviteByEmailListPayload,
  MentionListInput,
  GetMentionListPayload,
  GetMembersByDocumentIdInput,
  MemberWithCursorPaginationPayload,
  DuplicateDocumentInput,
  ManipulationDocumentInput,
  RatingModalStatus,
  MoveDocumentsInput,
  MoveDocumentsToFolderInput,
  DestinationType,
  DeleteSharedDocumentsInput,
  FolderPublicInfo,
  BelongsTo,
  Template,
  CreateTemplateBaseOnDocumentInput,
  BulkUpdateDocumentPermissionInput,
  ShareLinkType,
  UserPermission,
  DocumentRequestAccessInput,
  DocumentQueryInput,
  DocumentTab,
  PremiumToolsInfo,
  GetDocStackInfoPayload,
  CheckThirdPartyStoragePayload,
  CreateDocumentBackupInfoInput,
  PresignedUrlForImageInput,
  RestoreOriginalPermission,
  PresignedUrlForImagePayload,
  PresignedUrlForSignaturePayload,
  DeleteDocumentImagesInput,
  GetPresignedUrlForUploadDocPayload,
  GetPresignedUrlForUploadDocInput,
  GetPresignedUrlForTemporaryDocumentPayload,
  SharedPermissionInfo,
  CreatePdfFromStaticToolUploadInput,
  CreatePdfFromStaticToolUploadPayload,
  PresignedUrlForMultiImagesInput,
  GetDocumentOutlinesInput,
  GetDocumentOutlinesPayload,
  ImportDocumentOutlinesInput,
  FormField,
  BackupInfo,
  CheckDownloadMultipleDocumentsInput,
  CheckDownloadMultipleDocumentsPayload,
  UpdateStackedDocumentsInput,
  ShareDocumentInSlackInput,
  PreCheckShareDocumentInSlackInput,
  PreCheckShareDocumentInSlackResponse,
  ShareDocumentInSlackResponse,
  CheckShareThirdPartyDocumentInput,
  CheckShareThirdPartyDocumentPayload,
  DocumentCapabilities,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { DEFAULT_ACTION_COUNT_DOC_STACK } from 'Payment/Policy/newPriceModel';
import { getActionSyncForNewPriceModel } from 'Payment/utils/newPriceModelUtil';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamService } from 'Team/team.service';
import { TemplateService } from 'Template/template.service';
import { UploadService } from 'Upload/upload.service';
import { User } from 'User/interfaces/user.interface';
import { DocViewerInteractionType } from 'User/user.enum';
import { UserService } from 'User/user.service';
import { UserMetricService } from 'UserMetric/usermetric.service';

import { DocumentActionPermissionService } from './ActionPermission/document.action.permission.service';
import { DocumentAction, DocumentActionPermissionPrinciple, DocumentActionPermissionResource } from './ActionPermission/enums/action.permission.enum';
import { DocumentEventService } from './document.event.service';
import { DocumentSyncService } from './documentSync.service';
import { DocumentActionPermissionGuard } from './guards/document.action.permission.guard';

@UseInterceptors(DocumentPaymentInterceptor)
@Resolver('Document')
export class DocumentResolvers {
  constructor(
    private readonly documentSyncService: DocumentSyncService,
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly membershipService: MembershipService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly awsService: AwsService,
    private readonly environmentService: EnvironmentService,
    /* For A/B testing */
    private readonly userMetricService: UserMetricService /* End */,
    private readonly eventService: EventServiceFactory,
    private readonly organizationService: OrganizationService,
    private readonly folderService: FolderService,
    private readonly templateSetvice: TemplateService,
    private readonly messageGateway: EventsGateway,
    private readonly personalEventService: PersonalEventService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly uploadService: UploadService,
    private readonly signedUrlFactory: SignedUrlFactory,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly documentOutlineService: DocumentOutlineService,
    private readonly documentEventService: DocumentEventService,
    private readonly loggerService: LoggerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly asymmetricJwtService: AsymmetricJwtService,
    private readonly documentActionPermissionService: DocumentActionPermissionService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_UPDATE_DOCUMENT_LIST, {
    filter: (payload, variables) => {
      const { input } = variables;
      const { document } = payload.updateDocumentList;
      return !input.folderId || input.folderId === document.folderId;
    },
  })
  updateDocumentList(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_DOCUMENT_LIST}.${input.clientId}`);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_UPDATE_DOCUMENT_INFO)
  updateDocumentInfo(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_DOCUMENT_INFO}.${input.clientId}`);
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_DOCUMENT_BOOKMARK)
  updateBookmark(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_DOCUMENT_BOOKMARK}.${input.clientId}.${input.documentId}`);
  }

  @UseGuards(GqlAttachUserGuard)
  @Subscription(SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT, {
    resolve: (payload) => payload[SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT],
  })
  deleteOriginalDocument(@Args('clientId') clientId) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT}.${clientId}`);
  }

  @UseGuards(GqlAttachUserGuard)
  @Subscription(SUBSCRIPTION_DOCUMENT_SHARING_QUEUE, {
    resolve: (payload) => payload[SUBSCRIPTION_DOCUMENT_SHARING_QUEUE],
  })
  documentSharingQueue(@Args('clientId') clientId) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_DOCUMENT_SHARING_QUEUE}.${clientId}`);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('renameDocument')
  async renameDocument(
    @Args('input') input: RenameDocumentInput,
  ): Promise<BasicResponseData> {
    const { newDocumentName, documentId } = input;
    if (Utils.validateDocumentName(newDocumentName)) {
      const updatedDocument = await this.documentService.updateDocument(documentId, { name: newDocumentName.normalize('NFD') });
      this.documentService.updateDocumentIndexing(updatedDocument);
      return {
        message: 'Change name successfully!',
        statusCode: HttpStatus.OK,
        data: {
          nameWithExtension: newDocumentName,
        },
      };
    }
    return {
      message: 'Failed to change name!',
      statusCode: HttpStatus.BAD_REQUEST,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(IndividualRoles.SHARER, IndividualRoles.EDITOR)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('updateThumbnail')
  async updateThumbnail(
    @Args('input') input: UpdateThumbnailInput,
  ): Promise<BasicResponse> {
    const { thumbnail, documentId } = input;
    await this.documentService.updateDocument(documentId, { thumbnail });
    return {
      message: 'Change thumbnail successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseGuards(GqlAttachUserGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('getDocumentByRemoteId')
  async getDocumentByRemoteId(
    @Args('documentRemoteId') documentRemoteId: string,
    @Args('clientId') clientId: string,
    @Context() context,
  ): Promise<GetDocumentByRemoteIdPayload> {
    const { user } = context.req;
    const document = await this.documentService.getDocumentByRemoteId(
      documentRemoteId,
      clientId,
    );
    if (!document) {
      return {
        haveDocument: false,
        message: 'You have no document with this documentId',
        document: null,
      };
    }
    if (!user) {
      if (document.shareSetting.linkType !== 'ANYONE') {
        return {
          haveDocument: false,
          message: 'You have no document with this documentId',
          document: null,
        };
      }
      const result = Object.assign(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.create(Object.getPrototypeOf(document)),
        document,
      );
      const owner = await this.userService.findUserById(document.ownerId);
      result.ownerName = owner?.name || document.ownerName || 'Anonymous';
      result.roleOfDocument = document.shareSetting.permission;
      return result;
    }
    const result = Object.assign(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.create(Object.getPrototypeOf(document)),
      document,
    );
    if (document.isPersonal) {
      const documentPermission = await this.documentService.getOneDocumentPermission(
        user._id as string,
        {
          documentId: document._id,
        },
      );
      if (!documentPermission) {
        if (document.shareSetting.linkType !== 'ANYONE') {
          return {
            haveDocument: false,
            message: 'You have no document with this documentId',
            document: null,
          };
        }
        result.roleOfDocument = document.shareSetting.permission;
      } else {
        result.roleOfDocument = documentPermission.role.toUpperCase();
      }
    } else {
      return {
        haveDocument: false,
        message: 'You have no document with this documentId',
        document: null,
      };
    }
    const owner = await this.userService.findUserById(document.ownerId);
    result.ownerName = owner?.name || document.ownerName || 'Anonymous';
    result.bookmarks = this.documentService.formatBookmarkForDocument(document as unknown as Document);
    return {
      document: result,
      haveDocument: true,
      message: 'get document success',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('deleteDocument')
  async deleteDocument(
    @Args('input') input: DeleteDocumentInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const { documentId, clientId, isNotify = true } = input;

    const [document, actorInfo, [documentPermission]] = await Promise.all([
      this.documentService.getDocumentByDocumentId(documentId),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
      this.documentService.getDocumentPermissionsByDocId(documentId, {
        refId: clientId,
      }),
    ]);
    const roleOfDocument: DocumentRoleEnum = DocumentRoleEnum[documentPermission.role.toUpperCase()];

    const isRawDocument = [
      DocumentRoleEnum.OWNER,
      DocumentRoleEnum.ORGANIZATION,
      DocumentRoleEnum.ORGANIZATION_TEAM,
    ].includes(roleOfDocument);

    const receiversObjectData = isRawDocument
      ? await this.documentService.getReceiverIdsFromDocumentId(documentId)
      : {
        allReceivers: new Set<string>(),
        receiversIndividual: new Set<string>(),
        receiversTeam: new Set<string>(),
        receiversOrganization: new Set<string>(),
      };
    const documentScope = ElasticsearchUtil.getDocumentScopeByRole(
      roleOfDocument,
    );
    const eventData: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_DELETED,
      actor: actorInfo,
      eventScope: documentScope,
      document: document as unknown as Document,
    };
    const clientType: DocumentOwnerTypeEnum = Utils.mapDocumentRoleToOwnerType(
      roleOfDocument,
    );

    if (isRawDocument) {
      if ([DocumentRoleEnum.ORGANIZATION_TEAM].includes(roleOfDocument)) {
        const team = await this.teamService.findOneById(clientId);
        eventData.team = team;
      }
      const externalDocumentPermission = await this.documentService.getDocumentPermissionByConditions(
        {
          documentId,
          role: {
            $nin: [
              DocumentRoleEnum.OWNER,
              DocumentRoleEnum.ORGANIZATION,
              DocumentRoleEnum.ORGANIZATION_TEAM,
            ],
          },
        },
      );
      await this.documentService.deleteOriginalDocument(document as unknown as Document);

      this.documentService.publishEventDeleteDocumentToInternal({
        documents: [document as unknown as Document],
        clientId,
        roleOfDocument,
        allMember: [
          ...receiversObjectData.receiversTeam,
          ...receiversObjectData.receiversOrganization,
          documentId,
        ],
      });
      if (
        (isNotify && roleOfDocument === DocumentRoleEnum.ORGANIZATION)
        || roleOfDocument === DocumentRoleEnum.ORGANIZATION_TEAM
      ) {
        this.documentService.notifyDeleteSingleDocumentToMembers(
          clientType,
          actorInfo,
          clientId,
          document,
        );
      }

      if (externalDocumentPermission.length) {
        const externalNotification = {
          actor: actorInfo,
          entity: document,
        };
        const externalUserIds = externalDocumentPermission.map(
          (docPer) => docPer.refId,
        );
        this.documentService.notifyDeleteDocumentToShared(
          externalNotification,
          externalUserIds,
        );
        this.documentService.publishEventDeleteDocumentToExternal(
          [document as unknown as Document],
          externalUserIds,
        );
      }
    } else {
      this.documentService.deleteDocumentPermission({
        documentId,
        refId: clientId,
      });
      this.documentService.publishEventDeleteDocumentToExternal(
        [document as unknown as Document],
        [clientId],
      );
      this.documentService.publishEventDeleteDocumentToExternal(
        [document as unknown as Document],
        [clientId],
      );
    }

    this.documentService.removeRequestAcessOfDeletedDoc(documentId);

    this.eventService.createEvent(eventData);
    return {
      message: 'Delete document success',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(IndividualRoles.ALL)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('deleteMultipleDocument')
  async deleteMultipleDocument(
    @Args('input') input: DeleteMultipleDocumentInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentIds, clientId, isNotify = true } = input;
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actorInfo = await this.userService.findUserById(user._id);
    const documentList = await this.documentService.findDocumentsByIds(documentIds);
    const documents = documentList as unknown as Document[];
    const documentPermissionList = await this.documentService.getDocumentPermission(
      clientId,
      { documentId: { $in: documentIds } },
    );
    let documentBelongToTeamOrOrganization: Document[] = [];
    const externalPermissionOfDocuments: Record<
      string,
      any
    >[] = await this.documentService.getSharedIdsOfDocuments(documents);
    if (!documentPermissionList.length) {
      throw GraphErrorException.NotFound(
        'Document Permission not found',
        ErrorCode.Common.NO_PERMISSION,
      );
    }
    const roleOfDocument = DocumentRoleEnum[documentPermissionList[0].role.toUpperCase()];
    switch (roleOfDocument) {
      case DocumentRoleEnum.ORGANIZATION: {
        documentBelongToTeamOrOrganization = documents;
        await this.documentService.deleteDocumentsInOrganization(
          actorInfo,
          documents,
          clientId,
          isNotify,
        );
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        documentBelongToTeamOrOrganization = documents;
        await this.documentService.deleteDocumentsInOrgTeam(
          actorInfo,
          documents,
          clientId,
        );
        break;
      }
      default: {
        await this.documentService.deleteDocumentsInPersonal({
          actorInfo,
          documentPermissionList,
          documentList: documents,
          clientId,
        });
        break;
      }
    }
    if (documentBelongToTeamOrOrganization.length) {
      externalPermissionOfDocuments.forEach((element) => {
        const externalNotification = {
          actor: actorInfo,
          entity: element.document,
        };
        this.documentService.notifyDeleteDocumentToShared(
          externalNotification,
          element.userIds as string[],
        );
        this.documentService.publishEventDeleteDocumentToExternal(
          [element.document as Document],
          element.userIds as string[],
        );
      });
    }
    const documentScope = ElasticsearchUtil.getDocumentScopeByRole(
      roleOfDocument as DocumentRoleEnum,
    );
    const defaultEventData: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_DELETED,
      actor: actorInfo,
      eventScope: documentScope,
    };

    if (documentScope === EventScopes.TEAM) {
      const team = await this.teamService.findOneById(clientId);
      defaultEventData.team = team;
    }
    if (documentScope === EventScopes.ORGANIZATION) {
      const organization = await this.organizationService.getOrgById(clientId);
      defaultEventData.organization = organization;
    }

    documentList.forEach((document) => {
      this.eventService.createEvent({
        ...defaultEventData,
        document: document as unknown as Document,
      });
    });
    return {
      message: 'Delete successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @DocumentPersonalLevelGuard(IndividualRoles.ALL)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('deleteSharedDocuments')
  async deleteSharedDocuments(
    @Args('input') input: DeleteSharedDocumentsInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentIds } = input;
    const { user } = context.req;
    const [actorInfo, documentList] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
      this.documentService.findDocumentsByIds(documentIds),
    ]);
    await this.documentService.deleteSharedDocuments(documentList as unknown as Document[], user._id as string);
    await this.documentService.removeDocumentsFromUserRecentList({
      userId: user._id,
      documentIds: documentList.map((document) => document._id),
    });

    documentList.forEach((document) => {
      this.eventService.createEvent({
        eventName: DocumentEventNames.DOCUMENT_DELETED,
        actor: actorInfo,
        document: document as unknown as Document,
        eventScope: EventScopes.PERSONAL,
      });
    });
    return {
      message: 'Delete successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('createDocumentPermission')
  async createDocumentPermission(
    @Args('input') input: CreateDocumentPermissionInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const {
      shareUserList,
      removeShareUserList,
      documentId,
      sharerName,
      sharerAvatar,
      documentName,
    } = input;
    const documentPermissionList = shareUserList.map((shareUser) => {
      const documentPermission = {
        documentId: shareUser.documentId,
        role: shareUser.role.toLowerCase(),
        refId: shareUser.shareClientId,
      };
      return documentPermission;
    });
    this.documentService.deleteDocumentPermissions({
      $and: [{ refId: { $in: removeShareUserList } }, { documentId }],
    });
    if (documentPermissionList.length > 0) {
      const createdDocumentPermissions = await this.documentService.createDocumentPermissionsUpsert(
        documentPermissionList,
      );
      if (createdDocumentPermissions) {
        await Promise.all(
          shareUserList.map(async (item) => {
            // eslint-disable-next-line no-shadow
            const userInfo = await this.userService.findUserByEmail(item.email);
            return userInfo.setting;
          }),
        );
        const newSharees = shareUserList
          // eslint-disable-next-line no-shadow
          .map((shareUser) => {
            if (shareUser.isNew) return shareUser.email;
            return null;
          })
          .filter((email) => !!email);

        const subject = SUBJECT[EMAIL_TYPE.SHARE_DOCUMENT.description]
          .replace('#{userName}', sharerName)
          .replace('#{documentName}', documentName);
        if (newSharees.length) {
          this.emailService.sendEmailHOF(
            EMAIL_TYPE.SHARE_DOCUMENT,
            newSharees,
            {
              subject,
              sharerName,
              sharerAvatar,
              documentName,
              documentId,
            },
          );
        }
      }
    }
    this.documentService.updateDocument(documentId, {
      lastAccess: Date.now(),
    });
    const newShareUser = shareUserList
      // eslint-disable-next-line no-shadow
      .filter((shareUser) => shareUser.isNew)
      // eslint-disable-next-line no-shadow
      .map((shareUser) => shareUser.shareClientId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actorInfo = await this.userService.findUserById(user._id);
    const notification = {
      actor: {
        actorId: user._id,
        type: 'user',
        actorName: actorInfo.name,
        avatarRemoteId: actorInfo.avatarRemoteId,
      },
      actionType: NotiDocument.SHARE,
      notificationType: 'DocumentNotification',
      entity: {
        entityId: documentId,
        entityName: documentName,
        type: 'document',
      },
    };
    if (newShareUser.length > 0) {
      this.notificationService.createUsersNotifications(
        notification,
        newShareUser,
      );
    }
    /* For A/B Testing */
    this.userMetricService.updateShareCount({
      userId: context.req.user._id,
    });
    /* End */
    return {
      message: 'share document success',
      statusCode: 200,
    };
  }

  @UseGuards(RateLimiterGuard, AllowProfessionalUserGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard(FolderRoleEnum.OWNER)
  @DocumentPersonalLevelGuard(IndividualRoles.ALL)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('createDocuments')
  async createDocuments(
    @Args('input') input: CreateDocumentsInput,
    @Context() context,
  ): Promise<CreateDocumentsPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const ownerUser = await this.userService.findUserById(user._id);
    if (!ownerUser) {
      throw GraphErrorException.NotFound(
        'User not found',
        ErrorCode.User.USER_NOT_FOUND,
      );
    }

    const { error, documents } = await this.documentService.createThirdPartyDocuments(ownerUser, input);
    if (error) {
      throw error;
    }

    return {
      message: 'create document success',
      statusCode: 201,
      documents,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRulesGuards(CustomRuleAction.USE_S3_STORAGE, CustomRuleAction.REQUEST_ACCESS_DOCUMENT)
  @Mutation('requestAccessDocument')
  async requestAccessDocument(
    @Args('input') input: RequestAccessDocumentInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentId, message } = input;
    const documentRole = DocumentRoleEnum[input.documentRole];
    const userId = context.req.user._id;
    const [document, user] = await Promise.all([
      this.documentService.getDocumentByDocumentId(documentId, {
        isPersonal: 1, ownerId: 1, name: 1, shareSetting: 1,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(userId),
    ]);

    const existedDocPermission = await this.documentService.checkExistedDocPermission(userId as string, document as unknown as Document);

    const { error } = this.documentService.validateRequestAccessDocument({
      userId,
      document: document as unknown as Document,
      requestRole: documentRole,
      existedDocPermission: existedDocPermission as Record<string, any>,
    });

    if (error) {
      throw error;
    }

    await this.documentService.createRequestAccessPermission({
      document: document as unknown as Document, requester: user, documentRole, message,
    });

    return {
      message: 'Request access document successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @UseGuards(DocumentPaymentGuard)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE, CustomRuleAction.SHARE_DOCUMENT)
  @Mutation('shareDocument')
  async shareDocument(
    @Args('input') input: ShareDocumentInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const sharer = context.req.user as User;
    const {
      documentId, emails, role, message,
    } = input;
    return this.documentService.shareDocument({
      sharer,
      documentId,
      emails,
      role,
      message,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @Mutation('updateDocumentPermission')
  async updateDocumentPermission(
    @Context() context,
    @Args('input') input: UpdateDocumentPermissionInput,
  ): Promise<BasicResponse> {
    const { _id: actorId } = context.req.user;
    const { documentId, role, email } = input;

    const result = await this.documentService.handleUpdateDocumentPermission({
      actorId,
      documentId,
      role,
      email,
    });

    if (result.success) {
      return {
        message: 'Success',
        statusCode: HttpStatus.OK,
      };
    }

    return {
      message: 'Fail',
      statusCode: HttpStatus.BAD_REQUEST,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(IndividualRoles.SHARER, OrganizationDocumentRoles.SHARER, OrgTeamDocumentRoles.SHARER)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('removeDocumentPermission')
  async removeDocumentPermission(
    @Args('input') input: RemoveDocumentPermissionInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentId, email } = input;
    const { user } = context.req;
    const [document, foundUser] = await Promise.all([
      this.documentService.findOneById(documentId),
      this.userService.findUserByEmail(email),
    ]);

    if (!foundUser) {
      const deleteResult = await this.documentService.deleteDocumentNonLuminUser(
        { email, documentId },
      );
      return {
        message: deleteResult.deletedCount ? 'Success' : 'Fail',
        statusCode: deleteResult.deletedCount ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      };
    }

    // User has been granted access to the document but hasn't signed in yet
    if (!foundUser.timezoneOffset) {
      await this.documentService.createNonLuminUserDocumentPermission({
        user: foundUser,
        orgIds: [],
        teamIds: [],
      });
    }

    const userPermission = await this.documentService.getOneDocumentPermission(
      foundUser._id,
      { documentId },
    );

    if (!userPermission) {
      return {
        message: 'You cannot perform this action.',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    const isRestricted = this.documentService.isRestrictedFromRemovingSharer(document, foundUser, userPermission, user as User);

    if (isRestricted) {
      return {
        message: 'You do not have permission to do this.',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    const [documentPermissions] = await Promise.all([
      this.documentService.deleteDocumentPermission(
        { documentId, refId: foundUser._id },
      ),
      this.documentService.removeDocumentsFromUserRecentList({
        userId: foundUser._id,
        documentIds: [documentId],
      }),
    ]);
    if (documentPermissions && foundUser) {
      this.documentService.publishUpdateDocument(
        [foundUser._id],
        {
          documentList: this.documentService.getDeleteDocumentListSubscriptionPayload(
            [document as unknown as Document],
          ),
          type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
        },
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );

      const actor = await this.userService.findUserByEmail(email);

      // Push notifications
      const notification = {
        actor: {
          actorId: actor._id,
          type: 'user',
          actorName: actor.name,
          avatarRemoteId: actor.avatarRemoteId,
        },
        actionType: NotiDocument.REMOVE_SHARED_USER,
        notificationType: 'DocumentNotification',
        entity: {
          entityId: documentId,
          entityName: document.name,
          type: 'document',
          entityData: {
          },
        },
      };

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.REMOVE_SHARED_USER, {
        document,
      });
      this.notificationService.publishFirebaseNotifications([foundUser._id], notificationContent, notificationData);

      this.notificationService.createUsersNotifications(
        notification,
        [foundUser._id],
      );

      return {
        message: 'Success',
        statusCode: 200,
      };
    }

    return {
      message: 'Fail',
      statusCode: 400,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('updateBookmarks')
  async updateBookmarks(
    @Args('input') input: UpdateBookmarksInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentId, bookmarks } = input;
    const {
      user: { _id, email },
    } = context.req;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    const currentBookmarks = document.bookmarks ? JSON.parse(document.bookmarks) : [];
    let conflict = false;

    bookmarks.forEach(({ page, message }) => {
      let pageBookmark;
      const indexOfBookmark = currentBookmarks.findIndex((bookmark) => bookmark.page === page.toString());
      if (indexOfBookmark >= 0) {
        pageBookmark = currentBookmarks[indexOfBookmark];
      }
      if (!message) {
        // Remove exist bookmark
        if (pageBookmark) {
          delete pageBookmark.bookmark[email];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (Object.keys(pageBookmark.bookmark).length) {
            currentBookmarks[indexOfBookmark] = pageBookmark;
          } else {
            currentBookmarks.splice(indexOfBookmark, 1);
          }
        } else {
          // Cannot found exist bookmark
          conflict = true;
        }
      } else if (pageBookmark) {
        // Edit exist bookmark
        pageBookmark.bookmark = { ...pageBookmark.bookmark, [email]: message };
        currentBookmarks[indexOfBookmark] = pageBookmark;
      } else {
        // Add new bookmark
        pageBookmark = {
          bookmark: {
            [email]: message,
          },
          page: page.toString(),
        };
        currentBookmarks.push(pageBookmark);
      }
    });

    if (conflict) {
      return {
        message: 'Conflict',
        statusCode: 409,
      };
    }

    const updateBookmarks = currentBookmarks.length ? JSON.stringify(currentBookmarks) : null;

    await this.documentService.updateDocument(documentId, {
      bookmarks: updateBookmarks,
    });
    const bookmarksToBePublished = bookmarks.map(({ page, message }) => ({ bookmark: [{ message, email }], page, message }));
    this.documentService.publishUpdateDocument(
      [_id],
      {
        documentId,
        bookmarks: bookmarksToBePublished,
      },
      SUBSCRIPTION_DOCUMENT_BOOKMARK,
    );
    return {
      message: 'Success',
      statusCode: 200,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @CustomRuleValidator(CustomRuleAction.ACCESS_DOCUMENT)
  @Query('document')
  async document(
    @Args('documentId') documentId: string,
    @Args('usePwa') usePwa: boolean,
    @Context() context,
  ): Promise<Document> {
    const { user: userContext } = context.req;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    ) as unknown as Document;
    if (!document || document.kind === DocumentKindEnum.TEMPLATE) {
      throw GraphErrorException.NotFound(
        'You have no document with this documentId',
        ErrorCode.Document.DOCUMENT_HAS_BEEN_DELETED,
      );
    }
    const thirdPartyAccessToken: string = context?.req?.cookies?.google_implicit_access_token;
    this.organizationService.emitGoogleDocumentForIndexing({
      document: document as IDocument,
      user: userContext as User,
      accessToken: thirdPartyAccessToken,
    });
    const isOverTimeLimit = await this.documentService.hasDocumentBeenLimited(document);
    if (document.service === DocumentStorageEnum.S3 && !isOverTimeLimit) {
      document.signedUrl = await this.awsService.getSignedUrl({
        keyFile: document.remoteId,
      });
      document.etag = await this.documentService.getDocumentETag(document.remoteId);
    }
    if (document.service === DocumentStorageEnum.GOOGLE && document.temporaryRemoteId && !isOverTimeLimit) {
      document.signedUrl = await this.awsService.getSignedUrl({
        keyFile: document.temporaryRemoteId,
      });
      document.etag = await this.documentService.getDocumentETag(document.temporaryRemoteId);
    }
    const isDocumentActionPermissionEnabled = await this.featureFlagService.getFeatureIsOn({
      featureFlagKey: FeatureFlagKeys.DOCUMENT_ACTION_PERMISSION,
    });
    if (!userContext) {
      if (document.shareSetting.linkType !== 'ANYONE') {
        throw GraphErrorException.Forbidden(
          'You have no document with this documentId',
          ErrorCode.Document.DOCUMENT_NOT_FOUND,
        );
      }
      const result = Object.assign(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.create(Object.getPrototypeOf(document)),
        document,
      );
      const [imageSignedUrls, lastChangedAnnotation] = await Promise.all([
        this.documentService.getImageSignedUrlsById(documentId),
        this.redisService.getLastChangedAnnotation(documentId),
      ]);
      if (lastChangedAnnotation) {
        this.redisService.renewLastChangedAnnotationExpire(documentId);
      }
      const belongsTo = await this.documentService.getBelongsTo(document);
      const orgId = this.organizationService.getOrgIdOfDocument(belongsTo);
      let actionCountDocStack = DEFAULT_ACTION_COUNT_DOC_STACK;
      if (orgId) {
        const org = await this.organizationService.getOrgById(orgId);
        const ownerOfOrg = await this.userService.findUserById(org?.ownerId as string);
        if (ownerOfOrg) {
          const variant = await this.featureFlagService.getFeatureValue<string>({
            user: ownerOfOrg,
            organization: org,
            featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
          });
          actionCountDocStack = getActionSyncForNewPriceModel(variant);
        }
      }
      result.actionCountDocStack = actionCountDocStack;
      result.remoteEmail = null;
      result.roleOfDocument = DocumentRoleEnum.GUEST;
      result.isOverTimeLimit = isOverTimeLimit;
      result.isShared = true;
      result.size = 0;
      result.lastModify = null;
      result.lastAccess = null;
      result.createdAt = null;
      /**
      * Temporary remain this code for backward compatibility
      */
      result.imageSignedUrls = imageSignedUrls;
      result.getAnnotationUrl = this.signedUrlFactory.createSignedUrl({ path: `/annotation/${documentId}`, expire: 600, method: 'GET' });
      result.lastChangedAnnotation = lastChangedAnnotation;
      result.capabilities = await this.documentActionPermissionService.getDocumentCapabilities({
        disableCapabilities: !isDocumentActionPermissionEnabled,
      });
      /* END */
      return result;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(userContext._id);

    this.documentEventService.openDocument({
      document,
      user,
    }).catch((error) => {
      this.loggerService.warn({
        context: 'openDocumentEvent',
        message: 'Error tracking open document event',
        error,
      });
    });

    const result = Object.assign(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.create(Object.getPrototypeOf(document)),
      document,
    );
    result.belongsTo = await this.documentService.getBelongsTo(document);
    const orgId = this.organizationService.getOrgIdOfDocument(result.belongsTo as BelongsTo);
    let actionCountDocStack = DEFAULT_ACTION_COUNT_DOC_STACK;
    if (orgId) {
      const org = await this.organizationService.getOrgById(orgId);
      const ownerOfOrg = await this.userService.findUserById(org?.ownerId as string);
      if (ownerOfOrg) {
        const variant = await this.featureFlagService.getFeatureValue<string>({
          user: ownerOfOrg,
          organization: org,
          featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
        });
        actionCountDocStack = getActionSyncForNewPriceModel(variant);
      }
    }
    result.isShared = false;
    result.actionCountDocStack = actionCountDocStack;
    let userRole = null;
    let documentPermissionRole = null;
    if (document.isPersonal) {
      const documentPermission = await this.documentService.getOneDocumentPermission(
        user._id,
        { documentId },
      );
      if (!documentPermission) {
        if (document.shareSetting.linkType !== 'ANYONE') {
          throw GraphErrorException.Forbidden(
            'You have no document with this documentId',
            ErrorCode.Document.DOCUMENT_NOT_FOUND,
          );
        }
        result.isShared = true;
      } else if (documentPermission.role === DocumentRoleEnum.OWNER) {
        /* For A/B Testing */
        this.userMetricService.updateOpenDocumentPersonal({
          userId: user._id,
        });
      } else {
        const owner = await this.userService.findUserById(document.ownerId);
        result.isShared = true;
        this.userMetricService.updateOpenDocumentShared(
          { userId: user._id },
          owner,
        );
      }
      /* End */
    } else {
      // Document belongs to a team
      const documentPermission = await this.documentService.getDocumentPermissionsByDocId(
        documentId,
        {
          role: {
            $in: [
              DocumentRoleEnum.ORGANIZATION,
              DocumentRoleEnum.ORGANIZATION_TEAM,
            ],
          },
        },
      );
      if (documentPermission.length === 0) {
        if (document.shareSetting.linkType !== 'ANYONE') {
          throw GraphErrorException.Forbidden(
            'You have no document with this documentId',
            ErrorCode.Document.DOCUMENT_NOT_FOUND,
          );
        }
      } else {
        const docPermission = documentPermission[0];
        documentPermissionRole = docPermission.role;
        let membershipUser;
        switch (docPermission.role as DocumentRoleEnum) {
          case DocumentRoleEnum.ORGANIZATION_TEAM:
            membershipUser = await this.membershipService.findOne({
              userId: user._id,
              teamId: docPermission.refId,
            });
            break;
          case DocumentRoleEnum.ORGANIZATION:
            membershipUser = await this.organizationService.getMembershipByOrgAndUser(
              docPermission.refId,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              user._id,
            );
            break;
          default:
            break;
        }
        if (!membershipUser) {
          // Document shared to a user outside team
          result.isShared = true;
          const externalPermission = await this.documentService.getOneDocumentPermission(
            user._id,
            { documentId },
          );
          if (!externalPermission) {
            if (document.shareSetting.linkType !== 'ANYONE') {
              throw GraphErrorException.Forbidden(
                'You have no document with this documentId',
                ErrorCode.Document.DOCUMENT_NOT_FOUND,
              );
            }
          }
        } else {
          switch (docPermission.role as DocumentRoleEnum) {
            case DocumentRoleEnum.ORGANIZATION:
              {
                const {
                  role,
                } = await this.organizationService.getMembershipByOrgAndUser(
                  docPermission.refId,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  user._id,
                );
                userRole = role;
                result.ownerOfTeamDocument = [
                  OrganizationRoles.ORGANIZATION_ADMIN,
                  OrganizationRoles.BILLING_MODERATOR,
                ].includes(role as OrganizationRoles);
              }
              break;
            case DocumentRoleEnum.ORGANIZATION_TEAM: {
              const { role } = await this.membershipService.findOne({
                teamId: docPermission.refId,
                userId: user._id,
              }, { _id: -1, role: 1 });
              userRole = role;
              result.ownerOfTeamDocument = role === TeamRole.ADMIN;
              break;
            }
            default:
              break;
          }
        }
        /* For A/B Testing */
        this.userMetricService.updateOpenDocumentTeam({
          userId: user._id,
        });
        /* End */
      }
    }
    const owner = await this.userService.findUserById(document.ownerId);
    if (usePwa) {
      this.userService.updateHubspotContact(user.email, {
        use_pwa: 'true',
      });
    }
    result.ownerName = owner?.name || document.ownerName || 'Anonymous';
    result.ownerEmail = owner?.email || '';
    const [imageSignUrls, lastChangedAnnotation] = await Promise.all([
      this.documentService.getImageSignedUrlsById(documentId),
      this.redisService.getLastChangedAnnotation(documentId),
    ]);
    if (lastChangedAnnotation) {
      this.redisService.renewLastChangedAnnotationExpire(documentId);
    }

    if (user && !isOverTimeLimit) {
      if (result.isShared) {
        const personalDocumentPermission = await this.documentService.getOneDocumentPermission(user._id, { documentId: document._id });
        if (personalDocumentPermission) {
          const userOrganizations = await this.organizationService.getOrgListByUser(user._id);
          const organizationIds = userOrganizations.map((org) => org._id);
          await Promise.all(
            organizationIds.map((organizationId) => this.documentService.addToRecentDocumentList({
              userId: user._id,
              organizationId,
              documents: [document] as IDocument[],
            })),
          );
        }
      } else {
        await this.documentService.addToRecentDocumentList({ userId: user._id, organizationId: orgId, documents: [document] as IDocument[] });
        this.organizationService.trackIpAddress({ orgId, userId: user._id, request: context.req });
      }
    }

    result.isOverTimeLimit = isOverTimeLimit;
    result.imageSignedUrls = imageSignUrls;
    result.lastChangedAnnotation = lastChangedAnnotation;
    result.getAnnotationUrl = this.signedUrlFactory.createSignedUrl({ path: `/annotation/${documentId}`, method: 'GET' });
    result.bookmarks = this.documentService.formatBookmarkForDocument(document);
    result.status = await this.documentSyncService.checkDocumentSyncStatus(documentId);

    const principle = await this.documentService.getUserDocumentPolicyPrinciple({ context, document });
    result.capabilities = await this.documentActionPermissionService.getDocumentCapabilities({
      document,
      principle: principle?.toLowerCase() as DocumentActionPermissionPrinciple || undefined,
      user,
      userRole,
      documentPermissionRole,
      disableCapabilities: !isDocumentActionPermissionEnabled,
    });

    return result;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('downloadDocument')
  async downloadDocument(
    @Args('documentId') documentId: string,
  ): Promise<Document> {
    const document = await this.documentService.getDocumentByDocumentId(documentId) as unknown as Document;
    const [signedUrl, imageSignedUrls] = await Promise.all([
      this.awsService.getSignedUrl({ keyFile: document.remoteId }),
      this.documentService.getImageSignedUrlsById(documentId),
    ]);

    document.imageSignedUrls = imageSignedUrls;
    document.signedUrl = signedUrl;
    document.getAnnotationUrl = this.signedUrlFactory.createSignedUrl({ path: `/annotation/${documentId}`, method: 'GET' });
    document.bookmarks = this.documentService.formatBookmarkForDocument(document);

    return document;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('getPDFInfo')
  async getPDFInfo(
    @Context() context,
    @Args('documentId') documentId: string,
  ): Promise<PDFInfoPayload> {
    const { user } = context.req;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    const [owner, documentPermissions] = await Promise.all([
      this.userService.findUserById(document.ownerId, { name: 1 }),
      this.documentService.getDocumentPermissionByConditions({
        role: {
          $in: [
            DocumentRoleEnum.ORGANIZATION_TEAM,
            DocumentRoleEnum.ORGANIZATION,
          ],
        },
        documentId,
      }),
    ]);

    let pdfInfo = {
      fileName: document.name || '',
      fileType: document.mimeType,
      fileSize: document.size,
      creator: owner?.name || 'Anonymous',
      creationDate: document.createdAt,
      modificationDate: (document.lastModify || document.createdAt),
      storage: document.service,
    };

    // Temporary keep fileName and fileType for backward compatibility, we will use GqlAuthGuard for this later
    if (!user) {
      pdfInfo.fileSize = 0;
      pdfInfo.creator = '';
      pdfInfo.creationDate = '';
      pdfInfo.storage = '';
      return pdfInfo;
    }

    if (documentPermissions.length) {
      const firstPermission = documentPermissions[0];
      const { refId, role } = firstPermission;
      switch (role) {
        case DocumentRoleEnum.ORGANIZATION_TEAM:
          {
            const team = await this.teamService.findOneById(refId, {
              name: 1,
              belongsTo: 1,
            });
            const organization = await this.organizationService.getOrgById(
              team.belongsTo as string,
              { name: 1, domain: 1 },
            );
            pdfInfo = Object.assign(pdfInfo, {
              teamName: team.name,
              organizationName: organization.name,
            });
          }
          break;
        case DocumentRoleEnum.ORGANIZATION:
          {
            const organization = await this.organizationService.getOrgById(
              refId,
              { name: 1, domain: 1 },
            );
            pdfInfo = Object.assign(pdfInfo, {
              organizationName: organization.name,
            });
          }
          break;
        default:
          break;
      }
    }

    return pdfInfo;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('getDocumentById')
  getDocumentById(
    @Args('documentId') documentId: string,
  ): Promise<Document> {
    return this.documentService.getDocumentByDocumentId(documentId) as unknown as Promise<Document>;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard()
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('updateShareSetting')
  async updateShareSetting(
    @Args('input') input: UpdateShareSettingInput,
    @Context() context,
  ): Promise<ShareSetting & ExtendedDocumentIntercept & BasicResponse> {
    const { user } = context.req;
    const { documentId, permission, linkType } = input;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    if (document.service !== DocumentStorageEnum.S3) {
      throw GraphErrorException.NotAcceptable(
        'Setting of document of drive or dropbox cannot be updated',
        ErrorCode.Document.CAN_NOT_UPDATE_SETTING,
      );
    }
    const { info: organization } = await this.documentService.getTargetOwnedDocumentInfo(documentId);
    const restrictedToAnyone = document.shareSetting.linkType === ShareLinkType.INVITED && linkType === ShareLinkType.ANYONE;
    if (organization && restrictedToAnyone) {
      const hasFinishedDocument = await this.organizationDocStackService.hasFinishedDocument({ documentId, orgId: organization._id });
      const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
        totalNewDocument: 1,
      });
      const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);

      if (!hasRemainingDocStack && !hasFinishedDocument && !isRequestFromMobile) {
        throw GraphErrorException.NotAcceptable(
          'You currently reached monthly document stack limitation',
          ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT,
        );
      }
    }
    if (!user) {
      if (!this.documentService.permissionDocumentSharer(document)) {
        throw GraphErrorException.NotFound('You have no permission');
      }
    }
    const updatedDocument = await this.documentService.updateShareSetting(
      documentId,
      permission,
      linkType,
    );
    return {
      ...updatedDocument.shareSetting,
      ...(restrictedToAnyone && {
        interceptRequest: {
          documentIds: [document._id],
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
      statusCode: HttpStatus.OK,
      message: 'Update share setting successfully',
    };
  }

  private escapeRegExp(str) {
    if (typeof str !== 'string') {
      return '';
    }
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('getDocuments')
  async getDocuments(
    @Args('input') input: GetPersonalWorkspaceDocumentsInput,
    @Context() context,
  ): Promise<GetDocumentPayload> {
    const { user } = context.req;
    return this.documentService.getDocumentsPersonalWorkspace({
      user,
      ...input,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('starDocument')
  async starDocument(
    @Args('input') input: StarDocumentInput,
    @Context() context,
  ): Promise<StarDocumentPayload> {
    const { user } = context.req;
    const { clientId, documentId } = input;
    let updatedDocument;
    let isStar = true;
    const document = await this.documentService.getDocumentByDocumentId(documentId) as unknown as Document;
    if (!document) {
      return {
        message: 'You have no document with this documentId',
        document,
        statusCode: 404,
      };
    }
    const { listUserStar } = document;
    if (!listUserStar) {
      updatedDocument = await this.documentService.updateDocument(documentId, {
        listUserStar: [user._id],
      });
    } else {
      let newListUserStar;
      if (listUserStar.includes(user._id as string)) {
        const index = listUserStar.indexOf(user._id as string);
        listUserStar.splice(index, 1);
        isStar = false;
        newListUserStar = listUserStar;
      } else {
        newListUserStar = [...listUserStar, user._id];
      }
      updatedDocument = await this.documentService.updateDocument(documentId, {
        listUserStar: newListUserStar,
      });
    }
    const ownerUser = await this.userService.findUserById(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      updatedDocument.ownerId,
      { name: 1, avatarRemoteId: 1 },
    );
    const documentFavorite = this.documentService.cloneDocument(
      JSON.stringify(updatedDocument),
      {
        ownerName: ownerUser ? ownerUser.name : 'Anonymous',
        ownerAvatarRemoteId: ownerUser ? ownerUser.avatarRemoteId : '',
      },
    );
    documentFavorite.isOverTimeLimit = await this.documentService.hasDocumentBeenLimited(
      documentFavorite as Document,
    );
    this.documentService.publishUpdateDocument(
      [clientId],
      {
        document: documentFavorite,
        type: SUBSCRIPTION_DOCUMENT_LIST_FAVORITE,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );
    this.documentService.publishUpdateDocument(
      [clientId],
      {
        document: documentFavorite,
        type: SUBSCRIPTION_DOCUMENT_INFO_FAVORITE,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
    );
    return {
      message: isStar
        ? 'Document has been Starred'
        : 'Document has been remove from Starred',
      statusCode: 200,
      document: updatedDocument,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @RoleGuardForEditorAndHigherPermissions()
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation()
  async updateDocumentMimeTypeToPdf(
    @Args('documentId') documentId: string,
    @Args('remoteId') remoteId: string,
  ): Promise<BasicResponseData> {
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    if (document.mimeType as DocumentMimeType === DocumentMimeType.PDF) {
      return {
        message: 'Document mimetype is already PDF',
        statusCode: HttpStatus.OK,
        data: document,
      };
    }

    const convertExtension = Utils.convertFileExtensionToPdf(document.name);
    const updatedDocument = await this.documentService.updateDocument(documentId, {
      mimeType: DocumentMimeType.PDF,
      name: convertExtension,
      remoteId,
    });
    return {
      message: 'Document mimetype has been updated',
      statusCode: HttpStatus.OK,
      data: updatedDocument,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('updateMimeType')
  async updateMimeType(
    @Args('documentId') documentId: string,
  ): Promise<BasicResponseData> {
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }
    const extension = Utils.getExtensionFile(document.name);
    if (!Object.keys(DocumentMimeType).includes(extension.toUpperCase())) {
      throw GraphErrorException.BadRequest('The extension of document is invalid');
    }
    const mimeType = DocumentMimeType[extension.toUpperCase()];
    const updatedDocument = await this.documentService.updateDocument(documentId, {
      mimeType,
    });
    return {
      message: 'Document mimetype has been updated',
      statusCode: HttpStatus.OK,
      data: updatedDocument,
    };
  }

  // @UseGuards(GqlAuthGuard)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Query('getFormList')
  async getFormList(
    @Args('input') input: GetDocumentFormInput,
  ): Promise<GetFormListPayload> {
    const condition = input.category
      ? {
        categories: {
          $eq: input.category,
        },
      }
      : {};
    const limit = CommonConstants.PAGING_DEFAULT;
    const skip = input.pageNumber ? (input.pageNumber - 1) * limit : limit;
    const documentForms = await this.documentService.getDocumentFormByConditionAndPagination(
      condition,
      skip,
      limit,
    );
    const totalItems = await this.documentService.getTotalItemsOfCollectionByCondition(
      condition,
    );

    return {
      documents: documentForms.map((document) => document.toObject()),
      totalPage: Math.ceil(totalItems / CommonConstants.PAGING_DEFAULT),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard, CustomRulesGuard)
  @StorageUploadValidator([UPLOADABLE_SERVICES.LUMIN])
  @CustomRuleValidator(CustomRuleAction.RESTRICTED_FROM_UPLOADING_DOCUMENT)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('createPDFForm')
  // eslint-disable-next-line consistent-return
  async createPDFForm(
    @Args('input') input: CreatePDFFormInput,
    @Context() context,
  ): Promise<CreatePDFFormPayload> {
    const { user: { _id: userId }, anonymousUserId } = context.req;
    const userData = await this.userService.findUserById(userId as string);

    const {
      _id: formId, formStaticPath, source,
    } = input;
    const variationIdentifier = await this.featureFlagService.getFeatureValue<string>({
      user: userData,
      extraInfo: {
        [CommonConstants.ANONYMOUS_USER_ID_COOKIE]: anonymousUserId,
      },
      featureFlagKey: FeatureFlagKeys.STYLING_IMPACT_FOR_TEMPLATES,
    });

    if (formStaticPath === 'templates') {
      return this.documentService.handleOpenStrapiForm({
        formId, user: userData, source, variationIdentifier,
      });
    }
    return this.documentService.handleOpenPrismicForm({ formId, user: userData, formStaticPath });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard, CustomRulesGuard)
  @StorageUploadValidator([UPLOADABLE_SERVICES.LUMIN])
  @CustomRuleValidator(CustomRuleAction.RESTRICTED_FROM_UPLOADING_DOCUMENT)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('createPdfFromStaticToolUpload')
  async createPdfFromStaticToolUpload(
    @Args('input') input: CreatePdfFromStaticToolUploadInput,
    @Context() context,
  ): Promise<CreatePdfFromStaticToolUploadPayload> {
    const { user } = context.req;

    const { encodedUploadData, orgId } = input;
    const { documentRemoteId, documentName } = this.jwtService.verify(encodedUploadData);
    if (orgId) {
      const findMemberInOrg = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id as string);
      if (!findMemberInOrg) {
        throw GraphErrorException.NotAcceptable('Member does not belong to this organization', ErrorCode.Org.USER_NOT_IN_ORGANIZATION);
      }
    }

    const externalPdfUrl = await this.redisService.getCreatePdfFromStaticToolUpload(documentRemoteId as string, user._id as string);
    if (externalPdfUrl) {
      return {
        documentId: '',
        documentName: '',
        documentSize: 0,
        documentMimeType: '',
        temporaryRemoteId: '',
      };
    }
    this.redisService.setCreatePdfFromStaticToolUpload(documentRemoteId as string, user._id as string);
    return this.documentService.createPdfFromStaticToolUpload({
      remoteId: documentRemoteId,
      fileName: documentName,
      user,
      orgId,
    });
  }

  @UseGuards(RateLimiterGuard, DocumentPaymentGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    IndividualRoles.SHARER,
    OrganizationDocumentRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('acceptRequestAccessDocument')
  async acceptRequestAccessDocument(
    @Args('input') input: UpdateRequestAccessInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentId, requesterIds } = input;
    const { _id: userId } = context.req.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw GraphErrorException.BadRequest(
        'User not found',
        ErrorCode.User.USER_NOT_FOUND,
      );
    }
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    if (!document) {
      throw GraphErrorException.BadRequest(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    await this.documentService.acceptRequestAccess({ document: document as unknown as Document, accepter: user, requesterIds });

    return {
      message: 'Accept request access successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    IndividualRoles.SHARER,
    OrganizationDocumentRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('rejectRequestAccessDocument')
  async rejectRequestAccessDocument(
    @Args('input') input: UpdateRequestAccessInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { documentId, requesterIds } = input;
    const { _id: userId } = context.req.user;

    const [user, document] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(userId),
      this.documentService.getDocumentByDocumentId(documentId),
    ]);

    if (!user) {
      throw GraphErrorException.NotFound(
        'User not found',
        ErrorCode.User.USER_NOT_FOUND,
      );
    }

    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    const mapRequesterIdsToBoolean = await Promise.all(requesterIds.map(
      (id) => this.documentService.canAcceptOrRejectRequest({ actorId: userId, targetId: id, document: document as unknown as Document }),
    ));
    const isValidRequest = requesterIds.every((_, index) => mapRequesterIdsToBoolean[index]);
    if (!isValidRequest) {
      throw GraphErrorException.BadRequest('Cannot reject request access to document');
    }

    // find documentrequestaccess
    const requestAccessDocuments = await this.documentService.getRequestAccessDocument(
      { documentId, requesterId: { $in: requesterIds } },
    );
    if (requestAccessDocuments.length === 0) {
      throw GraphErrorException.NotFound(
        'Request access not found',
        ErrorCode.Document.REQUEST_ACCESS_DOCUMENT_NOT_FOUND,
      );
    }

    await this.documentService.removeRequestAccessDocument(requesterIds, documentId);

    return {
      message: 'Reject request access successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('getRequestAccessDocsList')
  async getRequestAccessDocsList(
    @Context() context,
    @Args('input') input: DocumentRequestAccessInput,
  ): Promise<RequestAccessDocsListPayload> {
    const { _id: userId } = context.req.user;
    const { documentId } = input;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );

    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    const {
      requestList, total, hasNextPage, cursor,
    } = await this.documentService.getRequestAccessesByDocId({ document: document as unknown as Document, userId, input });

    return {
      requesters: requestList,
      cursor,
      hasNextPage,
      total,
    };
  }

  /**
   * @deprecated We will remove this mutation in the future, this event will be tracked in `@Query('document')`
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @UseGuards(GqlAttachUserGuard)
  @Mutation()
  async openDocument(
    @Args('documentId') documentId: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    if (user) {
      const [document, userInfo] = await Promise.all([
        this.documentService.getDocumentByDocumentId(documentId),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.userService.findUserById(user._id),
      ]);
      const documentScope = document.isPersonal
        ? EventScopes.PERSONAL
        : EventScopes.TEAM;
      this.eventService.createEvent({
        eventName: DocumentEventNames.DOCUMENT_OPENED,
        actor: userInfo,
        eventScope: documentScope,
        document: document as unknown as Document,
      });

      const googleModalStatus = get(
        userInfo,
        'metadata.rating.googleModalStatus',
      );
      if (
        !googleModalStatus
        || googleModalStatus === RatingModalStatus.NEVER_INTERACT
      ) {
        await this.documentService.handleUpdateDocViewerInteraction(
          user._id as string,
          DocViewerInteractionType.TOTAL_OPENED_DOC,
        );
      }
    }
    return {
      message: 'Open document successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getShareInviteByEmailList(
    @Context() context,
    @Args('documentId') documentId: string,
    @Args('searchKey') searchKey: string,
  ): Promise<GetShareInviteByEmailListPayload> {
    const { user: actor } = context.req;
    return this.documentService.getShareInviteByEmailList({
      actor,
      documentId,
      searchKey,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestLevelGuard(OrganizationDocumentRoles.ALL, IndividualRoles.ALL, OrgTeamDocumentRoles.ALL)
  @UseGuards(GqlAttachUserGuard)
  @Query()
  async getMentionList(
    @Context() context,
    @Args('input') input: MentionListInput,
  ): Promise<GetMentionListPayload> {
    const { searchKey, documentId } = input;
    const { user: currentUser } = context.req;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );
    let refIds;
    if (document.isPersonal) {
      const documentPermissions = await this.documentService.getDocumentPermissionsByDocId(
        documentId,
      );
      refIds = documentPermissions.map(
        (documentpermission) => documentpermission.refId,
      );
    } else {
      const isSpecificPermission = (role) => [
        DocumentRoleEnum.ORGANIZATION,
        DocumentRoleEnum.ORGANIZATION_TEAM,
      ].includes(role as DocumentRoleEnum);
      const estimateInternalMember = await this.documentService.estimateMentionableMembers({
        roles: [
          DocumentRoleEnum.ORGANIZATION,
          DocumentRoleEnum.ORGANIZATION_TEAM,
        ],
        documentId,
      });
      if (estimateInternalMember >= MAX_MEMBERS_FOR_PARTIAL_MENTION) {
        /**
         * Currently we only support partial mention by email with limit 1000 members due to performance issue
         */
        const userFound = await this.userService.findUserByEmail(searchKey, {
          _id: 1,
          email: 1,
          name: 1,
          avatarRemoteId: 1,
        });
        return {
          mentionList: [userFound].filter(Boolean),
        };
      }
      const documentPermissions = await this.documentService.getDocumentPermissionsByDocId(documentId);
      const orgDocumentPermission = documentPermissions.find((doc) => isSpecificPermission(doc.role));
      let memberRefIds = [];
      const internalMembers = await this.documentService.getInternalMembers(
        orgDocumentPermission,
      );
      const isInternalMember = internalMembers.some(
        (member) => member === currentUser._id,
      );
      if (isInternalMember) {
        memberRefIds = internalMembers.map((member) => new Types.ObjectId(member));
      }

      const externalRefIds = documentPermissions
        .filter((doc) => !isSpecificPermission(doc.role))
        .map((docPermission) => docPermission.refId);
      refIds = [...memberRefIds, ...externalRefIds];
    }
    const numberOfLimit = searchKey !== undefined ? LIMIT_USER_CONTACTS : refIds.length;
    const mentionList = await this.userService.getMentionList(
      currentUser._id as string,
      refIds as string[],
      searchKey,
      numberOfLimit as number,
    );
    const mentionListRefIds = mentionList.map((member) => member._id);
    const mentionListRemaining = numberOfLimit - mentionList.length;
    let defaultMentionList = [];
    if (mentionListRemaining > 0) {
      defaultMentionList = await this.userService.getDefaultMentionList({
        userId: currentUser._id,
        refIds,
        existingRefIds: mentionListRefIds,
        searchKey,
        limit: mentionListRemaining,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const currentUserInfo = await this.userService.findExternalSharees([new Types.ObjectId(currentUser._id)], searchKey);
    return { mentionList: [...mentionList, ...defaultMentionList, ...currentUserInfo] };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentTeamLevelGuard(
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getMembersByDocumentId(
    @Args('input') input: GetMembersByDocumentIdInput,
    @Context() context,
  ): Promise<MemberWithCursorPaginationPayload> {
    const { minQuantity, documentId, cursor = '' } = input;
    const { user: currentUser } = context.req;
    const documentPermission = (
      await this.documentService.getDocumentPermissionsByDocId(documentId, {
        role: {
          $in: [
            DocumentRoleEnum.ORGANIZATION,
            DocumentRoleEnum.ORGANIZATION_TEAM,
          ],
        },
      })
    )[0];
    if (!documentPermission) {
      throw GraphErrorException.NotAcceptable(
        'Can not access this document',
        ErrorCode.Document.NO_DOCUMENT_PERMISSION,
      );
    }
    let memberList;
    switch (documentPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        memberList = await this.organizationService.getMemberInOrganizationByDocumentId(
          documentPermission,
          currentUser,
          minQuantity,
          cursor,
        );
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        memberList = await this.organizationService.getMemberInOrganizationTeamByDocumentId(
          documentPermission,
          currentUser,
          minQuantity,
          cursor,
        );
        break;
      }
      default:
        break;
    }
    return memberList;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestLevelGuard(
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
    OrganizationDocumentRoles.ALL,
  )
  @DocumentActionPermissionGuard(DocumentActionPermissionResource.DOCUMENT, DocumentAction.COPY)
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @UseInterceptors(SanitizeInputInterceptor)
  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async duplicateDocument(
    @Args('input') input: DuplicateDocumentInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, DocumentFilePipe())
      file: FileData,
    @Context() context,
  ): Promise<Document & ExtendedDocumentIntercept & BasicResponse> {
    const { _id: userId } = context.req.user;
    const {
      newDocumentData: { destinationId, destinationType },
    } = input;

    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    const startTime = performance.now();
    this.loggerService.info({
      context: 'duplicateDocument',
      message: 'Start duplicate document',
      extraInfo: {
        documentId: input.documentId,
        destinationType,
        destinationId,
        creatorId: userId,
        fileSize: file?.filesize,
        isRequestFromMobile,
      },
    });

    const {
      error,
    } = await this.documentService.verifyCopyToDocDestinationPermission({
      destinationType,
      destinationId,
      creatorId: userId,
    });
    if (error) {
      throw error;
    }
    const document = await this.documentService.duplicateDocument({
      ...input,
      creatorId: userId,
      file,
      isRequestFromMobile,
    });

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    this.loggerService.info({
      context: 'duplicateDocument',
      message: 'End duplicate document',
      extraInfo: {
        durationMs,
        fileSize: file?.filesize,
        isRequestFromMobile,
        documentId: input.documentId,
      },
    });
    const isDuplicateToPersonal = destinationType === TypeOfDocument.PERSONAL;
    return {
      ...document as unknown as Document,
      message: 'Copy document success',
      statusCode: HttpStatus.OK,
      ...(!isDuplicateToPersonal && {
        interceptRequest: {
          documentIds: [document._id],
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(GqlAttachUserGuard)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getManipulationDocument(
    @Args('input') input: ManipulationDocumentInput,
  ): Promise<IManipulation[]> {
    const { documentId, refId, type } = input;
    const document = await this.documentService.findOneById(documentId);
    if (!document) {
      throw GraphErrorException.NotFound('Document not found');
    }
    const currentDate = moment().startOf('day').toDate();
    const condition = {
      refId,
      type,
      createdAt: { $gte: new Date(currentDate) },
    };

    return this.documentService.getManipulationDocument(condition);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @CustomRuleValidator(CustomRuleAction.MOVE_DOCUMENTS)
  @Mutation()
  /**
   * TODO: convert to presigned url to upload
   */
  async moveDocuments(
    @Args('input') input: MoveDocumentsInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, DocumentFilePipe())
      file: FileData,
    @Context() context,
  ): Promise<BasicResponse & ExtendedDocumentIntercept> {
    const { _id: userId } = context.req.user;
    const { destinationType } = input;
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    const startTime = performance.now();
    this.loggerService.info({
      context: 'moveDocuments',
      message: 'Start move documents',
      extraInfo: {
        documentIds: input.documentIds,
        destinationType,
        fileSize: file?.filesize,
        isRequestFromMobile,
      },
    });
    const result = await this.documentService.moveDocuments({
      actorId: userId,
      file,
      isRequestFromMobile,
      ...input,
    });
    if (!result.isSuccess) {
      throw result.error;
    }
    const isMoveToPersonal = destinationType === DestinationType.PERSONAL;
    const isMoveFromPersonal = { result };
    const shouldCountDocStack = isMoveFromPersonal && !isMoveToPersonal;
    const endTime = performance.now();
    const durationMs = endTime - startTime;
    this.loggerService.info({
      context: 'moveDocuments',
      message: 'End move documents',
      extraInfo: {
        durationMs,
        fileSize: file?.filesize,
        documentIds: input.documentIds,
      },
    });
    return {
      message: 'Move documents successfully',
      statusCode: HttpStatus.OK,
      ...(shouldCountDocStack && {
        interceptRequest: {
          documentIds: input.documentIds,
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @FolderPermissionGuard()
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @CustomRuleValidator(CustomRuleAction.MOVE_DOCUMENTS)
  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async moveDocumentsToFolder(
    @Args('input') input: MoveDocumentsToFolderInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, DocumentFilePipe())
      file: FileData,
    @Context() context,
  ): Promise<BasicResponse & ExtendedDocumentIntercept> {
    const { _id: userId } = context.req.user;
    const { folderId } = input;

    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);

    const startTime = performance.now();
    this.loggerService.info({
      context: 'moveDocumentsToFolder',
      message: 'Start move documents to folder',
      extraInfo: {
        documentIds: input.documentIds,
        folderId,
        fileSize: file?.filesize,
        isRequestFromMobile,
      },
    });
    const [folderPermission] = await this.folderService.getFolderPermissions({
      folderId,
      role: {
        $in: [
          FolderRoleEnum.OWNER,
          FolderRoleEnum.ORGANIZATION_TEAM,
          FolderRoleEnum.ORGANIZATION,
        ],
      },
    });
    const destinationType = folderPermission.role === FolderRoleEnum.OWNER
      ? DestinationType.PERSONAL
      : DestinationType[folderPermission.role.toUpperCase()];

    const result = await this.documentService.moveDocuments({
      actorId: userId,
      destinationId: destinationType === DestinationType.PERSONAL
        ? folderPermission.workspace?.refId.toHexString() || folderPermission.refId.toHexString()
        : folderPermission.refId.toHexString(),
      destinationType,
      file,
      isRequestFromMobile,
      documentName: input.documentName,
      ...input,
    });
    if (!result.isSuccess) {
      throw result.error;
    }
    const isMoveToPersonalFolder = folderPermission.role === FolderRoleEnum.OWNER;
    const { isMoveFromPersonal } = result;
    const shouldCountDocStack = isMoveFromPersonal && !isMoveToPersonalFolder;
    const endTime = performance.now();
    const durationMs = endTime - startTime;
    this.loggerService.info({
      context: 'moveDocumentsToFolder',
      message: 'End move documents to folder',
      extraInfo: {
        durationMs,
        fileSize: file?.filesize,
        isRequestFromMobile,
        documentIds: input.documentIds,
        folderId,
      },
    });
    return {
      message: 'Move documents to folder successfully',
      statusCode: HttpStatus.OK,
      ...(shouldCountDocStack && {
        interceptRequest: {
          documentIds: input.documentIds,
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @DocumentGuestAuthLevelGuard(IndividualRoles.ALL)
  @Query()
  getSharedDocuments(
    @Context() context,
    @Args('input') input: DocumentQueryInput,
  ): Promise<GetDocumentPayload> {
    const { user } = context.req;
    return this.documentService.getDocumentsPersonalWorkspace({
      user,
      query: input,
      filter: {},
      tab: DocumentTab.SHARED_WITH_ME,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Mutation()
  async createTemplateBaseOnDocument(
    @Context() context,
    @Args('input') input: CreateTemplateBaseOnDocumentInput,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe())
      files: [FileData],
  ): Promise<Template> {
    const { _id: userId } = context.req.user;
    const { destinationId, documentId, destinationType } = input;
    const document = await this.documentService.getDocumentByDocumentId(documentId);
    const pdfFile = files?.find((file) => file.type === 'template');
    if (!PDF_MIME_TYPE.includes(document.mimeType) || (pdfFile && !PDF_MIME_TYPE.includes(pdfFile.mimetype))) {
      throw GraphErrorException.BadRequest('User can only create template from pdf file');
    }

    const isAllow = await this.templateSetvice.verifyDestinationToCreateTemplate({
      destinationId, destinationType, actorId: userId, documentId,
    });
    if (!isAllow) {
      throw GraphErrorException.BadRequest('Cannot create template on this destination');
    }
    return this.templateSetvice.createTemplateBaseOnDocument({
      ...input, files, uploaderId: userId,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.SHARER,
  )
  @Mutation()
  async bulkUpdateDocumentInvitedList(
    @Args('input') input: BulkUpdateDocumentPermissionInput,
  ): Promise<BasicResponse> {
    const { role, documentId } = input;
    const lowerRoles = this.documentService.getLowerRole(role.toLowerCase() as DocumentRoleEnum);
    const [externalPermissions] = await Promise.all([
      this.documentService.getDocumentPermissionsByDocId(
        documentId,
        { role: { $nin: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.OWNER] } },
      ),
      this.documentService.updateManyDocumentPermission(
        { documentId, role: { $nin: ORIGINAL_DOCUMENT_PERMISSION_ROLE } },
        { role: role.toLowerCase() },
      ),
      this.documentService.updateManySharedNonUser({ documentId }, { role: role.toLowerCase() }),
    ]);
    const externalIds = externalPermissions.map((permission) => permission.refId);
    const requestAccesses = await this.documentService.getRequestAccessDocument(
      { documentId, requesterId: { $in: externalIds }, documentRole: { $in: lowerRoles } },
    );
    await Promise.all(
      requestAccesses.map((requestAccess) => this.documentService.removeRequestAfterUpdatePermission(
        { documentId, userId: requestAccess.requesterId },
      )),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Bulk update document permissions successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard()
  @Mutation()
  async bulkUpdateDocumentMemberList(
    @Args('input') input: BulkUpdateDocumentPermissionInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const { role, documentId } = input;
    const updatedPermission = await this.documentService.updateDocumentPermissionInOrg(
      { documentId },
      { 'defaultPermission.member': role.toLowerCase(), groupPermissions: {} },
    );
    if (!updatedPermission) {
      throw GraphErrorException.BadRequest('Cannot bulk update document permissions');
    }
    if (updatedPermission) {
      const lowerRoles = this.documentService.getLowerRole(role.toLowerCase() as DocumentRoleEnum);
      const requesters = await this.documentService.getRequestAccessDocument({ documentId, documentRole: { $in: lowerRoles } });
      const requesterIds = requesters.map((requester) => requester.requesterId);
      const memberOrgs = await this.organizationService.getOrgMembershipByConditions({
        conditions: { orgId: updatedPermission.refId, userId: { $in: requesterIds } },
      });
      await Promise.all(
        memberOrgs.map((memberOrg) => this.documentService.removeRequestAfterUpdatePermission({ documentId, userId: memberOrg.userId })),
      );
    }
    const { refId, role: documentType } = updatedPermission;
    this.messageGateway.server
      .to(`document-room-${documentId}`)
      .emit(SOCKET_MESSAGE.BULK_UPDATE_DOCUMENT_MEMBER_LIST, { refId, documentType, actorId: user._id });
    return {
      statusCode: HttpStatus.OK,
      message: 'Bulk update document permissions successfully',
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createUserStartedDocument(
    @Args('isMobile') isMobile: boolean,
    @Context() context,
  ): Promise<Document> {
    const { user } = context.req;
    const { document, error } = await this.documentService.createUserStartedDocument(user._id as string, isMobile);

    if (error) {
      throw error;
    }

    return document;
  }

  @ResolveField('clientId')
  async getClientId(
    @Parent() document,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<string> {
    if (document.isPersonal) {
      return '';
    }
    const documentPermission = await loaders.originalDocumentPermissionsLoader.load(document._id as string);
    const isInternalDocPermission = [
      DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM,
    ].includes(documentPermission?.role as DocumentRoleEnum);
    return isInternalDocPermission && documentPermission?.refId || '';
  }

  @ResolveField('roleOfDocument')
  getRoleOfDocument(
    @Context() context,
    @Parent() document: Document,
  ): Promise<string> {
    return this.documentService.getUserRoleInDocument({ context, document });
  }

  @ResolveField('capabilities')
  async getCapabilities(
    @Context() context,
    @Parent() document: Document,
  ): Promise<DocumentCapabilities> {
    if (document.capabilities) {
      return document.capabilities;
    }

    const isDocumentActionPermissionEnabled = await this.featureFlagService.getFeatureIsOn({
      featureFlagKey: FeatureFlagKeys.DOCUMENT_ACTION_PERMISSION,
    });
    const principle = await this.documentService.getUserDocumentPolicyPrinciple({ context, document });
    const capabilities = await this.documentActionPermissionService.getDocumentCapabilities({
      document,
      principle: principle?.toLowerCase() as DocumentActionPermissionPrinciple || undefined,
      user: context.req.user,
      disableCapabilities: !isDocumentActionPermissionEnabled,
    });
    return capabilities;
  }

  @ResolveField('documentType')
  async getDocumentType(
    @Parent() document: Document,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<string> {
    if (document.isPersonal) {
      return TypeOfDocument.PERSONAL;
    }
    const docPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);

    if (!docPermission || ![DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM].includes(docPermission.role as DocumentRoleEnum)) {
      if (document.shareSetting.linkType !== 'ANYONE') {
        throw GraphErrorException.Forbidden(
          'You have no document with this documentId',
        );
      }
      return null;
    }

    return TypeOfDocument[docPermission.role.toUpperCase()];
  }

  @ResolveField('shareSetting')
  interceptShareSetting(@Parent() document: Document): string {
    const newShareSetting: any = document.shareSetting;
    if (newShareSetting.permission === DocumentRoleEnum.SHARER.toUpperCase()) {
      newShareSetting.permission = DocumentRoleEnum.EDITOR.toUpperCase();
      return newShareSetting;
    }

    return newShareSetting;
  }

  @ResolveField('folderData')
  async getFolderData(
    @Context() context,
    @Parent() document: Document,
  ): Promise<FolderPublicInfo> {
    if (document.folderData) {
      return document.folderData;
    }

    const { user } = context.req;

    if (!user || !document.folderId) {
      return null;
    }
    const folderBelongsTo = await this.folderService.getBelongsTo(document.folderId);

    const folderData = await this.folderService.findOneFolder(document.folderId);
    if (document.isPersonal) {
      const folderPermission = await this.folderService.findOneFolderPermission(document.folderId, { refId: user._id });
      return {
        ...folderData,
        canOpen: Boolean(folderPermission),
        belongsTo: folderBelongsTo,
      };
    }

    const [documentPermission] = await this.documentService.getDocumentPermissionByConditions({ documentId: document._id }, { refId: user._id });
    return {
      ...folderData,
      canOpen: !documentPermission,
      belongsTo: folderBelongsTo,
    };
  }

  @ResolveField('ownerName')
  async getownerName(
    @Parent() document: Document,
    @Context() { loaders, req }: { loaders: DataLoaderRegistry, req: IGqlRequest },
  ): Promise<string> {
    const { user } = req;
    if (!user) {
      return null;
    }

    const { ownerId, ownerName } = document;
    if (ownerName) {
      return ownerName;
    }
    if (!ownerId) {
      return '';
    }
    const owner = await loaders.usersLoader.load(ownerId);
    return owner.name;
  }

  @ResolveField('isOverTimeLimit')
  async getIsOverTimeLimit(
    @Parent() document: Document,
  ): Promise<boolean> {
    const { isOverTimeLimit } = document;
    if (isOverTimeLimit) {
      return isOverTimeLimit;
    }
    const data = await this.documentService.hasDocumentBeenLimited(
      document,
    );
    return data;
  }

  @ResolveField('belongsTo')
  getDocumentBelongsTo(
    @Parent() document: Document,
    @Context() context,
  ): Promise<BelongsTo> | BelongsTo {
    const { user } = context.req;
    if (!user) {
      return null;
    }

    if (document.belongsTo) {
      return document.belongsTo;
    }
    return this.documentService.getBelongsTo(document);
  }

  @ResolveField('isShared')
  async isSharedDocument(
    @Parent() document: Document,
    @Context() context,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<boolean> {
    const { _id: userId } = context.req.user || {};
    const isShareLinkTypeAnyone = document.shareSetting.linkType === ShareLinkType.ANYONE;

    if (!userId) {
      return isShareLinkTypeAnyone;
    }

    if (isShareLinkTypeAnyone) {
      const originalDocumentPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);
      switch (originalDocumentPermission.role) {
        case DocumentRoleEnum.OWNER:
          return originalDocumentPermission.refId.toHexString() !== userId;
        case DocumentRoleEnum.ORGANIZATION: {
          const orgMemberShip = await loaders.orgMembershipLoader.load(
            `${userId}-${originalDocumentPermission.refId}`,
          );
          return !orgMemberShip;
        }
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const teamMemberShip = await loaders.teamMembershipLoader.load(
            `${userId}-${originalDocumentPermission.refId}`,
          );
          return !teamMemberShip;
        }
        default:
          break;
      }
    }

    const sharedPermission = await loaders.sharedDocumentPermissionsLoader.load(`${userId}-${document._id}`);
    return Boolean(sharedPermission);
  }

  @ResolveField('premiumToolsInfo')
  async getPremiumToolsInfo(
    @Parent() document: Document,
    @Context() context,
  ): Promise<PremiumToolsInfo> {
    const { _id: userId }: { _id: string } = context.req.user || {};
    const { signedResponse } = await this.documentService.getPremiumToolInfo({ document, userId });
    return {
      signedResponse,
    };
  }

  /**
   * @deprecated will remove after release document versioning
   */
  @ResolveField('backupInfo')
  async getBackupInfo(
    @Parent() document: Document,
    @Context() context,
  ): Promise<BackupInfo> {
    const user = context.req.user || {};
    if (!user._id) {
      return null;
    }
    const backupFileInfo = await this.documentService.getDocumentBackupInfoById(document._id);
    if (!backupFileInfo) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const restoreOriginalPermission = await this.documentService.getRestoreOriginalPermission(document._id, user);
    return {
      createdAt: backupFileInfo.createdAt as unknown as string,
      restoreOriginalPermission,
    };
  }

  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RateLimiterGuard, GqlAttachUserGuard)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getDocStackInfo(
    @Args('documentId') documentId: string,
  ): Promise<GetDocStackInfoPayload> {
    const targetOwnedDocumentInfo = await this.documentService.getTargetOwnedDocumentInfo(documentId);
    if (!targetOwnedDocumentInfo.info) {
      return { canFinishDocument: true };
    }
    const { info: targetOrg } = targetOwnedDocumentInfo;
    const { payment: { type }, settings: { autoUpgrade } } = targetOrg;
    if (!DOC_STACK_PLAN.includes(type as PaymentPlanEnums) || autoUpgrade) {
      return { canFinishDocument: true };
    }
    const [isDocumentFinished, docStackInfo] = await Promise.all([
      this.organizationDocStackService.getOneDocStack({ documentId, orgId: targetOrg._id }),
      this.organizationDocStackService.getDocStackInfo({
        orgId: targetOrg._id, payment: targetOrg.payment, totalNewDocument: 1,
      }),
    ]);

    return {
      canFinishDocument: Boolean(isDocumentFinished) || !docStackInfo.isOverDocStack,
      ...docStackInfo,
    };
  }

  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RateLimiterGuard)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Mutation()
  async trackingUserUseDocument(
    @Context() context,
    @Args('documentId') documentId: string,
  ): Promise<BasicResponse & ExtendedDocumentIntercept> {
    const { _id: userId } = context.req.user;
    const [actorInfo, document] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(userId),
      this.documentService.findOneById(documentId),
    ]);
    // track user use document
    const useDocumentEvent: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_USED,
      eventScope: EventScopes.PERSONAL,
      actor: actorInfo,
      document: document as unknown as Document,
    };

    this.personalEventService.createUserUseDocumentEvent(useDocumentEvent);
    return {
      message: 'Update successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RateLimiterGuard, DocumentPaymentGuard)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Mutation()
  countDocStackUsage(
    @Args('documentId') documentId: string,
  ) {
    return {
      statusCode: 200,
      message: 'Count doc stack successfully',
      interceptRequest: {
        documentIds: [documentId],
        strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
      },
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @Query()
  async getRequestAccessDocById(
    @Args('documentId') documentId: string,
    @Args('requesterId') requesterId: string,
  ): Promise<UserPermission> {
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
    );

    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    const [requestAccess] = await this.documentService.getRequestAccessDocument(
      { requesterId, documentId },
    );

    if (!requestAccess) {
      throw GraphErrorException.NotFound(
        'Request access not found',
        ErrorCode.RequestAccess.REQUEST_ACCESS_NOT_FOUND,
      );
    }

    const requestUser = await this.userService.findUserById(
      requesterId,
      {
        _id: 1,
        name: 1,
        avatarRemoteId: 1,
        email: 1,
      },
    );
    const usersPermission = {
      ...requestUser,
      role: requestAccess.documentRole,
      type: USER_SHARING_TYPE.REQUEST_ACCESS,
      teamName: null,
    };
    return usersPermission;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query()
  async checkThirdPartyStorage(
    @Args('remoteIds') remoteIds: string[],
    @Context() context,
  ): Promise<CheckThirdPartyStoragePayload[]> {
    const { _id: userId } = context.req.user;
    const user = await this.userService.findUserById(userId as string);
    const documents = await this.documentService.checkThirdPartyStorage(user, remoteIds);
    return documents;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  getAnnotations(@Args('documentId') documentId: string) {
    return this.documentService.getAnnotationsOfDocument(documentId, { xfdf: 1, annotationId: 1 });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getPremiumToolInfoAvailableForUser(@Context() context): Promise<PremiumToolsInfo> {
    const { user } = context.req;
    const { signedResponse } = await this.documentService.getPremiumToolInfoAvailableForUser(user._id as string);
    return {
      signedResponse,
    };
  }

  // Fallback to empty string when document name does not exist
  @ResolveField('name')
  getName(@Parent() document): string {
    return document.name || '';
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.OWNER,
    IndividualRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async getDocumentOriginalFileUrl(@Args('documentId') documentId: string, @Context() context): Promise<string> {
    const { user } = context.req;
    const backupInfo = await this.documentService.getDocumentBackupInfoById(documentId);
    if (!backupInfo) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const restoreOriginalPermission = await this.documentService.getRestoreOriginalPermission(documentId, user);
    if (restoreOriginalPermission === RestoreOriginalPermission.NOT_ALLOWED) {
      throw GraphErrorException.Forbidden('You don\'t have permission');
    }
    return this.awsService.getSignedUrl({ keyFile: backupInfo.remoteId });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.OWNER,
    IndividualRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  /**
   * @deprecated will remove after release document versioning
   */
  @Mutation()
  async restoreOriginalVersion(@Context() context, @Args('documentId') documentId: string): Promise<BasicResponse> {
    const backupFileInfo = await this.documentService.getDocumentBackupInfoById(documentId);
    if (!backupFileInfo) {
      throw GraphErrorException.NotFound('Original info not found');
    }
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const restoreOriginalPermission = await this.documentService.getRestoreOriginalPermission(documentId, user);
    if (restoreOriginalPermission !== RestoreOriginalPermission.RESTORE) {
      throw GraphErrorException.Forbidden('You don\'t have permission');
    }
    const document = await this.documentService.getDocumentByDocumentId(documentId);
    const documentBucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const backupSource = `${documentBucket}/${backupFileInfo.remoteId}`;
    if (document.service === DocumentStorageEnum.S3) {
      await Promise.all([
        this.awsService.copyObjectS3(backupSource, documentBucket, document.remoteId, false, this.awsService.s3InstanceForDocument()),
        this.documentService.resetDocument(documentId),
      ]);
    }
    const documentSize = await this.awsService.getDocumentSize(backupFileInfo.remoteId);
    await this.documentService.updateDocument(document._id, { lastModify: Date.now(), size: documentSize });
    this.documentService.sendRestoreDocNotiToMembers({ userId: user._id, document, isRestoreOriginal: true });
    return {
      message: 'Restore successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  /**
   * @deprecated will remove after release document versioning
  */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.OWNER,
    IndividualRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async getPresignedUrlForDocumentOriginalVersion(
    @Context() context,
    @Args('input') input: GetPresignedUrlForUploadDocInput,
  ): Promise<GetPresignedUrlForUploadDocPayload> {
    const { user } = context.req;
    const { documentMimeType: mimeType, documentId } = input;
    const backupFileInfo = await this.documentService.getDocumentBackupInfoById(documentId);
    if (backupFileInfo) {
      throw GraphErrorException.Conflict('Original info already created');
    }
    const document = await this.documentService.getDocumentByDocumentId(documentId);
    const isAllowedToBackup = await this.documentService.isAllowedToBackupPreviousVersion(document as unknown as Document);
    if (!isAllowedToBackup) {
      throw GraphErrorException.Forbidden("You don't have permission to backup file");
    }
    const presignedData = await this.uploadService.getDocumentPresignedUrl({ mimeType });
    const encodedUploadData = this.uploadService.createToken({ userId: user._id, documentRemoteId: presignedData.fields.key });
    return {
      document: presignedData,
      encodedUploadData,
    };
  }

  /**
   * @deprecated will remove after release document versioning
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.OWNER,
    IndividualRoles.OWNER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Mutation()
  createDocumentBackupInfoForDocument(): BasicResponse {
    return {
      message: 'Backup successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @ResolveField('getAnnotationUrl')
  getAnnotationUrl(@Parent() document): string {
    return this.signedUrlFactory.createSignedUrl({ path: `/annotation/${document._id}`, expire: 600, method: 'GET' });
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @Query()
  async getCreatedSignaturePresignedUrl(
    @Context() context,
    @Args('fileType') fileType: string,
  ): Promise<PresignedUrlForSignaturePayload> {
    const { _id: userId } = context.req.user;
    const user = await this.userService.findUserById(userId as string);
    const isPremiumUser = await this.userService.isAvailableUsePremiumFeature(user);
    const maximumNumberSignature = isPremiumUser ? MAXIMUM_NUMBER_SIGNATURE.PREMIUM_PLAN : MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;

    const { signatures: userSignatures = [] } = user;
    if (userSignatures.length >= maximumNumberSignature) {
      throw GraphErrorException.BadRequest('Signature reached the limit', ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE);
    }
    if (!IMAGE_MIME_TYPE.includes(fileType)) {
      throw GraphErrorException.BadRequest('Only image file (png, jpg, jpeg) is supported');
    }
    const { url, key } = await this.awsService.getPresignedUrlForSignature(fileType as unknown as SIGNATURE_MIMETYPE);
    const signedUrl = await this.awsService.getSignedUrl({
      keyFile: key,
      bucketName: this.environmentService.getByKey(
        EnvConstants.S3_PROFILES_BUCKET,
      ),
    });

    return {
      putSignedUrl: url,
      getSignedUrl: signedUrl,
      remoteId: key,
      encodeSignatureData: this.uploadService.createToken({ userId, signatureRemoteId: key }),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @Query()
  async getPresignedUrlForDocumentImage(@Args('input') input: PresignedUrlForImageInput): Promise<PresignedUrlForImagePayload> {
    const { documentId, mimeType } = input;
    const { url, key } = await this.awsService.getPresignedUrlForDocumentImage(mimeType, documentId);
    const signedUrl = await this.awsService.getSignedUrl({ keyFile: `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${key}` });
    return { remoteId: key, putSignedUrl: url, getSignedUrl: signedUrl };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @Query()
  async getPresignedUrlForMultipleDocumentImages(@Args('input') input: PresignedUrlForMultiImagesInput): Promise<PresignedUrlForImagePayload[]> {
    const { documentId, listMimeTypes } = input;
    return Promise.all(listMimeTypes.map(async (mimeType) => {
      const { url, key } = await this.awsService.getPresignedUrlForDocumentImage(mimeType, documentId);
      const signedUrl = await this.awsService.getSignedUrl({
        keyFile: `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${key}`,
      });
      return { remoteId: key, putSignedUrl: url, getSignedUrl: signedUrl };
    }));
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @Mutation()
  async deleteDocumentImages(
    @Args('input') input: DeleteDocumentImagesInput,
  ): Promise<BasicResponse> {
    const { documentId, remoteIds } = input;
    await this.documentService.deleteImageSignedUrlByRemoteIds(documentId, remoteIds);
    return {
      message: 'Delete images successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(IndividualRoles.OWNER)
  @Query()
  async getPresignedUrlForTemporaryDrive(
    @Context() context,
    @Args('documentId') documentId: string,
  ): Promise<GetPresignedUrlForTemporaryDocumentPayload> {
    const { user } = context.req;
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
      {
        service: true,
        temporaryRemoteId: true,
        mimeType: true,
        size: true,
      },
    );
    if (document.service !== DocumentStorageEnum.GOOGLE) {
      throw GraphErrorException.Forbidden('Only valid for Drive storage');
    }
    if (document.size > RateLimiterFileSize.PAID) {
      throw GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM);
    }
    const documentPresignedResult = await this.uploadService.getDocumentPresignedUrl({
      mimeType: document.mimeType,
      key: document.temporaryRemoteId,
    });
    const encodedUploadData = this.uploadService.createToken({
      userId: user._id,
      documentRemoteId: documentPresignedResult.fields.key,
      documentId,
    });
    return { document: documentPresignedResult, encodedUploadData };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentPersonalLevelGuard(
    IndividualRoles.OWNER,
  )
  @Mutation()
  async createTemporaryContentForDrive(@Args('input') input: CreateDocumentBackupInfoInput, @Context() context): Promise<BasicResponse> {
    const { user } = context.req;
    const { documentId, encodedUploadData } = input;
    const { documentRemoteId } = this.uploadService.verifyUploadTemporaryDocumentData(user._id as string, documentId, encodedUploadData);
    const fileSize = await this.awsService.getDocumentSize(documentRemoteId);
    if (fileSize === 0) {
      throw GraphErrorException.BadRequest('File does not exist');
    }
    if (fileSize > RateLimiterFileSize.PAID) {
      throw GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM);
    }
    const document = await this.documentService.getDocumentByDocumentId(documentId, { service: true, temporaryRemoteId: true });
    if (document.service !== DocumentStorageEnum.GOOGLE) {
      throw GraphErrorException.Forbidden('Only valid for Drive storage');
    }
    if (document.temporaryRemoteId && document.temporaryRemoteId !== documentRemoteId) {
      throw GraphErrorException.Conflict('Document had already temporary content');
    } else if (!document.temporaryRemoteId) {
      await this.documentService.updateDocument(documentId, { temporaryRemoteId: documentRemoteId, size: fileSize, manipulationStep: '' });
    } else {
      await this.documentService.updateDocument(documentId, { size: fileSize, manipulationStep: '' });
    }
    this.loggerService.info({
      context: 'createTemporaryContentForDrive.deleteManyAnnotationOfDocument',
      extraInfo: { documentId },
    });
    await this.documentService.deleteManyAnnotationOfDocument({ documentId });
    return {
      message: 'Create successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestLevelGuard(
    IndividualRoles.OWNER,
  )
  @Mutation()
  async deleteTemporaryContentForDrive(@Args('documentId') documentId: string): Promise<BasicResponse> {
    const document = await this.documentService.getDocumentByDocumentId(documentId, { service: true, temporaryRemoteId: true, mimeType: true });
    if (document.service !== DocumentStorageEnum.GOOGLE) {
      throw GraphErrorException.Forbidden('Only valid for Drive storage');
    }
    if (!document.temporaryRemoteId) {
      throw GraphErrorException.NotFound('Not found document temporary content');
    }
    this.documentService.updateDocument(documentId, { temporaryRemoteId: '' });
    await this.awsService.removeDocument(document.temporaryRemoteId);
    return {
      message: 'Delete successfully!',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async getSignedUrlForOCR(
    @Args('documentId') documentId: string,
    @Args('totalParts') totalParts: number,
    @Context() context,
  ) {
    const { user } = context.req;
    const hasPermission = await this.documentService.isAllowedToUseOCR(documentId, user._id as string);
    if (!hasPermission) {
      throw GraphErrorException.Forbidden('You don\'t have permission to use OCR');
    }
    return this.documentService.getKeyAndSignedUrlsForOCR(documentId, totalParts);
  }

  @ResolveField('sharedPermissionInfo')
  async getSharedPermission(
    @Parent() document: Document,
  ): Promise<SharedPermissionInfo> {
    let permissionInfo = {
      type: ShareTypeEnum.PRIVATE,
      organizationName: '',
      teamName: '',
      total: 0,
    };

    const documentPermissionInfo = await this.documentService.getDocumentPermissionsByDocId(
      document._id,
      { role: { $in: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.OWNER] } },
    );
    // eslint-disable-next-line default-case
    switch (documentPermissionInfo[0].role) {
      case DocumentRoleEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(documentPermissionInfo[0].refId);
        permissionInfo = Object.assign(permissionInfo, {
          type: ShareTypeEnum.ORGANIZATION,
          organizationName: organization.name,
        });
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(documentPermissionInfo[0].refId);
        permissionInfo = Object.assign(permissionInfo, {
          type: ShareTypeEnum.ORGANIZATION_TEAM,
          teamName: team.name,
        });
        break;
      }
      case DocumentRoleEnum.OWNER: {
        const totalPermissionsOfDocument = await this.documentService.totalPermissionsOfDocument(document._id);
        if (totalPermissionsOfDocument > 1) {
          permissionInfo = Object.assign(permissionInfo, {
            type: ShareTypeEnum.SPECIFIC_USER,
            // totalPermissionsOfDocument included the owner, so have to minus 1
            total: totalPermissionsOfDocument - 1,
          });
        }
        break;
      }
    }

    const isShareLinkTypeAnyone = document.shareSetting.linkType === ShareLinkType.ANYONE;

    if (isShareLinkTypeAnyone) {
      permissionInfo = Object.assign(permissionInfo, {
        type: ShareTypeEnum.PUBLIC,
      });
    }
    return permissionInfo;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  refreshDocumentImageSignedUrls(@Args('documentId') documentId: string): Promise<Record<string, string>> {
    return this.documentService.getImageSignedUrlsById(documentId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  getSignedUrlForAnnotations(@Args('documentId') documentId: string): string {
    return this.signedUrlFactory.createSignedUrl({ path: `/annotation/${documentId}`, expire: 600, method: 'GET' });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getTemporaryDocumentPresignedUrl(
    @Args('documentId') documentId: string,
    @Args('key') key: string,
    @Args('convertType') convertType: string,
  )
    : Promise<GetPresignedUrlForTemporaryDocumentPayload> {
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
      {
        mimeType: true,
        size: true,
        name: true,
      },
    );
    if (document.size > CONVERSION_LIMIT_SIZE) {
      throw GraphErrorException.BadRequest('File size exceeded the maximum allowed feature limit.');
    }
    const prefixEnv = this.environmentService.getByKey(EnvConstants.ENV);
    const documentPresignedResult = await this.uploadService.getTemporaryDocumentPresignedUrlForConvertFile({
      mimeType: DocumentMimeType.PDF,
      key: `conversion/${prefixEnv}/${key}.${mime.extension(DocumentMimeType.PDF)}`,
      metadata: {
        'convert-type': convertType,
      },
    });
    return { document: documentPresignedResult };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.ANONYMOUS_USER_ID)
  @Query()
  async getSignedUrlForExternalPdfByEncodeData(@Args('encodeData') encodeData: string) {
    try {
      const { documentRemoteId, documentName } = this.jwtService.verify(encodeData);
      const [signedUrl, metadata] = await Promise.all([
        this.awsService.getSignedUrl({
          keyFile: documentRemoteId,
          bucketName: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
        }),
        this.awsService.getTemporaryFileMetadata(documentRemoteId),
      ]);
      const fileSize = metadata.ContentLength;
      return {
        signedUrl,
        documentName,
        remoteId: documentRemoteId,
        fileSize,
      };
    } catch (error) {
      this.loggerService.error({
        context: this.getSignedUrlForExternalPdfByEncodeData.name,
        error,
      });
    }
    return {
      signUrl: '',
      documentName: '',
      remoteId: '',
      fileSize: 0,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  getFormField(@Args('documentId') documentId: string): Promise<FormField[]> {
    return this.documentService.getFormFieldByDocumentId(documentId, { documentId: 0 });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @DocumentGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  getDocumentOutlines(@Args('input') input: GetDocumentOutlinesInput): Promise<GetDocumentOutlinesPayload[]> {
    return this.documentOutlineService.getDocumentOutlines(input);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @Mutation()
  async importDocumentOutlines(@Args('input') input: ImportDocumentOutlinesInput): Promise<BasicResponse> {
    try {
      await this.documentOutlineService.importDocumentOutlines({ data: input, isInsertMultiple: input.isInsertMultiple });
      if (input.isInsertMultiple) {
        this.messageGateway.server
          .to(SocketRoomGetter.document(input.documentId))
          .emit(SOCKET_MESSAGE.OUTLINES_UPDATED, {
            action: OutlineActionEnum.REFRESH,
          });
      }

      return {
        message: "Document's outlines have been imported successfully.",
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw GraphErrorException.BadRequest('Invalid input data');
      }

      throw error;
    }
  }

  @ResolveField('thumbnail')
  getThumbnail(
    @Parent() document: Document,
  ): Promise<string> | null {
    const { thumbnail } = document;
    if (!thumbnail) {
      return null;
    }
    const bucketName = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
    return this.awsService.getSignedUrl({ keyFile: thumbnail, bucketName });
  }

  @ResolveField('thumbnailRemoteId')
  getThumbnailRemoteId(@Parent() document: Document): string {
    return document.thumbnail;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  checkDownloadMultipleDocuments(@Args('input') input: CheckDownloadMultipleDocumentsInput): Promise<CheckDownloadMultipleDocumentsPayload> {
    return this.documentService.checkDownloadMultipleDocuments(input);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  updateStackedDocuments(@Args('input') input: UpdateStackedDocumentsInput) {
    const { documentIds } = input;
    return {
      statusCode: 200,
      message: 'Update stacked documents successfully',
      interceptRequest: {
        documentIds,
        strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        isMultipleTarget: true,
      },
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @UseGuards(DocumentPaymentGuard)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async shareDocumentInSlack(
    @Args('input') input: ShareDocumentInSlackInput,
    @Context() context,
  ): Promise<ExtendedDocumentIntercept & ShareDocumentInSlackResponse> {
    const sharer = context.req.user as User;
    const { hasNewSharing, hasUnshareableEmails, isQueuedSharing } = await this.documentService.shareDocumentInSlack(sharer, input);

    return {
      hasUnshareableEmails,
      isQueuedSharing,
      ...(hasNewSharing && {
        interceptRequest: {
          documentIds: [input.documentId],
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
      statusCode: HttpStatus.OK,
      message: 'Share document in Slack successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @UseGuards(DocumentPaymentGuard)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @Query()
  async preCheckShareDocumentInSlack(
    @Context() context,
    @Args('input') input: PreCheckShareDocumentInSlackInput,
  ): Promise<PreCheckShareDocumentInSlackResponse> {
    const sharer = context.req.user as User;
    return this.documentService.preCheckShareDocumentInSlack(sharer, input);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.OWNER,
  )
  @UseInterceptors(SanitizeInputInterceptor)
  @Query()
  async checkShareThirdPartyDocument(
    @Context() context,
    @Args('input') input: CheckShareThirdPartyDocumentInput,
  ): Promise<CheckShareThirdPartyDocumentPayload> {
    const sharer = context.req.user as User;
    const { documentId } = input;
    return this.documentService.checkShareThirdPartyDocument({ sharer, documentId });
  }
}
