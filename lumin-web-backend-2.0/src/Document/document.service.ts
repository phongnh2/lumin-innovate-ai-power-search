/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../global.d.ts" />
import { HeadObjectOutput } from '@aws-sdk/client-s3';
import {
  defaultNackErrorHandler, Nack, RabbitSubscribe, SubscribeResponse,
} from '@golevelup/nestjs-rabbitmq';
import { drive, drive_v3 as DriveV3 } from '@googleapis/drive';
import {
  Injectable, Inject, forwardRef, HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';
import { encode as encodeHtml } from 'html-entities';
import {
  capitalize, isEmpty, uniq, get, keyBy, differenceWith, cloneDeep, mergeWith, difference,
  chunk,
  intersection,
  uniqBy,
  omit,
} from 'lodash';
import * as mime from 'mime-types';
import * as moment from 'moment';
import {
  DeleteResult, UpdateResult, BulkWriteResult,
} from 'mongodb';
import {
  ClientSession,
  Model,
  Types,
  FilterQuery,
  PipelineStage,
  QueryOptions,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  SortOrder,
  ProjectionType,
  InsertManyOptions,
  Document as MongooseDocument,
  AggregateOptions,
} from 'mongoose';
import { v4 as uuid } from 'uuid';

import { DocumentFilter } from 'Common/builder/DocumentFilterBuilder';
import { PersonalPermissionFilter } from 'Common/builder/DocumentFilterBuilder/permission/personal-permission-filter';
import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { WithRequired } from 'Common/common.enum';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { SUPPORTED_MIME_TYPE, OFFICE_MIME_TYPE, MIME_TYPE } from 'Common/constants/DocumentConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import {
  NotiDocument, NotiOrg, NotiOrgTeam, NotiTeam,
} from 'Common/constants/NotificationConstants';
import { DocumentAction } from 'Common/constants/NotificationIntegrationConstant';
import { ORG_SIZE_LIMIT_FOR_NOTI, ORG_URL_SEGEMENT, ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';
import { USER_SHARING_TYPE } from 'Common/constants/SharingConstants';
import { SOCKET_EMIT_TYPE } from 'Common/constants/SocketConstants';
import {
  SUBSCRIPTION_DOCUMENT_LIST_SHARE,
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
  SUBSCRIPTION_SHOW_RATING_MODAL,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
  SUBSCRIPTION_DOCUMENT_BOOKMARK,
  SUBSCRIPTION_DOCUMENT_LIST_RECENT_DOCUMENT_ADDED,
  SUBSCRIPTION_DOCUMENT_SHARING_QUEUE,
} from 'Common/constants/SubscriptionConstants';
import { RATING_DISPLAY_CONDITIONS } from 'Common/constants/UserConstants';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { ApplicationError, ServerErrorException } from 'Common/errors/ServerErrorException';
import { NotificationContext } from 'Common/factory/IntegrationNotiFactory/notification.interface';
import {
  notiDocumentFactory, notiOrgFactory, notiTeamFactory,
} from 'Common/factory/NotiFactory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { notiFirebaseDocumentFactory, notiFirebaseOrganizationFactory, notiFirebaseTeamFactory } from 'Common/factory/NotiFirebaseFactory';
import { PersonalDocumentPremiumMap } from 'Common/template-methods/DocumentPremiumMap';
import { PremiumDocumentMap } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { PersonalDocumentQuery } from 'Common/template-methods/DocumentQuery/personal-document-query';
import { Utils } from 'Common/utils/Utils';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';
import UserRules from 'CustomRules/UserRules';

import { AsymmetricJwtService } from 'Asymmetric/asymmetric-jwt.service';
import { AuthService } from 'Auth/auth.service';
import { IUserInvitationToken, UserInvitationTokenType } from 'Auth/interfaces/auth.interface';
import { Callback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';
import { ICommunityTemplate } from 'CommunityTemplate/interfaces/communityTemplate.interface';
import { MAXIMUM_NUMBER_SIGNATURE, MAXIMUM_DELETE_DOCUMENT_S3 } from 'constant';
import {
  IDocumentSummary, IPersonalDocumentSummary, ITeamDocumentSummary,
} from 'Dashboard/interfaces/dashboard.interface';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import {
  DocumentAnnotationTypeEnum,
  XfdfPageString,
  ReorderType,
} from 'Document/document.annotation.enum';
import {
  DocumentOwnerTypeEnum,
  DocumentRoleEnum,
  DocumentStorageEnum,
  DocumentPermissionOfMemberEnum,
  DocumentWorkspace,
  ShareSettingLinkTypeEnum,
  DocumentFromSourceEnum,
  DocumentMimeType,
  DocumentIndexingStatusEnum,
  DocumentIndexingOriginEnum,
  DocumentKindEnum,
} from 'Document/document.enum';
import { DocumentServiceMobile } from 'Document/document.service.mobile';
import {
  DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION,
  DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION,
  DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION,
  DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION,
  INTERNAL_DOCUMENT_PERMISSION_ROLE,
  ORIGINAL_DOCUMENT_PERMISSION_ROLE,
  PRIORITY_ROLE,
  DEFAULT_ANNOT_ORDER,
  ANNOTATION_IMAGE_BASE_PATH,
  MAX_THUMBNAIL_SIZE,
  OCR_LIMIT_SIZE,
  MAXIMUM_RECENT_DOCUMENTS,
  MAX_DOCUMENTS_PER_DOWNLOAD,
  MAX_DOCUMENTS_SIZE_PER_DOWNLOAD,
  MAX_DOCUMENT_SIZE_FOR_INDEXING,
} from 'Document/documentConstant';
import { SendSignedUrlDto } from 'Document/dtos/lambda.document.dto';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import {
  IDocument,
  IDocumentPermission,
  IAnnotation,
  IManipulation,
  IDocumentForm,
  IDocumentSharedNonUser,
  IDocumentRequestAccess,
  CreateNonLuminSharedInput,
  IDocumentOwner,
  IShareDocumentInvitation,
  IDocumentImage,
  IDocumentBackupInfo,
  IUpdateManyDocumentRemoteEmail,
  IDocumentDriveMetadata,
  IDocumentModel,
  IDocumentPermissionModel,
  IAnnotationModel,
  IManipulationModel,
  IDocumentFormModel,
  IDocumentSharedNonUserModel,
  IDocumentRequestAccessModel,
  IDocumentImageModel,
  IDocumentBackupInfoModel,
  IDocumentDriveMetadataModel,
  IDocumentFormFieldModel,
  IDocumentFormField,
  IRecentDocumentListModel,
  IRecentDocumentList,
  IPopulatedRecentDocument,
  DocumentSharingQueueRequestPayload,
  ISharer,
  IIndexDocumentMessage,
  IIndexDocumentOperation,
  ProofingProgressMessage,
} from 'Document/interfaces/document.interface';
import {
  DocumentIndexingMessagePriority,
  UNPROCESSED_DOCUMENT_CONDITIONS,
} from 'DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { DocumentIndexingTypeEnum } from 'DocumentIndexingBacklog/enums/documentIndexingBacklog.enum';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import {
  DocumentEventNames, EventScopes, EventScopeType, EventNameType,
} from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { FileUploadProvider } from 'FormTemplates/enums';
import { FormTemplatesService } from 'FormTemplates/formTemplates.service';
import { IStrapiTemplate, ITemplateStrapiFile } from 'FormTemplates/interfaces/formTemplates.interface';
import { AnnotationData } from 'Gateway/Socket.interface';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  Document,
  DocumentInput,
  DuplicateDocumentInput,
  FindUserPayload,
  SearchUserStatus,
  TypeOfDocument,
  ManipulationDocumentInput,
  DestinationType,
  ShareLinkType,
  ShareLinkPermission,
  MoveDocumentsInput,
  RatingModalStatus,
  GetDocumentPayload,
  DeletedOriginalDocumentInfo,
  SubDocumentSettings,
  DeleteOriginalDocumentPayload,
  CreateDocumentsInput,
  BelongsTo,
  LocationType,
  DocumentRole,
  DocumentRequestAccessInput,
  UserPermission,
  NotificationTab,
  GetOrganizationDocumentsInput,
  PremiumToolsInfo,
  Payment,
  CheckThirdPartyStoragePayload,
  RestoreOriginalPermission,
  CreatePdfFromStaticToolUploadPayload,
  ExploredFeatureKeys,
  GetOrganizationResourcesInput,
  CheckDownloadMultipleDocumentsInput,
  CheckDownloadMultipleDocumentsPayload,
  GetShareInviteByEmailListPayload,
  ShareDocumentInSlackInput,
  SlackConversationType,
  PreCheckShareDocumentInSlackInput,
  PreCheckShareDocumentInSlackResponse,
  CheckShareThirdPartyDocumentPayload,
  AvailableCompressQuality,
  User as GraphqlUser,
} from 'graphql.schema';
import { integrationNotificationHandler } from 'Integration/handler';
import { IntegrationService } from 'Integration/Integration.service';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IPublishNotification } from 'Notication/interfaces/notification.interface';
import { NotificationService } from 'Notication/notification.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationCreationTypeEnum, OrganizationRoleEnums, OrganizationTeamRoles } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { OrganizationResourcesLookupUtils } from 'Organization/utils/organization.resources.utils';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { EXCHANGE_KEYS, QUEUES, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { SlackService } from 'Slack/slack.service';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { IS3FileMetadata } from 'Upload/upload.interface';
import { EXPLORED_FEATURE_MAPPING } from 'User/constants/exploredFeatureMapping';
import { UserContact } from 'User/interfaces/user.contact.interface';
import { User } from 'User/interfaces/user.interface';
import { DocViewerInteractionType } from 'User/user.enum';
import { UserService } from 'User/user.service';

import { DocumentActionPermissionPrinciple } from './ActionPermission/enums/action.permission.enum';
import { STANDARD_COMPRESS_DOCUMENT_SIZE_LIMIT_IN_MB } from './CompressDocument/compressDocument.constants';
import { DocumentSharedService } from './document.shared.service';
import { DocumentOutlineService } from './documentOutline.service';

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);
@Injectable()
export class DocumentService {
  documentTimeLimit = '';

  staticUrl: string;

  cryptoKey: string;

  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Document') private readonly documentModel: Model<IDocumentModel>,
    @InjectModel('DocumentPermission')
    private readonly documentPermissionModel: Model<IDocumentPermissionModel>,
    @Inject('DocumentAnnotation')
    private readonly documentAnnotationModel: Model<IAnnotationModel>,
    @InjectModel('DocumentManipulation')
    private readonly documentManipulationModal: Model<IManipulationModel>,
    @InjectModel('DocumentForm')
    private readonly documentFormModel: Model<IDocumentFormModel>,
    @InjectModel('DocumentSharedNonUser')
    private readonly documentSharedNonUserModel: Model<IDocumentSharedNonUserModel>,
    @InjectModel('DocumentRequestAccess')
    private readonly documentRequestAccessModel: Model<IDocumentRequestAccessModel>,
    @InjectModel('DocumentImage')
    private readonly documentImageModel: Model<IDocumentImageModel>,
    @Inject('DocumentBackupInfo')
    private readonly documentBackupInfoModel: Model<IDocumentBackupInfoModel>,
    @InjectModel('DocumentDriveMetadata')
    private readonly documentDriveMetadataModel: Model<IDocumentDriveMetadataModel>,
    @InjectModel('DocumentFormField')
    private readonly documentFormFieldModel: Model<IDocumentFormFieldModel>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly awsService: AwsService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    private readonly membershipService: MembershipService,
    private readonly redisService: RedisService,
    private readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly folderService: FolderService,
    private readonly messageGateway: EventsGateway,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => DocumentServiceMobile))
    private readonly documentServiceMobile: DocumentServiceMobile,
    private readonly personalEventService: PersonalEventService,
    private readonly loggerService: LoggerService,
    private readonly formTemplatesService: FormTemplatesService,
    @Callback(RedisConstants.REDIS_EXPIRED) private readonly callbackService: CallbackService,
    private readonly integrationService: IntegrationService,
    private readonly documentSharedService: DocumentSharedService,
    private readonly documentOutlineService: DocumentOutlineService,
    @Inject(forwardRef(() => CustomRulesService))
    private readonly customRulesService: CustomRulesService,
    @Inject(forwardRef(() => CustomRuleLoader))
    private readonly customRuleLoader: CustomRuleLoader,
    @InjectModel('RecentDocumentList')
    private readonly recentDocumentListModel: Model<IRecentDocumentListModel>,
    @Inject(forwardRef(() => SlackService))
    private readonly slackService: SlackService,
    private readonly rabbitMQService: RabbitMQService,
    @Inject(forwardRef(() => FeatureFlagService))
    private readonly featureFlagService: FeatureFlagService,
    private readonly asymmetricJwtService: AsymmetricJwtService,
    private readonly jwtService: JwtService,
  ) {
    this.documentTimeLimit = this.environmentService.getByKey(
      EnvConstants.DOCUMENT_TIME_LIMITED,
    );
    this.staticUrl = this.environmentService.getByKey(EnvConstants.STATIC_URL);
    this.setupRedisHook();
    this.cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);
  }

  permissionDocumentSharer(document) {
    if (document.shareSetting.linkType === 'ANYONE') {
      if (document.shareSetting.permission === 'SHARER') {
        return true;
      }
    }
    return false;
  }

  countTotalDocuments(
    conditions: FilterQuery<IDocument>,
    options: QueryOptions = {},
  ): Promise<number> {
    return this.documentModel.find(conditions, {}, options).countDocuments().exec();
  }

  async countTotalDocumentByIds({
    documentIds, conditions, options = {},
  }: {
    documentIds: string[], conditions: FilterQuery<IDocument>, options: QueryOptions,
  }): Promise<number> {
    const results = await Utils.executeQueryInChunk<number>(
      documentIds,
      (ids) => this.countTotalDocuments({ _id: { $in: ids }, ...conditions }, options),
    );
    return results.reduce((total, count) => total + count, 0);
  }

  async totalPermissionsOfDocument(documentId: string): Promise<number> {
    const [totalPermissionsDocForLuminUser, totalPermissionsDocForNonUser] = await Promise.all([
      this.documentPermissionModel.find({ documentId }).countDocuments(),
      this.documentSharedNonUserModel.find({ documentId }).countDocuments(),
    ]);

    return totalPermissionsDocForLuminUser + totalPermissionsDocForNonUser;
  }

  async createDocument(document: Document & { service: DocumentStorageEnum, manipulationStep?: string }): Promise<IDocument> {
    const createdDate: number = Date.now();
    const createdDocument = await this.documentModel.create({
      ...document,
      createdAt: String(createdDate),
      lastAccess: String(createdDate),
    });
    return { ...createdDocument.toObject(), _id: createdDocument._id.toHexString() };
  }

  async findDocumentsByIds(documentdIds: string[]) {
    const documents = await Utils.executeQueryInChunk<((MongooseDocument<unknown, unknown, IDocumentModel> & IDocumentModel & {
      _id: Types.ObjectId;
    }))>(documentdIds, (ids) => this.documentModel.find({ _id: { $in: ids } }).exec());
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  addAnnotationToDocument(annotation: AnnotationData, options: QueryOptions = { }) {
    const { annotationId, documentId } = annotation;
    return this.documentAnnotationModel.updateOne(
      { annotationId, documentId },
      annotation as UpdateWithAggregationPipeline | UpdateQuery<IAnnotation>,
      { upsert: true, ...options },
    ).catch((error) => {
      this.loggerService.error({
        error,
        context: 'addAnnotationToDocument',
      });
    });
  }

  async addManyAnnotations(annotations: AnnotationData[]): Promise<IAnnotation[]> {
    const insertedAnnotation = await this.documentAnnotationModel.insertMany(annotations);
    return insertedAnnotation.map((annotation) => ({ ...annotation.toObject(), _id: annotation._id.toHexString() }));
  }

  getAnnotationsOfDocumentQuery(documentId: string, projection?: ProjectionType<IAnnotation>) {
    return this.documentAnnotationModel.find({ documentId }, projection).sort({ order: 1, createdAt: 1 }).exec();
  }

  countDocumentAnnotations(documentId: string) {
    return this.documentAnnotationModel.countDocuments({ documentId }).lean();
  }

  /**
   * @description ⚠️ ATTENTION: Carefully using this function, it will return all annotations of a document
   */
  async getAnnotationsOfDocument(documentId: string, projection?: ProjectionType<IAnnotation>): Promise<IAnnotation[]> {
    const annotations = await this.documentAnnotationModel.find({ documentId }, projection).sort({ order: 1, createdAt: 1 }).exec();
    return annotations.map((annotation) => ({ ...annotation.toObject(), _id: annotation._id.toHexString() }));
  }

  async getAnnotationsByAnnotationIds(annotationIds: string[], projection?: ProjectionType<IAnnotation>): Promise<IAnnotation[]> {
    const annotations = await this.documentAnnotationModel.find({ _id: { $in: annotationIds } }, projection).exec();
    return annotations.map((annotation) => ({ ...annotation.toObject(), _id: annotation._id.toHexString() }));
  }

  deleteManyAnnotationOfDocument(conditions: FilterQuery<IAnnotation>) {
    return this.documentAnnotationModel.deleteMany(conditions).exec();
  }

  deleteAnnotationsOnPage(deletedAnnotIds) {
    const condition = {
      annotationId: { $in: deletedAnnotIds },
    };
    return this.deleteManyAnnotationOfDocument(condition);
  }

  async addManipulationToDocument(manipulation: ManipulationDocumentInput) {
    const createdManipulation = await this.documentManipulationModal.create(manipulation);
    return { ...createdManipulation.toObject(), _id: createdManipulation._id.toHexString() };
  }

  async getManipulationDocument(condition: FilterQuery<IManipulation>): Promise<IManipulation[]> {
    const manipulations = await this.documentManipulationModal.find({
      ...condition,
    }).exec();
    return manipulations.map((manipulation) => ({ ...manipulation.toObject(), _id: manipulation._id.toHexString() }));
  }

  clearAnnotationOfDocument(conditions: FilterQuery<IAnnotation>, session: ClientSession = null) {
    return this.documentAnnotationModel.deleteMany({
      ...conditions,
    }).session(session).exec();
  }

  async findDocumentByUserId(userId: string): Promise<IDocument[]> {
    const documents = await this.documentModel.find({ ownerId: userId }).exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async aggregateFolderPermission(conditions: PipelineStage[]): Promise<any> {
    return this.folderService.aggregateFolderPermission(conditions);
  }

  async findPersonalDocuments(userId: string): Promise<IDocument[]> {
    const documentPermissions = await this.getDocumentPermissionByConditions({
      refId: userId,
      role: DocumentRoleEnum.OWNER,
    });
    const documentIds = documentPermissions.map((doc) => doc.documentId);
    return this.findDocumentsByIds(documentIds);
  }

  async findOneById(id: string, projection?: ProjectionType<IDocument>): Promise<IDocument> {
    const document = await this.documentModel.findById(id, projection).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }

  async findOneDocumentPermission(condition: FilterQuery<IDocumentPermission>): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne(condition);
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  deleteManyDocumentById(ids: string[], session: ClientSession = null): Promise<any> {
    return Utils.executeQueryInChunk<DeleteResult>(
      ids,
      (documentIds) => this.documentModel.deleteMany({ _id: { $in: documentIds } }).session(session).exec(),
    );
  }

  async findDocumentsByFolderId(folderId: string, projection?: ProjectionType<IDocument>): Promise<IDocument[]> {
    const documents = await this.documentModel.find({ folderId }, projection).exec();
    return documents.map((doc) => ({ ...doc.toObject(), _id: doc._id.toHexString() }));
  }

  async findDocumentsByFolderIds(folderIds: string[], projection?: ProjectionType<IDocument>): Promise<IDocument[]> {
    const documents = await this.documentModel.find({ folderId: { $in: folderIds } }, projection).exec();
    return documents.map((doc) => ({ ...doc.toObject(), _id: doc._id.toHexString() }));
  }

  async getDocumentsInFolderPagination(params: {
    matchConditions: FilterQuery<IDocument>, minimumQuantity: number, projection?: ProjectionType<IDocument>,
  }): Promise<IDocument[]> {
    const {
      matchConditions, minimumQuantity, projection,
    } = params;
    const documents = await this.documentModel.find(matchConditions, projection).sort({ lastAccess: -1 }).limit(minimumQuantity)
      .exec();
    return documents.map((doc) => ({ ...doc.toObject(), _id: doc._id.toHexString() }));
  }

  checkFileNameIsExisted(fileName: string, documentList: Document[]): boolean {
    if (documentList) {
      return !!documentList.find((element) => element.name === fileName);
    }
    return false;
  }

  renameDocument(fileName: string): string {
    const regex = /\s\((?<fileNumber>\d+)\)$/m;
    const fileNameWithoutExtension = Utils.getFileNameWithoutExtension(
      fileName,
    );
    const extension = Utils.getExtensionFile(fileName);

    let updatedFileNameWithoutExtension = `${fileNameWithoutExtension} (1)`;
    const isMatched = regex.test(fileNameWithoutExtension);
    if (isMatched) {
      const match = regex.exec(fileNameWithoutExtension);
      const { fileNumber } = match.groups;
      const currentIndex = parseInt(fileNumber);
      updatedFileNameWithoutExtension = `${fileNameWithoutExtension.slice(0, fileNameWithoutExtension.search(regex))} (${currentIndex + 1})`;
    }
    return extension ? `${updatedFileNameWithoutExtension}.${extension}` : updatedFileNameWithoutExtension;
  }

  async getDocumentNameAfterNaming(params: {
    clientId: string,
    fileName: string,
    documentFolderType: string,
    mimetype?: string,
    folderId?: string
  }): Promise<string> {
    const {
      clientId, fileName, documentFolderType, mimetype, folderId,
    } = params;
    let documents: Document[] = [];
    const isOffice = OFFICE_MIME_TYPE.some((type) => type === mimetype);
    let newDocumentName = isOffice ? fileName : Utils.convertFileExtensionToPdf(fileName);
    switch (documentFolderType) {
      case DocumentOwnerTypeEnum.PERSONAL:
        documents = await this.findPersonalDocuments(clientId) as unknown as Document[];
        break;
      case DocumentOwnerTypeEnum.TEAM:
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM:
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        const documentPermissions = await this.getDocumentPermission(clientId);
        const documentIds = documentPermissions.map((documentPermission) => documentPermission.documentId);
        documents = await this.findDocumentsByIds(documentIds) as unknown as Document[];
      }
        break;
      default:
        break;
    }
    let filteredDocuments: Document[];
    if (folderId) {
      filteredDocuments = documents.filter((document) => document.folderId?.toHexString() === folderId);
    } else {
      filteredDocuments = documents.filter((document) => !document.folderId);
    }
    if (!filteredDocuments || filteredDocuments.length === 0) {
      return newDocumentName;
    }
    let hasDocumentNameDuplicated = true;
    do {
      const isFileNameExisted = this.checkFileNameIsExisted(
        newDocumentName,
        filteredDocuments,
      );
      if (isFileNameExisted) {
        newDocumentName = this.renameDocument(newDocumentName);
      } else {
        hasDocumentNameDuplicated = false;
      }
    } while (hasDocumentNameDuplicated);

    return newDocumentName;
  }

  async updateShareSetting(documentId, permission, linkType) {
    const updateSettings = await this.documentModel.findOneAndUpdate(
      { _id: documentId },
      {
        $set: {
          'shareSetting.permission': permission,
          'shareSetting.linkType': linkType,
        },
      },
      { new: true },
    );
    return updateSettings ? { ...updateSettings.toObject(), _id: updateSettings._id.toHexString() } : null;
  }

  async updateDocument(
    documentId: string | Types.ObjectId,
    updatedProperties: UpdateQuery<IDocument>,
    session: ClientSession = null,
  ): Promise<IDocument> {
    return this.documentSharedService.updateDocument(documentId, updatedProperties, session);
  }

  async upsertDocument(
    documentId: string,
    updatedProperties: UpdateQuery<IDocument>,
  ): Promise<IDocument> {
    const updatedDocument = await this.documentModel.findOneAndUpdate(
      { _id: documentId },
      {
        $set: {
          ...updatedProperties,
        },
      },
      { upsert: true },
    ).exec();
    return updatedDocument ? { ...updatedDocument.toObject(), _id: updatedDocument._id.toHexString() } : null;
  }

  async createDocuments(documents: DocumentInput[], options?: InsertManyOptions): Promise<IDocument[]> {
    const docs = documents.map((doc, idx) => {
      const createdDate = Date.now() + idx;
      return {
        ...doc,
        lastAccess: createdDate,
      };
    });
    const insertDocuments = await this.documentModel.insertMany(docs, options);
    return insertDocuments.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async deleteDocument(id: string | Types.ObjectId, queryOptions?: QueryOptions<Document>, session: ClientSession = null): Promise<IDocument> {
    const deletedDocument = await this.documentModel.findOneAndDelete({ _id: id }, queryOptions).session(session);
    return deletedDocument ? { ...deletedDocument.toObject(), _id: deletedDocument._id.toHexString() } : null;
  }

  async deleteRemoteThumbnail(remoteId: string) {
    if (!remoteId) return;
    if (remoteId.includes('http')) {
      const splited = remoteId.split('/');
      remoteId = `${splited[splited.length - 2]}/${splited[splited.length - 1]}`;
    }
    await this.awsService.removeThumbnail(remoteId);
  }

  async deleteManyRemoteThumbnail(remoteIds: string[]): Promise<void> {
    const keyFiles = remoteIds.map((remoteId) => {
      if (remoteId.includes('http')) {
        const splitted = remoteId.split('/');
        return `${splitted[splitted.length - 2]}/${splitted[splitted.length - 1]}`;
      }
      return remoteId;
    });
    await this.awsService.removeManyThumbnail(keyFiles);
  }

  async getDocumentPermissionsByDocId(
    documentId: string | Types.ObjectId,
    condition?: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ) {
    const documentPermissions = await this.documentPermissionModel.find(
      { documentId, ...condition },
      projection,
    ).exec();
    return documentPermissions.map((doc) => ({ ...doc.toObject(), _id: doc._id.toHexString() }));
  }

  async getDocumentPermission(refId: string, condition = {}) {
    const documentPermissions = await this.documentPermissionModel.find({ refId, ...condition }).exec();
    return documentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getPersonalTemplatePermission(documentId: string) {
    const permission = await this.documentPermissionModel.findOne({ documentId, role: 'owner' }).exec();
    if (!permission) return null;
    return { ...permission.toObject(), _id: permission._id.toHexString() };
  }

  async getOneDocumentPermission(
    refId: string,
    condition: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne(
      { refId, ...condition },
      projection,
    ).exec();
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  async getDocumentByConditions(documentId: string, conditions: FilterQuery<IDocument> = {}) {
    const document = await this.documentModel.findOne({ _id: documentId, ...conditions }).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }

  async getDocumentsByConditions(
    conditions: FilterQuery<IDocument>,
    projection?: ProjectionType<IDocument>,
    options: QueryOptions = {},
  ) {
    const documents = await this.documentModel.find(conditions, projection, options).exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async getDocumentPermissionsPagination(refId: string, conditions: FilterQuery<IDocumentPermission>) {
    const documents = await this.documentPermissionModel.find(
      { refId, ...conditions },
    ).exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async getDocumentPermissionByConditions(
    conditions: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission[]> {
    const documentPermissions = await this.documentPermissionModel.find(conditions, projection).exec();
    return documentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getDocumentPermissionInBatch(
    conditions: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission[]> {
    const batchSize = 1000;
    const totalBatchWarningThreshold = 5;

    const cursor = this.documentPermissionModel.find(conditions, projection).batchSize(batchSize).lean().cursor();
    const documentPermissions = [];

    let totalBatch = 0;
    await cursor.eachAsync((batch) => {
      documentPermissions.push(...batch.map((doc) => ({ ...doc, _id: doc._id.toHexString() })));
      totalBatch++;
      if (totalBatch >= totalBatchWarningThreshold) {
        const debugData = {
          totalBatch,
          batchSize,
          total: documentPermissions.length,
          query: {
            conditions,
            projection,
          },
        };
        const fnName = this.getDocumentPermissionInBatch.name;
        this.loggerService.warn({
          message: 'Large document permission retrieved',
          context: fnName,
          extraInfo: debugData,
        });
        // In case we lost the log
        this.redisService.setKeyIfNotExist(
          'debug:document-permission-batch',
          JSON.stringify(debugData),
          String(60 * 60 * 24 * 1000), // 1 day in milliseconds
        );
      }
    }, { batchSize });

    return documentPermissions;
  }

  async getDocumentInPermissionPagination(
    permissionArray,
    conditions,
    limit: number,
  ) {
    const conditionsArray = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(conditions).forEach((key) => {
      conditionsArray.push({
        [key]: conditions[key],
      });
    });
    const conditionsQuery = conditionsArray.length
      ? { $and: [{ _id: { $in: permissionArray } }, ...conditionsArray] } : { _id: { $in: permissionArray } };
    const documents = await this.documentModel
      .find(
        conditionsQuery,
        { annotations: 0 },
      )
      .sort({ lastAccess: -1, _id: -1 })
      .limit(limit)
      .exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  createDocumentPermissionsUpsert(documentPermissions) {
    const result = documentPermissions.map((permission) => ({
      updateOne: {
        filter: { refId: permission.refId, documentId: permission.documentId },
        update: permission,
        upsert: true,
        new: true,
        setDefaultsOnInsert: false,
      },
    }));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.documentPermissionModel.bulkWrite(result);
  }

  async updateDocumentPermissionNonLuminUser(query: FilterQuery<IDocumentSharedNonUser>, role) {
    return this.documentSharedNonUserModel.updateOne(
      query,
      { $set: { role } },
      { upsert: true },
    ).catch((err) => {
      this.loggerService.error({
        error: err,
        context: 'updateDocumentPermissionNonLuminUser',
      });
    });
  }

  async getNonLuminDocumentPermissions(
    conditions: FilterQuery<IDocumentSharedNonUser>,
    projections?: ProjectionType<IDocumentSharedNonUser>,
  ): Promise<IDocumentSharedNonUser[]> {
    const nonluminDocumentPermissions = await this.documentSharedNonUserModel.find(conditions, projections).exec();
    return nonluminDocumentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getTeamOwnerDocumentPermission(
    documentId: string,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne({
      documentId,
      role: {
        $in: [DocumentRoleEnum.ORGANIZATION_TEAM],
      },
    }, projection).exec();
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  async getOrganizationOwnerDocumentPermission(
    conditions: FilterQuery<IDocumentPermission>,
    projection?: ProjectionType<IDocumentPermission>,
  ): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne(conditions, projection).exec();
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  async getOwnerDocumentPermission(
    documentId: string,
  ): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne({ documentId, role: 'owner' }).exec();
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  async getDocumentPermissionByGroupRole(documentId: string, roles: string[]): Promise<IDocumentPermission> {
    const documentPermission = await this.documentPermissionModel.findOne({ documentId, role: { $in: roles } }).exec();
    return documentPermission ? { ...documentPermission.toObject(), _id: documentPermission._id.toHexString() } : null;
  }

  async getAllDocumentPermissionByGroupRole(documentIds: string[], roles: string[]): Promise<IDocumentPermission[]> {
    const documentPermissions = await this.documentPermissionModel.find({ documentId: { $in: documentIds }, role: { $in: roles } }).exec();
    return documentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async createDocumentPermissions(
    documentPermissions: any[],
    options?: InsertManyOptions,
  ): Promise<IDocumentPermission[]> {
    const createdDocumentPermissions = await this.documentPermissionModel.insertMany(documentPermissions, options);
    return createdDocumentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async createDocumentPermission(documentPermission: Partial<IDocumentPermission>): Promise<IDocumentPermission> {
    const createDocument = await this.documentPermissionModel.create(documentPermission);
    return createDocument ? { ...createDocument.toObject(), _id: createDocument._id.toHexString() } : null;
  }

  formatBookmarkForDocument(document: Document): string {
    const { bookmarks } = document;

    if (!bookmarks) {
      return bookmarks;
    }

    const _bookmarks = JSON.parse(bookmarks);

    const formattedBookmarks = _bookmarks.map(({ bookmark, page }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const bookmarkEntries = Object.entries(bookmark);
      const _bookmark = bookmarkEntries.map(([email, message]) => ({ email, message }));
      return { bookmark: _bookmark, page };
    });

    const _formattedBookmarks = JSON.stringify(formattedBookmarks);
    return _formattedBookmarks;
  }

  async getDocumentByDocumentId(documentId: string, projection?: ProjectionType<IDocument>): Promise<IDocument> {
    return this.documentSharedService.getDocumentByDocumentId(documentId, projection);
  }

  async getDocumentByRemoteId(
    documentRemoteId: string,
    clientId: string,
  ): Promise<IDocument> {
    const document = await this.documentModel.findOne({
      remoteId: documentRemoteId,
      ownerId: clientId,
    }).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }

  async getDocumentsByRemoteId(
    documentRemoteId: string,
    clientIds: string[],
  ): Promise<IDocument[]> {
    const documents = await this.documentModel.find({
      remoteId: documentRemoteId,
      ownerId: { $in: clientIds },
    }).exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  isRestrictedFromRemovingSharer(document: IDocument, foundUser: User, userPermission: IDocumentPermission, user: User): boolean {
    const isRemovingPermissionOfOwner = document.ownerId.toString() === foundUser._id;
    const isCurrentUserDocOwner = user._id === document.ownerId.toString();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const isRemovingPermissionOfSharer = userPermission.role === DocumentRoleEnum.SHARER;
    return isRemovingPermissionOfOwner || (isRemovingPermissionOfSharer && !isCurrentUserDocOwner && document.isPersonal);
  }

  async deleteDocumentPermission(conditions: FilterQuery<IDocumentPermission>): Promise<IDocumentPermission> {
    const removedDocPermission = await this.documentPermissionModel.findOneAndRemove({ ...conditions }).exec();
    if (removedDocPermission && !ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(removedDocPermission.role as DocumentRoleEnum)) {
      await this.removeRequestAccessDocument([removedDocPermission.refId], removedDocPermission.documentId);
    }
    return removedDocPermission ? { ...removedDocPermission.toObject(), _id: removedDocPermission._id.toHexString() } : null;
  }

  deleteDocumentPermissions(conditions: FilterQuery<IDocumentPermission>, session: ClientSession = null) {
    return this.documentPermissionModel.deleteMany({
      ...conditions,
    }).session(session).exec();
  }

  async findDocumentForms(conditions: FilterQuery<IDocumentForm> = {}): Promise<IDocumentForm[]> {
    const documentForms = await this.documentFormModel.find(conditions).exec();
    return documentForms.map((documentForm) => ({ ...documentForm.toObject(), _id: documentForm._id.toHexString() }));
  }

  async findDocumentFormById(id: string, projection?: ProjectionType<IDocumentForm>): Promise<IDocumentForm> {
    const document = await this.documentFormModel.findById(id, projection).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }

  findFormFromStrapi(id: string, formStrapiParams?: Record<string, string>): Promise<IStrapiTemplate> {
    return this.formTemplatesService.getFormById(id, formStrapiParams);
  }

  async findDocumentFormByDomain(domain: string, projection?: ProjectionType<IDocumentForm>): Promise<IDocumentForm[]> {
    const domainUpperCase = domain.split('.')[0].toUpperCase();
    const formIds = this.environmentService.getByKey(`${EnvConstants.ORGANIZATION_FORMS}_${domainUpperCase}`).split(',');
    const forms = await this.documentFormModel.find({ _id: { $in: formIds } }, projection).exec();
    return forms.map((form) => ({ ...form.toObject(), _id: form._id.toHexString() }));
  }

  async updateRateDocumentForm(id: string, updateObj): Promise<IDocumentForm> {
    const updatedForm = await this.documentFormModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updateObj,
        },
        $inc: {
          rateCount: 1,
        },
      },
      { new: true },
    ).exec();
    return updatedForm ? { ...updatedForm.toObject(), _id: updatedForm._id.toHexString() } : null;
  }

  async updateDocumentPermission(
    condition: FilterQuery<IDocumentPermission>,
    updateProperties: FilterQuery<IDocumentPermission>,
    options?: QueryOptions,
  ): Promise<IDocumentPermission> {
    return this.documentPermissionModel.findOneAndUpdate(
      condition,
      updateProperties,
      options,
    );
  }

  getDocumentFormByConditionAndPagination(condition: FilterQuery<IDocumentForm>, skip: number, limit: number) {
    return this.documentFormModel
      .find({ ...condition })
      .skip(skip)
      .limit(limit);
  }

  async aggregateDocumentPermission(conditions: PipelineStage[]): Promise<any[]> {
    return this.documentPermissionModel.aggregate(conditions);
  }

  async updateDocumentPermissionInOrg(
    conditions: FilterQuery<IDocumentPermission>,
    updateFields: UpdateQuery<IDocumentPermission>,
  ): Promise<IDocumentPermission> {
    return this.documentPermissionModel.findOneAndUpdate(
      { role: { $in: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] }, ...conditions },
      { $set: updateFields },
      { new: true },
    );
  }

  async updateAllDocumentPermissionInOrg(orgId: string, updateFields: UpdateQuery<IDocumentPermission>): Promise<UpdateResult> {
    return this.documentPermissionModel.updateMany(
      { role: 'organization', refId: orgId },
      { ...updateFields },
    );
  }

  async updateManyDocumentPermission(
    conditions: FilterQuery<IDocumentPermission>,
    updateFields: UpdateQuery<IDocumentPermission>,
  ): Promise<UpdateResult> {
    return this.documentPermissionModel.updateMany(conditions, updateFields);
  }

  async getDocumentDriveMetadata(documentId: string, remoteId: string) {
    const documentDriveMetadata = await this.documentDriveMetadataModel.findOne({ documentId, remoteId }).exec();
    return documentDriveMetadata ? { ...documentDriveMetadata.toObject(), _id: documentDriveMetadata._id.toHexString() } : null;
  }

  async getDocumentDrivesMetadata(filter: FilterQuery<IDocumentDriveMetadata>): Promise<IDocumentDriveMetadata[]> {
    const documentDriveMetadatas = await this.documentDriveMetadataModel.find(filter).exec();
    return documentDriveMetadatas.map((metadata) => ({ ...metadata.toObject(), _id: metadata._id.toHexString() }));
  }

  async deleteManyDocumentDriveMetadata(filter: FilterQuery<IDocumentDriveMetadata>, session: ClientSession = null): Promise<any> {
    return this.documentDriveMetadataModel.deleteMany(filter).session(session).exec();
  }

  async updateDocumentDriveMetadata(
    filter: FilterQuery<IDocumentDriveMetadata>,
    update: UpdateQuery<IDocumentDriveMetadata>,
    options: QueryOptions = {},
  ): Promise<IDocumentDriveMetadata> {
    const documentDriveMetadata = await this.documentDriveMetadataModel.findOneAndUpdate(filter, update, options).exec();
    return documentDriveMetadata ? { ...documentDriveMetadata.toObject(), _id: documentDriveMetadata._id.toHexString() } : null;
  }

  async bulkUpdateManyDocumentRemoteEmail(updateManyDocumentRemoteEmail: IUpdateManyDocumentRemoteEmail): Promise<BulkWriteResult> {
    const { conditions: { remoteEmails, ownerIds }, updatedObj: { newRemoteEmails } } = updateManyDocumentRemoteEmail;
    const bulOps = remoteEmails.map((email, idx) => ({
      updateMany: {
        filter: { remoteEmail: email, ownerId: ownerIds[idx] },
        update: { remoteEmail: newRemoteEmails[idx] },
      },
    }));
    return this.documentModel.bulkWrite(bulOps);
  }

  async getAllOwnedDocumentPermissionsOfUsers(userIds: string[]): Promise<IDocumentPermission[]> {
    const documentPermissions = await this.documentPermissionModel.find({ refId: { $in: userIds }, role: DocumentRoleEnum.OWNER }).exec();
    return documentPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  getRoleText(role: DocumentRoleEnum): string {
    const roleText = {
      [DocumentRoleEnum.SPECTATOR]: 'View',
      [DocumentRoleEnum.VIEWER]: 'Comment',
      [DocumentRoleEnum.EDITOR]: 'Edit',
      [DocumentRoleEnum.SHARER]: 'Share',
    };
    return roleText[role] || 'View';
  }

  async removePermissionInGroupPermissions(userId: string, orgId: string): Promise<any> {
    const unsetPath = `groupPermissions.${userId}`;
    const unsetObject: {[key: string]: any} = {};
    unsetObject[unsetPath] = 1;
    return this.updateManyDocumentPermission(
      { refId: orgId },
      { $unset: unsetObject },
    );
  }

  getTotalItemsOfCollectionByCondition(condition: FilterQuery<IDocumentForm>) {
    if (Object.keys(condition).length) {
      return this.documentFormModel.countDocuments({ ...condition });
    }
    return this.documentFormModel.estimatedDocumentCount();
  }

  async createDocumentForm(documentForm): Promise<IDocumentForm> {
    const createdForm = await this.documentFormModel.create(documentForm);
    return { ...createdForm.toObject(), _id: createdForm._id.toHexString() };
  }

  async deleteRemoteDocument(document: IDocument) {
    switch (document.service) {
      case DocumentStorageEnum.S3: {
        await this.awsService.removeDocument(document.remoteId);
        break;
      }
      case DocumentStorageEnum.GOOGLE: {
        if (document.temporaryRemoteId) {
          await this.awsService.removeDocument(document.temporaryRemoteId);
        }
        break;
      }
      default:
        break;
    }
  }

  async deleteManyRemoteDocument(documents: Document[]) {
    const documentRemoteIds: string[] = [];
    documents.forEach((document) => {
      if (document.service !== DocumentStorageEnum.S3) return;
      documentRemoteIds.push(document.remoteId);
    });
    await this.awsService.removeManyDocument(documentRemoteIds);
  }

  verifyUploadFile(file) {
    return SUPPORTED_MIME_TYPE.some((type) => type === file.mimetype);
  }

  verifyUploadFiles(files) {
    return files.every((file) => this.verifyUploadFile(file));
  }

  verifyUploadThumbnailSize({ size }: { size: number }): boolean {
    return size <= MAX_THUMBNAIL_SIZE;
  }

  verifyUploadThumbnailsSize(files: (FileData & { size: number })[]): boolean {
    return files.every((file) => this.verifyUploadThumbnailSize(file));
  }

  getPagesNeedUpdateAnnot(data) {
    const { type, option } = data;
    const mapObj = {};
    switch (type) {
      case 'INSERT_BLANK_PAGE': {
        const { totalPages } = data;
        const numberOfPagesInsert = (option.insertPages as number[]).length;
        const pageIndex = option.insertPages[0] - 1;
        for (let i = 0; i < totalPages; i++) {
          if (i >= pageIndex) {
            const key = `page="${i}"`;
            const value = `page="${i + numberOfPagesInsert}"`;
            mapObj[key] = value;
          }
        }
        break;
      }
      case 'MOVE_PAGE': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const from = parseInt(option.pagesToMove) - 1;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const to = parseInt(option.insertBeforePage) - 1;
        let key;
        let value;
        if (from < to) {
          for (let i = from; i <= to; i++) {
            if (i === from) {
              key = `page="${from}"`;
              value = `page="${to}"`;
              mapObj[key] = value;
            } else {
              key = `page="${i}"`;
              value = `page="${i - 1}"`;
              mapObj[key] = value;
            }
          }
        } else {
          for (let i = to; i <= from; i++) {
            if (i === from) {
              key = `page="${from}"`;
              value = `page="${to}"`;
              mapObj[key] = value;
            } else {
              key = `page="${i}"`;
              value = `page="${i + 1}"`;
              mapObj[key] = value;
            }
          }
        }
        break;
      }
      case 'REMOVE_PAGE': {
        const { totalPages } = data;
        const { pagesRemove } = option;
        const annotationPagesRemove = pagesRemove.map((page) => page - 1);
        annotationPagesRemove.sort();
        const numberOfPageRemove = pagesRemove.length as number;
        const firstPageIndex = annotationPagesRemove[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        for (let i = firstPageIndex; i <= parseInt(totalPages) + numberOfPageRemove; i++) {
          if (!annotationPagesRemove.includes(i)) {
            const numberToDecrease = annotationPagesRemove.filter((page) => i >= page).length;
            const key = `page="${i}"`;
            const value = `page="${i - numberToDecrease}"`;
            mapObj[key] = value;
          }
        }
        break;
      }
      case 'MERGE_PAGE': {
        const { numberOfPageToMerge, positionToMerge, totalPagesBeforeMerge } = option;
        for (let i: number = positionToMerge; i <= totalPagesBeforeMerge; i++) {
          const key = `page="${i - 1}"`;
          const value = `page="${i + Number(numberOfPageToMerge) - 1}"`;
          mapObj[key] = value;
        }
        break;
      }
      default:
    }

    return mapObj;
  }

  getPagesNeedUpdate(data, template) {
    const { type, option } = data;
    const mapObj = {};
    switch (type) {
      case 'INSERT_BLANK_PAGE': {
        const { totalPages } = data;
        const pageIndex = option.insertPages[0];
        const numberOfPagesInsert = (option.insertPages as number[]).length;
        for (let i = 1; i <= totalPages; i++) {
          if (i >= pageIndex) {
            const key = `${template}"${i}"`;
            const value = `${template}"${i + numberOfPagesInsert}"`;
            mapObj[key] = value;
          }
        }
        break;
      }
      case 'MOVE_PAGE': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const from = parseInt(option.pagesToMove);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const to = parseInt(option.insertBeforePage);
        let key;
        let value;
        if (from < to) {
          for (let i = from; i <= to; i++) {
            if (i === from) {
              key = `${template}"${from}"`;
              value = `${template}"${to}"`;
              mapObj[key] = value;
            } else {
              key = `${template}"${i}"`;
              value = `${template}"${i - 1}"`;
              mapObj[key] = value;
            }
          }
          break;
        } else {
          for (let i = to; i <= from; i++) {
            if (i === from) {
              key = `${template}"${from}"`;
              value = `${template}"${to}"`;
              mapObj[key] = value;
            } else {
              key = `${template}"${i}"`;
              value = `${template}"${i + 1}"`;
              mapObj[key] = value;
            }
          }
          break;
        }
      }
      case 'REMOVE_PAGE': {
        const { totalPages } = data;
        const { pagesRemove } = option;
        pagesRemove.sort();
        const firstPageIndex = option.pagesRemove[0];
        for (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          let i = parseInt(firstPageIndex) + 1;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          i <= parseInt(totalPages) + 1;
          i++
        ) {
          if (!pagesRemove.includes(i)) {
            const numberToDecrease = pagesRemove.filter((value) => i >= value).length;
            const key = `${template}"${i}"`;
            const value = `${template}"${i - numberToDecrease}"`;
            mapObj[key] = value;
          }
        }
        if (template === XfdfPageString.HYPERLINK) {
          pagesRemove.forEach((page: number) => {
            mapObj[`${template}"${page}"`] = `${template}"0"`;
          });
        }
        break;
      }
      case 'MERGE_PAGE': {
        const { numberOfPageToMerge, positionToMerge, totalPagesBeforeMerge } = option;
        for (let i: number = positionToMerge; i <= totalPagesBeforeMerge; i++) {
          const key = `${template}"${i}"`;
          const value = `${template}"${i + Number(numberOfPageToMerge)}"`;
          mapObj[key] = value;
        }
        break;
      }
      default:
    }

    return mapObj;
  }

  eraseBookmark(option, bookmarks) {
    const page = option.pagesRemove[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updatedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
    let indexOfBookmark = 0;
    const pageBookmark = updatedBookmarks.find((bookmark, index) => {
      if (bookmark.page === page) {
        indexOfBookmark = index;
        return true;
      }
      return false;
    });
    if (pageBookmark) {
      updatedBookmarks.splice(indexOfBookmark, 1);
    }

    return JSON.stringify(updatedBookmarks);
  }

  cloneDocument(document, modifyObj) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const cloneDocument = JSON.parse(document);
    const newDocument = {
      ...cloneDocument,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      lastAccess: new Date(cloneDocument.lastAccess).getTime(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      createdAt: new Date(cloneDocument.createdAt).getTime(),
      ownerName: modifyObj.ownerName || '',
      ownerAvatarRemoteId: modifyObj.ownerAvatarRemoteId || '',
      roleOfDocument: modifyObj.roleOfDocument,
      remoteEmail: cloneDocument.remoteEmail,
      folderId: cloneDocument.folderId || modifyObj.folderId || null,
    };

    return newDocument;
  }

  publishUpdateDocument(receiverIds, payload, publishType) {
    receiverIds.forEach((receiverId) => {
      let channelName = `${publishType}.${receiverId}`;
      if (publishType === SUBSCRIPTION_DOCUMENT_BOOKMARK) {
        channelName = `${publishType}.${receiverId}.${payload.documentId}`;
      }
      this.pubSub.publish(channelName, {
        [publishType]: {
          statusCode: 200,
          clientId: receiverId,
          teamId: '',
          organizationId: '',
          ownerId: payload.document?.ownerId || '',
          ...payload,
        },
      });
    });
  }

  publishDeleteOriginalDocument(receiverIds: string[], payload: Record<string, any>, publishType: string): void {
    const receivers: string[] = [...(new Set(receiverIds))];
    receivers.forEach((receiverId) => {
      this.pubSub.publish(`${publishType}.${receiverId}`, {
        [publishType]: {
          statusCode: 200,
          clientId: receiverId,
          ...payload,
        },
      });
    });
  }

  publishDocumentSharingQueue(receiverIds: string[], payload: Record<string, any>): void {
    const receivers: string[] = [...(new Set(receiverIds))];
    receivers.forEach((receiverId) => {
      this.pubSub.publish(`${SUBSCRIPTION_DOCUMENT_SHARING_QUEUE}.${receiverId}`, {
        [SUBSCRIPTION_DOCUMENT_SHARING_QUEUE]: {
          statusCode: 200,
          clientId: receiverId,
          ...payload,
        },
      });
    });
  }

  isOverTimeLimit(createdAt: string): boolean {
    const limitTime = this.documentTimeLimit.split(' ');
    const now = moment();
    const createdAtMoment = moment(createdAt);
    return (
      now.diff(createdAtMoment, limitTime[1] as moment.unitOfTime.Base)
      >= Number(limitTime[0])
    );
  }

  getRoleTextEmail(role: DocumentRoleEnum): string {
    const roleText = {
      [DocumentRoleEnum.SPECTATOR]: 'Viewer',
      [DocumentRoleEnum.VIEWER]: 'Commenter',
      [DocumentRoleEnum.EDITOR]: 'Editor',
      [DocumentRoleEnum.SHARER]: 'Sharer',
    };
    return roleText[role] || 'Viewer';
  }

  async hasDocumentBeenLimited(document: Document): Promise<boolean> {
    if ((document.kind as DocumentKindEnum) === DocumentKindEnum.TEMPLATE) {
      return false;
    }
    if (!this.isOverTimeLimit(document.createdAt)) {
      return false;
    }
    if (document.shareSetting.linkType === ShareLinkType.ANYONE) {
      return false;
    }

    /* team/org document */
    const docPermission = await this.getDocumentPermissionByGroupRole(
      document._id,
      [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
    );
    return this.getPremiumDocumentMapping(docPermission);
  }

  async createNonLuminShared({
    documentId,
    emails,
    role,
    sharerId,
    message,
  }: CreateNonLuminSharedInput): Promise<IDocumentSharedNonUser[]> {
    const list = await Promise.all(
      emails.map(async (email) => {
        const updatePermission = await this.documentSharedNonUserModel.findOneAndUpdate(
          {
            documentId,
            email,
          },
          {
            documentId,
            email,
            role,
            message,
            sharerId,
            type: 'external',
          },
          { upsert: true, new: true },
        );
        return updatePermission ? { ...updatePermission.toObject(), _id: updatePermission._id.toHexString() } : null;
      }),
    );
    return list.filter(Boolean);
  }

  async getSharedNonUserInvitationsBySharer(
    email: string,
  ): Promise<IDocumentSharedNonUser[]> {
    const sharedNonUserDocuments = await this.documentSharedNonUserModel.find({ email }).exec();
    return sharedNonUserDocuments.map(
      (sharedNonUserDocument) => ({ ...sharedNonUserDocument.toObject(), _id: sharedNonUserDocument._id.toHexString() }),
    );
  }

  async findNonUserByDocumentId(documentId, searchKeyRegex) {
    const conditions = {
      documentId,
    };
    if (searchKeyRegex) {
      Object.assign(conditions, {
        $or: [
          { email: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      });
    }
    const nonUserDocuments = await this.documentSharedNonUserModel.find(conditions).exec();
    return nonUserDocuments.map((nonUserDocument) => ({ ...nonUserDocument.toObject(), _id: nonUserDocument._id.toHexString() }));
  }

  deleteDocumentNonLuminUser(conditions: FilterQuery<IDocumentSharedNonUser>, session: ClientSession = null): Promise<DeleteResult> {
    return this.documentSharedNonUserModel.deleteMany({ ...conditions }).session(session).exec();
  }

  async findNonUserByDocIdAndEmail(documentId: string, email: string): Promise<IDocumentSharedNonUser> {
    const documentSharedNonUser = await this.documentSharedNonUserModel.findOne({ documentId, email: email.toLowerCase() }).exec();
    return documentSharedNonUser ? { ...documentSharedNonUser.toObject(), _id: documentSharedNonUser._id.toHexString() } : null;
  }

  async createNonLuminUserDocumentPermission({
    user,
    orgIds,
    teamIds,
  } : {
    user: User,
    orgIds: string[],
    teamIds: string[],
  }): Promise<IDocumentPermission[]> {
    // TODO: Handle case when sharedNonUserDocuments variable returns null
    const sharedNonUserDocuments = await this.getSharedNonUserInvitationsBySharer(
      user.email,
    );
    const personalDocumentPermissions = [];
    await Promise.all(
      sharedNonUserDocuments.map(async (sharedInfo) => {
        const [existSharedDocument, documentPermissionOrg] = await Promise.all([
          this.getDocumentByDocumentId(sharedInfo.documentId),
          this.getDocumentPermissionByConditions({ refId: { $in: orgIds }, documentId: sharedInfo.documentId }),
        ]);
        if (existSharedDocument && !teamIds.includes(sharedInfo.teamId?.toString()) && !documentPermissionOrg.length) {
          personalDocumentPermissions.push({
            documentId: sharedInfo.documentId,
            role: sharedInfo.role.toLowerCase(),
            refId: user._id,
          });
        }
      }),
    );
    await this.deleteDocumentNonLuminUser({ email: user.email });
    return this.createDocumentPermissions(personalDocumentPermissions);
  }

  async shareDocumentToLuminUser({
    userInvitations,
    role,
    sharer,
    message,
    document,
  }: {
    userInvitations: IShareDocumentInvitation[]
    role: DocumentRole,
    sharer: User,
    message: string,
    document: Document
  }): Promise<void> {
    userInvitations = userInvitations.filter((userInvitation) => {
      const isUpdateSamePermission = userInvitation.hasPermission && userInvitation.role.toUpperCase() === role;
      return !isUpdateSamePermission;
    });
    const documentId = document._id;
    const verifiedUsers: (IShareDocumentInvitation & { userStatus: SearchUserStatus })[] = await Promise.all(
      userInvitations.map(async (userInvitation) => {
        const userInfo = await this.verifyUserToUpdateDocumentPermission({
          actorId: sharer._id, sharedEmail: userInvitation.email, documentId,
        });
        return {
          ...userInvitation,
          userStatus: userInfo.status,
        };
      }),
    );
    const {
      groupPermissions,
      personalPermissions,
      newPermissions,
      existedPermissions,
    } = this.seperateShareInvitations({ userInvitations: verifiedUsers, documentId, role });

    if (!isEmpty(groupPermissions)) {
      await this.updateManyDocumentPermission(
        { documentId: document._id, role: { $in: INTERNAL_DOCUMENT_PERMISSION_ROLE } },
        [{ $addFields: { groupPermissions } }],
      );
    }
    await this.createDocumentPermissionsUpsert(personalPermissions);

    const newPermissionUserIds = newPermissions.map(({ _id }) => _id);
    const newPermissionEmails = newPermissions.map(({ email }) => email);
    const existedPermissionUserIds = existedPermissions.map(({ _id }) => _id);

    // We not remove request access of existedPermissions(internal members).
    const userIdSet = new Set([
      ...Object.keys(groupPermissions),
      ...newPermissionUserIds,
      ...personalPermissions.map(({ refId }) => refId),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userIds = [...userIdSet].map((userId) => new Types.ObjectId(userId));

    const requests = await this.getRequestAccessDocument({
      documentId,
      requesterId: {
        $in: userIds,
      },
    });

    await this.removeRequestsAfterPermissionChanged({
      documentId,
      users: requests.map((request) => ({ _id: request.requesterId, requestRole: request.documentRole })),
      newRole: role.toLowerCase() as DocumentRoleEnum,
    });
    const [verifiedUserList, unverifiedUsers] = await Promise.all([
      this.userService.findVerifiedUsersByEmail(newPermissionEmails),
      this.userService.findUsers({ email: { $in: newPermissionEmails }, isVerified: false }),
    ]);
    const verifiedUserEmails = verifiedUserList.map(({ email }) => email);
    const unverifiedUserEmails = unverifiedUsers.map(({ email }) => email);
    // We will send 2 url in 2 type of user, with user has been verified, we will return document url.
    // With user has not been verified, we will token url.
    this.sendShareDocumentEmail({
      sharer, document, message, receiveEmails: verifiedUserEmails, isVerified: true,
    });
    this.sendShareDocumentEmail({
      sharer, document, message, receiveEmails: unverifiedUserEmails, isVerified: false,
    });

    this.sendShareDocumentNotification({ sharer, document, receiveIdsList: newPermissionUserIds });
    if (newPermissionUserIds.length > 0) {
      this.publishShareDocument({
        sharer, document, receiveIds: newPermissionUserIds, role,
      });
    }

    if (existedPermissionUserIds.length) {
      this.sendUpdateDocumentPermissionNotification({
        actor: sharer, document, sharedIds: existedPermissionUserIds, role,
      });
      existedPermissionUserIds.forEach((userId) => {
        this.messageGateway.server.to(
          `document-room-${document._id}`,
        ).emit(`updatePermission-${document._id}`, { userId, role });
      });
    }

    Promise.all(newPermissionUserIds.map(async (receivedId) => {
      const [receivedUser, documentScope] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.userService.findUserById(receivedId),
        this.getDocumentScope(documentId),
      ]);
      this.eventService.createEvent({
        eventName: DocumentEventNames.DOCUMENT_SHARED,
        actor: sharer,
        eventScope: documentScope,
        document,
        target: receivedUser,
      });
    }));
  }

  seperateShareInvitations(params: {
    userInvitations: (IShareDocumentInvitation & { userStatus: SearchUserStatus })[],
    documentId: string,
    role: DocumentRole
  }): {
    personalPermissions: IDocumentPermission[],
    groupPermissions: Record<string, DocumentRoleEnum>,
    newPermissions: IShareDocumentInvitation[],
    existedPermissions: IShareDocumentInvitation[]
  } {
    const { userInvitations, documentId, role } = params;
    const personalPermissions = [];
    const groupPermissions = {};
    const newPermissions = [];
    const existedPermissions = [];

    userInvitations.forEach((userInfo) => {
      if (userInfo.userStatus === SearchUserStatus.USER_UNALLOWED) {
        return;
      }
      if (userInfo.permissionType === DocumentOwnerTypeEnum.PERSONAL) {
        personalPermissions.push({
          documentId,
          refId: userInfo._id,
          role: role.toLowerCase(),
        });
      } else {
        groupPermissions[userInfo._id] = role.toLowerCase();
      }
      if (userInfo.hasPermission) {
        existedPermissions.push(userInfo);
      } else {
        newPermissions.push(userInfo);
      }
    });
    return {
      personalPermissions,
      groupPermissions,
      newPermissions,
      existedPermissions,
    };
  }

  sendShareDocumentEmail(params: { sharer: User, document: Document, message: string, receiveEmails: string[], isVerified: boolean }): void {
    const {
      sharer, document, message, receiveEmails, isVerified,
    } = params;
    const currentDate = new Date();
    const convertDate = moment(currentDate.toISOString()).utcOffset(
      sharer.timezoneOffset - currentDate.getTimezoneOffset(),
      true,
    );
    const subject = SUBJECT[EMAIL_TYPE.SHARE_DOCUMENT.description]
      .replace('#{userName}', sharer.name)
      .replace('#{documentName}', document.name);
    const documentId = document._id;
    const convertedDate = convertDate.utc().format('LLLL');
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    const desktopPath = `/viewer/${documentId}?referer=email`;
    const documentDeeplink = this.emailService.generateDeeplinkForEmail('/email-document-share', desktopPath);

    if (!isVerified) {
      const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
      receiveEmails.forEach((email) => {
        const tokenPayload: IUserInvitationToken = {
          metadata: {
            documentId,
          },
          email,
          type: UserInvitationTokenType.SHARE_DOCUMENT,
        };
        const shareToken = this.jwtService.sign(tokenPayload, {
          expiresIn: Number(this.environmentService.getByKey(EnvConstants.SHARE_DOCUMENT_INVITATION_TOKEN_EXPIRE_IN)),
        });
        this.emailService.sendEmail(
          EMAIL_TYPE.SHARE_DOCUMENT,
          [email],
          {
            subject,
            sharerName: sharer.name,
            sharerEmail: sharer.email,
            sharerAvatar: sharer.avatarRemoteId,
            documentName: document.name,
            documentId,
            time: convertedDate,
            message,
            documentUrl: `${authUrl}/sign-up/invitation?token=${shareToken}&action=share`,
            documentDeeplink,
          },
        );
      });
      return;
    }
    this.emailService.sendEmailHOF(EMAIL_TYPE.SHARE_DOCUMENT, receiveEmails, {
      subject,
      sharerName: sharer.name,
      sharerEmail: sharer.email,
      sharerAvatar: sharer.avatarRemoteId,
      documentName: document.name,
      documentId,
      time: convertedDate,
      message,
      documentUrl: `${baseUrl}/viewer/${documentId}?referer=email`,
      documentDeeplink,
    });
  }

  sendShareDocumentNotification(params: {sharer: User, document: Document, receiveIdsList: string[]}): void {
    const { sharer, document, receiveIdsList } = params;
    const notification = {
      actor: {
        actorId: sharer._id,
        type: 'user',
        actorName: sharer.name,
        avatarRemoteId: sharer.avatarRemoteId,
      },
      actionType: NotiDocument.SHARE,
      notificationType: 'DocumentNotification',
      entity: {
        entityId: document._id,
        entityName: document.name,
        type: 'document',
      },
    };
    const integrationNotification = integrationNotificationHandler({
      context: NotificationContext.Document,
      type: DocumentAction.SHARED_DOCUMENT_TO_YOU,
      data: {
        sendTo: receiveIdsList,
        actor: {
          id: sharer._id,
        },
        data: {
          documentId: document._id,
        },
        target: {
          actorName: sharer.name,
          documentName: document.name,
        },
      },
    });
    if (receiveIdsList.length) {
      this.notificationService.createUsersNotifications(
        notification,
        receiveIdsList,
      );
      this.integrationService.sendNotificationToIntegration(integrationNotification);
    }
  }

  publishShareDocument(params: {document: Document, sharer: User, receiveIds: string[], role: string }): void {
    const {
      document, sharer, receiveIds, role,
    } = params;
    const documentShared = this.cloneDocument(JSON.stringify(document), {
      ownerName: sharer.name,
      ownerAvatarRemoteId: sharer.avatarRemoteId,
      roleOfDocument: role.toUpperCase(),
    });
    this.publishUpdateDocument(
      receiveIds,
      {
        document: documentShared,
        type: SUBSCRIPTION_DOCUMENT_LIST_SHARE,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );
  }

  sendUpdateDocumentPermissionNotification(params: {actor: User, document: Document, sharedIds: string[], role: DocumentRole}): void {
    const {
      actor, document, sharedIds, role,
    } = params;
    const notification = {
      actor: {
        actorId: actor._id,
        type: 'user',
        actorName: actor.name,
        avatarRemoteId: actor.avatarRemoteId,
      },
      actionType: NotiDocument.UPDATE_USER_PERMISSION,
      notificationType: 'DocumentNotification',
      entity: {
        entityId: document._id,
        entityName: document.name,
        type: 'document',
        entityData: {
          role,
        },
      },
    };
    this.notificationService.createUsersNotifications(
      notification,
      sharedIds,
    );
  }

  async createRequestAccessPermission(
    {
      document,
      requester,
      documentRole,
      message,
    }
    : {
      document: Document,
      requester: User,
      documentRole: DocumentRoleEnum,
      message: string,
    },
  ) : Promise<IDocumentRequestAccess> {
    const {
      _id: requesterId, name: requesterName, avatarRemoteId: requesterAvatar,
    } = requester;
    const {
      _id: documentId, name: documentName, isPersonal, ownerId,
    } = document;
    const documentScope = await this.getDocumentScope(documentId);
    const eventData: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_REQUESTED_TO_ACCESS,
      actor: requester,
      eventScope: documentScope,
      document,
    };
    // doc personal
    let targetId = ownerId;
    let targetType = 'user';
    if (isPersonal) {
      const ownerUser = await this.userService.findUserById(ownerId, { name: 1, email: 1, avatarRemoteId: 1 });
      if (!ownerUser) throw GraphErrorException.BadRequest('User not found', ErrorCode.User.USER_NOT_FOUND);
      eventData.target = ownerUser;
      this.eventService.createEvent(eventData);
    } else {
      const docPermission = await this.getDocumentPermissionByGroupRole(
        documentId,
        [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
      );
      if (!docPermission) throw GraphErrorException.BadRequest('Document permission not found', ErrorCode.Document.NO_DOCUMENT_PERMISSION);
      if (docPermission.role === DocumentRoleEnum.ORGANIZATION_TEAM) {
        this.eventService.createEvent(eventData);
        targetType = 'team';
      } else {
        targetType = 'organization';
      }
      targetId = docPermission.refId;
    }
    const [requestAccessDocument] = await this.getRequestAccessDocument({ documentId, requesterId });
    const shouldSendEmailNoti = !requestAccessDocument || PRIORITY_ROLE[documentRole] < PRIORITY_ROLE[requestAccessDocument.documentRole];
    const request = await this.updateRequestAccess(
      { requesterId, documentId },
      {
        requesterId, documentId, documentRole, createdAt: Date.now(),
      },

      { new: true, upsert: true },
    );
    const receiverIds: string[] = await this.getReceiverIdsNotiRequestAccess(document as unknown as IDocument, request);
    const receivers: User[] = await this.userService.findUsers({ _id: { $in: receiverIds } }, { email: 1 });
    const sendToEmails = receivers.map((receiver) => receiver.email);
    if (shouldSendEmailNoti) {
      const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.REQUEST_ACCESS, {
        actor: requester,
        document,
        role: this.getRoleText(documentRole),
      });
      this.notificationService.publishFirebaseNotifications(receiverIds, notificationContent, notificationData);

      const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
      const desktopPath = `/viewer/${documentId}?requesterId=${requesterId}&action=request_access`;
      const mobilePath = '/email-document-permission-request';

      this.emailService.sendEmailHOF(EMAIL_TYPE.REQUEST_ACCESS, sendToEmails, {
        requesterName,
        message: message || '',
        role: this.getRoleTextEmail(documentRole),
        documentName,
        documentDeeplink: this.emailService.generateDeeplinkForEmail(mobilePath, desktopPath),
        documentUrl: `${baseUrl}${desktopPath}`,
        subject: `Permission request for ${documentName}`,
      });
    }
    // send notification to notifyToIds
    const { _id: orgId } = await this.getTargetOwnedDocumentInfo(documentId);
    const notificationData = await this.notificationService.updateNotification(
      {
        actionType: NotiDocument.REQUEST_ACCESS,
        'actor.actorId': requesterId,
        'entity.entityId': document._id,
      },
      {
        actor: {
          actorId: requesterId,
          actorName: requesterName,
          type: 'user',
          avatarRemoteId: requesterAvatar,
        },
        actionType: NotiDocument.REQUEST_ACCESS,
        notificationType: 'DocumentNotification',
        entity: {
          entityId: documentId?.toString(),
          entityName: documentName,
          type: 'document',
          entityData: {
            ownOrgId: orgId,
          },
        },
        target: {
          targetData: {
            role: this.getRoleText(documentRole),
          },
          targetId,
          type: targetType,
        },
        createdAt: new Date(),
      },

      { new: true, upsert: true },
    );
    await Promise.all(receiverIds.map((notifyToId) => this.notificationService.updateNotificationUser(
      {
        notificationId: notificationData._id,
        userId: notifyToId,
        tab: NotificationTab.REQUESTS,
      },
      {
        createdAt: new Date(),
      },
      { new: true, upsert: true },
    )));
    if (requestAccessDocument) {
      this.notificationService.publishDeleteNotification(receiverIds, { notificationId: notificationData._id, tab: NotificationTab.REQUESTS });
    }
    const attachNotification = {
      _id: notificationData._id,
      createdAt: notificationData.createdAt,
      is_read: false,
      tab: NotificationTab.REQUESTS,
      ...notificationData,
    } as IPublishNotification;
    const publishData = await this.notificationService.genPublishNotificationData(attachNotification);
    this.notificationService.publishNewNotifications(receiverIds, publishData);
    return request;
  }

  async acceptRequestAccess(params: { document: Document, accepter: User, requesterIds: string[] }) : Promise<void> {
    const { document, accepter, requesterIds } = params;
    const requestAccessList = await this.getRequestAccessDocument({ documentId: document._id, requesterId: { $in: requesterIds } });
    if (!requestAccessList.length) {
      throw GraphErrorException.NotFound('Request access not found');
    }
    const isOrgManager = (membershipRole: OrganizationRoleEnums | OrganizationTeamRoles) => [
      OrganizationRoleEnums.BILLING_MODERATOR,
      OrganizationRoleEnums.ORGANIZATION_ADMIN,
      OrganizationTeamRoles.ADMIN,
    ].includes(membershipRole);
    const [requestListPermissions, actorDocPermission] = await Promise.all([
      Promise.all(
        requestAccessList.map(async ({ requesterId }) => {
          const existedPermission = await this.checkExistedDocPermission(requesterId, document);
          return [
            requesterId.toHexString(), existedPermission,
          ] as [string, Record<string, any>];
        }),
      ),
      this.checkExistedDocPermission(accepter._id, document),
    ]);
    const requestListPermissionsMapping = Object.fromEntries(requestListPermissions);

    const isValidRequestList = requestAccessList.every((
      request,
    ) => isOrgManager(actorDocPermission.membershipRole as OrganizationRoleEnums | OrganizationTeamRoles)
      || requestListPermissionsMapping[request.requesterId.toHexString()].permissionType === DocumentOwnerTypeEnum.PERSONAL);
    if (!isValidRequestList) {
      throw GraphErrorException.BadRequest('Cannot accept request access to document');
    }

    const [
      _,
      updateExternalPermissions,
      updateInternalPermissions,
    ] = requestAccessList.reduce(([newRequestTotal, updateExternal, updateInternal], request) => {
      const { requesterId, documentRole } = request;
      const existedDocPermission = requestListPermissionsMapping[requesterId.toHexString()];
      if (!existedDocPermission.hasPermission) {
        return [Number(newRequestTotal) + 1, { ...updateExternal, [requesterId]: documentRole }, updateInternal];
      }
      switch (existedDocPermission.permissionType) {
        case DocumentOwnerTypeEnum.PERSONAL:
          return [newRequestTotal, { ...updateExternal, [requesterId]: documentRole }, updateInternal];
        case DocumentOwnerTypeEnum.ORGANIZATION:
        case DocumentOwnerTypeEnum.ORGANIZATION_TEAM:
          return [newRequestTotal, updateExternal, { ...updateInternal, [requesterId]: documentRole }];
        default: {
          return [newRequestTotal, updateExternal, updateInternal];
        }
      }
    }, [0, {}, {}]);

    await this.updateDocumentPermissionWhenAcceptRequest({ document, updateExternalPermissions, updateInternalPermissions });
    this.removeRequestNotiWhenAcceptRequest(document._id, requesterIds);
    this.sendEmailWhenAcceptRequest({ document, requestAccessList });
    this.notifyWhenAcceptRequest({ accepter, document, requestAccessList });
    this.publishWhenAcceptRequest(document, requestAccessList);
    // remove requestAccess
    await this.deleteManyRequestAccess({ documentId: document._id, requesterId: { $in: requesterIds } });
  }

  async updateDocumentPermissionWhenAcceptRequest(
    params: {
      document: Document,
      updateExternalPermissions: Record<string, DocumentRoleEnum>,
      updateInternalPermissions: Record<string, DocumentRoleEnum>
    },
  ): Promise<void> {
    // update external permission
    const { document, updateExternalPermissions, updateInternalPermissions } = params;
    if (Object.keys(updateExternalPermissions).length) {
      const operators = Object.keys(updateExternalPermissions).map((userId) => ({
        updateOne: {
          filter: {
            documentId: document._id,
            refId: userId,
          },
          update: {
            role: updateExternalPermissions[userId],
          },
          upsert: true,
          setDefaultsOnInsert: false,
        },
      }));
      await this.documentPermissionModel.bulkWrite(operators);
    }

    // update internal permission
    if (Object.keys(updateInternalPermissions).length) {
      await this.updateDocumentPermission(
        { documentId: document._id, role: { $in: INTERNAL_DOCUMENT_PERMISSION_ROLE } },
        [{ $addFields: { groupPermissions: updateInternalPermissions } }],
      );
    }
  }

  publishWhenAcceptRequest(document: Document, requestAccessList: IDocumentRequestAccess[]): void {
    requestAccessList.forEach((request) => {
      this.userService.findUserById(document.ownerId)
        .then((documentOwner: User) => {
          const cloneDocument = this.cloneDocument(
            JSON.stringify(document),
            {
              ownerName: documentOwner?.name || 'Anonymous',
              ownerAvatarRemoteId: documentOwner?.avatarRemoteId,
              roleOfDocument: DocumentRoleEnum.VIEWER,
            },
          );
          this.publishUpdateDocument(
            [request.requesterId],
            {
              document: cloneDocument,
              type: SUBSCRIPTION_DOCUMENT_LIST_SHARE,
            },
            SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
          );
        });

      this.messageGateway.server.to(
        `document-room-${document._id}`,
      ).emit(`updatePermission-${document._id}`, { userId: request.requesterId, role: request.documentRole });
    });
  }

  removeRequestNotiWhenAcceptRequest(documentId: string, requesterIds: string[]): void {
    requesterIds.forEach(async (requesterId: string) => {
      const [foundNotification] = await this.notificationService.getNotificationsByConditions({
        actionType: NotiDocument.REQUEST_ACCESS,
        'actor.actorId': requesterId,
        'entity.entityId': documentId,
      });
      if (foundNotification) {
        const notificationUsers = await this.notificationService.getNotificationUsersByCondition({
          notificationId: foundNotification._id,
        });
        const userIdsToRemoveNoti: string[] = notificationUsers.map((notificationUser) => notificationUser.userId);
        this.notificationService.removeMultiNotifications({
          notification: foundNotification, userIds: userIdsToRemoveNoti, tabs: [NotificationTab.REQUESTS],
        });
      }
    });
  }

  async sendEmailWhenAcceptRequest(params: {document: Document, requestAccessList: IDocumentRequestAccess[]}): Promise<void> {
    const { document, requestAccessList } = params;
    const requesterIds = requestAccessList.map(({ requesterId }) => requesterId);
    const requesters = await this.userService.findUserByIds(requesterIds, { _id: 1, email: 1 });
    const documentId = document._id;
    const desktopPath = `/viewer/${documentId}`;

    requestAccessList.forEach((request: IDocumentRequestAccess) => {
      const emailData = {
        role: this.getRoleText(request.documentRole),
        documentName: document.name,
        documentId,
        subject: `${document.name} - Permission granted`,
        documentDeeplink: this.emailService.generateDeeplinkForEmail('/email-document-permission-granted', desktopPath),
      };
      const requester = requesters.find(({ _id }) => _id === request.requesterId.toHexString());
      this.emailService.sendEmailHOF(EMAIL_TYPE.ACCEPT_REQUEST_ACCESS_DOCUMENT, [requester.email], emailData);
    });
  }

  notifyWhenAcceptRequest(
    params: {accepter: User, document: Document, requestAccessList: IDocumentRequestAccess[]},
  ): void {
    const {
      accepter, document, requestAccessList,
    } = params;
    const { _id: documentId } = document;
    requestAccessList.forEach((request) => {
      const notification = {
        actor: {
          actorId: accepter._id,
          actorName: accepter.name,
          type: 'user',
          avatarRemoteId: accepter.avatarRemoteId,
        },
        actionType: NotiDocument.ACCEPT_REQUEST_ACCESS,
        notificationType: 'DocumentNotification',
        entity: {
          entityId: documentId?.toString(),
          entityName: document.name,
          type: 'document',
        },
        target: {
          targetData: {
            role: this.getRoleText(request.documentRole),
          },
        },
      };
      this.notificationService.createUsersNotifications(notification, [request.requesterId]);

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.ACCEPT_REQUEST_ACCESS, {
        document,
        role: this.getRoleText(request.documentRole),
      });
      this.notificationService.publishFirebaseNotifications([request.requesterId.toHexString()], notificationContent, notificationData);
    });
  }

  async getRequestAccessData(requesterId : string, documentId: string) : Promise<IDocumentRequestAccess[]> {
    const requestAccesses = await this.documentRequestAccessModel.find({ requesterId, documentId }).exec();
    return requestAccesses.map((requestAccess) => ({ ...requestAccess.toObject(), _id: requestAccess._id.toHexString() }));
  }

  async createRequestAccess(requesterId : string, documentId: string, documentRole: DocumentRoleEnum): Promise<IDocumentRequestAccess> {
    const requestAccess = await this.documentRequestAccessModel.create({ requesterId, documentId, documentRole });
    return { ...requestAccess.toObject(), _id: requestAccess._id.toHexString() };
  }

  async updateRequestAccess(
    condition: FilterQuery<IDocumentRequestAccess>,
    updateProperties: FilterQuery<IDocumentRequestAccess>,
    options?: Record<string, any>,
  ): Promise<IDocumentRequestAccess> {
    const updatedRequest = await this.documentRequestAccessModel.findOneAndUpdate(condition, updateProperties, options).exec();
    return updatedRequest ? { ...updatedRequest.toObject(), _id: updatedRequest._id.toHexString() } : null;
  }

  removeRequestAccess(requesterId: string, documentIds: string[]) {
    return this.documentRequestAccessModel.deleteMany({
      requesterId,
      documentId: {
        $in: documentIds,
      },
    });
  }

  getUserLookupFromRequestAccessDoc(): unknown {
    return {
      from: 'users',
      let: {
        userId: '$requesterId',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$userId', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            avatarRemoteId: 1,
            email: 1,
          },
        },
      ],
      as: 'userInfo',
    };
  }

  getAllRequestAccessPipeline(params: {
    documentId: string, cursor: string, limit: number
  }): { requestListPipeline: PipelineStage[], countTotalPipeline: PipelineStage[] } {
    const { documentId, cursor, limit } = params;
    const userLookupExpression = this.getUserLookupFromRequestAccessDoc();
    const countTotalPipeline = [
      {
        $match: {
          documentId: new Types.ObjectId(documentId),
        },
      },
      {
        $count: 'total',
      },
    ];
    const requestListPipeline = [
      {
        $match: {
          documentId: new Types.ObjectId(documentId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: (cursor ? { createdAt: { $lt: new Date(+cursor) } } : {}),
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: userLookupExpression,
      },
      {
        $unwind: '$userInfo',
      },
    ] as PipelineStage[];
    return {
      requestListPipeline,
      countTotalPipeline,
    };
  }

  getOrgMemberLookupExpression(orgId: string): unknown {
    return {
      from: 'organizationmembers',
      let: {
        userId: '$requesterId',
      },
      pipeline: [
        {
          $match: {
            $and: [
              {
                $expr: {
                  $eq: ['$orgId', orgId],
                },
              },
              {
                $expr: {
                  $eq: ['$userId', '$$userId'],
                },
              },

            ],
          },
        },
      ],
      as: 'member',
    };
  }

  getTeamMemberLookupExpression(teamId: string): unknown {
    return {
      from: 'memberships',
      let: {
        userId: '$requesterId',
      },
      pipeline: [
        {
          $match: {
            $and: [
              {
                $expr: {
                  $eq: ['$teamId', teamId],
                },
              },
              {
                $expr: {
                  $eq: ['$userId', '$$userId'],
                },
              },

            ],
          },
        },
      ],
      as: 'member',
    };
  }

  getExternalRequestOrgDocPipeline(params: {
    documentId: string,
    cursor: string,
    limit: number,
    docType: DocumentRoleEnum,
    refId: string,
  }): { requestListPipeline: PipelineStage[], countTotalPipeline: PipelineStage[] } {
    const {
      documentId, cursor, limit, refId, docType,
    } = params;
    const userLookupExpression = this.getUserLookupFromRequestAccessDoc();
    const membershipLookupExpression = docType === DocumentRoleEnum.ORGANIZATION
      ? this.getOrgMemberLookupExpression(refId)
      : this.getTeamMemberLookupExpression(refId);

    const countTotalPipeline = [
      {
        $match: {
          documentId: new Types.ObjectId(documentId),
        },
      },
      {
        $lookup: membershipLookupExpression,
      },
      {
        $match: { member: { $size: 0 } },
      },
      {
        $count: 'total',
      },
    ] as PipelineStage[];
    const requestListPipeline = [
      {
        $match: {
          documentId: new Types.ObjectId(documentId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: (cursor ? { createdAt: { $lt: new Date(+cursor) } } : {}),
      },
      {
        $lookup: membershipLookupExpression,
      },
      {
        $match: { member: { $size: 0 } },
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: userLookupExpression,
      },
      {
        $unwind: '$userInfo',
      },
    ] as PipelineStage[];
    return {
      requestListPipeline,
      countTotalPipeline,
    };
  }

  async getRequestAccessesByDocId(params: {
    document: Document,
    userId: string,
    input?: Partial<DocumentRequestAccessInput>
  }) : Promise<{
    requestList: UserPermission[],
    total: number,
    hasNextPage: boolean,
    cursor: string,
  }> {
    const {
      document, userId, input,
    } = params;
    const { cursor, limit = 30 } = input || {};
    const { _id: documentId } = document;
    const [existedPermission, [originalDocPermission]] = await Promise.all([
      this.checkExistedDocPermission(userId, document),
      this.getDocumentPermissionByConditions({ documentId, role: { $in: ORIGINAL_DOCUMENT_PERMISSION_ROLE } }),
    ]);
    const isOrgManager = [
      OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationTeamRoles.ADMIN,
    ].includes(existedPermission.membershipRole as OrganizationRoleEnums | OrganizationTeamRoles);
    let pipelines: { requestListPipeline: PipelineStage[], countTotalPipeline: PipelineStage[] };
    if (document.isPersonal || isOrgManager) {
      pipelines = this.getAllRequestAccessPipeline({ documentId, cursor, limit });
    } else {
      pipelines = this.getExternalRequestOrgDocPipeline({
        documentId, cursor, limit, refId: originalDocPermission.refId, docType: originalDocPermission.role as DocumentRoleEnum,
      });
    }

    const [requestList, [{ total } = { total: 0 }]] = await Promise.all([
      this.documentRequestAccessModel.aggregate(pipelines.requestListPipeline),
      this.documentRequestAccessModel.aggregate(pipelines.countTotalPipeline),
    ]);
    const hasNextPage = requestList.length > limit;
    if (hasNextPage) {
      requestList.pop();
    }
    const data = requestList.map(({ createdAt, documentRole, userInfo }) => ({
      ...userInfo,
      role: documentRole || IndividualRoles.VIEWER,
      type: USER_SHARING_TYPE.REQUEST_ACCESS,
      teamName: null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cursor: new Date(createdAt).getTime(),
    }));

    return {
      requestList: data,
      total: total || 0,
      hasNextPage,
      cursor: data[data.length - 1]?.cursor || '',
    };
  }

  async getRequestAccessDocument(
    conditions: FilterQuery<IDocumentRequestAccess>,
    projections?: ProjectionType<IDocumentRequestAccess>,
  ): Promise<IDocumentRequestAccess[]> {
    const requestAccesses = await this.documentRequestAccessModel.find(conditions, projections).exec();
    return requestAccesses.map((requestAccess) => ({ ...requestAccess.toObject(), _id: requestAccess._id.toHexString() }));
  }

  async deleteManyRequestAccess(conditions: FilterQuery<IDocumentRequestAccess>) {
    await this.documentRequestAccessModel.deleteMany(conditions);
  }

  async countTotalDocumentsByCondition(clientId: string, condition?: Record<string, unknown>): Promise<number> {
    return this.documentPermissionModel.find({
      refId: clientId,
      ...condition,
    }).countDocuments();
  }

  async countTotalAnnotationByType(
    clientId: string,
    annotationType: DocumentAnnotationTypeEnum,
  ): Promise<number> {
    let totalAnnotations = 0;
    const permissions = await this.getDocumentPermission(clientId, {});
    const documentIds = permissions.map((permission) => permission.documentId);
    totalAnnotations = await this.documentAnnotationModel.find({
      documentId: {
        $in: documentIds,
      },
      xfdf: {
        $regex: `subject="${annotationType}"`,
      },
    }).countDocuments();
    return totalAnnotations;
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async countTotalAnnotationsByOrgId(orgId: string, excludedTypes?: DocumentAnnotationTypeEnum[]): Promise<number> {
    let totalAnnotations = 0;
    const orgTeamIds = (await this.organizationTeamService.getOrgTeams(orgId)).map((team) => team._id);
    const permissions = await this.getDocumentPermissionByConditions(
      { $or: [{ refId: { $in: [...orgTeamIds, orgId] } }, { 'workspace.refId': orgId }] },
    );
    const documentIds = permissions.map((permission) => permission.documentId);
    // const createdAnnotationRegex = excludedTypes
    //   ? new RegExp(`subject="(?!(${excludedTypes.join('|')}))`)
    //   : new RegExp('subject="');
    totalAnnotations = await this.documentAnnotationModel.find({
      documentId: {
        $in: documentIds,
      },
      // xfdf: {
      //   $regex: createdAnnotationRegex,
      // },
    }).countDocuments();
    return totalAnnotations;
  }

  async getNonOrgDocumentSummary(clientId: string, scope: EventScopeType): Promise<Partial<IDocumentSummary>> {
    let payload: Partial<IDocumentSummary>;
    switch (scope) {
      case EventScopes.PERSONAL: {
        const [ownedDocumentTotal, sharedDocumentTotal, commentTotal] = await Promise.all([
          this.countTotalDocumentsByCondition(clientId, { role: IndividualRoles.OWNER }),
          this.countTotalDocumentsByCondition(clientId, {
            role: {
              $ne: IndividualRoles.OWNER,
            },
          }),
          this.countTotalAnnotationByType(clientId, DocumentAnnotationTypeEnum.COMMENT),
        ]);
        payload = { ownedDocumentTotal, sharedDocumentTotal, commentTotal } as IPersonalDocumentSummary;
        break;
      }
      case EventScopes.TEAM: {
        const [ownedDocumentTotal, commentTotal] = await Promise.all([
          this.countTotalDocumentsByCondition(clientId),
          this.countTotalAnnotationByType(clientId, DocumentAnnotationTypeEnum.COMMENT),
        ]);
        payload = { ownedDocumentTotal, commentTotal } as ITeamDocumentSummary;
        break;
      }
      default:
        break;
    }
    return payload;
  }

  public async createDocumentWithBufferData({
    clientId, fileRemoteId, thumbnailRemoteId, uploader, docType, folderId, fileName: docName = '', documentInfo,
  }: {
    clientId: string,
    fileRemoteId: string,
    fileName?: string,
    uploader: Record<string, string>,
    docType: DocumentOwnerTypeEnum,
    folderId?: string,
    documentInfo?: HeadObjectOutput,
    thumbnailRemoteId?: string,
  }, metadata?: {
    documentName?: string,
    thumbnailKey?: string,
    manipulationStep?: string,
  }): Promise<IDocument> {
    const metaData = documentInfo || await this.awsService.getDocumentMetadata(fileRemoteId);
    const {
      ContentType: mimeType, ContentLength: docSize,
    } = metaData;
    const { documentName, thumbnailKey, manipulationStep } = metadata || {};
    const isPersonal = DocumentOwnerTypeEnum.PERSONAL === docType;

    const newDocumentName = documentName ? `${documentName}${CommonConstants.PDF_FILE_EXTENSION}` : docName;

    const namingDocument = await this.getDocumentNameAfterNaming({
      clientId: docType === DocumentOwnerTypeEnum.PERSONAL ? uploader._id : clientId,
      fileName: newDocumentName,
      documentFolderType: docType,
      mimetype: mimeType,
    });
    const documentThumbnail = thumbnailRemoteId || thumbnailKey;
    const documentData = {
      name: namingDocument,
      remoteId: fileRemoteId,
      mimeType,
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
    return this.createDocument(documentData);
  }

  public async getReceiverIdsFromDocumentId(
    documentId: string,
  ): Promise<{ allReceivers: Set<string>, receiversIndividual: Set<string>, receiversTeam: Set<string>, receiversOrganization: Set<string> }> {
    const receiverIds = new Set<string>();
    const receiverTeamIds = new Set<string>();
    const receiverOrganizationIds = new Set<string>();
    const extra: Record<string, string> = {};
    const documentPermissionList = await this.getDocumentPermissionsByDocId(documentId);
    documentPermissionList.forEach((documentPermission) => {
      if (![
        DocumentRoleEnum.ORGANIZATION,
        DocumentRoleEnum.ORGANIZATION_TEAM,
      ].includes(DocumentRoleEnum[documentPermission.role.toUpperCase()] as DocumentRoleEnum)) {
        receiverIds.add(documentPermission.refId.toHexString());
      } else {
        extra[documentPermission.role] = documentPermission.refId;
      }
    });
    const { team: teamId, organization: organizationId, organization_team: orgTeamId } = extra;
    const currentTeamId = teamId || orgTeamId;
    if (currentTeamId) {
      (await this.teamService.getAllMembersInTeam(currentTeamId, { userId: 1 }))
        .forEach((member) => {
          receiverTeamIds.add(member.userId.toHexString());
        });
    }
    if (organizationId) {
      (await this.organizationService.getMembersByOrgId(organizationId, { userId: 1 }))
        .forEach((member) => {
          receiverOrganizationIds.add(member.userId.toHexString());
        });
    }

    return {
      allReceivers: new Set([...receiverIds, ...receiverTeamIds, ...receiverOrganizationIds]),
      receiversIndividual: receiverIds,
      receiversTeam: receiverTeamIds,
      receiversOrganization: receiverOrganizationIds,
    };
  }

  getDeleteDocumentListSubscriptionPayload(documents: Document[]): DeletedOriginalDocumentInfo[] {
    return documents.map((document) => ({
      documentId: document._id,
      documentFolder: document.folderId,
    }));
  }

  public publishEventDeleteDocumentToInternal(
    params: {
      documents: Document[],
      clientId: string,
      roleOfDocument: DocumentRoleEnum,
      allMember: string[],
    },
    extendPayload?: Partial<DeleteOriginalDocumentPayload>,
  ): void {
    const {
      documents, clientId, roleOfDocument, allMember,
    } = params;
    const subscriptionType = {
      default: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
      team: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
      organization: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION,
      organization_team: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
    };
    const payload = {
      documentList: this.getDeleteDocumentListSubscriptionPayload(documents),
      teamId: [DocumentRoleEnum.ORGANIZATION_TEAM].includes(roleOfDocument) ? clientId : '',
      organizationId: roleOfDocument === DocumentRoleEnum.ORGANIZATION ? clientId : '',
    };
    this.publishDeleteOriginalDocument(
      [...allMember, clientId],
      {
        ...payload,
        ...extendPayload,
        type: subscriptionType[roleOfDocument] || subscriptionType.default,
      },
      SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
    );
  }

  public publishEventDeleteDocumentToInvididual(documents: Document[], allReceivers: string[], additionalSettings?: SubDocumentSettings): void {
    const payload = {
      documentList: this.getDeleteDocumentListSubscriptionPayload(documents),
      teamId: '',
      organizationId: '',
      additionalSettings,
    };
    this.publishDeleteOriginalDocument(
      allReceivers,
      {
        ...payload,
        type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
      },
      SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
    );
  }

  public publishEventDeleteDocumentToExternal(documents: Document[], allReceivers: string[], additionalSettings?: SubDocumentSettings): void {
    const payload = {
      documentList: this.getDeleteDocumentListSubscriptionPayload(documents),
      teamId: '',
      organizationId: '',
      additionalSettings,
    };
    this.publishDeleteOriginalDocument(
      allReceivers,
      {
        ...payload,
        type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
      },
      SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
    );
  }

  public notifyDeleteDocumentToShared(notificationData: Record<string, any>, receiversIndividual: string[]): void {
    const externalIdsNotiList: string[] = receiversIndividual;
    if (externalIdsNotiList.length) {
      const externalNotification: NotiInterface = notiDocumentFactory.create(NotiDocument.DELETE, {
        actor: { user: notificationData.actor },
        entity: { document: notificationData.entity },
      });
      this.notificationService.createUsersNotifications(
        externalNotification,
        externalIdsNotiList,
      );

      // send out-app noti for mobile
      const {
        notificationContent: firebaseNotificationContent,
        notificationData: firebaseNotificationData,
      } = notiFirebaseDocumentFactory.create(NotiDocument.DELETE, {
        document: notificationData.entity,
        actor: notificationData.actor,
      });
      const receivedIds = externalIdsNotiList.map((objectId) => objectId.toHexString());
      this.notificationService.publishFirebaseNotifications(receivedIds, firebaseNotificationContent, firebaseNotificationData);
    }
  }

  public async notifyDeleteSingleDocumentToMembers(type: DocumentOwnerTypeEnum, actor: User, clientId: string, document: IDocument) : Promise<void> {
    const notificationData = {
      actor: {
        user: actor,
      },
      entity: {
        document,
      },
      target: {},
    };
    let notification: NotiInterface = null;

    switch (type) {
      case DocumentOwnerTypeEnum.TEAM: {
        const team = await this.teamService.findOneById(clientId);
        if (!team) {
          return;
        }
        notificationData.target = { team };

        notification = notiTeamFactory.create(NotiTeam.DELETE_DOCUMENT_TEAM, notificationData);
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, [actor._id]);
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(clientId);
        if (!organization) {
          return;
        }
        notificationData.target = { organization };

        notification = notiOrgFactory.create(NotiOrg.REMOVE_DOCUMENT, notificationData);
        this.organizationService.publishNotiToAllOrgMember({
          orgId: clientId,
          notification,
          excludedIds: [actor._id],
        });

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseOrganizationFactory.create(NotiOrg.REMOVE_DOCUMENT, {
          organization,
          actor,
          document,
        });
        this.organizationService.publishFirebaseNotiToAllOrgMember({
          orgId: clientId,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludedIds: [actor._id],
        });

        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM: {
        const organizationTeam = await this.teamService.findOneById(clientId);
        if (!organizationTeam) {
          return;
        }
        const organization = await this.organizationService.getOrgById(organizationTeam.belongsTo as string);
        notificationData.target = { team: organizationTeam, organization };
        notification = notiOrgFactory.create(NotiOrgTeam.DELETE_DOCUMENT, notificationData);
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, [actor._id]);
        // send out-app noti for mobile
        const {
          notificationData: firebaseNotificationData,
          notificationContent: firebaseNotificationContent,
        } = notiFirebaseTeamFactory.create(NotiOrgTeam.DELETE_DOCUMENT, {
          team: organizationTeam,
          organization,
          actor,
          document,
        });
        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: clientId,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [actor._id],
        });
        break;
      }
      default:
        break;
    }
  }

  public async notifyDeleteDocumentsToMember(
    type: DocumentOwnerTypeEnum,
    clientId: string,
    notificationData: Record<string, any>,
    exceptionIds: string[],
  ): Promise<void> {
    switch (type) {
      case DocumentOwnerTypeEnum.TEAM: {
        const team = await this.teamService.findOneById(clientId);
        const notification = notiTeamFactory.create(NotiTeam.DELETE_MULTI_DOCUMENT, {
          ...notificationData,
          target: { team },
        });
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, exceptionIds);
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(clientId);
        const notification = notiOrgFactory.create(NotiOrg.DELETE_MULTI_DOCUMENT, {
          ...notificationData,
          target: { organization },
        });
        this.organizationService.publishNotiToAllOrgMember({
          orgId: clientId,
          notification,
          excludedIds: exceptionIds,
        });

        // send out-app noti for mobile
        const actor = await this.userService.findUserById(exceptionIds[0]);
        const totalDocuments = notificationData.entity.totalDocument;
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseOrganizationFactory.create(NotiOrg.DELETE_MULTI_DOCUMENT, {
          organization,
          actor,
          totalDocuments,
        });
        this.organizationService.publishFirebaseNotiToAllOrgMember({
          orgId: clientId,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludedIds: exceptionIds,
        });

        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM: {
        const organizationTeam = await this.teamService.findOneById(clientId);
        const organization = await this.organizationService.getOrgById(organizationTeam.belongsTo as string);
        const notification = notiOrgFactory.create(NotiOrgTeam.DELETE_MULTI_DOCUMENT, {
          ...notificationData,
          target: { organization, team: organizationTeam },
        });
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, exceptionIds);

        // send out-app noti for mobile
        const totalDocuments = notificationData.entity.totalDocument;
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseTeamFactory.create(NotiOrgTeam.DELETE_MULTI_DOCUMENT, {
          organization,
          team: organizationTeam,
          actor: notificationData.actor.user,
          totalDocuments,
        });

        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: organizationTeam._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [notificationData.actor.user._id],
        });
        break;
      }
      default:
        break;
    }
  }

  public async deleteOriginalDocument(document: Document): Promise<void> {
    this.deleteDocumentNonLuminUser({ documentId: document._id });
    this.deleteRemoteThumbnail(document.thumbnail);
    this.deleteRemoteDocument(document as unknown as IDocument);
    this.deleteDocument(document._id);
    this.deleteDocumentPermissions({ documentId: document._id });
    this.clearAnnotationOfDocument({ documentId: document._id });
    this.documentOutlineService.clearOutlineOfDocument(document._id);
    this.deleteAllImageSignedUrls(document._id);
    this.deleteFormFieldFromDocument(document._id);
    await this.documentBackupInfoModel.deleteOne({ documentId: document._id });
    this.deleteFormFieldFromDocument(document._id);
    this.documentDriveMetadataModel.findOneAndDelete({ documentId: document._id });
    this.removeFromRecentDocumentList([document._id]);
  }

  public async deleteManyOriginalDocument(documents: Document[], session?: ClientSession): Promise<void> {
    const documentIds = documents.map((document) => document._id);
    await Promise.all([
      this.deleteDocumentPermissions({ documentId: { $in: documentIds } }, session),
      this.deleteDocumentNonLuminUser({ documentId: { $in: documentIds } }, session),
      this.deleteManyDocumentById(documentIds, session),
      this.deleteManyDocumentDriveMetadata({ documentId: { $in: documentIds } }, session),
      this.removeFromRecentDocumentList(documentIds, session),
    ]);
    if (documents.length > MAXIMUM_DELETE_DOCUMENT_S3) {
      const seperatedDocumentList = Utils.seperateArray(documents, MAXIMUM_DELETE_DOCUMENT_S3);
      seperatedDocumentList.forEach((documentList) => {
        this.deleteManyRemoteThumbnail(documentList.filter((document) => document.thumbnail).map((document) => document.thumbnail) as string[]);
        this.deleteManyRemoteDocument(documentList as Document[]);
      });
    }
  }

  public async deleteDocumentsInPersonal({
    actorInfo, documentPermissionList, documentList, clientId, isPersonalDocumentsInOrg = false,
  }: {
    actorInfo:User, documentPermissionList: IDocumentPermission[], documentList: Document[], clientId: string, isPersonalDocumentsInOrg?: boolean,
  }):Promise<void> {
    const ownerDocuments = documentPermissionList.map(
      (documentPermission) => documentList.find((documentItem) => documentItem._id === documentPermission.documentId.toHexString()),
    );
    if (ownerDocuments.length) {
      const sharedDocumentPermission = await this.getSharedIdsOfDocuments(ownerDocuments);
      sharedDocumentPermission.forEach((element) => {
        const externalNotification = {
          actor: actorInfo,
          entity: element.document,
        };
        this.notifyDeleteDocumentToShared(externalNotification, element.userIds as string[]);
        this.publishEventDeleteDocumentToExternal([element.document as Document], element.userIds as string[]);
      });
      const documentIds = ownerDocuments.map((document) => document._id);

      await this.deleteManyOriginalDocument(ownerDocuments);

      // publish subscription to trigger modal on viewer for case document ANYONE (anonymous opening document)
      this.publishEventDeleteDocumentToExternal(ownerDocuments, [...documentIds]);
      if (!isPersonalDocumentsInOrg) {
        this.publishEventDeleteDocumentToInvididual(documentList, [clientId]);
      }
    }
  }

  public async deleteSharedDocuments(documents: Document[], clientId: string):Promise<void> {
    await this.deleteDocumentPermissions({ refId: clientId, documentId: { $in: documents } });
    this.publishEventDeleteDocumentToExternal(documents, [clientId]);
  }

  public async deleteDocumentsInOrgTeam(actorInfo: User, documentList: Document[], orgTeamId: string): Promise<void> {
    const notificationToMemberData = {
      actor: { user: actorInfo },
      entity: { totalDocument: documentList.length, document: documentList[0] },
    };
    const orgTeamMemberIds = (await this.teamService.getAllMembersInTeam(orgTeamId, { userId: 1 })).map((member) => member.userId);
    await this.deleteManyOriginalDocument(documentList);
    if (orgTeamMemberIds.length) {
      const documentIds = documentList.map((document) => document._id);
      this.publishEventDeleteDocumentToInternal({
        documents: documentList,
        clientId: orgTeamId,
        roleOfDocument: DocumentRoleEnum.ORGANIZATION_TEAM,
        allMember: [...orgTeamMemberIds, ...documentIds],
      });
      this.notifyDeleteDocumentsToMember(
        DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        orgTeamId,
        notificationToMemberData,
        [actorInfo._id],
      );
    }
  }

  public async deleteDocumentsInOrganization(actorInfo: User, documentList: Document[], organizationId: string, isNotify: boolean): Promise<void> {
    const notificationToMemberData = {
      actor: { user: actorInfo },
      entity: { totalDocument: documentList.length, document: documentList[0] },
    };
    await this.deleteManyOriginalDocument(documentList);
    const organizationMemberIds = (
      await this.organizationService.getMembersByOrgId(organizationId, { userId: 1 })).map((member) => member.userId.toHexString());
    if (organizationMemberIds.length) {
      const documentIds = documentList.map((document) => document._id);
      this.publishEventDeleteDocumentToInternal({
        documents: documentList,
        clientId: organizationId,
        roleOfDocument: DocumentRoleEnum.ORGANIZATION,
        allMember: [...organizationMemberIds, ...documentIds],
      });
      if (isNotify) {
        this.notifyDeleteDocumentsToMember(
          DocumentOwnerTypeEnum.ORGANIZATION,
          organizationId,
          notificationToMemberData,
          [actorInfo._id],
        );
      }
    }
  }

  public async getSharedIdsOfDocuments(documents: Document[]): Promise<Record<string, any>[]> {
    let externalPermissionOfDocuments: Record<string, any>[] = [
      /* {
        document: Document,
        userIds: [userId]
      } */
    ];
    externalPermissionOfDocuments = await Promise.all(documents.map(async (document) => {
      const externalPermissions = await this.getDocumentPermissionsByDocId(
        document._id,
        { role: { $nin: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.OWNER] } },
      );
      const externalUserIds = externalPermissions.map((permission) => permission.refId);
      if (externalUserIds.length) {
        return {
          document,
          userIds: externalUserIds,
        };
      }
      return null;
    }));
    return externalPermissionOfDocuments.filter((item) => item);
  }

  public async removeRequestAccessDocumentWhenAddedInTeam(teamId: string, members) {
    const team = await this.teamService.findOneById(teamId);
    const teamDocumentPermissions = await this.getDocumentPermission(teamId, {});
    const orgDocumentPermissions = await this.getDocumentPermission(team.belongsTo as string, {});
    const documentPermissions = [...teamDocumentPermissions, ...orgDocumentPermissions];
    const documentIds = documentPermissions.map((permission) => permission.documentId.toString());
    if (documentIds.length > 0) {
      Promise.all(members.map((member) => this.removeRequestAccess(member.userId as string, documentIds)));
    }
    this.deleteDocumentPermissions(
      {
        $and: [
          { refId: { $in: members.map((member) => member.userId) } },
          { documentId: { $in: documentPermissions.map((permission) => permission.documentId) } },
        ],
      },
    );
  }

  public async getDocumentScope(documentId: string): Promise<EventScopeType> {
    const documentPermissions = await this.getDocumentPermissionsByDocId(documentId);
    const belongToTeam = documentPermissions.some(
      (permission) => [DocumentRoleEnum.ORGANIZATION_TEAM].includes(permission.role as DocumentRoleEnum),
    );
    const belongToOrg = documentPermissions.some(
      (permission) => permission.role === DocumentRoleEnum.ORGANIZATION || permission.workspace?.type === DocumentWorkspace.ORGANIZATION,
    );
    let eventScope: EventScopeType = EventScopes.PERSONAL;
    if (belongToTeam) {
      eventScope = EventScopes.TEAM;
    }
    if (belongToOrg) {
      eventScope = EventScopes.ORGANIZATION;
    }
    return eventScope;
  }

  async getDocumentsWithRefAndRole(refId: string, role: DocumentRoleEnum, projection?: any) : Promise<Partial<IDocumentOwner>[]> {
    const orgAggregation: any[] = [
      {
        $match: {
          refId: new Types.ObjectId(refId),
          role,
        },
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'doc',
        },
      },
      {
        $unwind: {
          path: '$doc',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doc',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (projection) {
      orgAggregation.push({
        $project: projection,
      });
    }
    return this.aggregateDocumentPermission(orgAggregation as PipelineStage[]);
  }

  updateManySharedNonUser(
    filter: FilterQuery<IDocumentSharedNonUser>,
    update: UpdateWithAggregationPipeline | UpdateQuery<IDocumentSharedNonUser>,
    options?: QueryOptions,
  ): Promise<UpdateResult> {
    return this.documentSharedNonUserModel.updateMany(filter, update, options).exec();
  }

  countOwnedDocuments(userId: string): Promise<number> {
    return this.documentPermissionModel.countDocuments({
      refId: userId,
      role: DocumentRoleEnum.OWNER,
    }).exec();
  }

  async updateManyDocuments(
    filter: FilterQuery<IDocument>,
    update: UpdateQuery<IDocument> | UpdateWithAggregationPipeline,
    options?: QueryOptions<IDocument>,
  ): Promise<any> {
    return this.documentModel.updateMany(filter, update, options).exec();
  }

  async updateDocumentByIds(documentIds: string[], updateFields: UpdateWithAggregationPipeline | UpdateQuery<IDocument>) {
    await Utils.executeQueryInChunk(documentIds, (ids) => this.updateManyDocuments({ _id: { $in: ids } }, updateFields));
  }

  async updateDocumentOwnerId(
    {
      refId, oldOwnerId, ownerId, role,
    }: {
      refId: string,
      oldOwnerId: string,
      ownerId: string,
      role: DocumentRoleEnum.ORGANIZATION | DocumentRoleEnum.ORGANIZATION_TEAM,
    },
  ) {
    const documentPermissionEntries = await this.documentPermissionModel
      .find(
        {
          refId: new Types.ObjectId(refId),
          role,
        },
        { documentId: 1 },
      )
      .lean();

    if (!documentPermissionEntries.length) {
      return;
    }

    await this.documentModel.updateMany(
      {
        _id: { $in: documentPermissionEntries.map(({ documentId }) => documentId) },
        ownerId: new Types.ObjectId(oldOwnerId),
      },
      {
        $set: { ownerId: new Types.ObjectId(ownerId) },
      },
    );
  }

  async aggregateDocument<TResult = Document>(conditions: PipelineStage[]): Promise<TResult[]> {
    return this.documentModel.aggregate(conditions);
  }

  async getDocumentByRemoteIds({ remoteIds = [], clientId }
    : { remoteIds: string[], clientId: string }): Promise<Document[]> {
    return this.aggregateDocument([
      {
        $match: {
          remoteId: { $in: remoteIds },
          ownerId: new Types.ObjectId(clientId),
        },
      },
      {
        $sort: {
          lastAccess: -1,
        },
      },
      {
        $group: {
          _id: '$remoteId',
          documents: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$documents',
        },
      },
    ]);
  }

  async validateUpdatePermission(
    {
      actorId, roleOfDocumentPermission, findUser, documentPermission,
    }:
    {actorId: string, roleOfDocumentPermission: string, findUser: User, documentPermission: IDocumentPermission},
  ): Promise<void> {
    if (roleOfDocumentPermission === DocumentRoleEnum.ORGANIZATION) {
      const actorMember = await this.organizationService.getMembershipByOrgAndUser(documentPermission.refId, actorId);
      if (!actorMember) {
        throw GraphErrorException.NotAcceptable('External shared can not change permission of internal member');
      }
      if (actorMember.role === OrganizationRoleEnums.MEMBER) {
        throw GraphErrorException.NotAcceptable('Member can not change permission each other ');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const findMemberInOrg = await this.organizationService.getMembershipByOrgAndUser(documentPermission.refId, findUser._id, { _id: 1, role: 1 });
      if (!findMemberInOrg) {
        throw GraphErrorException.NotAcceptable('Member does not belong to this organization', ErrorCode.Org.USER_NOT_IN_ORGANIZATION);
      }
      if ([
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR].includes(findMemberInOrg.role as OrganizationRoleEnums)) {
        throw GraphErrorException.NotAcceptable(
          'Can not change permission of manager in organization',
          ErrorCode.Org.CANNOT_CHANGE_PERMISSION_OF_ORG_MANAGER,
        );
      }
    } else if (roleOfDocumentPermission === DocumentRoleEnum.ORGANIZATION_TEAM) {
      const findMemberInOrgTeam = await this.membershipService.findOne({ teamId: documentPermission.refId, userId: findUser._id });
      if (!findMemberInOrgTeam) {
        throw GraphErrorException.NotAcceptable('Member does not belong to this team', ErrorCode.OrgTeam.USER_NOT_IN_ORGANIZATION_TEAM);
      }
      if (findMemberInOrgTeam.role === TeamRoles.ADMIN) {
        throw GraphErrorException.NotAcceptable(
          'Can not change permission of manager in team',
          ErrorCode.OrgTeam.CANNOT_CHANGE_PERMISSION_OF_TEAM_MANAGER,
        );
      }
    }
  }

  async getDocumentBelongTo(sharerId: string, documentId: string): Promise<{id: string, isUsingPremium: boolean}> {
    const documentPermissions = await this.getDocumentPermissionsByDocId(documentId);
    const externalPermission = documentPermissions.find((docPer) => docPer.refId.toHexString() === sharerId);
    const internalPermission = documentPermissions.find(
      (docPer) => [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM].includes(docPer.role as DocumentRoleEnum),
    );
    if (externalPermission) {
      const userId = externalPermission.refId.toHexString();
      const user = await this.userService.findUserById(userId);
      return {
        id: userId,
        isUsingPremium: await this.userService.isAvailableUsePremiumFeature(user),
      };
    }
    return this.getInternalDocumentResource(internalPermission);
  }

  public async getInternalDocumentResource(
    internalPermission: IDocumentPermission,
  ): Promise<{id: string, isUsingPremium: boolean}> {
    switch (internalPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        const org = await this.organizationService.getOrgById(internalPermission.refId);
        return this.getResourceWithPaymentStatus(org);
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const orgTeam = await this.teamService.findOne({ _id: internalPermission.refId });
        const org = await this.organizationService.getOrgById(orgTeam.belongsTo as string);
        return this.getResourceWithPaymentStatus(org);
      }
      default: return null;
    }
  }

  getResourceWithPaymentStatus(resource: User|IOrganization):{id: string, isUsingPremium: boolean} {
    const isUsingPremium = resource.payment.type !== PaymentPlanEnums.FREE;
    return { id: resource._id, isUsingPremium };
  }

  public async getUserIdsHavePermission(documentId: string): Promise<string[]> {
    const documentPermissions = await this.getDocumentPermissionsByDocId(documentId);
    const [externalPermissions, internalPermissions] = documentPermissions.reduce(([external, internal], docPer) => {
      if ([DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM].includes(docPer.role as DocumentRoleEnum)) {
        return [external, [...internal, docPer]];
      }
      return [[...external, docPer], internal];
    }, [[], []]);
    const internalMembers = (internalPermissions.length && await this.getInternalMembers(internalPermissions[0] as IDocumentPermission)) || [];
    if (internalMembers.length > 500) {
      this.loggerService.info({
        context: 'countInternalMembers',
        extraInfo: {
          documentId,
          refId: internalPermissions[0].refId,
          count: internalMembers.length,
        },
      });
    }
    const externalUserIds = externalPermissions.map((docPer) => docPer.refId.toHexString());
    return [...internalMembers, ...externalUserIds];
  }

  public async filterCommentersHavePermission(commenterIds: string[], documentId: string): Promise<string[]> {
    const allPermissionUserIds = await this.getUserIdsHavePermission(documentId);
    return commenterIds.filter((id) => allPermissionUserIds.includes(id));
  }

  async getInternalMembers(internalPermission: IDocumentPermission): Promise<string[]> {
    switch (internalPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        const memberships = await this.organizationService.getMembersByOrgId(internalPermission.refId);
        return memberships.map((member) => member.userId.toHexString());
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const memberships = await this.membershipService.find({ teamId: internalPermission.refId });
        return memberships.map((member) => member.userId.toHexString());
      }
      default: return [];
    }
  }

  async updateUserContactWhenShareDocument(sharerId: string, sharedIds: string[]): Promise<UserContact> {
    await Promise.all(
      sharedIds.map((sharedId) => this.userService.updateContactList(sharedId, [sharerId])),
    );
    return this.userService.updateContactList(sharerId, sharedIds);
  }

  async verifyUserToUpdateDocumentPermission(params: {actorId: string, sharedEmail: string, documentId: string}): Promise<FindUserPayload> {
    const { actorId, sharedEmail, documentId } = params;
    const sharedUser = await this.userService.findUserByEmail(sharedEmail);
    const documentPermissions = await this.getDocumentPermissionByConditions({ documentId });

    if (!sharedUser) {
      return {
        email: sharedEmail,
        status: SearchUserStatus.USER_VALID,
      };
    }
    const rootDocPermission = documentPermissions
      .find((docPermission) => ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(docPermission.role as DocumentRoleEnum));
    const { [actorId]: memberRole } = rootDocPermission?.groupPermissions || {};
    if (memberRole && memberRole !== DocumentRoleEnum.SHARER || actorId === sharedUser._id) {
      return {
        ...sharedUser,
        status: SearchUserStatus.USER_UNALLOWED,
      };
    }
    const existedActorDocPermission = documentPermissions
      .find((docPermission) => docPermission.refId.toHexString() === actorId && docPermission.role === DocumentRoleEnum.SHARER);
    const canSharePermissionIds = documentPermissions
      .filter((docPermission) => [DocumentRoleEnum.SHARER, DocumentRoleEnum.OWNER].includes(docPermission.role as DocumentRoleEnum))
      .map(({ refId: userId }) => userId.toHexString());
    const { role, refId } = rootDocPermission || {};
    let userStatus: SearchUserStatus = SearchUserStatus.USER_UNALLOWED;
    switch (role) {
      case DocumentRoleEnum.OWNER: {
        if (refId.toHexString() === actorId) {
          userStatus = SearchUserStatus.USER_VALID;
        } else {
          userStatus = existedActorDocPermission && !canSharePermissionIds.includes(sharedUser._id)
            ? SearchUserStatus.USER_VALID
            : SearchUserStatus.USER_UNALLOWED;
        }
        break;
      }
      case DocumentRoleEnum.ORGANIZATION: {
        userStatus = await this.verifyShareOrgDocument({
          orgId: refId, sharedUser, actorId, canSharePermissionIds, actorDocPermission: existedActorDocPermission,
        });
        break;
      }

      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        userStatus = await this.verifyShareTeamDocument({
          teamId: refId, sharedUser, actorId, canSharePermissionIds, actorDocPermission: existedActorDocPermission,
        });
        break;
      }
      default: break;
    }
    return {
      ...sharedUser,
      status: userStatus,
    };
  }

  async shareDocumentNonLuminUser(params: {
    document: Document, role: string, message: string, nonLuminUserEmails: string[], sharer: User
  }): Promise<void> {
    const {
      document, role, message, nonLuminUserEmails, sharer,
    } = params;
    const { _id: documentId } = document;
    const { _id: sharerId } = sharer;
    const sanitizeMessage = encodeHtml(message);

    await this.createNonLuminShared({
      documentId,
      emails: nonLuminUserEmails,
      role: role.toLowerCase(),
      sharerId,
      message,
    });
    const currentDate = new Date();
    const convertDate = moment(currentDate.toISOString()).utcOffset(
      sharer.timezoneOffset - currentDate.getTimezoneOffset(),
      true,
    );
    const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    nonLuminUserEmails.forEach((email) => {
      const tokenPayload: IUserInvitationToken = {
        metadata: {
          documentId,
        },
        email,
        type: UserInvitationTokenType.SHARE_DOCUMENT,
      };
      const shareToken = this.jwtService.sign(tokenPayload, {
        expiresIn: Number(this.environmentService.getByKey(EnvConstants.SHARE_DOCUMENT_INVITATION_TOKEN_EXPIRE_IN)),
      });
      const returnTo = `${baseUrl}/?token=${shareToken}`;
      const subject = SUBJECT[EMAIL_TYPE.SHARE_DOCUMENT.description]
        .replace('#{userName}', sharer.name)
        .replace('#{documentName}', document.name);
      this.emailService.sendEmail(
        EMAIL_TYPE.SHARE_DOCUMENT_NON_LUMIN,
        [email],
        {
          subject,
          sharerName: sharer.name,
          sharerEmail: sharer.email,
          documentName: document.name,
          sharerAvatar: sharer.avatarRemoteId,
          time: convertDate.utc().format('LLLL'),
          documentId,
          message: sanitizeMessage,
          token: shareToken,
          signUpUrl: `${authUrl}/sign-up/invitation?token=${shareToken}&return_to=${returnTo}&action=share`,
        },
      );
    });
  }

  async verifyShareOrgDocument(params: {
    orgId: string, sharedUser: User, actorId: string, canSharePermissionIds: string[], actorDocPermission: IDocumentPermission
  }): Promise<SearchUserStatus> {
    const {
      orgId, sharedUser, actorId, actorDocPermission, canSharePermissionIds,
    } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const sharedUserMembership = await this.organizationService.getMembershipByOrgAndUser(orgId, sharedUser._id);
    const actorMembership = await this.organizationService.getMembershipByOrgAndUser(orgId, actorId);
    if (actorDocPermission) {
      // Actor is external shared user
      // Can't update permission intenral members and external shared user with can share permission
      return !sharedUserMembership && !canSharePermissionIds.includes(sharedUser._id)
        ? SearchUserStatus.USER_VALID
        : SearchUserStatus.USER_UNALLOWED;
    }
    return this.canEditPermission(actorMembership.role, sharedUserMembership?.role)
      ? SearchUserStatus.USER_VALID
      : SearchUserStatus.USER_UNALLOWED;
  }

  async verifyShareTeamDocument(params: {
    teamId: string, sharedUser: User, actorId: string, canSharePermissionIds: string[], actorDocPermission: IDocumentPermission
  }): Promise<SearchUserStatus> {
    const {
      teamId, sharedUser, actorId, actorDocPermission, canSharePermissionIds,
    } = params;
    const [sharedUserMembership, actorMembership] = await Promise.all([
      this.membershipService.findOne({ teamId, userId: sharedUser._id }),
      this.membershipService.findOne({ teamId, userId: actorId }),
    ]);
    if (actorDocPermission) {
      return !sharedUserMembership && !canSharePermissionIds.includes(sharedUser._id)
        ? SearchUserStatus.USER_VALID
        : SearchUserStatus.USER_UNALLOWED;
    }
    return this.canEditPermission(actorMembership.role, sharedUserMembership?.role)
      ? SearchUserStatus.USER_VALID
      : SearchUserStatus.USER_UNALLOWED;
  }

  canEditPermission(actorRole: string, targetRole: string): boolean {
    const managerRoles = [
      OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR, targetRole === OrganizationTeamRoles.ADMIN,
    ];
    const orgManagerRoles = [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR];
    if (managerRoles.includes(targetRole as OrganizationRoleEnums)) {
      return false;
    }
    return actorRole && !targetRole
      || orgManagerRoles.includes(actorRole as OrganizationRoleEnums) && targetRole === OrganizationRoleEnums.MEMBER
      || actorRole === OrganizationTeamRoles.ADMIN && targetRole === OrganizationTeamRoles.MEMBER;
  }

  async copyDocumentAndThumbnailToS3(document: Document, bucketEnv: string = EnvConstants.S3_DOCUMENTS_BUCKET): Promise<[string, string]> {
    return Promise.all([
      this.copyDocumentToS3(document, bucketEnv),
      document.thumbnail && this.copyThumbnailToS3(document.thumbnail),
    ]);
  }

  async copyDocumentToS3(document: Document, bucketEnv: string = EnvConstants.S3_DOCUMENTS_BUCKET): Promise<string> {
    const {
      mimeType, remoteId,
    } = document;
    const newBucket = this.environmentService.getByKey(bucketEnv);
    const documentBucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const documentRemoteKey = `${uuid()}.${mime.extension(mimeType)}`;
    const remoteDocumentSource = `${documentBucket}/${remoteId}`;
    return this.awsService.copyObjectS3(
      remoteDocumentSource,
      newBucket,
      documentRemoteKey,
      false,
      this.awsService.s3InstanceForDocument(),
    );
  }

  async copyThumbnailToS3(remoteId: string): Promise<string> {
    const thumbnailBucket = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
    const thumbnailRemoteKey = `thumbnails/${uuid()}.${Utils.getExtensionFile(remoteId)}`;
    const remoteThumbnailSource = `${thumbnailBucket}/${remoteId}`;
    return this.awsService.copyObjectS3(
      remoteThumbnailSource,
      thumbnailBucket,
      thumbnailRemoteKey,
    );
  }

  async copyAnnotation(sourceDocId: string, copiedDocId: string) : Promise<IAnnotation[]> {
    const annotations = await this.getAnnotationsOfDocument(sourceDocId);
    return this.addManyAnnotations(
      annotations.map((annotation) => {
        const annotationData = annotation;
        if (annotation.annotationId === sourceDocId) {
          annotationData.annotationId = copiedDocId;
        }
        delete annotationData._id;
        return {
          ...annotationData,
          documentId: copiedDocId,
        };
      }),
    );
  }

  async verifyCopyToDocDestinationPermission(data: {
    destinationType: TypeOfDocument,
    destinationId: string,
    creatorId: string,
  }): Promise<{ isAllowed: boolean, error?: GraphErrorException }> {
    const { destinationType, destinationId, creatorId } = data;
    let error: GraphErrorException;
    switch (destinationType) {
      case TypeOfDocument.ORGANIZATION: {
        const orgMembership = await this.organizationService.getMembershipByOrgAndUser(destinationId, creatorId, { _id: 1 });
        if (!orgMembership) {
          error = GraphErrorException.Forbidden('You don\'t have permission to do this action');
        }
        break;
      }
      case TypeOfDocument.ORGANIZATION_TEAM: {
        const teamMembership = await this.organizationTeamService.getOrgTeamMembershipOfUser(creatorId, destinationId, { _id: 1 });
        if (!teamMembership) {
          error = GraphErrorException.Forbidden('You don\'t have permission to do this action');
        }
        break;
      }
      case TypeOfDocument.PERSONAL: {
        if (creatorId !== destinationId) {
          const orgMembership = await this.organizationService.getMembershipByOrgAndUser(destinationId, creatorId);
          if (!orgMembership) {
            error = GraphErrorException.Forbidden('You don\'t have permission to do this action');
          }
        } else {
          const userData = await this.userService.findUserById(creatorId, null, true);
          if (userData.metadata.isMigratedPersonalDoc) {
            error = GraphErrorException.NotFound('Personal workspace not found');
          }
        }
        break;
      }
      default:
        break;
    }

    if (error) {
      return {
        isAllowed: false,
        error,
      };
    }
    return { isAllowed: true };
  }

  async createLuminDocumentCopy(data: {
    sourceDocument: Document,
    documentName: string,
    destinationId: string,
    destinationType: TypeOfDocument,
    creatorId: string,
    folderId?: string,
  }): Promise<IDocument> {
    const {
      sourceDocument, documentName, destinationId, destinationType, creatorId, folderId,
    } = data;
    const { mimeType, size, manipulationStep } = sourceDocument;
    const [newDocRemoteId, newThumbnailRemoteId] = await this.copyDocumentAndThumbnailToS3(sourceDocument);

    if (!newDocRemoteId) {
      throw GraphErrorException.NotFound('Fail to create copied document in S3');
    }
    const name = `${documentName}.${mime.extension(mimeType)}`;
    const newDocName = await this.getDocumentNameAfterNaming({
      clientId: destinationType === TypeOfDocument.PERSONAL ? creatorId : destinationId,
      fileName: name,
      documentFolderType: destinationType,
      mimetype: mimeType,
      folderId,
    });
    const copiedDocumentData: Document & { service: DocumentStorageEnum, manipulationStep: string, folderId: string } = {
      name: newDocName,
      mimeType,
      size,
      service: DocumentStorageEnum.S3,
      ownerId: creatorId,
      remoteId: newDocRemoteId,
      thumbnail: newThumbnailRemoteId,
      isPersonal: destinationType === TypeOfDocument.PERSONAL,
      lastModifiedBy: creatorId,
      shareSetting: {},
      manipulationStep,
      folderId,
    };

    return this.createDocument(copiedDocumentData);
  }

  async sendCopyDocNotiToMembers(data: {
    destinationId: string,
    destinationType: TypeOfDocument,
    creatorId: string,
    copiedDocument: IDocument,
    notifyUpload: boolean,
  }): Promise<void> {
    const {
      destinationId, destinationType, creatorId, copiedDocument, notifyUpload,
    } = data;
    let notification: NotiInterface = null;
    const creatorInfo = await this.userService.findUserById(creatorId);
    switch (destinationType) {
      case TypeOfDocument.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(destinationId);
        const organization = await this.organizationService.getOrgById(team.belongsTo as string);
        notification = notiDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM, {
          actor: { user: creatorInfo },
          entity: { document: copiedDocument },
          target: { team, organization },
        });
        this.membershipService.publishNotiToAllTeamMember(destinationId, notification, [creatorId]);
        break;
      }

      case TypeOfDocument.ORGANIZATION: {
        if (notifyUpload) {
          const organization = await this.organizationService.getOrgById(destinationId);
          const orgMembers = await this.organizationService.getMembersByOrgId(organization._id, { userId: 1, role: 1 });
          const receiverList = orgMembers.filter(({ userId }) => userId.toHexString() !== creatorId);
          notification = notiDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION, {
            actor: { user: creatorInfo },
            entity: { document: copiedDocument },
            target: { organization },
          });
          const receiveIdList = await this.organizationService.getOrgNotiReceiverIds({
            orgId: destinationId,
            optionalReceivers: receiverList,
          });
          this.notificationService.createUsersNotifications(notification, receiveIdList);

          // send out-app noti for mobile
          const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION, {
            document: copiedDocument,
            actor: creatorInfo,
            organization,
          });
          this.notificationService.publishFirebaseNotifications(receiveIdList, notificationContent, notificationData);
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
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

    return this.documentServiceMobile.createDocumentWithBufferData({
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

  async getOrgStatus(params: {
    clientId: string, clientType: TypeOfDocument, upcomingDocumentsTotal?: number
  }) : Promise<{ isPremium: boolean, isOverDocStack: boolean, orgId?: string }> {
    const { clientId, clientType, upcomingDocumentsTotal = 1 } = params;
    let paymentType: string = PaymentPlanEnums.FREE;
    if (clientType === TypeOfDocument.PERSONAL) {
      const [
        user,
        org,
      ] = await Promise.all([
        this.userService.findUserById(clientId),
        this.organizationService.getOrgById(clientId),
      ]);
      if (user) {
        return {
          isPremium: await this.userService.isAvailableUsePremiumFeature(user),
          isOverDocStack: false,
        };
      }
      if (org) {
        paymentType = org.payment.type;
      }
      return {
        isPremium: paymentType !== PaymentPlanEnums.FREE,
        isOverDocStack: false,
        orgId: org._id,
      };
    }
    let organization;
    if (clientType === TypeOfDocument.ORGANIZATION) {
      organization = await this.organizationService.getOrgById(clientId);
    }
    if (clientType === TypeOfDocument.ORGANIZATION_TEAM) {
      organization = await this.organizationTeamService.getOrgOfTeam(clientId);
    }
    const payment = organization?.payment;
    if (payment) {
      paymentType = payment.type;
    }
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: upcomingDocumentsTotal,
    });
    return {
      isPremium: paymentType !== PaymentPlanEnums.FREE,
      isOverDocStack: !hasRemainingDocStack,
      orgId: organization?._id,
    };
  }

  async duplicateDocument(data: DuplicateDocumentInput &
    {
      creatorId: string,
      file: FileData,
      belongsTo?: string,
      isRequestFromMobile?: boolean,
    }): Promise<IDocument> {
    const {
      file,
      documentId,
      creatorId,
      newDocumentData: {
        destinationId,
        destinationType,
        documentName,
        notifyUpload,
      },
      belongsTo: folderId,
      isRequestFromMobile,
    } = data;

    let copiedDocument: IDocument;
    const [sourceDocument, { isPremium, isOverDocStack, orgId }] = await Promise.all([
      this.getDocumentByDocumentId(documentId),
      this.getOrgStatus({ clientId: destinationId, clientType: destinationType }),
    ]);

    if (isOverDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('Reached document stack', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }

    const fileSize = file ? file.filesize : sourceDocument.size;
    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, [{ size: fileSize }])) {
      if (isPremium) {
        throw GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM);
      }
      throw GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE);
    }
    if (sourceDocument.service === DocumentStorageEnum.S3) {
      copiedDocument = await this.createLuminDocumentCopy({
        sourceDocument: sourceDocument as unknown as Document,
        documentName,
        destinationId,
        destinationType,
        creatorId,
        folderId,
      });
    } else {
      copiedDocument = await this.copyDocumentFromFileBuffer({
        originalDocument: sourceDocument as unknown as Document,
        file,
        creatorId,
        destinationId,
        destinationType,
        documentName,
        folderId,
      });
    }

    let documentPermissionData: Record<string, any>;
    let publishedUserIds: string[];
    let roleOfDocument: string;
    let subscriptionType: string;
    let subscriptionPayload: Record<string, any>;
    switch (destinationType) {
      case TypeOfDocument.PERSONAL:
        documentPermissionData = {
          refId: creatorId,
          role: DocumentRoleEnum.OWNER,
          ...(creatorId !== destinationId && {
            workspace: {
              refId: destinationId,
              type: DocumentWorkspace.ORGANIZATION,
            },
          }),
        };
        publishedUserIds = [creatorId];
        subscriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL;
        roleOfDocument = IndividualRoles.OWNER.toUpperCase();
        break;

      case TypeOfDocument.ORGANIZATION_TEAM: {
        documentPermissionData = {
          refId: destinationId,
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
        };
        const teamMembers = await this.membershipService.find({ teamId: destinationId });
        publishedUserIds = teamMembers.map(({ userId }) => userId);
        subscriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS;
        roleOfDocument = IndividualRoles.SHARER.toUpperCase();
        subscriptionPayload = { teamId: destinationId };
        break;
      }

      case TypeOfDocument.ORGANIZATION: {
        documentPermissionData = {
          refId: destinationId,
          role: DocumentRoleEnum.ORGANIZATION,
        };
        const orgMembers = await this.organizationService.getMembersByOrgId(destinationId, { userId: 1 });
        publishedUserIds = orgMembers.map(({ userId }) => userId.toHexString());
        subscriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION;
        roleOfDocument = IndividualRoles.SHARER.toUpperCase();
        subscriptionPayload = { organizationId: destinationId };
        break;
      }

      default:
        break;
    }
    const [creatorInfo] = await Promise.all([
      this.userService.findUserById(creatorId),
      this.createDocumentPermission({
        ...documentPermissionData,
        documentId: copiedDocument._id,
      }),
      this.copyAnnotation(documentId, copiedDocument._id),
      this.documentOutlineService.copyOutlines(documentId, copiedDocument._id),
      this.copyDocumentImage(documentId, copiedDocument._id),
      this.copyFormFields(documentId, copiedDocument._id),
    ]);

    this.sendCopyDocNotiToMembers({
      destinationId,
      destinationType,
      creatorId,
      copiedDocument,
      notifyUpload,
    });

    const publishedDocument = {
      ...copiedDocument,
      ownerName: creatorInfo.name,
      ownerAvatarRemoteId: creatorInfo.avatarRemoteId,
      roleOfDocument,
      lastAccess: new Date(copiedDocument.lastAccess).getTime(),
      createdAt: new Date(copiedDocument.createdAt).getTime(),
    };

    this.publishUpdateDocument(
      publishedUserIds,
      {
        ...subscriptionPayload,
        document: publishedDocument,
        type: subscriptionType,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );

    if (orgId) { // Duplicate document to organization|team
      await this.addToRecentDocumentList({
        userId: creatorInfo._id,
        organizationId: orgId,
        documents: [copiedDocument],
      });
    }
    return copiedDocument;
  }

  /**
   * This service is used to collate current user ID and client ID
   * @param clientId - passed in request param
   */
  async verifyUserPermissionWithClientId(currentUserId: string, clientId: string): Promise<{
    isAccepted: boolean,
    error?: GraphErrorException,
  }> {
    let error: GraphErrorException;
    if (clientId !== currentUserId) {
      const clientUserInfo = await this.userService.findUserById(clientId);
      if (clientUserInfo) {
        error = GraphErrorException.Forbidden('You don\'t have permission');
      }
      const [teamInfo, userTeamMembership] = await Promise.all([
        this.teamService.findOneById(clientId),
        this.membershipService.findOne({ teamId: clientId, userId: currentUserId }),
      ]);
      if (!teamInfo) {
        error = GraphErrorException.Forbidden('This team does not exist');
      }
      if (!userTeamMembership) {
        error = GraphErrorException.Forbidden('You don\'t have permission');
      }
    }
    if (error) {
      return {
        isAccepted: false,
        error,
      };
    }
    return { isAccepted: true };
  }

  countDocumentsByFolderId(folderId: string): Promise<number> {
    return this.documentModel.countDocuments({ folderId }).exec();
  }

  async createPDfDocumentFromDocumentForm(document): Promise<any> {
    const documentBucket = this.environmentService.getByKey(
      EnvConstants.S3_DOCUMENTS_BUCKET,
    );
    const formBucket = this.environmentService.getByKey(
      EnvConstants.S3_FORMS_BUCKET,
    );
    const formCopySource = `${formBucket}/${document.remoteId}`;
    const keyDocument = `${uuid()}.pdf`;
    const copyFormRemoteId = await this.awsService.copyObjectS3(
      formCopySource,
      documentBucket,
      keyDocument,
      false,
      this.awsService.s3InstanceForDocument(),
    );
    const thumbnailBucket = this.environmentService.getByKey(
      EnvConstants.S3_RESOURCES_BUCKET,
    );
    const thumbnailCopySource = `${formBucket}/${document.thumbnail}`;
    let copyThumbnailRemoteId = '';
    if (document.thumbnail) {
      const keyThumbnail = `thumbnails/${uuid()}.${Utils.getExtensionFile(
        document.thumbnail as string,
      )}`;
      copyThumbnailRemoteId = await this.awsService.copyObjectS3(
        thumbnailCopySource,
        thumbnailBucket,
        keyThumbnail,
      );
    }
    return { copyFormRemoteId, copyThumbnailRemoteId };
  }

  async handleUpdateDocViewerInteraction(userId: string, type: DocViewerInteractionType): Promise<void> {
    let docViewerInteractionRedisField: string;
    let googleModalCounting: number;

    switch (type) {
      case DocViewerInteractionType.TOTAL_OPENED_DOC:
        docViewerInteractionRedisField = RedisConstants.TOTAL_OPENED_DOC_FIELD;
        googleModalCounting = RATING_DISPLAY_CONDITIONS.TOTAL_OPENED_DOC;
        break;
      case DocViewerInteractionType.TOTAL_CREATED_ANNOTATION:
        docViewerInteractionRedisField = RedisConstants.TOTAL_CREATED_ANNOT_FIELD;
        googleModalCounting = RATING_DISPLAY_CONDITIONS.TOTAL_CREATED_ANNOTATION;
        break;
      default:
        break;
    }
    // Get corresponding field in redis hset by type
    const prevDocViewerInteraction = await this.redisService.getDocViewerInteraction(userId);
    const currentTotalValue = Number(prevDocViewerInteraction[docViewerInteractionRedisField] || 0) + 1;
    if (currentTotalValue < googleModalCounting) {
      this.redisService.setDocViewerInteractionValue({
        type,
        userId,
        value: currentTotalValue,
      });
    } else {
      const updatedUserData = await this.userService.updateUserPropertyById(userId, {
        'metadata.rating.googleModalStatus': RatingModalStatus.OPEN,
      });
      this.redisService.removeDocViewerInteraction(userId);
      this.userService.publishUpdateUser({
        user: updatedUserData, type: SUBSCRIPTION_SHOW_RATING_MODAL,
      });
    }
  }

  isMovingSameLocation({
    documentPermission, destinationId, destinationType, actorId,
  }:{
    documentPermission: IDocumentPermission, destinationId: string, destinationType: DestinationType, actorId: string
  }): boolean {
    if (destinationType === DestinationType.PERSONAL) {
      return documentPermission.workspace
        ? documentPermission.workspace.refId.toHexString() === destinationId
        : actorId === destinationId && documentPermission.refId.toHexString() === destinationId;
    }

    return documentPermission.refId.toHexString() === destinationId;
  }

  async isMovingSameResource(
    params: { documentPermission: IDocumentPermission, destinationId: string, destinationType: DestinationType, actorId: string },
  ): Promise<{ isSameResource: boolean, orgId?: string }> {
    const {
      documentPermission, destinationId, destinationType, actorId,
    } = params;
    const orgDestination = destinationType === DestinationType.ORGANIZATION;
    const teamDestination = destinationType === DestinationType.ORGANIZATION_TEAM;
    if (this.isMovingSameLocation({
      documentPermission, destinationId, destinationType, actorId,
    })) {
      const orgId = (documentPermission.role as DocumentRoleEnum) === DocumentRoleEnum.OWNER
        ? documentPermission.workspace?.refId : documentPermission.refId;
      return {
        isSameResource: true,
        orgId,
      };
    }
    switch (documentPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.ORGANIZATION: {
        const orgTeams = await this.organizationTeamService.getOrgTeams(documentPermission.refId);
        const orgTeamIds = orgTeams.map((team) => team._id);
        const isMovingToMyDocumentInOrg = destinationType === DestinationType.PERSONAL && documentPermission.refId.toHexString() === destinationId;
        return {
          isSameResource: teamDestination && orgTeamIds.includes(destinationId) || isMovingToMyDocumentInOrg,
          orgId: documentPermission.refId,
        };
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOne({ _id: documentPermission.refId });
        const teamsInOrg = await this.organizationTeamService.getOrgTeams(team.belongsTo as string);
        const teamIds = teamsInOrg.map((orgTeam) => orgTeam._id);
        const isMovingToOrg = orgDestination && team.belongsTo.toHexString() === destinationId;
        const isMovingToTeamInOrg = teamDestination && teamIds.includes(destinationId);
        const isMovingToMyDocumentInOrg = destinationType === DestinationType.PERSONAL && team.belongsTo.toHexString() === destinationId;
        return {
          isSameResource: isMovingToOrg || isMovingToTeamInOrg || isMovingToMyDocumentInOrg,
          orgId: team.belongsTo,
        };
      }
      case DocumentRoleEnum.OWNER: {
        const workspaceId = documentPermission.workspace?.refId;
        if (workspaceId) {
          const orgTeams = await this.organizationTeamService.getOrgTeams(workspaceId);
          const orgTeamIds = orgTeams.map((team) => team._id);
          const isMovingToOrg = orgDestination && workspaceId.toHexString() === destinationId;
          const isMovingToTeamInOrg = teamDestination && orgTeamIds.includes(destinationId);
          return {
            isSameResource: isMovingToOrg || isMovingToTeamInOrg,
            orgId: workspaceId,
          };
        }
      }
        break;
      default: return { isSameResource: false };
    }

    const team = await this.teamService.findOne({ _id: destinationId });

    return { isSameResource: false, orgId: team?.belongsTo || destinationId };
  }

  async verifyMoveDocuments(
    params: {
      actorId: string,
      documents: IDocument[],
      documentPermission: IDocumentPermission,
      destinationId: string,
      destinationType: DestinationType,
      file?: FileData,
      folderId?: string,
      personalWorkspaceAvailable: boolean,
      isRequestFromMobile?: boolean,
    },
  ): Promise<{ isAllowed: boolean, error?: GraphErrorException, orgId?: string }> {
    const {
      actorId, documents, documentPermission, destinationId, destinationType, folderId, file, personalWorkspaceAvailable, isRequestFromMobile,
    } = params;

    const isMovingToPersonal = destinationType === DestinationType.PERSONAL;
    const isMovingToPersonalWorkspace = isMovingToPersonal && destinationId === actorId && personalWorkspaceAvailable;
    const isMovingToOrgOrTeam = [DestinationType.ORGANIZATION, DestinationType.ORGANIZATION_TEAM].includes(destinationType);
    const shouldVerifyDocSize = isMovingToOrgOrTeam || isMovingToPersonalWorkspace;

    if (shouldVerifyDocSize) {
      const documentsToVerifySize = isMovingToPersonal
        ? this.filterDocumentsForPersonalMove({ documents })
        : await this.filterDocumentsForOrgMove({ documents, destinationId, destinationType });

      const verifySizeData = await this.verifyMoveDocumentsSize({
        documents: documentsToVerifySize,
        destinationId,
        destinationType,
        isRequestFromMobile,
      });

      if (!verifySizeData.isAllowed) {
        return verifySizeData;
      }
    }

    const document = await this.getDocumentByDocumentId(documents[0]._id, { folderId: 1 });

    const isLuminFile = documents[0].service === DocumentStorageEnum.S3;
    const isPersonalDestination = destinationType === DestinationType.PERSONAL;

    if (file) {
      if (documents.length !== 1 || isLuminFile || isPersonalDestination) {
        return {
          isAllowed: false,
          error: GraphErrorException.NotAcceptable('Can not move this file'),
        };
      }
    } else if (!(isLuminFile || isPersonalDestination)) {
      return {
        isAllowed: false,
        error: GraphErrorException.NotAcceptable('Can not move this drive/dropbox file'),
      };
    }

    const isMovingSameLocation = this.isMovingSameLocation({
      documentPermission,
      destinationId,
      destinationType,
      actorId,
    });
    const isMovingFromFolder = Boolean(document.folderId);
    const isMovingToFolder = Boolean(folderId);
    const isMovingSameFolder = isMovingFromFolder && isMovingToFolder && document.folderId.toHexString() === folderId;
    if (isMovingSameLocation && !isMovingFromFolder && !isMovingToFolder || isMovingSameFolder) {
      return {
        isAllowed: false,
        error: GraphErrorException.BadRequest(
          'Can not move documents to this location',
        ),
      };
    }

    const { isSameResource: isMovingSameResource, orgId: ownedOrgId } = await this.isMovingSameResource({
      documentPermission,
      destinationId,
      destinationType,
      actorId,
    });
    const verifiedDestination = await this.verifyMoveDocumentsDestination({
      actorId,
      documentPermission,
      destinationId,
      destinationType,
      isMovingSameResource,
      personalWorkspaceAvailable,
    });
    if (!verifiedDestination) {
      return {
        isAllowed: false,
        error: GraphErrorException.BadRequest('Can not move documents to destination'),
      };
    }

    return { isAllowed: true, orgId: ownedOrgId };
  }

  updateDocumentChunkedStatus(documentId: string, status: DocumentIndexingStatusEnum) {
    return this.documentModel.findOneAndUpdate({ _id: documentId }, { $set: { 'metadata.indexingStatus': status } }, { new: true });
  }

  async moveDocuments(
    params: MoveDocumentsInput & { actorId: string, folderId?: string, file?: FileData, isRequestFromMobile?: boolean, documentName?: string },
  ): Promise< {isSuccess: boolean, isMoveFromPersonal?: boolean, error?: GraphErrorException }> {
    const {
      actorId, documentIds, file, folderId, destinationId, destinationType, isNotify = true, isRequestFromMobile,
      documentName,
    } = params;
    const defaultShareSetting = {
      permission: ShareLinkPermission.VIEWER,
      linkType: ShareLinkType.INVITED,
    };
    const isPersonalDocument = destinationType === DestinationType.PERSONAL;
    const [actor, documentPermissions, documents] = await Promise.all([
      this.userService.findUserById(actorId, null, true),
      this.getDocumentPermissionByConditions({ documentId: { $in: documentIds } }),
      this.findDocumentsByIds(documentIds),
    ]);

    const [[internalDocPermission], externalDocPermissions] = documentPermissions.reduce(([internalPermission, externalPermission], docPer) => {
      if (ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(docPer.role as DocumentRoleEnum)) {
        return [[...internalPermission, docPer], externalPermission];
      }
      return [internalPermission, [...externalPermission, docPer]];
    }, [[], []]);

    const personalWorkspaceAvailable = !actor.metadata.isMigratedPersonalDoc;
    const verifiedMoveDocuments = await this.verifyMoveDocuments({
      file,
      actorId,
      documents,
      documentPermission: internalDocPermission,
      destinationId,
      destinationType,
      folderId,
      personalWorkspaceAvailable,
      isRequestFromMobile,
    });
    if (!verifiedMoveDocuments.isAllowed) {
      return { isSuccess: false, error: verifiedMoveDocuments.error };
    }
    if (file) {
      const {
        fileBuffer: docBuffer, mimetype: docMimetype,
      } = file;
      const docKeyFile = await this.awsService.uploadDocumentWithBuffer(docBuffer, docMimetype);
      const namedDocument = await this.getDocumentNameAfterNaming({
        clientId: destinationId,
        fileName: documentName || file.filename,
        documentFolderType: DocumentOwnerTypeEnum[destinationType],
        mimetype: docMimetype,
        folderId,
      });
      await this.updateDocument(documentIds[0], { name: namedDocument, remoteId: docKeyFile, service: DocumentStorageEnum.S3 });
    } else {
      const writeOperation = await Promise.all(documents.map(async (doc) => {
        const namedDocument = await this.getDocumentNameAfterNaming({
          clientId: destinationId,
          fileName: doc.name,
          documentFolderType: DocumentOwnerTypeEnum[destinationType],
          mimetype: doc.mimeType,
          folderId,
        });
        return {
          updateOne: {
            filter: { _id: new Types.ObjectId(doc._id) },
            update: { $set: { name: namedDocument } },
          },
        };
      }));
      await this.documentModel.bulkWrite(writeOperation);
    }

    const isMovingSameLocation = this.isMovingSameLocation({
      documentPermission: internalDocPermission, destinationId, destinationType, actorId: actor._id,
    });
    const moveToPersonalWorkspace = actor._id === destinationId && personalWorkspaceAvailable;
    if (moveToPersonalWorkspace) {
      await this.updateManyDocumentPermission(
        { documentId: { $in: documentIds } },
        {
          $unset: { workspace: '' },
        },
      );
    }
    if (!isMovingSameLocation) {
      const documentPermissionRefId = destinationType === DestinationType.PERSONAL ? actor._id : destinationId;
      const documentPermissionRole = destinationType === DestinationType.PERSONAL ? DocumentRoleEnum.OWNER : DocumentRoleEnum[destinationType];
      await Promise.all([
        this.updateManyDocumentPermission(
          { documentId: { $in: documentIds } },
          {
            refId: documentPermissionRefId,
            role: documentPermissionRole,
            ...(destinationType === DestinationType.PERSONAL && !moveToPersonalWorkspace && verifiedMoveDocuments.orgId ? {
              workspace: {
                refId: verifiedMoveDocuments.orgId,
                type: DocumentWorkspace.ORGANIZATION,
              },
            } : {
              $unset: { workspace: '' },
            }),
          },
        ),
        this.deleteDocumentPermissions({
          documentId: { $in: documentIds },
          role: { $nin: ORIGINAL_DOCUMENT_PERMISSION_ROLE },
        }),
        this.deleteManyRequestAccess({ documentId: { $in: documentIds } }),
        this.updateManyDocuments(
          { _id: { $in: documentIds } },
          {
            $set: {
              isPersonal: isPersonalDocument,
              listUserStar: [],
              ownerId: actor._id,
              ownerName: actor.name,
              shareSetting: defaultShareSetting,
            },
          },
        ),
      ]);
    }
    await this.updateManyDocuments({ _id: { $in: documentIds } }, {
      ...(folderId ? { folderId } : { $unset: { folderId: '' } }),
      lastAccess: String(Date.now()),
    });
    if ((isNotify || destinationType !== DestinationType.ORGANIZATION) && !isMovingSameLocation) {
      this.pubishMoveDocumentsNotification({
        actor,
        documentIds,
        destinationId,
        destinationType,
      });
    }
    this.publishMoveDocumentsSubscription({
      actor,
      documents: documents as unknown as Document[],
      destinationId,
      destinationType,
      internalDocPermission,
      externalSharedIds: externalDocPermissions
        .filter((docPer) => docPer.refId && typeof docPer.refId.toHexString === 'function')
        .map((docPer) => docPer.refId.toHexString()),
      folderId,
      isMovingSameLocation,
    });
    await this.updateRecentDocumentsAfterMove({
      moveToPersonalWorkspace,
      documentIds,
      actorId,
      orgId: verifiedMoveDocuments.orgId,
    });
    this.emitSocketUpdateDocumentPermission(documentIds);
    return { isSuccess: true, isMoveFromPersonal: internalDocPermission?.role === DocumentRoleEnum.OWNER };
  }

  async pubishMoveDocumentsNotification(
    params: {actor: User, documentIds: string[], destinationId: string, destinationType: DestinationType},
  ): Promise<void> {
    const {
      actor, documentIds, destinationId, destinationType,
    } = params;
    let documentData;
    if (documentIds.length === 1) {
      documentData = await this.getDocumentByDocumentId(documentIds[0]);
    }
    const createNotificationData = (notiType: number, target: any) => notiDocumentFactory.create(notiType, {
      actor: { user: actor },
      entity: {
        document: documentIds.length > 1 ? { name: String(documentIds.length) } : documentData,
        entityData: { multipleDocument: documentIds.length > 1 },
      },
      target,
    });
    switch (destinationType) {
      case DestinationType.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(destinationId);
        const notificationData = createNotificationData(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION, { organization });
        this.organizationService.publishNotiToAllOrgMember({
          orgId: destinationId, notification: notificationData, requiredReceiverIds: [], excludedIds: [actor._id],
        });
        // send out-app noti for mobile
        const isMultiple = documentIds.length > 1;
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION, {
          organization,
          actor,
          totalDocuments: documentIds.length,
          isMultipleDocs: isMultiple,
        });

        this.organizationService.publishFirebaseNotiToAllOrgMember({
          orgId: organization._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludedIds: [actor._id],
        });

        break;
      }
      case DestinationType.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOne({ _id: destinationId });
        const organization = await this.organizationService.getOrgById(team.belongsTo as string);
        const notificationData = createNotificationData(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM, { organization, team });
        this.membershipService.publishNotiToAllTeamMember(destinationId, notificationData, [actor._id]);
        // send out-app noti for mobile
        const isMultiple = documentIds.length > 1;
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM, {
          actor,
          document: documentData,
          isMultipleDocs: isMultiple,
          team,
          organization,
          totalDocuments: documentIds.length,
        });
        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: team._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [actor._id],
        });
        break;
      }
      default: break;
    }
  }

  async publishMoveDocumentsSubscription(
    params: {
      actor: User,
      documents: Document[],
      destinationId: string,
      destinationType: string,
      internalDocPermission: IDocumentPermission,
      externalSharedIds: string[]
      folderId: string,
      isMovingSameLocation: boolean,
    },
  ): Promise<void> {
    const {
      actor, documents, destinationId, destinationType, internalDocPermission, externalSharedIds, isMovingSameLocation,
    } = params;
    const payload = {};
    const receiverIds = [];
    switch (destinationType) {
      case DestinationType.PERSONAL: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
        });
        receiverIds.push(actor._id);
        break;
      }
      case DestinationType.ORGANIZATION: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
          organizationId: destinationId,
        });
        const orgMembers = await this.organizationService.getMembersByOrgId(destinationId, { userId: 1 });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        receiverIds.push(...orgMembers.map((member) => member.userId.toHexString()));
        break;
      }
      case DestinationType.ORGANIZATION_TEAM: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
          teamId: destinationId,
        });
        const teamMembers = await this.membershipService.find({ teamId: destinationId }, { userId: 1 });
        receiverIds.push(...teamMembers.map((member) => member.userId.toHexString()));
        break;
      }
      default: break;
    }

    const documentIds = documents.map((doc) => doc._id);
    const updatedDocuments = await this.findDocumentsByIds(documentIds);
    updatedDocuments.forEach((document) => {
      const publishedDocument = {
        ...document,
        lastAccess: new Date(document.lastAccess).getTime(),
        createdAt: new Date(document.createdAt).getTime(),
      };
      Object.assign(payload, { document: publishedDocument, additionalSettings: { keepInSearch: true } });
      this.publishUpdateDocument(
        receiverIds,
        payload,
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
      );
    });
    this.publishRemoveDocumentWhenMoving({
      actor,
      documents,
      internalDocPermission,
      externalSharedIds,
      isMovingSameLocation,
    });
  }

  async publishRemoveDocumentWhenMoving(
    params: {
      actor: User,
      documents: Document[],
      internalDocPermission: IDocumentPermission,
      externalSharedIds: string[],
      isMovingSameLocation: boolean,
    },
  ): Promise<void> {
    const {
      actor, documents, internalDocPermission, externalSharedIds, isMovingSameLocation,
    } = params;
    const { refId: clientId, role: documentRole } = internalDocPermission;
    switch (documentRole as DocumentRoleEnum) {
      case DocumentRoleEnum.ORGANIZATION:
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const members = await this.getInternalMembers(internalDocPermission);
        this.publishEventDeleteDocumentToInternal({
          documents,
          clientId,
          roleOfDocument: documentRole as DocumentRoleEnum,
          allMember: members,
        }, {
          additionalSettings: {
            keepInSearch: isMovingSameLocation,
          },
        });
        break;
      }
      case DocumentRoleEnum.OWNER: {
        this.publishEventDeleteDocumentToInvididual(documents, [actor._id], {
          keepInSearch: isMovingSameLocation,
        });
        break;
      }
      default: break;
    }
    if (!isMovingSameLocation) {
      this.publishEventDeleteDocumentToExternal(documents, externalSharedIds);
    }
  }

  async verifyMoveDocumentsDestination(
    params: {
      actorId: string,
      documentPermission: IDocumentPermission,
      destinationId: string,
      destinationType: DestinationType,
      isMovingSameResource: boolean,
      personalWorkspaceAvailable: boolean,
    },
  ): Promise<boolean> {
    const {
      actorId, documentPermission, destinationId, destinationType, isMovingSameResource, personalWorkspaceAvailable,
    } = params;
    if (isMovingSameResource) {
      return true;
    }
    if (documentPermission.role === DocumentRoleEnum.OWNER) {
      return this.verifyOwnerMoveDocument({
        actorId, destinationId, destinationType, personalWorkspaceAvailable, documentPermission,
      });
    }

    return destinationType === DestinationType.PERSONAL && destinationId === actorId && personalWorkspaceAvailable;
  }

  async verifyOwnerMoveDocument(params: {
    actorId: string,
    destinationId: string,
    destinationType: DestinationType,
    personalWorkspaceAvailable: boolean,
    documentPermission: IDocumentPermission,
   }): Promise<boolean> {
    const {
      actorId, destinationId, destinationType, personalWorkspaceAvailable, documentPermission,
    } = params;

    const isMovingToPersonalWorkspace = destinationType === DestinationType.PERSONAL && actorId === destinationId;
    if (isMovingToPersonalWorkspace) {
      return personalWorkspaceAvailable;
    }

    const isMovingFromPersonalWorkspace = !documentPermission.workspace;
    if (isMovingFromPersonalWorkspace) {
      switch (destinationType) {
        case DestinationType.PERSONAL: {
          const [orgMembership, teamMembership] = await Promise.all([
            this.organizationService.getMembershipByOrgAndUser(destinationId, actorId),
            this.organizationTeamService.getOrgTeamMembershipOfUser(actorId, destinationId),
          ]);
          return Boolean(orgMembership) || Boolean(teamMembership);
        }
        case DestinationType.ORGANIZATION: {
          const membership = await this.organizationService.getMembershipByOrgAndUser(destinationId, actorId);
          return Boolean(membership);
        }
        case DestinationType.ORGANIZATION_TEAM: {
          const membership = await this.organizationTeamService.getOrgTeamMembershipOfUser(actorId, destinationId);
          return Boolean(membership);
        }
        default: return false;
      }
    }

    return false;
  }

  filterDocumentsForPersonalMove({ documents }: { documents: IDocument[] }): IDocument[] {
    const thirdPartyStorages = [
      DocumentStorageEnum.DROPBOX,
      DocumentStorageEnum.GOOGLE,
      DocumentStorageEnum.ONEDRIVE,
    ] as string[];

    return documents.filter(
      (document) => !thirdPartyStorages.includes(document.service),
    );
  }

  async filterDocumentsForOrgMove({
    documents,
    destinationId,
    destinationType,
  }:{
    documents: IDocument[],
    destinationId: string,
    destinationType: DestinationType,
  }): Promise<IDocument[]> {
    let organizationId = destinationId;
    if (destinationType === DestinationType.ORGANIZATION_TEAM) {
      const organization = await this.organizationTeamService.getOrgOfTeam(destinationId);
      organizationId = organization._id;
    }
    const orgDocStacks = await this.organizationDocStackService.getDocStackByOrgId(organizationId);
    const documentIds = orgDocStacks.map((docstack) => docstack.documentId.toString());

    return documents.filter((document) => !documentIds.includes(document._id.toString()));
  }

  async verifyMoveDocumentsSize(
    params: { documents: IDocument[], destinationId: string, destinationType: DestinationType, isRequestFromMobile?: boolean },
  ): Promise<{isAllowed: boolean, error?: GraphErrorException}> {
    const {
      documents, destinationId, destinationType, isRequestFromMobile,
    } = params;
    const { isPremium, isOverDocStack } = await this.getOrgStatus({
      clientId: destinationId, clientType: TypeOfDocument[destinationType], upcomingDocumentsTotal: documents.length,
    });
    if (isOverDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('Reached document stack', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
    const isExceededSizeLimit = !this.rateLimiterService.verifyUploadFilesSize(isPremium, documents);
    if (isExceededSizeLimit) {
      return {
        isAllowed: false,
        error: isPremium
          ? GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM)
          : GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE),
      };
    }
    return { isAllowed: true };
  }

  async getPremiumDocumentMapping(documentPermission: IDocumentPermission): Promise<boolean> {
    const isUsingPremium = (payment) => payment.type !== PaymentPlanEnums.FREE;
    switch (documentPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.OWNER: {
        if (documentPermission.workspace?.type === DocumentWorkspace.ORGANIZATION) {
          const organization = await this.organizationService.getOrgById(documentPermission.workspace.refId);
          return !(organization && isUsingPremium(organization.payment));
        }
        const user = await this.userService.findUserById(documentPermission.refId);
        return !(user && isUsingPremium(user.payment));
      }
      case DocumentRoleEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(documentPermission.refId);
        return !(organization && isUsingPremium(organization.payment));
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(documentPermission.refId, { belongsTo: 1 });
        const organization = await this.organizationService.getOrgById(team.belongsTo as string);
        return !(organization && isUsingPremium(organization.payment));
      }
      default: break;
    }
    return false;
  }

  generateDocumentCursor(documents: Partial<IDocument>[]): string {
    if (!documents.length) {
      return '';
    }
    const { lastAccess, _id: documentId } = documents[documents.length - 1];
    return `${documentId}:${(new Date(lastAccess)).getTime()}`;
  }

  splitDocumentCursor(cursor: string): {documentIdCursor: string, lastAccessCursor: string} {
    const [documentIdCursor, lastAccessCursor] = cursor.split(':');
    return {
      documentIdCursor,
      lastAccessCursor,
    };
  }

  async getDocumentsUrl(organization: IOrganization, user: User): Promise<string> {
    if (!organization) {
      return '/documents/personal';
    }
    const lastAccessOrgUrl = await this.userService.getLastAccessedOrg(user._id);
    if (lastAccessOrgUrl) {
      return `/${ORG_URL_SEGEMENT}/${lastAccessOrgUrl}/documents/personal`;
    }
    return `/${ORG_URL_SEGEMENT}/${organization.url}/documents/personal`;
  }

  async createThirdPartyDocuments(
    user: User,
    input: CreateDocumentsInput,
    organization?: IOrganization,
    thirdPartyAccessToken?: string,
  ): Promise<{ documents?: Document[], error?: GraphErrorException }> {
    const {
      documents, clientId, folderId,
    } = input;
    if (!SUPPORTED_MIME_TYPE.includes(documents[0].mimeType)) {
      return {
        error: GraphErrorException.NotAcceptable(
          `MimeType must be in ${SUPPORTED_MIME_TYPE.join(', ')}`,
          ErrorCode.Common.INVALID_INPUT,
          { url: await this.getDocumentsUrl(organization, user) },
        ),
      };
    }
    // check the folder is belonged to My document in org workspace.
    if (folderId) {
      const [{ workspace }] = await this.folderService.getFolderPermissions({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        refId: new Types.ObjectId(user._id),
        folderId: new Types.ObjectId(folderId),
        role: FolderRoleEnum.OWNER,
      });
      const folderWorkspaceId = workspace && workspace.refId.toHexString();
      if (organization && folderWorkspaceId !== organization._id) {
        return { error: GraphErrorException.Forbidden('The folder is not associated with that organization.') };
      }
      if (!organization && workspace) {
        return { error: GraphErrorException.Forbidden('Reupload documents to a personal folder in organization without orgId is forbidden.') };
      }
    }
    const remoteIds = documents.map((document) => document.remoteId);
    const existingDocuments = await this.getDocumentByRemoteIds({ remoteIds, clientId });
    const insertDocuments = documents
      .filter((document) => existingDocuments.every((_doc) => _doc.remoteId !== document.remoteId))
      .map((document) => ({
        ...document,
        lastModifiedBy: user._id,
        ownerId: user._id,
        shareSetting: {},
        isPersonal: true,
        ...(folderId && { folderId }),
      }));

    const results: Document[] = [];

    // handle upload new 3rd documents
    if (insertDocuments.length) {
      const { error, documents: newDocuments } = await this.handleUploadThirdPartyDocuments({
        user,
        clientId,
        folderId,
        insertDocuments,
        organization,
        thirdPartyAccessToken,
      });
      if (error) return { error };
      results.push(...newDocuments);
    }

    // handle reupload 3rd documents
    let uploadError = null;
    const getRemoteEmail = (remoteId) => documents.find((document) => document.remoteId === remoteId)?.remoteEmail;
    if (existingDocuments.length) {
      const existedDocuments = existingDocuments.map((doc) => {
        const remoteEmail = getRemoteEmail(doc.remoteId);
        return { ...doc, ...(remoteEmail && { remoteEmail }) };
      });
      const { error, documents: reuploadedDocuments } = await this.handleReuploadThirdPartyDocuments({
        user,
        documents: existedDocuments,
        folderId,
        organization,
        uploadDocuments: documents as unknown as Document[],
        documentsResult: results,
      });
      if (error && !reuploadedDocuments.length) return { error };
      if (error) {
        uploadError = error;
      }
      results.unshift(...reuploadedDocuments);
    }

    await this.updateRecentDocumentsForThirdParty({
      organization,
      existingDocuments,
      userId: user._id,
      newDocuments: results as IDocument[],
    });

    return {
      documents: results,
      error: uploadError,
    };
  }

  async handleUploadThirdPartyDocuments({
    user,
    clientId,
    folderId,
    insertDocuments,
    organization,
    thirdPartyAccessToken,
  } : {
      user: User,
      clientId: string,
      folderId: string,
      insertDocuments: DocumentInput[],
      organization?: IOrganization,
      thirdPartyAccessToken?: string,
    }): Promise<{ error?: ApplicationError, documents?: Document[] }> {
    const createdDocuments = await this.createDocuments(
      insertDocuments,
    );
    if (!createdDocuments.length) {
      return {
        error: ServerErrorException.BadRequest('Create documents error', ErrorCode.Document.CREATE_DOCUMENT_FAIL),
      };
    }
    if (thirdPartyAccessToken) {
      this.redisService.setThirdPartyAccessTokenForIndexing(user._id, thirdPartyAccessToken);
    }
    const documentPermissions = createdDocuments.map((document) => ({
      documentId: document._id,
      refId: clientId,
      role: DocumentRoleEnum.OWNER,
      ...(Boolean(organization) && {
        workspace: {
          refId: organization._id,
          type: DocumentWorkspace.ORGANIZATION,
        },
      }),
    }));
    const createdDocumentPermissions = await this.createDocumentPermissions(
      documentPermissions,
    );
    if (!createdDocumentPermissions.length) {
      return {
        error: ServerErrorException.BadRequest('Create document permission error', ErrorCode.Document.CREATE_DOCUMENT_FAIL),
      };
    }
    createdDocuments.forEach((document) => {
      const documentPublish = {
        ...document,
        ownerName: user.name,
        ownerAvatarRemoteId: user.avatarRemoteId,
        roleOfDocument: DocumentRoleEnum.OWNER.toUpperCase(),
        folderId,
        lastAccess: Date.now(),
      };
      this.publishUpdateDocument(
        [user._id],
        {
          document: documentPublish,
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
        },
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
      );

      this.eventService.createEvent({
        eventName: DocumentEventNames.DOCUMENT_UPLOADED,
        actor: user,
        eventScope: EventScopes.PERSONAL,
        document: document as unknown as Document,
      });
    });

    return {
      documents: createdDocuments as unknown as Document[],
    };
  }

  async handleReuploadThirdPartyDocuments({
    user,
    documents,
    folderId,
    organization,
    uploadDocuments,
    documentsResult,
  } : {
    user: User,
    documents: Document[],
    folderId: string,
    organization?: IOrganization,
    uploadDocuments: Document[],
    documentsResult: Document[],
  }): Promise<{ error?: GraphErrorException, documents?: Document[] }> {
    const filterValidDocuments = differenceWith(
      documents,
      uploadDocuments,
      (origin, peer) => origin.remoteId === peer.remoteId && origin.service !== peer.service,
    );

    // 10 documents => check document permission of 10 document.
    const existingDocumentIds = documents.map((document) => document._id);

    /**
     * If upload same place => update lastAccess,
     * Otherwise, update folderId and workspace.refId
     */

    // Get all owner document permissions of that documents.
    const permissions = await this.getDocumentPermissionByConditions({
      documentId: { $in: existingDocumentIds },
      role: DocumentRoleEnum.OWNER,
      refId: user._id,
    }, { workspace: 1, documentId: 1 });

    const permissionMap = keyBy(permissions, 'documentId');
    const orgId = organization?._id;

    const samePlaceDocuments = documents.filter((_doc) => {
      if (!permissionMap[_doc._id]) {
        this.loggerService.debug('Document permission not found', {
          context: 'handleReuploadThirdPartyDocuments',
          extraInfo: {
            documentsResult,
            uploadDocuments,
            existingDocumentIds,
            permissionMap,
            permissions,
            documents,
            documentId: _doc._id,
            userId: user._id,
            orgId,
          },
        });
      }
      const workspace = permissionMap[_doc._id]?.workspace;
      const workspaceId = workspace?.refId && workspace.refId.toHexString();
      const docFolderId: string = _doc.folderId && _doc.folderId.toHexString();

      const isSameFolder = (!_doc.folderId && !folderId) || (docFolderId === folderId);
      const isSameWorkspace = (!workspaceId && !organization) || (workspaceId === orgId);
      return isSameWorkspace && isSameFolder;
    });

    const publishUploadSubscription = (_documents: Document[]) => {
      _documents.forEach((_doc) => {
        const documentPublish = {
          ..._doc,
          ownerName: user.name,
          ownerAvatarRemoteId: user.avatarRemoteId,
          roleOfDocument: DocumentRoleEnum.OWNER.toUpperCase(),
          folderId,
          lastAccess: Date.now(),
        };
        this.publishUpdateDocument(
          [user._id],
          {
            document: documentPublish,
            type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
          },
          SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
        );
      });
    };

    if (samePlaceDocuments.length) {
      const samePlaceDocumentIds = samePlaceDocuments.map((_doc) => _doc._id);
      await this.updateDocumentByIds(samePlaceDocumentIds, {
        lastAccess: Date.now(),
      });
      await Promise.all(samePlaceDocuments.map(async ({ _id, remoteEmail }) => this.updateDocumentByIds([_id], { remoteEmail })));
      this.publishEventDeleteDocumentToInvididual(samePlaceDocuments, [user._id], {
        keepInSearch: true,
      });
      publishUploadSubscription(samePlaceDocuments);
    }

    const reuploadDocuments = differenceWith(
      documents,
      samePlaceDocuments,
      (origin, peer) => origin._id === peer._id,
    );

    const originalDocuments = cloneDeep(reuploadDocuments);

    if (reuploadDocuments.length) {
      const reuploadDocumentIds = [];
      reuploadDocuments.forEach((_doc) => {
        _doc.folderId = folderId;
        reuploadDocumentIds.push(_doc._id);
      });
      const updateDocumentsObj: any = {
        $set: {
          lastAccess: Date.now(),
        },
      };
      if (folderId) {
        Object.assign(updateDocumentsObj, {
          folderId: new Types.ObjectId(folderId),
        });
      } else {
        Object.assign(updateDocumentsObj, {
          $unset: { folderId: 1 },
        });
      }

      const updatePermissionsObj: any = {};

      if (orgId) {
        Object.assign(updatePermissionsObj, {
          workspace: {
            type: DocumentWorkspace.ORGANIZATION,
            refId: new Types.ObjectId(orgId),
          },
        });
      } else {
        Object.assign(updatePermissionsObj, {
          $unset: {
            workspace: 1,
          },
        });
      }

      await Promise.all([
        this.updateDocumentByIds(reuploadDocumentIds, updateDocumentsObj),
        this.updateManyDocumentPermission({
          documentId: { $in: reuploadDocumentIds },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          refId: new Types.ObjectId(user._id),
          role: DocumentRoleEnum.OWNER,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        }, updatePermissionsObj),
      ]);
      await Promise.all(reuploadDocuments.map(async ({ _id, remoteEmail }) => this.updateDocumentByIds([_id], { remoteEmail })));

      this.publishEventDeleteDocumentToInvididual(originalDocuments, [user._id], {
        keepInSearch: false,
      });
      publishUploadSubscription(reuploadDocuments);
    }

    return {
      documents: [].concat(samePlaceDocuments, reuploadDocuments),
      error: filterValidDocuments.length !== documents.length
        && GraphErrorException.NotAcceptable('Some documents have wrong service', ErrorCode.Document.UPLOAD_DOCUMENT_FAIL),
    };
  }

  async getBelongsTo(document: Document): Promise<BelongsTo> {
    if (document.isPersonal) {
      const [location, [docPerm]] = await Promise.all([
        this.userService.findUserById(document.ownerId, { _id: 1, name: 1 }),
        this.getDocumentPermissionByConditions({
          documentId: document._id,
          role: DocumentRoleEnum.OWNER,
        }),
      ]);
      return {
        type: LocationType.PERSONAL,
        location,
        workspaceId: docPerm?.workspace?.refId,
      };
    }
    const [documentPermission] = await this.getDocumentPermissionByConditions({
      documentId: document._id, role: { $in: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] },
    });
    const { role, refId } = documentPermission;
    switch (role) {
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(refId, {
          _id: 1,
          name: 1,
          belongsTo: 1,
          avatarRemoteId: 1,
        });
        const org = await this.organizationService.getOrgById(team.belongsTo as string, { _id: 1, url: 1 });
        return {
          type: LocationType.ORGANIZATION_TEAM,
          location: {
            _id: team._id,
            name: team.name,
            url: org?.url,
            ownedOrgId: org?._id,
            avatarRemoteId: team.avatarRemoteId,
          },
        };
      }
      case DocumentRoleEnum.ORGANIZATION:
        return {
          type: LocationType.ORGANIZATION,
          location: {
            ...await this.organizationService.getOrgById(refId, {
              _id: 1,
              name: 1,
              url: 1,
              avatarRemoteId: 1,
            }),
            _id: refId,
          },
        };
      default: return null;
    }
  }

  getOrgMemberDocumentPermission(params: {
    documentPermission: IDocumentPermission, role: OrganizationRoleEnums, userId: string, documentOwnerId: string
  }): DocumentPermissionOfMemberEnum {
    const {
      documentPermission, role, userId, documentOwnerId,
    } = params;
    const isOrgManager = [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN].includes(role);
    const isOrgMember = role === OrganizationRoleEnums.MEMBER;
    const isDocumentOwner = documentOwnerId.toString() === userId?.toString();
    return isOrgManager && DocumentPermissionOfMemberEnum.SHARER
    || isDocumentOwner && DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION
    || documentPermission?.groupPermissions?.[userId]
    || isOrgMember && documentPermission?.defaultPermission?.member
    || DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION;
  }

  getTeamMemberDocumentPermission(params: {
    documentPermission: IDocumentPermission, role: OrganizationTeamRoles, userId: string, documentOwnerId: string
  }): DocumentPermissionOfMemberEnum {
    const {
      documentPermission, role, userId, documentOwnerId,
    } = params;
    const isDocumentOwner = documentOwnerId.toString() === userId?.toString();
    const isTeamAdmin = role === OrganizationTeamRoles.ADMIN;
    const isTeamMember = role === OrganizationTeamRoles.MEMBER;
    return isTeamAdmin && DocumentPermissionOfMemberEnum.SHARER
      || isDocumentOwner && DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION
      || documentPermission.groupPermissions?.[userId]
      || isTeamMember && documentPermission.defaultPermission?.member
      || DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION;
  }

  async broadcastUploadDocument({
    document,
    location,
    receiverId,
  }: { document: Partial<IDocument>, location: DocumentOwnerTypeEnum, receiverId: string }) : Promise<void> {
    const publishedDocument = {
      ...document,
      lastAccess: new Date(document.lastAccess).getTime(),
      createdAt: new Date(document.createdAt).getTime(),
    };
    let receiverIds = [];
    const payload = {
      document: publishedDocument,
    };
    switch (location) {
      case DocumentOwnerTypeEnum.PERSONAL: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
        });
        receiverIds = [receiverId];
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
          organizationId: receiverId,
        });
        const orgMembers = await this.organizationService.getMembersByOrgId(receiverId, { userId: 1 });
        receiverIds = orgMembers.map((member) => member.userId.toHexString());
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM: {
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
          teamId: receiverId,
        });
        const teamMembers = await this.membershipService.find({ teamId: receiverId }, { userId: 1 });
        receiverIds = teamMembers.map((member) => member.userId.toHexString());
        break;
      }
      default:
    }
    this.publishUpdateDocument(
      receiverIds,
      payload,
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );
  }

  async getMemberDocumentRole(params: {documentPermission: IDocumentPermission, userId: string, document: Document}): Promise<string> {
    const { documentPermission, userId, document } = params;
    switch (documentPermission.role) {
      case DocumentRoleEnum.OWNER:
        if (documentPermission.refId.toHexString() === userId) {
          return documentPermission.role.toUpperCase();
        }
        break;
      case DocumentRoleEnum.ORGANIZATION:
        {
          const orgMembership = await this.organizationService.getMembershipByOrgAndUser(
            documentPermission.refId,
            userId,
          );
          if (orgMembership) {
            return this.getOrgMemberDocumentPermission({
              documentPermission, role: orgMembership.role as OrganizationRoleEnums, userId, documentOwnerId: document.ownerId,
            });
          }
        }
        break;
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const teamMembership = await this.membershipService.findOne({ userId, teamId: documentPermission.refId });
        if (teamMembership) {
          return this.getTeamMemberDocumentPermission({
            documentPermission, role: teamMembership.role as OrganizationTeamRoles, userId, documentOwnerId: document.ownerId,
          });
        }
        break;
      }
      default:
        break;
    }
    return '';
  }

  async checkExistedDocPermission(userId: string, document: Document): Promise<Omit<IShareDocumentInvitation, '_id' | 'email'>> {
    const { _id: documentId, ownerId } = document;
    const [externalPermission] = await this.getDocumentPermissionsByDocId(documentId, { refId: userId });
    if (externalPermission) {
      return {
        hasPermission: true,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        role: externalPermission.role as DocumentRoleEnum,
        refId: externalPermission.refId,
      };
    }
    const [internalPermission] = await this.getDocumentPermissionsByDocId(documentId, { role: { $in: INTERNAL_DOCUMENT_PERMISSION_ROLE } });
    if (!internalPermission) {
      return {
        hasPermission: false,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        role: null,
        refId: null,
      };
    }
    let membership;
    let permissionType: DocumentOwnerTypeEnum;
    let documentRole;
    switch (internalPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        membership = await this.organizationService.getMembershipByOrgAndUser(internalPermission.refId, userId);
        permissionType = DocumentOwnerTypeEnum.ORGANIZATION;
        documentRole = membership && this.getOrgMemberDocumentPermission({
          documentPermission: internalPermission,
          role: membership.role,
          userId,
          documentOwnerId: ownerId,
        });
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        membership = await this.membershipService.findOne({ teamId: internalPermission.refId, userId });
        permissionType = DocumentOwnerTypeEnum.ORGANIZATION_TEAM;
        documentRole = membership && this.getTeamMemberDocumentPermission({
          documentPermission: internalPermission,
          role: membership.role,
          userId,
          documentOwnerId: ownerId,
        });
        break;
      }
      default: {
        break;
      }
    }
    return {
      hasPermission: Boolean(membership),
      permissionType: membership ? permissionType : DocumentOwnerTypeEnum.PERSONAL,
      membershipRole: membership && membership.role,
      role: documentRole,
      refId: internalPermission.refId,
    };
  }

  public validateRequestAccessDocument(
    params: { userId: string, document: Document, requestRole: DocumentRoleEnum, existedDocPermission: Record<string, any> },
  ): { error: GraphqlException } {
    const {
      document, requestRole, existedDocPermission,
    } = params;
    if (!document) {
      return {
        error: GraphErrorException.NotFound('Document not found'),
      };
    }
    if (!existedDocPermission.role && requestRole !== DocumentRoleEnum.SPECTATOR
      && (document.shareSetting.linkType
        && document.shareSetting.linkType as unknown as ShareSettingLinkTypeEnum !== ShareSettingLinkTypeEnum.ANYONE
      )) {
      return {
        error: GraphErrorException.NotAcceptable('You need to have spectator permission before requesting this permission'),
      };
    }
    if (existedDocPermission.role && PRIORITY_ROLE[existedDocPermission.role] <= PRIORITY_ROLE[requestRole]) {
      return {
        error: GraphErrorException.BadRequest('Cannot request equal or lower than current permission'),
      };
    }

    return {
      error: null,
    };
  }

  public async createUserStartedDocument(userId: string, isMobile: boolean = false): Promise<{
    document?: Document,
    error?: GraphqlException,
  }> {
    const isUserCreatedDocument = await this.getDocumentPermission(userId, { role: DocumentRoleEnum.OWNER });
    if (isUserCreatedDocument.length) {
      return {
        error: GraphErrorException.BadRequest('User has already created document'),
      };
    }
    const startedDocument = await this.generateStartedDocument({
      userId, refId: userId, type: DocumentOwnerTypeEnum.PERSONAL, isMobile,
    });
    return {
      document: startedDocument as unknown as Document,
    };
  }

  public async createOrgStartedDocument(userId: string, orgId: string, isMobile: boolean = false): Promise<{
    document?: Document,
    error?: GraphqlException,
  }> {
    const organizationDocuments = await this.getDocumentPermission(orgId, { role: DocumentRoleEnum.ORGANIZATION });
    if (organizationDocuments.length) {
      return {
        error: GraphErrorException.BadRequest('User has already created organization document'),
      };
    }
    const startedDocument = await this.generateStartedDocument({
      userId, refId: orgId, type: DocumentOwnerTypeEnum.ORGANIZATION, isMobile,
    });
    return {
      document: startedDocument as unknown as Document,
    };
  }

  private async generateStartedDocument({
    userId, type, refId, isMobile,
  } : { userId: string, type: DocumentOwnerTypeEnum, refId: string, isMobile: boolean }) {
    const startedDocumentRemoteId = isMobile
      ? this.environmentService.getByKey(EnvConstants.MOBILE_STARTED_DOCUMENT_REMOTE_ID)
      : this.environmentService.getByKey(EnvConstants.STARTED_DOCUMENT_REMOTE_ID);
    const thumbnailStartedDocumentRemoteId = isMobile
      ? this.environmentService.getByKey(EnvConstants.THUMBNAIL_MOBILE_STARTED_DOCUMENT_REMOTE_ID)
      : this.environmentService.getByKey(EnvConstants.THUMBNAIL_STARTED_DOCUMENT_REMOTE_ID);
    const {
      copyFormRemoteId,
      copyThumbnailRemoteId,
    } = await this.createPDfDocumentFromDocumentForm({
      remoteId: `${startedDocumentRemoteId}.pdf`,
      thumbnail: `thumbnails/${thumbnailStartedDocumentRemoteId}.jpg`,
    });
    const documentData = {
      remoteId: copyFormRemoteId,
      mimeType: 'application/pdf',
      size: 5000,
      service: DocumentStorageEnum.S3,
      lastModifiedBy: userId,
      ownerId: userId,
      shareSetting: {},
      thumbnail: copyThumbnailRemoteId,
    } as Document & { service: DocumentStorageEnum };
    const documentPermission = {
      refId,
    } as IDocumentPermission;
    switch (type) {
      case DocumentOwnerTypeEnum.PERSONAL: {
        documentData.isPersonal = true;
        documentData.name = `Get started - Personal${CommonConstants.PDF_FILE_EXTENSION}`;
        documentPermission.role = DocumentRoleEnum.OWNER;
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        documentData.isPersonal = false;
        documentData.name = `Get started - ${capitalize(ORGANIZATION_TEXT)}${CommonConstants.PDF_FILE_EXTENSION}`;
        documentPermission.role = DocumentRoleEnum.ORGANIZATION;
        break;
      }
      default: break;
    }
    const startedDocument = await this.createDocument(documentData);
    documentPermission.documentId = startedDocument._id;

    await this.createDocumentPermissions([
      documentPermission,
    ]);
    return startedDocument;
  }

  public generateSearchDocumentKeyRegex(searchKey: string): RegExp {
    const processSearchKey = Utils.escapeRegExp(searchKey.trim());
    let key = processSearchKey;
    /**
     * We need to handle the case where the key is 'pdf' separately
     * because our database consistentlyrecords document names as '[name].pdf'.
     */
    if (processSearchKey === 'pdf') {
      key = `${processSearchKey}.*.pdf`;
    }
    const searchKeyRegex = new RegExp(key, 'i');
    return searchKeyRegex;
  }

  async createDocumentFromCommunityTemplate(communityTemplate: ICommunityTemplate): Promise<any> {
    const documentBucket = this.environmentService.getByKey(
      EnvConstants.S3_DOCUMENTS_BUCKET,
    );
    const templateBucket = this.environmentService.getByKey(
      EnvConstants.S3_TEMPLATES_BUCKET,
    );
    const formCopySource = `${templateBucket}/${communityTemplate.remoteId}`;
    const documentKey = `${uuid()}.pdf`;
    const copyFormRemoteId = await this.awsService.copyObjectS3(
      formCopySource,
      documentBucket,
      documentKey,
      false,
      this.awsService.s3InstanceForDocument(),
    );
    const thumbnailBucket = this.environmentService.getByKey(
      EnvConstants.S3_RESOURCES_BUCKET,
    );
    const thumbnailCopySource = `${thumbnailBucket}/${communityTemplate.thumbnails[0]}`;
    const thumbnailKey = `thumbnails/${uuid()}.${Utils.getExtensionFile(
      communityTemplate.thumbnails[0],
    )}`;
    const copyThumbnailRemoteId = await this.awsService.copyObjectS3(
      thumbnailCopySource,
      thumbnailBucket,
      thumbnailKey,
    );
    return { copyFormRemoteId, copyThumbnailRemoteId };
  }

  async removeRequestAccessDocument(requesterIds: string[], documentId: string): Promise<void> {
    await this.deleteManyRequestAccess({ documentId, requesterId: { $in: requesterIds } });
    this.removeRequestNotiWhenAcceptRequest(documentId, requesterIds);
  }

  async getManagerOfDocument(documentId: string): Promise<User[]> {
    const managers = [];
    const docPermission = await this.getDocumentPermissionByGroupRole(
      documentId,
      [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
    );
    if (!docPermission) throw GraphErrorException.BadRequest('Document permission not found', ErrorCode.Document.NO_DOCUMENT_PERMISSION);
    switch (docPermission.role) {
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const teamManagers = await this.teamService.getTeamMemberByRole(
          docPermission.refId,
          [TeamRoles.ADMIN, TeamRoles.MODERATOR, TeamRoles.OWNER],
        );
        teamManagers.forEach((manager) => managers.push(manager));
        break;
      }
      case DocumentRoleEnum.ORGANIZATION: {
        const orgManagers = await this.organizationService.getOrganizationMemberByRole(
          docPermission.refId,
          [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
        );
        orgManagers.forEach((manager) => managers.push(manager));
      }
        break;
      default:
        break;
    }
    return managers;
  }

  async removeRequestAfterUpdatePermission(input: { documentId: string, userId: string }): Promise<void> {
    const { documentId, userId } = input;
    await this.deleteManyRequestAccess({ documentId, requesterId: userId });
    const [notification] = await this.notificationService.getNotificationsByConditions({
      actionType: NotiDocument.REQUEST_ACCESS,
      'actor.actorId': userId,
      'entity.entityId': documentId,
    });
    if (notification) {
      const notificationUsers = await this.notificationService.getNotificationUsersByCondition({
        notificationId: notification._id,
      });
      const userIds = notificationUsers.map((notificationUser) => notificationUser.userId);
      this.notificationService.removeMultiNotifications({ notification, userIds, tabs: [NotificationTab.REQUESTS] });
    }
  }

  getLowerRole(role: DocumentRoleEnum): DocumentRoleEnum[] {
    const indexCurrentRole = Object.values(PRIORITY_ROLE).findIndex((value) => value === PRIORITY_ROLE[role]);
    return Object.keys(PRIORITY_ROLE).filter((_, index) => index >= indexCurrentRole) as DocumentRoleEnum[];
  }

  async getReceiverIdsNotiRequestAccess(document: IDocument, request: IDocumentRequestAccess): Promise<string[]> {
    const { isPersonal, _id: documentId, ownerId } = document;
    const { requesterId } = request;
    const receiverIds = [];
    if (isPersonal) {
      const documentPermissions = await this.getDocumentPermissionByConditions(
        {
          documentId,
          role: { $in: [DocumentRoleEnum.OWNER, DocumentRoleEnum.SHARER] },
        },
      );
      if (documentPermissions.length > ORG_SIZE_LIMIT_FOR_NOTI) {
        const ownerPermission = documentPermissions.find((permission) => permission.role === DocumentRoleEnum.OWNER);
        receiverIds.push(ownerPermission.refId.toHexString());
      } else {
        const userIds = documentPermissions.map((permission) => permission.refId.toHexString());
        receiverIds.push(...userIds);
      }
    } else {
      const docPermission = await this.getDocumentPermissionByGroupRole(
        documentId,
        [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
      );
      if (!docPermission) throw GraphErrorException.BadRequest('Document permission not found', ErrorCode.Document.NO_DOCUMENT_PERMISSION);
      const userIds = [];
      switch (docPermission.role) {
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const receiverIdList = await this.getReceiverIdsNotiRequestAccessInTeam({ docPermission, requesterId, ownerId });
          userIds.push(...receiverIdList);
          break;
        }
        case DocumentRoleEnum.ORGANIZATION: {
          const receiveIdList = await this.getReceiverIdsNotiRequestAccessInOrg({ docPermission, requesterId, ownerId });
          userIds.push(...receiveIdList);
          break;
        }
        default:
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      receiverIds.push(...userIds);
    }
    return uniq(receiverIds);
  }

  async getReceiverIdsNotiRequestAccessInOrg(
    params: { docPermission: IDocumentPermission, requesterId: string, ownerId: string },
  ): Promise<string[]> {
    const { docPermission, requesterId, ownerId } = params;
    const receiveIds = [];
    const userIds = [];
    const [orgManagers, isInternalRequest] = await Promise.all([
      this.organizationService.findMemberWithRoleInOrg(docPermission.refId, [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ], { userId: 1 }),
      this.organizationService.getMembershipByOrgAndUser(docPermission.refId, requesterId),
    ]);
    orgManagers.forEach((manager) => receiveIds.push(manager.userId.toHexString()));
    if (isInternalRequest) {
      return receiveIds;
    }
    const internalWithSharePermission = await this.getInternalMemberWithSharePermission(docPermission);
    internalWithSharePermission.forEach((permission) => receiveIds.push(permission));
    const externalSharePermission = await this.getDocumentPermissionByConditions({
      role: DocumentRoleEnum.SHARER,
      documentId: docPermission.documentId,
    });
    externalSharePermission.forEach((permission) => receiveIds.push(permission.refId.toHexString()));
    receiveIds.push(ownerId.toHexString());
    if (receiveIds.length > ORG_SIZE_LIMIT_FOR_NOTI) {
      orgManagers.forEach((manager) => userIds.push(manager.userId.toHexString()));
      return userIds;
    }
    return receiveIds;
  }

  async getReceiverIdsNotiRequestAccessInTeam(
    params: { docPermission: IDocumentPermission, requesterId: string, ownerId: string },
  ): Promise<string[]> {
    const { docPermission, requesterId, ownerId } = params;
    const receiveIds = [];
    const userIds = [];
    const [teamAdmins, externalDocPermissions, internalRequest] = await Promise.all([
      this.teamService.getTeamMemberByRole(
        docPermission.refId,
        [TeamRoles.ADMIN],
      ),
      this.getDocumentPermissionsByDocId(docPermission.documentId, { role: DocumentRoleEnum.SHARER }),
      this.membershipService.findOne({ userId: requesterId, teamId: docPermission.refId }),
    ]);
    teamAdmins.forEach((teamAdmin) => receiveIds.push(teamAdmin._id));
    if (internalRequest) {
      return receiveIds;
    }
    const internalWithSharePermission = await this.getInternalMemberWithSharePermission(docPermission);
    externalDocPermissions.map((external) => receiveIds.push(external.refId.toHexString()));
    receiveIds.push(ownerId.toString());
    if (internalWithSharePermission) {
      receiveIds.push(...internalWithSharePermission);
    }
    if (receiveIds.length > ORG_SIZE_LIMIT_FOR_NOTI) {
      teamAdmins.forEach((admin) => userIds.push(admin._id));
      return userIds;
    }
    const uniqueIds = uniq(receiveIds);
    return uniqueIds as string[];
  }

  async getInternalMemberWithSharePermission(documentPermission: IDocumentPermission): Promise<string[]> {
    if (documentPermission.defaultPermission.member !== DocumentPermissionOfMemberEnum.SHARER) {
      const [internalWithSharePermission] = await this.aggregateDocumentPermission([
        {
          $match: {
            _id: new Types.ObjectId(documentPermission._id),
          },
        },
        { $project: { groupPermissionList: { $objectToArray: '$groupPermissions' } } },
        { $unwind: '$groupPermissionList' },
        {
          $match: {
            'groupPermissionList.v': DocumentRoleEnum.SHARER,
          },
        },
        {
          $group: {
            _id: null,
            shareList: { $push: '$groupPermissionList.k' },
          },
        },
      ]);
      return internalWithSharePermission?.shareList || [];
    }
    const [internalWithoutSharePermission] = await this.aggregateDocumentPermission([
      {
        $match: {
          _id: new Types.ObjectId(documentPermission._id),
        },
      },
      { $project: { groupPermissionList: { $objectToArray: '$groupPermissions' } } },
      { $unwind: '$groupPermissionList' },
      {
        $match: {
          'groupPermissionList.v': { $ne: DocumentRoleEnum.SHARER },
        },
      },
      {
        $group: {
          _id: null,
          notShareList: { $push: '$groupPermissionList.k' },
        },
      },
    ]);
    const receiverIds = [];
    let internalWithSharePermission;
    if (documentPermission.role === DocumentRoleEnum.ORGANIZATION) {
      internalWithSharePermission = await this.organizationService.getOrgMembershipByConditions({
        conditions: { orgId: documentPermission.refId, userId: { $nin: internalWithoutSharePermission?.notShareList || [] } },
      });
    } else {
      internalWithSharePermission = await this.teamService.getTeamMemberShipByConditions({
        conditions: { teamId: documentPermission.refId, userId: { $nin: internalWithoutSharePermission?.notShareList || [] } },
      });
    }
    internalWithSharePermission.map((permission) => receiverIds.push(permission.userId.toHexString()));
    return uniq(receiverIds);
  }

  async canAcceptOrRejectRequest(params: { actorId: string, targetId: string, document: Document }): Promise<boolean> {
    const { actorId, targetId, document } = params;
    const [actorDocPermission, targetDocPermission] = await Promise.all([
      this.checkExistedDocPermission(actorId, document),
      this.checkExistedDocPermission(targetId, document),
    ]);

    // Org manager can update external and member permission of document
    // If actor isn't a manager, he will only update external permssion
    return (
      this.organizationService.isOrgOrTeamAdmin(actorDocPermission.membershipRole as OrganizationRoleEnums)
      || targetDocPermission.permissionType === DocumentOwnerTypeEnum.PERSONAL
    );
  }

  async removeRequestsAfterPermissionChanged(params: {
    documentId: string,
    users: {
      _id: string,
      requestRole?: DocumentRoleEnum,
    }[],
    newRole: DocumentRoleEnum,
  }): Promise<void> {
    const { documentId, users, newRole } = params;
    const requesterIds = users
      .filter(({ requestRole }) => requestRole && PRIORITY_ROLE[requestRole] >= PRIORITY_ROLE[newRole])
      .map((user) => user._id);

    if (!requesterIds.length) {
      return;
    }
    await this.removeRequestAccessDocument(requesterIds, documentId);
  }

  async getNewAnnotationOrder(
    params: {annotationId: string, documentId: string, reorderType: ReorderType},
  ): Promise<number> {
    const { annotationId, documentId, reorderType } = params;
    const listAnnotationLength = await this.documentAnnotationModel.countDocuments({ documentId }).exec();
    if (listAnnotationLength < 2) {
      return DEFAULT_ANNOT_ORDER;
    }
    const mapReorderType = {
      [ReorderType.BACK]: -1,
      [ReorderType.FRONT]: 1,
    };
    const [{ order }] = await this.documentAnnotationModel
      .find({ documentId }, { order: 1 })
      .sort({ order: -mapReorderType[reorderType] } as unknown as { [key: string]: SortOrder }) // Sort DESC if move to front else sort ASC
      .limit(1)
      .exec();

    const isUniqueOrder = (await this.documentAnnotationModel.countDocuments({ documentId, order }).exec()) < 2;

    const currentAnnotation = await this.documentAnnotationModel.findOne({ documentId, annotationId }, { order: 1 }).exec();
    // if annotation is move to front the order will plus one else it will minus one;
    const newOrder = Number(order) + mapReorderType[reorderType];

    return isUniqueOrder && currentAnnotation?.order === order ? order : newOrder;
  }

  async migrateDocumentsToOrgPersonal(userId: string, orgId: string): Promise<number> {
    const permissions = await this.documentPermissionModel.updateMany(
      {
        refId: userId,
        role: DocumentRoleEnum.OWNER,
        workspace: {
          $exists: false,
        },
      },
      {
        workspace: {
          refId: orgId,
          type: DocumentWorkspace.ORGANIZATION,
        },
      },
      {
        returnDocument: 'after',
      },
    ).exec();
    return permissions.modifiedCount;
  }

  async getDocumentsPersonalWorkspace(params: {
    user: User,
  } & Omit<GetOrganizationDocumentsInput, 'orgId'>): Promise<GetDocumentPayload> {
    const {
      user,
      query,
      filter,
      tab,
    } = params;

    const { cursor = '', searchKey } = query || {};

    const permissionBuilder = new PersonalPermissionFilter();
    const documentBuilder = new DocumentFilter(this);

    const [permFilter, documentFilter] = await Promise.all([
      permissionBuilder
        .of(user)
        .addTab(tab)
        .build(),
      documentBuilder
        .of(user)
        .addTab(tab)
        .addCursor(cursor)
        .addSearch(searchKey)
        .addFilter({
          ownedFilterCondition: filter.ownedFilterCondition,
          lastModifiedFilterCondition: filter.lastModifiedFilterCondition,
        })
        .build(),
    ]);
    const queryManager = new PersonalDocumentQuery(this, this.userService, this.folderService, this.environmentService);
    const premiumMap = new PersonalDocumentPremiumMap(this.userService, this).atTab(tab);
    return queryManager
      .of(user)
      .injectPremiumMap(premiumMap)
      .getDocuments({
        query,
        permFilter,
        documentFilter,
      });
  }

  async getPersonalPaymentInfo(documentId: string, ownerId: string): Promise<Payment> {
    const projection = {
      _id: 1,
      payment: 1,
    };
    const [docPerm] = await this.getDocumentPermissionByConditions({
      documentId,
      role: DocumentRoleEnum.OWNER,
    });
    const orgId = get(docPerm, 'workspace.refId', '');
    if (orgId) {
      const org = await this.organizationService.getOrgById(orgId, projection);
      return get(org, 'payment', {});
    }
    const user = await this.userService.findUserById(ownerId, projection);
    return get(user, 'payment', {});
  }

  async getOrganizationPaymentInfo(documentId: string): Promise<Payment> {
    const projection = {
      _id: 1,
      payment: 1,
    };
    const [organizationDocumentPermission] = await this.getDocumentPermissionByConditions({
      documentId,
      role: {
        $in: [
          DocumentRoleEnum.ORGANIZATION,
          DocumentRoleEnum.ORGANIZATION_TEAM,
        ],
      },
    });
    const { role, refId } = organizationDocumentPermission;
    switch (role) {
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(refId, { _id: 1, belongsTo: 1 });
        const org = await this.organizationService.getOrgById(team.belongsTo as string, projection);
        return get(org, 'payment', {});
      }
      case DocumentRoleEnum.ORGANIZATION: {
        const org = await this.organizationService.getOrgById(refId, projection);
        return get(org, 'payment', {});
      }
      default:
        return {};
    }
  }

  async getPaymentInfoOfDocument(document: Pick<Document, 'isPersonal'| '_id'| 'ownerId' >): Promise<Payment> {
    if (document.isPersonal) {
      return this.getPersonalPaymentInfo(document._id, document.ownerId);
    }
    return this.getOrganizationPaymentInfo(document._id);
  }

  async isSharedDocument({ userId, document }: {userId: string, document: Pick<Document, '_id' | 'isPersonal' | 'shareSetting'>}): Promise<boolean> {
    if (document.isPersonal) {
      return this.isPersonalSharedDocument(userId, document);
    }
    return this.isOrganizationSharedDocument(userId, document);
  }

  async getPremiumToolInfo(
    { document, userId }:
    {
      document: Pick<Document, 'ownerId' | '_id' | 'isPersonal' | 'size' | 'service' | 'mimeType' |'shareSetting'>,
      userId: string,
    },
  ): Promise<PremiumToolsInfo> {
    const isShared = await this.isSharedDocument({ userId, document });
    if (isShared && userId) {
      return this.getPremiumToolInfoAvailableForUser(userId);
    }
    const payment = await this.getPaymentInfoOfDocument(document);
    const priceVersion = this.paymentService.getPriceVersion(payment.planRemoteId);
    const planRule = planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getAllPlanRules();
    let maximumNumberSignature: number;
    if (userId) {
      maximumNumberSignature = await this.userService.getMaximumNumberSignature(userId);
    } else {
      maximumNumberSignature = MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;
    }

    const premiumToolsInfo = { ...planRule, priceVersion, maximumNumberSignature };
    const signedResponse = await this.asymmetricJwtService.sign(premiumToolsInfo);
    return {
      ...premiumToolsInfo,
      signedResponse,
    };
  }

  async getPremiumToolInfoAvailableForUser(userId: string): Promise<PremiumToolsInfo> {
    const projection = {
      _id: 1,
      payment: 1,
    };
    const user = await this.userService.findUserById(userId, projection);
    const userPayment: Payment = get(user, 'payment', {});
    const orgList = await this.organizationService.getOrgListByUser(userId);
    const listOrgPayment: Payment[] = orgList.map((org) => get(org, 'payment', {}));
    listOrgPayment.push(userPayment);

    const listPremiumToolsInfo = listOrgPayment.map(
      (payment) => cloneDeep(planPoliciesHandler
        .from({ plan: payment.type, period: payment.period })
        .getAllPlanRules()),
    );
    const listNumberSignature = [userPayment, ...listOrgPayment].map(
      (payment) => cloneDeep(planPoliciesHandler
        .from({ plan: payment.type, period: payment.period })
        .getNumberSignature()),
    );

    const compressPdfSizeLimitInMB = listOrgPayment.map(
      (payment) => cloneDeep(planPoliciesHandler
        .from({ plan: payment.type, period: payment.period }).getCompressPdfSizeLimitInMB()),
    );

    const documentSummarizationPermissions = listOrgPayment.map(
      (payment) => cloneDeep(planPoliciesHandler
        .from({ plan: payment.type, period: payment.period }).getDocumentSummarizationPermission()),
    );

    const documentSummarizationConfig = documentSummarizationPermissions.reduce(
      (config, otherConfig) => {
        config.enabled = config.enabled || otherConfig.enabled;
        config.maxPages = Math.max(config.maxPages, otherConfig.maxPages);
        return config;
      },
    );

    const listChatBotLimits = listOrgPayment.map(
      (payment) => cloneDeep(planPoliciesHandler
        .from({ plan: payment.type, period: payment.period })
        .getAIChatbotDailyLimit()),
    );

    const maximumNumberSignature = Math.max(...listNumberSignature);
    const maximumChatBotDailyLimit = Math.max(...listChatBotLimits);
    const maximumCompressPdfFileSizeLimitInMB = Math.max(...compressPdfSizeLimitInMB);
    const maximumCompressPdfQuality = maximumCompressPdfFileSizeLimitInMB > STANDARD_COMPRESS_DOCUMENT_SIZE_LIMIT_IN_MB
      ? [AvailableCompressQuality.STANDARD, AvailableCompressQuality.MAXIMUM]
      : [AvailableCompressQuality.STANDARD];

    const newListPremiumToolsInfo = listPremiumToolsInfo
      .reduce((toolsInfo, otherToolsInfo) => mergeWith(toolsInfo, otherToolsInfo, (dest, other) => (dest > other ? dest : other)));
    const premiumToolsInfo = {
      ...newListPremiumToolsInfo,
      maximumNumberSignature,
      documentSummarization: documentSummarizationConfig,
      aiChatbot: {
        daily: maximumChatBotDailyLimit,
      },
      compressPdf: {
        enabled: true,
        availableCompressQuality: maximumCompressPdfQuality,
        fileSizeLimitInMB: maximumCompressPdfFileSizeLimitInMB,
      },
    };

    const signedResponse = await this.asymmetricJwtService.sign(premiumToolsInfo);
    return {
      ...premiumToolsInfo,
      signedResponse,
    };
  }

  public getDataXfdfAndEventName(
    commentInteractionEvent: EventNameType,
    xfdf: string,
    annotationType: string,
  ): { dataXFDF: string, eventName: EventNameType } {
    let dataXFDF = xfdf;
    let eventName: EventNameType = DocumentEventNames.DOCUMENT_ANNOTATED;
    // Check which event is implemented by user based on annotation subject
    switch (annotationType) {
      case DocumentAnnotationTypeEnum.COMMENT:
        // sanitize Comment annotation
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dataXFDF = xfdf.replace(/<content>[\s\S]*?<\/content>/, DOMPurify.sanitize);
        eventName = commentInteractionEvent;
        break;
      case DocumentAnnotationTypeEnum.FREE_TEXT: {
        // sanitize Free Text annotation
        // eslint-disable-next-line prefer-regex-literals
        const annotationContentRegex = new RegExp(/<span>[\s\S]*?[\s\S]<\/span>/, 'g');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        dataXFDF = xfdf.replace(annotationContentRegex, DOMPurify.sanitize);
        break;
      }
      case DocumentAnnotationTypeEnum.SIGNATURE:
        eventName = DocumentEventNames.DOCUMENT_SIGNED;
        break;
      default:
        break;
    }
    return {
      dataXFDF,
      eventName,
    };
  }

  async getOrganizationOwnedDocument(documentId: string): Promise<{_id: string, info: IOrganization, domain: string, associateDomains: string[]}> {
    const docPermission = await this.getDocumentPermissionByGroupRole(
      documentId,
      [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
    );
    if (!docPermission) {
      return null;
    }
    let org: IOrganization;
    const projection = {
      payment: 1, createdAt: 1, docStackStartDate: 1, settings: 1, url: 1, name: 1, associateDomains: 1, domain: 1, metadata: 1,
    };
    if (docPermission) {
      switch (docPermission.role as DocumentRoleEnum) {
        case DocumentRoleEnum.OWNER:
          if (docPermission.workspace?.refId) {
            org = await this.organizationService.getOrgByIdLean(docPermission.workspace.refId, projection);
          }
          break;
        case DocumentRoleEnum.ORGANIZATION: {
          org = await this.organizationService.getOrgByIdLean(docPermission.refId, projection);
          break;
        }
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const team = await this.teamService.findOneById(docPermission.refId, { belongsTo: 1 });
          org = await this.organizationService.getOrgByIdLean(team.belongsTo as string, projection);
          break;
        }
        default:
          break;
      }
    }
    return {
      _id: org?._id,
      info: org,
      domain: org?.domain,
      associateDomains: org?.associateDomains,
    };
  }

  async getTargetOwnedDocumentInfo(documentId: string): Promise<{_id: string, info: IOrganization, domain: string, associateDomains: string[]}> {
    const docPermission = await this.getDocumentPermissionByGroupRole(
      documentId,
      [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
    );
    if (!docPermission) {
      return null;
    }
    let org: IOrganization;
    const projection = {
      payment: 1, createdAt: 1, docStackStartDate: 1, settings: 1, url: 1, name: 1, associateDomains: 1, domain: 1,
    };
    if (docPermission) {
      switch (docPermission.role) {
        case DocumentRoleEnum.OWNER:
          if (docPermission.workspace?.refId) {
            org = await this.organizationService.getOrgById(docPermission.workspace.refId, projection);
          }
          break;
        case DocumentRoleEnum.ORGANIZATION: {
          org = await this.organizationService.getOrgById(docPermission.refId, projection);
          break;
        }
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const team = await this.teamService.findOneById(docPermission.refId, { belongsTo: 1 });
          org = await this.organizationService.getOrgById(team.belongsTo as string, projection);
          break;
        }
        default:
          break;
      }
    }
    return {
      _id: org?._id,
      info: org,
      domain: org?.domain,
      associateDomains: org?.associateDomains,
    };
  }

  public async trackCreateFormEvents(data: {
    userId: string,
    document: IDocument,
    sourceForm: IDocumentForm,
    prismicFormData: {
      remoteId: string,
      formPath: string,
    },
  }): Promise<void> {
    const {
      userId, document,
    } = data;
    const actorInfo = await this.userService.findUserById(userId);

    const documentEventData: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_USED,
      eventScope: EventScopes.PERSONAL,
      actor: actorInfo,
      document: document as unknown as Document,
    };

    this.personalEventService.createUserUseDocumentEvent(documentEventData);
  }

  async removeAllPersonalDocInOrg(user: User, orgId: string): Promise<void> {
    const permissions = await this.getDocumentPermissionByConditions(
      {
        refId: user._id,
        role: DocumentRoleEnum.OWNER,
        'workspace.refId': orgId,
      },
    );
    const documentIds = permissions.map((doc) => doc.documentId);
    const documents = await this.findDocumentsByIds(documentIds);
    await this.deleteDocumentsInPersonal({
      actorInfo: user,
      documentPermissionList: permissions,
      documentList: documents as unknown as Document[],
      clientId: user._id,
      isPersonalDocumentsInOrg: true,
    });
  }

  async getDocumentLimitMapping(documents: IDocument[]): Promise<PremiumDocumentMap> {
    const sharedDocumentIds = documents.map((document) => document._id);
    const originalDocPermissions = await this.getDocumentPermissionByConditions({
      documentId: { $in: sharedDocumentIds },
      role: { $in: ORIGINAL_DOCUMENT_PERMISSION_ROLE },
    });
    const premiumDocumentMapping: Record<string, boolean> = {};
    await Promise.all(originalDocPermissions.map(async (documentPermission) => {
      const limitDocument = await this.getPremiumDocumentMapping(documentPermission);
      premiumDocumentMapping[documentPermission.documentId] = !limitDocument;
      return premiumDocumentMapping;
    }));
    return premiumDocumentMapping;
  }

  async checkThirdPartyStorage(user: User, remoteIds: string[]): Promise<CheckThirdPartyStoragePayload[]> {
    const pipelines: PipelineStage[] = [
      {
        $match: {
          ownerId: new Types.ObjectId(user._id),
          remoteId: { $in: remoteIds },
          service: { $ne: DocumentStorageEnum.S3 },
        },
      },
      {
        $lookup: {
          from: 'documentpermissions',
          let: { docId: '$_id' },
          as: 'permissions',
          pipeline: [{
            $match: {
              $expr: { $eq: ['$documentId', '$$docId'] },
              role: DocumentRoleEnum.OWNER,
            },
          }],
        },
      },
      {
        $unwind: {
          path: '$permissions',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          remoteId: 1,
          service: 1,
          folderId: 1,
          workspaceId: '$permissions.workspace.refId',
        },
      },
    ];

    const documents = await this.aggregateDocument<{
      _id: Types.ObjectId;
      remoteId: string;
      service: DocumentStorageEnum;
      folderId: Types.ObjectId;
      workspaceId: Types.ObjectId;
    }>(pipelines);

    const orgIds = new Set<Types.ObjectId | null>();
    const folderIds = new Set<Types.ObjectId | null>();

    documents.forEach((doc) => {
      orgIds.add(doc.workspaceId);
      folderIds.add(doc.folderId);
    });

    const formatFolderIds = [...folderIds].filter(Boolean).map((_id) => _id.toHexString());

    const [folders, organizations] = await Promise.all([
      this.folderService.findFolderByIds(formatFolderIds, { _id: 1, name: 1 }),
      this.organizationService.findOrganization({
        _id: { $in: [...orgIds].filter(Boolean) },
      }, { _id: 1, name: 1, url: 1 }),
    ]);

    const orgsObj = keyBy(organizations, (_item) => _item._id);
    const foldersObj = keyBy(folders, (_item) => _item._id);

    return documents.map((doc) => ({
      remoteId: doc.remoteId,
      folder: doc.folderId && foldersObj[doc.folderId.toHexString()],
      organization: doc.workspaceId && orgsObj[doc.workspaceId.toHexString()],
    }));
  }

  async isPersonalSharedDocument(userId: string, document: Pick<Document, '_id'>): Promise<boolean> {
    const personalDocumentPermission = await this.getOneDocumentPermission(userId, { documentId: document._id });
    const roleOfUser = get(personalDocumentPermission, 'role', '');
    return roleOfUser !== DocumentRoleEnum.OWNER;
  }

  async isOrganizationSharedDocument(userId: string, document: Pick<Document, '_id' | 'shareSetting'>): Promise<boolean> {
    const isSharedByLink = document.shareSetting.linkType === ShareLinkType.ANYONE;
    const personalDocumentPermission = await this.getOneDocumentPermission(userId, { documentId: document._id });

    if (Boolean(personalDocumentPermission) && !isSharedByLink) {
      return true;
    }

    const [organizationDocumentPermission] = await this.getDocumentPermissionByConditions({
      documentId: document._id,
      role: {
        $in: [
          DocumentRoleEnum.ORGANIZATION,
          DocumentRoleEnum.ORGANIZATION_TEAM,
        ],
      },
    });
    const { role, refId } = organizationDocumentPermission;

    let isBelongsToTeamOrOrganization: boolean;

    switch (role) {
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOneById(refId, { _id: 1, belongsTo: 1 });
        const teamId = get(team, '_id');
        isBelongsToTeamOrOrganization = Boolean(await this.teamService.getOneMembershipOfUser(userId, { teamId }));
        break;
      }
      case DocumentRoleEnum.ORGANIZATION: {
        const org = await this.organizationService.getOrgById(refId, { _id: 1 });
        const orgId = get(org, '_id');
        isBelongsToTeamOrOrganization = Boolean(await this.organizationService.getMembershipByOrgAndUser(orgId, userId));
        break;
      }
      default:
        isBelongsToTeamOrOrganization = false;
    }

    return !isBelongsToTeamOrOrganization;
  }

  async addDocumentImage(data: IDocumentImage): Promise<any> {
    const createdDocumentImage = await this.documentImageModel.create(data);
    return createdDocumentImage ? { ...createdDocumentImage.toObject(), _id: createdDocumentImage._id.toHexString() } : null;
  }

  async getImageSignedUrlsById(documentId: string): Promise<Record<string, string>> {
    const listImageRemoteId = await this.documentImageModel.find({ documentId }, { remoteId: 1 }).exec();
    const imageSignedUrls = {};

    await Promise.all(listImageRemoteId.map(async ({ remoteId }) => {
      const signedUrl = await this.awsService.getSignedUrl({ keyFile: `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${remoteId}` });
      imageSignedUrls[remoteId] = signedUrl;
    }));
    return imageSignedUrls;
  }

  async deleteAllImageSignedUrls(documentId: string): Promise<void> {
    const images = await this.documentImageModel.find({ documentId }, { remoteId: 1 }).exec();
    if (!images.length) {
      return;
    }
    const listImageRemoteId = images.map(({ remoteId }) => `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${remoteId}`);
    await Promise.all([
      this.awsService.deleteManyObjectAsync(listImageRemoteId, EnvConstants.S3_DOCUMENTS_BUCKET, this.awsService.s3InstanceForDocument()),
      this.documentImageModel.deleteMany({ documentId }).exec(),
    ]);
  }

  async deleteImageSignedUrlByRemoteIds(documentId: string, remoteIds: string[]): Promise<void> {
    const listImageRemoteId = remoteIds.map((remoteId) => `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${remoteId}`);
    await Promise.all([
      this.awsService.deleteManyObjectAsync(listImageRemoteId, EnvConstants.S3_DOCUMENTS_BUCKET, this.awsService.s3InstanceForDocument()),
      this.documentImageModel.deleteMany({ documentId, remoteId: { $in: remoteIds } }).exec(),
    ]);
  }

  async copyDocumentImage(sourceDocId: string, copiedDocId: string) : Promise<unknown> {
    const bucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const listImageRemoteId = await this.documentImageModel.find({ documentId: sourceDocId }, { remoteId: 1 }).exec();
    const copiedImageRemoteIds = listImageRemoteId.map(({ remoteId }) => ({ remoteId, documentId: copiedDocId }));
    await this.documentImageModel.insertMany(copiedImageRemoteIds);
    return Promise.all(listImageRemoteId.map(({ remoteId }) => this.awsService.copyObjectS3(
      `${bucket}/${ANNOTATION_IMAGE_BASE_PATH}/${sourceDocId}/${remoteId}`,
      bucket,
      `${ANNOTATION_IMAGE_BASE_PATH}/${copiedDocId}/${remoteId}`,
      false,
      this.awsService.s3InstanceForDocument(),
    )));
  }

  async isAllowedToBackupPreviousVersion(document: Document): Promise<boolean> {
    const payment = await this.getPaymentInfoOfDocument(document);
    const planRule = planPoliciesHandler.from({ plan: payment.type, period: payment.period });
    return planRule.getRestoreOriginalToolPermission();
  }

  async backupPreviousFileVersion(document: Document, remoteId?: string): Promise<void> {
    let originalRemoteKey = remoteId;
    const shouldBackupPreviousFileVersion = await this.isAllowedToBackupPreviousVersion(document);
    if (!shouldBackupPreviousFileVersion) {
      return;
    }
    if (!originalRemoteKey) {
      originalRemoteKey = await this.copyDocumentToS3(document);
    }
    const { _id: orgId } = await this.getTargetOwnedDocumentInfo(document._id);
    await this.documentBackupInfoModel.create({ orgId, remoteId: originalRemoteKey, documentId: document._id });
  }

  async deleteBackupFile(orgId: string): Promise<void> {
    try {
      const org = await this.organizationService.getOrgById(orgId, { payment: 1 });
      if (!org) {
        return;
      }
      if (org.payment.type === PaymentPlanEnums.FREE) {
        const backupFileInfos = await this.documentBackupInfoModel.find({ orgId }, { remoteId: 1 }).exec();
        const backupFileInfoList = backupFileInfos.map((backupFile) => ({ ...backupFile.toObject(), _id: backupFile._id.toHexString() }));
        const listRemoteId = backupFileInfoList.map(({ remoteId }) => remoteId);
        if (listRemoteId.length) {
          this.awsService.removeManyDocument(listRemoteId);
        }
        this.documentBackupInfoModel.deleteMany({ orgId }).exec();
      }
    } catch (error) {
      this.loggerService.error({
        context: 'deleteBackupFile',
        error,
        extraInfo: {
          orgId,
        },
      });
    }
  }

  async getDocumentBackupInfoById(documentId: string): Promise<IDocumentBackupInfo> {
    const backupFile = await this.documentBackupInfoModel.findOne({ documentId }).exec();
    return backupFile ? { ...backupFile.toObject(), _id: backupFile._id.toHexString() } : null;
  }

  async getRestoreOriginalPermission(documentId: string, user: User): Promise<RestoreOriginalPermission> {
    const document = await this.getDocumentByDocumentId(documentId);
    const payment = await this.getPaymentInfoOfDocument(document as unknown as Document);
    const planRule = planPoliciesHandler.from({ plan: payment.type, period: payment.period });
    const allowRestoreOriginal = planRule.getRestoreOriginalToolPermission();
    const isDocOwner = String(document.ownerId) === user._id;

    const existedPermission = await this.checkExistedDocPermission(user._id, document as unknown as Document);
    const isValidRole = document.isPersonal
      ? isDocOwner
      : isDocOwner
        || this.organizationService.isOrgOrTeamAdmin(existedPermission.membershipRole as OrganizationRoleEnums);

    if (!isValidRole) {
      return RestoreOriginalPermission.NOT_ALLOWED;
    }
    return allowRestoreOriginal ? RestoreOriginalPermission.RESTORE : RestoreOriginalPermission.VIEW;
  }

  private setupRedisHook(): void {
    this.callbackService.registerCallbacks([{
      run: async ({ key }: { key: string }): Promise<void> => {
        // eslint-disable-next-line prefer-regex-literals
        const matchedDeleteBackupFileExpiredKey = key && RegExp(/^delete-backup-files:*/).test(key);

        if (matchedDeleteBackupFileExpiredKey) {
          const [_, orgId] = key.split(':');
          const setKeySuccessfully = await this.redisService.setKeyIfNotExist(`remove-backup-${orgId}`, '1', '600000');
          if (!setKeySuccessfully) {
            return;
          }
          this.loggerService.info({
            context: 'deleteBackupFile',
            extraInfo: {
              orgId,
            },
          });
          await this.deleteBackupFile(orgId);
          await this.redisService.deleteRedisByKey(`remove-backup-${orgId}`);
        }

        // eslint-disable-next-line prefer-regex-literals
        const matchedDocumentIndexingDebounceKey = key && RegExp(/^document-indexing-debounce:*/).test(key);
        if (matchedDocumentIndexingDebounceKey) {
          const [_, documentId] = key.split(':');
          await this.processDebouncedDocumentIndexing(documentId);
        }
      },
    }]);
  }

  async sendRestoreDocNotiToMembers(data: {
    userId: string,
    document: IDocument,
    isRestoreOriginal: boolean,
  }): Promise<void> {
    const {
      userId, document, isRestoreOriginal,
    } = data;
    const notificationType = isRestoreOriginal ? NotiDocument.RESTORE_ORIGINAL_VERSION : NotiDocument.RESTORE_DOCUMENT_VERSION;
    const actor = await this.userService.findUserById(userId, { _id: 1, name: 1, avatarRemoteId: 1 });
    switch (document.service) {
      case DocumentStorageEnum.S3: {
        const { allReceivers } = await this.getReceiverIdsFromDocumentId(document._id);
        allReceivers.delete(userId);
        if (!allReceivers.size) {
          return;
        }
        const notification = notiDocumentFactory.create(notificationType, {
          actor: { user: actor },
          entity: { document },
        });
        this.notificationService.createUsersNotifications(notification, Array.from(allReceivers));
        // send out-app noti for mobile
        if (!isRestoreOriginal) {
          const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.RESTORE_DOCUMENT_VERSION, {
            document,
            actor,
          });
          this.notificationService.publishFirebaseNotifications(Array.from(allReceivers), notificationContent, notificationData);
        }
        break;
      }
      case DocumentStorageEnum.GOOGLE: {
        const documents = await this.documentModel.find({ remoteId: document.remoteId, ownerId: { $ne: actor._id } }, { name: 1, ownerId: 1 })
          .exec();
        const documentList = documents.map((doc) => ({ ...doc.toObject(), _id: doc._id.toHexString() }));
        documentList.forEach((otherDocument) => {
          const notification = notiDocumentFactory.create(notificationType, {
            actor: { user: actor },
            entity: { document: otherDocument },
          });
          this.notificationService.createUsersNotifications(notification, [otherDocument.ownerId]);
        });
        break;
      }
      default:
        break;
    }
  }

  async removeRequestAcessOfDeletedDoc(documentId: string): Promise<void> {
    const requestAccesses = await this.getRequestAccessDocument({ documentId });
    const requesterIds = requestAccesses.map((request) => request.requesterId);
    this.removeRequestAccessDocument(requesterIds, documentId);
  }

  async resetDocument(documentId: string): Promise<void> {
    await Promise.all([
      this.updateDocument(documentId, {
        manipulationStep: '',
        version: 1,
        bookmarks: '',
        'metadata.hasClearedAnnotAndManip': false,
        'metadata.hasMerged': false,
      }),
      this.clearAnnotationOfDocument({ documentId }),
      this.documentOutlineService.clearOutlineOfDocument(documentId),
      this.deleteFormFieldFromDocument(documentId),
    ]);
    this.deleteAllImageSignedUrls(documentId);
  }

  emitSocketDeleteDocuments(documentIds: string[]): void {
    documentIds.forEach((documentId) => {
      this.messageGateway.server.to(`document-room-${documentId}`).emit(`removeDocument-${documentId}`, { type: SOCKET_EMIT_TYPE.DELETE });
    });
  }

  emitSocketUpdateDocumentPermission(documentIds: string[]): void {
    documentIds.forEach((documentId) => this.messageGateway.server.to(
      `document-room-${documentId}`,
    ).emit(`updatePermission-${documentId}`, { type: SOCKET_EMIT_TYPE.UPDATED_PERMISSION }));
  }

  async getDocumentETag(remoteId: string): Promise<string> {
    const metadata = await this.awsService.headObject({
      Key: remoteId,
      Bucket: this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET),
    }, this.awsService.s3InstanceForDocument());
    return metadata?.ETag.replace(/["]+/g, '');
  }

  async handleOpenPrismicForm(params: {formId: string, user: User, formStaticPath: string}): Promise<{ documentId: string, documentName: string }> {
    const { formId, user, formStaticPath } = params;
    const { _id: userId } = user;
    const documentForm = await this.findDocumentFormById(formId);
    if (!documentForm) {
      throw GraphErrorException.Forbidden(
        'You have no document with this documentId',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    const {
      copyFormRemoteId,
      copyThumbnailRemoteId,
    } = await this.createPDfDocumentFromDocumentForm(documentForm);
    if (copyFormRemoteId) {
      const documentData = {
        name: documentForm.name,
        remoteId: copyFormRemoteId,
        mimeType: documentForm.mimeType,
        size: documentForm.size,
        service: DocumentStorageEnum.S3,
        isPersonal: true,
        lastModifiedBy: userId,
        ownerId: userId,
        shareSetting: {},
        thumbnail: copyThumbnailRemoteId,
      };

      documentData.name = await this.getDocumentNameAfterNaming(
        {
          clientId: userId,
          fileName: documentForm.name,
          documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
          mimetype: documentForm.mimeType,
        },
      );
      const copyDocument = await this.createDocument(
        documentData,
      );
      const isFreeUser = user.payment.type === PaymentPlanEnums.FREE;
      let org = isFreeUser ? await this.organizationService.findOneOrganization({ ownerId: userId }) : null;
      if (isFreeUser && !org) {
        org = await this.organizationService.createCustomOrganization(user);
      }
      const documentPermission = {
        documentId: copyDocument._id,
        refId: userId,
        role: 'owner',
        ...(org && {
          workspace: {
            refId: org._id,
            type: DocumentWorkspace.ORGANIZATION,
          },
        }),
      };
      await this.createDocumentPermissions([
        documentPermission,
      ]);

      // track user use document
      this.trackCreateFormEvents({
        userId,
        document: copyDocument,
        sourceForm: documentForm,
        prismicFormData: {
          remoteId: formId,
          formPath: formStaticPath,
        },
      });
      return { documentId: copyDocument._id, documentName: documentData.name };
    }
    return { documentId: null, documentName: null };
  }

  async createPdfDocumentFromStrapiForm(strapiFormData: IStrapiTemplate): Promise<{ copiedFormFileId: string, copiedThumbnailFileId: string }> {
    const { file: fileData, thumbnails } = strapiFormData;
    const thumbnail = thumbnails?.[0];
    if (!fileData) {
      throw GraphErrorException.BadRequest('File not found');
    }
    // Copy form file from strapi bucket to document bucket
    const documentBucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const strapiFormBucket = this.environmentService.getByKey(EnvConstants.S3_STRAPI_TEMPLATES_BUCKET);
    const strapiS3FormPath = `${strapiFormBucket}/${fileData.hash}${fileData.ext}`;
    const documentKey = `${uuid()}${fileData.ext}`;
    const copiedFormFileId = await this.awsService.copyObjectS3(
      strapiS3FormPath,
      documentBucket,
      documentKey,
      false,
      this.awsService.s3InstanceForDocument(),
    );

    // Copy thumbnails from strapi bucket to document bucket
    let createdThumbnail = null;
    if (thumbnail) {
      createdThumbnail = await this.createThumbnailsForUsingTemplate(thumbnail);
    }
    return {
      copiedFormFileId, copiedThumbnailFileId: createdThumbnail,
    };
  }

  async fetchImageBuffer(url: string): Promise<Buffer> {
    const lowestQualityUrl = url.replace(/\/\d+x\b/, '/1x');
    const imageBuffer = await fetch(lowestQualityUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => buffer);
    return Utils.ConvertArrayBufferToBuffer(imageBuffer);
  }

  async createThumbnailsForUsingTemplate(thumbnail: ITemplateStrapiFile): Promise<string> {
    const { provider } = thumbnail;
    const strapiFormBucket = this.environmentService.getByKey(EnvConstants.S3_STRAPI_TEMPLATES_BUCKET);

    try {
      switch (provider) {
        case FileUploadProvider.AWS_S3: {
          const thumbnailBucket = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
          const strapiS3ThumbnailPath = `${strapiFormBucket}/${thumbnail.hash}${thumbnail.ext}`;
          const thumbnailKey = `thumbnails/${uuid()}${thumbnail.ext}`;
          const copiedThumbnailFileId = await this.awsService.copyObjectS3(
            strapiS3ThumbnailPath,
            thumbnailBucket,
            thumbnailKey,
          );
          return copiedThumbnailFileId;
        }
        case FileUploadProvider.STRAPI_UPLOAD_MULTI_PROVIDERS: {
          const { url } = thumbnail;
          const thumbnailBucket = this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET);
          const thumbnailKey = `thumbnails/${uuid()}${thumbnail.ext}`;
          const putReponse = await this.awsService.putObject({
            Key: thumbnailKey,
            ACL: 'private',
            Bucket: thumbnailBucket,
            Body: await this.fetchImageBuffer(url),
          });
          return putReponse.key;
        }
        default: {
          this.loggerService.error({
            context: 'createThumbnailsForUsingTemplate',
            error: 'Provider not supported',
            extraInfo: {
              thumbnail,
            },
          });
          return null;
        }
      }
    } catch (error) {
      this.loggerService.error({
        context: 'createThumbnailsForUsingTemplate',
        error,
        extraInfo: {
          thumbnail,
        },
      });
      return null;
    }
  }

  async handleOpenStrapiForm(params: {
    formId: string;
    user: User;
    source: string;
    variationIdentifier?: string;
  }): Promise<{ documentId: string; documentName: string }> {
    const {
      formId, user, source, variationIdentifier,
    } = params;
    const documentForm = await this.findFormFromStrapi(formId, { variationIdentifier });
    if (!documentForm) {
      throw GraphErrorException.NotFound('Form not found on Strapi');
    }

    const { file: fileData } = documentForm;
    if (!fileData) {
      throw GraphErrorException.BadRequest('File remote id not existed');
    }
    const { copiedFormFileId, copiedThumbnailFileId } = await this.createPdfDocumentFromStrapiForm(documentForm);

    const documentData = {
      remoteId: copiedFormFileId,
      size: Math.round(fileData.size * 1024),
      service: DocumentStorageEnum.S3,
      isPersonal: true,
      mimeType: fileData.mime,
      lastModifiedBy: user._id,
      ownerId: user._id,
      shareSetting: {},
      thumbnail: copiedThumbnailFileId,
      name: await this.getDocumentNameAfterNaming({
        clientId: user._id,
        fileName: `${documentForm.title}${fileData.ext}`,
        documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
        mimetype: fileData.mime,
      }),
      fromSource: DocumentFromSourceEnum.LUMIN_TEMPLATES_LIBRARY,
    };
    const createdDocument = await this.createDocument(documentData);

    const strapiCategories = documentForm.categories?.map((category) => category.name);
    this.loggerService.info({
      context: 'TEMPLATE_USED',
      userId: user._id,
      extraInfo: {
        actor: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatarRemoteId: user.avatarRemoteId,
        },
        document: {
          _id: createdDocument._id,
          name: createdDocument.name,
          s3RemoteId: createdDocument.remoteId,
        },
        template: {
          strapiId: documentForm.id,
          s3RemoteId: documentForm.file.hash,
          strapiCategories,
          url: `/${source}`,
        },
      },
    });
    await this.saveDocumentToDocList(createdDocument, user);
    return { documentId: createdDocument._id, documentName: createdDocument.name };
  }

  async createPdfFromStaticToolUpload(data: {
    remoteId: string,
    fileName: string,
    user: User,
    orgId?: string
  }): Promise<CreatePdfFromStaticToolUploadPayload> {
    const {
      remoteId, fileName, user, orgId,
    } = data;

    const { _id: userId, payment: { type: userPlan } } = user;
    const isPremiumUser = userPlan !== PaymentPlanEnums.FREE;

    const metadata = await this.awsService.getTemporaryFileMetadata(remoteId);

    if (!metadata) {
      throw GraphErrorException.BadRequest('Fail to get temporary file metadata');
    }

    const { ContentType: mimeType, ContentLength: docSize } = metadata;

    const sourceBucket = this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);
    const targetBucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    const remoteDocumentSource = `${sourceBucket}/${remoteId}`;
    const targetRemoteKey = `${uuid()}.${mime.extension(mimeType)}`;

    const newDocumentRemoteId = await this.awsService.copyObjectS3(
      remoteDocumentSource,
      targetBucket,
      targetRemoteKey,
      false,
      this.awsService.s3InstanceForDocument(),
    );

    if (!newDocumentRemoteId) {
      throw GraphErrorException.NotFound('Fail to create document from existing remote ID in S3');
    }

    const { isPremiumOrg, targetOrgId } = await this.getTargetOrgWithPremiumStatus(user, orgId);

    const { error } = this.validateUploadFileData(metadata as IS3FileMetadata, isPremiumUser || isPremiumOrg);

    if (error) {
      throw error;
    }

    const documentName = await this.getDocumentNameAfterNaming({
      clientId: userId,
      fileName,
      documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
      mimetype: mimeType,
    });
    const documentData = {
      name: documentName,
      remoteId: newDocumentRemoteId,
      mimeType,
      size: docSize,
      service: DocumentStorageEnum.S3,
      isPersonal: true,
      lastModifiedBy: userId,
      ownerId: userId,
      shareSetting: {},
    };

    const { _id: createdDocumentId } = await this.createDocument(documentData);

    const documentPermissionInput = {
      documentId: createdDocumentId,
      refId: userId,
      role: DocumentRoleEnum.OWNER,
      ...(targetOrgId && {
        workspace: {
          refId: targetOrgId,
          type: DocumentWorkspace.ORGANIZATION,
        },
      }),
    };

    await this.createDocumentPermission(documentPermissionInput);
    return {
      documentId: createdDocumentId,
      documentName: documentData.name,
      documentMimeType: documentData.mimeType,
      documentSize: documentData.size,
      temporaryRemoteId: remoteId,
    };
  }

  validateUploadFileData(metadata: IS3FileMetadata, isPremium: boolean): { isValid: boolean, error?: GraphErrorException } {
    const { ContentType: mimeType, ContentLength: size } = metadata;

    const isValidMimeType = SUPPORTED_MIME_TYPE.some((type) => type === mimeType);

    if (!isValidMimeType) {
      return {
        isValid: false,
        error: GraphErrorException.Forbidden(ErrorMessage.DOCUMENT.FILE_TYPE, ErrorCode.Common.INVALID_FILE_TYPE),
      };
    }

    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, [{ size }])) {
      const error = isPremium
        ? GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.PAID, ErrorCode.Document.OVER_FILE_SIZE_PREMIUM)
        : GraphErrorException.BadRequest(ErrorMessage.DOCUMENT.FILE_SIZE.FREE, ErrorCode.Document.OVER_FILE_SIZE_FREE);
      return {
        isValid: false,
        error,
      };
    }

    return {
      isValid: true,
    };
  }

  async saveDocumentToDocList(document: IDocument, user: User): Promise<void> {
    if (user.payment.type !== PaymentPlanEnums.FREE) {
      await this.createDocumentPermission({
        documentId: document._id,
        refId: user._id,
        role: DocumentRoleEnum.OWNER,
      });
      return;
    }
    const { _id: orgIdToSaveDocument } = await this.updateWorkspaceAndGetUploadDestination(user);
    await this.createDocumentPermission({
      documentId: document._id,
      refId: user._id,
      role: DocumentRoleEnum.OWNER,
      workspace: {
        refId: orgIdToSaveDocument,
        type: DocumentWorkspace.ORGANIZATION,
      },
    });
    this.redisService.deleteOpenFormFromTemplates(user._id);
  }

  async getOrgIdToSaveExternalUploadDocument(user: User): Promise<string> {
    const lastAccessedOrgId = await this.redisService.getRedisValueWithKey(`${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${user._id}`);
    if (lastAccessedOrgId) {
      return lastAccessedOrgId;
    }
    let org = await this.organizationService.findOneOrganization({ ownerId: user._id });
    if (!org) {
      org = await this.organizationService.createCustomOrganization(user);
    }
    return org._id;
  }

  public async getUserIdsHasDocPermission(authorIds: string[], document: Document): Promise<string[]> {
    if (!authorIds.length) {
      return [];
    }
    const userIds = await Promise.all(authorIds.map(async (authorId) => {
      const { hasPermission } = await this.checkExistedDocPermission(authorId, document);
      return hasPermission && authorId;
    }));
    return userIds.filter(Boolean);
  }

  async isAllowedToUseOCR(documentId: string, userId: string): Promise<boolean> {
    const document = await this.getDocumentByDocumentId(documentId, {
      ownerId: 1,
      _id: 1,
      isPersonal: 1,
      size: 1,
      service: 1,
      mimeType: 1,
      shareSetting: 1,
    });
    const documentOwner = await this.userService.findUserById(document.ownerId, { metadata: 1 });
    const canExploredOCR = documentOwner.metadata?.exploredFeatures?.ocr < EXPLORED_FEATURE_MAPPING[ExploredFeatureKeys.OCR].maxUsage;
    const premiumToolInfo = await this.getPremiumToolInfo({ document, userId });
    const hasPlanToUse = premiumToolInfo.ocr;
    const isValidStorage = [DocumentStorageEnum.S3, DocumentStorageEnum.GOOGLE].includes(document.service as DocumentStorageEnum);
    const isValidMimeType = [
      DocumentMimeType.PDF,
      DocumentMimeType.PNG,
      DocumentMimeType.JPEG,
      DocumentMimeType.JPG,
    ].includes(document.mimeType as DocumentMimeType);
    return isValidStorage && (hasPlanToUse || canExploredOCR) && document.size <= OCR_LIMIT_SIZE && isValidMimeType;
  }

  async removeAllRequestAccessOfDocuments(documents: IDocument[]): Promise<{
    docId: string, requesterIds: string[], success: boolean, error?: any
  }[]> {
    const requestAccess = await this.getRequestAccessDocument({ documentId: { $in: documents.map(({ _id }) => _id) } });
    const docIds = [...new Set(requestAccess.map((request) => request.documentId.toHexString()))];
    return Promise.all(docIds.map(async (docId) => {
      const requesterIds = requestAccess
        .filter(({ documentId }) => documentId.toHexString() === docId)
        .map(({ requesterId }) => requesterId.toHexString());
      return this.removeRequestAccessDocument(requesterIds, docId)
        .then(() => ({ docId, requesterIds, success: true }))
        .catch((error) => ({
          docId, requesterIds, success: false, error,
        }));
    }));
  }

  async removeAllSharedDocumentPermissionsOfUsers(userIds: string[]): Promise<{
    userId: string, deletedCount?: number, success: boolean, error?: any
  }[]> {
    return Promise.all(userIds.map((userId) => this.deleteDocumentPermissions({
      refId: userId,
      role: {
        $nin: [
          DocumentRoleEnum.OWNER,
          DocumentRoleEnum.ORGANIZATION,
          DocumentRoleEnum.ORGANIZATION_TEAM,
        ],
      },
    })
      .then(({ deletedCount }) => ({ userId, deletedCount, success: true }))
      .catch((error) => ({ userId, success: false, error }))));
  }

  async removeDocumentRequestAccessOfUsers(userIds: string[]): Promise<{ docId: string, requesterIds: string[], success: boolean, error?: any}[]> {
    const requestAccess = await this.getRequestAccessDocument({ requesterId: { $in: userIds } });
    const docIds = [...new Set(requestAccess.map(({ documentId }) => documentId.toHexString()))];
    return Promise.all(docIds.map((docId) => {
      const requesterIds = requestAccess
        .filter(({ documentId }) => documentId.toHexString() === docId)
        .map(({ requesterId }) => requesterId.toHexString());
      return this.removeRequestAccessDocument(requesterIds, docId)
        .then(() => ({ docId, requesterIds, success: true }))
        .catch((error) => ({
          docId, requesterIds, success: false, error,
        }));
    }));
  }

  async deleteAllDocumentsInOrgWorkspace(
    { orgId, orgTeams, perservePersonalDoc }:
    { orgId: string; orgTeams: ITeam[], perservePersonalDoc?: boolean },
  ): Promise<Partial<Document>[]> {
    try {
      const deletedDocs = await this.organizationService.deleteAllDocumentsInOrgWorkspace({ orgId, orgTeams, perservePersonalDoc });
      return deletedDocs.map((doc) => ({
        _id: doc._id,
        documentType: doc.documentType,
      }));
    } catch (error) {
      this.loggerService.error({ context: 'deleteAllDocumentsInOrgWorkspace', error });
      return [];
    }
  }

  sendPreSignedUrlForConvertOfficeFile(fileName: string, preSignedUrl: string = '', errorMessage: string = ''): void {
    // TODO: remove emit event `convertToDocx` when no more user in old version
    this.messageGateway.server.to(`conversion-${fileName}`).emit(`convertToDocx-${fileName}`, { preSignedUrl, errorMessage });
    this.messageGateway.server.to(`conversion-${fileName}`).emit(`convertToOfficeFile-${fileName}`, { preSignedUrl, errorMessage });
  }

  sendPreSignedUrlForOCR(params: SendSignedUrlDto): void {
    const {
      fileName, preSignedUrl, errorMessage, position,
    } = params;
    // fileName format: ${uuid}-${documentId}
    this.messageGateway.server.to(`ocr-${fileName}`).emit('ocr', { preSignedUrl, errorMessage, position });
  }

  // eslint-disable-next-line consistent-return
  async getDriveSharersByDocument({
    documentId, remoteId, driveAPI,
  }: { documentId: string, remoteId: string, driveAPI: DriveV3.Drive }): Promise<ISharer[]> {
    try {
      const permission = await driveAPI.permissions.list({
        fileId: remoteId,
        supportsAllDrives: true,
        fields: 'permissions(emailAddress,displayName,photoLink)',
      });
      this.loggerService.info({
        context: this.getDriveSharersByDocument.name,
        extraInfo: {
          documentId,
          remoteId,
          numberPermissions: permission.data.permissions?.length,
        },
      });
      if (!permission.data.permissions?.length) {
        return [];
      }
      const sharers = permission.data.permissions.reduce((accumulator, current) => {
        if (current.emailAddress) {
          accumulator.push({ email: current.emailAddress, name: current.displayName, avatar: current.photoLink });
        }
        return accumulator;
      }, [] as ISharer[]);
      await this.updateDocumentDriveMetadata({ documentId, remoteId }, { documentId, remoteId, sharers }, { upsert: true });
      return sharers;
    } catch (error) {
      const logMessage = {
        context: 'DocumentService.getDriveSharers',
        error,
        extraInfo: {
          documentId,
          remoteId,
        },
      };
      if (error.code && [401, 403, 404].indexOf(error.code) > -1) {
        this.loggerService.warn(logMessage);
      } else {
        this.loggerService.error(logMessage);
      }
      return [];
    }
  }

  async getDriveSharers({ accessToken, documents, authorizationGoogleEmail }:
    { accessToken: string, documents: { documentId: string, remoteId: string }[], authorizationGoogleEmail: string,
  }): Promise<ISharer[]> {
    const authorizeDomain = Utils.getEmailDomain(authorizationGoogleEmail);
    const googleClient = new OAuth2Client(this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID));
    googleClient.setCredentials({ access_token: accessToken });
    const driveAPI = drive({
      version: 'v3',
      auth: googleClient as any,
    });
    const sharers = await Promise.all(documents.map(
      ({ documentId, remoteId }) => this.getDriveSharersByDocument({ documentId, remoteId, driveAPI }),
    ));
    const sharerSameDomain = sharers.flatMap((value) => value)
      .filter(({ email }) => (email !== authorizationGoogleEmail && Utils.getEmailDomain(email) === authorizeDomain));
    return uniqBy(sharerSameDomain, 'email');
  }

  async updateFormField(documentId: string, name: string, data) {
    const lastModify = Date.now();
    await Promise.all([
      this.documentFormFieldModel
        .updateOne({ name, documentId }, data, { upsert: true })
        .exec(),
      this.updateDocument(documentId, { lastModify }),
    ]);
  }

  async copyTempFileToS3(
    remoteFileInfo: { mimeType: string, remoteId: string },
    bucketEnv: string = EnvConstants.S3_DOCUMENTS_BUCKET,
    tempBucketEnv: string = EnvConstants.S3_INTEGRATION_BUCKET,
  ): Promise<string> {
    const {
      mimeType, remoteId,
    } = remoteFileInfo;
    const newBucket = this.environmentService.getByKey(bucketEnv);
    const documentBucket = this.environmentService.getByKey(tempBucketEnv);
    const documentRemoteKey = `${uuid()}.${mime.extension(mimeType)}`;
    const remoteDocumentSource = `${documentBucket}/${remoteId}`;
    return this.awsService.copyObjectS3(
      remoteDocumentSource,
      newBucket,
      documentRemoteKey,
      false,
      this.awsService.s3InstanceForDocument(),
    );
  }

  async updateWorkspaceAndGetUploadDestination(user: User, options?: { fromOpenFileFlow?: boolean }): Promise<IOrganization> {
    const { fromOpenFileFlow = false } = options || {};
    const organization = await this.getDestinationWorkspace(user, { fromOpenFileFlow });
    if (organization) {
      this.userService.updateLastAccessedOrg(user._id, organization._id);
      await this.userService.updateUserPropertyById(user._id, { 'setting.defaultWorkspace': organization._id });
    }
    return organization;
  }

  async getDestinationWorkspace(
    user: User,
    options?: {
      shouldCreateOrg?: boolean;
      byPassPremiumUser?: boolean;
      fromOpenFileFlow?: boolean;
    },
  ): Promise<IOrganization> {
    const {
      shouldCreateOrg = true,
      byPassPremiumUser = true,
      fromOpenFileFlow = false,
    } = options || {};
    const userId = user._id;
    const isFreeUser = (user.payment.type as PaymentPlanEnums) === PaymentPlanEnums.FREE;
    const orgList = await this.organizationService.getOrgListByUser(user._id);
    const userRules = new UserRules(
      this.customRulesService,
      this.customRuleLoader,
      user,
    );
    if (userRules.onlyPersonalFile) {
      return this.organizationService.findOneOrganization({
        _id: userRules.orgId,
      });
    }
    if (fromOpenFileFlow && !isFreeUser) {
      return null;
    }
    const defaultWorkspaceId = user.setting.defaultWorkspace;
    const defaultWorkspace = Boolean(defaultWorkspaceId)
      && orgList.find((org) => org._id === defaultWorkspaceId.toHexString());
    if (defaultWorkspace) {
      return defaultWorkspace;
    }
    if (!isFreeUser && byPassPremiumUser) {
      return null;
    }

    if (!orgList.length && shouldCreateOrg) {
      return this.organizationService.createCustomOrganization(user);
    }

    const mainOrg = orgList.find(
      (_org) => _org.creationType === OrganizationCreationTypeEnum.AUTOMATIC,
    );
    if (mainOrg) {
      return mainOrg;
    }
    const lastAccessOrgId = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${userId}`,
    );
    const lastAccessOrg = orgList.find((org) => org._id === lastAccessOrgId);
    if (lastAccessOrg) {
      return lastAccessOrg;
    }
    const premiumOrgs = orgList.filter(
      (org) => org.payment.type !== PaymentPlanEnums.FREE,
    );
    if (premiumOrgs.length) {
      return premiumOrgs[0];
    }
    return orgList[0];
  }

  async getKeyAndSignedUrlsForOCR(documentId: string, totalParts: number) {
    const prefixEnv = this.environmentService.getByKey(EnvConstants.LAMBDA_ALIAS);
    const key = uuid();
    const listPromise = Array.from({ length: totalParts }, (_, i) => this.awsService.getOCRDocumentPresignedUrl({
      key: `ocr/${prefixEnv}/${key}-${documentId}/part${i + 1}.${mime.extension(DocumentMimeType.PDF)}`,
      position: i + 1,
    }));
    const listSignedUrls = (await Promise.all(listPromise)).map(({ url }) => url);
    return {
      key: `${key}-${documentId}`,
      listSignedUrls,
    };
  }

  async getTargetOrgWithPremiumStatus(
    user: User,
    orgId?: string,
  ): Promise<{ isPremiumOrg: boolean; targetOrgId: string }> {
    const { payment: { type: userPlan } } = user;
    const isPremiumUser = userPlan !== (PaymentPlanEnums.FREE as string);
    if (isPremiumUser) {
      return { isPremiumOrg: false, targetOrgId: null };
    }

    const { _id: orgUploadDestinationId } = await this.updateWorkspaceAndGetUploadDestination(user);
    const targetOrgId = orgId || orgUploadDestinationId;

    const { payment: { type: orgPlan } } = await this.organizationService.getOrgById(targetOrgId, { payment: 1 });
    const isPremiumOrg = orgPlan !== (PaymentPlanEnums.FREE as string);

    return { isPremiumOrg, targetOrgId };
  }

  async getFormFieldByDocumentId(
    documentId: string,
    projection?: ProjectionType<IDocumentFormFieldModel>,
    options?: QueryOptions,
  ): Promise<IDocumentFormField[]> {
    const formFields = await this.documentFormFieldModel.find({ documentId }, projection, options).exec();
    return formFields?.map((formField) => ({ ...formField.toObject(), _id: formField._id.toHexString() }));
  }

  getFormFieldByIds(ids: string[], projection?: ProjectionType<IDocumentFormFieldModel>) {
    return this.documentFormFieldModel.find({ _id: { $in: ids } }, projection).exec();
  }

  deleteFormFieldByIds(ids: string[]) {
    return this.documentFormFieldModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  deleteFormFieldFromDocument(documentId: string) {
    return this.documentFormFieldModel.deleteMany({ documentId }).exec();
  }

  deleteFormFieldFromDocumentByFieldName(documentId: string, fieldName: string) {
    return this.documentFormFieldModel.deleteMany({ documentId, name: fieldName }).exec();
  }

  insertManyFormField(data: IDocumentFormFieldModel[]) {
    return this.documentFormFieldModel.insertMany(data);
  }

  async copyFormFields(sourceDocId: string, copiedDocId: string) {
    const formFields = await this.documentFormFieldModel.find({ documentId: sourceDocId }, { _id: 0 }).lean().exec();
    return this.insertManyFormField(
      formFields.map((formField) => ({
        ...formField,
        documentId: copiedDocId,
      })),
    );
  }

  async ensureUniqueThirdPartyDocument(targetUserId: string, prioritizeOrgId?: string) {
    const remoteIdWithDuplicateDocs = await this.aggregateDocument<{ _id: string, count: number, documents: IDocument[] }>([
      { $match: { ownerId: new Types.ObjectId(targetUserId), remoteId: { $exists: true } } },
      { $group: { _id: '$remoteId', count: { $sum: 1 }, documents: { $addToSet: '$$ROOT' } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (!remoteIdWithDuplicateDocs.length) {
      return;
    }

    const allDocPermissions = await this.getDocumentPermissionByConditions({
      documentId: { $in: remoteIdWithDuplicateDocs.map(({ documents }) => documents.map(({ _id }) => _id)).flat() },
    });

    const getDocumentToRemove = (documents: IDocument[]) => {
      const docIds = documents.map(({ _id }) => _id.toHexString());
      const docPermissions = allDocPermissions.filter(({ documentId }) => docIds.includes(documentId.toHexString()));
      // If not prioritize doc in org, we prioritize doc in personal workspace
      const docPermissionToKeep = docPermissions.find(({ workspace }) => (prioritizeOrgId
        ? workspace.refId.toHexString() === prioritizeOrgId
        : !workspace));

      if (!docPermissionToKeep) {
        return [];
      }

      return documents.filter((doc) => doc._id.toHexString() !== docPermissionToKeep.documentId.toHexString());
    };

    const docToRemove: IDocument[] = [];
    remoteIdWithDuplicateDocs.forEach(({ documents }) => { docToRemove.push(...getDocumentToRemove(documents)); });
    Promise.all(docToRemove.map((doc) => this.deleteOriginalDocument({ ...doc, _id: doc._id.toHexString() })));
  }

  // TODO move to separate service
  async addToRecentDocumentList({ userId, organizationId, documents }: { userId: string, organizationId: string, documents: IDocument[] }) {
    const documentIds = documents.map(({ _id }) => _id);

    await this.recentDocumentListModel.findOneAndUpdate(
      { userId, organizationId },
      { $pull: { documents: { _id: { $in: documentIds } } } },
    );

    await this.recentDocumentListModel.findOneAndUpdate(
      { userId, organizationId },
      {
        $push: { documents: { $each: documentIds.map((_id) => ({ _id })), $position: 0, $slice: MAXIMUM_RECENT_DOCUMENTS } },
      },
      { returnDocument: 'after', upsert: true },
    );

    documents.forEach((doc) => {
      this.publishUpdateDocument(
        [userId],
        {
          document: doc,
          type: SUBSCRIPTION_DOCUMENT_LIST_RECENT_DOCUMENT_ADDED,
        },
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
      );
    });
  }

  async removeFromRecentDocumentList(documentIds: string[], session?: ClientSession) {
    await this.recentDocumentListModel.updateMany(
      { 'documents._id': { $in: documentIds } },
      { $pull: { documents: { _id: { $in: documentIds } } } },
    ).session(session).exec();
  }

  async removeDocumentsFromUserRecentList({
    userId,
    documentIds,
    organizationId,
    session = null,
  }: {
    userId: string;
    documentIds: string[];
    organizationId?: string;
    session?: ClientSession;
  }): Promise<void> {
    const filter: FilterQuery<IRecentDocumentList> = { userId };

    // If organizationId is provided, filter by specific organization
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    await this.recentDocumentListModel.updateMany(
      filter,
      { $pull: { documents: { _id: { $in: documentIds } } } },
    ).session(session).exec();
  }

  async deleteRecentDocumentList({ userId, organizationId, session = null }: { userId: string, organizationId?: string, session?: ClientSession }) {
    if (!organizationId) {
      await this.recentDocumentListModel.deleteMany({ userId }).session(session).exec();
      return;
    }
    await this.recentDocumentListModel.deleteOne({ userId, organizationId }).session(session).exec();
  }

  async getPopulatedRecentDocumentList({
    userId,
    organizationId,
    cursor,
    limit,
  }: {
    userId: string;
    organizationId: string;
    cursor?: string;
    limit?: number;
  }): Promise<IPopulatedRecentDocument[]> {
    const permissionStage: PipelineStage.Lookup['$lookup'] = {
      from: 'documentpermissions',
      localField: 'documents._id',
      foreignField: 'documentId',
      as: 'permissions',
    };
    const documentStage: PipelineStage.Lookup['$lookup'] = {
      from: 'documents',
      localField: 'documents._id',
      foreignField: '_id',
      as: 'document',
    };

    const pipelineBuilder = this.recentDocumentListModel
      .aggregate<IPopulatedRecentDocument>()
      .match({ userId: new Types.ObjectId(userId), organizationId: new Types.ObjectId(organizationId) })
      .unwind('$documents')
      .sort({ 'documents.openedAt': -1 });

    if (cursor) {
      pipelineBuilder.match({ 'documents.openedAt': { $lt: new Date(Number(cursor)) } });
    }
    if (limit) {
      pipelineBuilder.limit(limit);
    }

    pipelineBuilder
      .lookup(permissionStage)
      .match({ 'permissions.0': { $exists: true } })
      .lookup(documentStage)
      .addFields({ 'document.openedAt': '$documents.openedAt' })
      .unwind('$document')
      .replaceRoot('$document');

    const documents = await pipelineBuilder.exec();
    return documents;
  }

  async getRecentDocumentList(userId: string, organizationId: string): Promise<IRecentDocumentList> {
    const recentDocumentList = await this.recentDocumentListModel.findOne({ userId, organizationId }).lean().exec();
    if (!recentDocumentList) {
      return null;
    }

    return {
      ...recentDocumentList,
      _id: recentDocumentList._id.toHexString(),
    };
  }

  async haveDocumentsAvailable(user: User, organization: IOrganization): Promise<boolean> {
    const personalDoc = await this.findOneDocumentPermission({
      refId: user._id,
      role: DocumentRoleEnum.OWNER,
      'workspace.refId': organization._id,
      documentKind: { $exists: false },
    });

    if (personalDoc) {
      return true;
    }

    const organizationDoc = await this.findOneDocumentPermission({
      refId: organization._id,
      role: DocumentRoleEnum.ORGANIZATION,
      documentKind: { $exists: false },
    });
    if (organizationDoc) {
      return true;
    }

    const userTeams = await this.teamService.getUserTeams(user, organization);
    const teamDocument = await this.findOneDocumentPermission({
      refId: { $in: userTeams.map((team) => team._id) },
      role: DocumentRoleEnum.ORGANIZATION_TEAM,
      documentKind: { $exists: false },
    });
    return Boolean(teamDocument);
  }

  async getOrganizationDocuments(
    user: User,
    organization: IOrganization,
    userTeams: ITeam[],
    input: WithRequired<GetOrganizationResourcesInput, 'limit'>,
  ): Promise<{ results: IDocument[]; cursor: string, total: number }> {
    const lookupUtils = new OrganizationResourcesLookupUtils<IDocument>(
      {
        user, organization, userTeams, model: this.documentPermissionModel,
      },
    );
    return lookupUtils.lookup(input);
  }

  async updateRecentDocumentsAfterMove(params: {
    moveToPersonalWorkspace: boolean,
    documentIds: string[],
    actorId: string,
    orgId?: string,
  }): Promise<void> {
    const {
      moveToPersonalWorkspace,
      documentIds,
      actorId,
      orgId,
    } = params;

    if (moveToPersonalWorkspace) {
      await this.removeFromRecentDocumentList(documentIds);
    } else if (orgId) {
      const updatedDocuments = await this.findDocumentsByIds(documentIds);
      await this.addToRecentDocumentList({
        userId: actorId,
        organizationId: orgId,
        documents: updatedDocuments,
      });
    }
  }

  async updateRecentDocumentsForThirdParty(params: {
    organization?: IOrganization,
    existingDocuments: Document[],
    userId: string,
    newDocuments: IDocument[],
  }): Promise<void> {
    const {
      organization,
      existingDocuments,
      userId,
      newDocuments,
    } = params;

    if (!organization) {
      return;
    }

    if (existingDocuments.length) {
      const existingDocumentIds = existingDocuments.map((document) => document._id);
      await this.removeFromRecentDocumentList(existingDocumentIds);
    }

    await this.addToRecentDocumentList({
      userId,
      organizationId: organization._id,
      documents: newDocuments,
    });
  }

  async getTotalDocumentsSizeByIds({
    documentIds, options,
  }: {
    documentIds: string[], options?: AggregateOptions,
  }): Promise<number> {
    const results = await Utils.executeQueryInChunk<{ totalSize: number }>(
      documentIds,
      (ids) => this.documentModel.aggregate([
        { $match: { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ], options),
    );
    return results.reduce((total, result) => total + result.totalSize, 0);
  }

  async getDocumentsByFolderIds({
    folderIds, projection, options,
  }: {
    folderIds: string[], projection?: ProjectionType<IDocument>, options?: QueryOptions<IDocument>
  }): Promise<Document[]> {
    return Utils.executeQueryInChunk<Document>(
      folderIds,
      (ids) => this.documentModel.find({ folderId: { $in: ids.map((id) => new Types.ObjectId(id)) } }, projection, options),
    );
  }

  async checkDownloadMultipleDocuments(input: CheckDownloadMultipleDocumentsInput): Promise<CheckDownloadMultipleDocumentsPayload> {
    const { documentIds = [], folderIds, orgId } = input;
    const combinedDocumentIds = [...documentIds];

    // get all documents from folderIds
    if (folderIds?.length) {
      const folders = await Promise.all(folderIds.map((folderId) => this.folderService.findFolderDescendants({ folderId })));
      const descendantsFolderIds = folders.flatMap((folder) => folder.map(({ _id }) => _id));
      const fullFolderIds = uniq([...folderIds, ...descendantsFolderIds]);
      const documentsInFolder = await this.getDocumentsByFolderIds({ folderIds: fullFolderIds, projection: { _id: 1 } });
      const documentIdsInFolder = documentsInFolder.map((document) => document._id.toHexString());
      combinedDocumentIds.push(...documentIdsInFolder);
    }

    // check document quantity
    const totalDocuments = combinedDocumentIds.length;
    if (totalDocuments > MAX_DOCUMENTS_PER_DOWNLOAD) {
      return {
        isDocumentLimitExceeded: true,
        totalDocuments,
      };
    }

    // check document size
    const totalDocumentsSize = await this.getTotalDocumentsSizeByIds({ documentIds: combinedDocumentIds });
    if (totalDocumentsSize > MAX_DOCUMENTS_SIZE_PER_DOWNLOAD) {
      return {
        isTotalSizeExceeded: true,
        totalDocuments,
      };
    }

    // check hit doc stack
    if (!orgId) {
      return { totalDocuments };
    }

    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }

    const totalStackedDocuments = await this.organizationDocStackService.countStackedDocuments({
      orgId: organization._id,
      documentIds: combinedDocumentIds,
    });
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: combinedDocumentIds.length - totalStackedDocuments,
    });
    if (!hasRemainingDocStack) {
      return {
        isDocStackInsufficient: true,
        totalDocuments,
      };
    }

    return { totalDocuments };
  }

  async getTargetOwnedDocumentId(documentId: string): Promise<string> {
    const docPermission = await this.getDocumentPermissionByGroupRole(
      documentId,
      [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
    );
    if (!docPermission) {
      return null;
    }
    let orgId: string;
    if (docPermission) {
      switch (docPermission.role as DocumentRoleEnum) {
        case DocumentRoleEnum.OWNER:
          orgId = docPermission.workspace?.refId;
          break;
        case DocumentRoleEnum.ORGANIZATION: {
          orgId = docPermission.refId;
          break;
        }
        case DocumentRoleEnum.ORGANIZATION_TEAM: {
          const team = await this.teamService.findOneById(docPermission.refId, { belongsTo: 1 });
          orgId = team.belongsTo as string;
          break;
        }
        default:
          break;
      }
    }
    return orgId;
  }

  async estimateMentionableMembers({ roles, documentId }: {roles: DocumentRoleEnum[], documentId: string}): Promise<number> {
    const documentPermissions = await this.getDocumentPermissionsByDocId(documentId, {
      role: {
        $in: roles,
      },
    });

    if (!documentPermissions?.[0]) {
      return 0;
    }
    const { role, refId } = documentPermissions[0];
    if (<DocumentRoleEnum>role === DocumentRoleEnum.ORGANIZATION) {
      const estimatedCount = await this.organizationService.estimateMentionableMembers({
        orgId: refId,
      });
      return estimatedCount;
    }
    if (<DocumentRoleEnum>role === DocumentRoleEnum.ORGANIZATION_TEAM) {
      const estimatedCount = await this.membershipService.estimateMentionableMembers(refId);
      return estimatedCount;
    }

    return 0;
  }

  async checkShareThirdPartyDocument({
    sharer,
    documentId,
  }: { sharer: User; documentId: string }): Promise<CheckShareThirdPartyDocumentPayload> {
    const documentPermission = await this.getOneDocumentPermission(sharer._id, {
      documentId,
      role: DocumentRoleEnum.OWNER,
    });
    if (!documentPermission) {
      throw GraphErrorException.Forbidden(
        'You do not have permission to share this document',
        ErrorCode.Document.NO_DOCUMENT_PERMISSION,
      );
    }
    const document = await this.getDocumentByDocumentId(documentId);
    if ((document.service as DocumentStorageEnum) === DocumentStorageEnum.S3) {
      throw GraphErrorException.Forbidden(
        'Not allowed to check this document',
      );
    }

    const canFinishedDocument = await this.organizationDocStackService.validateCanFinishDocument(documentId);

    return { isAllowed: canFinishedDocument };
  }

  async shareDocument(
    {
      sharer, documentId, emails, role, message,
    }:
    { sharer: User, documentId: string, emails: string[], role: DocumentRole, message?: string },
  ): Promise<{ message: string, statusCode: number }> {
    await this.userService.checkEmailInput(emails);
    const sharerId = sharer._id;
    const users = await this.userService.findUserByEmails(emails);
    const document = await this.getDocumentByDocumentId(
      documentId,
    );
    const luminUserPermissions: IShareDocumentInvitation[] = await Promise.all(users.map(async (userInfo) => {
      const existedPermission = await this.checkExistedDocPermission(userInfo._id, document as unknown as Document);
      return {
        _id: userInfo._id,
        email: userInfo.email,
        ...existedPermission,
      };
    }));
    const nonLuminUserEmails = difference(emails, luminUserPermissions.map(({ email }) => email));

    if (document && (document.service as DocumentStorageEnum) !== DocumentStorageEnum.S3) {
      return {
        message: 'Cannot share document on drive or dropbox',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    const documentBelongTo = await this.getDocumentBelongTo(
      sharerId,
      documentId,
    );
    if (!documentBelongTo) {
      throw GraphErrorException.BadRequest(
        'Cannot get document permission',
        ErrorCode.Document.NO_DOCUMENT_PERMISSION,
      );
    }

    const newSharedIds: string[] = luminUserPermissions.filter(({ hasPermission }) => !hasPermission).map(({ _id }) => _id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // const sharer = await this.userService.findUserById(sharerId);

    const sanitizeMessage = encodeHtml(message);
    await this.shareDocumentToLuminUser(
      {
        userInvitations: luminUserPermissions,
        role,
        sharer,
        message: sanitizeMessage,
        document: document as unknown as Document,
      },
    );
    if (nonLuminUserEmails.length) {
      await this.shareDocumentNonLuminUser({
        document: document as unknown as Document, role, message, nonLuminUserEmails, sharer,
      });
    }

    // track user use document
    const useDocumentEvent: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_USED,
      eventScope: EventScopes.PERSONAL,
      actor: sharer,
      document: document as unknown as Document,
    };
    this.personalEventService.createUserUseDocumentEvent(useDocumentEvent);

    // send out-app noti for mobile
    const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.SHARE, {
      actor: sharer,
      document,
    });
    this.notificationService.publishFirebaseNotifications(newSharedIds, notificationContent, notificationData);

    this.updateUserContactWhenShareDocument(sharerId, newSharedIds);
    return {
      message: 'Success',
      statusCode: HttpStatus.OK,
    };
  }

  async getShareInviteByEmailList(
    { actor, documentId, searchKey }:
    { actor: User, documentId: string, searchKey?: string },
  ): Promise<GetShareInviteByEmailListPayload> {
    const searchKeyRegex = searchKey
      ? Utils.transformToSearchRegex(searchKey)
      : '';
    const [nonUsers, externalDocumentPermissions, documentData] = await Promise.all([
      this.findNonUserByDocumentId(documentId, searchKeyRegex),
      this.getDocumentPermissionsByDocId(documentId, {
        role: { $nin: ['organization', 'organization_team'] },
      }),
      this.getDocumentByDocumentId(documentId),
    ]);
    const refIds = externalDocumentPermissions.map(
      (documentpermission) => documentpermission.refId,
    );
    const externalSharees = await this.userService.findExternalSharees(
      refIds,
      searchKeyRegex as string,
    );

    const returnUsers = externalSharees
      .filter((user) => user?._id)
      .map((user) => ({
        ...user,
        role: externalDocumentPermissions.find(
          (docPermission) => docPermission.refId.toHexString() === user._id,
        ).role,
        type: USER_SHARING_TYPE.EXTERNAL,
      }));

    // add owner document to externalSharees in case document circle or team
    if (!documentData.isPersonal) {
      const ownerDocumentData = await this.userService.findUserById(documentData.ownerId, { avatarRemoteId: 1, email: 1, name: 1 });
      // in case owner of document has deleted their account, need enhance later (update document owner to CA and)
      if (ownerDocumentData) {
        returnUsers.unshift({
          ...ownerDocumentData,
          role: DocumentRoleEnum.OWNER,
          type: USER_SHARING_TYPE.EXTERNAL,
        });
      }
    }

    // move current user to head of array
    returnUsers.forEach((user, index) => {
      if (user._id === actor._id) {
        returnUsers.splice(index, 1);
        returnUsers.unshift(user);
      }
    });
    return {
      sharees: [...(returnUsers as {
        role: string;
        type: string;
        _id: string;
      }[]), ...nonUsers],
    };
  }

  async handleUpdateDocumentPermission(
    {
      actorId, documentId, role, email,
    }:
    { actorId: string, documentId: string, role: DocumentRole, email: string },
  ): Promise<{ success: boolean }> {
    const findUser = await this.userService.findUserByEmail(email);
    if (!findUser) {
      const result = this.updateDocumentPermissionNonLuminUser(
        { email, documentId },
        role.toLowerCase(),
      );
      return { success: !!result };
    }

    // User has been granted access to the document but hasn't signed in yet
    if (!findUser.timezoneOffset) {
      await this.createNonLuminUserDocumentPermission({
        user: findUser,
        orgIds: [],
        teamIds: [],
      });
    }

    const personalDocumentPermission = (
      await this.getDocumentPermissionsByDocId(documentId, {
        refId: findUser._id,
      })
    )[0];
    const [requestAccess] = await this.getRequestAccessData(findUser._id, documentId);

    const removeRequestAccessPayload = {
      documentId,
      users: [{
        _id: findUser._id,
        requestRole: requestAccess?.documentRole,
      }],
      newRole: role.toLowerCase() as DocumentRoleEnum,
    };

    if (!personalDocumentPermission) {
      const documentPermission = (
        await this.getDocumentPermissionsByDocId(documentId, {
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
          'Does not have document permission',
          ErrorCode.Document.NO_DOCUMENT_PERMISSION,
        );
      }
      const roleOfDocumentPermission: DocumentRoleEnum = documentPermission.role as DocumentRoleEnum;
      await this.validateUpdatePermission({
        actorId,
        roleOfDocumentPermission,
        findUser,
        documentPermission,
      });
      const pathQuery = `groupPermissions.${findUser._id}`;
      const updatePermissionObject = {};
      updatePermissionObject[pathQuery] = DocumentPermissionOfMemberEnum[role];

      this.updateDocumentPermissionInOrg(
        { refId: documentPermission.refId, documentId },
        updatePermissionObject,
      );
      await this.removeRequestsAfterPermissionChanged(removeRequestAccessPayload);
    }

    if (personalDocumentPermission && (personalDocumentPermission.role as IndividualRoles) === IndividualRoles.OWNER) {
      throw GraphErrorException.NotAcceptable(
        'Can not update role of owner document',
        ErrorCode.Common.NO_PERMISSION,
      );
    }
    const [currentDocumentPermission] = await this.getDocumentPermission(actorId, { documentId });
    if (currentDocumentPermission && currentDocumentPermission.role === personalDocumentPermission.role) {
      throw GraphErrorException.Forbidden('You don\'t have permission');
    }
    await this.updateManyDocumentPermission(
      { documentId, refId: findUser._id },
      { role: role.toLowerCase() },
    );
    const documentInfo = await this.findOneById(documentId);

    await this.removeRequestsAfterPermissionChanged(removeRequestAccessPayload);

    const actor = await this.userService.findUserById(actorId);
    this.sendUpdateDocumentPermissionNotification({
      actor, document: documentInfo as unknown as Document, sharedIds: [findUser._id], role,
    });

    // send out-app noti for mobile
    const roleUpdated = this.getRoleText(role.toLowerCase() as DocumentRoleEnum);
    const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.UPDATE_USER_PERMISSION, {
      actor,
      document: documentInfo,
      role: roleUpdated,
    });
    this.notificationService.publishFirebaseNotifications(
      [findUser._id],
      notificationContent,
      notificationData,
    );

    return { success: true };
  }

  async preCheckShareDocumentInSlack(sharer: User, input: PreCheckShareDocumentInSlackInput): Promise<PreCheckShareDocumentInSlackResponse> {
    const { documentId, slackTeamId, conversation } = input;
    await this.validateDocumentForSlackSharing(documentId);

    const shareInvite = await this.getShareInviteByEmailList({ actor: sharer, documentId });
    const shareeEmails = (shareInvite.sharees || [])
      .filter((invite) => (invite.role as DocumentRoleEnum) !== DocumentRoleEnum.OWNER)
      .map((invite) => invite.email);

    if (conversation.type === SlackConversationType.DIRECT_MESSAGE) {
      const slackUser = await this.slackService.getSlackUserInfo(sharer._id, slackTeamId, conversation.id);
      return {
        isPermissionUpdateNeeded: shareeEmails.includes(slackUser.email),
      };
    }

    const slackChannelMembers = await this.slackService.getSlackChannelMembers(sharer._id, slackTeamId, conversation.id);

    const isPermissionUpdateNeeded = await this.slackService.checkEmailExistsInSlackUsers(
      sharer._id,
      slackTeamId,
      shareeEmails,
      slackChannelMembers,
    );
    return {
      isPermissionUpdateNeeded,
    };
  }

  async shareDocumentInSlack(
    sharer: User,
    input: ShareDocumentInSlackInput,
  ): Promise<{ hasNewSharing: boolean; hasUnshareableEmails: boolean; isQueuedSharing: boolean }> {
    const {
      documentId, slackTeamId, conversation, sharingMode, role, message, isOverwritePermission,
    } = input;

    const document = await this.validateDocumentForSlackSharing(documentId, true);

    if (sharingMode === ShareLinkType.INVITED && conversation.type === SlackConversationType.CHANNEL) {
      const totalMembers = await this.slackService.getSlackChannelMembers(sharer._id, slackTeamId, conversation.id);
      const maxMembers = Number(this.environmentService.getByKey(EnvConstants.SLACK_PRIVATE_SHARING_MEMBER_THRESHOLD));
      if (totalMembers.length > maxMembers) {
        throw GraphErrorException.BadRequest(`Cannot share to channel with more than ${maxMembers} members`);
      }
    }

    // get restricted domains
    const userRules = new UserRules(this.customRulesService, this.customRuleLoader, sharer);
    const restrictedDomains = userRules.cannotShareDocWith;

    // get shared emails
    const shareInvite = await this.getShareInviteByEmailList({ actor: sharer, documentId });
    const sharees = shareInvite.sharees || [];
    const ownerDoc = sharees.find((sharee) => (sharee.role as DocumentRoleEnum) === DocumentRoleEnum.OWNER);
    const ownerEmail = ownerDoc?.email?.toLowerCase();
    const sharedEmails = sharees.map((sharee) => sharee.email.toLowerCase()).filter((email) => email !== ownerEmail);

    let slackMemberEmails: string[] = [];
    // Handle direct message sharing
    if (conversation.type === SlackConversationType.DIRECT_MESSAGE) {
      const slackUser = await this.slackService.getSlackUserInfo(sharer._id, slackTeamId, conversation.id);
      const slackUserEmail = slackUser.email.toLowerCase();

      if (restrictedDomains.includes(Utils.getEmailDomain(slackUserEmail))) {
        throw GraphErrorException.BadRequest('You cannot share document to this user');
      }

      slackMemberEmails = slackUserEmail !== ownerEmail ? [slackUserEmail] : [];
    } else if (sharingMode === ShareLinkType.INVITED) {
      // Handle channel sharing
      const channelMemberEmails = await this.slackService.getSlackChannelMemberEmails(sharer._id, slackTeamId, conversation.id);
      slackMemberEmails = channelMemberEmails.filter((email) => email !== ownerEmail);
    }

    await this.updateExistingPermissionsForSlackSharing({
      actorId: sharer._id,
      documentId,
      role,
      emails: intersection(sharedEmails, slackMemberEmails),
      isOverwritePermission,
    });

    const sharingResult = await this.shareWithSlackMembers({
      sharer,
      documentId,
      originalSharingMode: document.shareSetting.linkType,
      emails: difference(slackMemberEmails, sharedEmails),
      sharingMode,
      role,
      restrictedDomains,
      message,
      isOverwritePermission,
      isChannelSharing: conversation.type === SlackConversationType.CHANNEL,
    });

    // update share settings for the document
    await this.updateShareSettingForSlackSharing({
      document,
      documentId,
      role,
      sharingMode,
    });

    // Post message to Slack
    await this.slackService.postShareDocumentMessage({
      userId: sharer._id,
      teamId: slackTeamId,
      conversation,
      document,
      sharingMessage: message,
    });

    return sharingResult;
  }

  private async validateDocumentForSlackSharing(documentId: string, validateS3Storage?: boolean): Promise<IDocument> {
    const document = await this.getDocumentByDocumentId(documentId);
    if (!document) {
      throw GraphErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }

    if (!document.isPersonal || (validateS3Storage && (document.service as DocumentStorageEnum) !== DocumentStorageEnum.S3)) {
      throw GraphErrorException.Forbidden('Not allowed to share document in Slack');
    }

    return document;
  }

  private async updateExistingPermissionsForSlackSharing({
    actorId,
    documentId,
    role,
    emails,
    isOverwritePermission,
  }: {
    actorId: string;
    documentId: string;
    role: DocumentRole;
    emails: string[];
    isOverwritePermission: boolean;
  }): Promise<void> {
    if (!isOverwritePermission || !emails.length) {
      return;
    }

    const emailBatches = chunk(emails, 10);
    // Process batches sequentially using reduce to avoid overwhelming the system
    await emailBatches.reduce(
      (previousPromise, batch) => previousPromise.then(() => Promise.all(
        batch.map((email) => this.handleUpdateDocumentPermission({
          actorId,
          documentId,
          role,
          email,
        })),
      )),
      Promise.resolve(),
    );
  }

  private async updateShareSettingForSlackSharing({
    document,
    documentId,
    role,
    sharingMode,
  }: {
    document: Document;
    documentId: string;
    role: DocumentRole;
    sharingMode: ShareLinkType;
  }): Promise<void> {
    if (document.shareSetting.linkType !== ShareLinkType.INVITED || sharingMode !== ShareLinkType.ANYONE) {
      return;
    }

    const shareLinkPermissionMapping = {
      [DocumentRole.EDITOR]: ShareLinkPermission.EDITOR,
      [DocumentRole.VIEWER]: ShareLinkPermission.VIEWER,
      [DocumentRole.SPECTATOR]: ShareLinkPermission.SPECTATOR,
      [DocumentRole.SHARER]: ShareLinkPermission.VIEWER,
    };
    await this.updateShareSetting(
      documentId,
      shareLinkPermissionMapping[role],
      sharingMode,
    );
  }

  private async shareWithSlackMembers({
    sharer,
    documentId,
    emails,
    originalSharingMode,
    sharingMode,
    role,
    restrictedDomains,
    message,
    isOverwritePermission,
    isChannelSharing,
  }: {
    sharer: User;
    documentId: string;
    emails: string[];
    originalSharingMode: ShareLinkType;
    sharingMode: ShareLinkType;
    role: DocumentRole;
    restrictedDomains: string[];
    message?: string;
    isOverwritePermission?: boolean;
    isChannelSharing: boolean;
  }): Promise<{ hasNewSharing: boolean; hasUnshareableEmails: boolean; isQueuedSharing: boolean }> {
    // create new sharing if change from anyone to invited for share setting
    let hasNewSharing = sharingMode === ShareLinkType.ANYONE && originalSharingMode === ShareLinkType.INVITED;
    let hasUnshareableEmails = false;
    let isQueuedSharing = false;

    const validEmails = emails.filter((email) => !restrictedDomains.includes(Utils.getEmailDomain(email)));

    if (sharingMode !== ShareLinkType.INVITED || !validEmails.length) {
      return { hasNewSharing, hasUnshareableEmails, isQueuedSharing };
    }

    const sharingExecutionId = uuid();
    const emailBatches = chunk(validEmails, 10);
    if (emailBatches.length === 1) {
      await this.shareDocument({
        sharer,
        documentId,
        emails: validEmails,
        role,
        message,
      });

      const restrictedDomainEmails = difference(emails, validEmails);
      if (restrictedDomainEmails.length) {
        hasUnshareableEmails = true;

        this.loggerService.warn({
          context: this.shareWithSlackMembers.name,
          message: 'Slack sharing limited by domain rules',
          extraInfo: {
            sharerId: sharer._id,
            documentId,
            restrictedDomains: restrictedDomainEmails.map((email) => Utils.getEmailDomain(email)),
          },
        });
      }
    } else {
      await this.redisService.setExpectedDocumentSharing(sharer._id, sharingExecutionId, emailBatches.length);
      // send each batch of emails to queue
      emailBatches.forEach((emailBatch, index) => new Promise<void>((resolve) => {
        setTimeout(() => {
          const payload: DocumentSharingQueueRequestPayload = {
            sharingExecutionId,
            batchIndex: index,
            isChannelSharing,
            sharerId: sharer._id,
            documentId,
            emails: emailBatch,
            role,
            message,
            isOverwritePermission,
          };
          this.rabbitMQService.publish(
            EXCHANGE_KEYS.LUMIN_WEB_DOCUMENT_SHARING,
            ROUTING_KEY.LUMIN_WEB_DOCUMENT_SHARE_IN_SLACK_DEFAULT,
            payload,
          );
          resolve();
        }, 500 + (index * 1000)); // Delay each batch by 1000ms
      }));
      isQueuedSharing = true;
    }
    hasNewSharing = true;

    return { hasNewSharing, hasUnshareableEmails, isQueuedSharing };
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_KEYS.LUMIN_SIGN_X_EDITOR,
    routingKey: ROUTING_KEY.LUMIN_SIGN_SYNC_PROOFING_STATUS,
    queue: QUEUES.LUMIN_SIGN_PROOFING_SYNC_STATUS,
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      messageTtl: 2 * 60 * 1000,
    },
  })
  onProofingProgress(message: ProofingProgressMessage) {
    const { data: { documentId, userId } } = message;
    const isLocalFile = documentId.startsWith('system-');
    const targetRoom = isLocalFile
      ? SocketRoomGetter.user(userId)
      : SocketRoomGetter.document(documentId);
    this.messageGateway.server.in(targetRoom).emit('syncProofingProgress', message);
  }

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_WEB_DOCUMENT_SHARE_IN_SLACK,
    errorHandler: defaultNackErrorHandler,
  })
  async handleShareDocumentInSlackRequest(message: DocumentSharingQueueRequestPayload): Promise<SubscribeResponse> {
    const {
      sharingExecutionId,
      batchIndex,
      isChannelSharing,
      sharerId,
      documentId,
      emails,
      role,
      message: shareMessage,
      isOverwritePermission,
    } = message;
    const sharer = await this.userService.findUserById(sharerId);
    if (!sharer) {
      throw HttpErrorException.NotFound('Sharer not found', ErrorCode.User.USER_NOT_FOUND);
    }

    const document = await this.getDocumentByDocumentId(documentId);
    if (!document) {
      throw HttpErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }

    try {
      await this.shareDocument({
        sharer,
        documentId,
        emails,
        role,
        message: shareMessage,
      });
    } catch (error) {
      await this.redisService.setFailedDocumentSharing(sharerId, sharingExecutionId, emails);
      this.loggerService.error({
        context: this.handleShareDocumentInSlackRequest.name,
        message: 'Failed to share document in Slack with some emails',
        error: this.loggerService.getCommonErrorAttributes(error),
        extraInfo: {
          sharerId: sharer._id,
          documentId,
          sharingExecutionId,
          batchIndex,
          emailCount: emails.length,
        },
      });
    }

    await this.redisService.increaseProcessedDocumentSharingQueue(sharerId, sharingExecutionId);
    const { expected, processed } = await this.redisService.getDocumentSharingQueue(sharerId, sharingExecutionId);
    if (processed === expected) {
      const failedEmails = await this.redisService.getFailedDocumentSharing(sharerId, sharingExecutionId);
      this.publishDocumentSharingQueue(
        [sharerId],
        {
          isChannelSharing,
          documentName: document.name,
          hasUnshareableEmails: failedEmails.length > 0,
          ...(isOverwritePermission !== undefined && { isOverwritePermission }),
          documentId,
        },
      );
      await this.redisService.removeDocumentSharingQueueKeys(sharerId, sharingExecutionId);
    }
    return new Nack();
  }

  async migrateDocumentDriveMetadataSharer() {
    const cursor = this.documentDriveMetadataModel.find({
      sharers: { $exists: true, $elemMatch: { $type: 'string' } },
    }).cursor();
    let bulkOperations = [];
    const batchSize = 1000;
    let document: IDocumentDriveMetadata;

    // eslint-disable-next-line no-await-in-loop
    while ((document = await cursor.next() as unknown as IDocumentDriveMetadata)) {
      try {
        if (document.sharers && Array.isArray(document.sharers)) {
          let needsMigration = false;
          const migratedSharers = [];
          for (let i = 0; i < document.sharers.length; i++) {
            const sharer = document.sharers[i];
            if (typeof sharer === 'string') {
              needsMigration = true;
              migratedSharers.push({
                email: sharer,
                name: null,
                avatar: null,
              });
            } else if (typeof sharer === 'object' && sharer !== null && 'email' in sharer) {
              migratedSharers.push(sharer);
            } else {
              this.loggerService.info({
                context: this.migrateDocumentDriveMetadataSharer.name,
                message: `Unexpected sharer type for document ${document._id}: ${typeof sharer}`,
              });
            }
          }

          if (needsMigration) {
            bulkOperations.push({
              updateOne: {
                filter: { _id: new Types.ObjectId(document._id.toHexString()) },
                update: { $set: { sharers: migratedSharers } },
              },
            });

            if (bulkOperations.length >= batchSize) {
              // eslint-disable-next-line no-await-in-loop
              const result = await this.documentDriveMetadataModel.bulkWrite(bulkOperations, {
                ordered: false,
              });
              this.loggerService.info({
                context: this.migrateDocumentDriveMetadataSharer.name,
                message: `Migrated ${bulkOperations.length} documents`,
                extraInfo: {
                  result,
                },
              });

              bulkOperations = [];
              // eslint-disable-next-line no-await-in-loop
              await new Promise((resolve) => {
                setTimeout(resolve, 1000);
              });
            }
          }
        }
      } catch (error) {
        this.loggerService.error({
          context: this.migrateDocumentDriveMetadataSharer.name,
          message: `Error migrating document ${document._id}`,
          error,
          extraInfo: {
            documentId: document._id,
          },
        });
      }
    }

    // execute any remaining bulk operations
    if (bulkOperations.length > 0) {
      try {
        const result = await this.documentDriveMetadataModel.bulkWrite(bulkOperations, {
          ordered: false,
        });
        bulkOperations = [];
        this.loggerService.info({
          context: this.migrateDocumentDriveMetadataSharer.name,
          message: `Migrated ${bulkOperations.length} documents`,
          extraInfo: {
            result,
          },
        });
      } catch (error) {
        this.loggerService.error({
          context: this.migrateDocumentDriveMetadataSharer.name,
          message: 'Failed to execute final batch',
          error: this.loggerService.getCommonErrorAttributes(error),
        });
      }
    }
  }

  async isEnabledDocumentIndexing(ownerId: string, documentPermission: IDocumentPermission) {
    const { role } = documentPermission;
    let organization = null;
    switch (role as DocumentRoleEnum) {
      case DocumentRoleEnum.OWNER: {
        const orgId = documentPermission.workspace?.refId;
        organization = await this.organizationService.getOrgById(orgId);
        break;
      }

      case DocumentRoleEnum.ORGANIZATION: {
        const orgId = documentPermission.refId;
        organization = await this.organizationService.getOrgById(orgId);
        break;
      }

      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const teamId = documentPermission.refId;
        const team = await this.organizationTeamService.getOrgTeamById(teamId);
        organization = await this.organizationService.getOrgById(team.belongsTo);
        break;
      }
      default:
        return false;
    }

    if (!organization) {
      return false;
    }

    const owner = await this.userService.findUserById(ownerId);
    if (!owner) {
      return false;
    }

    const rules = this.customRuleLoader.getRulesForUser(owner);
    if (rules.files.allowIndexing === false) {
      return false;
    }

    const isWebAiChatbotEnabled = await this.featureFlagService.getFeatureIsOn({
      user: owner,
      organization,
      featureFlagKey: FeatureFlagKeys.WEB_AI_CHATBOT,
    });
    const isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(owner);
    return isWebAiChatbotEnabled && !isTermsOfUseVersionChanged;
  }

  async emitIndexDocumentMessage(params: {
    message: IIndexDocumentMessage,
    indexType: DocumentIndexingTypeEnum,
    operation?: IIndexDocumentOperation,
  }) {
    const { message, operation = 'index', indexType } = params;
    const routingKey = operation === 'update'
      ? ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_UPDATE
      : ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY;
    await this.rabbitMQService.publishWithPriority({
      exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
      routingKey,
      data: message,
      priority: DocumentIndexingMessagePriority[indexType],
    });

    await this.updateDocumentChunkedStatus(message.documentId, DocumentIndexingStatusEnum.PROCESSING);
    const extraInfo = omit(message, ['accessToken']);
    this.loggerService.info({
      context: `Document enqueued for ${operation}`,
      extraInfo,
    });
  }

  async updateDocumentIndexing(document: IDocument) {
    const {
      _id: documentId, remoteId, service, ownerId, name,
    } = document;

    const [documentPermission] = await this.getDocumentPermissionByConditions({
      documentId, role: { $in: [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] },
    });
    const isEnabledDocumentIndexing = await this.isEnabledDocumentIndexing(ownerId.toHexString(), documentPermission);
    this.loggerService.info({
      context: this.updateDocumentIndexing.name,
      message: 'Is enabled document indexing',
      extraInfo: {
        documentId,
        ownerId,
        isEnabledDocumentIndexing,
      },
    });
    if (!isEnabledDocumentIndexing) {
      return;
    }

    const {
      _id: documentPermissionId, refId, role,
    } = documentPermission;

    const documentIndexingPayload: IIndexDocumentMessage = {
      remoteId,
      source: service as DocumentStorageEnum,
      userId: ownerId.toHexString(),
      documentName: name,
      documentId,
      clientId: refId.toHexString(),
      workspaceId: await this.getWorkspaceFromDocumentPermission(documentPermission),
      clientType: role,
      documentPermissionId,
      folderId: document.folderId,
      origin: DocumentIndexingOriginEnum.LUMIN_PDF,
    };

    await this.emitIndexDocumentMessage({
      message: documentIndexingPayload,
      indexType: DocumentIndexingTypeEnum.UPDATED_DOCUMENT,
      operation: 'update',
    });
  }

  async updateDocumentIndexingWithDebounce(document: IDocument) {
    const { _id: documentId, ownerId } = document;
    const debounceKey = `${RedisConstants.DOCUMENT_INDEXING_DEBOUNCE}${documentId}`;

    const [documentPermission] = await this.getDocumentPermissionByConditions({
      documentId, role: { $in: [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] },
    });
    const isEnabledDocumentIndexing = await this.isEnabledDocumentIndexing(ownerId.toHexString(), documentPermission);
    if (!isEnabledDocumentIndexing) {
      return;
    }

    this.redisService.setRedisDataWithExpireTime({
      key: debounceKey,
      value: '1',
      expireTime: 600, // 10 minutes
    });
  }

  private async processDebouncedDocumentIndexing(documentId: string): Promise<void> {
    const document = await this.getDocumentByDocumentId(documentId);
    if (!document) {
      return;
    }
    await this.updateDocumentIndexing(document);
    await this.redisService.deleteRedisByKey(`${RedisConstants.DOCUMENT_INDEXING_DEBOUNCE}${documentId}`);
  }

  async updateDocumentsChunkedStatus(documentIds: string[], status: DocumentIndexingStatusEnum) {
    await this.documentModel.updateMany({ _id: { $in: documentIds } }, { $set: { 'metadata.indexingStatus': status } });
  }

  async getPersonalOrgDocumentPermissions(userId: string, orgId: string) {
    const docPermissions = await this.documentPermissionModel.find({
      refId: userId,
      role: DocumentRoleEnum.OWNER,
      'workspace.refId': orgId,
    });
    return docPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getOrgDocumentPermissions(orgId: string) {
    const docPermissions = await this.documentPermissionModel.find({
      refId: orgId,
      role: DocumentRoleEnum.ORGANIZATION,
    });
    return docPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getDocumentsToIndex(documentIds: string[]): Promise<IDocument[]> {
    const documents = await this.documentModel.find({
      _id: { $in: documentIds },
      size: { $lt: MAX_DOCUMENT_SIZE_FOR_INDEXING },
      service: DocumentStorageEnum.S3,
      mimeType: MIME_TYPE.PDF,
      ...UNPROCESSED_DOCUMENT_CONDITIONS,
    }).exec();
    return documents.map((document) => ({ ...document.toObject(), _id: document._id.toHexString() }));
  }

  async setDocumentIndexingStatus(documentIds: string[], status: DocumentIndexingStatusEnum) {
    await this.documentModel.updateMany({ _id: { $in: documentIds } }, { $set: { 'metadata.indexingStatus': status } });
  }

  async getTeamDocumentPermissions(teamId: string) {
    const docPermissions = await this.documentPermissionModel.find({
      refId: teamId,
      role: DocumentRoleEnum.ORGANIZATION_TEAM,
    });
    return docPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  getOwnerDocRole({ documentPermission, userId }: { documentPermission: IDocumentPermission; userId: string }): string {
    if (documentPermission.refId.toHexString() !== userId) {
      return null;
    }

    return documentPermission.role.toUpperCase();
  }

  async getOrganizationDocRole({
    documentPermission,
    loaders,
    userId,
    document,
  }: {
    documentPermission: IDocumentPermission;
    loaders: DataLoaderRegistry;
    userId: string;
    document: Document;
  }): Promise<string | null> {
    const orgMembership = await loaders.orgMembershipLoader.load(`${userId}-${documentPermission.refId}`);
    if (!orgMembership) {
      return null;
    }

    return this.getOrgMemberDocumentPermission({
      documentPermission,
      role: orgMembership.role as OrganizationRoleEnums,
      userId,
      documentOwnerId: document.ownerId,
    });
  }

  async getTeamDocRole({
    documentPermission,
    loaders,
    userId,
    document,
  }: {
    documentPermission: IDocumentPermission;
    loaders: DataLoaderRegistry;
    userId: string;
    document: Document;
  }): Promise<string | null> {
    const teamMembership = await loaders.teamMembershipLoader.load(`${userId}-${documentPermission.refId}`);
    if (!teamMembership) {
      return null;
    }

    return this.getTeamMemberDocumentPermission({
      documentPermission,
      role: teamMembership.role as OrganizationTeamRoles,
      userId,
      documentOwnerId: document.ownerId,
    });
  }

  async getMemberDocRole({
    document,
    documentPermission,
    loaders,
    user,
  }: {
    document: Document;
    documentPermission: IDocumentPermission;
    loaders: DataLoaderRegistry;
    user: GraphqlUser;
  }): Promise<string | null> {
    if (!documentPermission || !user) {
      return null;
    }

    const { _id: userId } = user;
    let memberDocRole: string = null;
    switch (documentPermission.role as DocumentRoleEnum) {
      case DocumentRoleEnum.OWNER: {
        memberDocRole = this.getOwnerDocRole({ documentPermission, userId });
        break;
      }
      case DocumentRoleEnum.ORGANIZATION: {
        memberDocRole = await this.getOrganizationDocRole({
          documentPermission,
          loaders,
          userId,
          document,
        });
        break;
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        memberDocRole = await this.getTeamDocRole({
          documentPermission,
          loaders,
          userId,
          document,
        });
        break;
      }
      default:
        break;
    }

    return memberDocRole;
  }

  async getUserRoleInDocument({
    context,
    document,
  }: {
    context: { req: { user: GraphqlUser }; loaders: DataLoaderRegistry };
    document: Document;
  }): Promise<string> {
    if (document.roleOfDocument) {
      return document.roleOfDocument;
    }

    const { req: { user }, loaders } = context;
    const documentPermission = await loaders.originalDocumentPermissionsLoader.load(document._id);
    const memberDocRole = await this.getMemberDocRole({
      document,
      documentPermission,
      loaders,
      user,
    });
    if (memberDocRole) {
      return memberDocRole;
    }

    const externalPermission = await loaders.documentPermissionLoader.load(`${user._id}-${document._id}`);
    if (!externalPermission) {
      return document.shareSetting.linkType === ShareLinkType.ANYONE ? DocumentRoleEnum.GUEST : '';
    }

    return externalPermission.role.toUpperCase();
  }

  async getUserDocumentPolicyPrinciple({
    context,
    document,
  }: {
    context: { req: { user: GraphqlUser }; loaders: DataLoaderRegistry };
    document: Document;
  }) {
    const { req: { user } } = context;
    let roleOfDocument: string = '';
    if (user._id) {
      roleOfDocument = await this.getUserRoleInDocument({ context, document });
    }

    const userRoleInDocument = roleOfDocument?.toLowerCase() || '';
    const userRolePublicity = document.shareSetting.linkType === ShareLinkType.ANYONE ? document.shareSetting.permission.toLowerCase() : null;
    if (!userRolePublicity || (userRoleInDocument as DocumentActionPermissionPrinciple) === DocumentActionPermissionPrinciple.OWNER) {
      return userRoleInDocument;
    }

    const userRolePublicityPriority = PRIORITY_ROLE[userRolePublicity];
    const userRoleInDocumentPriority = PRIORITY_ROLE[userRoleInDocument];

    if (!userRolePublicityPriority || !userRoleInDocumentPriority || userRolePublicityPriority < userRoleInDocumentPriority) {
      return userRolePublicity;
    }

    return userRoleInDocument;
  }

  async replicateDocumentAssets(sourceDocId: string, copiedDocId: string): Promise<void> {
    await Promise.all([
      this.copyAnnotation(sourceDocId, copiedDocId),
      this.documentOutlineService.copyOutlines(sourceDocId, copiedDocId),
      this.copyDocumentImage(sourceDocId, copiedDocId),
      this.copyFormFields(sourceDocId, copiedDocId),
    ]);
  }

  async getManipulateStepsByDocumentId(documentId: string) {
    const document = await this.getDocumentByDocumentId(documentId);

    if (!document) {
      return { data: '' };
    }

    return { data: document.manipulationStep };
  }

  async getWorkspaceFromDocumentPermission(documentPermission: IDocumentPermission) {
    if (!documentPermission) {
      return null;
    }
    const { role, refId, workspace } = documentPermission;

    switch (role as DocumentRoleEnum) {
      case DocumentRoleEnum.ORGANIZATION:
        return refId?.toHexString();
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const organizationTeam = await this.organizationTeamService.getOrgTeamById(refId);
        if (organizationTeam) {
          return organizationTeam.belongsTo?.toHexString();
        }
        return null;
      }
      case DocumentRoleEnum.OWNER: {
        return workspace?.refId?.toHexString();
      }
      default:
        return null;
    }
  }
}
