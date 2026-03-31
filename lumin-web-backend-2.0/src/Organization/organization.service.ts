/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable default-param-last */
/* eslint-disable global-require */
import {
  Injectable, forwardRef, Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as archiver from 'archiver';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  get,
  upperCase,
  isArray,
  uniqBy,
  isEmpty,
  uniq,
  upperFirst,
  merge,
  remove,
  chunk,
  difference,
} from 'lodash';
import * as moment from 'moment';
import {
  ClientSession, FilterQuery, Model, PipelineStage, ProjectionType, QueryOptions, SortOrder, Types, UpdateQuery,
} from 'mongoose';
import { customAlphabet, nanoid } from 'nanoid';
import { PassThrough, Readable } from 'stream';
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid';

import { DocumentFilter, OrganizationPermissionFilter } from 'Common/builder/DocumentFilterBuilder';
import { DocumentTemplateFilter } from 'Common/builder/DocumentFilterBuilder/document/document-template-filter';
import {
  InviteOrganizationConcreteBuilder,
  RequestOrganizationConcreteBuilder,
} from 'Common/builder/RequestAccessBuilder';
import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { ActionTypeEnum, WithRequired } from 'Common/common.enum';
import { AvatarFile, Email, EmailType } from 'Common/common.interface';
import { EventName } from 'Common/constants/BrazeConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_MOBILE_PATH, EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { MAX_DEPTH_LEVEL, MAX_NUBMER_FOLDER } from 'Common/constants/FolderConstants';
import {
  NotiOrg,
  NotiDocument,
  NotiFolder,
} from 'Common/constants/NotificationConstants';
import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import {
  MANUAL_ORG_URL_LENGTH,
  S3_ORG_DOMAIN_EXPORT_FOLDER,
  MAX_ORGANIZATION_MEMBER,
  MAX_INVOICES_EXPORTED,
  ORG_SIZE_LIMIT_FOR_NOTI,
  LIMIT_GET_ORGANIZATIONS,
  MAX_SUGGESTED_ORGANIZATION_NUMBER,
  ORGANIZATION_TEXT,
  MAX_REPRESENTATIVE_MEMBERS,
  MEMBERS_THRESHOLD_AMOUNT_FOR_REPRESENTATION,
  SUGGESTED_ORG_MAX_MEMBERS,
  SUGGESTED_ORG_MEMBERS_WITH_AVATAR,
  SUGGESTED_PREMIUM_ORG_CAMPAIGN_LIMIT,
  ORG_URL_SEGEMENT,
  MAX_TRACKING_IP_ADDRESSES,
  MAX_AVATAR_SIZE,
} from 'Common/constants/OrganizationConstants';
import {
  FREE_TRIAL_DAYS, ORG_PLAN_INDEX, PLAN_TEXT, SIGN_PLAN_TEXT, SOURCE_TOKEN_REGEX_MATCHING,
} from 'Common/constants/PaymentConstant';
import {
  SOCKET_MESSAGE,
  SOCKET_NAMESPACE,
} from 'Common/constants/SocketConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
  SUBSCRIPTION_REMOVE_ORG_MEMBER,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
  SUBSCRIPTION_UPDATE_ORG,
  SUBSCRIPTION_AUTO_APPROVE_UPDATE,
  SUBSCRIPTION_GOOGLE_SIGN_IN_SECURITY_UPDATE,
  SUBSCRIPTION_DELETE_ORGANIZATION,
  SUBSCRIPTION_CONVERT_ORGANIZATION,
  SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
  SUBSCRIPTION_CREATE_FOLDER,
  SUBSCRIPTION_PAYMENT_UPDATE,
  SUBSCRIPTION_CHANGED_DOCUMENT_STACK,
  SUBSCRIPTION_UPDATE_SIGN_SEAT,
  SUBSCRIPTION_UPDATE_CONTRACT_STACK,
  SUBSCRIPTION_SAML_SSO_SIGN_IN_SECURITY_UPDATE,
  SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED,
} from 'Common/constants/SubscriptionConstants';
import { TEAM_SIZE_LIMIT_FOR_NOTI, TEAM_URL_SEGEMENT } from 'Common/constants/TeamConstant';
import {
  LIMIT_USER_CONTACTS,
  PURPOSE,
  PURPOSE_STEP,
} from 'Common/constants/UserConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { NotificationContext } from 'Common/factory/IntegrationNotiFactory/notification.interface';
import {
  notiOrgFactory,
  notiDocumentFactory,
  notiFolderFactory,
} from 'Common/factory/NotiFactory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { notiFirebaseDocumentFactory, notiFirebaseFolderFactory, notiFirebaseOrganizationFactory } from 'Common/factory/NotiFirebaseFactory';
import { OrganizationDocumentPremiumMap } from 'Common/template-methods/DocumentPremiumMap';
import { OrganizationDocumentQuery } from 'Common/template-methods/DocumentQuery/organization-document-query';
import { OrganizationDocumentTemplateQuery } from 'Common/template-methods/DocumentQuery/organization-document-template-query';
import { Utils } from 'Common/utils/Utils';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';
import { IEnterpriseInvoice, IEnterpriseInvoiceModel } from 'Admin/interfaces/admin.interface';
import { APP_USER_TYPE } from 'Auth/auth.enum';
import { AuthService } from 'Auth/auth.service';
import { IUserInvitationToken, UserInvitationTokenType } from 'Auth/interfaces/auth.interface';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { IRequestJoinOrganizationEvent } from 'Braze/braze.interface';
import { BrazeService } from 'Braze/braze.service';
import { MAX_MEMBERS_FOR_PARTIAL_MENTION } from 'constant';
import { TransactionExecutor } from 'Database/transactionExecutor';
import {
  DocumentRoleEnum,
  DocumentOwnerTypeEnum,
  DocumentPermissionOfMemberEnum,
  DocumentWorkspace,
  DocumentStorageEnum,
  DocumentIndexingStatusEnum,
  DocumentKindEnum,
  DocumentMimeType,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocumentTemplate } from 'Document/DocumentTemplate/documentTemplate.interface';
import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { TimeSensitiveCouponVariationViewEvent } from 'Document/eventTracking/timeSensitiveCouponVariationViewEvent';
import {
  IDocument,
  IDocumentOwner,
  IDocumentPermission,
  ISharer,
  IGetRecentDocumentListInput,
} from 'Document/interfaces/document.interface';
import {
  DOCUMENT_INDEXING_FREE_ORG_DOCUMENT_LIMIT,
  DOCUMENT_INDEXING_PREPARATION_CONTEXT,
} from 'DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { DocumentIndexingBacklogService } from 'DocumentIndexingBacklog/documentIndexingBacklog.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import {
  DocumentEventNames,
  EventScopes,
  NonDocumentEventNames,
  SourceActions,
} from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { OrganizationEventService } from 'Event/services/organization.event.service';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderRoleEnum, FolderTypeEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import {
  GetFoldersInput, IFolder, IFolderModel, IFolderPermission,
} from 'Folder/interfaces/folder.interface';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  OrganizationRole,
  MemberRole,
  MemberWithCursorPaginationPayload,
  DocumentRole,
  InviteToOrganizationInput,
  OrganizationMember,
  OrganizationRoleInvite,
  QueryOptionsInput,
  OrganizationSortOptions,
  FilterOptions,
  OrganizationMemberConnection,
  GetMemberInput,
  PageInfo,
  SearchUserStatus,
  FindUserPayload,
  Folder,
  GetDocumentPayload,
  OrganizationTypeFilter,
  OrganizationSearchField,
  OrganizationSearchQuery,
  Document,
  CheckMainOrgCreationAbilityPayload,
  OrganizationDomainType,
  MemberPermission,
  Organization,
  RejectInvitationInput,
  RejectType,
  NotificationTab,
  DomainVisibilitySetting,
  CreateOrgByAdminInput,
  JoinOrganizationStatus,
  GetOrganizationDocumentsInput,
  CreateFolderInput,
  CreateOrganizationSubscriptionPlans,
  PaymentPeriod,
  Currency,
  UpgradeOrganizationSubscriptionInput,
  OrganizationPurpose,
  DocStackPlan,
  DocStack,
  ExtraTrialDaysOrganizationAction,
  InviteUsersSetting,
  OrganizationMemberInvitation,
  PromptInviteBannerPayload,
  PromptInviteBannerType,
  SuggestedOrganizationList,
  SuggestedPremiumOrganization,
  PaymentPlanSubscription,
  GetOrganizationResourcesPayload,
  GetOrganizationResourcesInput,
  GetSuggestedUserToInvitePayload,
  BelongsTo,
  LocationType,
  GetOrganizationFolderTreePayload,
  GetOrganizationTeamsFolderTreePayload,
  GetFoldersAvailabilityPayload,
  FolderSortOptions,
  FolderBelongsTo,
  UnifySubscriptionPlan,
  UnifySubscriptionProduct,
  SignDocStackStorage,
  GetOrganizationDocumentTemplatesInput,
  GetDocumentTemplatesPayload,
  DocumentTab,
  SamlSsoConfigurationInput,
  SamlSsoConfiguration,
  ScimSsoConfiguration,
} from 'graphql.schema';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HUBSPOT_WORKSPACE_SYNC_MEMBERS_LIMIT, ORG_ROLE_TO_INVITED_ROLE } from 'Hubspot/hubspot.constant';
import { HubspotWorkspaceEventName } from 'Hubspot/hubspot.interface';
import { integrationNotificationHandler } from 'Integration/handler';
import { IntegrationService } from 'Integration/Integration.service';
import { SamlSsoConnection } from 'Kratos/kratos.interface';
import { KratosService } from 'Kratos/kratos.service';
import { LogMessage, LoggerService } from 'Logger/Logger.service';
import { LuminAgreementGenService } from 'LuminAgreementGen/luminAgreementGen.service';
import { GetContractStackInfoRequest } from 'LuminContract/interface/organizationService.interface';
import { ActionTypeOfUserInOrg } from 'LuminContract/luminContract.constant';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import {
  IFirebaseNotification,
  IFirebaseNotificationData, INotification, INotificationUser, IPublishNotification, NotificationProduct,
} from 'Notication/interfaces/notification.interface';
import { NotificationService } from 'Notication/notification.service';
import {
  IOrganizationGroupPermission,
  IOrganizationGroupPermissionData,
  IOrganizationGroupPermissionModel,
} from 'Organization/interfaces/organization.group.permission.interface';
import {
  DocumentMigrationResult,
  ICreateOrganization,
  IOrganization,
  IUpdateOrganization,
  IOrganizationSettings,
  CreateOrgOptions,
  IOrganizationModel,
  IExtraTrialDaysOrganization,
  IOrganizationWithRole,
} from 'Organization/interfaces/organization.interface';
import {
  IOrganizationMember,
  IOrganizationMemberData,
  IOrganizationMemberModel,
} from 'Organization/interfaces/organization.member.interface';
import { IRequestAccess, IRequestAccessModel } from 'Organization/interfaces/request.access.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import {
  OrganizationRoleEnums,
  Effect,
  AccessTypeOrganization,
  OrganizationTeamRoles,
  SortStrategy,
  TransferOrgAdminStrategy,
  ConvertOrganizationToEnum,
  PriorityOrgIndex,
  InviteUsersSettingEnum,
  OrganizationCreationTypeEnum,
  OrganizationPromotionEnum,
} from 'Organization/organization.enum';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { OrganizationManagement } from 'Organization/Policy/architecture/OrganizationManagement';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import * as policies from 'Organization/Policy/roles.json';
import { ExportDomainBase } from 'Organization/utils/DomainExport/ExportDomainBase';
import { ITrialInfo, PaymentSchemaInterface, SubScriptionItemSchemaInterface } from 'Payment/interfaces/payment.interface';
import {
  PaymentPlanEnums,
  PaymentPeriodEnums,
  PaymentStatusEnums,
  UpgradeInvoicePlanEnums,
  PaymentCurrencyEnums,
  PaymentProductEnums,
  UpdateSignWsPaymentActions,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { UpdateSubscriptionParamsBuilder } from 'Payment/Policy/updateSubscriptionParamsBuilder';
import { UpdateUnifySubscriptionParamsBuilder } from 'Payment/Policy/updateUnifySubscriptionParamsBuilder';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { Member } from 'SSE/interfaces/admin-sse.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { UserContact } from 'User/interfaces/user.contact.interface';
import { IUserContext, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { BulkInviteMembersFromCsvInput } from './dtos/bulkInviteMembersFromCsv.dto';
import { UserAcceptOrganizationInvitationEvent } from './eventTracking/userAcceptOrganizationInvitationEvent';
import { OrganizationDocStackQuotaService } from './organization.docStackQuota.service';
import { OrganizationUtils } from './utils/organization.utils';

type DocumentOwnership = {
  ownerUser: User;
  createdDocument: IDocument;
  organization: IOrganization;
};

interface IAfterUpdateParams {
  uploadedUser: User;
  clientId: string;
  document: IDocument;
  documentOwnerType: DocumentOwnerTypeEnum;
  uploader: Record<string, any>;
  organization: IOrganization;
  isNotify: boolean;
}

@Injectable()
export class OrganizationService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Organization')
    private readonly organizationModel: Model<IOrganizationModel>,
    @InjectModel('OrganizationMember')
    private readonly organizationMemberModel: Model<IOrganizationMemberModel>,
    @InjectModel('OrganizationGroupPermission')
    private readonly organizationGroupPermissionModel: Model<IOrganizationGroupPermissionModel>,
    @InjectModel('RequestAccess')
    private readonly requestAccessModel: Model<IRequestAccessModel>,
    @InjectModel('EnterpriseUpgrade')
    private readonly enterpriseUpgradeModel: Model<IEnterpriseInvoiceModel>,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => EventServiceFactory))
    private readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => OrganizationTeamService))
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly blacklistService: BlacklistService,
    private readonly transaction: TransactionExecutor,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly messageGateway: EventsGateway,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    @Inject(forwardRef(() => OrganizationEventService))
    private readonly organizationEventService: OrganizationEventService,
    private readonly personalEventService: PersonalEventService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly organizationDocStackQuotaService: OrganizationDocStackQuotaService,
    private readonly brazeService: BrazeService,
    private readonly integrationService: IntegrationService,
    private readonly luminContractService: LuminContractService,
    private readonly luminAgreementGenService: LuminAgreementGenService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly documentIndexingBacklogService: DocumentIndexingBacklogService,
    private readonly kratosService: KratosService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly paymentUtilsService: PaymentUtilsService,
    @Inject(forwardRef(() => CustomRuleLoader))
    private readonly customRuleLoader: CustomRuleLoader,
    @Inject(forwardRef(() => DocumentTemplateService))
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
    private readonly pinpointService: PinpointService,
  ) {}

  private getOrgManagement(): OrganizationManagement {
    return new OrganizationManagement(
      this,
      this.redisService,
      this.emailService,
      this.userService,
      this.jwtService,
      this.environmentService,
      this.documentService,
      this.notificationService,
      this.hubspotWorkspaceService,
    );
  }

  private trackUserAcceptOrganizationInvitation({
    organizationId,
    userId,
    trackingContext,
  }: {
    organizationId: string;
    userId: string;
    trackingContext?: { anonymousUserId?: string; userAgent?: string };
  }): void {
    try {
      const event = new UserAcceptOrganizationInvitationEvent({
        targetOrganizationId: organizationId,
        organizationUserInvitationId: userId,
        LuminUserId: userId,
        anonymousUserId: trackingContext?.anonymousUserId,
        userAgent: trackingContext?.userAgent,
      });
      this.pinpointService.add(event);
      this.loggerService.info({
        message: 'User accept organization invitation tracked',
        context: 'trackUserAcceptOrganizationInvitation',
        extraInfo: { organizationId, userId },
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error tracking user accept organization invitation',
        context: 'trackUserAcceptOrganizationInvitation',
        error,
        extraInfo: { organizationId, userId },
      });
    }
  }

  createDocumentEventAndPublishUpdate({ ownerUser, createdDocument, organization }: DocumentOwnership): void {
    this.eventService.createEvent({
      eventName: DocumentEventNames.DOCUMENT_UPLOADED,
      actor: ownerUser,
      eventScope: EventScopes.ORGANIZATION,
      document: createdDocument as unknown as Document,
      organization,
    });
    const subcriptionType = SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL;
    const documentUploaded = this.documentService.cloneDocument(JSON.stringify(createdDocument), {
      ownerName: ownerUser.name,
      ownerAvatarRemoteId: ownerUser.avatarRemoteId,
      roleOfDocument: 'OWNER',
    });
    this.documentService.publishUpdateDocument(
      [ownerUser._id],
      {
        document: documentUploaded,
        type: subcriptionType,
      },
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );
  }

  async getMembersByUserId(userId: string): Promise<IOrganizationMember[]> {
    const organizationMembers = await this.organizationMemberModel.find({ userId }).exec();
    return organizationMembers.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async getMembershipOrgByUserId(
    userId: string,
    projection?: Record<string, number>,
  ): Promise<IOrganizationMember[]> {
    const organizationMembers = await this.organizationMemberModel.find({ userId }, projection).exec();
    return organizationMembers.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async getMemberships(
    conditions: FilterQuery<IOrganizationMember>,
    // eslint-disable-next-line default-param-last
    limit: number = 0,
    projection?: Record<string, any>,
  ): Promise<IOrganizationMember[]> {
    const organizationMembers = await this.organizationMemberModel.find(conditions, projection).limit(limit).exec();
    return organizationMembers.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async updateOrganizationProperty(
    orgId: string | Types.ObjectId,
    updateProperty: IUpdateOrganization,
  ): Promise<IOrganization> {
    const updatedOrg = await this.organizationModel
      .findOneAndUpdate({ _id: orgId }, { ...updateProperty }, { new: true })
      .exec();
    return updatedOrg ? { ...updatedOrg.toObject(), _id: updatedOrg._id.toString() } : null;
  }

  public async getOrganizationOwner(
    userId: string,
    projection?: ProjectionType<IOrganization>,
  ): Promise<IOrganization[]> {
    const organizations = await this.organizationModel.find({ ownerId: userId }, projection).exec();
    return organizations.map((org) => ({ ...org.toObject(), _id: org._id.toHexString() }));
  }

  public aggregateOrganizationMember<T = any>(conditions: PipelineStage[]) {
    return this.organizationMemberModel.aggregate<T>(conditions);
  }

  public async deleteMemberInOrg(orgId: string, userId: string): Promise<any> {
    return this.organizationMemberModel.deleteOne({ orgId, userId });
  }

  public async getMembersByOrgId(
    orgId: string | Types.ObjectId,
    projection?: ProjectionType<IOrganizationMember>,
    options?: QueryOptionsInput,
  ): Promise<IOrganizationMember[]> {
    const organizationMembers = await this.organizationMemberModel.find({ orgId }, projection, options).exec();
    return organizationMembers.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async getFirstOrganizationWithOneMemberOnly(orgIds: Types.ObjectId[]): Promise<{_id: string, totalMember: number}> {
    const result = await this.organizationMemberModel.aggregate([
      {
        $match: {
          orgId: {
            $in: orgIds,
          },
        },
      },
      {
        $group: {
          _id: '$orgId',
          totalMember: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalMember: 1,
          createdAt: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    return result.length && result[0].totalMember === 1 ? result[0] : null;
  }

  public async updateInternalMembers(
    { orgId, oldAssociateDomain, newAssociateDomain } : { orgId: string, oldAssociateDomain?: string, newAssociateDomain?: string },
  ): Promise<{newDomainGuestIds: any[]}> {
    const conditions = [
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
        },
      },
      {
        $project: {
          userId: 1,
          role: 1,
          orgId: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$_id', '$$userId'],
                    },
                  },
                ],
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];
    const oldDomainGuestIds = [];
    const newDomainGuestIds = [];
    try {
      const orgMembers = await this.aggregateOrganizationMember(conditions);

      orgMembers.forEach((member) => {
        const emailDomain = Utils.getEmailDomain(member.user.email as string);
        if (emailDomain === oldAssociateDomain) {
          oldDomainGuestIds.push(member.user._id);
        }
        if (emailDomain === newAssociateDomain) {
          newDomainGuestIds.push(member.user._id);
        }
      });
      this.organizationMemberModel.updateMany({ orgId, userId: { $in: oldDomainGuestIds } }, { internal: false }).exec();
      this.organizationMemberModel.updateMany({ orgId, userId: { $in: newDomainGuestIds } }, { internal: true }).exec();
    } catch (err) {
      throw GraphErrorException.InternalServerError('Fail to update internal members');
    }
    return { newDomainGuestIds };
  }

  public getMembersInfoByOrgId(orgId: string) {
    return this.aggregateOrganizationMember(
      [
        {
          $match: {
            orgId: new Types.ObjectId(orgId),
          },
        },
        {
          $project: {
            userId: 1,
            role: 1,
            orgId: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: {
              userId: '$userId',
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  ],
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ],
    );
  }

  /**
   * Get members info for sync Hubspot workspace
   * includes sorting by role priority (ORGANIZATION_ADMIN > BILLING_MODERATOR > MEMBER) then by createdAt
   */
  public getMembersInfoForSync(orgId: string, limit = HUBSPOT_WORKSPACE_SYNC_MEMBERS_LIMIT) {
    return this.aggregateOrganizationMember(
      [
        {
          $match: {
            orgId: new Types.ObjectId(orgId),
          },
        },
        {
          $lookup: {
            from: 'users',
            let: {
              userId: '$userId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
              {
                $project: {
                  email: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            'user.email': { $exists: true, $ne: null },
          },
        },
        {
          $addFields: {
            rolePriority: {
              $switch: {
                branches: [
                  { case: { $eq: ['$role', OrganizationRoleEnums.ORGANIZATION_ADMIN] }, then: 1 },
                  { case: { $eq: ['$role', OrganizationRoleEnums.BILLING_MODERATOR] }, then: 2 },
                  { case: { $eq: ['$role', OrganizationRoleEnums.MEMBER] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        {
          $sort: {
            rolePriority: 1,
            createdAt: 1,
          },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            email: '$user.email',
            role: 1,
            _id: 0,
          },
        },
      ],
    );
  }

  public getActiveOrgMembers(
    orgId: string,
    projection?: Record<string, number>,
  ): unknown {
    return this.aggregateOrganizationMember([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
        },
      },
      {
        $project: projection,
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$_id', '$$userId'],
                    },
                    {
                      $gte: [
                        '$lastAccess',
                        moment().subtract(2, 'months').toDate(),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { 'user.lastAccess': 1 } },
    ]);
  }

  public async getOrgByDomain(domain: string, projection?: ProjectionType<IOrganization>): Promise<IOrganization> {
    const organization = await this.organizationModel.findOne({ domain }, projection).exec();
    return organization ? { ...organization.toObject(), _id: organization._id.toHexString() } : null;
  }

  public async getOrgPlan(orgId: string): Promise<any> {
    const org = await this.getOrgById(orgId);
    return this.paymentService.getPlan(org.payment.planRemoteId, org.payment.stripeAccountId);
  }

  public async getAllMembersByOrganization(
    orgId: string,
    options: QueryOptionsInput = {},
  ): Promise<User[]> {
    const lookupMatchExpression = {
      $expr: {
        $eq: ['$_id', '$$userId'],
      },
    };
    const data = await this.organizationMemberModel.aggregate([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
        },
      },
      {
        $project: {
          userId: 1,
        },
      },
      {
        $limit: options.limit,
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: lookupMatchExpression,
            },
            {
              $project: {
                password: 0,
                recentPasswords: 0,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    return data.map((member) => ({ ...member.user }));
  }

  public async getAllMembersByOrganizations(
    orgIds: string[],
    options: QueryOptionsInput = {},
  ): Promise<[string, User[]][]> {
    return Promise.all(
      orgIds.map(async (orgId) => {
        const members = await this.getAllMembersByOrganization(orgId, options);
        return [orgId, members];
      }),
    );
  }

  public async getOwnerOfOrganizations(
    organizations: IOrganization[],
  ): Promise<[string, User][]> {
    if (!organizations.length) {
      return [];
    }

    const ownerIds = organizations.map((org) => org.ownerId);
    const uniqueOwnerIds = [...new Set(ownerIds)].map((id) => new Types.ObjectId(id));

    const aggregateInput: PipelineStage[] = [
      {
        $match: {
          _id: { $in: uniqueOwnerIds },
        },
      },
    ];

    const owners = await this.userService.aggregateUser(aggregateInput);
    const ownersMap = new Map(owners.map((owner) => [owner._id.toString(), owner]));

    return organizations.map((organization) => [
      organization._id,
      ownersMap.get(organization.ownerId.toString()),
    ]);
  }

  public async getRepresentativeMembersByTeamOrOrg({
    targetId,
    target,
    options = { limit: MAX_REPRESENTATIVE_MEMBERS },
  }: {
    targetId: string;
    target: 'team' | 'org';
    options?: {
      limit?: number;
    }
  }): Promise<User[]> {
    const matchCondition = target === 'team'
      ? {
        teamId: new Types.ObjectId(targetId),
      }
      : {
        orgId: new Types.ObjectId(targetId),
      };
    const pipeline = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $limit: options.limit,
      },
    ];

    const data = target === 'team'
      ? await this.membershipService.aggregateMembers(pipeline)
      : await this.organizationMemberModel.aggregate(pipeline);

    return data.map((member) => ({ ...member.user }));
  }

  public async getMembershipByOrgAndUser(
    orgId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    projection?: ProjectionType<IOrganizationMember>,
  ): Promise<IOrganizationMember> {
    const organizationMember = await this.organizationMemberModel.findOne({ orgId, userId }, projection).exec();
    return organizationMember ? { ...organizationMember.toObject(), _id: organizationMember._id.toHexString() } : null;
  }

  public async createMemberInOrg(
    orgData: IOrganizationMemberData,
  ): Promise<IOrganizationMember> {
    const orgMemberCreated = await this.organizationMemberModel.create(
      (orgData as unknown) as IOrganizationMember,
    );
    this.paymentService.updateTotalMembersCustomerMetadata({ orgId: orgData.orgId });
    return { ...orgMemberCreated.toObject(), _id: orgMemberCreated._id.toHexString() };
  }

  public async findMemberWithRoleInOrg(
    orgId: string | Types.ObjectId,
    role: OrganizationRoleEnums | OrganizationRoleEnums[],
    projection?: ProjectionType<IOrganizationMember>,
  ): Promise<IOrganizationMember[]> {
    let members;
    if (isArray(role)) {
      members = await this.organizationMemberModel.find({ orgId, role: { $in: role } }, projection).exec();
    } else {
      members = await this.organizationMemberModel
        .find({ orgId, role }, projection)
        .exec();
    }
    return members.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async getOrgMembershipByConditions({
    conditions,
    projection,
    sortOptions,
    limit = 0,
  }: {
    conditions: Record<string, unknown>;
    projection?: Record<string, any>;
    sortOptions?: { [key: string]: SortOrder };
    limit?: number;
  }): Promise<IOrganizationMember[]> {
    let members;
    const findMemberQuery = this.organizationMemberModel.find(
      conditions,
      projection,
    );
    if (sortOptions) {
      members = await findMemberQuery.sort(sortOptions).limit(limit).exec();
    } else {
      members = await findMemberQuery.limit(limit).exec();
    }
    return members.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async updateOrganizationMemberPermission(
    userId: string,
    orgId: string,
    updateObj: Record<string, unknown>,
  ): Promise<IOrganizationMember> {
    const updatedOrgMember = await this.organizationMemberModel
      .findOneAndUpdate(
        {
          userId,
          orgId,
        },
        updateObj,
        { new: true },
      ).exec();
    return updatedOrgMember ? { ...updatedOrgMember.toObject(), _id: updatedOrgMember._id.toHexString() } : null;
  }

  public updateOrganizationPermission(
    conditions: Record<string, unknown>,
    updateObj: Record<string, unknown>,
  ): Promise<any> {
    return this.organizationMemberModel
      .updateMany(conditions, updateObj, { new: true })
      .exec();
  }

  public updateOneOrganizationPermission(
    conditions: Record<string, unknown>,
    updateObj: Record<string, unknown>,
  ): Promise<any> {
    return this.organizationMemberModel
      .updateOne(conditions, updateObj, { new: true })
      .exec();
  }

  public async getGroupPermissionInOrgByIdAndName(
    orgId: string,
    name: string,
    projection?: ProjectionType<IOrganizationGroupPermission>,
  ): Promise<IOrganizationGroupPermission> {
    const groupPermission = await this.organizationGroupPermissionModel.findOne(
      { refId: orgId, name },
      projection,
    ).exec();
    return groupPermission ? { ...groupPermission.toObject(), _id: groupPermission._id.toHexString() } : null;
  }

  public async getGroupPermissionInTeamByIdAndName(
    teamId: string,
    name: string,
    projection?: ProjectionType<IOrganizationGroupPermission>,
  ): Promise<IOrganizationGroupPermission> {
    const groupPermission = await this.organizationGroupPermissionModel.findOne(
      { refId: teamId, name },
      projection,
    ).exec();
    return groupPermission ? { ...groupPermission.toObject(), _id: groupPermission._id.toHexString() } : null;
  }

  public async getGroupPermissionByCondition(
    conditions: Record<string, unknown>,
    projection?: ProjectionType<IOrganizationGroupPermission>,
  ): Promise<IOrganizationGroupPermission[]> {
    const groupPermissions = await this.organizationGroupPermissionModel.find(
      { ...conditions },
      projection,
    ).exec();
    return groupPermissions.map((groupPermission) => ({ ...groupPermission.toObject(), _id: groupPermission._id.toHexString() }));
  }

  public async createGroupPermission(
    groupData: IOrganizationGroupPermissionData,
  ): Promise<IOrganizationGroupPermission> {
    const groupPermission = await this.organizationGroupPermissionModel.create((groupData as unknown) as IOrganizationGroupPermission);
    return { ...groupPermission.toObject(), _id: groupPermission._id.toHexString() };
  }

  public async updateGroupPermissionById(
    _id: unknown,
    updateProperty: Record<string, unknown>,
  ): Promise<any> {
    const groupPermission = await this.organizationGroupPermissionModel.findOneAndUpdate({ _id }, { ...updateProperty })
      .exec();
    return groupPermission ? { ...groupPermission.toObject(), _id: groupPermission._id.toHexString() } : null;
  }

  public deleteGroupPermissionByRefId(refId: string): Promise<any> {
    return this.organizationGroupPermissionModel.deleteMany({ refId }).exec();
  }

  public updateManyMemberships(
    conditions: Record<string, any>,
    updateProperty: Record<string, any>,
  ) {
    return this.organizationMemberModel
      .updateMany(conditions, updateProperty)
      .exec();
  }

  public deleteGroupPermissionsByCondition(
    conditions: Record<string, unknown>,
    projection?: Record<string, number>,
    session: ClientSession = null,
  ): Promise<unknown> {
    return this.organizationGroupPermissionModel
      .deleteMany(conditions, projection)
      .session(session)
      .exec();
  }

  public deleteOrganizationByConditions(
    conditions: unknown,
    session: ClientSession = null,
  ): any {
    return this.organizationModel.deleteOne(conditions).session(session).exec();
  }

  public async getRequesterListByOrgIdAndType(
    organizationId: string,
    type: string,
    projection?: ProjectionType<IRequestAccess>,
  ): Promise<IRequestAccess[]> {
    const requestAccesses = await this.requestAccessModel.find(
      { target: organizationId, type },
      projection,
    ).exec();
    return requestAccesses.map((requestAccess) => ({ ...requestAccess.toObject(), _id: requestAccess._id.toString() }));
  }

  public async getRequestAccessById(requestAccessId: string, projection?: ProjectionType<IRequestAccess>): Promise<IRequestAccess> {
    const requestAccess = await this.requestAccessModel.findOne(
      { _id: requestAccessId },
      projection,
    ).exec();
    return requestAccess ? { ...requestAccess.toObject(), _id: requestAccess._id.toString() } : null;
  }

  public async getRequestAccessByOrgIdAndEmail(orgId: string, email: string, projection?: ProjectionType<IRequestAccess>): Promise<IRequestAccess> {
    const requestAccess = await this.requestAccessModel.findOne(
      {
        actor: email,
        target: orgId,
      },
      projection,
    ).exec();
    return requestAccess ? { ...requestAccess.toObject(), _id: requestAccess._id.toString() } : null;
  }

  public async getRequestAccessByIdAndEmail(
    _id: string,
    email: string,
    type: AccessTypeOrganization = AccessTypeOrganization.INVITE_ORGANIZATION,
    projection?: ProjectionType<IRequestAccess>,
  ): Promise<IRequestAccess> {
    const requestAccess = await this.requestAccessModel.findOne(
      {
        actor: email,
        type,
        _id,
      },
      projection,
    );
    return requestAccess ? { ...requestAccess.toObject(), _id: requestAccess._id.toString() } : null;
  }

  public async getRequestAccessByCondition(conditions: FilterQuery<IRequestAccess>, projections?: Record<string, number>): Promise<IRequestAccess[]> {
    const requestAccesses = await this.requestAccessModel.find(conditions, projections).exec();
    return requestAccesses.map((requestAccess) => ({ ...requestAccess.toObject(), _id: requestAccess._id.toString() }));
  }

  public getRequesterWithPagination(conditions: PipelineStage[]) {
    return this.requestAccessModel.aggregate(conditions);
  }

  public async findMemberInRequestAccess(
    target: string,
    actor: string,
    projection?: ProjectionType<IRequestAccess>,
  ): Promise<IRequestAccess> {
    const requestAccess = await this.requestAccessModel.findOne({ target, actor }, projection).exec();
    return requestAccess ? { ...requestAccess.toObject(), _id: requestAccess._id.toString() } : null;
  }

  public async findMemberInRequestAccessWithType(
    data: {
      actor: string,
      type: string,
      target?: string,
    },
    projection?: ProjectionType<IRequestAccess>,
  ): Promise<IRequestAccess> {
    const {
      actor,
      type,
      target,
    } = data;
    const requestAccess = await this.requestAccessModel.findOne({ target, actor: actor.toLowerCase(), type }, projection).exec();
    return requestAccess ? { ...requestAccess.toObject(), _id: requestAccess._id.toString() } : null;
  }

  public async removeRequesterByEmailInOrg(
    email: string,
    orgId: string,
    type: string,
    options?: QueryOptions<IRequestAccess>,
  ): Promise<IRequestAccess> {
    const deletedRequestAccess = await this.requestAccessModel.findOneAndDelete({
      actor: email,
      target: orgId,
      type,
    }, options).exec();
    return deletedRequestAccess ? { ...deletedRequestAccess.toObject(), _id: deletedRequestAccess._id.toString() } : null;
  }

  public removeRequestAccess(
    conditions: Record<string, unknown>,
    session: ClientSession = null,
  ): Promise<any> {
    return this.requestAccessModel
      .deleteMany(conditions)
      .session(session)
      .exec();
  }

  public removeAvatarFromS3(avatarRemoteId: string): Promise<void> {
    if (!avatarRemoteId) {
      return;
    }
    this.awsService.removeFileFromBucket(
      avatarRemoteId,
      EnvConstants.S3_PROFILES_BUCKET,
    );
  }

  public async getInviteOrgList(
    conditions: FilterQuery<IRequestAccess>,
    projection?: ProjectionType<IRequestAccess>,
    limit: number = 0,
  ): Promise<IRequestAccess[]> {
    const requestAccesses = await this.requestAccessModel.find(conditions, projection).limit(limit).exec();
    return requestAccesses.map((requestAccess) => ({ ...requestAccess.toObject(), _id: requestAccess._id.toString() }));
  }

  public async delInviteOrgListByEmail(
    email: string,
    type,
    // eslint-disable-next-line default-param-last
    session: ClientSession = null,
    projection?: QueryOptions<IRequestAccess>,
  ): Promise<any> {
    return this.requestAccessModel
      .deleteMany({ actor: email, type }, projection)
      .session(session);
  }

  public async createRequestAccess(
    requestAccess: Record<string, unknown>,
  ): Promise<IRequestAccess> {
    const createdRequestAccess = await this.requestAccessModel.create(
      (requestAccess as unknown) as IRequestAccess,
    );
    return createdRequestAccess ? { ...createdRequestAccess.toObject(), _id: createdRequestAccess._id.toString() } : null;
  }

  public async updateRequestAccess(
    conditions: FilterQuery<IRequestAccess>,
    updateProperty: UpdateQuery<IRequestAccess>,
  ): Promise<any> {
    return this.requestAccessModel
      .updateMany(conditions, updateProperty)
      .exec();
  }

  public async getOrgByUrl(
    url: string,
    projection?: Record<string, number>,
  ): Promise<IOrganization> {
    const organization = await this.organizationModel.findOne({ url }, projection).exec();
    return organization ? { ...organization.toObject(), _id: organization._id.toHexString() } : null;
  }

  public async updateOrganizationById(
    orgId: string | Types.ObjectId,
    updateData: IUpdateOrganization,
  ): Promise<IOrganization> {
    const updatedOrg = await this.organizationModel
      .findOneAndUpdate({ _id: orgId }, updateData, { new: true })
      .exec();
    return updatedOrg ? { ...updatedOrg.toObject(), _id: updatedOrg._id.toHexString() } : null;
  }

  public async updateOrganizationByCondition(
    conditions: FilterQuery<IOrganization>,
    updateData: IUpdateOrganization,
  ): Promise<IOrganization> {
    const updatedOrg = await this.organizationModel
      .findOneAndUpdate(conditions, updateData, { new: true })
      .exec();
    return updatedOrg ? { ...updatedOrg.toObject(), _id: updatedOrg._id.toHexString() } : null;
  }

  public async getOrgById(
    orgId: string | Types.ObjectId,
    projection?: ProjectionType<IOrganization>,
  ): Promise<IOrganization> {
    const organization = await this.organizationModel.findById({ _id: orgId }, projection).exec();
    return organization ? { ...organization.toObject(), _id: organization._id.toHexString() } : null;
  }

  public async getOrgByIdLean(
    orgId: string | Types.ObjectId,
    projection?: ProjectionType<IOrganization>,
  ): Promise<IOrganization> {
    const organization = await this.organizationModel.findById({ _id: orgId }, projection, { lean: true }).exec();
    return organization ? { ...organization, _id: organization._id.toHexString() } : null;
  }

  /**
   * For Sale Dashboard
   */
  public async getAllOrganizations(params: {
    searchQuery: OrganizationSearchQuery;
    limit: number;
    offset: number;
    sortOptions: OrganizationSortOptions;
    filterOptions: FilterOptions;
  }): Promise<
    [IOrganization[], number]
  > {
    const {
      searchQuery,
      limit,
      offset,
      sortOptions,
      filterOptions = {},
    } = params;
    let matchCondition = {};
    const { key: searchKey, field: searchField } = searchQuery;

    // filter
    matchCondition = this.generateFilterForGetAllOrganizations(searchQuery, filterOptions);

    // sort
    const sortStrategy = this.generateSortForGetAllOrganizations(sortOptions);

    if (searchKey.length && searchField === OrganizationSearchField.ADMIN_EMAIL) {
      const validateEmail = Utils.validateEmail(searchKey);
      if (!validateEmail) {
        throw GraphErrorException.BadRequest('Email is not valid', ErrorCode.User.INVALID_EMAIL);
      }
      matchCondition = { email: searchKey };
      const aggregateInput: any[] = [
        { $match: matchCondition },
        {
          $lookup: {
            from: 'organizations',
            localField: '_id',
            foreignField: 'ownerId',
            as: 'organizations',
          },
        },
        {
          $project: { organizations: 1, _id: 0 },
        },
        {
          $unwind: '$organizations',
        },
        { $replaceRoot: { newRoot: '$organizations' } },
        { $limit: LIMIT_GET_ORGANIZATIONS },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            organizations: [
              { $sort: sortStrategy },
              { $skip: offset },
              { $limit: limit },
            ],
          },
        },
      ];
      const [data] = await this.userService.aggregateUser(aggregateInput);
      return [data.organizations, data.metadata[0]?.total];
    }
    const hasMatchCondition = Object.values(matchCondition).length;
    const aggregateInput: any[] = hasMatchCondition ? [
      { $match: matchCondition },
      { $limit: LIMIT_GET_ORGANIZATIONS },
      {
        $facet: {
          totalOrgsMatched: [
            { $count: 'total' },
          ],
          matchedOrgs: [
            { $sort: sortStrategy },
            { $skip: offset },
            { $limit: limit },
          ],
        },
      }] : [
      { $match: matchCondition },
      { $sort: sortStrategy },
      { $skip: offset },
      { $limit: limit },
    ];
    if (searchKey.length && searchField === OrganizationSearchField.NAME) {
      aggregateInput.splice(1, 0, { $limit: LIMIT_GET_ORGANIZATIONS });
    }
    const data = await this.organizationModel.aggregate<{
      totalOrgsMatched: { total: number }[];
      matchedOrgs: IOrganization[];
    }>(aggregateInput as PipelineStage[]);

    let orgTotal = 0;
    if (!hasMatchCondition) {
      orgTotal = await this.organizationModel.estimatedDocumentCount();
    } else {
      const { totalOrgsMatched } = data[0];
      orgTotal = totalOrgsMatched.length ? totalOrgsMatched[0].total : 0;
    }

    return [
      hasMatchCondition ? data[0].matchedOrgs : data as unknown as IOrganization[],
      Math.min(orgTotal, LIMIT_GET_ORGANIZATIONS) || 0,
    ];
  }

  private generateFilterForGetAllOrganizations(searchQuery: OrganizationSearchQuery, filterOptions: FilterOptions) {
    let matchCondition = {};
    const { key: searchKey, field: searchField } = searchQuery;
    if ('plan' in filterOptions) {
      matchCondition = { 'payment.type': filterOptions.plan };
    }
    if (filterOptions.type === OrganizationTypeFilter.converted) {
      matchCondition = { isMigratedFromTeam: true };
    }

    if (searchKey.length && isEmpty(matchCondition)) {
      switch (searchField) {
        case OrganizationSearchField.NAME:
          Object.assign(matchCondition, {
            $text: { $search: `"${Utils.getSearchString(searchKey)}"` },
          });
          break;
        case OrganizationSearchField.DOMAIN:
          Object.assign(matchCondition, {
            domain: searchKey,
          });
          break;
        case OrganizationSearchField.ASSOCIATED_DOMAIN:
          Object.assign(matchCondition, {
            associateDomains: searchKey,
          });
          break;
        case OrganizationSearchField.ORGANIZATION_ID:
          Object.assign(matchCondition, {
            _id: Types.ObjectId.isValid(searchKey) ? new Types.ObjectId(searchKey) : searchKey,
          });
          break;
        default:
          break;
      }
    }
    return matchCondition;
  }

  private generateSortForGetAllOrganizations(sortOptions: OrganizationSortOptions) {
    const sortStrategy = { createdAt: -1 };
    if (sortOptions?.createdAt) {
      sortStrategy.createdAt = SortStrategy[sortOptions.createdAt];
    }
    return sortStrategy;
  }

  public async findOrganization(
    conditions: FilterQuery<IOrganization>,
    projection?: ProjectionType<IOrganization>,
    options?: QueryOptions<IOrganization>,
  ): Promise<IOrganization[]> {
    const organizations = await this.organizationModel.find(conditions, projection, options).exec();
    return organizations.map((org) => ({ ...org.toObject(), _id: org._id.toHexString() }));
  }

  public async findOneOrganization(
    conditions: FilterQuery<IOrganization>,
    projection?: ProjectionType<IOrganization>,
  ): Promise<IOrganization> {
    const org = await this.organizationModel.findOne(conditions, projection).exec();
    return org ? { ...org.toObject({ minimize: false }), _id: org._id.toHexString() } : null;
  }

  public getUserDataByEmail(email: string): Promise<User> {
    return this.userService.findVerifiedUserByEmail(email, {});
  }

  public deleteManyMemberOrganizationByUserId(
    userId: string,
    session: ClientSession = null,
  ) {
    return this.organizationMemberModel.deleteMany({ userId }).session(session);
  }

  public deleteMembersByOrganization(
    orgId: string,
    session: ClientSession = null,
  ): unknown {
    return this.organizationMemberModel.deleteMany({ orgId }).session(session);
  }

  public async deleteOrgPaymentInStripe(
    subscriptionRemoteId: string,
    stripeAccountId: string,
  ): Promise<any> {
    return this.paymentService.cancelStripeSubscription(subscriptionRemoteId, null, { stripeAccount: stripeAccountId });
  }

  public async getOrgListByUser(
    userId: string,
    condition?: {
      limit?: number;
      sort?: { [key: string]: SortOrder };
      filterQuery?: FilterQuery<IOrganization>;
    },
    projection?: ProjectionType<IOrganization>,
  ): Promise<IOrganization[]> {
    const { limit = 0, sort = {}, filterQuery = {} } = condition || {};
    const membershipsOrg = await this.getMembershipOrgByUserId(userId, {
      orgId: 1,
    });
    const orgIds = membershipsOrg.map((item) => item.orgId);
    const organizations = await this.organizationModel
      .find({
        _id: { $in: orgIds },
        ...filterQuery,
      }, projection)
      .sort(sort)
      .limit(limit)
      .exec();
    return organizations.map((org) => ({
      ...org.toObject(),
      _id: org._id.toHexString(),
    }));
  }

  public async insertUnallowedAutoJoinList(
    userId: string,
    orgId: string,
  ): Promise<IOrganization> {
    const updatedOrg = await this.organizationModel.findOneAndUpdate(
      { _id: orgId },
      {
        $addToSet: { unallowedAutoJoin: userId },
      },
      { new: true },
    ).exec();
    return updatedOrg ? { ...updatedOrg.toObject(), _id: updatedOrg._id.toHexString() } : null;
  }

  public async handleAddMemberToOrg(
    memberData: Omit<IOrganizationMemberData, 'groups'> & { email: string },
    options: {
      disableHubspot?: boolean;
      skipHubspotWorkspaceAssociation?: boolean;
      skipWorkspaceSizeChangedEvent?: boolean;
    } = {},
  ): Promise<IOrganizationMember> {
    const memberFound = await this.getMembershipByOrgAndUser(
      memberData.orgId,
      memberData.userId,
    );
    if (memberFound) {
      return null;
    }
    this.documentService
      .getDocumentPermission(memberData.orgId, {
        role: DocumentRoleEnum.ORGANIZATION,
      })
      .then((sharedOrganizationDocumentList) => {
        const documentIds = sharedOrganizationDocumentList.map(
          (sharedDocument) => sharedDocument.documentId,
        );
        this.documentService.deleteDocumentPermissions({
          refId: memberData.userId,
          documentId: { $in: documentIds },
        });
        this.documentService
          .removeRequestAccess(memberData.userId, documentIds)
          .exec();
      });
    const orgGroupPermission = await this.getGroupPermissionInOrgByIdAndName(
      memberData.orgId,
      memberData.role,
      { _id: 1 },
    );
    const member = await this.createMemberInOrg({
      userId: memberData.userId,
      orgId: memberData.orgId,
      internal: memberData.internal,
      role: memberData.role,
      groups: [orgGroupPermission._id],
    });

    if (!options.disableHubspot) {
      await this.userService.updateJoinOrgPurpose({ email: memberData.email, orgId: memberData.orgId });

      // [Hubspot] add workspace contact association
      if (!options.skipHubspotWorkspaceAssociation) {
        this.hubspotWorkspaceService.addWorkspaceContactAssociation({
          orgId: memberData.orgId,
          contactEmail: memberData.email,
          orgRole: memberData.role as unknown as OrganizationRoleEnums,
        });
      }

      // [Hubspot] send workspace size changed event
      if (!options.skipWorkspaceSizeChangedEvent) {
        this.hubspotWorkspaceService.sendWorkspaceEvent({
          orgId: memberData.orgId,
          eventName: HubspotWorkspaceEventName.WORKSPACE_SIZE_CHANGED,
          properties: {
            invited_role: ORG_ROLE_TO_INVITED_ROLE[memberData.role as OrganizationRoleEnums],
          },
        });
      }
    }

    const { email, orgId, userId } = memberData;
    this.removeRequestJoinOrg({ email, orgId, userId });
    this.removeRequestAccessDocumentNoti(memberData.userId, memberData.orgId);
    this.redisService.removeInviteToken(memberData.email, memberData.orgId)
      .catch((error) => this.loggerService.error({ error, context: 'removeInviteToken' }));
    this.userService.trackPlanAttributes(userId);
    return member;
  }

  public removeRequestJoinOrg({ email, orgId, userId }: { email: string, orgId: string, userId: string }) {
    this.removeRequesterByEmailInOrg(
      email,
      orgId,
      AccessTypeOrganization.REQUEST_ORGANIZATION,
    );
    this.notificationService.removeRequestJoinOrgNotification({
      actorId: userId,
      entityId: orgId,
    });
  }

  public async requestJoinOrganization(
    organization: IOrganization,
    user: User,
  ): Promise<IRequestAccess> {
    const requester = new RequestOrganizationConcreteBuilder()
      .setActor(user.email)
      .setTarget(organization._id)
      .setEntity({
        role: OrganizationRoleEnums.MEMBER,
      })
      .setType();
    const request = await this.createRequestAccess(requester.build());
    const managerUsers = await this.findMemberWithRoleInOrg(
      organization._id,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
      { userId: 1 },
    );
    const notification = notiOrgFactory.create(NotiOrg.REQUEST_JOIN, {
      actor: { user },
      entity: { organization },
    });
    const receiverIds = managerUsers.map(({ userId }) => userId);
    if (receiverIds.length) {
      this.notificationService.createUsersNotifications(
        notification,
        receiverIds as string[],
        NotificationTab.REQUESTS,
      );

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseOrganizationFactory.create(NotiOrg.REQUEST_JOIN, {
        organization,
        actor: user,
      });
      this.notificationService.publishFirebaseNotifications(
        receiverIds.map((objectId) => objectId.toHexString()),
        notificationContent,
        notificationData,
      );
    }
    const requestJoinOrganizationEvents: IRequestJoinOrganizationEvent = {
      external_id: user._id.toString(),
      name: EventName.USER_REQUEST_ORGANIZATION_ACCESS,
      time: new Date(),
      properties: {
        targetOrganizationId: organization._id.toString(),
        organizationAccessRequestId: request._id.toString(),
        circleAdmins: managerUsers.map(({ userId: managerUserId }) => String(managerUserId)),
      },
    };
    this.brazeService.trackRequestJoinOrganization(requestJoinOrganizationEvents);
    return request;
  }

  public async joinOrganization(
    user: User,
    organizationId?: string,
    trackingContext?: { anonymousUserId?: string; userAgent?: string },
  ): Promise<{organization: IOrganization, error?: GraphErrorException, defaultOrg?: IOrganization}> {
    const { error, organization } = await this.checkValidOrganization(user, organizationId);
    if (error) {
      return {
        error,
        organization: null,
      };
    }
    const isPopularDomain = Utils.verifyDomain(user.email);
    const {
      unallowedAutoJoin,
      _id: orgId,
    } = organization;
    const isPrevent = this.isBelongToUnallowedList(
      unallowedAutoJoin,
      user._id,
    );
    if (isPopularDomain || isPrevent) {
      return {
        organization: null,
        error: GraphErrorException.BadRequest('Join orgnization failed'),
      };
    }
    try {
      await this.validateUpgradingEnterprise(organization._id);
    } catch (e) {
      // prevent user join organization when this organization is being upgraded enterprise.
      return {
        organization: null,
        error: GraphErrorException.BadRequest('Organization is upgrading to enterprise'),
      };
    }

    const [memberFound, isRequested] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.getMembershipByOrgAndUser(organization._id, user._id),
      this.findMemberInRequestAccess(organization._id, user.email, { _id: 1 }),
    ]);

    if (memberFound || isRequested) {
      return {
        organization: null,
        error: GraphErrorException.BadRequest('You already join or request to join this organization', ErrorCode.Org.ALREADY_REQUEST_TO_JOIN_ORG),
      };
    }
    const totalMembersCount = await this.getTotalMemberInOrg(orgId);
    const {
      shouldAddMember,
      isNotifyToManagers,
    } = this.shouldAutoAddMemberToOrg(organization, totalMembersCount);
    if (!shouldAddMember) {
      return {
        organization: null,
        error: GraphErrorException.BadRequest('Join organization failed'),
      };
    }
    const orgMembership = await this.findMemberWithRoleInOrg(
      orgId,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
      { userId: 1 },
    );
    const managerIds: string[] = orgMembership
      .filter(Boolean)
      .map(({ userId }) => userId.toHexString());
    const memberData = {
      userId: user._id,
      email: user.email,
      orgId,
      internal: true,
      role: OrganizationRoleEnums.MEMBER,
    };
    await this.handleAddMemberToOrg(memberData);

    if (isNotifyToManagers) {
      this.turnOffAutoApprove(orgId, managerIds);
    }
    const autoJoinOrgNoti = notiOrgFactory.create(NotiOrg.AUTO_JOIN_ORG, {
      actor: {
        user,
      },
      target: {
        organization,
      },
      entity: null,
    });
    this.notificationService.createUsersNotifications(
      autoJoinOrgNoti,
      managerIds,
    );
    // send out-app noti for mobile
    const { notificationContent, notificationData } = notiFirebaseOrganizationFactory.create(NotiOrg.AUTO_JOIN_ORG, {
      organization,
      actor: user,
    });
    this.notificationService.publishFirebaseNotifications(managerIds, notificationContent, notificationData);

    if (!organization.metadata?.firstUserJoinedManually) {
      const firstUserManuallyJoinOrgNoti = notiOrgFactory.create(
        NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG,
        {
          actor: null,
          target: null,
          entity: { organization },
        },
      );
      this.notificationService.createUsersNotifications(
        firstUserManuallyJoinOrgNoti,
        managerIds,
      );
      await this.organizationModel.updateOne(
        { _id: orgId },
        {
          $set: {
            'metadata.firstUserJoinedManually': true,
          },
        },
      );

      // send out-app noti for mobile
      const {
        notificationContent: firebaseNotificationContent,
        notificationData: firebaseNotificationData,
      } = notiFirebaseOrganizationFactory.create(NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG, {
        organization,
      });
      this.notificationService.publishFirebaseNotifications(managerIds, firebaseNotificationContent, firebaseNotificationData);
    }
    this.trackUserAcceptOrganizationInvitation({
      organizationId: orgId,
      userId: memberData.userId,
      trackingContext,
    });

    return {
      organization,
    };
  }

  public async checkValidOrganization(
    user: User,
    orgId: string,
  ): Promise<{organization: IOrganization, error?: GraphErrorException, }> {
    const emailDomain = Utils.getEmailDomain(user.email);
    const organization = await this.getOrgById(orgId);
    if (![...organization.associateDomains, organization.domain].includes(emailDomain)) {
      return {
        error: GraphErrorException.BadRequest('Organization is not existed', ErrorCode.Common.NOT_FOUND),
        organization: null,
      };
    }
    return {
      organization,
    };
  }

  public async createDefaultPermission(
    refId: string,
    resource: string,
  ): Promise<IOrganizationGroupPermission[]> {
    return Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.keys(policies[resource]).map((role) => {
        const source = policies[resource][role];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const permissions = Object.keys(source).reduce((accum, sourceValue) => {
          if (sourceValue === 'permissions') {
            const resolvers = source[sourceValue];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const subPermissions = Object.values(resolvers).map((resolver) => ({
              name: resolver,
              effect: Effect.ALLOW,
            }));
            return [...accum, ...subPermissions];
          }
          return accum;
        }, []);
        const group: IOrganizationGroupPermissionData = {
          name: role,
          resource,
          refId,
          permissions,
          version: source.version,
        };

        return this.createGroupPermission(group);
      }),
    );
  }

  public async inviteLuminUser(
    invitedUser: User,
    organization: IOrganization,
    role: OrganizationRoleInvite,
    options?: { skipHubspotWorkspaceAssociation?: boolean; skipWorkspaceSizeChangedEvent?: boolean },
  ): Promise<IOrganizationMember> {
    const internal = Utils.isInternalOrgMember(invitedUser.email, organization);
    // add member to organization member
    const memberData = {
      userId: invitedUser._id,
      email: invitedUser.email,
      orgId: organization._id,
      internal,
      role: OrganizationRoleEnums[role],
    };
    return this.handleAddMemberToOrg(memberData, {
      skipHubspotWorkspaceAssociation: options?.skipHubspotWorkspaceAssociation,
      skipWorkspaceSizeChangedEvent: options?.skipWorkspaceSizeChangedEvent,
    });
  }

  public async addMemberToOrg({
    email,
    organization,
    role,
    options,
  }: {
    email: string;
    organization: IOrganization;
    role: OrganizationRoleInvite;
    options?: {
      skipHubspotWorkspaceAssociation?: boolean;
      skipWorkspaceSizeChangedEvent?: boolean;
    };
  }): Promise<{
    member: IOrganizationMember;
  }> {
    if (!role) {
      throw GraphErrorException.BadRequest(
        'Role is required when invite member',
      );
    }
    const luminUser = await this.userService.findUserByEmail(email);
    const result = await this.inviteLuminUser(luminUser, organization, role, {
      skipHubspotWorkspaceAssociation: options?.skipHubspotWorkspaceAssociation,
      skipWorkspaceSizeChangedEvent: options?.skipWorkspaceSizeChangedEvent,
    });
    return {
      member: result,
    };
  }

  public sendMailToInvitedUser({
    actor,
    organization,
    emails,
    existedUsers,
    isNeedApprove = true,
  }: {
    actor: { email: string; name: string };
    organization: IOrganization;
    emails: string[],
    existedUsers?: User[],
    isNeedApprove?: boolean,
  }): void {
    const { name, _id: orgId } = organization;

    const authUrl = this.environmentService.getByKey(EnvConstants.AUTH_URL);
    const emailData = {
      inviteeName: actor.name,
      orgName: name,
      subject: `${actor.name} invited you to ${name}'s ${ORGANIZATION_TEXT}`,
    };

    emails.forEach((userEmail) => {
      const tokenPayload: IUserInvitationToken = {
        metadata: {
          orgId,
          isSameUnpopularDomain: !isNeedApprove,
        },
        email: userEmail,
        type: UserInvitationTokenType.CIRCLE_INVITATION,
      };
      const inviteToken = this.jwtService.sign(tokenPayload, {
        expiresIn: Number(this.environmentService.getByKey(
          EnvConstants.INVITE_TO_ORG_TOKEN_EXPIRE,
        )),
      });
      this.redisService.setValidInviteToken(userEmail, orgId, inviteToken);
      const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
      const returnTo = `${baseUrl}/?token=${inviteToken}`;
      const invitationLink = `${authUrl}/sign-up/invitation?token=${inviteToken}&return_to=${returnTo}`;
      this.emailService.sendEmail(
        isNeedApprove ? EMAIL_TYPE.INVITE_MEMBER_TO_ORGANIZATION : EMAIL_TYPE.INVITE_MEMBER_TO_ORGANIZATION_SAME_UNPOPULAR_DOMAIN,
        [userEmail],
        { ...emailData, invitationLink },
      );
      const user = existedUsers?.find((existedUser) => existedUser.email === userEmail);
      if (user) {
        const integrationNotification = integrationNotificationHandler({
          context: NotificationContext.Circle,
          type: OrganizationAction.INVITE_MEMBER_TO_ORG,
          data: {
            sendTo: [user._id],
            actor: {
              id: user._id,
            },
            target: {
              actorName: actor.name,
              circleName: organization.name,
            },
            data: {
              circleId: organization._id,
              inviteUrl: invitationLink,
            },
          },
        });
        this.integrationService.sendNotificationToIntegration(integrationNotification);
      }
    });
  }

  public async notifyInviteToOrg({
    actor,
    organization,
    memberList,
    actorType,
  }: {
    actor: User;
    organization: IOrganization;
    memberList: IRequestAccess[];
    actorType: APP_USER_TYPE;
  }): Promise<INotification> {
    const userEmailList = memberList.map((item) => item.actor);
    const members = await this.userService.findUserByEmails(userEmailList);
    const memberIds = members.map((member) => member._id);

    const emails = members.map((member) => member.email);
    const validRequests = memberList.filter((member) => emails.includes(member.actor));

    const invitationList = validRequests.map((request) => ({ _id: request._id, email: request.actor }));

    const notification = notiOrgFactory.create(NotiOrg.INVITE_JOIN, {
      actor: { user: actor, actorData: { type: actorType } },
      target: {
        user: members?.[0] || {
          email: memberList[0].actor,
        },
        targetData: {
          totalMember: memberList.length,
          addedMemberIds: memberIds,
          invitationList,
        },
      },
      entity: { organization },
    });

    const orgManager = (await this.organizationMemberModel.find({
      orgId: organization._id,
      role: {
        $in: [
          OrganizationRoleEnums.ORGANIZATION_ADMIN,
          OrganizationRoleEnums.BILLING_MODERATOR,
        ],
      },
    })).map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
    // send notification
    const managerIds = orgManager
      .map((member) => member.userId.toHexString())
      .filter((userId) => userId !== actor._id);
    const createdNoti = await this.handleCreateInvitationNofication({ notification, invitedUserIds: memberIds, managerIds });
    await this.sendFirstMemberInviteCollaboratorNoti({ organization, actor, managerIds });

    // send out app noti
    if (memberIds.length > 0) {
      const {
        notificationContentForTargetUser,
        notificationData,
        notificationContent,
      } = notiFirebaseOrganizationFactory.create(NotiOrg.INVITE_JOIN, {
        actor,
        organization,
        targetUser: members[0],
        actorType,
      });
      this.notificationService.publishFirebaseNotifications(
        managerIds,
        notificationContent,
        notificationData,
      );
      this.notificationService.publishFirebaseNotifications(
        memberIds,
        notificationContentForTargetUser,
        notificationData,
      );
    }

    return createdNoti;
  }

  async sendFirstMemberInviteCollaboratorNoti({
    organization,
    actor,
    managerIds,
  }:{ organization: IOrganization, actor: User, managerIds: string[] }): Promise<void> {
    const { role: inviterRole } = await this.getMembershipByOrgAndUser(organization._id, actor._id) || {};
    const isFirstMemberInviteCollaborator = !organization.metadata?.firstMemberInviteCollaborator
      && organization.settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE
      && inviterRole === OrganizationRoleEnums.MEMBER;
    if (isFirstMemberInviteCollaborator) {
      await this.organizationModel.updateOne(
        { _id: organization._id },
        {
          $set: {
            'metadata.firstMemberInviteCollaborator': true,
          },
        },
      );

      // send notification
      const firstMemberInviteCollaboratorNoti = notiOrgFactory.create(NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR, {
        actor: { user: actor },
        entity: { organization },
      });
      await this.notificationService.createUsersNotifications(firstMemberInviteCollaboratorNoti, managerIds);

      // send email to org's admins
      const orgMemberships = await this.getOrganizationMemberByRole(
        organization._id,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      );
      const receiverEmails = orgMemberships.map((user) => user.email);
      const subject = SUBJECT[EMAIL_TYPE.FIRST_MEMBER_INVITE_COLLABORATOR.description].replace('#{orgName}', organization.name);
      const emailData = {
        orgId: organization._id,
        orgName: organization.name,
        subject,
      };
      this.emailService.sendEmail(
        EMAIL_TYPE.FIRST_MEMBER_INVITE_COLLABORATOR,
        receiverEmails,
        emailData,
      );

      // send out-app noti for mobile
      const {
        notificationContent: firebaseNotificationContent,
        notificationData: firebaseNotificationData,
      } = notiFirebaseOrganizationFactory.create(NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR, {
        organization,
        actor,
      });
      this.publishFirebaseNotiToAllOrgMember({
        orgId: organization._id,
        firebaseNotificationData,
        firebaseNotificationContent,
      });
    }
  }

  async handleCreateInvitationNofication(
    params: { notification: NotiInterface, invitedUserIds: string[], managerIds: string[] },
  ): Promise<INotification> {
    const { notification, invitedUserIds, managerIds } = params;
    const createdNotification = await this.notificationService.createNotifications(notification);
    this.notificationService.handleCreateNotificationUser({ createdNotification, receiverIds: invitedUserIds, tab: NotificationTab.INVITES });
    this.notificationService.handleCreateNotificationUser({ createdNotification, receiverIds: managerIds, tab: NotificationTab.GENERAL });
    return createdNotification;
  }

  public notifyLeaveOrg(leaver: User, org: IOrganization): void {
    const notification = notiOrgFactory.create(NotiOrg.LEAVE_ORG, {
      actor: { user: leaver },
      entity: { organization: org },
    });
    this.publishNotiToAllOrgMember({
      orgId: org._id,
      notification,
      excludedIds: [leaver._id],
    });

    // send out-app noti for mobile
    const {
      notificationData: firebaseNotificationData,
      notificationContent: firebaseNotificationContent,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.LEAVE_ORG, {
      organization: org,
      actor: leaver,
    });
    this.publishFirebaseNotiToAllOrgMember({
      orgId: org._id, firebaseNotificationContent, firebaseNotificationData, excludedIds: [leaver._id],
    });
  }

  public notifyAcceptJoinOrg(
    approvedUser: User,
    acceptor: User,
    organization: IOrganization,
  ): void {
    const notificationData = notiOrgFactory.create(
      NotiOrg.ACCEPT_REQUEST_ACCESS_ORG,
      {
        actor: { user: acceptor },
        target: { user: approvedUser },
        entity: { organization },
      },
    );
    this.publishNotiToAllOrgMember({
      orgId: organization._id,
      notification: notificationData,
      requiredReceiverIds: [approvedUser._id],
      excludedIds: [acceptor._id],
    });

    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.ACCEPT_REQUEST_ACCESS_ORG, {
      organization,
    });
    this.notificationService.publishFirebaseNotifications(
      [approvedUser._id],
      firebaseNotificationContent,
      firebaseNotificationData,
    );
  }

  public async notifyDeleteOrganization(
    organization: IOrganization,
    receiverList: IOrganizationMember[],
    actorRole: number,
  ): Promise<void> {
    const notificationData = notiOrgFactory.create(
      actorRole,
      {
        entity: { organization },
      },
    );
    const receiverIds = await this.getOrgNotiReceiverIds({
      orgId: organization._id,
      optionalReceivers: receiverList,
    });
    this.notificationService.createUsersNotifications(
      notificationData,
      receiverIds,
    );
    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.DELETE_ORGANIZATION, {
      organization,
    });
    this.notificationService.publishFirebaseNotifications(receiverIds, firebaseNotificationContent, firebaseNotificationData);
  }

  public notifyStopTransferOwner(data: {
    organization: IOrganization;
    currentOwner: User;
    transferredOwner: User;
  }): void {
    const { organization, currentOwner, transferredOwner } = data;
    const { ownerId } = organization;
    const notificationData = notiOrgFactory.create(
      NotiOrg.STOP_TRANSFER_ADMIN,
      {
        actor: {
          user: currentOwner,
          actorData: { type: APP_USER_TYPE.SALE_ADMIN },
        },
        target: { user: transferredOwner },
        entity: { organization },
      },
    );
    this.notificationService.createUsersNotifications(notificationData, [
      ownerId,
    ]);

    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.STOP_TRANSFER_ADMIN, {
      actor: currentOwner,
      organization,
    });
    this.notificationService.publishFirebaseNotifications([ownerId.toHexString()], firebaseNotificationContent, firebaseNotificationData);
  }

  public sendEmailAcceptJoinOrg(
    approvedUser: User,
    acceptor: User,
    organization: IOrganization,
  ): void {
    const subject = SUBJECT[
      EMAIL_TYPE.ACCEPT_REQUEST_ACCESS_ORGANIZATION.description
    ].replace('#{orgName}', organization.name);
    const emailData = {
      acceptorName: acceptor.name,
      orgName: organization.name,
      orgId: organization._id,
      subject,
    };
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.ACCEPT_REQUEST_ACCESS_ORGANIZATION,
      [approvedUser.email],
      emailData,
    );
  }

  public sendEmailInviteOrgTeam(
    invitedUserEmail: string,
    actor: User,
    organization: IOrganization,
    team: ITeam,
  ): void {
    const subject = SUBJECT[
      EMAIL_TYPE.ADD_MEMBER_TO_ORGANIZATION_TEAM.description
    ]
      .replace('#{actorName}', actor.name)
      .replace('#{orgTeamName}', team.name);
    const emailData = {
      inviteeName: actor.name,
      orgName: organization.name,
      orgId: organization._id,
      orgTeamName: team.name,
      teamId: team._id,
      subject,
      addMemberOrgTeamDeeplink:
        this.emailService.generateDeeplinkForEmail(
          EMAIL_MOBILE_PATH.EMAIL_TEAM_INVITATION,
          `/redirection?url=/${ORG_URL_SEGEMENT}/${organization._id}/documents/${TEAM_URL_SEGEMENT}/${team._id}`,
        ),
    };
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.ADD_MEMBER_TO_ORGANIZATION_TEAM,
      [invitedUserEmail],
      emailData,
    );
  }

  public async addUserToOrgsWithInvitation(
    user: User,
    orgId: string,
    trackingContext?: { anonymousUserId?: string; userAgent?: string },
  ): Promise<string[]> {
    const { _id: userId, email } = user;
    const listInvite = await this.getInviteOrgList({
      actor: email,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
      target: orgId,
    });
    const listOrgIds = [];
    if (listInvite.length) {
      const memberships = await Promise.all(
        listInvite.map(async (invite) => {
          const orgData = await this.getOrgById(invite.target);
          const memberData = {
            userId,
            email,
            orgId: invite.target,
            internal: Utils.isInternalOrgMember(email, orgData),
            role: invite.entity.role,
          };
          listOrgIds.push(invite.target);
          const memberShip = await this.handleAddMemberToOrg(memberData);

          let sourceEventAction = SourceActions.REGULAR_SIGN_UP;
          const hasSignedUpWithInvite = await this.redisService.checkUserSignUpWithInvite(
            email,
          );
          if (hasSignedUpWithInvite) {
            sourceEventAction = SourceActions.INVITATION_SIGN_UP;
          }
          this.eventService.createEvent({
            eventName: NonDocumentEventNames.ORG_MEMBER_JOINED,
            eventScope: EventScopes.ORGANIZATION,
            sourceAction: sourceEventAction,
            actor: user,
            organization: orgData,
          });
          this.trackUserAcceptOrganizationInvitation({
            organizationId: invite.target,
            userId,
            trackingContext,
          });
          return memberShip;
        }),
      );
      if (memberships.length) {
        const [requestAccess] = await this.getRequestAccessByCondition({
          actor: email,
          type: AccessTypeOrganization.INVITE_ORGANIZATION,
          target: orgId,
        });
        await this.removeRequestAccess({
          actor: email,
          type: AccessTypeOrganization.INVITE_ORGANIZATION,
          target: orgId,
        });
        const [notification] = await this.notificationService.getNotificationsByConditions({
          actionType: NotiOrg.INVITE_JOIN,
          'entity.entityId': orgId,
          'target.targetData.invitationList._id': requestAccess._id,
        });
        if (notification) {
          this.notificationService.removeNotification(notification, user._id);
        }
      }
    }
    const organization = await this.getOrgById(orgId);
    const acceptInviteNotification = integrationNotificationHandler({
      context: NotificationContext.Circle,
      type: OrganizationAction.ACCEPT_INVITE,
      data: {
        sendTo: [userId],
        data: {},
        target: {
          circleName: organization.name,
        },
        actor: {
          id: user._id,
        },
      },
    });
    this.integrationService.sendNotificationToIntegration(acceptInviteNotification);
    return listOrgIds;
  }

  public async updateMemberRoleInOrg({
    orgId,
    targetId,
    newRole,
    oldRole,
  }: {
    orgId: string;
    targetId: string;
    newRole: string;
    oldRole: string;
  }): Promise<any> {
    const targetMembership = await this.getMembershipByOrgAndUser(
      orgId,
      targetId,
      { groups: 1, role: 1 },
    );

    const groups = await this.getGroupPermissionByCondition(
      {
        refId: orgId,
        name: { $in: [newRole, oldRole] },
      },
      { name: 1 },
    );
    if (!groups?.length) {
      throw GraphErrorException.BadRequest(
        "Can't get group permission for this role",
      );
    }
    const newGroup = groups.find((group) => group.name === newRole);
    const oldGroup = groups.find((group) => group.name === oldRole);

    const newGroups = [
      String(newGroup._id),
      ...targetMembership.groups.filter(
        (groupId) => groupId !== oldGroup._id,
      ),
    ];

    return this.organizationMemberModel.updateOne(
      {
        userId: targetId,
        orgId,
      },
      {
        role: newRole,
        groups: newGroups,
      },
    );
  }

  public async grantOrgMembersRole(
    orgId: string,
    actorId: string,
    members: MemberRole[],
  ): Promise<void> {
    const membersWithRole = members.reduce(
      (acc: MemberRole[], current: MemberRole) => {
        if (!acc.find((mb) => mb.email === current.email)) {
          acc.push(current);
        }
        return acc;
      },
      [],
    );
    const promises = membersWithRole.map((member) => this.getOrgManagement()
      .from(orgId)
      .actor(actorId)
      .set(member.email)
      .role(OrganizationRoleEnums[member.role] as string)
      .catch((error) => error));
    const receiverIds = await Promise.all(
      membersWithRole.map(async (member) => {
        const user = await this.userService.findUserByEmail(member.email, {
          _id: 1,
        });
        return user._id;
      }),
    );
    const actorInfo = await this.userService.findUserById(actorId, { name: 1 });
    await Promise.all(promises).then((result) => {
      const errors = result.filter((error, index) => {
        const memberRole = membersWithRole[index].role;
        const isSetAdmin = memberRole.toLowerCase() === OrganizationRoleEnums.ORGANIZATION_ADMIN;
        if (!error && !isSetAdmin) {
          this.publishUpdateOrganization(
            [receiverIds[index]],
            {
              actorName: actorInfo.name,
              role: OrganizationRoleEnums[memberRole],
              orgId,
              userId: receiverIds[index],
            },
            SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
          );
        }
        return Boolean(error);
      });
      if (errors.length) {
        throw errors[0];
      }
    });
  }

  public async confirmOrganizationAdminTransfer(
    userId: string,
    token: string,
  ): Promise<void> {
    let tokenData = null;
    const actorUser = await this.userService.findUserById(userId);
    try {
      tokenData = this.jwtService.verify(token);
    } catch (error) {
      tokenData = this.jwtService.decode(token, {});
      if (tokenData.grantedEmail !== actorUser.email) {
        throw GraphErrorException.Forbidden("Don't have permission to confirm");
      }

      if (error instanceof TokenExpiredError) {
        throw GraphErrorException.BadRequest(
          'Transfer token expired',
          ErrorCode.Org.TRANSFER_TOKEN_EXPIRED,
        );
      }
      throw error;
    }
    if (!tokenData) {
      throw GraphErrorException.BadRequest('Token is not valid');
    }
    const { orgId, grantedEmail } = tokenData;
    if (actorUser.email !== grantedEmail) {
      throw GraphErrorException.Forbidden("Don't have permission to confirm");
    }
    const [ownerPermission] = await this.getMemberships({
      orgId,
      role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
    });
    this.rabbitMQService.publish(EXCHANGE_KEYS.WORKSPACE, ROUTING_KEY.LUMIN_WEB_TRANSFER_WORKSPACE, {
      oldUserId: ownerPermission.userId,
      workspaceId: orgId,
      destinationUserId: userId,
    });
    return this.getOrgManagement().from(orgId as string).actor(userId).setAdmin();
  }

  public async updateOrganizationOwner(
    organization: IOrganization,
    owner: User,
  ): Promise<IOrganization> {
    const { customerRemoteId, stripeAccountId } = organization.payment;
    if (customerRemoteId) {
      this.paymentService.updateStripeCustomer(customerRemoteId, {
        email: owner.email,
      }, { stripeAccount: stripeAccountId });
    }

    const updatedOrg = await this.organizationModel
      .findByIdAndUpdate(organization._id, {
        ownerId: owner._id,
        billingEmail: owner.email,
      }, {})
      .exec();
    return updatedOrg ? { ...updatedOrg.toObject(), _id: updatedOrg._id.toHexString() } : null;
  }

  public publishUpdateOrganization(
    receiverIds: string[],
    payload: Record<string, any>,
    publishType: string,
  ): void {
    let channelName = publishType;
    if (
      [
        SUBSCRIPTION_CHANGED_DOCUMENT_STACK,
        SUBSCRIPTION_UPDATE_ORG,
        SUBSCRIPTION_DELETE_ORGANIZATION,
        SUBSCRIPTION_REMOVE_ORG_MEMBER,
        SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
      ].includes(publishType)
    ) {
      channelName = `${publishType}.${payload.orgId}`;
    }
    if (isEmpty(receiverIds)) {
      this.pubSub.publish(channelName, {
        [publishType]: {
          userId: '',
          orgId: payload.orgId,
          ...payload,
        },
      });
    } else {
      receiverIds.forEach((userId) => {
        if (
          [
            SUBSCRIPTION_DELETE_ORGANIZATION,
            SUBSCRIPTION_REMOVE_ORG_MEMBER,
            SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
          ].includes(publishType)
        ) {
          channelName = `${channelName}.${userId}`;
        }
        this.pubSub.publish(channelName, {
          [publishType]: {
            userId,
            orgId: payload.orgId,
            ...payload,
          },
        });
      });
    }
  }

  public publishDeleteOrganization(
    receiverIds: string[],
    payload: Record<string, any>,
  ): void {
    for (let i = 0; i < receiverIds.length; i++) {
      this.pubSub.publish(`${SUBSCRIPTION_DELETE_ORGANIZATION}.${payload.orgId}.${receiverIds[i]}`, {
        [SUBSCRIPTION_DELETE_ORGANIZATION]: {
          userId: receiverIds[i],
          ...payload,
        },
      });
    }
  }

  public async getOrganizationMemberByRole(
    orgId: string,
    roles: string[] = [OrganizationRoleEnums.ORGANIZATION_ADMIN],
  ): Promise<User[]> {
    const memberships = await this.organizationMemberModel.find({
      orgId,
      role: { $in: roles },
    }).exec();
    return Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      memberships.map((membership) => this.userService.findUserById(membership.userId)),
    );
  }

  public async updateRequestAccessUser(
    requestId: string,
    updatedProperties: UpdateQuery<IRequestAccess>,
  ): Promise<IRequestAccess> {
    const request = await this.requestAccessModel.findByIdAndUpdate(
      requestId,
      {
        $set: {
          ...updatedProperties,
        },
      },
      { new: true },
    ).exec();
    return request ? { ...request.toObject(), _id: request._id.toHexString() } : null;
  }

  public async publishFirebaseNotiToAllOrgMember({
    orgId,
    firebaseNotificationContent,
    firebaseNotificationData,
    requiredReceiverIds,
    excludedIds,
    extraMembers = [],
    firebaseNotificationContentExtra,
  } : {
    orgId: string,
    firebaseNotificationData: IFirebaseNotificationData,
    firebaseNotificationContent: IFirebaseNotification,
    requiredReceiverIds?: string[],
    excludedIds?: string[],
    extraMembers?: string[]
    firebaseNotificationContentExtra?: IFirebaseNotification,
  }) : Promise<void> {
    const listMembers = await this.getReceiverIdsOrganization({ orgId, requiredReceiverIds, excludedIds });

    if (!listMembers.length && !extraMembers.length) {
      return null;
    }
    if (extraMembers.length > 0) {
      this.notificationService.publishFirebaseNotifications(extraMembers, firebaseNotificationContentExtra, firebaseNotificationData);
    }
    return this.notificationService.publishFirebaseNotifications(listMembers, firebaseNotificationContent, firebaseNotificationData);
  }

  public async publishFirebaseNotiToAllTeamMember({
    teamId,
    excludes = [],
    extraMembers = [],
    firebaseNotificationContent,
    firebaseNotificationContentExtra,
    firebaseNotificationData,
  } : {
    teamId: string,
    excludes?: string[],
    extraMembers?: string[]
    firebaseNotificationData: IFirebaseNotificationData,
    firebaseNotificationContentExtra?: IFirebaseNotification,
    firebaseNotificationContent: IFirebaseNotification,
  }) : Promise<void> {
    const members = await this.membershipService.find({ teamId }, {}, { _id: 1, userId: 1, role: 1 });
    let receiverIds;
    if (members.length > TEAM_SIZE_LIMIT_FOR_NOTI) {
      receiverIds = members
        .filter((member) => member.role === TeamRoles.ADMIN && !excludes.includes(member.userId.toHexString()))
        .map((member) => member.userId.toHexString());
    } else {
      receiverIds = members
        .filter((member) => !excludes.includes(member.userId.toHexString()))
        .map((member) => member.userId.toHexString());
    }
    if (!receiverIds.length && !extraMembers.length) {
      return null;
    }
    if (extraMembers.length > 0 && firebaseNotificationContentExtra) {
      this.notificationService.publishFirebaseNotifications(extraMembers, firebaseNotificationContentExtra, firebaseNotificationData);
    }
    return this.notificationService.publishFirebaseNotifications(receiverIds as string[], firebaseNotificationContent, firebaseNotificationData);
  }

  public async getReceiverIdsOrganization({
    orgId,
    requiredReceiverIds,
    excludedIds,
  } : {
    orgId: string,
    requiredReceiverIds?: string[],
    excludedIds?: string[],
  }) : Promise<string[]> {
    const exceedOrgSizeLimitForNoti = await this.isOverOrgSizeLimitForNoti(orgId);
    let receiverNotiCondition: any = {
      orgId,
      userId: { $nin: excludedIds },
    };
    if (exceedOrgSizeLimitForNoti) {
      receiverNotiCondition = {
        ...receiverNotiCondition,
        $or: [
          {
            role: {
              $in: [
                OrganizationRoleEnums.ORGANIZATION_ADMIN,
                OrganizationRoleEnums.BILLING_MODERATOR,
              ],
            },
          },
          {
            userId: {
              $in: requiredReceiverIds,
            },
          },
        ],
      };
    }
    const receiverList = await this.getOrgMembershipByConditions({
      conditions: receiverNotiCondition,
      projection: { userId: 1 },
    });
    return receiverList.map((mb) => mb.userId.toHexString());
  }

  public async publishNotiToAllOrgMember(data: {
    orgId: string,
    notification: NotiInterface,
    requiredReceiverIds?: string[],
    excludedIds?: string[],
  }) : Promise<INotification> {
    const {
      orgId, notification, requiredReceiverIds = [], excludedIds = [],
    } = data;

    const listMembers = await this.getReceiverIdsOrganization({ orgId, requiredReceiverIds, excludedIds });

    if (!listMembers.length) {
      return null;
    }

    return this.notificationService.createUsersNotifications(notification, listMembers);
  }

  async notifyConvertOrganization(
    org: IOrganization,
    convertTo: ConvertOrganizationToEnum,
    recieverIds: string[],
  ): Promise<INotification> {
    const notificationType = convertTo === ConvertOrganizationToEnum.CUSTOM_ORGANIZATION
      ? NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION
      : NotiOrg.CONVERT_TO_MAIN_ORGANIZATION;
    const notification = notiOrgFactory.create(notificationType, {
      entity: { organization: org },
    });

    return this.notificationService.createUsersNotifications(
      notification,
      recieverIds,
    );
  }

  public async handleDeleteUserInOrganization({
    actor,
    org,
    removedId,
    existAgreement,
    existAgreementGenDocuments,
    destinationTransferAgreement,
  }: {
    actor: Partial<User>;
    org: IOrganization;
    removedId: string;
    existAgreement: boolean;
    existAgreementGenDocuments: boolean;
    destinationTransferAgreement: IOrganization;
  }): Promise<void> {
    const { subscriptionItems = [] } = org.payment;
    const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);
    await this.handleRemoveSeatRelateToSign({
      orgId: org._id, userIds: [removedId], actor: actor as User, signSubscription,
    });
    const [, removedUser, actorUserData] = await Promise.all([
      this.deleteMemberInOrg(org._id, removedId),
      this.userService.findUserById(removedId, null, true),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(actor._id),
    ]);
    this.documentService.deleteRecentDocumentList({ userId: removedUser._id, organizationId: org._id });
    this.userService.updateLastAccessedOrg(removedId, '');
    this.getMembersByOrgId(org._id, { userId: 1, role: 1 }).then(
      async (membersInOrg) => {
        const receiverList = membersInOrg.filter(
          (item) => item.userId.toHexString() !== actorUserData._id,
        );
        const receiveIdList = await this.getOrgNotiReceiverIds({
          orgId: org._id,
          optionalReceivers: receiverList,
          requiredReceiverIds: [removedId],
        });
        const notification = notiOrgFactory.create(NotiOrg.REMOVE_MEMBER, {
          actor: { user: actorUserData },
          target: {
            user: removedUser,
            ...(existAgreement || existAgreementGenDocuments
              ? {
                targetData: {
                  existAgreement, existAgreementGenDocuments, orgName: destinationTransferAgreement.name, orgUrl: destinationTransferAgreement.url,
                },
              }
              : {}),
          },
          entity: { organization: org },
        });
        this.notificationService.createUsersNotifications(notification, receiveIdList);

        if (org.payment.subscriptionRemoteId) {
          this.paymentService.updateTotalMembersCustomerMetadata({
            orgId: org._id, customerRemoteId: org.payment.customerRemoteId, stripeAccountId: org.payment.stripeAccountId,
          });
        }

        // send noti out-app
        const {
          notificationData: firebaseNotificationData,
          notificationContent: firebaseNotificationContent,
          notificationContentForTargetUser: firebaseNotificationContentExtra,
        } = notiFirebaseOrganizationFactory.create(NotiOrg.REMOVE_MEMBER, {
          organization: org,
          actor: actorUserData,
          targetUser: removedUser,
        });

        this.publishFirebaseNotiToAllOrgMember({
          orgId: org._id,
          firebaseNotificationContent,
          firebaseNotificationData,
          excludedIds: [actor._id, removedUser._id],
          extraMembers: [removedUser._id],
          firebaseNotificationContentExtra,
        });

        this.publishUpdateOrganization(
          [removedId],
          {
            userId: removedId,
            orgId: org._id,
            organization: org,
            actor: actorUserData,
          },
          SUBSCRIPTION_REMOVE_ORG_MEMBER,
        );
      },
    );

    const subject = SUBJECT[EMAIL_TYPE.REMOVE_ORG_MEMBER.description]
      .replace('#{orgName}', org.name)
      .replace('#{userName}', removedUser.name);
    this.emailService.sendEmailHOF(EMAIL_TYPE.REMOVE_ORG_MEMBER, [removedUser.email], {
      orgName: org.name,
      subject,
    });

    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${org._id}`;
    const targetEmail = await this.redisService.getRedisValueWithKey(
      transferKey,
    );
    if (removedUser.email === targetEmail) {
      this.redisService.deleteRedisByKey(transferKey);
    }

    // [Hubspot] remove workspace contact association
    this.hubspotWorkspaceService.removeWorkspaceContactAssociation({
      orgId: org._id,
      contactEmail: removedUser.email,
    });
  }

  public async convertPersonalDocToLuminByUpload(data: {
    uploader: Record<string, any>;
    fileRemoteId: string;
    documentId: string;
  }): Promise<IDocument> {
    const { uploader, fileRemoteId, documentId } = data;
    const [metaData, documentPermission] = await Promise.all([
      this.awsService.getDocumentMetadata(fileRemoteId),
      this.documentService.getOneDocumentPermission(uploader._id as string, {
        documentId,
        role: DocumentRoleEnum.OWNER,
      }),
    ]);
    if (!documentPermission) throw GraphErrorException.Forbidden('You do not have permission', ErrorCode.Common.NO_PERMISSION);

    const documentData: any = {
      remoteId: fileRemoteId,
      service: DocumentStorageEnum.S3,
      lastModifiedBy: new Types.ObjectId(uploader._id as string),
      mimeType: metaData.ContentType,
    };

    const createdDocument = await this.documentService.updateDocument(documentId, documentData);
    const ownerUser = await this.userService.findUserById(uploader._id as string);
    // Store activity in db
    const [organization] = await this.findOrganization({ _id: documentPermission.workspace.refId });
    this.createDocumentEventAndPublishUpdate({ ownerUser, createdDocument, organization });

    return createdDocument;
  }

  public async uploadDocument(data: {
    uploader: Record<string, any>;
    clientId: string;
    documentOwnerType: DocumentOwnerTypeEnum;
    fileRemoteId: string;
    fileName: string;
    context: IOrganization;
    folderId?: string;
    isNotify?: boolean;
    thumbnailRemoteId?: string;
  }): Promise<IDocument> {
    const {
      uploader,
      clientId,
      documentOwnerType,
      fileRemoteId,
      context,
      folderId,
      isNotify,
      fileName,
      thumbnailRemoteId,
    } = data;
    const metaData = await this.awsService.getDocumentMetadata(fileRemoteId);
    const { ContentLength: size } = metaData;
    const isPremium = context.payment.type !== PaymentPlanEnums.FREE;

    if (
      !this.rateLimiterService.verifyUploadFilesSize(isPremium, [
        { size },
      ])
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(uploader._id),
      this.documentService.createDocumentWithBufferData({
        fileName,
        clientId,
        fileRemoteId,
        uploader,
        docType: documentOwnerType,
        folderId,
        documentInfo: metaData,
        thumbnailRemoteId,
      }),
    ]);
    document.etag = await this.documentService.getDocumentETag(document.remoteId);

    return this.processAfterUpdateDocumentToDb({
      uploadedUser, clientId, document, documentOwnerType, uploader, organization, isNotify,
    });
  }

  async processAfterUpdateDocumentToDb({
    uploadedUser, clientId, document, documentOwnerType, uploader, organization, isNotify,
  }: IAfterUpdateParams): Promise<IDocument> {
    this.redisService.setUploadFileLimit({
      uploader: uploadedUser,
      totalUploaded: 1,
      resourceId: clientId,
      baseKey: RedisConstants.UPLOAD_DOCUMENT_TO_ORGANIZATION,
    });

    const documentPublish = this.documentService.cloneDocument(
      JSON.stringify(document),
      {
        ownerName: uploadedUser.name,
        ownerAvatarRemoteId: uploadedUser.avatarRemoteId,
        roleOfDocument: IndividualRoles.SHARER.toUpperCase(),
      },
    );
    const payload = {
      document: documentPublish,
      type: null,
    };
    let notification = null;
    let memberIds = [];
    const documentEventType = documentOwnerType === DocumentOwnerTypeEnum.PERSONAL
      ? DocumentOwnerTypeEnum.ORGANIZATION : documentOwnerType;
    const documentScope = ElasticsearchUtil.mapDocumentOwnerTypeToScope(
      documentEventType,
    );
    const eventData: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_UPLOADED,
      eventScope: documentScope,
      actor: uploadedUser,
      document: document as unknown as Document,
    };
    switch (documentOwnerType) {
      case DocumentOwnerTypeEnum.PERSONAL:
        await this.documentService.createDocumentPermission({
          documentId: document._id,
          refId: uploader._id,
          role: DocumentRoleEnum.OWNER,
          workspace: {
            refId: organization._id,
            type: DocumentWorkspace.ORGANIZATION,
          },
        });
        memberIds.push(uploadedUser._id);
        Object.assign(payload, {
          document: {
            ...payload.document,
            roleOfDocument: IndividualRoles.OWNER.toUpperCase(),
          },
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
        });
        eventData.organization = organization;
        break;
      case DocumentOwnerTypeEnum.ORGANIZATION: {
        await this.documentService.createDocumentPermission({
          documentId: document._id,
          refId: organization._id,
          role: DocumentRoleEnum.ORGANIZATION,
        });
        notification = notiDocumentFactory.create(
          NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
          {
            actor: { user: uploadedUser },
            entity: { document },
            target: { organization },
          },
        );
        const orgMembers = await this.getMembersByOrgId(organization._id, {
          userId: 1,
          role: 1,
        });
        memberIds = orgMembers.map(({ userId }) => userId);
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
          organizationId: organization._id,
        });
        if (isNotify) {
          const receiverList = orgMembers.filter(
            ({ userId }) => userId.toHexString() !== uploader._id,
          );
          const receiverIds = await this.getOrgNotiReceiverIds({
            orgId: organization._id,
            optionalReceivers: receiverList,
          });
          this.notificationService.createUsersNotifications(notification, receiverIds);

          // send out-app noti for mobile
          const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION, {
            document,
            organization,
            actor: uploadedUser,
          });
          this.notificationService.publishFirebaseNotifications(receiverIds, notificationContent, notificationData);
        }
        eventData.organization = organization;
        break;
      }
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM: {
        const team: ITeam = await this.teamService.findOneById(clientId);
        await this.documentService.createDocumentPermission({
          documentId: document._id,
          refId: team._id,
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
        });
        notification = notiDocumentFactory.create(
          NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM,
          {
            actor: { user: uploadedUser },
            entity: { document },
            target: { team, organization },
          },
        );
        Object.assign(payload, {
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
          teamId: team._id,
        });
        const teamMembers = await this.membershipService.find({
          teamId: clientId,
        });
        memberIds = teamMembers.map(({ userId }) => userId);
        eventData.team = team;
        this.membershipService.publishNotiToAllTeamMember(
          clientId,
          notification as NotiInterface,
          [uploader._id as string],
        );
        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseDocumentFactory.create(NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM, {
          actor: uploadedUser,
          document,
          team,
          organization,
          isMultipleDocs: false,
          totalDocuments: 1,
        });
        this.publishFirebaseNotiToAllTeamMember({
          teamId: team._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [uploadedUser._id],
        });
        break;
      }
      default:
        break;
    }
    this.documentService.publishUpdateDocument(
      memberIds,
      payload,
      SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
    );

    this.eventService.createEvent(eventData);

    // track user use document
    const useDocumentEvent: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_USED,
      eventScope: EventScopes.PERSONAL,
      actor: uploadedUser,
      document: document as unknown as Document,
    };
    this.personalEventService.createUserUseDocumentEvent(useDocumentEvent);

    if (documentOwnerType === DocumentOwnerTypeEnum.PERSONAL) {
      Object.assign(documentPublish, {
        ...documentPublish,
        roleOfDocument: DocumentRoleEnum.OWNER.toUpperCase(),
      });
    }
    await this.documentService.addToRecentDocumentList({
      userId: uploadedUser._id, organizationId: organization._id, documents: [documentPublish],
    });

    return document;
  }

  public async getMemberInOrganizationByDocumentId(
    documentPermission: IDocumentPermission,
    currentUser: any,
    minQuantity: number,
    cursor: string,
  ): Promise<MemberWithCursorPaginationPayload> {
    const orgId = documentPermission.refId;
    const documentData = await this.documentService.getDocumentByDocumentId(documentPermission.documentId);
    const matchCondition: { [key: string]: any } = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      userId: { $nin: [new Types.ObjectId(currentUser._id), new Types.ObjectId(documentData.ownerId)] },
      orgId: new Types.ObjectId(orgId),
      role: { $in: [OrganizationRoleEnums.MEMBER, OrganizationRoleEnums.BILLING_MODERATOR] },
    };

    const lookupExpression = {
      from: 'users',
      let: {
        userId: '$userId',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$userId'],
            },
          },
        },
      ],
      as: 'user',
    };
    const projection = {
      _id: 1,
      role: 1,
      userId: 1,
    };
    const optionsPipeline = [
      { $match: matchCondition },
      {
        $project: projection,
      },
      { $sort: { role: 1 } },
      {
        $group: { _id: '', data: { $push: '$$ROOT' } },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: '$data',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    sortCount: {
                      $add: [1, { $indexOfArray: ['$data', '$$this'] }],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: '$data' },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
      { $match: { sortCount: { $gt: parseInt(cursor) } } },
      { $limit: minQuantity + 1 },
      {
        $lookup: lookupExpression,
      },
      {
        $unwind: '$user',
      },
    ];
    const addFieldPipeline = {
      data: {
        $map: {
          input: '$data',
          in: {
            $mergeObjects: [
              '$$this',
              {
                sortCount: {
                  $add: [1, { $indexOfArray: ['$data', '$$this'] }],
                },
              },
            ],
          },
        },
      },
    };
    const groupPipeline = { _id: '', data: { $push: '$$ROOT' } };
    const users = [];
    if (!cursor.length) {
      optionsPipeline.splice(7, 1);
      const foundUsers = await this.aggregateOrganizationMember([
        {
          $match: {
            $or: [
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                userId: new Types.ObjectId(currentUser._id),
                orgId: new Types.ObjectId(orgId),
              },
              {
                userId: new Types.ObjectId(documentData.ownerId),
                orgId: new Types.ObjectId(orgId),
              },
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                userId: { $ne: new Types.ObjectId(currentUser._id) },
                role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
                orgId: new Types.ObjectId(orgId),
              },
            ],
          },
        },
        {
          $project: projection,
        },
        {
          $group: groupPipeline,
        },
        {
          $addFields: addFieldPipeline,
        },
        { $unwind: '$data' },
        {
          $replaceRoot: {
            newRoot: '$data',
          },
        },
        {
          $lookup: lookupExpression,
        },
        {
          $unwind: '$user',
        },
      ]);
      const filterDuplicatedMembers = uniqBy(
        foundUsers.filter(Boolean),
        (member) => member.userId.toHexString(),
      );
      const sortMemberByCondition = (members) => {
        // eslint-disable-next-line consistent-return
        members.forEach((member) => {
          if (member.userId.toHexString() === currentUser._id) {
            users.push(member);
            remove(members, (item: any) => item.userId.toHexString() === currentUser._id);
            return sortMemberByCondition(members);
          }
          if (member.userId.toHexString() === documentData.ownerId.toHexString()) {
            users.push(member);
            remove(members, (item: any) => item.userId.toHexString() === member.userId.toHexString());
            return sortMemberByCondition(members);
          }
          if (member.role === OrganizationRoleEnums.ORGANIZATION_ADMIN) {
            users.push(member);
            remove(members, (item: any) => item.userId.toHexString() === member.userId.toHexString());
            return sortMemberByCondition(members);
          }
        });
      };
      sortMemberByCondition(filterDuplicatedMembers);
      optionsPipeline.splice(7, 1, { $limit: minQuantity + 1 - users.length });
    }
    const members = await this.aggregateOrganizationMember(optionsPipeline as any);
    members.unshift(...users);
    const document = await this.documentService.getDocumentByDocumentId(documentPermission.documentId);
    const totalMemberInOrg = (await this.getMembersByOrgId(orgId)).length;
    const membership = await this.getMembershipByOrgAndUser(
      orgId,
      currentUser._id,
    );

    let currentRole = null;
    let currentDocumentPermission = '';
    if (!membership) {
      currentDocumentPermission = (
        await this.documentService.getOneDocumentPermission(currentUser._id, {
          documentId: documentPermission.documentId,
        })
      ).role.toUpperCase();
    } else {
      currentRole = OrganizationRole[membership.role.toUpperCase()];
      currentDocumentPermission = this.documentService.getOrgMemberDocumentPermission({
        documentPermission, role: membership.role as OrganizationRoleEnums, userId: currentUser._id, documentOwnerId: document.ownerId,
      });
    }

    const memberPermissions = members.filter(Boolean).map((member) => {
      const { user } = member;
      const permission = this.documentService.getOrgMemberDocumentPermission({
        documentPermission, role: member.role as OrganizationRoleEnums, userId: user._id, documentOwnerId: document.ownerId,
      });
      return {
        userId: user._id,
        avatarRemoteId: user.avatarRemoteId,
        name: user.name,
        email: user.email,
        role: member.role.toUpperCase(),
        permission: permission.toUpperCase(),
      };
    });
    const returnMemberPermissions = memberPermissions.slice(0, minQuantity);
    const organization = await this.getOrgById(orgId, { name: 1, domain: 1 });
    return {
      members: returnMemberPermissions as MemberPermission[],
      organizationName: organization?.name,
      hasNextPage: members.length === minQuantity + 1,
      cursor: members.length
        ? members[returnMemberPermissions.length - 1].sortCount
        : cursor,
      total: totalMemberInOrg,
      currentRole,
      documentRole: currentDocumentPermission.toUpperCase() as DocumentRole,
    };
  }

  public async getMemberInOrganizationTeamByDocumentId(
    documentOrgTeamPermission: IDocumentPermission,
    currentUser: any,
    minQuantity: number,
    cursor: string,
  ): Promise<MemberWithCursorPaginationPayload> {
    const {
      refId: teamId,
      documentId,
    } = documentOrgTeamPermission;
    const documentData = await this.documentService.getDocumentByDocumentId(documentId);

    const lookupObject = {
      from: 'users',
      let: {
        userId: '$userId',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$userId'],
            },
          },
        },
      ],
      as: 'user',
    };
    const projectionPipeline = {
      _id: 1,
      userId: 1,
      teamId: 1,
      role: 1,
    };
    let optionsPipeline;
    const users = [];
    if (!cursor.length) {
      const foundUsers = await this.membershipService.aggregateMembers([
        {
          $match: {
            $or: [
              {
                teamId: new Types.ObjectId(teamId),
                userId: new Types.ObjectId(currentUser._id),
              },
              {
                teamId: new Types.ObjectId(teamId),
                userId: new Types.ObjectId(documentData.ownerId),
              },
            ],
          },
        },
        {
          $project: projectionPipeline,
        },
        { $lookup: lookupObject },
        {
          $unwind: '$user',
        },
      ]);
      if (foundUsers.length) {
        const filterDuplicatedMembers = uniqBy(
          foundUsers.filter(Boolean),
          (member) => member.userId.toHexString(),
        );
        users.unshift(...filterDuplicatedMembers);
      }
      optionsPipeline = [
        {
          $match: {
            teamId: new Types.ObjectId(teamId),
            userId: { $nin: [new Types.ObjectId(currentUser._id), new Types.ObjectId(documentData.ownerId)] },
          },
        },
        {
          $project: projectionPipeline,
        },
        {
          $sort: { role: -1, _id: 1 },
        },
        { $limit: minQuantity + 1 - users.length },
        { $lookup: lookupObject },
        {
          $unwind: '$user',
        },
      ];
    } else {
      optionsPipeline = [
        {
          $match: {
            teamId: new Types.ObjectId(teamId),
            role: { $ne: OrganizationTeamRoles.ADMIN },
          },
        },
        {
          $project: projectionPipeline,
        },
        {
          $sort: { _id: 1 },
        },
        {
          $match: { _id: { $gt: new Types.ObjectId(cursor) } },
        },
        { $limit: minQuantity + 1 },
        { $lookup: lookupObject },
        {
          $unwind: '$user',
        },
      ];
    }

    const [members, totalMember, membership, document] = await Promise.all([
      this.membershipService.aggregateMembers(optionsPipeline),
      this.membershipService.countTeamMember(teamId),
      this.membershipService.findOne({ teamId, userId: currentUser._id }),
      this.documentService.getDocumentByDocumentId(documentId, { ownerId: 1 }),
    ]);
    if (!cursor.length) {
      members.unshift(...users);
    }
    let currentRole: OrganizationRole = null;
    let currentPermission: DocumentPermissionOfMemberEnum;
    if (membership) {
      currentRole = membership.role === OrganizationTeamRoles.ADMIN
        ? OrganizationRole.TEAM_ADMIN
        : OrganizationRole[membership.role.toUpperCase()];
      currentPermission = this.documentService.getTeamMemberDocumentPermission({
        documentPermission: documentOrgTeamPermission,
        role: membership.role as OrganizationTeamRoles,
        userId: currentUser._id,
        documentOwnerId: document.ownerId,
      });
    } else {
      currentPermission = (
        await this.documentService.getOneDocumentPermission(currentUser._id, { documentId })
      ).role as DocumentPermissionOfMemberEnum;
    }
    const memberPermissions = members.filter(Boolean).map((member) => {
      const { user } = member;
      const permission = this.documentService.getTeamMemberDocumentPermission({
        userId: user._id,
        documentPermission: documentOrgTeamPermission,
        documentOwnerId: document.ownerId,
        role: member.role,
      });
      return {
        userId: user._id,
        avatarRemoteId: user.avatarRemoteId,
        name: user.name,
        email: user.email,
        role: member.role === OrganizationTeamRoles.ADMIN ? OrganizationRole.TEAM_ADMIN : member.role.toUpperCase(),
        permission: (permission.toUpperCase() as unknown) as DocumentRole,
      } as MemberPermission;
    });
    const returnMemberPermissions = memberPermissions.slice(0, minQuantity);
    const team = await this.teamService.findOne({ _id: teamId });
    const organization = await this.getOrgById(team.belongsTo);
    return {
      members: returnMemberPermissions,
      teamName: team.name,
      organizationName: organization.name,
      hasNextPage: members.length === minQuantity + 1,
      cursor: members.length
        ? members[returnMemberPermissions.length - 1]._id
        : cursor,
      total: totalMember,
      currentRole,
      documentRole: currentPermission.toUpperCase() as DocumentRole,
    };
  }

  async handleUserInviteMemberToOrg({
    actor,
    organization,
    member,
  }: {
    actor: User;
    organization: IOrganization;
    member: InviteToOrganizationInput;
  }): Promise<IRequestAccess> {
    const { email, role } = member;
    if (!role) {
      throw GraphErrorException.BadRequest(
        'Role is required when invite member',
      );
    }
    const requester = new InviteOrganizationConcreteBuilder()
      .setActor(email)
      .setTarget(organization._id)
      .setEntity({
        role: OrganizationRoleEnums[role],
      })
      .setInviterId(actor._id);
    const requestAccess = await this.createRequestAccess(requester.build());
    if (!requestAccess) {
      return null;
    }
    const luminUser = await this.userService.findUserByEmail(email);
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.ORG_MEMBER_ADDED,
      eventScope: EventScopes.ORGANIZATION,
      actor,
      organization,
    };
    if (luminUser) {
      eventData.target = luminUser;
    } else {
      eventData.nonLuminEmail = email;
    }

    this.eventService.createEvent(eventData);
    return requestAccess;
  }

  async getAllTeamOrganizationDocuments(
    orgId: string,
    projection?: any,
  ): Promise<Partial<IDocumentOwner>[]> {
    const teams = await this.teamService.find(
      {
        belongsTo: new Types.ObjectId(orgId),
      },
      {
        _id: 1,
      },
    );

    const teamIds = teams.map((team) => team._id);

    const documentsTeams = await Promise.all(
      teamIds.map((teamId) => this.documentService.getDocumentsWithRefAndRole(
        teamId,
        DocumentRoleEnum.ORGANIZATION_TEAM,
        projection,
      )),
    );

    return documentsTeams.reduce(
      (acc, currentDocuments) => [].concat(acc, currentDocuments),
      [],
    );
  }

  async getAllOrganizationDocuments(
    orgId: string,
    projection?: any,
    teamIncluded: boolean = true,
  ): Promise<IDocumentOwner[]> {
    const promises = [
      this.documentService.getDocumentsWithRefAndRole(
        orgId,
        DocumentRoleEnum.ORGANIZATION,
        projection,
      ),
    ];
    if (teamIncluded) {
      promises.push(this.getAllTeamOrganizationDocuments(orgId, projection));
    }
    const [orgDocuments = [], teamDocuments = []] = await Promise.all(promises);

    return [].concat(orgDocuments, teamDocuments);
  }

  async deleteAllDocumentsInOrgWorkspace(
    data: { orgId: string; orgTeams: ITeam[]; perservePersonalDoc?: boolean },
    session?: ClientSession,
  ): Promise<Document[]> {
    const { orgId, orgTeams, perservePersonalDoc } = data;
    const teamIds = orgTeams.map((team) => team._id);
    const deleteDocuments = await this.documentService.getDocumentPermissionByConditions(
      {
        $or: [
          {
            refId: { $in: [orgId, ...teamIds] },
            role: {
              $in: [
                DocumentRoleEnum.ORGANIZATION,
                DocumentRoleEnum.ORGANIZATION_TEAM,
              ],
            },
          },
          ...perservePersonalDoc ? [] : [{
            role: DocumentRoleEnum.OWNER,
            'workspace.refId': orgId,
          }],
        ],
      },
    );
    const documentIds = deleteDocuments.map((doc) => doc.documentId);
    const deleteDocumentList = await this.documentService.findDocumentsByIds(documentIds);
    this.documentService.emitSocketDeleteDocuments(documentIds);
    await this.documentService.deleteManyOriginalDocument(
      deleteDocumentList as unknown as Document[],
      session,
    );
    return deleteDocumentList as unknown as Document[];
  }

  getOrgMembers(orgId: string, projection?: any) {
    const aggregation = [
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          role: 1,
          internal: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$user', { role: '', internal: '' }, '$$ROOT'],
          },
        },
      },
      {
        $project: {
          user: 0,
          userId: 0,
        },
      },
    ];

    if (projection) {
      aggregation.push({
        $project: projection,
      });
    }
    return this.organizationMemberModel.aggregate(aggregation);
  }

  async getMembersChunk(
    orgId: string,
    lastId?: string,
    limit: number = 500,
  ): Promise<{ members: Member[]; lastId?: string; hasMore: boolean }> {
    const matchStage: { orgId: Types.ObjectId; _id?: { $gt: Types.ObjectId } } = { orgId: new Types.ObjectId(orgId) };

    if (lastId) {
      matchStage._id = { $gt: new Types.ObjectId(lastId) };
    }

    const members = await this.organizationMemberModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$_id',
          userId: '$user._id',
          email: '$user.email',
          name: '$user.name',
          role: '$role',
        },
      },
    ]);

    const hasMore = members.length > limit;
    const resultMembers = hasMore ? members.slice(0, limit) : members;
    const lastMemberId = resultMembers.length > 0 ? resultMembers[resultMembers.length - 1]._id.toString() : undefined;

    return {
      members: resultMembers.map((member) => ({
        _id: member.userId.toString(),
        email: member.email,
        name: member.name,
        role: member.role,
      })),
      lastId: lastMemberId,
      hasMore,
    };
  }

  getOrgRequestingMembers(
    orgId: string,
    types: AccessTypeOrganization[],
    projection?: any,
  ) {
    const aggregation = [
      {
        $match: {
          target: orgId,
          type: {
            $in: types,
          },
        },
      },
      {
        $project: {
          _id: 0,
          email: '$actor',
          role: '$entity.role',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$user', { role: '' }, '$$ROOT'],
          },
        },
      },
      {
        $project: {
          user: 0,
        },
      },
    ];
    if (projection) {
      aggregation.push({
        $project: projection,
      });
    }
    return this.requestAccessModel.aggregate(aggregation);
  }

  async exportDomainData(orgId: string, actorId: string): Promise<string> {
    const [organization, actor] = await Promise.all([
      this.getOrgById(orgId),
      this.userService.findUserById(actorId, { timezoneOffset: 1 }),
    ]);
    const [members, pendings, documents, invoices] = await Promise.all([
      this.getOrgMembers(orgId, { email: 1, name: 1, role: 1 }),
      this.getOrgRequestingMembers(
        orgId,
        [
          AccessTypeOrganization.INVITE_ORGANIZATION,
          AccessTypeOrganization.REQUEST_ORGANIZATION,
        ],
        { email: 1, name: 1, role: 1 },
      ),
      this.getAllOrganizationDocuments(
        orgId,
        {
          name: 1,
          size: 1,
          createdAt: 1,
          'owner._id': 1,
          'owner.name': 1,
        },
        false,
      ),
      this.paymentService.getFinishInvoices(
        organization.payment,
        MAX_INVOICES_EXPORTED,
      ),
    ]);

    const orgMembers = [...members, ...pendings];

    const exportMembers = new ExportDomainBase();
    const exportDocuments = new ExportDomainBase();
    const exportInvoices = new ExportDomainBase();

    const [membersBuffer, documentsBuffer, invoicesBuffer] = await Promise.all([
      exportMembers
        .setHeaders(['Name', 'Email', 'Role'])
        .setRows(
          orgMembers.map((member) => [member.name, member.email, member.role]),
        )
        .export(),
      exportDocuments
        .addIndex()
        .setHeaders(['Document name', 'Owner', 'Size', 'Created date'])
        .setRows(
          documents.map((document) => [
            document.name,
            document.owner.name,
            Utils.getSizeUnit(document.size),
            Utils.convertToLocalTime(
              document.createdAt,
              actor.timezoneOffset,
            ).format('lll'),
          ]),
        )
        .export(),
      exportInvoices
        .addIndex()
        .setHeaders(['Invoice ID', 'Link', 'Date', 'Amount'])
        .setRows(
          invoices.map((invoice) => {
            const date = new Date(Number(invoice.date) * 1000);
            return [
              invoice.id,
              invoice.downloadLink,
              Utils.convertToLocalTime(date, actor.timezoneOffset).format(
                'lll',
              ),
              `${Number(invoice.total / 100).toFixed(2)} ${upperCase(
                invoice.currency,
              )}`,
            ];
          }),
        )
        .export(),
    ]);

    const uploadStream = new PassThrough();

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('finish', () => {
      uploadStream.end();
    });
    archive.pipe(uploadStream);
    archive
      .append(membersBuffer, { name: 'members.csv' })
      .append(documentsBuffer, { name: 'documents.csv' })
      .append(invoicesBuffer, { name: 'billings.csv' });

    await archive.finalize();

    // upload file to s3
    const key = `${S3_ORG_DOMAIN_EXPORT_FOLDER}/${
      organization.name
    }_Organization_LuminPDF_${organization._id}_${nanoid(4)}.zip`;
    await this.awsService.putFileToTemporaryBucket(
      key,
      uploadStream,
      `Type=${S3_ORG_DOMAIN_EXPORT_FOLDER}`,
    );
    return this.awsService.getSignedUrlTemporaryFile(key);
  }

  public async getTotalMemberInOrg(orgId: string | Types.ObjectId, options?: { withPendingMembers?: boolean }): Promise<number> {
    const { withPendingMembers = true } = options || {};
    const [members, pendingMembers] = await Promise.all([
      this.getMembersByOrgId(orgId),
      withPendingMembers ? this.getInviteOrgList({
        target: orgId,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
      }) : Promise.resolve<IRequestAccess[]>([]),
    ]);
    return members.length + pendingMembers.length;
  }

  public async getTotalMembersInOrgs(
    orgIds: (string | Types.ObjectId)[],
    options: QueryOptionsInput = {},
  ): Promise<[string | Types.ObjectId, number][]> {
    return Promise.all(orgIds.map(async (orgId) => {
      const [members, pendingMembers] = await Promise.all([
        this.getMembersByOrgId(orgId, options),
        this.getInviteOrgList({
          target: orgId,
          type: AccessTypeOrganization.INVITE_ORGANIZATION,
        }),
      ]);
      const totalMembers = members.length + pendingMembers.length;
      return [orgId, totalMembers];
    }));
  }

  public async updatePaymentWhenInviteMember(
    organization: IOrganization,
    totalInvitedMember: number,
    totalOrgMember: number,
  ): Promise<IOrganization> {
    const {
      quantity: currentOrgQuantity,
      subscriptionRemoteId,
    } = organization.payment;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment: organization.payment });
    const { _id: orgId } = organization;
    const remainingSlots = currentOrgQuantity - totalOrgMember;
    if (totalInvitedMember > remainingSlots) {
      // period = MONTHLY
      const incomingSlots = totalInvitedMember - remainingSlots;
      const currentSubscription = await this.paymentService.getStripeSubscriptionInfo({
        subscriptionId: subscriptionRemoteId,
        options: { stripeAccount: stripeAccountId },
      });
      await this.paymentService.updateStripeSubscription(subscriptionRemoteId, {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            quantity: currentOrgQuantity + incomingSlots,
          },
        ],
        cancel_at_period_end: false,
        proration_behavior: 'none',
      }, { stripeAccount: stripeAccountId });
      return this.updateOrganizationProperty(orgId, {
        'payment.quantity': currentOrgQuantity + incomingSlots,
        'payment.status': PaymentStatusEnums.ACTIVE,
      });
    }
    return organization;
  }

  public async findOrgByCustomerId(customerId: string): Promise<IOrganization> {
    const organization = await this.organizationModel
      .findOne({ 'payment.customerRemoteId': customerId })
      .exec();
    return organization ? { ...organization.toObject(), _id: organization._id.toHexString() } : null;
  }

  async getRecentNewOrgMembers(
    orgId: string,
    limit: number = 5,
  ): Promise<OrganizationMember[]> {
    const orgMembership = await this.getOrgMembershipByConditions({
      conditions: { orgId },
      sortOptions: { createdAt: -1 },
      limit,
    });
    const members = await Promise.all(
      orgMembership.map(async (membership) => {
        const memberInfo = await this.userService.findUserById(
          membership.userId,
        );
        if (!memberInfo) {
          return null;
        }
        return {
          user: memberInfo,
          role: membership.role,
          joinDate: membership.createdAt,
        } as OrganizationMember;
      }),
    );

    return members.filter(Boolean);
  }

  public async getOnePremiumOrgOfUser(userId: string): Promise<IOrganization> {
    const [premiumOrg] = await this.organizationMemberModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $project: { orgId: 1 } },
      {
        $lookup: {
          from: 'organizations',
          let: {
            orgId: '$orgId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$orgId'] }],
                },
              },
            },
          ],
          as: 'organization',
        },
      },
      { $unwind: '$organization' },
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ['$organization.payment.type', PaymentPlanEnums.FREE] },
            ],
          },
        },
      },
      { $replaceRoot: { newRoot: '$organization' } },
      { $limit: 1 },
    ]);
    return premiumOrg;
  }

  public validateTotalMemberJoinOrg(
    totalIncomingMember: number,
    organization: IOrganization,
    totalOrgMember: number,
  ): { isAllow: boolean; message: string } {
    const { payment } = organization;
    const isEnterprisePlan = payment.type === PaymentPlanEnums.ENTERPRISE;
    const isBusinessPlan = payment.type === PaymentPlanEnums.BUSINESS;

    const isUnlimitMemberPayment = this.checkIsUnlimitMemberPayment(payment.type as PaymentPlanEnums);

    const isBusinessQuantityExceeded = isBusinessPlan
      && payment.period === PaymentPeriodEnums.ANNUAL
      && payment.quantity < totalIncomingMember + totalOrgMember;

    const isEnterpriseQuantityExceeded = isEnterprisePlan
      && payment.quantity < totalIncomingMember + totalOrgMember;

    const isMaximumQuantityExceeded = !isEnterprisePlan && !isUnlimitMemberPayment
      && totalOrgMember + totalIncomingMember > MAX_ORGANIZATION_MEMBER;

    if (
      isBusinessQuantityExceeded
      || isEnterpriseQuantityExceeded
      || isMaximumQuantityExceeded
    ) {
      return {
        isAllow: false,
        message: 'Quantity exceeded',
      };
    }
    return {
      isAllow: true,
      message: 'validate success',
    };
  }

  public isBelongToUnallowedList(
    unallowedList: string[],
    userId: string,
  ): boolean {
    return unallowedList.includes(userId);
  }

  public shouldAutoAddMemberToOrg(
    org: IOrganization,
    totalMembers: number,
  ): { shouldAddMember: boolean; isNotifyToManagers: boolean } {
    const { payment, settings } = org;
    const isUnlimitMemberPayment = this.checkIsUnlimitMemberPayment(org.payment.type as PaymentPlanEnums);
    const isExceeded = totalMembers + 1 >= payment.quantity && !isUnlimitMemberPayment;

    const isBusiness = payment.type === PaymentPlanEnums.BUSINESS;
    const isEnterprise = payment.type === PaymentPlanEnums.ENTERPRISE;
    const isAnnualSubscription = payment.period === PaymentPeriodEnums.ANNUAL;

    const isBusinessAnnual = isBusiness && isAnnualSubscription;

    const validated = this.validateTotalMemberJoinOrg(1, org, totalMembers);
    const autoApprove = settings.domainVisibility === DomainVisibilitySetting.VISIBLE_AUTO_APPROVE;
    return {
      shouldAddMember: autoApprove && validated.isAllow,
      isNotifyToManagers: autoApprove && isExceeded && (isBusinessAnnual || isEnterprise),
    };
  }

  public async disabledAutoApprove(
    orgId: string,
    receiverIds: string[],
  ): Promise<IOrganization> {
    const organization = await this.updateOrganizationById(orgId, {
      'settings.domainVisibility': DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
    });
    const notification = notiOrgFactory.create(NotiOrg.DISABLED_AUTO_APPROVE, {
      actor: {
        user: null,
      },
      target: null,
      entity: {
        organization,
      },
    });
    this.notificationService.createUsersNotifications(
      notification,
      receiverIds,
    );

    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.DISABLED_AUTO_APPROVE, {
      organization,
    });
    this.notificationService.publishFirebaseNotifications(receiverIds, firebaseNotificationContent, firebaseNotificationData);

    return organization;
  }

  public async turnOffAutoApprove(
    orgId: string,
    userIds: string[] = [],
  ): Promise<IOrganization> {
    // disable auto approve, show disabled modal OA, send email, notification
    let receiverIds = [...userIds];
    if (!userIds?.length) {
      const orgMembership = await this.findMemberWithRoleInOrg(orgId, [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ], { userId: 1 });
      const ids = orgMembership.filter(Boolean).map(({ userId }) => userId.toHexString());
      receiverIds = [...receiverIds, ...ids];
    }
    receiverIds = uniq(receiverIds).filter(Boolean);
    const organization = await this.disabledAutoApprove(
      orgId,
      receiverIds,
    );
    this.publishUpdateOrganization(
      receiverIds,
      {
        orgId,
        organization,
        type: SUBSCRIPTION_AUTO_APPROVE_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
    const { associateDomains, payment } = organization;
    const isEnterprise = (payment.type as PaymentPlanEnums) === PaymentPlanEnums.ENTERPRISE;
    const emailData = {
      domain: organization.domain,
      orgName: organization.name,
      orgId: organization._id,
      orgAvatar: organization.avatarRemoteId,
      listDomain: associateDomains.join(', '),
      isEnterprise,
    };
    this.userService.findUserByIds(receiverIds).then((users: User[]) => {
      const emails = users.map(({ email }) => email);
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.DISABLED_AUTO_APPROVE_AUTOMATICALLY,
        emails,
        emailData,
      );
    });
    return organization;
  }

  public async updateGoogleSignInSecurity(
    actorId: string,
    orgId: string,
    updateData,
  ): Promise<IOrganization> {
    const updatedOrg = await this.updateOrganizationById(orgId, updateData);
    const orgMembers = await this.getMembersByOrgId(orgId, { userId: 1 });
    const orgMemberIds = orgMembers
      .filter(Boolean)
      .map(({ userId }) => userId.toHexString());
    const receiverIds = orgMemberIds.filter((id) => id !== actorId);

    this.publishUpdateOrganization(
      receiverIds,
      {
        orgId,
        organization: updatedOrg,
        type: SUBSCRIPTION_GOOGLE_SIGN_IN_SECURITY_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
    const req = {
      organization: OrganizationUtils.convertToOrganizationProto(updatedOrg),
      receiverIds,
    };
    this.luminContractService.publishUpdateOrganization(req);
    return updatedOrg;
  }

  public async getOrgMembershipsOfUser(params: {
    userId: string,
    orgIds: string[],
    searchKey: string,
    excludeUserIds: string[]
  }): Promise<User[]> {
    const {
      userId, orgIds = [], searchKey = '', excludeUserIds = [],
    } = params;
    const excludeIdList = [
      ...excludeUserIds.map((id) => new Types.ObjectId(id)),
      new Types.ObjectId(userId),
    ];
    if (!orgIds.length) {
      return [];
    }
    const inOrgIds = orgIds.map((id) => new Types.ObjectId(id));

    const lookupMatchExpression = {
      $expr: {
        $eq: ['$_id', '$$userId'],
      },
    };

    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(lookupMatchExpression, {
        $or: [
          {
            email: { $regex: searchKeyRegex, $options: 'i' },
          },
          {
            name: { $regex: searchKeyRegex, $options: 'i' },
          },
        ],
      });
    }
    const matchConditions = {
      orgId: { $in: inOrgIds },
      userId: { $nin: excludeIdList },
    };
    const aggregatePipeline = [
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: '$userId',
          userId: {
            $first: '$userId',
          },
          orgId: {
            $first: '$orgId',
          },
        },
      },
      {
        $project: {
          userId: 1,
          orgId: 1,
        },
      },
      // Set limit here to temporary fix get contact list performance
      {
        $limit: searchKey.length ? 500 : 5,
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: lookupMatchExpression,
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $replaceRoot: {
          newRoot: '$user',
        },
      },
      {
        $limit: LIMIT_USER_CONTACTS,
      },
    ];
    if (inOrgIds.length === 1) {
      // remove group stage if user only have 1 org
      aggregatePipeline.splice(1, 1);
    }
    return this.aggregateOrganizationMember(aggregatePipeline);
  }

  public async deleteOrganizationResources(
    orgId: string,
    session?: ClientSession,
  ): Promise<any[]> {
    await this.unsetMembersDefaultWorkspace({
      orgId,
      session,
    });
    await this.deleteMembersByOrganization(orgId, session);
    return Promise.all([
      this.removeRequestAccess(
        { target: orgId, type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION] } },
        session,
      ),
      this.deleteGroupPermissionsByCondition({ refId: orgId }, {}, session),
      this.removeInviteAndRequestJoinOrgNotifications(orgId),
      this.deleteOrganizationByConditions({ _id: orgId }, session),
    ]);
  }

  unsetMembersDefaultWorkspace(params: {
    orgId: string,
    session?: ClientSession,
  }): Promise<void> {
    const { orgId, session = null } = params;
    this.loggerService.info({
      context: 'unsetMembersDefaultWorkspace',
      extraInfo: {
        orgId,
      },
    });
    return new Promise((resolve, reject) => {
      this.organizationMemberModel.find({ orgId }).cursor().map((doc) => doc)
        .on('data', async (member) => {
          const user = await this.userService.findUserById(member.userId);
          if (!user) {
            this.loggerService.info({
              context: 'unsetMembersDefaultWorkspace',
              extraInfo: {
                orgId,
                member,
              },
            });
            return;
          }
          const { defaultWorkspace } = user.setting;
          if (!defaultWorkspace) {
            return;
          }
          const isSettingDefault = defaultWorkspace.toHexString() === orgId;
          if (!isSettingDefault) {
            return;
          }
          await this.userService.findOneAndUpdate({ _id: user._id }, { $unset: { 'setting.defaultWorkspace': 1 } }, { session });
        })
        .on('error', (e) => {
          reject(e);
        })
        .on('close', () => {
          this.loggerService.info({
            context: 'unsetMembersDefaultWorkspace:closed',
            extraInfo: {
              orgId,
            },
          });
          resolve();
        });
    });
  }

  public async deleteOrganization(params: {
    orgId: string;
    addToBlacklist?: boolean;
    actionType?: ActionTypeEnum;
  }): Promise<void> {
    const { orgId, actionType } = params;
    const [allMembers, organization] = await Promise.all([
      this.getMembersByOrgId(orgId, { userId: 1, role: 1 }),
      this.getOrgById(orgId),
    ]);
    const removeRelatedRedisKey = () => {
      this.redisService.removeCancelSubscriptionWarning(orgId);
      this.redisService.removeDisableSubscriptionRemainingBanner(orgId);
    };
    if (organization) {
      const {
        avatarRemoteId, payment, sso,
      } = organization;
      let publishMembers: string[] = [];
      if ([ActionTypeEnum.ADMIN_DELETE_USER, ActionTypeEnum.DELETE_DEFAULT_ORG, ActionTypeEnum.DEACTIVE_USER_ACCOUNT].includes(actionType)) {
        publishMembers = allMembers
          .map((member) => member.userId.toHexString())
          .filter((id) => id !== organization.ownerId.toHexString());
      } else {
        publishMembers = allMembers.map((member) => member.userId.toHexString());
      }

      const { subscriptionRemoteId, stripeAccountId } = payment;
      const orgTeams = await this.teamService.find(
        { belongsTo: orgId },
        { _id: 1 },
      );
      const teamIds = orgTeams.map((team) => team._id);

      const context = {
        fn: this.deleteOrganization.name, orgId, teamIds, actionType,
      };
      await this.transaction.withTransaction<{ orgId: string; teamIds: string[]; actionType: ActionTypeEnum }>(
        async (session: ClientSession) => {
          await Promise.all([
            this.deleteAllDocumentsInOrgWorkspace({ orgId, orgTeams }, session),
            this.organizationTeamService.deleteOrgTeamsResource(teamIds, session),
            this.deleteOrganizationResources(orgId, session),
            this.folderService.deleteAllFoldersInOrgWorkspace({ orgId, orgTeams }, session),
            this.luminContractService.deleteDataInWorkspace({
              organization: OrganizationUtils.convertToOrganizationProto(organization),
              userId: organization.ownerId,
              action: 'delete_workspace',
            }),
          ]);
        },
        context,
      );
      this.loggerService.info({
        context: 'Complete transaction when delete organization',
        extraInfo: {
          teamIds,
          organizationId: organization._id,
        },
      });
      if (subscriptionRemoteId) {
        await this.deleteOrgPaymentInStripe(subscriptionRemoteId, stripeAccountId).catch((error) => this.loggerService.error({
          context: 'deleteOrgPaymentInStripe',
          error,
          extraInfo: {
            subscriptionRemoteId,
          },
        }));
      }
      removeRelatedRedisKey();
      orgTeams.forEach((team) => this.teamService.removeAvatarFromS3(team.avatarRemoteId));
      if (actionType === ActionTypeEnum.ADMIN_DELETE_ORG) {
        this.userService.updateUsers(
          {
            _id: {
              $in: publishMembers,
            },
            'metadata.beRemovedFromDeletedOrg': { $ne: true },
          },
          { $set: { 'metadata.beRemovedFromDeletedOrg': true } },
        );
      }
      this.removeAvatarFromS3(avatarRemoteId);
      this.eventService.removeAllEvents(orgId, EventScopes.ORGANIZATION);
      this.notifyDeleteOrganization(organization, actionType === ActionTypeEnum.ADMIN_DELETE_ORG ? allMembers : allMembers.filter(
        (member) => (member.role) as OrganizationRoleEnums !== OrganizationRoleEnums.ORGANIZATION_ADMIN,
      ), actionType ? NotiOrg.LUMIN_ADMIN_DELETE_ORG : NotiOrg.DELETE_ORGANIZATION);
      this.publishDeleteOrganization(publishMembers, {
        orgId,
        organization,
      });
      this.messageGateway.server
        .to(`${SOCKET_NAMESPACE.ORG_ROOM}-${orgId}`)
        .emit(SOCKET_MESSAGE.DELETE_ORGANIZATION);
      this.rabbitMQService.publish(EXCHANGE_KEYS.WORKSPACE, ROUTING_KEY.LUMIN_WEB_DELETE_WORKSPACE, {
        workspaceId: organization._id,
      });

      // [Hubspot] delete HubSpot Workspace record
      this.hubspotWorkspaceService.deleteWorkspace(orgId);

      if (sso) {
        this.kratosService.deleteOryOrganization(sso.ssoOrganizationId);
        Promise.all(allMembers.map(({ userId }) => this.authService.unlinkSamlLoginService({ userId })));
      }
    }
  }

  public async validateUpgradingEnterprise(orgId: string | Types.ObjectId): Promise<boolean> {
    const pendingInvoice = await this.adminService.findUpgradingInvoice(orgId);
    if (pendingInvoice) {
      // Except enterprise plan, If organization has pending invoice, their's plan will be upgrading plan
      const { payment } = await this.getOrgById(orgId);
      throw GraphErrorException.Forbidden(
        'This action cannot be performed while the payment link is pending',
        ErrorCode.Org.UPGRADING_INVOICE,
        {
          plan: pendingInvoice.plan || UpgradeInvoicePlanEnums.ENTERPRISE,
          ...pendingInvoice.plan !== UpgradeInvoicePlanEnums.ENTERPRISE && {
            period: payment.period, docStack: planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getDocStack(payment.quantity),
          },
        },
      );
    }
    return true;
  }

  public async createOrganizationSubcription(params: {
    actor: IUserContext,
    organization: IOrganization,
    incomingPayment: {
      planName: CreateOrganizationSubscriptionPlans,
      period: PaymentPeriod,
      currency: Currency,
      stripeAccountId: string,
    },
    paymentMethod: string,
    couponCode: string,
    blockedPrepaidCardOnTrial: string,
  }): Promise<any> {
    const {
      actor,
      organization,
      incomingPayment,
      paymentMethod,
      couponCode,
      blockedPrepaidCardOnTrial,
    } = params;
    const {
      planName, period, currency, stripeAccountId,
    } = incomingPayment;
    const planRemoteId = this.paymentService.getStripePlanRemoteId({
      plan: planName,
      period,
      currency,
      stripeAccountId,
      discount: false,
    });
    const { customer, subscription } = await this.paymentService.handleCreateStripeSubscription({
      actor,
      organization,
      couponCode,
      paymentMethod,
      nextPayment: {
        type: planName as any,
        period,
        currency,
      },
      stripeAccountId,
      blockedPrepaidCardOnTrial,
    });
    const trialInfo = this.getTrialInfoObject(planName as any as DocStackPlan, organization.payment.trialInfo);
    const inviteUsersSettingValue = this.getDefaultValueInviteUsersSetting(planName as unknown as PaymentPlanEnums);
    const [updatedOrg] = await Promise.all([
      this.updateOrganizationProperty(organization._id, {
        ...(period === PaymentPeriod.MONTHLY && { 'settings.autoUpgrade': true }),
        payment: {
          customerRemoteId: customer.id,
          planRemoteId,
          type: planName,
          period,
          status: PaymentStatusEnums.ACTIVE,
          quantity: 1,
          currency,
          subscriptionRemoteId: subscription.id,
          trialInfo,
          stripeAccountId,
        },
        'settings.inviteUsersSetting': inviteUsersSettingValue,
      }),
      this.cancelUserSubsAfterCharge(actor, organization._id),
      this.organizationDocStackService.resetDocStack({ orgId: organization._id, docStackStartDate: new Date() }),
      this.redisService.removeCancelSubscriptionWarning(organization._id),
      this.redisService.removeStripeRenewAttempt(organization._id),
      this.handleMembersOfFreeCircleChangeSubscription({
        organization,
        actor,
        paymentMethodId: paymentMethod,
      }),
    ]);
    const invoice = await this.paymentService.getInvoice({
      invoiceId: subscription.latest_invoice,
      options: { stripeAccount: stripeAccountId },
    });
    this.sendEmailWelcomeOrganizationPremium(updatedOrg, invoice);
    this.userService.trackPlanAttributes(actor._id);
    return updatedOrg;
  }

  public async createOrganizationUnifySubscription(params: {
    actor: IUserContext,
    organization: IOrganization,
    incomingPayment: {
      currency: Currency;
      period: PaymentPeriod;
      stripeAccountId: string,
      subscriptionItems: {
        productName: UnifySubscriptionProduct;
        paymentType: UnifySubscriptionPlan,
        quantity: number;
      }[],
    },
    paymentMethod: string,
    couponCode: string,
    blockedPrepaidCardOnTrial: string,
  }): Promise<IOrganization> {
    const {
      actor,
      organization,
      incomingPayment,
      paymentMethod,
      couponCode,
      blockedPrepaidCardOnTrial,
    } = params;
    const { stripeAccountId, period } = incomingPayment;
    const { payment } = organization;
    const { trialInfo } = payment;

    const { subscription } = await this.paymentService.handleCreateUnifyStripeSubscription({
      actor,
      organization,
      couponCode,
      paymentMethod,
      incomingPayment,
      blockedPrepaidCardOnTrial,
    });
    const pdfItem = this.paymentUtilsService.getStripePdfSubscriptionItem({ subscriptionItems: subscription.items.data });
    const inviteUsersSettingValue = pdfItem
      ? this.getDefaultValueInviteUsersSetting(period as unknown as PaymentPlanEnums)
      : undefined;
    const [updatedOrg] = await Promise.all([
      this.updateOrganizationProperty(organization._id, {
        ...(pdfItem && period === PaymentPeriod.MONTHLY && { 'settings.autoUpgrade': true }),
        payment: this.paymentService.getIncomingPaymentObject({
          currentPayment: organization.payment,
          trialInfo: pdfItem ? this.getTrialInfoObject(pdfItem.metadata.paymentType as UnifySubscriptionPlan, trialInfo) : trialInfo,
          incomingPayment: { ...incomingPayment, status: PaymentStatusEnums.ACTIVE },
          subscription,
        }),
        'settings.inviteUsersSetting': inviteUsersSettingValue,
      }),
      this.cancelUserSubsAfterCharge(actor, organization._id),
      this.organizationDocStackService.resetDocStack({ orgId: organization._id, docStackStartDate: new Date() }),
      this.redisService.removeCancelSubscriptionWarning(organization._id),
      this.redisService.removeStripeRenewAttempt(organization._id),
      this.handleMembersOfFreeCircleChangeSubscription({
        organization,
        actor,
        paymentMethodId: paymentMethod,
      }),
    ]);

    const invoice = await this.paymentService.getInvoice({
      invoiceId: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice.id,
      options: { stripeAccount: stripeAccountId },
    });
    this.sendEmailWelcomeOrganizationPremium(updatedOrg, invoice);
    this.userService.trackPlanAttributes(actor._id);

    return updatedOrg;
  }

  public async sendEmailWelcomeOrganizationPremium(organization: IOrganization, invoice: Stripe.Invoice) {
    const payment = await this.paymentService.getNewPaymentObject(organization.payment);
    const { period, subscriptionItems = [] } = payment;
    const receiverEmail = (await this.getOrganizationMemberByRole(
      organization._id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    const attachments = await this.paymentService.getInvoiceEmailAttachment({ invoice });
    if (subscriptionItems.length > 1) {
      const pdfItem = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.PDF)[0];
      const signItem = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN)[0];
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS,
        receiverEmail,
        {
          subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS.description].replace('#{orgName}', organization.name),
          orgName: organization.name,
          domain: organization.url,
          orgId: organization._id,
          pdfPlan: PLAN_TEXT[pdfItem.paymentType],
          signPlan: SIGN_PLAN_TEXT[signItem.paymentType],
        },
        attachments,
      );
      return;
    }
    const item = subscriptionItems[0];
    if (item.paymentType === UnifySubscriptionPlan.ORG_SIGN_PRO) {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO,
        receiverEmail,
        {
          subject: SUBJECT[EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO.description].replace('#{orgName}', organization.name),
          orgName: organization.name,
          domain: organization.url,
          orgId: organization._id,
          numberSeat: item.quantity,
        },
        attachments,
      );
      return;
    }
    const docStack = planPoliciesHandler
      .from({ plan: item.paymentType, period })
      .getDocStack(item.quantity).toString();
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING,
      receiverEmail,
      {
        subject: SUBJECT[EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING.description].replace('#{orgName}', organization.name)
          .replace('#{plan}', PLAN_TEXT[item.paymentType] as string).replace('#{docStack}', docStack),
        orgName: organization.name,
        domain: organization.url,
        orgId: organization._id,
        plan: PLAN_TEXT[item.paymentType],
        docStack,
      },
      attachments,
    );
  }

  public trackEventStartFreeTrial(organization: IOrganization) {
    const { payment } = organization;
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.ORG_PLAN_UPGRADED,
      eventScope: EventScopes.ORGANIZATION,
      organization,
      orgModification: {
        plan: `${this.paymentService.getPlanText(payment.type as PaymentPlanEnums, true)} ${payment.period}`,
        planCharge: 0,
        currency: payment.currency as PaymentCurrencyEnums,
        docStack: planPoliciesHandler.from({ plan: payment.type, period: payment.period })
          .getDocStack(payment.quantity) as unknown as number,
      },
    });
  }

  public sendEmailWelcomeOrganizationFreeTrial(receiversEmail: string[], trialPlan: CreateOrganizationSubscriptionPlans | UnifySubscriptionPlan) {
    const subject = SUBJECT[EMAIL_TYPE.SUBSCRIBE_FREE_TRIAL.description]
      .replace('#{plan}', PLAN_TEXT[trialPlan]);
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.SUBSCRIBE_FREE_TRIAL,
      receiversEmail,
      { freeTrialDays: FREE_TRIAL_DAYS, plan: PLAN_TEXT[trialPlan], subject },
    );
  }

  public shouldUpdateTrialInfo(trialInfo: ITrialInfo, upcomingPlan: DocStackPlan | UnifySubscriptionPlan): boolean {
    if (!trialInfo) {
      return true;
    }
    const { highestTrial } = trialInfo;
    return ORG_PLAN_INDEX[upcomingPlan] > ORG_PLAN_INDEX[highestTrial];
  }

  public getTrialInfoObject(upcomingPlan: DocStackPlan | UnifySubscriptionPlan, currentTrialInfo: ITrialInfo = null): ITrialInfo {
    const shouldUpdateTrialInfo = this.shouldUpdateTrialInfo(currentTrialInfo, upcomingPlan);
    if (!currentTrialInfo?.highestTrial) {
      return {
        highestTrial: upcomingPlan as any,
      };
    }
    return {
      endTrial: currentTrialInfo.endTrial,
      highestTrial: shouldUpdateTrialInfo ? upcomingPlan as any : currentTrialInfo.highestTrial,
    };
  }

  public async upgradeDocStackPlanSubscription(params: {
    userId: string,
    organization: IOrganization,
    input: UpgradeOrganizationSubscriptionInput,
  }): Promise<any> {
    const { userId, organization, input } = params;
    const { payment } = organization;
    const {
      currency, quantity, status, period, type, stripeAccountId,
    } = payment;
    const {
      sourceId, couponCode: _couponCode, isBlockedPrepaidCardOnTrial, ...newPayment
    } = input;
    const { plan: incomingPlan, period: incomingPeriod, quantity: inputQuantity } = newPayment;
    await this.validateUpgradingEnterprise(organization._id);
    const subscriptionRemoteId = get(organization, 'payment.subscriptionRemoteId');
    this.redisService.setSubscriptionActor(subscriptionRemoteId, userId);

    try {
      if (sourceId) {
        if (SOURCE_TOKEN_REGEX_MATCHING.test(sourceId)) {
          // Some user was served old bundle still use source token to upgrade subscription
          await this.paymentService.attachSourceToCustomer(
            payment.customerRemoteId,
            { source: sourceId },
            { stripeAccount: stripeAccountId },
          );
          await this.paymentService.updateStripeCustomer(payment.customerRemoteId, {
            default_source: sourceId,
            invoice_settings: {
              default_payment_method: null,
            },
          }, { stripeAccount: payment.stripeAccountId });
        } else {
          await this.paymentService.attachPaymentMethod(payment.customerRemoteId, sourceId, stripeAccountId);
          // update metadata blockedPrepaidCardOnTrial for AB test prepaid card
          if (isBlockedPrepaidCardOnTrial) {
            await this.paymentService.updateStripeCustomer(payment.customerRemoteId, {
              metadata: { blockedPrepaidCardOnTrial: 'true' },
            }, { stripeAccount: stripeAccountId });
          }
        }
      }
    } catch (error) {
      throw GraphErrorException.BadRequest(error.message);
    }

    const actorInfo = await this.userService.findUserById(userId);
    const isRefundToCustomerBalance = [PaymentPlanEnums.PROFESSIONAL, PaymentPlanEnums.PERSONAL].includes(actorInfo.payment.type as PaymentPlanEnums);
    if (isRefundToCustomerBalance) {
      await this.paymentService.createCustomerBalance({
        customerRemoteId: actorInfo.payment.customerRemoteId,
        subscriptionRemoteId: actorInfo.payment.subscriptionRemoteId,
        currency: currency as Currency,
        stripeAccountId,
      })
        .catch((error) => { throw GraphErrorException.BadRequest(error.message); });
    }
    const subscriptionParamsBuilder = new UpdateSubscriptionParamsBuilder(this.paymentService)
      .from(payment)
      .addOrgId(organization._id)
      .to({ type: incomingPlan, period: incomingPeriod, currency });
    const isAllowUpgrade = subscriptionParamsBuilder.isAllowUpgrade();
    const isUpgradeFromTrial = subscriptionParamsBuilder.isUpgradeFromTrial();
    if (!isAllowUpgrade && !isUpgradeFromTrial) {
      throw GraphErrorException.BadRequest('Cannot upgrade subscription');
    }
    const upcomingPlanRemoteId = subscriptionParamsBuilder.getUpcomingPlanRemoteId();
    const upcomingQuantity = await subscriptionParamsBuilder.getUpcomingQuantity();
    const isUpgradeDocStack = subscriptionParamsBuilder.isUpgradeDocStack();

    if (quantity === inputQuantity && isUpgradeDocStack) {
      throw GraphErrorException.BadRequest('This org has already charged', ErrorCode.Org.ORG_ALREADY_CHARGED);
    }
    if (upcomingQuantity !== inputQuantity) {
      throw GraphErrorException.BadRequest('Invalid quantity');
    }
    const subscriptionParams = (await subscriptionParamsBuilder
      .addCoupon(_couponCode)
      .calculate())
      .getUpgradeSubscriptionParams();
    const response = await this.paymentService.updateStripeSubscription(
      subscriptionParams.subscriptionRemoteId,
      subscriptionParams.properties,
      { stripeAccount: stripeAccountId },
    )
      .catch((error) => {
        throw GraphErrorException.BadRequest(error.message);
      });
    const trialInfo = this.getTrialInfoObject(incomingPlan as any as DocStackPlan, payment.trialInfo);
    const updatePayment = {
      customerRemoteId: payment.customerRemoteId,
      subscriptionRemoteId: response?.id,
      planRemoteId: upcomingPlanRemoteId,
      type: incomingPlan,
      period: incomingPeriod,
      quantity: upcomingQuantity,
      status: PaymentStatusEnums.ACTIVE,
      currency,
      trialInfo,
      stripeAccountId,
    };

    // turn off auto approve when upgrade org
    const enableAutoUpgrade = (status === PaymentStatusEnums.TRIALING
      || [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(type as PaymentPlanEnums))
      && incomingPeriod === PaymentPeriod.MONTHLY;
    const disableAutoUpgrade = period === PaymentPeriod.MONTHLY && incomingPeriod === PaymentPeriod.ANNUAL;

    const inviteUsersSettingValue = this.getDefaultValueInviteUsersSetting(type as PaymentPlanEnums);

    const updatedOrganization = await this.updateOrganizationProperty(
      organization._id,
      {
        ...(enableAutoUpgrade && { 'settings.autoUpgrade': true }),
        ...(disableAutoUpgrade && { 'settings.autoUpgrade': false }),
        'settings.inviteUsersSetting': inviteUsersSettingValue,
        payment: updatePayment,
      },
    );
    if (!subscriptionParamsBuilder.isUpgradeDocStack()) {
      this.organizationDocStackService.resetDocStack({ orgId: organization._id, docStackStartDate: new Date() });
    }
    await Promise.all([
      this.cancelUserSubsAfterCharge(actorInfo, organization._id),
      this.redisService.removeStripeRenewAttempt(organization._id),
      this.redisService.removeCancelSubscriptionWarning(organization._id),
      this.updateSettingForCanceledBusinessPlan({
        paymentType: type as PaymentPlanEnums,
        paymentStatus: status as PaymentStatusEnums,
        organization,
      }),
    ]);
    this.userService.trackPlanAttributes(userId);
    this.sendUpgradeEmail({
      toPeriod: incomingPeriod,
      fromPeriod: period as PaymentPeriod,
      organization,
      newPayment: updatePayment,
      oldPayment: payment,
      invoice: response.latest_invoice as Record<string, any>,
    });

    return {
      message: 'Upgrade Plan Success!',
      statusCode: 200,
      data: updatedOrganization.payment,
      organization: updatedOrganization,
    };
  }

  async upgradeUnifySubscription(params: {
    actor: IUserContext;
    organization: IOrganization,
    paymentMethod: string,
    blockedPrepaidCardOnTrial: string,
    upgradedWithSensitiveCoupon: string,
    incomingPayment: {
      discountCode: string,
      currency: Currency;
      period: PaymentPeriod;
      stripeAccountId: string,
      subscriptionItems: {
        productName: UnifySubscriptionProduct;
        paymentType: UnifySubscriptionPlan,
        quantity: number;
      }[],
    },
  }): Promise<IOrganization> {
    const {
      actor, organization, incomingPayment, paymentMethod, blockedPrepaidCardOnTrial, upgradedWithSensitiveCoupon,
    } = params;
    const { payment } = organization;
    const currentPayment = await this.paymentService.getNewPaymentObject(payment);
    const {
      period, subscriptionItems: currentSubscriptionItems, trialInfo, customerRemoteId,
    } = currentPayment;
    const subscriptionRemoteId = get(organization, 'payment.subscriptionRemoteId');
    this.redisService.setSubscriptionActor(subscriptionRemoteId, actor._id);
    const {
      subscriptionItems: incomingSubscriptionItems,
      currency: incomingCurrency,
      stripeAccountId,
      discountCode,
      period: incomingPeriod,
    } = incomingPayment;

    if (paymentMethod && customerRemoteId) {
      await this.paymentService.upsertStripeCustomer({
        organization,
        actor,
        paymentMethod,
        stripeAccountId,
        blockedPrepaidCardOnTrial,
        upgradedWithSensitiveCoupon,
      });
    }

    const isRefundToCustomerBalance = [PaymentPlanEnums.PROFESSIONAL, PaymentPlanEnums.PERSONAL].includes(actor.payment.type as PaymentPlanEnums);
    if (this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: incomingSubscriptionItems }) && isRefundToCustomerBalance) {
      await this.paymentService.createCustomerBalance({
        customerRemoteId,
        subscriptionRemoteId: actor.payment.subscriptionRemoteId,
        currency: incomingCurrency,
        stripeAccountId,
      });
    }

    const subscriptionParamsBuilder = new UpdateUnifySubscriptionParamsBuilder(this.paymentService, this.paymentUtilsService)
      .from(currentPayment)
      .addOrgId(organization._id)
      .addDiscount(discountCode)
      .to(incomingPayment);

    const isAllowUpgrade = subscriptionParamsBuilder.isAllowUpgrade();
    const isUpgradeFromTrial = subscriptionParamsBuilder.isUpgradeFromTrial();
    if (!isAllowUpgrade && !isUpgradeFromTrial) {
      throw GraphErrorException.BadRequest('Cannot upgrade subscription');
    }

    await this.paymentService.retryFailedInvoices({ orgId: organization._id, payment });

    const subscriptionParams = (await subscriptionParamsBuilder
      .calculate())
      .getUpgradeSubscriptionParams();

    let subscription = await this.paymentService.updateStripeSubscription(
      subscriptionParams.subscriptionRemoteId,
      subscriptionParams.properties,
      { stripeAccount: stripeAccountId },
    );

    // Items cannot be deleted in the previous update request to prevent proration charges on set-to-cancel items
    if (subscriptionParamsBuilder.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED])) {
      const canceledItem = currentSubscriptionItems.find((item) => item.paymentStatus === PaymentStatusEnums.CANCELED);
      subscription = await this.paymentService.updateStripeSubscription(
        subscriptionParams.subscriptionRemoteId,
        {
          proration_behavior: 'none',
          items: [{ id: canceledItem.id, deleted: true }],
        },
        { stripeAccount: stripeAccountId },
      );
    }

    const currentPdfItem = this.paymentUtilsService.filterSubItemByProduct(currentSubscriptionItems, PaymentProductEnums.PDF)[0];
    const incomingPdfItem = this.paymentUtilsService.filterSubItemByProduct(incomingSubscriptionItems, PaymentProductEnums.PDF)[0];
    const updatePayment = this.paymentService.getIncomingPaymentObject({
      currentPayment,
      incomingPayment: { ...incomingPayment, status: PaymentStatusEnums.ACTIVE },
      subscription,
      trialInfo: incomingPdfItem ? this.getTrialInfoObject(incomingPdfItem.paymentType, trialInfo) : trialInfo,
    });
    const promotion = OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL;
    const updatedOrganization = await this.updateOrganizationProperty(
      organization._id,
      {
        ...this.getUpgradePdfSubscriptionUpdateObject({ currentPdfItem, incomingPayment }),
        payment: updatePayment,
        ...(this.isTimeSensitiveCouponSubscription(subscription, stripeAccountId)
          ? { $addToSet: { 'metadata.promotions': promotion } }
          : { $pull: { 'metadata.promotions': promotion } }
        ),
      },
    );

    if (!subscriptionParamsBuilder.isKeepBillingCycle()) {
      this.organizationDocStackService.resetDocStack({ orgId: organization._id, docStackStartDate: new Date() });
    }

    const hasSignSub = this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: updatePayment.subscriptionItems });
    const isRemovedSignSub = !hasSignSub
      && currentSubscriptionItems.find((item) => item.productName === PaymentProductEnums.SIGN && item.paymentStatus === PaymentStatusEnums.CANCELED);
    if (isRemovedSignSub) {
      await this.updateOrganizationProperty(organization._id, { premiumSeats: [] });
      const assignedSeatUserIds = organization.premiumSeats.map((seat) => seat.toString());
      this.publishUpdateSignWorkspacePayment({
        organization: updatedOrganization,
        userIds: assignedSeatUserIds,
        action: UpdateSignWsPaymentActions.CANCELED_SUBSCRIPTION,
      });
    }
    await Promise.all([
      this.cancelUserSubsAfterCharge(actor, organization._id),
      this.redisService.removeStripeRenewAttempt(organization._id),
      this.redisService.removeCancelSubscriptionWarning(organization._id),
      await this.redisService.deleteTimeSensitiveCoupon(organization._id),
      this.updateSettingForCanceledBusinessPlan({
        paymentType: currentPdfItem?.paymentType as PaymentPlanEnums,
        paymentStatus: currentPdfItem?.paymentStatus as PaymentStatusEnums,
        organization,
      }),
    ]);
    this.userService.trackPlanAttributes(actor._id);
    this.sendUpgradeEmail({
      toPeriod: incomingPeriod,
      fromPeriod: period as PaymentPeriod,
      organization,
      newPayment: updatePayment,
      oldPayment: currentPayment,
      invoice: subscription.latest_invoice as Record<string, any>,
      isUpgradeMultiProducts: incomingSubscriptionItems.length > 1,
      isUpgradeSignProduct: this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: incomingSubscriptionItems }),
    });

    return updatedOrganization;
  }

  getUpgradePdfSubscriptionUpdateObject({ currentPdfItem, incomingPayment }: {
    currentPdfItem: SubScriptionItemSchemaInterface;
    incomingPayment: {
      period: PaymentPeriod;
    },
  }): Record<string, any> {
    const { period: incomingPeriod } = incomingPayment;
    if (!currentPdfItem) {
      return {
        ...(incomingPeriod === PaymentPeriod.MONTHLY && { 'settings.autoUpgrade': true }),
      };
    }

    const enableAutoUpgrade = (currentPdfItem.paymentStatus === PaymentStatusEnums.TRIALING
      || [PaymentPlanEnums.ENTERPRISE].includes(currentPdfItem.paymentType as PaymentPlanEnums))
      && incomingPeriod === PaymentPeriod.MONTHLY;
    const disableAutoUpgrade = currentPdfItem.period === PaymentPeriod.MONTHLY && incomingPeriod === PaymentPeriod.ANNUAL;

    const inviteUsersSettingValue = this.getDefaultValueInviteUsersSetting(currentPdfItem.paymentType as PaymentPlanEnums);

    return {
      ...(enableAutoUpgrade && { 'settings.autoUpgrade': true }),
      ...(disableAutoUpgrade && { 'settings.autoUpgrade': false }),
      'settings.inviteUsersSetting': inviteUsersSettingValue,
    };
  }

  private isTimeSensitiveCouponSubscription(
    subscription: Stripe.Subscription,
    stripeAccountId: string,
  ): boolean {
    const discount = subscription?.discount;
    const coupon = discount?.coupon;
    const couponId = typeof coupon === 'string' ? coupon : coupon?.id;

    return !!(couponId && this.paymentService.isTimeSensitiveCoupon(couponId, stripeAccountId));
  }

  async sendUpgradeEmail({
    organization,
    newPayment,
    oldPayment,
    invoice,
    isUpgradeMultiProducts = false,
    isUpgradeSignProduct = false,
  }: {
    toPeriod: PaymentPeriod,
    fromPeriod: PaymentPeriod,
    organization: IOrganization,
    newPayment: Pick<PaymentSchemaInterface, 'type' | 'quantity' | 'period' | 'subscriptionRemoteId' | 'stripeAccountId' | 'subscriptionItems'>,
    oldPayment: Partial<PaymentSchemaInterface>,
    invoice: Record<string, any>,
    isUpgradeMultiProducts?: boolean;
    isUpgradeSignProduct?: boolean;
  }): Promise<void> {
    const managers = (await this.getOrganizationMemberByRole(
      organization._id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    this.paymentService.sendEmailUpradeOrg({
      isSubscriptionActived: true,
      isUpgradeMultiProducts,
      organization,
      oldPayment,
      newPayment,
      receiverEmail: managers,
      invoice,
      isUpgradeSignProduct,
    });
  }

  public async reactivePaymentOrganization(
    payment: PaymentSchemaInterface,
    callback: () => void | Promise<void>,
  ): Promise<unknown> {
    const { subscriptionRemoteId } = payment;
    const currentSubscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      options: {
        stripeAccount: this.paymentService.getStripeAccountId({ payment }),
      },
    });
    if (!currentSubscription.cancel_at_period_end) {
      throw GraphErrorException.BadRequest('Cannot reactivate subscription ');
    }
    await this.paymentService.updateStripeSubscription(subscriptionRemoteId, {
      cancel_at_period_end: false,
    }, { stripeAccount: this.paymentService.getStripeAccountId({ payment }) });
    await callback();
    return currentSubscription;
  }

  public async reactivatePaymentOrganization({ organization, incomingPayment }: {
    organization: IOrganization;
    incomingPayment: {
      status: PaymentStatusEnums;
      currency: Currency;
      period: PaymentPeriod;
      subscriptionItems: SubScriptionItemSchemaInterface[];
    },
  }) {
    const { payment: currentPayment } = organization;
    const subscriptionParamsBuilder = new UpdateUnifySubscriptionParamsBuilder(this.paymentService, this.paymentUtilsService)
      .from(currentPayment)
      .addOrgId(organization._id)
      .to(incomingPayment);
    const params = await subscriptionParamsBuilder.calculateReactivate();
    const subscription: Stripe.Subscription = await this.paymentService.updateStripeSubscription(
      currentPayment.subscriptionRemoteId,
      params,
      { stripeAccount: this.paymentService.getStripeAccountId({ payment: currentPayment }) },
    );
    return subscription;
  }

  private uploadOrganizationAvatar(organizationAvatar: {
    fileBuffer: Buffer;
    mimetype: string;
  }): Promise<string> {
    const { fileBuffer, mimetype } = organizationAvatar || {};
    if (!fileBuffer || !mimetype) {
      return null;
    }

    return this.awsService.uploadOrganizationAvatar(fileBuffer, mimetype);
  }

  public createCustomOrgDomain(): string {
    const nanoId = customAlphabet(
      CommonConstants.ALPHABET_CHARACTERS,
      MANUAL_ORG_URL_LENGTH,
    );
    return nanoId();
  }

  public async handleCreateCustomOrganization(params: {
    creator: User,
    orgName: string,
    organizationAvatar?: { fileBuffer: Buffer; mimetype: string },
    isMigratedFromTeam?: boolean,
    settings?: Partial<IOrganizationSettings>,
    purpose?: OrganizationPurpose,
  }, options: CreateOrgOptions = {}): Promise<IOrganization> {
    const {
      creator,
      orgName,
      organizationAvatar,
      isMigratedFromTeam = false,
      settings,
      purpose,
    } = params;
    const { email } = creator;

    // Log to investigate auto org creation
    const stackTrace = new Error().stack;
    this.loggerService.info({
      context: 'handleCreateCustomOrganization:investigate',
      extraInfo: {
        userId: creator._id,
        email: creator.email,
        orgName,
        paymentType: creator.payment?.type,
        isMigratedFromTeam,
        settings,
        purpose,
        options,
        stackTrace,
      },
    });
    const avatarRemoteId = await this.uploadOrganizationAvatar(
      organizationAvatar,
    );
    const orgUrl = this.createCustomOrgDomain();
    const isPopularDomain = Utils.verifyDomain(email);
    const domain: string = Utils.getEmailDomain(email);
    const { domainVisibility } = settings || {};
    if (isPopularDomain && domainVisibility && domainVisibility !== DomainVisibilitySetting.INVITE_ONLY) {
      throw GraphErrorException.BadRequest(
        'This visibility can only be enabled when Circle Admin’s domain is unpopular.',
      );
    }
    const visibilitySetting = isPopularDomain ? DomainVisibilitySetting.INVITE_ONLY
      : (settings?.domainVisibility || DomainVisibilitySetting.VISIBLE_AUTO_APPROVE);
    const organization = await this.createOrganization({
      creator,
      orgUrl,
      domain: orgUrl,
      orgName,
      avatarRemoteId,
      isMigratedFromTeam,
      settings: {
        domainVisibility: visibilitySetting,
        inviteUsersSetting: settings?.inviteUsersSetting || InviteUsersSetting.ANYONE_CAN_INVITE,
      },
      associateDomains: isPopularDomain ? [] : [domain],
      ...(purpose && { purpose }),
    }, options);
    await this.userService.editUserPurpose({
      user: creator,
      purpose: PURPOSE.SMALL_BUSINESS,
      currentStep: PURPOSE_STEP.START_FREE_TRIAL,
    }, { disableHubspot: options.disableHubspot });
    return organization;
  }

  private async createOrganization({
    creator,
    orgUrl,
    domain,
    orgName,
    avatarRemoteId,
    settings = {},
    isMigratedFromTeam = false,
    associateDomains,
    purpose,
  }: {
    creator: User;
    orgUrl: string;
    domain: string;
    orgName: string;
    avatarRemoteId: string;
    isMigratedFromTeam: boolean;
    settings?: Partial<IOrganizationSettings>;
    associateDomains?: string[];
    purpose?: OrganizationPurpose;
  }, options: CreateOrgOptions = {}) {
    const orgData = {
      ownerId: creator._id,
      billingEmail: creator.email,
      url: orgUrl,
      domain,
      name: orgName,
      avatarRemoteId,
      isMigratedFromTeam,
      settings,
      associateDomains,
      ...(purpose && { purpose }),
    } as IOrganization;
    const ops: CreateOrgOptions = merge({}, { disableEmail: true, disableHubspot: false }, options);
    const createdOrganization = await this.organizationModel.create(orgData);
    const organization = { ...createdOrganization.toObject(), _id: createdOrganization._id.toHexString() };
    const orgAdmin = {
      userId: creator._id,
      email: creator.email,
      orgId: organization._id,
      internal: true,
      role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
    };
    await this.createDefaultPermission(organization._id, Resource.ORGANIZATION);
    await this.handleAddMemberToOrg(orgAdmin, {
      disableHubspot: ops.disableHubspot,
      skipHubspotWorkspaceAssociation: true,
      skipWorkspaceSizeChangedEvent: true,
    });

    if (!ops.disableEmail) {
      const emailData = {
        creatorName: creator.name,
        orgName: organization.name,
        orgId: organization._id,
        subject: `${organization.name} ${ORGANIZATION_TEXT} has been created`,
        documentDeeplink:
          this.emailService.generateDeeplinkForEmail(
            EMAIL_MOBILE_PATH.EMAIL_ORGANIZATION_CREATED,
            `/redirection?url=/${ORG_URL_SEGEMENT}/${organization._id}/documents/${ORG_URL_SEGEMENT}`,
          ),
      };
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CREATE_ORGANIZATION,
        [creator.email],
        emailData,
      );
    }

    return organization;
  }

  public async handleUserCreateOrganization(
    payload: ICreateOrganization,
  ): Promise<{ organization: IOrganization; fullyAddedMembers: boolean, invitations: OrganizationMemberInvitation[] }> {
    const { input, creator } = payload;
    const { members } = input;

    const { organization } = await this.handleCreateOrganization(payload);

    const filteredMembers = uniqBy(members, 'email').filter(
      ({ email }) => email !== creator.email,
    );
    await this.userService.checkEmailInput(
      filteredMembers.map((member) => member.email),
    );
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.ORGANIZATION_CREATED,
      eventScope: EventScopes.ORGANIZATION,
      actor: creator,
      organization,
    });

    if (!filteredMembers.length) {
      // [Hubspot] create HubSpot Workspace record and associate with owner
      this.hubspotWorkspaceService.createWorkspace({
        orgId: organization._id,
        name: organization.name,
        associations: [{
          contactEmail: creator.email,
          orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        }],
      });

      return {
        organization,
        fullyAddedMembers: true,
        invitations: [],
      };
    }

    const { invitedEmails, invitations, addedMembers } = await this.inviteMemberToOrgWithDomainLogic({
      actor: creator,
      organization,
      validMembers: filteredMembers,
      options: { isCreatingOrgFlow: true },
    });

    // [Hubspot] create HubSpot Workspace record and associate with members
    const hubspotAssociations = addedMembers.map(({ email, role }) => ({
      contactEmail: email,
      orgRole: role.toLowerCase() as unknown as OrganizationRoleEnums,
    })).concat([{
      contactEmail: creator.email,
      orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
    }]);
    this.hubspotWorkspaceService.createWorkspace({
      orgId: organization._id,
      name: organization.name,
      associations: hubspotAssociations,
    });

    const fullyAddedMembers = filteredMembers.length === invitedEmails.length;

    return {
      organization,
      fullyAddedMembers,
      invitations,
    };
  }

  public async handleCreateOrganization(
    payload: ICreateOrganization,
  ): Promise<{ organization: IOrganization }> {
    const {
      input, organizationAvatar, creator, disableEmail,
    } = payload;
    const { name: orgName, settings, purpose } = input;
    return {
      organization: await this.handleCreateCustomOrganization({
        creator, orgName, organizationAvatar, settings, purpose,
      }, { disableEmail }),
    };
  }

  public async handleAdminCreateOrganization(
    params: { input: CreateOrgByAdminInput, organizationAvatar: AvatarFile, creator: User },
  ): Promise<IOrganization> {
    const { input, organizationAvatar, creator } = params;
    const {
      name: orgName, purpose, settings,
    } = input;
    return this.handleCreateCustomOrganization({
      creator,
      orgName,
      organizationAvatar,
      settings,
      purpose,
    }, { disableEmail: false });
  }

  public async checkMainOrgCreationAbility(email: string): Promise<CheckMainOrgCreationAbilityPayload> {
    const domain: string = Utils.getEmailDomain(email);
    const isPopularDomain = Utils.verifyDomain(email);
    const [isInBlacklist, existedOrganization] = await Promise.all([
      this.blacklistService.findOne(
        BlacklistActionEnum.CREATE_MAIN_ORGANIZATION,
        domain,
      ),
      this.findOneOrganization({ domain }),
    ]);

    switch (true) {
      case isPopularDomain:
        return {
          canCreate: false,
          domainType: OrganizationDomainType.POPULAR_DOMAIN,
        };
      case Boolean(isInBlacklist):
        return {
          canCreate: false,
          domainType: OrganizationDomainType.BLACKLIST_DOMAIN,
        };
      case Boolean(existedOrganization):
        return {
          canCreate: false,
          domainType: OrganizationDomainType.EXISTED_DOMAIN,
        };
      default: break;
    }
    return {
      canCreate: true,
    };
  }

  async isOrganizationUpgradeEnterprise(orgId: string): Promise<IEnterpriseInvoice> {
    const organizationUpgradeEnterprise = await this.enterpriseUpgradeModel
      .findOne({
        orgId,
        status: UpgradeEnterpriseStatus.PENDING,
      }).exec();
    return organizationUpgradeEnterprise
      ? { ...organizationUpgradeEnterprise.toObject(), _id: organizationUpgradeEnterprise._id.toHexString() } : null;
  }

  async getEnterpriseUpgrades(orgIds: string[]): Promise<IEnterpriseInvoice[]> {
    const enterpriseUpgrades = await this.enterpriseUpgradeModel.find({ orgId: { $in: orgIds } }).exec();
    return enterpriseUpgrades.map((enterprise) => ({ ...enterprise.toObject(), _id: enterprise._id.toHexString() }));
  }

  async getTopMembersForOrgAdminTransfer({
    organization,
    conditions,
    limit,
  }: {
    organization: IOrganization;
    conditions: TransferOrgAdminStrategy[];
    limit?: number;
  }): Promise<(Partial<IOrganizationMember> & { userData: User })[]> {
    const { _id: orgId, domain } = organization;
    const aggregatePipeline = [];
    let projection: Record<string, any>;
    const sortCondition: any = {};

    const lookupExpression = {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    };
    aggregatePipeline.push(
      {
        $match: {
          $and: [
            { orgId: new Types.ObjectId(orgId) },
            { role: { $ne: OrganizationRoleEnums.ORGANIZATION_ADMIN } },
          ],
        },
      },
      {
        $lookup: lookupExpression,
      },
      {
        $unwind: '$user',
      },
    );
    projection = { user: 1 };

    conditions.forEach((strategy) => {
      switch (strategy) {
        case TransferOrgAdminStrategy.BILLING_MODERATOR_PRIORITY: {
          projection = {
            ...projection,
            userId: 1,
            role: 1,
          };
          sortCondition.role = -1;
          break;
        }

        case TransferOrgAdminStrategy.SAME_EMAIL_DOMAIN: {
          const emailValueCondition = {
            if: {
              $eq: ['$emailDomain', domain],
            },
            then: 1,
            else: 0,
          };
          projection = {
            ...projection,
            emailDomain: {
              $arrayElemAt: [{ $split: ['$user.email', '@'] }, 1],
            },
            emailValue: {
              $cond: emailValueCondition,
            },
          };
          sortCondition.emailValue = -1;
          break;
        }

        case TransferOrgAdminStrategy.LATEST_ACTIVE:
          sortCondition['user.lastAccess'] = -1;
          break;

        default:
          break;
      }
    });

    if (!isEmpty(projection)) {
      aggregatePipeline.push({ $project: projection });
    }
    aggregatePipeline.push({ $sort: sortCondition });
    if (limit) {
      aggregatePipeline.push({ $limit: limit });
    }
    const members = await this.organizationMemberModel.aggregate(
      aggregatePipeline,
    );
    return members.map((member) => {
      const { userId, role, user } = member;
      return {
        orgId,
        userId,
        role,
        userData: user,
      };
    });
  }

  async transferAdminToActiveMember(
    organization: IOrganization,
  ): Promise<boolean> {
    const {
      _id: orgId,
      ownerId: oldOwnerId,
    } = organization;
    let targetUser: User;
    let targetCurrentRole;
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;

    const [transferredEmail, oldOwner] = await Promise.all([
      this.redisService.getRedisValueWithKey(transferKey),
      this.userService.findUserById(oldOwnerId),
    ]);
    const conditions: TransferOrgAdminStrategy[] = [
      TransferOrgAdminStrategy.BILLING_MODERATOR_PRIORITY,
      TransferOrgAdminStrategy.LATEST_ACTIVE,
    ];
    if (transferredEmail) {
      targetUser = await this.userService.findUserByEmail(transferredEmail);
      const { role } = await this.getMembershipByOrgAndUser(
        orgId,
        targetUser._id,
      );
      targetCurrentRole = role;
      this.redisService.deleteRedisByKey(transferKey);
    } else {
      const [targetMember] = await this.getTopMembersForOrgAdminTransfer({
        organization,
        conditions,
        limit: 1,
      });
      // This case happens when org contains only 1 member
      if (!targetMember) {
        return false;
      }
      const { role, userData } = targetMember;
      targetUser = userData;
      targetCurrentRole = role;
    }

    await Promise.all([
      this.updateMemberRoleInOrg({
        orgId,
        targetId: targetUser._id,
        newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        oldRole: targetCurrentRole,
      }),
      this.updateOrganizationOwner(organization, targetUser),
      this.updateMemberRoleInOrg({
        orgId,
        targetId: oldOwnerId.toHexString(),
        newRole: OrganizationRoleEnums.MEMBER,
        oldRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      }),
      this.rabbitMQService.publish(EXCHANGE_KEYS.WORKSPACE, ROUTING_KEY.LUMIN_WEB_TRANSFER_WORKSPACE, {
        oldUserId: oldOwnerId,
        workspaceId: organization._id,
        destinationUserId: targetUser._id,
      }),
    ]);

    // Send noti & email
    this.sendTransferAdminNotiAndEmail({
      organization,
      newOwner: targetUser,
      oldOwner,
      actorType: APP_USER_TYPE.SALE_ADMIN,
    });
    return true;
  }

  sendTransferAdminNotiAndEmail(data: {
    organization: IOrganization;
    newOwner: User;
    oldOwner: User;
    actorType: APP_USER_TYPE;
  }): void {
    const {
      organization, newOwner, oldOwner, actorType,
    } = data;
    const { _id: orgId, name: orgName } = organization;
    this.publishUpdateOrganization(
      [newOwner._id],
      {
        actorName: CommonConstants.LUMIN_ADMIN,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        orgId,
      },
      SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
    );
    const notification = notiOrgFactory.create(NotiOrg.TRANSFER_OWNER, {
      actor: {
        user: oldOwner,
        actorData: { type: actorType },
      },
      target: { user: newOwner },
      entity: { organization },
    });
    this.publishNotiToAllOrgMember({
      orgId,
      notification,
      excludedIds: [oldOwner._id],
    });
    // send out-app noti for mobile
    const {
      notificationData: firebaseNotificationData,
      notificationContent: firebaseNotificationContent,
      notificationContentForTargetUser: firebaseNotificationContentExtra,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.TRANSFER_OWNER, {
      organization,
      actor: oldOwner,
      targetUser: newOwner,
    });

    this.publishFirebaseNotiToAllOrgMember({
      orgId,
      firebaseNotificationData,
      firebaseNotificationContent,
      excludedIds: [oldOwner._id, newOwner._id],
      extraMembers: [newOwner._id],
      firebaseNotificationContentExtra,
    });
    firebaseNotificationContent.title = `A ${upperFirst(ORGANIZATION_TEXT)} Admin role has been transferred to you`;
    this.notificationService.publishFirebaseNotifications([newOwner._id], firebaseNotificationContent, firebaseNotificationData);

    const saleAdminName = CommonConstants.LUMIN_ADMIN;
    const emailData = {
      actorName: saleAdminName,
      orgName,
      orgId,
      subject: SUBJECT[EMAIL_TYPE.TRANSFER_ORG_ADMIN.description]
        .replace('#{actorName}', saleAdminName)
        .replace('#{orgName}', orgName),
    };
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.TRANSFER_ORG_ADMIN,
      [newOwner.email],
      emailData,
    );
  }

  public async canCreateMainOrganization(email: string): Promise<boolean> {
    const domain: string = Utils.getEmailDomain(email);
    const isPopularDomain = Utils.verifyDomain(email);
    const isInBlacklist = await this.blacklistService.findOne(
      BlacklistActionEnum.CREATE_MAIN_ORGANIZATION,
      domain,
    );
    return !(isPopularDomain || isInBlacklist);
  }

  public publishConvertOrganization(payload: Record<string, any>): void {
    this.pubSub.publish(`${SUBSCRIPTION_CONVERT_ORGANIZATION}.${payload.orgId}`, {
      [SUBSCRIPTION_CONVERT_ORGANIZATION]: {
        ...payload,
      },
    });
  }

  public publishUpdateConvertedOrganization(
    payload: Record<string, any>,
  ): void {
    this.pubSub.publish(SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION, {
      [SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION]: {
        ...payload,
      },
    });
  }

  async canProcessByRole(
    orgId: string,
    userId: string,
    roles: OrganizationRoleEnums[],
  ): Promise<boolean> {
    const orgMembership = await this.getMembershipByOrgAndUser(orgId, userId);
    return (
      orgMembership
      && roles.includes(orgMembership.role as OrganizationRoleEnums)
    );
  }

  async isActorHigherRoleInOrg({ orgId, actorId, targetId } : {orgId: string, actorId: string, targetId: string}) {
    const [actorMembership, targetMembership] = await Promise.all([
      this.getMembershipByOrgAndUser(orgId, actorId),
      this.getMembershipByOrgAndUser(orgId, targetId),
    ]);

    return Utils.isHigherRoleInOrg(actorMembership.role, targetMembership.role);
  }

  async getPendingInvite(email: string): Promise<IRequestAccess[]> {
    return this.getInviteOrgList(
      { actor: email, type: AccessTypeOrganization.INVITE_ORGANIZATION },
      { target: 1 },
    );
  }

  async searchOrgMemberByEmail({
    orgId, email, premiumSeatSet, requestSignSeatEmails,
  }: { orgId: string, email: string, premiumSeatSet: Set<string>, requestSignSeatEmails: Set<string> }): Promise<OrganizationMemberConnection> {
    const users = await this.userService.aggregateUser([
      {
        $match: {
          email,
        },
      },
      {
        $lookup: {
          from: 'organizationmembers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', '$$userId'],
                },
                orgId: new Types.ObjectId(orgId),
              },
            },
          ],
          as: 'member',
        },
      },
      {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: false,
        },
      },
    ]);

    const organizationMembers = users.map((user) => ({
      node: {
        role: user.member.role,
        lastActivity: user.lastLogin,
        joinDate: user.member.createdAt,
        user: {
          ...user,
          isSignProSeat: premiumSeatSet.has(user._id.toString()),
          isSeatRequest: requestSignSeatEmails.has(user.email),
        },
      },
    }));

    return {
      totalItem: users.length,
      totalRecord: users.length,
      edges: organizationMembers,
    };
  }

  async getMembers(
    getMemberInput: GetMemberInput & { internal?: boolean; userId?: string },
  ): Promise<OrganizationMemberConnection> {
    const {
      orgId,
      limit,
      offset,
      option = {},
      searchKey = '',
      internal,
      userId,
    } = getMemberInput;
    let optionsPipeline = [];
    const internalRequired = typeof internal === 'boolean';
    const matchCondition = { orgId: new Types.ObjectId(orgId) } as Record<string, unknown>;
    const organization = await this.getOrgById(orgId);
    const premiumSeatSet = new Set<string>(
      organization.premiumSeats.map((seat) => seat.toHexString()),
    );
    const requestSignSeats = await this.getRequesterListByOrgIdAndType(orgId, AccessTypeOrganization.REQUEST_SIGN_SEAT);
    const requestSignSeatEmails = new Set<string>(
      requestSignSeats.map((request) => request.actor),
    );
    if (searchKey.length) {
      return this.searchOrgMemberByEmail({
        email: searchKey, orgId, premiumSeatSet, requestSignSeatEmails,
      });
    }
    if (option.joinSort) {
      return this.getMemberByJoinSort(getMemberInput, premiumSeatSet, requestSignSeatEmails);
    }
    if (option.roleSort && option.roleSort !== OrganizationRole.ALL) {
      matchCondition.role = OrganizationRoleEnums[option.roleSort];
    }

    if (internalRequired) {
      matchCondition.internal = internal;
    }
    const lookupMatchExpression = {
      $expr: {
        $eq: ['$_id', '$$userId'],
      },
    };

    const lookupExpression = {
      from: 'users',
      let: {
        userId: '$userId',
      },
      pipeline: [
        {
          $match: lookupMatchExpression,
        },
        {
          $project: {
            password: 0,
            recentPasswords: 0,
          },
        },
      ],
      as: 'user',
    };
    if (option.roleSort === OrganizationRole.ORGANIZATION_ADMIN) {
      const organizationAdmin = await this.aggregateOrganizationMember([
        {
          $match: {
            orgId: new Types.ObjectId(orgId),
            role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
            ...internalRequired && { internal },
          },
        },
        {
          $lookup: lookupExpression,
        },
        {
          $unwind: '$user',
        },
      ]);
      return {
        totalItem: organizationAdmin.length,
        totalRecord: organizationAdmin.length,
        edges: organizationAdmin.length ? [
          {
            node: {
              role: OrganizationRole.ORGANIZATION_ADMIN,
              user: {
                ...organizationAdmin[0].user,
                isSignProSeat: premiumSeatSet.has(organizationAdmin[0].user._id.toString()),
                isSeatRequest: requestSignSeatEmails.has(organizationAdmin[0].user.email),
              },
              lastActivity: organizationAdmin[0].user.lastLogin,
              joinDate: organizationAdmin[0].createdAt,
            },
          }] : [],
        pageInfo: {
          limit,
          offset,
        },
      };
    }

    const sortStrategy = { role: 1, createdAt: -1 };
    const unshiftUsers = [];

    const filterBillingModerator = option.roleSort === OrganizationRole.BILLING_MODERATOR;
    const filterMember = option.roleSort === OrganizationRole.MEMBER;
    const isFirstPage = offset === 0;

    const filterCondition = (filterBillingModerator || filterMember) ? {
      orgId: new Types.ObjectId(orgId),
      userId: new Types.ObjectId(userId),
      role: { $ne: OrganizationRoleEnums.ORGANIZATION_ADMIN },
    } as Record<string, unknown> : {
      $or: [
        {
          orgId: new Types.ObjectId(orgId),
          userId: new Types.ObjectId(userId),
        },
        {
          orgId: new Types.ObjectId(orgId),
          role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
          userId: { $ne: new Types.ObjectId(userId) },
        },
      ],
    };
    const foundUsers = await this.aggregateOrganizationMember([
      {
        $match: { ...filterCondition, ...internalRequired && { internal } } as Record<string, unknown>,
      },
      {
        $lookup: lookupExpression,
      },
      {
        $unwind: '$user',
      },
    ]);

    if (!option.joinSort) {
      const users = [];
      const sortMemberByCondition = (members) => {
        // eslint-disable-next-line consistent-return
        members.forEach((member) => {
          if (member.userId.toHexString() === userId) {
            users.push(member);
            remove(members, (item: any) => item.userId.toHexString() === userId);
            return sortMemberByCondition(members);
          }
          if (member.role === OrganizationRoleEnums.ORGANIZATION_ADMIN) {
            users.push(member);
            remove(members, (item: any) => item.userId.toHexString() === member.userId.toHexString());
            return sortMemberByCondition(members);
          }
        });
      };
      sortMemberByCondition(foundUsers);
      const filterDuplicatedMembers = uniqBy(users, (member) => member.userId.toHexString());
      unshiftUsers.unshift(...filterDuplicatedMembers);
    }
    const isBillingModeratorExcluded = unshiftUsers[0]?.role === OrganizationRoleEnums.BILLING_MODERATOR && filterBillingModerator;
    const isMemberExcluded = unshiftUsers[0]?.role === OrganizationRoleEnums.MEMBER && filterMember;
    const shouldExcludeCurrentUser = isBillingModeratorExcluded || isMemberExcluded;
    optionsPipeline.push({
      $match: {
        role: { $ne: OrganizationRoleEnums.ORGANIZATION_ADMIN },
        userId: { $ne: new Types.ObjectId(userId) },
        ...matchCondition,
      },
    });
    optionsPipeline = optionsPipeline.concat([
      {
        $project: {
          userId: 1,
          role: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: lookupExpression,
      },
      {
        $unwind: '$user',
      },
    ]);

    const isAllRolesOrNoRoleSort = option.roleSort === OrganizationRole.ALL || !option.roleSort;
    const shouldUnshiftMemberToList = isFirstPage && (shouldExcludeCurrentUser || isAllRolesOrNoRoleSort);
    const skipValue = Math.max(
      0,
      isFirstPage ? offset : offset - unshiftUsers.length,
    );
    const limitValue = shouldUnshiftMemberToList
      ? Math.max(0, limit - unshiftUsers.length)
      : limit;
    optionsPipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        members: [
          { $sort: { ...sortStrategy } },
          { $skip: skipValue },
          {
            $limit: limitValue,
          },
        ],
      },
    });
    const [data] = await this.aggregateOrganizationMember(optionsPipeline);
    const { members, metadata } = data;
    if (shouldUnshiftMemberToList) {
      members.unshift(...unshiftUsers);
    }
    const pageInfo: PageInfo = {
      offset: offset - unshiftUsers.length,
      limit,
    };

    const organizationMembers = members.filter(Boolean).map((member) => ({
      node: {
        role: member.role,
        lastActivity: member.user.lastLogin,
        joinDate: member.createdAt,
        user: {
          ...member.user,
          isSignProSeat: premiumSeatSet.has(member.user._id.toString()),
          isSeatRequest: requestSignSeatEmails.has(member.user.email),
        },
      },
    }));

    const totalFromMeta = metadata[0]?.total ?? 0;
    return {
      totalItem: totalFromMeta + unshiftUsers.length,
      totalRecord: organizationMembers.length,
      edges: organizationMembers,
      pageInfo,
    };
  }

  async findUserToInvite(
    email: string,
    orgId: string,
  ): Promise<FindUserPayload> {
    const [userFound, pendingMember] = await Promise.all([
      this.userService.findVerifiedUserByEmail(email, null),
      this.findMemberInRequestAccessWithType(
        {
          actor: email,
          type: AccessTypeOrganization.INVITE_ORGANIZATION,
          target: orgId,
        },
        { entity: 1 },
      ),
    ]);
    if (pendingMember) {
      return {
        ...userFound,
        email,
        status: SearchUserStatus.USER_ADDED,
      };
    }
    if (!userFound) {
      return {
        email,
        status: SearchUserStatus.USER_VALID,
      };
    }
    if (userFound.deletedAt) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_DELETING,
      };
    }

    const member = await this.getMembershipByOrgAndUser(orgId, userFound._id, {
      _id: 1,
    });

    return {
      ...userFound,
      status: member ? SearchUserStatus.USER_ADDED : SearchUserStatus.USER_VALID,
    };
  }

  async findUserToGrantModerator(
    email: string,
    orgId: string,
  ): Promise<FindUserPayload> {
    const userFound = await this.userService.findUserByEmail(email);
    if (!userFound) {
      return {
        email,
        status: SearchUserStatus.USER_NOT_BELONG_TO_ORG,
      };
    }

    if (userFound.deletedAt) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_DELETING,
      };
    }

    const membership = await this.getMembershipByOrgAndUser(
      orgId,
      userFound._id,
    );
    if (!membership) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_NOT_BELONG_TO_ORG,
      };
    }
    const isManager = [
      OrganizationRoleEnums.BILLING_MODERATOR,
      OrganizationRoleEnums.ORGANIZATION_ADMIN,
    ].includes(membership.role as OrganizationRoleEnums);
    return {
      ...userFound,
      status: isManager
        ? SearchUserStatus.USER_ADDED
        : SearchUserStatus.USER_VALID,
    };
  }

  async createFolder(params: {
    name: string;
    color: string;
    parentId: string;
    ownerId: string;
    refId: string;
    folderType: FolderTypeEnum;
    isNotify?: boolean;
  }): Promise<IFolder> {
    const {
      ownerId,
      name,
      color,
      parentId,
      refId,
      folderType,
      isNotify,
    } = params;

    const ownedFolderPermisison = await this.folderService.findFolderPermissionsByCondition(
      { refId, role: folderType },
    );

    if (ownedFolderPermisison.length >= MAX_NUBMER_FOLDER) {
      throw GraphErrorException.NotAcceptable(
        'Number of folders reaches the limit',
      );
    }

    if (parentId) {
      const parentFolderPermission = await this.folderService.findFolderPermissionsByCondition({
        folderId: parentId, refId, role: folderType,
      });
      if (!parentFolderPermission.length) {
        throw GraphErrorException.NotFound('Parent folder not found');
      }
    }

    const path = await this.folderService.findFolderPath(parentId);
    const depth = this.folderService.getFolderDepth({ path });
    if (depth > MAX_DEPTH_LEVEL) {
      throw GraphErrorException.NotAcceptable('Folder depth reaches the limit');
    }

    const [folder, owner] = await Promise.all([
      this.folderService.createFolderDocument({
        ownerId,
        name,
        color,
        path,
        depth,
        parentId,
      }),
      this.userService.findUserById(ownerId),
    ]);
    const role = folderType === FolderTypeEnum.ORGANIZATION
      ? FolderRoleEnum.ORGANIZATION
      : FolderRoleEnum.ORGANIZATION_TEAM;
    await Promise.all([
      this.folderService.createFolderPermissionDocument({
        refId,
        folderId: folder._id,
        role,
      }),
      this.folderService.addNewFolderColor(ownerId, color),
    ]);

    this.folderService.publishCreateFolderSubscription(
      {
        folder,
        clientId: refId,
      },
      SUBSCRIPTION_CREATE_FOLDER,
    );

    if (folderType !== FolderTypeEnum.ORGANIZATION || isNotify) {
      this.notifyCreateFolder({
        actor: owner,
        folderType,
        refId,
        folder,
      });
    }
    return folder;
  }

  async notifyCreateFolder(params: {
    actor: User;
    folderType: FolderTypeEnum;
    refId: string;
    folder: IFolder;
  }): Promise<void> {
    const {
      folderType, refId, actor, folder,
    } = params;
    const notificationData = {
      actor: { user: actor },
      entity: { folder },
    };
    switch (folderType) {
      case FolderTypeEnum.ORGANIZATION: {
        const org = await this.getOrgById(refId);
        Object.assign(notificationData, {
          target: { organization: org },
        });
        const notification = notiFolderFactory.create(
          NotiFolder.CREATE_ORG_FOLDER,
          notificationData,
        );
        this.publishNotiToAllOrgMember({
          orgId: refId,
          notification,
          excludedIds: [actor._id],
        });

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseFolderFactory.create(NotiFolder.CREATE_ORG_FOLDER, {
          organization: org,
          actor,
          folder,
        });
        this.publishFirebaseNotiToAllOrgMember({
          orgId: org._id,
          firebaseNotificationContent,
          firebaseNotificationData,
          excludedIds: [actor._id],
        });
        break;
      }
      case FolderTypeEnum.ORGANIZATION_TEAM: {
        const team = await this.teamService.findOne({ _id: refId });
        const org = await this.getOrgById(team.belongsTo);
        Object.assign(notificationData, {
          target: { organization: org, team },
        });
        const notification = notiFolderFactory.create(
          NotiFolder.CREATE_TEAM_FOLDER,
          notificationData,
        );
        this.membershipService.publishNotiToAllTeamMember(refId, notification, [
          actor._id,
        ]);

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseFolderFactory.create(NotiFolder.CREATE_TEAM_FOLDER, {
          organization: org,
          team,
          actor,
          folder,
        });

        this.publishFirebaseNotiToAllTeamMember({
          teamId: team._id,
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

  async getOrganizationFolders(input: GetFoldersInput & { orgId: string }): Promise<IFolder[]> {
    const {
      userId,
      orgId,
      isStarredTab,
    } = input;

    let matchConditions: PipelineStage.Match['$match'] = {
      refId: new Types.ObjectId(orgId),
      role: FolderRoleEnum.ORGANIZATION,
    };

    if (isStarredTab) {
      const teamsOfOrg = await this.organizationTeamService.getOrgTeams(orgId);
      const teamIds = teamsOfOrg.map((team) => team._id);
      const refIds = [...new Set([orgId, ...teamIds])].map(
        (_id) => new Types.ObjectId(_id),
      );
      matchConditions = {
        $or: [
          { refId: { $in: refIds } },
          {
            refId: new Types.ObjectId(userId),
            'workspace.refId': new Types.ObjectId(orgId),
          },
        ],
      };
    }
    const folderPermissions = await this.folderService.findFolderPermissionsByCondition(matchConditions);
    if (!folderPermissions.length) {
      return [];
    }
    if (isStarredTab) {
      return this.getFolderListByPermission({
        folderPermissions,
        findOptions: {
          sortOptions: input.sortOptions,
          isStarredTab: input.isStarredTab,
          searchKey: input.searchKey,
          userId: input.userId,
        },
      });
    }
    const folderList = await this.getFolderListByPermission({
      folderPermissions,
      findOptions: {
        sortOptions: input.sortOptions,
        isStarredTab: input.isStarredTab,
        searchKey: input.searchKey,
        userId: input.userId,
      },
    });

    const folderBelongsTo = await this.folderService.getBelongsToByFolderPermission(folderPermissions[0]);
    return folderList.map((folder) => ({
      ...folder,
      belongsTo: {
        ...folderBelongsTo,
        folderId: folder._id,
      },
    }));
  }

  async getFolderListByPermission(params: {
    folderPermissions: IFolderPermission[],
    findOptions: {
      sortOptions: FolderSortOptions,
      isStarredTab: boolean,
      searchKey: string,
      userId: string,
    },
  }): Promise<IFolder[]> {
    const {
      folderPermissions,
      findOptions,
    } = params;
    const {
      sortOptions = {},
      isStarredTab = false,
      searchKey = '',
      userId = '',
    } = findOptions;
    const matchConditions: FilterQuery<IFolderModel> = { _id: { $in: folderPermissions.map((p) => new Types.ObjectId(p.folderId)) } };
    const sortConditions: any = {};
    if (sortOptions?.createdAt) {
      sortConditions.createdAt = SortStrategy[sortOptions.createdAt];
    }
    if (sortOptions?.name) {
      sortConditions.name = SortStrategy[sortOptions.name];
    }
    if (isStarredTab) {
      Object.assign(matchConditions, {
        listUserStar: userId,
      });
    }
    if (searchKey) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(matchConditions, {
        name: { $regex: searchKeyRegex, $options: 'i' },
      });
    }
    if (!searchKey && !isStarredTab) {
      Object.assign(matchConditions, {
        $or: [{ depth: { $exists: false } }, { depth: { $eq: 0 } }],
      });
    }
    return this.folderService.findFoldersByConditions(matchConditions, null, { sort: sortConditions });
  }

  async getOrgTeamFolders(
    input: Omit<GetFoldersInput, 'isStarredTab'> & { teamId: string },
  ): Promise<IFolder[]> {
    const {
      userId,
      teamId,
      sortOptions,
      searchKey,
    } = input;

    const folderPermissions = await this.folderService.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(teamId),
      role: FolderRoleEnum.ORGANIZATION_TEAM,
    });
    if (!folderPermissions.length) {
      return [];
    }

    const folderBelongsTo = await this.folderService.getBelongsToByFolderPermission(folderPermissions[0]);

    const folderList = await this.getFolderListByPermission({
      folderPermissions,
      findOptions: {
        sortOptions,
        isStarredTab: false,
        searchKey,
        userId,
      },
    });

    return folderList.map((folder) => ({
      ...folder,
      belongsTo: {
        ...folderBelongsTo,
        folderId: folder._id,
      },
    }));
  }

  async getPersonalFoldersInOrg(
    input: {
      user: User,
      orgId: string,
      sortOptions: FolderSortOptions,
      searchKey: string,
    },
  ): Promise<IFolder[]> {
    const {
      orgId,
      user,
      sortOptions,
      searchKey,
    } = input;
    const { _id: userId } = user;
    const folderPermissions = await this.folderService.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(userId),
      role: FolderRoleEnum.OWNER,
      workspace: {
        refId: new Types.ObjectId(orgId),
        type: DocumentWorkspace.ORGANIZATION,
      },
    });
    if (!folderPermissions.length) {
      return [];
    }
    const folderBelongsTo: FolderBelongsTo = {
      type: LocationType.PERSONAL,
      location: {
        _id: userId,
        name: user.name,
      },
      workspaceId: orgId,
    };

    const folderList = await this.getFolderListByPermission({
      folderPermissions,
      findOptions: {
        sortOptions,
        isStarredTab: false,
        searchKey,
        userId,
      },
    });

    return folderList.map((folder) => ({
      ...folder,
      belongsTo: {
        ...folderBelongsTo,
        folderId: folder._id,
      },
    }));
  }

  async getOrganizationFolderTree(input: { orgId: string }): Promise<GetOrganizationFolderTreePayload> {
    const { orgId } = input;

    const folderPermissions = await this.folderService.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(orgId),
      role: FolderRoleEnum.ORGANIZATION,
    });
    if (!folderPermissions.length) {
      return { children: [] };
    }

    const folders = await this.folderService.findFoldersByConditions({
      _id: { $in: folderPermissions.map((p) => new Types.ObjectId(p.folderId)) },
    });

    const children = this.folderService.buildChildrenTree({ folders });

    return { children };
  }

  async getOrgTeamsFolderTree(input: { orgId: string, userId: string, teamIds: string[] }): Promise<GetOrganizationTeamsFolderTreePayload> {
    const { orgId, userId, teamIds = [] } = input;

    let orgTeams = await this.organizationTeamService.getOrgTeamsByUserId(orgId, userId);
    if (teamIds.length) {
      orgTeams = orgTeams.filter((team) => teamIds.includes(team._id));
    }

    const teams = await Promise.all(orgTeams.map(async (team) => {
      const folderPermissions = await this.folderService.findFolderPermissionsByCondition({
        refId: new Types.ObjectId(team._id),
        role: FolderRoleEnum.ORGANIZATION_TEAM,
      });
      if (!folderPermissions.length) {
        return {
          _id: team._id,
          name: team.name,
          children: [],
        };
      }

      const folders = await this.folderService.findFoldersByConditions({
        _id: { $in: folderPermissions.map((p) => new Types.ObjectId(p.folderId)) },
      });

      const children = this.folderService.buildChildrenTree({ folders });

      return {
        _id: team._id,
        name: team.name,
        children,
      };
    }));

    return { teams };
  }

  async getPersonalFolderTreeInOrg(input: { orgId: string, userId: string }): Promise<GetOrganizationFolderTreePayload> {
    const { orgId, userId } = input;

    const folderPermissions = await this.folderService.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(userId),
      role: FolderRoleEnum.OWNER,
      workspace: {
        refId: new Types.ObjectId(orgId),
        type: DocumentRoleEnum.ORGANIZATION,
      },
    });
    if (!folderPermissions.length) {
      return { children: [] };
    }

    const folders = await this.folderService.findFoldersByConditions({
      _id: { $in: folderPermissions.map((p) => new Types.ObjectId(p.folderId)) },
    });

    const children = this.folderService.buildChildrenTree({ folders });

    return { children };
  }

  async updateContactListWhenInviteMember(
    actorId: string,
    invitedMemberIds: string[],
  ): Promise<UserContact> {
    await Promise.all(
      invitedMemberIds.map((memberId) => this.userService.updateContactList(memberId, [actorId])),
    );
    return this.userService.updateContactList(actorId, invitedMemberIds);
  }

  async isOverOrgSizeLimitForNoti(orgId: string): Promise<boolean> {
    const internalMembers = await this.getOrgMembershipByConditions({
      conditions: { orgId },
      limit: ORG_SIZE_LIMIT_FOR_NOTI + 1,
    });
    return internalMembers.length > ORG_SIZE_LIMIT_FOR_NOTI;
  }

  async getOrgNotiReceiverIds(data: {
    orgId: string;
    optionalReceivers: IOrganizationMember[];
    requiredReceiverIds?: string[];
  }): Promise<string[]> {
    const { orgId, optionalReceivers, requiredReceiverIds = [] } = data;
    const exceedOrgSizeLimitForNoti = await this.isOverOrgSizeLimitForNoti(
      orgId,
    );
    const receiverIds: string[] = [...requiredReceiverIds];
    if (exceedOrgSizeLimitForNoti) {
      const managers = optionalReceivers
        .filter(({ role }) => [
          OrganizationRoleEnums.ORGANIZATION_ADMIN,
          OrganizationRoleEnums.BILLING_MODERATOR,
        ].includes(role as OrganizationRoleEnums))
        .map(({ userId }) => userId.toHexString());
      receiverIds.push(...managers);
    } else {
      receiverIds.push(
        ...optionalReceivers.map(({ userId }) => userId.toHexString()),
      );
    }
    return receiverIds.filter(Boolean);
  }

  async getFolders(targetId: string): Promise<Folder[]> {
    return this.folderService.getFoldersInOrgOrTeam(targetId);
  }

  async isFreeResource(resource: IOrganization | ITeam): Promise<boolean> {
    const isFreePlan = (org) => org.payment.type === PaymentPlanEnums.FREE;
    const orgId = (resource as ITeam).belongsTo;
    if (orgId) {
      const org = await this.getOrgById(orgId);
      return isFreePlan(org);
    }
    return isFreePlan(resource);
  }

  async getDocuments(params: {
    user: any, resource: IOrganization | ITeam
  } & Omit<GetOrganizationDocumentsInput, 'orgId'>): Promise<GetDocumentPayload> {
    const {
      resource,
      user,
      query,
      filter,
      tab,
    } = params;

    const { cursor = '', searchKey } = query || {};

    const permissionBuilder = new OrganizationPermissionFilter(this.organizationTeamService);
    const documentBuilder = new DocumentFilter(this.documentService);

    const [permFilter, documentFilter] = await Promise.all([
      permissionBuilder
        .of(user)
        .in(resource)
        .addTab(tab)
        .build(),
      documentBuilder
        .of(user)
        .in(resource)
        .addTab(tab)
        .addCursor(cursor)
        .addSearch(searchKey)
        .addFilter({
          ownedFilterCondition: filter.ownedFilterCondition,
          lastModifiedFilterCondition: filter.lastModifiedFilterCondition,
        })
        .build(),
    ]);
    const queryManager = new OrganizationDocumentQuery(
      this.documentService,
      this.userService,
      this.folderService,
      this.environmentService,
    );
    const premiumMap = new OrganizationDocumentPremiumMap(this.documentService, this)
      .atTab(tab)
      .ofResource(resource);
    return queryManager
      .of(user)
      .in(resource)
      .injectPremiumMap(premiumMap)
      .getDocuments({
        query,
        permFilter,
        documentFilter,
      });
  }

  public isRestrictedBillingActions(orgId: string): boolean {
    const value = this.environmentService.getByKey(
      EnvConstants.RESTRICTED_BILLING_ACTIONS_ORG_IDS,
    );
    const restrictedBillingActionsOrgIds: string[] = value ? JSON.parse(value) || [] : [];
    return orgId && restrictedBillingActionsOrgIds.includes(orgId);
  }

  getOrgAdditionSetting(organization: IOrganization): IOrganization {
    const orgData = organization;
    const hideMemberPageOrgs = this.environmentService.getByKey(EnvConstants.HIDE_MEMBER_PAGE_ORGANIZATIONS);
    const isRestrictedBillingActions = this.isRestrictedBillingActions(organization._id);
    const shouldHideMemberPage = hideMemberPageOrgs?.length ? hideMemberPageOrgs.split(',').includes(organization._id) : false;
    const { subscriptionItems = [] } = organization.payment;
    const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);
    const totalSignSeats = signSubscription?.quantity ?? 0;
    const availableSignSeats = totalSignSeats - organization.premiumSeats?.length;
    return {
      ...orgData,
      isRestrictedBillingActions,
      settings: {
        ...orgData.settings,
        other: {
          ...orgData.settings.other,
          ...(shouldHideMemberPage && { hideMember: true }),
        },
      },
      totalSignSeats,
      availableSignSeats,
    } as IOrganization;
  }

  async checkReachLimitUploadOrg(data: {
    userId: string,
    organization: IOrganization;
  }): Promise<boolean> {
    const {
      userId,
      organization,
    } = data;
    const isPremium = organization.payment.type !== PaymentPlanEnums.FREE;
    const totalUploadPerday = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.UPLOAD_DOCUMENT_TO_ORGANIZATION}${userId}:${organization._id}`,
    ) || 0;
    const availableUpload = this.environmentService.getByKey(`DOCUMENT_UPLOAD${isPremium ? '_PAID' : ''}_TOTAL`);
    return (Number(totalUploadPerday) >= Number(availableUpload));
  }

  async sendNotiUploadDocument({
    target,
    uploader,
    document,
  }:{
    target: IOrganization,
    uploader: User,
    document: Document
  }): Promise<void> {
    const notification = notiDocumentFactory.create(
      NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
      {
        actor: { user: uploader },
        entity: { document: document as unknown as Partial<IDocument> },
        target: { organization: target },
      },
    );
    const orgMembers = await this.getMembersByOrgId(target._id, {
      userId: 1,
      role: 1,
    });

    const receiverList = orgMembers.filter(
      ({ userId }) => userId.toHexString() !== uploader._id,
    );
    const receiverIds = await this.getOrgNotiReceiverIds({
      orgId: target._id,
      optionalReceivers: receiverList,
    });
    this.notificationService.createUsersNotifications(
      notification,
      receiverIds,
    );
  }

  async validateAssociateDomain(orgId: string, associateDomain: string, skipMemberDomainValidation?: boolean): Promise<boolean> {
    const isPoppularDomain = Utils.verifyDomain(associateDomain);
    if (isPoppularDomain) {
      throw GraphErrorException.BadRequest(
        'This domain isn’t eligible to associate.',
        ErrorCode.Org.INVALID_ASSOCIATE_DOMAIN_POPULAR_DOMAIN,
      );
    }

    if (!skipMemberDomainValidation) {
      const membersInfo = await this.getMembersInfoByOrgId(orgId);
      const isExistMemberWithAssociateDomain = membersInfo.some((memberInfo) => {
        const emailDomain = Utils.getEmailDomain(memberInfo.user.email);
        return emailDomain === associateDomain;
      });
      if (!isExistMemberWithAssociateDomain) {
        throw GraphErrorException.BadRequest(
          'This domain cannot be associated because no member in your circle has it',
          ErrorCode.Org.INVALID_ASSOCIATE_DOMAIN_NOT_EXIST_MEMBER,
        );
      }
    }

    return true;
  }

  async addAssociateDomain(
    { organization, associateDomain, skipMemberDomainValidation }
    : { organization: IOrganization, associateDomain: string, skipMemberDomainValidation?: boolean },
  ): Promise<Organization> {
    const { _id: orgId, associateDomains } = organization;
    await this.validateAssociateDomain(orgId, associateDomain, skipMemberDomainValidation);
    const newAssociateDomainList = new Set([...associateDomains, associateDomain]);
    const updatedOrganization = await this.updateOrganizationById(
      orgId,
      { $set: { associateDomains: [...newAssociateDomainList] } },
    );
    const { newDomainGuestIds } = await this.updateInternalMembers({ orgId: organization._id, newAssociateDomain: associateDomain });
    this.publishUpdateOrganization(
      newDomainGuestIds,
      {
        orgId,
        organization: updatedOrganization,
        type: SUBSCRIPTION_GOOGLE_SIGN_IN_SECURITY_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
    return updatedOrganization as unknown as Organization;
  }

  async editAssociateDomain(
    { organization, newAssociateDomain, oldAssociateDomain }
    : { organization: IOrganization, newAssociateDomain: string, oldAssociateDomain: string },
  ): Promise<Organization> {
    const { _id: orgId, associateDomains } = organization;
    const oldAssociateDomainIndex = associateDomains.findIndex((domain) => domain === oldAssociateDomain);
    if (oldAssociateDomainIndex === -1) {
      throw GraphErrorException.BadRequest('Edit associate domain failed');
    }
    await this.validateAssociateDomain(orgId, newAssociateDomain);
    associateDomains.splice(oldAssociateDomainIndex, 1, newAssociateDomain);
    const newassociateDomainList = new Set(associateDomains);
    const updatedOrganization = await this.updateOrganizationById(
      orgId,
      { $set: { associateDomains: [...newassociateDomainList] } },
    );
    await this.updateInternalMembers({ orgId: organization._id, newAssociateDomain, oldAssociateDomain });
    return updatedOrganization as unknown as Organization;
  }

  async removeAssociateDomain(
    { organization, associateDomain } : { organization: IOrganization, associateDomain: string },
  ): Promise<Organization> {
    const { _id: orgId, associateDomains } = organization;
    const associateDomainIndex = associateDomains.findIndex((domain) => domain === associateDomain);
    if (associateDomainIndex === -1) {
      throw GraphErrorException.BadRequest('Remove associate domain failed');
    }
    associateDomains.splice(associateDomainIndex, 1);
    const updatedOrganization = await this.updateOrganizationById(
      orgId,
      { $set: { associateDomains: [...associateDomains] } },
    );
    await Promise.all([
      this.updateInternalMembers({ orgId: organization._id, oldAssociateDomain: associateDomain }),
      this.notifyRemoveAssociateDomain(organization, associateDomain),
    ]);
    return updatedOrganization as unknown as Organization;
  }

  async getReceiverSubscriptionIds(orgId: string, exceptIds: string[] = []): Promise<string[]> {
    const orgMembers = await this.getMembersByOrgId(orgId);
    const orgMemberIds: string[] = orgMembers
      .filter(Boolean)
      .map(({ userId }) => userId.toHexString() as string);
    return orgMemberIds.filter((id) => !exceptIds.includes(id));
  }

  async removeInvitation(data: {
    input: RejectInvitationInput,
    notification: INotification,
    userId: string,
    requestAccess: IRequestAccess,
  }):Promise<{
    isSuccess?: boolean,
    error?: GraphErrorException,
  }> {
    const {
      input, notification, userId, requestAccess,
    } = data;
    const { _id } = notification;
    const { orgId, rejectType } = input;
    const [notificationUser] = await Promise.all([
      this.notificationService.getNotificationUserByNotiId(_id),
      this.notificationService.removeNotification(notification, userId),
      this.removeRequestAccess({ _id: requestAccess._id }),
    ]);
    if (rejectType === RejectType.FOREVER) {
      await this.blacklistService.create(BlacklistActionEnum.INVITE_USER, orgId, { rejectedUserId: userId });
    }
    if (!notificationUser) {
      return {
        error: GraphErrorException.NotFound('Notification not found', ErrorCode.Noti.NOTIFICATION_NOT_FOUND),
      };
    }

    return {
      isSuccess: true,
    };
  }

  async acceptInvitation(
    requestAccess: IRequestAccess,
    notificationId: string,
    trackingContext?: { anonymousUserId?: string; userAgent?: string },
  ): Promise<{
    isSuccess?: boolean,
    error?: GraphErrorException,
  }> {
    const {
      actor: email,
      entity,
      target,
      _id,
    } = requestAccess;
    const role = entity.role.toUpperCase() as OrganizationRoleInvite;
    const organization = await this.getOrgById(target);
    const { member: memberData } = await this.addMemberToOrg({
      email,
      organization,
      role,
    });
    const notification = await this.notificationService.getNotificationById(notificationId);
    this.notificationService.removeNotification(notification, memberData.userId);
    await this.removeRequestAccess({ _id });
    if (!memberData) {
      return {
        error: GraphErrorException.BadRequest('Add member to organization failed'),
      };
    }
    const acceptInviteNotification = integrationNotificationHandler({
      context: NotificationContext.Circle,
      type: OrganizationAction.ACCEPT_INVITE,
      data: {
        sendTo: [memberData.userId],
        data: {},
        target: {
          circleName: organization.name,
        },
        actor: {
          id: memberData.userId.toHexString(),
        },
      },
    });
    this.integrationService.sendNotificationToIntegration(acceptInviteNotification);

    this.trackUserAcceptOrganizationInvitation({
      organizationId: requestAccess.target,
      userId: memberData.userId,
      trackingContext,
    });
    return {
      isSuccess: true,
    };
  }

  async getActiveOrgsRelatedToUserDomain(
    { userEmail, userId }:{ userEmail: string, userId: string },
  ): Promise<(IOrganization & {priority: number})[]> {
    const domain: string = Utils.getEmailDomain(userEmail);
    const orgInvitations = await this.getRequestAccessByCondition({ actor: userEmail, type: AccessTypeOrganization.INVITE_ORGANIZATION });
    let orgIds = [];
    if (orgInvitations.length) {
      orgIds = orgInvitations.map(({ target }) => new Types.ObjectId(target));
    }
    const documentPermissions = await this.documentService.getDocumentPermission(
      userId,
      { role: { $nin: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION_TEAM] } },
    );
    let orgPermissions = [];
    if (documentPermissions.length) {
      const documentIds = documentPermissions.map(({ documentId }) => documentId);
      const documentOrgPermissions = await this.documentService.getDocumentPermissionByConditions({
        documentId: { $in: documentIds },
        role: DocumentRoleEnum.ORGANIZATION,
        refId: { $nin: orgIds },
      });
      orgPermissions = documentOrgPermissions.map(({ refId }) => refId);
    }
    const defaultQuery = [
      {
        $or: [
          { $eq: ['$domain', domain] },
          {
            $in: [
              domain,
              '$associateDomains',
            ],
          },
        ],
      },
      { $not: { $in: ['$_id', [...orgIds]] } },
    ];

    const getProjectQueryPerPlan = ({ plan, period }: {plan: PaymentPlanEnums, period: PaymentPeriodEnums}) => {
      const PlanPriorityMap = {
        [`${PaymentPlanEnums.ORG_BUSINESS}_${PaymentPeriodEnums.ANNUAL}`]: PriorityOrgIndex.ORG_BUSINESS_ANNUAL,
        [`${PaymentPlanEnums.ORG_BUSINESS}_${PaymentPeriodEnums.MONTHLY}`]: PriorityOrgIndex.ORG_BUSINESS_MONTHLY,
        [`${PaymentPlanEnums.ORG_PRO}_${PaymentPeriodEnums.ANNUAL}`]: PriorityOrgIndex.ORG_PRO_ANNUAL,
        [`${PaymentPlanEnums.ORG_PRO}_${PaymentPeriodEnums.MONTHLY}`]: PriorityOrgIndex.ORG_PRO_MONTHLY,
        [`${PaymentPlanEnums.ORG_STARTER}_${PaymentPeriodEnums.ANNUAL}`]: PriorityOrgIndex.ORG_STARTER_ANNUAL,
        [`${PaymentPlanEnums.ORG_STARTER}_${PaymentPeriodEnums.MONTHLY}`]: PriorityOrgIndex.ORG_STARTER_MONTHLY,
        [`${PaymentPlanEnums.ENTERPRISE}_${PaymentPeriodEnums.ANNUAL}`]: PriorityOrgIndex.OLD_ENTERPRISE_ANNUAL,
        [`${PaymentPlanEnums.ENTERPRISE}_${PaymentPeriodEnums.MONTHLY}`]: PriorityOrgIndex.OLD_ENTERPRISE_MONTHLY,
        [`${PaymentPlanEnums.BUSINESS}_${PaymentPeriodEnums.ANNUAL}`]: PriorityOrgIndex.BUSINESS_ANNUAL,
        [`${PaymentPlanEnums.BUSINESS}_${PaymentPeriodEnums.MONTHLY}`]: PriorityOrgIndex.BUSINESS_MONTHLY,
      };
      return {
        case: {
          $and: [
            ...defaultQuery,
            { $eq: ['$payment.type', plan] },
            { $eq: ['$payment.period', period] },
          ],
        },
        then: PlanPriorityMap[`${plan}_${period}`],
      };
    };

    let useAlternativeQuery = await this.redisService.isDomainUseAlternativeQuery(domain);
    let matchStage: PipelineStage[] = [{
      $match: {
        $or: [
          {
            $and: [
              {
                $or: [
                  { domain },
                  { associateDomains: domain },
                ],
              },
              { 'settings.domainVisibility': { $ne: DomainVisibilitySetting.INVITE_ONLY } },
            ],
          },
          {
            _id: {
              $in: [...orgIds, ...orgPermissions],
            },
          },
        ],
      },
    }];

    let mainOrg: IOrganization;
    const getAlternativeQuery = async () => {
      mainOrg = await this.getOrgByDomain(domain);
      const billingMods = await this.organizationMemberModel.find({
        orgId: mainOrg._id,
        role: OrganizationRoleEnums.BILLING_MODERATOR,
      }).limit(MAX_SUGGESTED_ORGANIZATION_NUMBER).exec();
      return [
        {
          $match: {
            $or: [
              {
                ownerId: { $in: billingMods.map(({ userId: _id }) => _id) },
                'settings.domainVisibility': {
                  $ne: DomainVisibilitySetting.INVITE_ONLY,
                },
              },
              {
                _id: {
                  $in: [...orgIds, ...orgPermissions],
                },
              },
              { domain },
            ],
          },
        },
      ];
    };

    if (useAlternativeQuery) {
      matchStage = await getAlternativeQuery();
    } else {
      const estimatedOrgs = await this.organizationModel.countDocuments({ associateDomains: domain });
      if (estimatedOrgs >= 1000) {
        this.redisService.setDomainUseAlternativeQuery(domain);
        matchStage = await getAlternativeQuery();
        useAlternativeQuery = true;
      }
    }

    const orgData: (IOrganization & {priority: number})[] = await this.organizationModel.aggregate([
      ...matchStage,
      {
        $project: {
          name: 1,
          url: 1,
          domain: 1,
          settings: 1,
          avatarRemoteId: 1,
          associateDomains: 1,
          createdAt: 1,
          payment: 1,
          hashedIpAddresses: 1,
          priority: {
            $switch: {
              branches: [
                {
                  case: {
                    $in: ['$_id', orgIds],
                  },
                  then: PriorityOrgIndex.INVITED_ORG,
                },
                ...[{ plan: PaymentPlanEnums.ORG_BUSINESS, period: PaymentPeriodEnums.ANNUAL },
                  { plan: PaymentPlanEnums.ORG_BUSINESS, period: PaymentPeriodEnums.MONTHLY },
                  { plan: PaymentPlanEnums.ORG_PRO, period: PaymentPeriodEnums.ANNUAL },
                  { plan: PaymentPlanEnums.ORG_PRO, period: PaymentPeriodEnums.MONTHLY },
                  { plan: PaymentPlanEnums.ORG_STARTER, period: PaymentPeriodEnums.ANNUAL },
                  { plan: PaymentPlanEnums.ORG_STARTER, period: PaymentPeriodEnums.MONTHLY },
                  { plan: PaymentPlanEnums.ENTERPRISE, period: PaymentPeriodEnums.ANNUAL },
                  { plan: PaymentPlanEnums.ENTERPRISE, period: PaymentPeriodEnums.MONTHLY },
                  { plan: PaymentPlanEnums.BUSINESS, period: PaymentPeriodEnums.ANNUAL },
                  { plan: PaymentPlanEnums.BUSINESS, period: PaymentPeriodEnums.MONTHLY },
                ].map(getProjectQueryPerPlan),
                {
                  case: {
                    $in: ['$_id', orgPermissions],
                  },
                  then: PriorityOrgIndex.SHARE_DOCUMENT,
                },
                {
                  case: {
                    $and: [
                      {
                        $or: [
                          { $eq: ['$domain', domain] },
                        ],
                      },
                      { $not: { $in: ['$_id', [...orgIds, ...orgPermissions]] } },
                    ],
                  },
                  then: PriorityOrgIndex.MAIN_ORG,
                },
              ],
              default: PriorityOrgIndex.OTHER_ORG,
            },
          },
        },
      },
      { $sort: { priority: 1, createdAt: -1 } },
      { $limit: MAX_SUGGESTED_ORGANIZATION_NUMBER },
    ]);

    const otherOrgIds = orgData.filter(({ priority }) => priority === PriorityOrgIndex.OTHER_ORG).map(({ _id }) => _id);
    const latestActiveOrgIds = await this.organizationEventService.sortOrgListByLatestActivity(otherOrgIds);

    const sortedOrgList = orgData.sort((a: IOrganization & {priority: number}, b: IOrganization & {priority: number}) => {
      const firstOrgIdx = latestActiveOrgIds.indexOf(a._id);
      const secondOrgIdx = latestActiveOrgIds.indexOf(b._id);
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      /**
       * Sort by order in latest activity org list:
       * - All organizations that have latest activity will be sorted before others
       * - The order between organizations that don't have latest activity will remain
       */
      if (firstOrgIdx > -1 && secondOrgIdx > -1) {
        return firstOrgIdx - secondOrgIdx;
      }
      return secondOrgIdx - firstOrgIdx;
    });

    return sortedOrgList.filter(Boolean);
  }

  async getSuggestedOrgListByUserDomain({ userEmail, userId }: { userEmail: string, userId: string }): Promise<Partial<{
    orgList: SuggestedOrganizationList[],
    error: GraphErrorException,
  }>> {
    const isPopularDomain = Utils.verifyDomain(userEmail);

    if (isPopularDomain) {
      return {
        error: GraphErrorException.Forbidden('Cannot suggest circles with popular domain'),
      };
    }
    const suggestedOrgList = await this.getActiveOrgsRelatedToUserDomain({ userEmail, userId });
    const orgStatusMapping = {
      [DomainVisibilitySetting.VISIBLE_AUTO_APPROVE]: JoinOrganizationStatus.CAN_JOIN,
      [DomainVisibilitySetting.VISIBLE_NEED_APPROVE]: JoinOrganizationStatus.CAN_REQUEST,
    };
    const getOrgStatus = (org: IOrganization & { priority: number }): JoinOrganizationStatus => {
      if (org.priority === PriorityOrgIndex.INVITED_ORG) {
        return JoinOrganizationStatus.PENDING_INVITE;
      }
      return orgStatusMapping[org.settings.domainVisibility];
    };
    const getExtraInfo = async (org) => {
      const [totalMember, members] = await Promise.all([
        this.getTotalMemberInOrg(org._id),
        this.getAllMembersByOrganization(org._id, { limit: 4 }),
      ]);
      const status = getOrgStatus(org);
      return {
        ...org,
        totalMember,
        members,
        status,
      };
    };
    const sortOrgByTotal = (currentOrg, nextOrg) => nextOrg.totalMember - currentOrg.totalMember;
    const organizations = await Promise.all(suggestedOrgList.map(getExtraInfo));
    const {
      suggestedOrgs,
      suggestedOrgsSortByTotal,
    } = organizations.reduce((acc, org) => {
      if (org.priority === PriorityOrgIndex.OTHER_ORG) {
        acc.suggestedOrgsSortByTotal.push(org);
      } else {
        acc.suggestedOrgs.push(org);
      }
      return acc;
    }, { suggestedOrgs: [], suggestedOrgsSortByTotal: [] });
    return {
      orgList: [...suggestedOrgs, ...suggestedOrgsSortByTotal.sort(sortOrgByTotal)],
    };
  }

  async validateUpdateVisibilitySetting(
    visibilitySetting: DomainVisibilitySetting,
    organization: IOrganization,
  ): Promise<{error: GraphErrorException}> {
    const organizationPaymentType = organization.payment.type as PaymentPlanEnums;
    const organizationPaymentPeriod = organization.payment.period as PaymentPeriodEnums;
    const hasAssociateDomains = Boolean(organization.associateDomains.length);
    const isMatchedPlan = [
      PaymentPlanEnums.BUSINESS,
      PaymentPlanEnums.ENTERPRISE,
      PaymentPlanEnums.ORG_BUSINESS,
    ].includes(organizationPaymentType);

    switch (visibilitySetting) {
      case DomainVisibilitySetting.INVITE_ONLY: {
        if (hasAssociateDomains && !isMatchedPlan) {
          return { error: GraphErrorException.Forbidden('Can not update visibility setting', ErrorCode.Org.CANNOT_UPDATE_VISIBILITY_SETTING) };
        }
        break;
      }
      case DomainVisibilitySetting.VISIBLE_AUTO_APPROVE: {
        if (!hasAssociateDomains && !isMatchedPlan) {
          return { error: GraphErrorException.Forbidden('Can not update visibility setting', ErrorCode.Org.CANNOT_UPDATE_VISIBILITY_SETTING) };
        }
        if (
          hasAssociateDomains
          && (
            (organizationPaymentType === PaymentPlanEnums.BUSINESS && organizationPaymentPeriod === PaymentPeriodEnums.ANNUAL)
            || organizationPaymentType === PaymentPlanEnums.ENTERPRISE
          )
        ) {
          const totalOrgMember = await this.getTotalMemberInOrg(organization._id);
          if (totalOrgMember >= organization.payment.quantity) {
            return {
              error: GraphErrorException.Forbidden('Current size is equal to paid size', ErrorCode.Org.UPGRADE_MORE_SLOT_TO_USE_AUTO_APPROVE),
            };
          }
        }
        break;
      }
      default:
        break;
    }

    return { error: null };
  }

  async getNotificationToResend(params: {
    requestAccess: IRequestAccess, actor: User, invitedUser: User, organization: IOrganization
  }): Promise<INotification> {
    const {
      requestAccess, actor, invitedUser, organization,
    } = params;
    const receiverId = invitedUser._id;
    const notifications = await this.notificationService.getNotificationsByConditions({
      actionType: NotiOrg.INVITE_JOIN,
      'entity.entityId': organization._id,
      'target.targetData.invitationList._id': requestAccess._id,
    });
    const notificationIds = notifications.map((noti) => noti._id);
    const [foundNotificationUser] = await this.notificationService.getNotificationUsersByCondition(
      { notificationId: { $in: notificationIds }, userId: receiverId, tab: NotificationTab.INVITES },
    );
    const [foundNotification] = notifications.filter(
      (noti) => noti._id === foundNotificationUser?.notificationId?.toHexString(),
    );
    if (foundNotification) {
      return foundNotification;
    }
    const notiData = notiOrgFactory.create(NotiOrg.INVITE_JOIN, {
      actor: { user: actor, actorData: { type: APP_USER_TYPE.LUMIN_USER } },
      target: {
        user: invitedUser,
        targetData: {
          addedMemberIds: [receiverId],
          invitationList: [{ _id: requestAccess._id, email: requestAccess.actor }],
        },
      },
      entity: { organization },
    });
    return this.notificationService.createNotifications(notiData);
  }

  async resendOrgInvitationNotification(params: {
    requestAccess: IRequestAccess, actor: User, invitedUser: User, organization: IOrganization
  }): Promise<INotificationUser> {
    const {
      requestAccess, actor, invitedUser, organization,
    } = params;
    const receiverId = invitedUser._id;
    const notificationData = await this.getNotificationToResend({
      requestAccess, actor, invitedUser, organization,
    });
    const [invitedNotificationUser, updatedNotification] = await Promise.all([
      this.notificationService.updateNotificationUser(
        {
          notificationId: notificationData._id,
          userId: receiverId,
          tab: NotificationTab.INVITES,
        },
        {
          createdAt: new Date(),
        },
        { new: true, upsert: true },
      ),
      this.notificationService.updateNotification(
        {
          _id: notificationData._id,
        },
        {
          actor: {
            actorId: actor._id,
            actorName: actor.name,
            avatarRemoteId: actor.avatarRemoteId,
            actorData: {
              type: APP_USER_TYPE.LUMIN_USER,
            },
          },
        },
        { new: true },
      ),
    ]);
    this.notificationService.publishDeleteNotification([receiverId], { notificationId: updatedNotification._id, tab: NotificationTab.INVITES });
    const attachNotificationId = {
      _id: updatedNotification._id,
      is_read: false,
      tab: NotificationTab.INVITES,
      ...updatedNotification,
      createdAt: invitedNotificationUser.createdAt,
    } as IPublishNotification;
    const publishData = await this.notificationService.genPublishNotificationData(attachNotificationId);
    if (!invitedUser.newNotifications || !(invitedUser.newNotifications[NotificationTab.INVITES.toLowerCase()] instanceof Date)) {
      this.userService.setUserNotificationStatus({
        userId: receiverId,
        tab: NotificationTab.INVITES,
        time: new Date(Date.now() - 30000),
      });
    }
    this.notificationService.publishNewNotifications([receiverId], publishData);
    return invitedNotificationUser;
  }

  async filterValidMembers(orgId: string, members: InviteToOrganizationInput[]): Promise<InviteToOrganizationInput[]> {
    const inviteEmails = members.map((member) => member.email);
    // filter requested access
    const requestedAccesses = await this.getRequestAccessByCondition(
      { target: orgId, type: AccessTypeOrganization.INVITE_ORGANIZATION, actor: { $in: inviteEmails } },
      { actor: 1 },
    );
    const emailsWithoutRequest: string[] = inviteEmails.filter((inviteEmail) => !requestedAccesses.some(({ actor }) => actor === inviteEmail));
    const userIds = (await this.userService.findUserByEmails(emailsWithoutRequest, { _id: 1, email: 1 })).map((user) => new Types.ObjectId(user._id));

    // filter organization member
    const conditions = [
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          userId: { $in: userIds },
        },
      },
      {
        $project: {
          userId: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$_id', '$$userId'],
                    },
                  },
                ],
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];
    const orgMembers = await this.aggregateOrganizationMember(conditions);
    const filterEmails = emailsWithoutRequest.filter((email) => !orgMembers.some(({ user: { email: userEmail } }) => userEmail === email));
    return members.filter(({ email }) => filterEmails.includes(email));
  }

  countTotalActiveOrgMember(filter: FilterQuery<IOrganizationMember>): Promise<number> {
    return this.organizationMemberModel.find(filter).countDocuments().exec();
  }

  async migrateDocumentsForFreeUser(user: User, targetOrg?: IOrganization): Promise<DocumentMigrationResult & { destinationOrg?: IOrganization }> {
    let organization = await this.documentService.getDestinationWorkspace(user, { shouldCreateOrg: false });
    let isCreateNewOrg = false;
    if (!organization) {
      organization = await this.createCustomOrganization(user, { disableEmail: true, disableHubspot: true });
      isCreateNewOrg = true;
    }

    const destinationOrg: IOrganization = targetOrg || organization;

    this.userService.updateLastAccessedOrg(user._id, destinationOrg._id);

    const [totalDocument, totalFolder] = await Promise.all([
      this.documentService.migrateDocumentsToOrgPersonal(user._id, destinationOrg._id),
      this.folderService.migrateFoldersToOrgPersonal(user._id, destinationOrg._id),
    ]);

    await this.userService.updateUserPropertyById(user._id, {
      'metadata.isMigratedPersonalDoc': true,
    });

    const totalOrg = isCreateNewOrg ? 1 : 0;

    this.loggerService.info({
      context: 'migratePersonalWorkspace',
      userId: user._id,
      extraInfo: {
        totalOrg,
        totalDocument,
        totalFolder,
        destinationOrg: destinationOrg._id,
      },
    });

    this.redisService.setMigratedOrganizationUrl(user._id, destinationOrg.url);

    return {
      totalOrg,
      totalDocument,
      totalFolder,
      destinationOrg,
    };
  }

  createCustomOrganization(owner: User, options: CreateOrgOptions = {}): Promise<IOrganization> {
    const isPopularDomain = Utils.verifyDomain(owner.email);
    const domainVisibility = isPopularDomain ? DomainVisibilitySetting.INVITE_ONLY : DomainVisibilitySetting.VISIBLE_AUTO_APPROVE;
    const orgName = Utils.generateOrgNameByEmail(owner.email);

    return this.handleCreateCustomOrganization({
      creator: owner,
      orgName,
      organizationAvatar: null,
      settings: {
        domainVisibility,
      },
    }, options);
  }

  createPersonalFolderInOrg(input: CreateFolderInput & { ownerId: string; orgId?: string }): Promise<IFolder> {
    return this.folderService.createFolder(input);
  }

  async notifyCancelFreeTrial(organization: IOrganization): Promise<void> {
    const { _id, payment } = organization;
    const managers = await this.getOrganizationMemberByRole(
      _id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    );
    const managerEmails = managers.map((manager) => manager.email);

    this.emailService.sendEmailHOF(EMAIL_TYPE.CANCEL_FREE_TRIAL, managerEmails, { plan: PLAN_TEXT[payment.type] });
    this.publishUpdateOrganization(
      [],
      {
        orgId: _id,
        organization,
        type: SUBSCRIPTION_PAYMENT_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
  }

  checkIsUnlimitMemberPayment(plan: PaymentPlanEnums): boolean {
    return [
      PaymentPlanEnums.FREE,
      PaymentPlanEnums.ORG_STARTER,
      PaymentPlanEnums.ORG_PRO,
      PaymentPlanEnums.ORG_BUSINESS,
    ].includes(plan);
  }

  async deleteDefaultOrg(userId: string): Promise<void> {
    // Keep flag isDefault due to 4 days after delete account immediately prod
    const defaultOrg = await this.findOneOrganization({ ownerId: userId, isDefault: true });
    if (!defaultOrg) {
      return;
    }
    await this.deleteOrganization({ orgId: defaultOrg._id, actionType: ActionTypeEnum.DELETE_DEFAULT_ORG });
  }

  async removeInviteAndRequestJoinOrgNotifications(orgId: string): Promise<void> {
    const notifications = await this.notificationService.getNotificationsByConditions({
      actionType: { $in: [NotiOrg.INVITE_JOIN, NotiOrg.REQUEST_JOIN] },
      'entity.entityId': orgId,
    });
    notifications.forEach(async (noti) => {
      const notificationUsers = await this.notificationService.getNotificationUsersByCondition({
        notificationId: noti._id,
      });
      const userIds = notificationUsers.map((notificationUser) => notificationUser.userId);
      this.notificationService.removeMultiNotifications({
        notification: noti,
        userIds,
        tabs: noti.actionType === NotiOrg.INVITE_JOIN ? [NotificationTab.INVITES, NotificationTab.GENERAL] : [NotificationTab.GENERAL],
      });
    });
  }

  async getDocStackStorage(organization: IOrganization | Organization): Promise<DocStack> {
    const { _id: orgId, payment } = organization;
    const { type: plan } = payment;
    if ([PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(plan as PaymentPlanEnums)) {
      return null;
    }
    const { totalStack, totalUsed } = await this.organizationDocStackService.getDocStackInfo({ orgId, payment });

    return {
      totalUsed,
      totalStack,
    };
  }

  async removeRequestOrInviteOrg(user: User, orgId: string): Promise<void> {
    const [inviteOrganization] = await this.getRequestAccessByCondition({
      actor: user.email,
      target: orgId,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
    });
    if (inviteOrganization) {
      const [notification] = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'target.targetId': user._id,
        'entity.entityId': orgId,
      });
      if (notification) {
        const notificationUsers = await this.notificationService.getNotificationUsersByCondition({
          notificationId: notification._id,
        });
        const userIds = notificationUsers.map((notificationUser) => notificationUser.userId);
        this.notificationService.removeMultiNotifications({ notification, userIds, tabs: [NotificationTab.INVITES, NotificationTab.GENERAL] });
      }
    }

    const [requestOrganization] = await this.getRequestAccessByCondition({
      actor: user.email,
      target: orgId,
      type: AccessTypeOrganization.REQUEST_ORGANIZATION,
    });
    if (requestOrganization) {
      this.notificationService.removeRequestJoinOrgNotification({
        actorId: user._id,
        entityId: orgId,
      });
    }

    this.removeRequestAccess({
      actor: user.email,
      target: orgId,
      type: {
        $in: [AccessTypeOrganization.REQUEST_ORGANIZATION, AccessTypeOrganization.INVITE_ORGANIZATION],
      },
    });
  }

  async cancelUserSubsAfterCharge(user: User, orgId: string): Promise<boolean> {
    const hasUsingPremium = [
      PaymentPlanEnums.PROFESSIONAL,
      PaymentPlanEnums.PERSONAL,
    ].includes(user.payment.type as PaymentPlanEnums);
    if (!hasUsingPremium) {
      return false;
    }
    // We cancel individual premium subscription here.
    // Set to redis a key `migrate_user_documents_to_org:userId = orgId`
    // to indicate that user documents must be moved to that orgId instead of default org in payment controller hook.
    await this.paymentService.cancelStripeSubscription(user.payment.subscriptionRemoteId, null, { stripeAccount: user.payment.stripeAccountId });
    const key = `${RedisConstants.MIGRATE_USER_DOCUMENTS_TO_ORG_PREFIX}${user._id}`;
    this.redisService.setRedisData(key, orgId);

    return true;
  }

  async notifyRemoveAssociateDomain(organization: IOrganization, removedDomain: string): Promise<void> {
    const managerUsers = await this.findMemberWithRoleInOrg(
      organization._id,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
      { userId: 1 },
    );

    const notification = notiOrgFactory.create(NotiOrg.REMOVE_ASSOCIATE_DOMAIN, {
      entity: { organization, removedDomain },
    });
    const receiverIds = managerUsers.map(({ userId }) => userId);
    if (receiverIds.length) {
      this.notificationService.createUsersNotifications(
        notification,
        receiverIds,
      );

      // send out-app noti for mobile
      const {
        notificationContent: firebaseNotificationContent,
        notificationData: firebaseNotificationData,
      } = notiFirebaseOrganizationFactory.create(NotiOrg.REMOVE_ASSOCIATE_DOMAIN, {
        organization,
        removedDomain,
      });
      this.notificationService.publishFirebaseNotifications(
        receiverIds.map((objectId) => objectId.toHexString()),
        firebaseNotificationContent,
        firebaseNotificationData,
      );
    }
  }

  async transferOrganizationOwner(organization: IOrganization, actor: User): Promise<void> {
    const { _id: orgId } = organization;
    let targetUser;
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
    const transferredEmail = await this.redisService.getRedisValueWithKey(transferKey);
    if (transferredEmail) {
      const user = await this.userService.findUserByEmail(transferredEmail);
      const [{ role: organizationRole }] = await this.getMemberships({ orgId, userId: user._id }, 1);
      targetUser = { user, role: organizationRole };
    } else {
      targetUser = await this.getRandomMemberToTransfer(orgId);
    }
    // Delete organization when this org has only one member
    if (!targetUser) {
      await this.deleteOrganization({ orgId, actionType: ActionTypeEnum.DEACTIVE_USER_ACCOUNT });
      return;
    }

    const { user: transferUser, role } = targetUser;
    await Promise.all([
      this.updateMemberRoleInOrg({
        orgId,
        targetId: transferUser._id,
        newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        oldRole: role,
      }),
      this.updateOrganizationOwner(organization, transferUser),
      this.updateMemberRoleInOrg({
        orgId,
        targetId: actor._id,
        newRole: OrganizationRoleEnums.MEMBER,
        oldRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      }),
    ]);

    // Send noti & email
    this.sendTransferAdminNotiAndEmail({
      organization,
      newOwner: transferUser,
      oldOwner: actor,
      actorType: APP_USER_TYPE.LUMIN_USER,
    });
  }

  async getRandomMemberToTransfer(orgId: string): Promise<(Partial<{ user: User }> & { role: OrganizationRoleEnums })> {
    const [[billingModerator], [member]] = await Promise.all([
      this.getOrgMembershipByConditions({
        conditions: { orgId, role: OrganizationRoleEnums.BILLING_MODERATOR }, projection: { orgId: 1, userId: 1, role: 1 }, limit: 1,
      }),
      this.getOrgMembershipByConditions({
        conditions: { orgId, role: OrganizationRoleEnums.MEMBER }, projection: { orgId: 1, userId: 1, role: 1 }, limit: 1,
      }),
    ]);
    if (billingModerator) {
      const targetBilling = await this.userService.findUserById(billingModerator.userId as (string | Types.ObjectId));
      return {
        user: targetBilling,
        role: billingModerator.role as OrganizationRoleEnums,
      };
    }
    if (member) {
      const targetMember = await this.userService.findUserById(member.userId as (string | Types.ObjectId));
      return {
        user: targetMember,
        role: member.role as OrganizationRoleEnums,
      };
    }
    return null;
  }

  async cancelDefaultOrganizationSubscription(userId: string): Promise<void> {
    const organization = await this.findOneOrganization({ ownerId: userId });
    if (!organization) {
      return;
    }
    const { payment } = organization;
    const { subscriptionItems = [] } = payment;
    const isPremiumOrg = payment.type !== PaymentPlanEnums.FREE;
    const isPending = payment.status === PaymentStatusEnums.PENDING;
    const isTrialing = payment.status === PaymentStatusEnums.TRIALING;
    const updateSubscriptionItems = subscriptionItems.map((item) => ({
      ...item,
      paymentStatus: PaymentStatusEnums.CANCELED,
    }));
    let updatedPayment: PaymentSchemaInterface = {
      ...payment,
      status: PaymentStatusEnums.CANCELED,
      subscriptionItems: updateSubscriptionItems,
    };
    if (isTrialing) {
      const updatedOrg = await this.paymentService.cancelFreeTrial({
        targetId: organization._id,
        subscriptionRemoteId: payment.subscriptionRemoteId,
      });
      updatedPayment = updatedOrg.payment;
    }
    if (!isPremiumOrg) {
      return;
    }
    if (isPending) {
      await this.paymentService.cancelStripeSubscription(payment.subscriptionRemoteId, null, { stripeAccount: payment.stripeAccountId });
      return;
    }
    if (!isTrialing) {
      await this.paymentService.updateStripeSubscription(payment.subscriptionRemoteId, {
        cancel_at_period_end: true,
      }, { stripeAccount: payment.stripeAccountId });
    }
    this.userService.trackPlanAttributes(userId);
    await this.updateOrganizationProperty(
      organization._id,
      { payment: updatedPayment, 'settings.inviteUsersSetting': InviteUsersSettingEnum.ANYONE_CAN_INVITE },
    );
  }

  async leaveOrganizations(user: User): Promise<void> {
    const { _id: userId } = user;
    const organizationMembers = await this.getOrganizationMembers(userId);
    const promises = [];
    if (organizationMembers.length) {
      await Promise.all(
        organizationMembers.map(async ({ orgId, organization }) => {
          const { subscriptionItems = [] } = organization.payment || {};
          const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);
          return this.handleRemoveSeatRelateToSign({
            orgId, userIds: [userId], actor: user, signSubscription,
          });
        }),
      );
      await Promise.all(
        organizationMembers.map(async ({ orgId, organization }) => {
          const teams = await this.organizationTeamService.getOrgTeamsByUserId(orgId, userId);
          promises.push(
            this.deleteMemberInOrg(orgId, userId),
            this.documentService.removePermissionInGroupPermissions(userId, orgId),
            this.insertUnallowedAutoJoinList(userId, orgId),
            this.organizationTeamService.leaveOrgTeams({ teams, actor: user, orgId }),
            this.documentService.removeAllPersonalDocInOrg(user, orgId),
            this.folderService.removeAllPersonalFolderInOrg({ user, orgId }),
            this.folderService.transferAllFoldersInOrgWorkspace({ actorId: userId, orgId, targetId: organization.ownerId }),
            this.documentService.deleteRecentDocumentList({ userId, organizationId: orgId }),
            this.luminContractService.deleteDataInWorkspace({
              organization: OrganizationUtils.convertToOrganizationProto(organization),
              userId,
              action: 'leave_workspace',
            }),
          );
        }),
      );
    }
    const organizations = organizationMembers.map(({ organization }) => organization);
    organizations.forEach((organization) => promises.push(this.notifyLeaveOrg(user, organization)));
    await Promise.all(promises);
  }

  async getOrganizationMembers(userId: string | Types.ObjectId): Promise<(Partial<IOrganizationMember> & { organization: IOrganization })[]> {
    const conditions = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          role: { $in: [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.MEMBER] },
        },
      },
      {
        $project: {
          userId: 1,
          role: 1,
          orgId: 1,
          organization: 1,
        },
      },
      {
        $lookup: {
          from: 'organizations',
          let: {
            orgId: '$orgId',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$$orgId', '$_id'],
                    },
                  },
                ],
              },
            },
          ],
          as: 'organization',
        },
      },
      { $unwind: '$organization' },
    ];
    const organizationMembers = await
      this.aggregateOrganizationMember(conditions) as unknown as (Partial<IOrganizationMember> & { organization: IOrganization })[];
    return organizationMembers;
  }

  async removeRequestAccessDocumentNoti(userId: string, orgId?: string): Promise<void> {
    const conditions: FilterQuery<INotification> = {
      actionType: NotiDocument.REQUEST_ACCESS,
      'actor.actorId': userId,
    };

    if (orgId) {
      conditions['target.targetId'] = orgId;
    }

    const docRequestNotifications = await this.notificationService.getNotificationsByConditions(conditions);

    Promise.all(docRequestNotifications.map(async (notification) => {
      const notificationUsers = await this.notificationService.getNotificationUserByNotiId(notification._id);
      const receiverIds = notificationUsers.map((noti) => noti.userId);
      return this.notificationService.removeMultiNotifications({
        notification,
        userIds: receiverIds,
        tabs: [NotificationTab.REQUESTS],
      });
    }));
  }

  async removeRequestAccessOrgNoti(userId: string): Promise<void> {
    const conditions: FilterQuery<INotification> = {
      actionType: NotiOrg.REQUEST_JOIN,
      'actor.actorId': userId,
    };

    const orgRequestNotifications = await this.notificationService.getNotificationsByConditions(conditions);

    Promise.all(orgRequestNotifications.map(async (notification) => {
      const notificationUsers = await this.notificationService.getNotificationUserByNotiId(notification._id);
      const receiverIds = notificationUsers.map((noti) => noti.userId);
      return this.notificationService.removeMultiNotifications({
        notification,
        userIds: receiverIds,
        tabs: [NotificationTab.REQUESTS],
      });
    }));
  }

  async getMemberByJoinSort(getMemberInput: GetMemberInput & { internal?: boolean }, premiumSeatSet: Set<string>, requestSignSeatEmails: Set<string>)
    : Promise<OrganizationMemberConnection> {
    const {
      offset,
      limit,
      orgId,
      option,
      internal,
    } = getMemberInput;
    const sortStrategy = { createdAt: SortStrategy[option.joinSort] };
    const optionsPipeline = [
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          internal,
        },
      },
      {
        $project: {
          userId: 1,
          role: 1,
          createdAt: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          members: [
            { $sort: { ...sortStrategy } },
            { $skip: offset },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                let: {
                  userId: '$userId',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  },
                  {
                    $project: {
                      password: 0,
                      recentPasswords: 0,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },
          ],
        },
      },
    ];
    const [data] = await this.aggregateOrganizationMember(optionsPipeline);
    const { members, metadata } = data;
    const organizationMembers = members.map((member) => ({
      node: {
        role: member.role,
        lastActivity: member.user.lastLogin,
        joinDate: member.createdAt,
        user: {
          ...member.user,
          isSignProSeat: premiumSeatSet.has(member.user._id.toString()),
          isSeatRequest: requestSignSeatEmails.has(member.user.email),
        },
      },
    }));

    return {
      totalItem: metadata[0]?.total || 0,
      totalRecord: organizationMembers.length,
      edges: organizationMembers,
      pageInfo: {
        limit,
        offset,
      },
    };
  }

  async deleteMultipleOrgsExceptDefault(orgIds: string[]): Promise<{orgData: Partial<IOrganization>; success: boolean; error?: any}[]> {
    const nonDefaultOrgs = await this.findOrganization({ _id: { $in: orgIds }, isDefault: false });
    const deletedOrgs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const org of nonDefaultOrgs) {
      const orgId = org._id;
      const orgData = {
        _id: orgId,
        name: org.name,
        ownerId: org.ownerId,
        payment: org.payment,
      };
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.deleteOrganization({ orgId });
        deletedOrgs.push({ orgData, success: true });
      } catch (error) {
        deletedOrgs.push({ orgData, success: false, error });
      }
    }

    return deletedOrgs;
  }

  async transferOrgTeamsAndLeaveOrg(user: User, orgId: string): Promise<any> {
    const ownedTeams = await this.teamService.findTeamByOwner(user._id, { belongsTo: orgId });
    await Promise.all(this.adminService.deleteOwnedOrgTeams(ownedTeams, user));
    return this.handleMemberLeaveOrganization(user, orgId);
  }

  async handleMultipleMembersLeaveOrganizations(params: {
    memberships: IOrganizationMember[], members: User[]
  }): Promise<{ memberId: string, orgId: string, success: boolean, error?: any }[]> {
    const { memberships, members } = params;
    return Promise.all(memberships.map(({ userId, orgId }) => {
      const memberData = members.find((member) => member._id === userId.toHexString());
      const memberId = memberData._id;
      return this.transferOrgTeamsAndLeaveOrg(memberData, orgId)
        .then(() => ({ memberId, orgId, success: true }))
        .catch((error) => ({
          memberId, orgId, success: false, error,
        }));
    }));
  }

  async deleteRequestAccessAndInvitationOfUsers(params: {
    users: User[], excludeOrgId: string
  }): Promise<{
    actor: string, target: string, success: boolean, error?: any
  }[]> {
    const { users, excludeOrgId } = params;
    const memberEmails = users.map((member) => member.email);
    const requestAccess = await this.getRequestAccessByCondition({
      actor: { $in: memberEmails },
      target: { $ne: excludeOrgId },
      type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION] },
    });

    return Promise.all(requestAccess.map(({ actor, target }) => {
      const user = users.find(({ email }) => email === actor);
      return this.removeRequestOrInviteOrg(user, target)
        .then(() => ({ actor, target, success: true }))
        .catch((error) => ({
          actor, target, success: false, error,
        }));
    }));
  }

  async deleteAllRequestAccessAndInvitationToOrg(params: {
    organizationId: string, excludeUsers: string[]
  }): Promise<{
    actor: string, target: string, success: boolean, error?: any
  }[]> {
    const { excludeUsers, organizationId } = params;
    const requestAccess = await this.getRequestAccessByCondition({
      actor: { $nin: excludeUsers },
      target: organizationId,
      type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION] },
    });

    const actorEmails = [...new Set(requestAccess.map((request) => request.actor))];
    const actors = (await this.userService.findUserByEmails(actorEmails)).filter(Boolean);

    return Promise.all(requestAccess.map(({ actor, target }) => {
      const user = actors.find(({ email }) => email === actor);
      return this.removeRequestOrInviteOrg(user, target)
        .then(() => ({ actor, target, success: true }))
        .catch((error) => ({
          actor, target, success: false, error,
        }));
    }));
  }

  async handleMemberLeaveOrganization(user: User, orgId: string): Promise<void> {
    const shouldDeleteDefaultWorkspace = user.setting.defaultWorkspace?.toHexString() === orgId;
    if (shouldDeleteDefaultWorkspace) {
      await this.userService.findOneAndUpdate({ _id: user._id }, { $unset: { 'setting.defaultWorkspace': 1 } });
    }
    const organization = await this.getOrgById(orgId);
    const [teamIds, destinationOrg] = await Promise.all([
      this.organizationTeamService.getOrgTeamIdsOfUser(organization._id, user._id),
      this.getDestinationOrgToTransferAgreements(user, orgId),
    ]);
    await Promise.all([
      this.deleteMemberInOrg(orgId, user._id),
      this.documentService.removePermissionInGroupPermissions(orgId, user._id),
      this.insertUnallowedAutoJoinList(user._id, orgId),
      this.organizationTeamService.removeMembershipInTeams(teamIds, user._id, organization._id),
      this.documentService.removeAllPersonalDocInOrg(user, orgId),
      this.folderService.removeAllPersonalFolderInOrg({ user, orgId }),
      this.documentService.deleteRecentDocumentList({ userId: user._id, organizationId: orgId }),
      this.documentService.updateDocumentOwnerId({
        refId: orgId,
        oldOwnerId: user._id,
        ownerId: organization.ownerId,
        role: DocumentRoleEnum.ORGANIZATION,
      }),
      this.transferAgreementsToAnotherOrg({
        userId: user._id,
        organization,
        destinationOrg,
        actionType: ActionTypeOfUserInOrg.LEAVE_ORGANIZATION,
      }),
      this.handleRemoveSignSeatRequest({ orgId, userIds: [user._id] }),
      this.authService.unlinkSamlLoginService({ userId: user._id }),
    ]);
    this.userService.trackPlanAttributes(user._id);
    if (organization.payment.customerRemoteId) {
      this.paymentService.updateTotalMembersCustomerMetadata({
        orgId, customerRemoteId: organization.payment.customerRemoteId, stripeAccountId: organization.payment.stripeAccountId,
      });
    }

    this.notifyLeaveOrg(user, organization);

    this.publishUpdateOrganization(
      [user._id],
      {
        userId: user._id,
        orgId,
        organization,
        actor: user,
      },
      SUBSCRIPTION_REMOVE_ORG_MEMBER,
    );

    // [Hubspot] remove workspace contact association
    this.hubspotWorkspaceService.removeWorkspaceContactAssociation({
      orgId,
      contactEmail: user.email,
    });
  }

  async createDefaultOrganizationForOpeningTemplates(user: User) {
    const defaultOrganization = await this.findOneOrganization({ ownerId: user._id });
    if (!defaultOrganization && user.payment.type === PaymentPlanEnums.FREE) {
      await this.createCustomOrganization(user);
    }
  }

  async getPromptGoogleUsers({
    userId, organizationId, accessToken = '', forceUpdate = false, googleAuthorizationEmail = '',
  }: {
    googleAuthorizationEmail?: string, userId: string, organizationId: string, accessToken?: string, forceUpdate?: boolean,
  }): Promise<FindUserPayload[]> {
    const lastestAuthorizationEmail = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.LAST_AUTHORIZE_GOOGLE_EMAIL}:${userId}:${organizationId}`,
    );
    const lastAuthorizationEmail = googleAuthorizationEmail || lastestAuthorizationEmail;
    if (!lastAuthorizationEmail) {
      return [];
    }
    const fiveLastAccessDriveDoc = await this.documentService.aggregateDocument([
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          service: DocumentStorageEnum.GOOGLE,
          remoteEmail: lastAuthorizationEmail,
        },
      },
      {
        $lookup: {
          from: 'documentpermissions',
          let: { documentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$documentId', '$$documentId'] },
                refId: new Types.ObjectId(userId),
                'workspace.refId': new Types.ObjectId(organizationId),
                role: DocumentRoleEnum.OWNER,
              },
            },
          ],
          as: 'permissions',
        },
      },
      {
        $match: { 'permissions.0': { $exists: true } },
      },
      { $sort: { lastAccess: -1 } },
      { $limit: 5 },
    ]);
    const resultDocs = fiveLastAccessDriveDoc.map(({ _id, remoteId }) => ({ documentId: _id, remoteId }));
    let sharers: ISharer[] = [];
    const authorizeDomain = Utils.getEmailDomain(lastAuthorizationEmail);
    if (!forceUpdate) {
      const driveMetadatas = await this.documentService.getDocumentDrivesMetadata({
        documentId: { $in: resultDocs.map(({ documentId }) => documentId) },
      });
      sharers = driveMetadatas.flatMap((metadata) => metadata.sharers)
        .map((sharer) => (typeof sharer === 'string' ? ({ email: sharer }) : sharer))
        .filter(({ email }) => (!!email && email !== lastAuthorizationEmail && Utils.getEmailDomain(email) === authorizeDomain));
    }
    if (accessToken && forceUpdate) {
      sharers = await this.documentService.getDriveSharers({
        accessToken, documents: resultDocs, authorizationGoogleEmail: lastAuthorizationEmail,
      });
      await this.redisService.deleteRedisByKey(`${RedisConstants.LAST_AUTHORIZE_GOOGLE_EMAIL}:${userId}:${organizationId}`);
      this.redisService.setRedisDataWithExpireTime({
        key: `${RedisConstants.LAST_AUTHORIZE_GOOGLE_EMAIL}:${userId}:${organizationId}`,
        value: lastAuthorizationEmail,
        expireTime: CommonConstants.LAST_AUTHORIZED_EMAIL_EXPIRE_IN,
      });
    }
    if (!sharers.length) {
      return [];
    }
    return this.filterValidGoogleUsers(sharers, organizationId);
  }

  async filterValidGoogleUsers(sharers: ISharer[], organizationId: string): Promise<FindUserPayload[]> {
    const emails = uniq(sharers.map((sharer) => sharer.email));
    const { pendingUserEmails, activeUsers } = await this.groupPendingEmailAndValidUsers(emails, organizationId);
    if (pendingUserEmails.length >= CommonConstants.MAXIMUM_PROMPT_SHARED_DRIVE_USER) {
      return pendingUserEmails.map((email) => ({ email, isValid: false })).slice(0, CommonConstants.MAXIMUM_PROMPT_SHARED_DRIVE_USER as number);
    }
    const validUserIds = activeUsers.map((user) => user._id);
    const membersInOrg = await this.organizationMemberModel.find({
      orgId: organizationId,
      userId: { $in: validUserIds },
    });
    const usersNotInOrg = activeUsers.filter((user) => !membersInOrg.some((member) => member.userId.toHexString() === user._id))
      .slice(0, CommonConstants.MAXIMUM_PROMPT_SHARED_DRIVE_USER as number - pendingUserEmails.length);
    const invalidUsers = pendingUserEmails.map((email) => {
      const sharer = sharers.find((item) => item.email === email);
      return {
        email, remoteName: sharer?.name, avatarRemoteId: sharer?.avatar,
      };
    });
    const promptUserNotInOrg = usersNotInOrg.map(
      (user) => ({
        email: user.email, _id: user._id, name: user.name, avatarRemoteId: user.avatarRemoteId, status: SearchUserStatus.USER_VALID,
      }),
    );
    return [...invalidUsers, ...promptUserNotInOrg];
  }

  async groupPendingEmailAndValidUsers(shareEmails: string[], organizationId: string): Promise<{
    pendingUserEmails: string[], activeUsers: User[]
  }> {
    const blacklistAccounts = await this.blacklistService.findAll(BlacklistActionEnum.CREATE_NEW_ACCOUNT, shareEmails);
    const blacklistEmails = blacklistAccounts.map((blacklist) => blacklist.value);
    const orgInvites = await this.getRequestAccessByCondition({
      actor: { $in: shareEmails },
      target: organizationId,
      type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION] },
    });
    const inviteEmails = orgInvites.map((invite) => invite.actor);
    const validEmails = shareEmails.filter((email) => !inviteEmails.some((invite) => invite === email)
      && !blacklistEmails.some((blacklist) => blacklist === email));
    const users = await this.userService.findUserByEmails(validEmails);
    const activeUsers = users.filter((user) => !user.deletedAt);
    return { pendingUserEmails: validEmails.filter((email) => !users.some((user) => user.email === email)), activeUsers };
  }

  async notifyHitDocstack(organization: IOrganization) {
    const managerUsers = await this.findMemberWithRoleInOrg(
      organization._id,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
      { userId: 1 },
    );
    const managerIds = managerUsers.map(({ userId }) => userId.toHexString());
    const integrationNoti = integrationNotificationHandler({
      context: NotificationContext.Circle,
      type: OrganizationAction.ORG_HIT_DOC_STACK,
      data: {
        sendTo: managerIds,
        actor: {
          id: organization._id,
        },
        target: {
          circleName: organization.name,
        },
        data: {
          circleUrl: organization.url,
        },
      },
    });
    this.integrationService.sendNotificationToIntegration(integrationNoti);
  }

  async notifyTimeSensitiveCouponCreated({
    orgId,
    promotionCode,
    createdAt,
  }: {
    orgId: string;
    promotionCode: string;
    createdAt: number;
  }): Promise<void> {
    const managers = await this.findMemberWithRoleInOrg(
      orgId,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      { userId: 1 },
    );

    managers.forEach(({ userId }) => {
      this.pubSub.publish(`${SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED}.${orgId}.${userId.toHexString()}`, {
        [SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED]: {
          promotionCode,
          createdAt: new Date(createdAt),
        },
      });
    });
  }

  trackTimeSensitiveCouponVariationViewEvent({
    variationId,
    userId,
    orgId,
    anonymousUserId,
    userAgent,
  }: {
    variationId: number;
    userId: string;
    orgId: string;
    anonymousUserId?: string;
    userAgent?: string;
  }): void {
    this.pinpointService.add(new TimeSensitiveCouponVariationViewEvent({
      variationId,
      organizationId: orgId,
      LuminUserId: userId,
      anonymousUserId,
      userAgent,
    }));
  }

  async getGoogleUsersNotInCircle({
    organizationId, shareEmails,
  }: {
    organizationId: string, shareEmails: string[]
  }): Promise<FindUserPayload[]> {
    const sharers = shareEmails.map((email) => ({ email }));
    return this.filterValidGoogleUsers(sharers, organizationId);
  }

  async createFirstOrgOnFreeUser(user: User): Promise<IOrganization | null> {
    const orgList = await this.getOrgListByUser(user._id);
    const freeUser = user.payment.type === PaymentPlanEnums.FREE;
    if (orgList.length || !freeUser) {
      return null;
    }
    return this.createCustomOrganization(user);
  }

  validateExtraTrialDays(
    organization: IOrganization,
    days: number,
    extraTrialDaysInfo?: IExtraTrialDaysOrganization,
  ): { error?: GraphErrorException, canExtraTrial: boolean } {
    if (organization.payment.status !== PaymentStatusEnums.TRIALING) {
      return { error: GraphErrorException.BadRequest('Only trial circle can extra trial days'), canExtraTrial: false };
    }
    if ([PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(organization.payment.type as PaymentPlanEnums)) {
      return { error: GraphErrorException.BadRequest('Business and Enterprise plan cannot extra trial days'), canExtraTrial: false };
    }
    if (!extraTrialDaysInfo) {
      return { error: GraphErrorException.BadRequest('No action to extra trial days'), canExtraTrial: false };
    }
    const isExtendTrialDaysHigherMaxTrialDays = extraTrialDaysInfo.extendedTrialDays >= CommonConstants.MAXIMUM_TRIAL_DAYS_PER_REQUEST
      && days === CommonConstants.MAXIMUM_TRIAL_DAYS_PER_REQUEST;
    const isExtendTrialLowerMaxTrialDays = extraTrialDaysInfo.extendedTrialDays < CommonConstants.MAXIMUM_TRIAL_DAYS_PER_REQUEST
      && days === extraTrialDaysInfo.extendedTrialDays;
    const isValidInputDays = isExtendTrialDaysHigherMaxTrialDays || isExtendTrialLowerMaxTrialDays;
    if (!isValidInputDays) {
      return { error: GraphErrorException.BadRequest('Number of extra trial days is invalid'), canExtraTrial: false };
    }
    return { canExtraTrial: true };
  }

  async handleExtraTrialDaysLog(
    organization: IOrganization,
    action: ExtraTrialDaysOrganizationAction,
    extraTrialDaysInfo: IExtraTrialDaysOrganization,
    context: any,
  ): Promise<void> {
    const logMessage: LogMessage = { context: 'extraTrialDaysOrganization' };
    switch (action) {
      case ExtraTrialDaysOrganizationAction.INVITE_MEMBER: {
        const { additionalInfo } = extraTrialDaysInfo;
        if (additionalInfo) {
          const { invitedEmails, invitationIds } = additionalInfo;
          const users = await this.userService.findUserByEmails(invitedEmails);
          logMessage.extraInfo = {
            circleId: organization._id,
            extendedTrialDays: extraTrialDaysInfo.extendedTrialDays,
            trigger: action,
            additionalInfo: {
              inviterId: additionalInfo.inviterId,
              invitedIds: users.map((user) => user._id),
              totalInvited: invitedEmails.length,
              invitationIds,
            },
          };
        }
        break;
      }
      default:
        break;
    }
    this.loggerService.info({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...this.loggerService.getCommonAttributes(context.req),
      ...logMessage,
    });
  }

  async validateInviteMembers({
    organization,
    members,
    inviter,
  }: { organization: IOrganization, members: InviteToOrganizationInput[], inviter: User }): Promise<{
    error?: GraphErrorException,
  }> {
    const { settings } = organization;
    await this.userService.checkEmailInput(members.map((member) => member.email));
    const hasExistBillingModerator = members.some((member) => member.role === OrganizationRoleInvite.BILLING_MODERATOR);
    const { role: inviterRole } = await this.getMembershipByOrgAndUser(organization._id, inviter._id) || {};
    if (settings.inviteUsersSetting === InviteUsersSetting.ADMIN_BILLING_CAN_INVITE && inviterRole === OrganizationRoleEnums.MEMBER) {
      return {
        error: GraphErrorException.Forbidden(
          'You do not have permission to invite',
          ErrorCode.Org.CANNOT_INVITE_USER,
        ),
      };
    }
    if (
      settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE
      && hasExistBillingModerator
      && inviterRole === OrganizationRoleEnums.MEMBER
    ) {
      return {
        error: GraphErrorException.Forbidden(
          'You do not have permission to invite billing moderator',
          ErrorCode.Org.CANNOT_INVITE_USER,
        ),
      };
    }
    return {};
  }

  async inviteMemberToOrganization(
    members: InviteToOrganizationInput[],
    organization: IOrganization,
    user: User,
    extraTrial: boolean,
  ): Promise<{
    isHasInvalidInvites: boolean,
    updatedOrganization: IOrganization,
    invitations: OrganizationMemberInvitation[],
    sameDomainEmails: string[],
    notSameDomainEmails: string[],
  }> {
    const isOldOrganizationPlan = [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(organization.payment.type as PaymentPlanEnums);
    const uniqMembers: InviteToOrganizationInput[] = uniqBy(members, 'email');
    if (uniqMembers.length !== members.length) {
      throw GraphErrorException.BadRequest('Duplicate email found in invite list');
    }

    const { error } = await this.validateInviteMembers({ organization, members: uniqMembers, inviter: user });
    if (error) {
      throw error;
    }
    const totalOrgMember = await this.getTotalMemberInOrg(organization._id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actor = await this.userService.findUserById(user._id);
    const validatedMember = this.validateTotalMemberJoinOrg(uniqMembers.length, organization, totalOrgMember);
    if (!validatedMember.isAllow) {
      throw GraphErrorException.BadRequest(validatedMember.message, ErrorCode.Org.ORGANIZATION_MEMBER_EXCEEDED);
    }
    let updatedOrganization = organization;
    const validMembers = await this.filterValidMembers(organization._id, uniqMembers);

    const {
      invitedEmails,
      invitedLuminUsers,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    } = await this.inviteMemberToOrgWithDomainLogic({ actor, organization, validMembers });

    const redisKey = `${RedisConstants.CAN_EXTRA_TRIAL}${actor._id}-${organization._id}`;
    const canExtraTrial = await this.redisService.getRedisValueWithKey(redisKey);
    if (extraTrial && canExtraTrial) {
      const extraTrialDaysOrganizationInfo: IExtraTrialDaysOrganization = {
        circleId: organization._id,
        extendedTrialDays: invitedEmails.length < CommonConstants.MAXIMUM_TRIAL_DAYS_PER_REQUEST
          ? invitedEmails.length
          : CommonConstants.MAXIMUM_TRIAL_DAYS_PER_REQUEST,
        additionalInfo: {
          inviterId: actor._id,
          invitedEmails,
        },
      };
      this.redisService.setExtraTrialDaysOrganizationInfo(
        organization._id,
        ExtraTrialDaysOrganizationAction.INVITE_MEMBER,
        extraTrialDaysOrganizationInfo,
      );
      this.redisService.deleteRedisByKey(redisKey);
    }

    if (isOldOrganizationPlan) {
      updatedOrganization = await this.updatePaymentWhenInviteMember(
        organization,
        invitedEmails.length,
        totalOrgMember,
      );
    }

    this.updateContactListWhenInviteMember(actor._id, invitedLuminUsers.map((invitedLuminUser) => invitedLuminUser._id));

    // update auto approve
    const totalMemberAfterAdded = totalOrgMember + invitedEmails.length;
    const isUsingAutoApprove = organization.settings.domainVisibility === DomainVisibilitySetting.VISIBLE_AUTO_APPROVE;
    const shouldDisableAutoApprove = isUsingAutoApprove
      && !this.validateTotalMemberJoinOrg(1, organization, totalMemberAfterAdded).isAllow;

    if (shouldDisableAutoApprove) {
      updatedOrganization = await this.turnOffAutoApprove(organization._id);
    }

    // add requested member
    const requestJoinOrg = await this.getRequestAccessByCondition(
      { target: organization._id, actor: { $in: invitedEmails }, type: AccessTypeOrganization.REQUEST_ORGANIZATION },
    );
    if (requestJoinOrg.length) {
      await Promise.all(
        requestJoinOrg.map(async (request) => {
          this.addMemberToOrg({
            email: request.actor,
            organization,
            role: request.entity.role.toUpperCase() as OrganizationRoleInvite,
          });
          const approvedUser = invitedLuminUsers.find((invitedLuminUser) => invitedLuminUser.email === request.actor);
          await this.removeRequestOrInviteOrg(approvedUser, organization._id);
          this.notifyAcceptJoinOrg(approvedUser, actor, organization);
          this.notificationService.removeRequestJoinOrgNotification({
            actorId: approvedUser._id,
            entityId: organization._id,
          });
        }),
      );
    }

    return {
      isHasInvalidInvites: uniqMembers.length !== validMembers.length,
      updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    };
  }

  async inviteMemberToOrganizationAddDocStack({
    members,
    organization,
    user,
    extraTrial,
  }: {
    members: InviteToOrganizationInput[],
    organization: IOrganization,
    user: User,
    extraTrial: boolean,
  }): Promise<{
    isHasInvalidInvites: boolean,
    updatedOrganization: IOrganization,
    invitations: OrganizationMemberInvitation[],
    sameDomainEmails: string[],
    notSameDomainEmails: string[],
  }> {
    await this.organizationDocStackQuotaService.validateIncreaseDocStackQuota({ organization });

    const {
      isHasInvalidInvites,
      updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    } = await this.inviteMemberToOrganization(members, organization, user, extraTrial);

    await this.organizationDocStackQuotaService.increaseDocStackQuota({
      organization,
      totalIncrease: invitations.length,
    });

    return {
      isHasInvalidInvites,
      updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    };
  }

  public async inviteMemberToOrgWithDomainLogic({
    actor,
    organization,
    validMembers,
    options,
  }: {
    actor: User,
    organization: IOrganization,
    validMembers: InviteToOrganizationInput[],
    options?: {
      isCreatingOrgFlow?: boolean;
    },
  }): Promise<{
    invitedEmails: string[],
    invitedLuminUsers: User[],
    invitations: OrganizationMemberInvitation[],
    sameDomainEmails: string[],
    notSameDomainEmails: string[],
    addedMembers: InviteToOrganizationInput[],
  }> {
    let invitedEmails: string[] = [];
    let invitedLuminUsers: User[] = [];
    let invitations: OrganizationMemberInvitation[] = [];

    const luminUsers = await this.userService.findUserByEmails(validMembers.map(({ email }) => email));

    const actorEmailDomain = Utils.getEmailDomain(actor.email);
    const [addMembers, inviteMembers] = validMembers.reduce((acc, currentValue) => {
      const { email: inviteEmail } = currentValue;
      const canAddMember = actorEmailDomain === Utils.getEmailDomain(inviteEmail)
            && !Utils.verifyDomain(inviteEmail)
            && luminUsers.find((user) => user.isVerified && user.email === inviteEmail);
      const idx = canAddMember ? 0 : 1;
      acc[idx].push(currentValue);
      return acc;
    }, [[], []] as InviteToOrganizationInput[][]);

    // for auto add member to org (without approve) case
    if (addMembers.length) {
      await Promise.all(
        addMembers.map(async (invite) => {
          await this.addMemberToOrg({
            email: invite.email,
            organization,
            role: invite.role,
            options: {
              skipHubspotWorkspaceAssociation: true,
              skipWorkspaceSizeChangedEvent: options?.isCreatingOrgFlow,
            },
          });
        }),
      );

      // [Hubspot] add workspace contact associations for invited members
      if (!options?.isCreatingOrgFlow) {
        const hubspotAssociations = addMembers.map(({ email, role }) => ({
          contactEmail: email,
          orgRole: role.toLowerCase() as unknown as OrganizationRoleEnums,
        }));
        this.hubspotWorkspaceService.batchAddWorkspaceContactAssociations({
          orgId: organization._id,
          associations: hubspotAssociations,
        });
      }

      const autoApproveLuminUsers = luminUsers.filter((user) => addMembers.find(({ email }) => email === user.email));
      const autoApproveEmails = addMembers.map((invite) => invite.email);

      this.sendMailToInvitedUser({
        actor,
        organization,
        emails: autoApproveEmails,
        existedUsers: autoApproveLuminUsers,
        isNeedApprove: false,
      });
      await this.notifyInviteToOrgSameDomain({
        actor,
        organization,
        receiverEmails: autoApproveEmails,
        actorType: APP_USER_TYPE.LUMIN_USER,
      });

      invitedEmails = [...invitedEmails, ...autoApproveEmails];
      invitedLuminUsers = [...invitedLuminUsers, ...autoApproveLuminUsers];
      invitations = [...invitations, ...(addMembers.map((member) => ({ memberEmail: member.email })))];
    }

    // for invite member to org (need approve) case
    if (inviteMembers.length) {
      const invitedList = await Promise.all(inviteMembers.map(async (member) => this.handleUserInviteMemberToOrg({
        actor,
        organization,
        member,
      })));

      const validInvitedList = invitedList.filter(Boolean);
      if (validInvitedList.length === 0) {
        throw GraphErrorException.BadRequest('Can not invite member to organization', ErrorCode.Org.CANNOT_ADD_MEMBER_TO_ORGANIZATION);
      }

      const validEmails = invitedList.map((item) => item.actor);
      const validUsers = luminUsers.filter((user) => validEmails.find((email) => email === user.email));
      const validIds = validUsers.map((member) => member._id);

      const rejectedUserIds = await this.blacklistService.distinct(
        'metadata.rejectedUserId',
        { actionType: BlacklistActionEnum.INVITE_USER, value: organization._id, 'metadata.rejectedUserId': { $in: validIds } },
      );

      const rejectedUsers = validUsers.filter(({ _id }) => rejectedUserIds.includes(_id));

      const validRequests = validInvitedList.filter(({ actor: requestEmail }) => !rejectedUsers.some(({ email }) => email === requestEmail));
      const validRequestEmails = validRequests.map((invited) => invited.actor);
      const validRequestSameDomainEmails = Utils.getSameUnpopularDomainEmails(actorEmailDomain, validRequestEmails);
      const validRequestNotSameDomainEmails = validRequestEmails.filter((email) => !validRequestSameDomainEmails.includes(email));
      if (validRequests.length) {
        await this.notifyInviteToOrg({
          actor,
          organization,
          memberList: validRequests,
          actorType: APP_USER_TYPE.LUMIN_USER,
        });
        this.sendMailToInvitedUser({
          actor,
          organization,
          emails: validRequestNotSameDomainEmails,
          existedUsers: validUsers,
        });
        this.sendMailToInvitedUser({
          actor,
          organization,
          emails: validRequestSameDomainEmails,
          existedUsers: validUsers,
          isNeedApprove: false,
        });
      }

      invitedEmails = [...invitedEmails, ...validEmails];
      invitedLuminUsers = [...invitedLuminUsers, ...validUsers];
      invitations = [...invitations, ...(validInvitedList.map(({ _id, actor: _actor }) => ({ invitationId: _id, memberEmail: _actor })))];
    }

    const sameDomainEmails = Utils.getSameUnpopularDomainEmails(actorEmailDomain, invitedEmails);
    const notSameDomainEmails = invitedEmails.filter((email) => !sameDomainEmails.includes(email));

    return {
      invitedEmails,
      invitedLuminUsers,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
      addedMembers: addMembers,
    };
  }

  public async notifyInviteToOrgSameDomain({
    actor,
    organization,
    receiverEmails,
    actorType,
  }: {
    actor: User;
    organization: IOrganization;
    receiverEmails: string[];
    actorType: APP_USER_TYPE;
  }): Promise<void> {
    const members = await this.userService.findUserByEmails(receiverEmails);
    const memberIds = members.map((member) => member._id);

    // send notification for members
    const memberNotification = notiOrgFactory.create(NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN, {
      actor: { user: actor, actorData: { type: actorType } },
      target: {
        user: members[0],
      },
      entity: { organization },
    });
    await this.notificationService.createUsersNotifications(memberNotification, memberIds, NotificationTab.GENERAL);

    // send notification for managers
    const managerNotification = notiOrgFactory.create(NotiOrg.INVITE_JOIN, {
      actor: { user: actor, actorData: { type: actorType } },
      target: {
        user: members[0],
      },
      entity: { organization },
    });
    const orgManager = await this.findMemberWithRoleInOrg(
      organization._id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    );
    const managerIds = orgManager
      .map(({ userId }: { userId: Types.ObjectId }) => userId.toHexString())
      .filter((userId) => userId !== actor._id && !memberIds.includes(userId));
    await this.notificationService.createUsersNotifications(managerNotification, managerIds, NotificationTab.GENERAL);

    await this.sendFirstMemberInviteCollaboratorNoti({ organization, actor, managerIds });

    if (memberIds.length <= 0) return;

    // send out app noti
    const notificationForMember = notiFirebaseOrganizationFactory.create(NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN, {
      actor,
      organization,
      targetUser: members[0],
      actorType,
    });
    this.notificationService.publishFirebaseNotifications(
      memberIds.filter((m, index) => index !== 0),
      notificationForMember.notificationContent,
      notificationForMember.notificationData,
    );
    this.notificationService.publishFirebaseNotifications(
      [members[0]._id],
      notificationForMember.notificationContentForTargetUser,
      notificationForMember.notificationData,
    );

    // send out app noti
    const notificationForAdmin = notiFirebaseOrganizationFactory.create(NotiOrg.INVITE_JOIN, {
      actor,
      organization,
      targetUser: members[0],
      actorType,
    });
    this.notificationService.publishFirebaseNotifications(
      managerIds,
      notificationForAdmin.notificationContent,
      notificationForAdmin.notificationData,
    );
  }

  public async addUserToOrgsWithSameDomain(user: User): Promise<string[]> {
    const { _id: userId, email } = user;
    const listInvite = await this.getInviteOrgList({
      actor: email,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
    });
    const listOrgIds: string[] = [];
    if (listInvite.length) {
      await Promise.all(
        listInvite.map(async (invite) => {
          // the invite without inviterId of the admin creates a Circle with a member list case
          let inviterEmail = '';
          if (invite.inviterId) {
            const inviter = await this.userService.findUserById(invite.inviterId, { email: 1 });
            inviterEmail = inviter?.email;
          } else {
            const [orgAdmin] = await this.findMemberWithRoleInOrg(invite.target, OrganizationRoleEnums.ORGANIZATION_ADMIN, { userId: 1 });
            const inviter = await this.userService.findUserById(orgAdmin.userId as Types.ObjectId, { email: 1 });
            inviterEmail = inviter?.email;
          }

          const isSameUnpopularDomain = inviterEmail && Utils.checkSameUnpopularDomainEmail(inviterEmail, email);

          if (isSameUnpopularDomain) {
            const orgData = await this.getOrgById(invite.target);
            const memberData = {
              userId,
              email,
              orgId: invite.target,
              internal: Utils.isInternalOrgMember(email, orgData),
              role: invite.entity.role,
            };
            const membership = await this.handleAddMemberToOrg(memberData);
            listOrgIds.push(invite.target);

            if (membership) {
              const [requestAccess] = await this.getRequestAccessByCondition({
                actor: email,
                type: AccessTypeOrganization.INVITE_ORGANIZATION,
                target: membership.orgId,
              });
              await this.removeRequestAccess({
                actor: email,
                type: AccessTypeOrganization.INVITE_ORGANIZATION,
                target: membership.orgId,
              });
              const [notification] = await this.notificationService.getNotificationsByConditions({
                actionType: NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN,
                'entity.entityId': membership.orgId,
                'target.targetData.invitationList._id': requestAccess._id,
              });
              if (notification) {
                this.notificationService.removeNotification(notification, user._id);
              }
            }
          }
        }),
      );
    }

    return listOrgIds;
  }

  async handleMembersOfFreeCircleChangeSubscription({
    organization,
    actor,
    paymentMethodId,
    isStartTrial,
  } : {
    organization: IOrganization;
    actor: User;
    paymentMethodId: string;
    isStartTrial?: boolean;
  }): Promise<void> {
    const orgMembership = await this.getMembershipByOrgAndUser(organization._id, actor._id);
    const shouldGrantUserAdminRole = (orgMembership.role as OrganizationRoleEnums) === OrganizationRoleEnums.MEMBER;
    const { customerRemoteId, stripeAccountId } = organization.payment;
    if (shouldGrantUserAdminRole) {
      // auto grant the actor to 'Admin' role
      await this.updateMemberRoleInOrg({
        orgId: organization._id,
        targetId: actor._id,
        oldRole: OrganizationRoleEnums.MEMBER,
        newRole: OrganizationRoleEnums.BILLING_MODERATOR,
      });
      // remove the previous Circle’s payment card (if any)
      if (Boolean(customerRemoteId) && Boolean(stripeAccountId)) {
        await this.paymentService.removePaymentMethodsFromCustomer({
          customerRemoteId,
          stripeAccountId,
          except: paymentMethodId,
        }).catch((error) => {
          this.loggerService.error({
            context: this.paymentService.removePaymentMethodsFromCustomer.name,
            error: error.message || error,
            extraInfo: {
              customerRemoteId,
              stripeAccountId,
              exceptPaymentMethodId: paymentMethodId,
            },
          });
        });
      }
      // notify to Circle's managers
      this.notifyMembersOfFreeCircleChangeSubscription({
        organization,
        actor,
        isStartTrial,
      });
    }
  }

  async notifyMembersOfFreeCircleChangeSubscription({
    organization,
    actor,
    isStartTrial,
  }: {
    organization: IOrganization;
    actor: User;
    isStartTrial?: boolean;
  }): Promise<void> {
    const orgMemberships = await this.getOrganizationMemberByRole(
      organization._id,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
    );
    const receiverIdList: string[] = orgMemberships
      .map((user) => user._id)
      .filter((userId) => userId !== actor._id);

    const notiType = isStartTrial ? NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL : NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION;
    const notification = notiOrgFactory.create(
      notiType,
      {
        actor: { user: actor },
        target: null,
        entity: { organization },
      },
    );
    this.notificationService.createUsersNotifications(notification, receiverIdList);

    // send email to org admins
    const receiverEmails = orgMemberships
      .map((user) => user.email)
      .filter((userEmail) => userEmail !== actor.email);
    const subject = SUBJECT[EMAIL_TYPE.MEMBER_GRANTED_TO_ADMIN_WHEN_UPGRADE_SUBSCRIPTION.description]
      .replace('#{actorName}', actor.name)
      .replace('#{orgName}', organization.name);
    const emailData = {
      actorName: actor.name,
      encodedActorEmail: encodeURIComponent(encodeURIComponent(actor.email)),
      orgId: organization._id,
      orgName: organization.name,
      isStartTrial,
      subject,
    };
    this.emailService.sendEmail(
      EMAIL_TYPE.MEMBER_GRANTED_TO_ADMIN_WHEN_UPGRADE_SUBSCRIPTION,
      receiverEmails,
      emailData,
    );

    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseOrganizationFactory.create(notiType, {
      actor,
      organization,
    });
    this.notificationService.publishFirebaseNotifications(receiverIdList, firebaseNotificationContent, firebaseNotificationData);
  }

  async getPromptInviteUsersBanner({
    userId,
    organization,
    accessToken,
    forceUpdate,
    googleAuthorizationEmail = '',
  }: {
    userId: string,
    organization: IOrganization,
    accessToken: string,
    forceUpdate: boolean,
    googleAuthorizationEmail?: string,
  }): Promise<PromptInviteBannerPayload> {
    const { _id: organizationId } = organization;
    const member = await this.getMembershipByOrgAndUser(organizationId, userId);
    const isMember = member?.role === OrganizationRoleEnums.MEMBER;
    const anyoneCanInvite = organization.settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;
    const canInviteMember = anyoneCanInvite || !isMember;
    const pendingRequests = await this.getOrgRequestingMembers(organizationId, [AccessTypeOrganization.REQUEST_ORGANIZATION]);
    if (pendingRequests.length && !isMember) {
      const pendingUsers = pendingRequests.map((pendingUser) => ({
        email: pendingUser.email, name: pendingUser.name, avatarRemoteId: pendingUser.avatarRemoteId,
      }));
      return {
        bannerType: PromptInviteBannerType.PENDING_REQUEST,
        inviteUsers: pendingUsers,
      };
    }
    if (!canInviteMember) {
      throw GraphErrorException.Forbidden('You do not have permission to invite', ErrorCode.Org.CANNOT_INVITE_USER);
    }
    const googleUsers = await this.getPromptGoogleUsers({
      userId,
      organizationId,
      accessToken,
      forceUpdate,
      googleAuthorizationEmail,
    });
    if (!googleUsers.length) {
      return {
        bannerType: PromptInviteBannerType.INVITE_MEMBER,
        inviteUsers: [],
      };
    }
    return {
      bannerType: PromptInviteBannerType.GOOGLE_CONTACT,
      inviteUsers: googleUsers,
    };
  }

  async getSuggestedUsersToInvite({
    userId,
    organization,
    accessToken,
    forceUpdate,
    googleAuthorizationEmail,
  }: {
    userId: string,
    organization: IOrganization,
    accessToken: string,
    forceUpdate: boolean,
    googleAuthorizationEmail?: string,
  }): Promise<GetSuggestedUserToInvitePayload> {
    const { _id: organizationId } = organization;
    const member = await this.getMembershipByOrgAndUser(organizationId, userId);
    const isMember = (member?.role as OrganizationRoleEnums) === OrganizationRoleEnums.MEMBER;
    const onlyAdminCanInvite = organization.settings.inviteUsersSetting === InviteUsersSetting.ADMIN_BILLING_CAN_INVITE;
    if (onlyAdminCanInvite && isMember) {
      throw GraphErrorException.Forbidden('You do not have permission to invite', ErrorCode.Org.CANNOT_INVITE_USER);
    }

    const googleUsers = await this.getPromptGoogleUsers({
      userId,
      organizationId,
      accessToken,
      forceUpdate,
      googleAuthorizationEmail,
    });

    if (!googleUsers.length) {
      return {
        suggestedUsers: [],
      };
    }

    return {
      suggestedUsers: googleUsers,
    };
  }

  async getSuggestedPremiumOrganization({
    user,
    targetDomain,
  }: {
    user: User;
    targetDomain: string;
  }): Promise<SuggestedPremiumOrganization[]> {
    const joinedAndRequestedOrgs = await this.getJoinedAndRequestedOrgs(user);
    return this.getSuggestedPremiumOrgForCampaign({ user, targetDomain, excludedIds: joinedAndRequestedOrgs });
  }

  async getOrganizationJoinStatus(user: User, organizations: IOrganization[]): Promise<Map<string, JoinOrganizationStatus>> {
    const organizationIds = organizations.map(({ _id }) => _id);
    const requestAccesses = await this.requestAccessModel.find({
      actor: user.email,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
      target: { $in: organizationIds },
    }, null, null);

    const AccessTypeToJoinStatus = {
      [AccessTypeOrganization.INVITE_ORGANIZATION]: JoinOrganizationStatus.PENDING_INVITE,
    };
    const VisibilityToJoinStatus = {
      [DomainVisibilitySetting.VISIBLE_AUTO_APPROVE]: JoinOrganizationStatus.CAN_JOIN,
      [DomainVisibilitySetting.VISIBLE_NEED_APPROVE]: JoinOrganizationStatus.CAN_REQUEST,
    };
    return new Map(
      organizations.map(({ _id, settings }) => {
        const requestAccess = requestAccesses.find((request) => request.target === _id);
        const status = requestAccess ? AccessTypeToJoinStatus[requestAccess.type] : VisibilityToJoinStatus[settings.domainVisibility];
        return [_id, status];
      }),
    );
  }

  async updateManyOrganizations(query: FilterQuery<IOrganization>, update: UpdateQuery<IOrganization>) {
    return this.organizationModel.updateMany(query, update);
  }

  getOrgRoleText(role: string): string {
    const roleText = {
      [OrganizationRoleEnums.BILLING_MODERATOR]: 'Admin',
      [OrganizationRoleEnums.ORGANIZATION_ADMIN]: 'Circle Owner',
      [OrganizationRoleEnums.MEMBER]: 'Member',
    };
    return roleText[role] || 'Member';
  }

  async updateSettingForCanceledBusinessPlan({
    paymentType,
    paymentStatus,
    organization,
  } : {
    paymentType: PaymentPlanEnums;
    paymentStatus: PaymentStatusEnums;
    organization: IOrganization
  }) {
    const {
      _id: orgId, name, associateDomains, settings,
    } = organization;
    const isCanceledBusinessPlan = paymentType === PaymentPlanEnums.ORG_BUSINESS
      && (paymentStatus === PaymentStatusEnums.CANCELED || paymentStatus === PaymentStatusEnums.TRIALING);
    if (!isCanceledBusinessPlan || settings.domainVisibility === DomainVisibilitySetting.VISIBLE_AUTO_APPROVE || !associateDomains.length) {
      return;
    }

    try {
      const updatedOrganization = await this.updateOrganizationById(orgId, {
        'settings.domainVisibility': DomainVisibilitySetting.VISIBLE_AUTO_APPROVE,
      });

      const orgMemberships = await this.getOrganizationMemberByRole(
        orgId,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      );
      const receiverIds = orgMemberships.map((user) => user._id);

      const notification = notiOrgFactory.create(NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY, {
        entity: { organization: updatedOrganization },
      });
      this.notificationService.createUsersNotifications(notification, receiverIds);

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseOrganizationFactory.create(NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY, {
        organization,
      });
      this.notificationService.publishFirebaseNotifications(
        receiverIds,
        notificationContent,
        notificationData,
      );

      const receiverEmails = orgMemberships.map((user) => user.email);
      const subject = SUBJECT[EMAIL_TYPE.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY.description];
      const emailData = {
        orgId,
        orgName: name,
        listDomain: associateDomains.join(', '),
        subject,
      };
      this.emailService.sendEmail(
        EMAIL_TYPE.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY,
        receiverEmails,
        emailData,
      );
    } catch (error) {
      this.loggerService.error({
        context: this.updateSettingForCanceledBusinessPlan.name,
        error,
        extraInfo: { orgId },
      });
    }
  }

  public getDefaultValueInviteUsersSetting(payment: PaymentPlanEnums): InviteUsersSettingEnum {
    return [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE, PaymentPlanEnums.ORG_BUSINESS].includes(payment)
      ? InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE : InviteUsersSettingEnum.ANYONE_CAN_INVITE;
  }

  public async checkMembershipsPermission({
    targetId,
    target,
    userIds,
  }: {
    targetId: string;
    target: 'team' | 'org';
    userIds: string[];
  }): Promise<boolean[]> {
    if (target === 'org') {
      const organizationMembers = await this.organizationMemberModel
        .find({ orgId: targetId, userId: { $in: userIds } })
        .exec();
      return userIds.map((userId) => Boolean(organizationMembers.find((item) => item.userId.toHexString() === userId)));
    }
    const memberships = await this.membershipService.find({
      teamId: targetId,
      userId: { $in: userIds },
    });
    return userIds.map((userId) => Boolean(memberships.find((item) => item.userId.toHexString() === userId)));
  }

  public async getRepresentativeMembers({
    user,
    teamId,
    orgId,
  }: {
    user: User;
    teamId?: string;
    orgId: string;
  }): Promise<User[]> {
    const targetId = teamId || orgId;
    const target = teamId ? 'team' : 'org';

    const [isValidMembership] = await this.checkMembershipsPermission({ targetId, target, userIds: [user._id] });

    if (!isValidMembership) {
      throw GraphErrorException.Forbidden('Do not have permission');
    }

    const totalActiveMembers = await (
      teamId
        ? this.membershipService.countTeamMember(teamId)
        : this.countTotalActiveOrgMember({ orgId })
    );
    if (!totalActiveMembers) {
      return [];
    }

    if (totalActiveMembers <= MEMBERS_THRESHOLD_AMOUNT_FOR_REPRESENTATION) {
      const memberList = await this.getRepresentativeMembersByTeamOrOrg({
        targetId,
        target,
        options: {
          limit: MEMBERS_THRESHOLD_AMOUNT_FOR_REPRESENTATION,
        },
      });

      if (memberList.length <= MAX_REPRESENTATIVE_MEMBERS + 1) {
        return memberList.sort((member) => (member.avatarRemoteId ? -1 : 1));
      }

      const membersHasAvatar = memberList.filter((member) => Boolean(member.avatarRemoteId)).slice(0, MAX_REPRESENTATIVE_MEMBERS);

      if (membersHasAvatar.length === MAX_REPRESENTATIVE_MEMBERS) {
        return membersHasAvatar;
      }

      if (membersHasAvatar.length > 0 && membersHasAvatar.length < MAX_REPRESENTATIVE_MEMBERS) {
        const gapAmount = MAX_REPRESENTATIVE_MEMBERS - membersHasAvatar.length;
        const membersWithoutAvatar = memberList.filter((member) => !member.avatarRemoteId);

        let count = 0;
        while (count < gapAmount) {
          membersHasAvatar.push(membersWithoutAvatar[count]);
          count++;
        }
        return membersHasAvatar;
      }

      return memberList.slice(0, MAX_REPRESENTATIVE_MEMBERS);
    }

    const redisKey = `${RedisConstants.REPRESENTATIVE_MEMBERS}${targetId}`;
    const stringifiedValue = await this.redisService.getRedisValueWithKey(redisKey);
    const memberIds = (stringifiedValue ? JSON.parse(stringifiedValue) : []) as string[];
    const userHasAvatar = Boolean(user.avatarRemoteId);

    if (memberIds.length) {
      // This check is used to validate user permissions on a team or organization, or to determine if user has been deleted.
      // Then remove that user ID in the list.
      let shouldUpdateList = false;
      const results = await this.checkMembershipsPermission({ targetId, target, userIds: memberIds });
      results.forEach((value, index) => {
        if (!value) {
          shouldUpdateList = true;
          memberIds.splice(index, 1);
        }
      });
      if (shouldUpdateList) {
        const ttl = await this.redisService.getKeyTTL(redisKey);
        this.redisService.setRedisDataWithExpireTime({
          key: redisKey,
          value: JSON.stringify(memberIds),
          expireTime: ttl > 0 ? ttl : CommonConstants.REPRESENTATIVE_MEMBERS_EXPIRE_IN,
        });
      }
    }

    const isExistedMemberId = memberIds.find((memberId) => memberId === user._id);
    if (!isExistedMemberId && userHasAvatar && memberIds.length < MAX_REPRESENTATIVE_MEMBERS) {
      memberIds.push(user._id);
      this.redisService.setRedisDataWithExpireTime({
        key: redisKey,
        value: JSON.stringify([...new Set(memberIds)]),
        expireTime: CommonConstants.REPRESENTATIVE_MEMBERS_EXPIRE_IN,
      });
    }

    if (memberIds.length === MAX_REPRESENTATIVE_MEMBERS) {
      const memberList = await this.userService.findUserByIds(memberIds);
      return memberList;
    }

    const memberList = await this.getRepresentativeMembersByTeamOrOrg({
      targetId,
      target,
      options: {
        limit: MAX_REPRESENTATIVE_MEMBERS,
      },
    });

    return memberList.sort((member) => (member.avatarRemoteId ? -1 : 1));
  }

  async removeRequestAccessAndNotification({
    requestAccess,
    organization,
  }: {
    requestAccess: IRequestAccess;
    organization: IOrganization;
  }): Promise<void> {
    const invitedUser = await this.userService.findUserByEmail(requestAccess.actor);
    if (invitedUser) {
      const notifications = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'entity.entityId': organization._id,
        'target.targetData.invitationList._id': requestAccess._id,
      });
      const notificationIds = notifications.map((noti) => noti._id);
      const [foundNotificationUser] = await this.notificationService.getNotificationUsersByCondition(
        { notificationId: { $in: notificationIds }, userId: invitedUser._id, tab: NotificationTab.INVITES },
      );
      const [foundNotification] = notifications.filter(
        (noti) => noti._id === foundNotificationUser?.notificationId?.toHexString(),
      );
      if (foundNotification) {
        await this.notificationService.removeNotification(foundNotification, invitedUser._id);
      }
    }
    await this.removeRequestAccess({
      target: organization._id,
      type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION] },
      actor: requestAccess.actor,
    });
    await this.redisService.removeInviteToken(requestAccess.actor, organization._id);
  }

  async getOrgsOfUserWithRole(userId: string): Promise<IOrganizationWithRole[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $sort: {
          'organization.createdAt': -1,
        },
      },
      {
        $project: {
          organization: { $arrayElemAt: ['$organization', 0] },
          role: '$role',
        },
      },
    ];
    const memberships = await this.aggregateOrganizationMember<IOrganizationWithRole & { _id: Types.ObjectId }>(pipeline);
    if (memberships.some((org) => !org.organization)) {
      this.loggerService.error({
        context: this.getOrgsOfUserWithRole.name,
        error: 'Memberships does not match any organizations',
        extraInfo: {
          userId,
          membershipIds: memberships
            .filter(({ organization }) => !organization)
            .map(({ _id }) => _id.toHexString()),
        },
      });
    }

    // Duplicated memberships with the same organization will be removed
    const seenIds = new Set();
    const uniqueMemberships = memberships
      .filter(({ organization }) => organization)
      .filter((membership) => {
        const orgId = membership.organization._id.toHexString();
        if (seenIds.has(orgId)) {
          this.loggerService.error({
            context: this.getOrgsOfUserWithRole.name,
            error: 'Duplicated memberships with same organization',
            extraInfo: { userId, orgId },
          });
          return false;
        }
        seenIds.add(orgId);
        return true;
      });

    uniqueMemberships.forEach((membership) => {
      const organization = membership.organization as IOrganization & { premiumSignSeats?: number };
      organization._id = membership.organization._id.toHexString();
      organization.isRestrictedBillingActions = this.isRestrictedBillingActions(membership.organization._id);
    });

    return uniqueMemberships;
  }

  async getExtraOrganizationInfos({
    organizations,
    user,
    options,
  }: {
    organizations: IOrganization[];
    user: User;
    options?: {
      withOwner?: boolean;
    };
  }): Promise<any[]> {
    const { withOwner = true } = options || {};
    const orgIds = organizations.map((org) => org._id.toString());
    const [totalMembersResults, allMembersResults, organizationJoinStatus, owner] = await Promise.all([
      this.getTotalMembersInOrgs(orgIds, { limit: 99 }),
      this.getAllMembersByOrganizations(orgIds, { limit: 4 }),
      this.getOrganizationJoinStatus(user, organizations),
      withOwner ? this.getOwnerOfOrganizations(organizations) : null,
    ]);
    const totalMembersMap = new Map(totalMembersResults);
    const allMembersMap = new Map(allMembersResults);
    const ownerMap = new Map(owner || []);

    return organizations.map((organization) => {
      const orgId = organization._id.toString();
      const orgOwner = ownerMap.get(orgId);
      return {
        ...organization,
        totalMember: totalMembersMap.get(orgId),
        members: allMembersMap.get(orgId),
        joinStatus: organizationJoinStatus.get(orgId),
        owner: orgOwner ? {
          email: orgOwner.email,
        } : null,
      };
    });
  }

  async getJoinedAndRequestedOrgs(user: User): Promise<string[]> {
    const [joinedOrgList, requestedOrgList] = await Promise.all([
      this.getMembershipOrgByUserId(user._id),
      this.getRequestAccessByCondition({
        actor: user.email,
        type: AccessTypeOrganization.REQUEST_ORGANIZATION,
      }),
    ]);
    const joinedOrgIds = joinedOrgList.map(({ orgId }) => orgId);
    const requestedOrgIds = requestedOrgList.map(({ target }) => target);
    return [...joinedOrgIds, ...requestedOrgIds];
  }

  async getSuggestedPremiumOrgForCampaign({
    user,
    targetDomain,
    excludedIds,
  }: {
    user: User;
    targetDomain: string;
    excludedIds: string[];
  }): Promise<SuggestedPremiumOrganization[]> {
    const isUserUsingPremium = await this.userService.isAvailableUsePremiumFeature(user);
    if (isUserUsingPremium) {
      return [];
    }
    const pipeline: PipelineStage[] = [
      {
        $match: {
          associateDomains: targetDomain,
          _id: { $nin: excludedIds.map((id) => new Types.ObjectId(id)) },
          'payment.type': { $ne: PaymentPlanEnums.FREE },
          'settings.domainVisibility': { $ne: DomainVisibilitySetting.INVITE_ONLY },
          unallowedAutoJoin: { $ne: user._id },
        },
      },
      {
        $addFields: {
          paymentStatusPriority: { $indexOfArray: [[PaymentStatusEnums.TRIALING, PaymentStatusEnums.ACTIVE], '$payment.status'] },
          paymentTypePriority: {
            $indexOfArray: [[
              PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE, PaymentPlanEnums.ORG_STARTER,
              PaymentPlanEnums.ORG_PRO, PaymentPlanEnums.ORG_BUSINESS,
            ], '$payment.type'],
          },
          paymentPeriodPriority: { $indexOfArray: [[PaymentPeriodEnums.MONTHLY, PaymentPeriodEnums.ANNUAL], '$payment.period'] },
        },
      },
      {
        $sort: {
          paymentStatusPriority: -1,
          paymentTypePriority: -1,
          paymentPeriodPriority: -1,
        },
      },
      {
        $limit: SUGGESTED_PREMIUM_ORG_CAMPAIGN_LIMIT,
      },
      {
        $lookup: {
          from: 'organizationmembers',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $limit: SUGGESTED_ORG_MAX_MEMBERS + SUGGESTED_ORG_MEMBERS_WITH_AVATAR },
            { $project: { userId: 1 } },
          ],
          as: 'members',
        },
      },
      {
        $addFields: { estimateTotalMember: { $size: '$members' } },
      },
      {
        $addFields: {
          memberIds: { $slice: ['$members.userId', SUGGESTED_ORG_MEMBERS_WITH_AVATAR] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
        },
      },
    ];

    const organizations = (await this.organizationModel.aggregate<
      IOrganization
      & { _id: Types.ObjectId }
      & { members: [User & { _id: Types.ObjectId }] }
      & { estimateTotalMember: number; }
    >(pipeline)).map((org) => ({ ...org, _id: org._id.toHexString() }));

    const joinStatus = await this.getOrganizationJoinStatus(user, organizations);

    return organizations.map((organization) => ({
      _id: organization._id,
      name: organization.name,
      url: organization.url,
      avatarRemoteId: organization.avatarRemoteId,
      domainVisibility: organization.settings.domainVisibility,
      paymentStatus: organization.payment.status,
      paymentType: organization.payment.type as PaymentPlanSubscription,
      paymentPeriod: organization.payment.period as PaymentPeriod,
      joinStatus: joinStatus.get(organization._id),
      members: organization.members,
      totalMember: organization.estimateTotalMember,
    }));
  }

  async getUsersInvitableToOrg({
    orgId,
    userEmails,
  }: {
    orgId: string;
    userEmails: Email[];
  }): Promise<Email[]> {
    const uniqueUserEmails: Email[] = uniq(userEmails);
    const users = await this.userService.findUserByEmails(uniqueUserEmails, { _id: 1, email: 1 });
    const [memberships, requestAccessList] = await Promise.all([
      users.length ? this.getMemberships({ orgId, userId: { $in: users.map(({ _id }) => _id) } }, 0, { userId: 1 }) : [],
      this.getRequestAccessByCondition({
        actor: { $in: uniqueUserEmails },
        target: orgId,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
      }, { actor: 1 }),
    ]);
    const membershipsSet = new Set(memberships.map((membership) => membership.userId.toHexString()));
    const userEmailsInOrg = users.filter(({ _id }) => membershipsSet.has(_id)).map((user) => user.email);
    const requestAccessListSet = new Set(requestAccessList.map((requestAccess) => requestAccess.actor));
    const userEmailsInvitedToOrg = uniqueUserEmails.filter((email) => requestAccessListSet.has(email));
    const luminUserEmailsNotInvitableToOrgSet = new Set([...userEmailsInOrg, ...userEmailsInvitedToOrg]);
    return uniqueUserEmails.filter((email) => !luminUserEmailsNotInvitableToOrgSet.has(email));
  }

  getCanUseMultipleMerge(organization: IOrganization): boolean {
    const { payment } = organization;
    return planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getCanUseMultipleMerge();
  }

  async getRecentDocumentList({
    user,
    organization,
    input,
  }: {
    user: User;
    organization: IOrganization;
    input: IGetRecentDocumentListInput;
  }): Promise<GetDocumentPayload> {
    const { query, filter } = input;

    if (query.searchKey || filter.lastModifiedFilterCondition || filter.ownedFilterCondition) {
      throw new Error('Search key and filter are not supported in recent tab');
    }
    const [documents, recentDocumentList] = await Promise.all([
      this.documentService.getPopulatedRecentDocumentList({
        userId: user._id, organizationId: organization._id, limit: query.minimumQuantity, cursor: query.cursor,
      }),
      this.documentService.getRecentDocumentList(user._id, organization._id),
    ]);

    if (!documents.length || !recentDocumentList) {
      return {
        documents,
        cursor: '',
        hasNextPage: false,
        total: 0,
      };
    }

    const total = recentDocumentList.documents.length;
    const lastDocument = documents[documents.length - 1];

    const hasNextPage = new Date(lastDocument.openedAt) > new Date(recentDocumentList.documents[total - 1].openedAt);
    return {
      documents,
      cursor: String(new Date(lastDocument.openedAt).getTime()),
      hasNextPage,
      total,
    };
  }

  async getOrganizationResources(
    user: User,
    organization: IOrganization,
    input: WithRequired<GetOrganizationResourcesInput, 'limit'>,
  ): Promise<GetOrganizationResourcesPayload> {
    const userTeams = await this.teamService.getUserTeams(user, organization);

    const [cursorType, cursor] = input.cursor?.split('_') || [];
    const prevDocCursor = cursorType === 'doc' ? cursor : undefined;
    const prevFolderCursor = cursorType === 'folder' ? cursor : undefined;

    if (prevDocCursor) {
      const { results: documents, cursor: nextCursor, total: totalDocs } = await this.documentService.getOrganizationDocuments(
        user,
        organization,
        userTeams,
        { ...input, cursor: prevDocCursor },
      );
      return {
        folders: [],
        documents,
        cursor: nextCursor ? `doc_${nextCursor}` : '',
        total: totalDocs,
      };
    }

    const { results: folders, cursor: folderCursor, total: totalFolder } = await this.folderService.getOrganizationFolder(
      user,
      organization,
      userTeams,
      { ...input, cursor: prevFolderCursor },
    );

    if (folderCursor) {
      return {
        folders,
        documents: [],
        cursor: folderCursor ? `folder_${folderCursor}` : null,
        total: totalFolder,
      };
    }

    const remainingLimit = input.limit - folders.length;
    const { results: documents, cursor: documentsCursor, total: totalDocs } = await this.documentService
      .getOrganizationDocuments(
        user,
        organization,
        userTeams,
        { ...input, limit: remainingLimit, cursor: prevDocCursor },
      );

    return {
      folders,
      documents,
      cursor: documentsCursor ? `doc_${documentsCursor}` : '',
      total: totalDocs + totalFolder,
    };
  }

  async bulkInviteMembersFromCsv(input: BulkInviteMembersFromCsvInput): Promise<void> {
    const {
      orgId, inviterId, csvPath, role = OrganizationRoleInvite.MEMBER,
    } = input;

    const organization = await this.getOrgById(orgId);
    const inviter = await this.userService.findUserById(inviterId);

    let dataByString = '';
    const stream = (await this.awsService.getFileFromTemporaryBucket(csvPath)).Body as Readable;
    stream.on('data', (buf: Buffer) => {
      dataByString = dataByString.concat(buf.toString());
    });

    stream.on('close', () => {
      const userEmails = dataByString.split('\n');

      // add associate domains for org
      const memberDomains = [...new Set(userEmails.map((email) => Utils.getEmailDomain(email)))];
      const newDomains = difference(memberDomains, organization.associateDomains);
      if (newDomains.length) {
        newDomains.map((domain) => this.addAssociateDomain({ organization, associateDomain: domain, skipMemberDomainValidation: true }));
      }

      const emailChunks = chunk(userEmails, 10);
      const inviteMembersToOrganizationByChunk = async (index: number) => {
        const members = emailChunks[index].map((email) => ({ email, role } as InviteToOrganizationInput));

        await this.executeBatchInviteWithLogging({
          organization,
          inviter,
          members,
          context: 'bulk-invite-members-from-csv',
        });

        if (index < emailChunks.length - 1) {
          setTimeout(() => inviteMembersToOrganizationByChunk(index + 1), 1000);
        }
      };
      inviteMembersToOrganizationByChunk(0);
    });
  }

  async executeBatchInviteWithLogging(input: {
    organization: IOrganization,
    inviter: User,
    members: InviteToOrganizationInput[],
    context: string
  }): Promise<void> {
    const {
      organization, inviter, members, context,
    } = input;
    const result = await this.inviteMemberToOrganization(members, organization, inviter, false);

    const memberEmails = members.map((member) => member.email);
    const successInvites = result.invitations.map((invitation) => invitation.memberEmail);
    const failedInvites = difference(memberEmails, successInvites);

    try {
      const batchId = uuid();
      const batchInfo = {
        batchId,
        organizationId: organization._id,
        inviterId: inviter._id,
        totalInvites: members.length,
        successfulInvites: successInvites.length,
        failedInvites,
      };

      this.awsService.logDataMigrationBatch({
        migrationName: context,
        batchId,
        batchInfo,
        batchError: failedInvites.length ? {
          message: 'Some invites failed to process',
          failedEmails: failedInvites,
        } : {},
      });
    } catch (error) {
      this.loggerService.error({
        context,
        error,
      });
    }
  }

  async estimateMentionableMembers({ orgId }: { orgId: string }): Promise<number> {
    const estimatedCount = await this.organizationMemberModel.countDocuments({
      orgId,
    }, { limit: MAX_MEMBERS_FOR_PARTIAL_MENTION });
    return estimatedCount;
  }

  isOrgOrTeamAdmin(membershipRole: OrganizationRoleEnums | OrganizationTeamRoles): boolean {
    return [
      OrganizationRoleEnums.ORGANIZATION_ADMIN,
      OrganizationRoleEnums.BILLING_MODERATOR,
      OrganizationTeamRoles.ADMIN,
    ].includes(membershipRole);
  }

  // This logic to support Lumin-sign select workspace for migration
  async getDestinationWorkspaceToMigrate(userId: string): Promise<IOrganization> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const orgsWithOwnerNAdminRole = await this.getOrgMembershipByConditions({
      conditions: {
        userId,
        role: { $in: [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR] },
      },
    });
    if (!orgsWithOwnerNAdminRole.length) {
      const organization = await this.createCustomOrganization(user);
      return organization;
    }
    const orgIds = orgsWithOwnerNAdminRole.map((org) => org.orgId);
    const membershipByOrgId = orgsWithOwnerNAdminRole.reduce((acc, org) => {
      acc[org.orgId] = org;
      return acc;
    }, {});
    const organizations = await this.findOrganization({ _id: { $in: orgIds } });
    const orgsWithMemberRole = organizations.map((organization) => {
      const membership = membershipByOrgId[organization._id];
      return {
        organization,
        role: membership.role as OrganizationRoleEnums,
      };
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    orgsWithMemberRole.sort((current, next) => OrganizationUtils.sortedByRoleAndPlan({
      currentOrg: current,
      nextOrg: next,
    }));
    const destinationWorkspace = orgsWithMemberRole[0];
    return destinationWorkspace.organization;
  }

  promptToJoinTrialingOrg({
    userId,
    organization,
  }: {
    userId: string;
    organization: IOrganization;
  }): void {
    const { settings, associateDomains } = organization;
    if (
      associateDomains.length
      && [DomainVisibilitySetting.VISIBLE_AUTO_APPROVE, DomainVisibilitySetting.VISIBLE_NEED_APPROVE].includes(settings.domainVisibility)
    ) {
      this.brazeService.promptToJoinTrialingOrg(organization);
      associateDomains.forEach((domain) => {
        this.messageGateway.server.to(`user-room-${domain}`).emit(
          SOCKET_MESSAGE.PROMPT_TO_JOIN_TRIALING_ORG,
          { userId, organization },
        );
      });
    }
  }

  getOrgIdOfDocument(belongsTo: BelongsTo): string {
    const { workspaceId, location, type } = belongsTo;
    switch (type) {
      case LocationType.PERSONAL:
        return workspaceId;
      case LocationType.ORGANIZATION:
        return location._id;
      case LocationType.ORGANIZATION_TEAM:
        return location.ownedOrgId;
      default:
        return '';
    }
  }

  async transferAgreementsToAnotherOrg({
    userId,
    organization,
    destinationOrg,
    actionType,
  }: {
    userId: string,
    organization: IOrganization,
    destinationOrg: IOrganization,
    actionType: ActionTypeOfUserInOrg,
  }): Promise<{ existAgreement: boolean, existAgreementGenDocuments: boolean }> {
    const user = await this.userService.findUserById(userId);

    const [{ existAgreement }, { existAgreementGenDocuments }] = await Promise.all([
      this.luminContractService.transferAgreementsToAnotherOrg({
        userId,
        organization: OrganizationUtils.convertToOrganizationProto(organization),
        destinationOrgId: destinationOrg._id,
        actionType,
      }),
      this.luminAgreementGenService.transferAgreementGenDocumentsToAnotherOrg({
        userId,
        organization: OrganizationUtils.convertToOrganizationProto(organization),
        destinationOrgId: destinationOrg._id,
        actionType,
      }),
    ]);
    if (actionType === ActionTypeOfUserInOrg.LEAVE_ORGANIZATION && (existAgreement || existAgreementGenDocuments)) {
      const notiTransferAgreementInOrg = notiOrgFactory.create(NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG, {
        actor: { user },
        entity: { organization },
        target: {
          organization: destinationOrg,
          targetData: {
            existAgreement,
            existAgreementGenDocuments,
          },
        },
      });
      await this.notificationService.createUsersNotifications(notiTransferAgreementInOrg, [userId], NotificationTab.GENERAL);
    }
    return { existAgreement, existAgreementGenDocuments };
  }

  async getFoldersAvailability({
    userId,
    orgId,
  }: {
    userId: string;
    orgId: string;
  }): Promise<GetFoldersAvailabilityPayload> {
    const teamList = await this.teamService.find(
      { belongsTo: orgId },
      { _id: 1 },
    );
    const teamIds = teamList.map(({ _id }) => _id);
    const [organization, personal, teams] = await Promise.all([
      this.folderService.findOneFolderPermission(
        undefined,
        { refId: orgId, role: FolderRoleEnum.ORGANIZATION },
        { _id: 1 },
      ),
      this.folderService.findOneFolderPermission(
        undefined,
        {
          refId: userId,
          role: FolderRoleEnum.OWNER,
          'workspace.refId': orgId,
          'workspace.type': DocumentWorkspace.ORGANIZATION,
        },
        { _id: 1 },
      ),
      this.folderService.findFolderPermissionsByCondition(
        {
          refId: { $in: teamIds },
          role: FolderRoleEnum.ORGANIZATION_TEAM,
        },
        { refId: 1 },
      ),
    ]);

    const teamsHasFolders = Array.from(
      new Set(teams.map((team) => team.refId.toHexString())),
    );

    return {
      personal: Boolean(personal),
      organization: Boolean(organization),
      teams: teamsHasFolders,
    };
  }

  async getDestinationOrgToTransferAgreements(user: User, excludeOrgId: string): Promise<IOrganization> {
    const orgMembership = await this.getOrgMembershipByConditions({
      conditions: {
        userId: user._id,
        orgId: { $ne: excludeOrgId },
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      },
    });
    const orgIds = orgMembership.map((org) => org.orgId);
    const orgs = await this.getOrgListByUser(user._id, {
      filterQuery: {
        $and: [
          {
            $or: [
              { deletedAt: { $exists: false } },
              { deletedAt: { $eq: null } },
            ],
          },
          {
            _id: { $in: orgIds },
          },
        ],
      },
    });
    if (!orgs.length) {
      return this.handleCreateCustomOrganization({
        creator: user,
        orgName: Utils.generateOrgNameByEmail(user.email),
      });
    }
    const defaultWorkspaceId = user.setting.defaultWorkspace;
    const defaultWorkspace = Boolean(defaultWorkspaceId)
      && orgs.find((org) => org._id === defaultWorkspaceId.toHexString());
    if (defaultWorkspace) {
      return defaultWorkspace;
    }
    const mainOrg = orgs.find(
      (_org) => _org.creationType === OrganizationCreationTypeEnum.AUTOMATIC,
    );
    if (mainOrg) {
      return mainOrg;
    }
    const lastAccessOrgId = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${user._id}`,
    );
    const lastAccessOrg = orgs.find((org) => org._id === lastAccessOrgId);
    if (lastAccessOrg) {
      return lastAccessOrg;
    }
    const transformedOrgs = orgs.map((org) => ({
      organization: org,
    }));
    transformedOrgs.sort((current, next) => OrganizationUtils.sortedByRoleAndPlan({
      currentOrg: current,
      nextOrg: next,
      enableSortByRole: false,
    }));
    return transformedOrgs[0].organization;
  }

  async migrateNewTermsOfUseForKeyCustomers(orgIds: string[]): Promise<void> {
    this.loggerService.info({
      context: this.migrateNewTermsOfUseForKeyCustomers.name,
      message: 'Starting migration of new terms of use for key customers',
      extraInfo: {
        totalOrganizations: orgIds.length,
        organizationIds: orgIds,
      },
    });

    // chunk orgIds into batches of 10 items
    const orgIdBatches = chunk(orgIds, 10);

    const handleForEachBatch = async (batch: string[], batchIndex: number) => {
      this.loggerService.info({
        context: this.migrateNewTermsOfUseForKeyCustomers.name,
        message: `Processing batch ${batchIndex + 1}/${orgIdBatches.length}`,
        extraInfo: {
          batchIndex: batchIndex + 1,
          totalBatches: orgIdBatches.length,
          organizationIds: batch,
        },
      });

      await Promise.all(batch.map(async (orgId, orgIndex) => {
        this.loggerService.info({
          context: this.migrateNewTermsOfUseForKeyCustomers.name,
          message: `Processing organization ${orgIndex + 1}/${batch.length} in batch ${batchIndex + 1}`,
          extraInfo: {
            orgId,
            batchIndex: batchIndex + 1,
            orgIndex: orgIndex + 1,
            totalInBatch: batch.length,
          },
        });

        const cursor = this.organizationMemberModel.find({ orgId }, { userId: 1 }).cursor({ batchSize: 100 });

        let processedMembers = 0;
        let updatedUsers = 0;
        let skippedUsers = 0;
        let errorCount = 0;

        await cursor.eachAsync(async (member) => {
          try {
            const user = await this.userService.findUserById(member.userId);
            if (!user || user.metadata.acceptedTermsOfUseVersion === this.environmentService.getByKey(EnvConstants.TERMS_OF_USE_VERSION)) {
              skippedUsers++;
              return;
            }
            await this.userService.acceptNewTermsOfUse(user._id);
            updatedUsers++;
          } catch (error) {
            errorCount++;
            this.loggerService.error({
              context: this.migrateNewTermsOfUseForKeyCustomers.name,
              error,
              extraInfo: {
                orgId,
                userId: member.userId,
                batchIndex: batchIndex + 1,
                orgIndex: orgIndex + 1,
              },
            });
          } finally {
            processedMembers++;
            await new Promise((resolve) => { setTimeout(resolve, 5000); });
          }
        }, { parallel: 10 });

        this.loggerService.info({
          context: this.migrateNewTermsOfUseForKeyCustomers.name,
          message: `Completed processing organization ${orgId}`,
          extraInfo: {
            orgId,
            batchIndex: batchIndex + 1,
            orgIndex: orgIndex + 1,
            totalMembers: processedMembers,
            updatedUsers,
            skippedUsers,
            errorCount,
          },
        });
      }));
    };

    await Promise.all(orgIdBatches.map(async (batch, batchIndex) => {
      await handleForEachBatch(batch, batchIndex);
    }));

    this.loggerService.info({
      context: this.migrateNewTermsOfUseForKeyCustomers.name,
      message: 'Completed migration of new terms of use for key customers',
      extraInfo: {
        totalOrganizations: orgIds.length,
        totalBatches: orgIdBatches.length,
      },
    });
  }

  async isWebChatbotFlagOn({ user, organization }: { user: User, organization: IOrganization }): Promise<boolean> {
    const isEnableDocumentIndexing = await this.featureFlagService.getFeatureIsOn({
      user,
      organization,
      featureFlagKey: FeatureFlagKeys.WEB_AI_CHATBOT,
    });
    return isEnableDocumentIndexing;
  }

  async prepareTeamDocumentIndexing({ user, team, organization }: { user: User, team: ITeam, organization: IOrganization }): Promise<void> {
    const { payment } = organization;
    if (payment.type as PaymentPlanEnums === PaymentPlanEnums.FREE) {
      return;
    }
    const { metadata } = team;
    const { hasProcessedIndexingDocuments } = metadata || {};
    if (hasProcessedIndexingDocuments) {
      return;
    }
    const isEnableDocumentIndexing = await this.featureFlagService.getFeatureIsOn({
      user,
      featureFlagKey: FeatureFlagKeys.WEB_AI_CHATBOT,
    });
    const isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(user);
    if (!isEnableDocumentIndexing || isTermsOfUseVersionChanged) {
      return;
    }

    const rules = this.customRuleLoader.getRulesForUser(user);
    if (rules.files.allowIndexing === false) {
      return;
    }

    const docPermissions = await this.documentService.getTeamDocumentPermissions(team._id);
    const documentIds = docPermissions.map((permission) => permission.documentId);
    const documents = await this.documentService.getDocumentsToIndex(documentIds);
    const documentIndexingPreparations = (
      await Promise.all(
        documents.map(async (document) => this.documentIndexingBacklogService.genDocumentIndexingBacklogData(
          document,
          docPermissions.find((permission) => permission.documentId.toString() === document._id),
          organization,
        )),
      )
    ).filter(Boolean);
    const insertedDocs = await this.documentIndexingBacklogService.createDocumentIndexingBacklogBulk(documentIndexingPreparations, documents);
    if (insertedDocs.length) {
      await this.documentService.setDocumentIndexingStatus(insertedDocs.map((doc) => doc.documentId), DocumentIndexingStatusEnum.PROCESSING);
    }

    await this.organizationTeamService.updateTeamById(team._id, {
      $set: {
        'metadata.hasProcessedIndexingDocuments': true,
      },
    });
  }

  async prepareOrgDocumentIndexing(user: User, organization: IOrganization): Promise<void> {
    const isEnableDocumentIndexing = await this.featureFlagService.getFeatureIsOn({
      user,
      featureFlagKey: FeatureFlagKeys.WEB_AI_CHATBOT,
    });
    const isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(user);
    if (!isEnableDocumentIndexing || isTermsOfUseVersionChanged) {
      return;
    }

    const rules = this.customRuleLoader.getRulesForUser(user);
    if (rules.files.allowIndexing === false) {
      return;
    }

    const { payment } = organization;

    if (payment.type as PaymentPlanEnums === PaymentPlanEnums.FREE) {
      await this.prepareRecentDocumentIndexing(user, organization);
    } else {
      await this.prepareAllDocumentIndexing(user, organization);
    }
  }

  async prepareRecentDocumentIndexing(user: User, organization: IOrganization): Promise<void> {
    const { metadata: userMetadata } = user || {};
    const { processedIndexingRecentDocuments } = userMetadata || {};
    if (processedIndexingRecentDocuments.includes(organization._id)) {
      return;
    }
    const recentDocuments = await this.documentService.getRecentDocumentList(user._id, organization._id);
    if (!recentDocuments || !recentDocuments.documents.length) {
      return;
    }
    const documentIds = recentDocuments.documents
      .slice(0, DOCUMENT_INDEXING_FREE_ORG_DOCUMENT_LIMIT)
      .map((document) => document._id.toHexString());
    const [documents, documentPermissions] = await Promise.all([
      this.documentService.getDocumentsToIndex(documentIds),
      this.documentService.getDocumentPermissionByConditions({
        documentId: { $in: documentIds },
      }),
    ]);
    const documentIndexingPreparations = (
      await Promise.all(
        documents.map(async (document) => this.documentIndexingBacklogService.genDocumentIndexingBacklogData(
          document,
          documentPermissions.find(
            (permission) => permission.documentId.toString() === document._id,
          ),
          organization,
        )),
      )
    ).filter(Boolean);
    const insertedDocs = await this.documentIndexingBacklogService.createDocumentIndexingBacklogBulk(documentIndexingPreparations, documents);
    if (insertedDocs.length) {
      await this.documentService.setDocumentIndexingStatus(insertedDocs.map((doc) => doc.documentId), DocumentIndexingStatusEnum.PROCESSING);
    }
    await this.userService.updateUserPropertyById(user._id, {
      'metadata.processedIndexingRecentDocuments': [...processedIndexingRecentDocuments, organization._id],
    });
  }

  async preparePersonalDocumentsIndexing(user: User, organization: IOrganization): Promise<void> {
    const { metadata: userMetadata } = user || {};
    const { hasProcessedIndexingDocuments: userHasProcessedIndexingDocuments } = userMetadata || {};
    if (userHasProcessedIndexingDocuments) {
      return;
    }
    const docPermissions = await this.documentService.getPersonalOrgDocumentPermissions(user._id, organization._id);
    if (!docPermissions.length) {
      return;
    }
    const documents = await this.documentService.getDocumentsToIndex(docPermissions.map((permission) => permission.documentId));
    const documentIndexingPreparations = (
      await Promise.all(
        documents.map(async (document) => this.documentIndexingBacklogService.genDocumentIndexingBacklogData(
          document,
          docPermissions.find((permission) => permission.documentId.toString() === document._id),
          organization,
        )),
      )
    ).filter(Boolean);
    const insertedDocs = await this.documentIndexingBacklogService.createDocumentIndexingBacklogBulk(documentIndexingPreparations, documents);
    if (insertedDocs.length) {
      await this.documentService.setDocumentIndexingStatus(insertedDocs.map((doc) => doc.documentId), DocumentIndexingStatusEnum.PROCESSING);
    }
    await this.userService.updateUserPropertyById(user._id, {
      'metadata.hasProcessedIndexingDocuments': true,
    });
  }

  async prepareOrgDocumentsIndexing(organization: IOrganization): Promise<void> {
    const { metadata: organizationMetadata } = organization || {};
    const { hasProcessedIndexingDocuments: organizationHasProcessedIndexingDocuments } = organizationMetadata || {};
    if (organizationHasProcessedIndexingDocuments) {
      return;
    }
    const docPermissions = await this.documentService.getOrgDocumentPermissions(organization._id);
    if (!docPermissions.length) {
      return;
    }
    const documents = await this.documentService.getDocumentsToIndex(docPermissions.map((permission) => permission.documentId));
    const documentIndexingPreparations = (
      await Promise.all(
        documents.map(async (document) => this.documentIndexingBacklogService.genDocumentIndexingBacklogData(
          document,
          docPermissions.find((permission) => permission.documentId.toString() === document._id),
          organization,
        )),
      )
    ).filter(Boolean);
    const insertedDocs = await this.documentIndexingBacklogService.createDocumentIndexingBacklogBulk(documentIndexingPreparations, documents);
    if (insertedDocs.length) {
      await this.documentService.setDocumentIndexingStatus(insertedDocs.map((doc) => doc.documentId), DocumentIndexingStatusEnum.PROCESSING);
    }
    await this.updateOrganizationById(organization._id, {
      $set: {
        'metadata.hasProcessedIndexingDocuments': true,
      },
    });
  }

  async prepareAllDocumentIndexing(user: User, organization: IOrganization): Promise<void> {
    await this.preparePersonalDocumentsIndexing(user, organization);
    await this.prepareOrgDocumentsIndexing(organization);
  }

  async upsertSamlSsoConfiguration(actor: User, input: SamlSsoConfigurationInput): Promise<SamlSsoConfiguration> {
    const { orgId, domains, rawIdpMetadataXml } = input;

    const { sso, associateDomains } = await this.getOrgById(orgId);

    // validate that all input domains exist in organization's associated domains
    const invalidDomains = domains.filter((domain) => !associateDomains.includes(domain));
    if (invalidDomains.length > 0) {
      throw GraphErrorException.BadRequest('Domains must be associated with the organization', ErrorCode.Org.SAML_SSO_DOMAIN_NOT_ASSOCIATED, {
        invalidDomains,
        associateDomains,
      });
    }

    // check domains are already configured in Ory
    const configuredDomains = await domains.reduce<Promise<string[]>>(async (accPromise, domain) => {
      const acc = await accPromise;
      const oryOrganizationsData = await this.kratosService.getOryOrganizationByDomain(domain);
      const oryOrganizationIds = oryOrganizationsData.organizations.map((oryOrganization) => oryOrganization.id);
      if (oryOrganizationIds.length && !oryOrganizationIds.includes(sso?.ssoOrganizationId)) {
        acc.push(domain);
      }
      return acc;
    }, Promise.resolve([]));

    if (configuredDomains.length > 0) {
      throw GraphErrorException.BadRequest('Domains already configured in Ory', ErrorCode.Org.SAML_SSO_DOMAIN_ALREADY_CONFIGURED, {
        domains: configuredDomains,
      });
    }

    const oryOrganization = await this.kratosService.upsertOryOrganization({
      domains,
      label: `lumin-org-${orgId}`,
    }, sso?.ssoOrganizationId);

    // track if this is a newly created organization (no existing sso.ssoOrganizationId)
    const isNewOrganization = !sso?.ssoOrganizationId;
    let samlSsoConnection: SamlSsoConnection;
    try {
      samlSsoConnection = await this.kratosService.upsertSamlSsoConnection({
        organizationId: oryOrganization.id,
        rawIdpMetadataXml,
      });
    } catch (error) {
      // if SAML SSO connection creation fails and we created a new organization, rollback by deleting it
      if (isNewOrganization) {
        try {
          await this.kratosService.deleteOryOrganization(oryOrganization.id);
        } catch (rollbackError) {
          // Log the rollback error but don't throw it to avoid masking the original error
          this.loggerService.error({
            context: `${this.upsertSamlSsoConfiguration.name} - Ory organization rollback failed`,
            extraInfo: {
              orgId,
              oryOrganizationId: oryOrganization.id,
              originalError: error.message,
            },
            error: rollbackError,
          });
        }
      }
      throw GraphErrorException.BadRequest('Failed to upsert SAML SSO connection', ErrorCode.Org.UPSERT_SAML_SSO_CONNECTION_FAILED);
    }

    if (!sso) {
      const newSso = {
        createdBy: actor._id,
        ssoOrganizationId: oryOrganization.id,
        samlSsoConnectionId: samlSsoConnection.id,
      };
      const updatedOrg = await this.updateOrganizationById(
        orgId,
        { $set: { sso: newSso } },
      );

      const orgMembers = await this.organizationMemberModel.find(
        {
          orgId,
          role: {
            $in: [
              OrganizationRoleEnums.BILLING_MODERATOR,
              OrganizationRoleEnums.MEMBER,
            ],
          },
        },
        { userId: 1 },
      );
      const recieverIds = orgMembers
        .filter(Boolean)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        .map(({ userId }) => userId.toHexString());

      this.publishUpdateOrganization(
        recieverIds,
        {
          orgId,
          organization: updatedOrg,
          type: SUBSCRIPTION_SAML_SSO_SIGN_IN_SECURITY_UPDATE,
        },
        SUBSCRIPTION_UPDATE_ORG,
      );
    }

    return {
      id: oryOrganization.id,
      createdAt: new Date(oryOrganization.created_at),
      domains: oryOrganization.domains,
      label: oryOrganization.label,
      ascUrl: samlSsoConnection.ascUrl,
      spEntityId: samlSsoConnection.spEntityId,
      rawIdpMetadataXml: samlSsoConnection.rawIdpMetadataXml,
    };
  }

  async deleteSamlSsoConfiguration(orgId: string): Promise<void> {
    const { sso } = await this.getOrgById(orgId);
    if (!sso) {
      return;
    }
    // unlink saml sso from users
    const orgMembers = await this.getMembersByOrgId(orgId, { userId: 1 });
    await Promise.all(orgMembers.map(({ userId }) => this.authService.unlinkSamlLoginService({ userId })));
    const { ssoOrganizationId } = sso;
    await this.kratosService.deleteScimSsoClient(ssoOrganizationId);
    await this.kratosService.deleteOryOrganization(ssoOrganizationId);
    await this.updateOrganizationById(orgId, {
      $unset: {
        sso: '',
      },
    });
  }

  async getSamlSsoConfiguration(orgId: string): Promise<SamlSsoConfiguration | null> {
    const organization = await this.getOrgById(orgId);
    if (!organization?.sso) {
      return null;
    }
    const { ssoOrganizationId } = organization.sso;
    const oryOrganization = await this.kratosService.getOryOrganization(ssoOrganizationId);
    const { samlSsoConnection } = await this.kratosService.getSamlSsoConnection({
      organizationId: oryOrganization.id,
    });
    return {
      id: oryOrganization.id,
      createdAt: new Date(oryOrganization.created_at),
      domains: oryOrganization.domains,
      label: oryOrganization.label,
      ascUrl: samlSsoConnection.ascUrl,
      spEntityId: samlSsoConnection.spEntityId,
      rawIdpMetadataXml: samlSsoConnection.rawIdpMetadataXml,
    };
  }

  async enableScimSsoProvision(orgId: string): Promise<ScimSsoConfiguration> {
    const { sso } = await this.getOrgById(orgId);
    if (!sso) {
      throw GraphErrorException.BadRequest('SAML SSO configuration not found', ErrorCode.Org.SAML_SSO_CONFIGURATION_NOT_FOUND);
    }
    if (sso.scimSsoClientId) {
      throw GraphErrorException.BadRequest('Organzation enabled SCIM SSO provision', ErrorCode.Org.SCIM_SSO_PROVISION_ALREADY_ENABLED);
    }
    const scimSsoClient = await this.kratosService.upsertScimSsoClient(sso.ssoOrganizationId);
    await this.updateOrganizationById(orgId, { $set: { 'sso.scimSsoClientId': scimSsoClient.id } });

    return scimSsoClient;
  }

  async disableScimSsoProvision(orgId: string): Promise<void> {
    const { sso } = await this.getOrgById(orgId);
    if (!sso) {
      return;
    }
    await this.kratosService.deleteScimSsoClient(sso.ssoOrganizationId);
    await this.updateOrganizationById(orgId, { $unset: { 'sso.scimSsoClientId': '' } });
  }

  async getScimSsoConfiguration(orgId: string): Promise<ScimSsoConfiguration | null> {
    const { sso } = await this.getOrgById(orgId);
    if (!sso) {
      return null;
    }

    const { scimSsoClient } = await this.kratosService.getScimSsoClient({
      organizationId: sso.ssoOrganizationId,
    });

    return scimSsoClient;
  }

  async getOrganizationByScimClient(scimClientId: string, projection?: ProjectionType<IOrganization>): Promise<IOrganization | null> {
    const organization = await this.organizationModel.findOne({ 'sso.scimSsoClientId': scimClientId }, projection).exec();
    return organization ? { ...organization.toObject(), _id: organization._id.toHexString() } : null;
  }

  async checkEnableScimSsoProvision(orgId: string): Promise<boolean> {
    const organization = await this.getOrgById(orgId, { sso: 1 });
    return !!organization?.sso?.scimSsoClientId;
  }

  async getOrganizationIdsWithScimEnabled(userId: string): Promise<string[]> {
    const result = await this.organizationModel.aggregate<{ _id: Types.ObjectId }>([
      {
        $lookup: {
          from: 'organizationmembers',
          localField: '_id',
          foreignField: 'orgId',
          as: 'membership',
        },
      },
      {
        $match: {
          'membership.userId': new Types.ObjectId(userId),
          'sso.scimSsoClientId': { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    return result.map((org) => org._id.toHexString());
  }

  async emitGoogleDocumentForIndexing(params: {
    document: IDocument,
    user: User,
    accessToken: string,
  }): Promise<void> {
    const { document } = params;
    return this.documentIndexingBacklogService.emitGoogleDocumentForIndexing(params)
      .then((result) => {
        if (!result) {
          return;
        }
        this.loggerService.info({
          context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
          message: 'Successfully prepared Google document for indexing',
          extraInfo: {
            documentId: document._id,
          },
        });
      })
      .catch((error) => {
        this.loggerService.error({
          context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
          message: 'Failed to prepare Google document for indexing',
          error,
          extraInfo: {
            documentId: document._id,
          },
        });
      });
  }

  private async prepareSignSeatOperation(
    input: {
      orgId: string;
      userIds: string[];
      checkSignSubscription?: boolean;
    },
  ): Promise<{
    users: User[];
    organization: IOrganization;
    signSubscription: SubScriptionItemSchemaInterface;
  }> {
    const {
      orgId,
      userIds,
      checkSignSubscription = true,
    } = input;
    const [users, organization] = await Promise.all([
      this.userService.findUserByIds(userIds),
      this.getOrgById(orgId),
    ]);

    if (!users.length) {
      throw GraphErrorException.NotFound('Users not found');
    }

    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }

    const { subscriptionItems = [] } = organization.payment;
    const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);
    const [pdfSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.PDF);

    if (!signSubscription && !pdfSubscription) {
      throw GraphErrorException.NotFound('Subscription not found');
    }

    if (checkSignSubscription && !signSubscription) {
      throw GraphErrorException.NotFound('Sign subscription not found');
    }

    const hasPermissions = await this.checkMembershipsPermission({ targetId: orgId, target: 'org', userIds: users.map((user) => user._id) });
    if (!hasPermissions.every(Boolean)) {
      throw GraphErrorException.Forbidden('Do not have permission');
    }
    return { users, organization, signSubscription };
  }

  async assignSignSeats(input: { orgId: string; userIds: string[], actor: User, isPublishUpdateSignWorkspacePayment?: boolean })
    : Promise<{ availableSignSeats: number }> {
    const {
      orgId, userIds, actor, isPublishUpdateSignWorkspacePayment = true,
    } = input;
    const { users, organization, signSubscription } = await this.prepareSignSeatOperation({ orgId, userIds, checkSignSubscription: true });
    const totalSignSeats = signSubscription.quantity;
    const assignedSignSeats = organization.premiumSeats?.length;
    const currentAvailableSignSeats = totalSignSeats - assignedSignSeats;

    const premiumSeatSet = new Set(
      organization.premiumSeats.map((seat) => seat.toString()),
    );
    const addedUsers = users.filter((user) => !premiumSeatSet.has(user._id));
    if (!addedUsers.length) {
      throw GraphErrorException.Conflict('User already has seat', ErrorCode.Payment.USER_ALREADY_HAS_SEAT);
    }

    const canAssignSeat = currentAvailableSignSeats - addedUsers.length >= 0;
    if (!canAssignSeat) {
      throw GraphErrorException.Conflict('No available sign seats. Please upgrade your plan', ErrorCode.Payment.NO_AVAILABLE_SIGN_SEATS);
    }

    const updatedOrg = await this.updateOrganizationProperty(orgId, {
      $addToSet: {
        premiumSeats: {
          $each: users.map((user) => (user._id)),
        },
      },
    });

    const newAvailableSignSeats = totalSignSeats - updatedOrg.premiumSeats?.length;

    this.notifySignSeatChange({
      actor,
      users: addedUsers,
      organization: updatedOrg,
      action: UpdateSignWsPaymentActions.ASSIGN_SEAT,
      isPublishUpdateSignWorkspacePayment,
    });
    const addedUserIds = addedUsers.map((user) => user._id);
    await this.handleRemoveSignSeatRequest({ orgId, userIds: addedUserIds });

    return { availableSignSeats: newAvailableSignSeats };
  }

  async unassignSignSeats(input: { orgId: string; userIds: string[], actor: User, isPublishUpdateSignWorkspacePayment?: boolean })
    : Promise<{ availableSignSeats: number }> {
    const {
      orgId, userIds, actor, isPublishUpdateSignWorkspacePayment = true,
    } = input;
    const { users, organization, signSubscription } = await this.prepareSignSeatOperation({ orgId, userIds, checkSignSubscription: true });

    const premiumSeatSet = new Set(
      organization.premiumSeats.map((seat) => seat.toString()),
    );

    const updatedOrg = await this.updateOrganizationProperty(orgId, { $pull: { premiumSeats: { $in: users.map((user) => user._id) } } });
    const totalSignSeats = signSubscription.quantity;
    const newAvailableSignSeats = totalSignSeats - updatedOrg.premiumSeats?.length;

    const unassignedUsers = users.filter((user) => premiumSeatSet.has(user._id));

    if (unassignedUsers.length > 0) {
      this.notifySignSeatChange({
        actor,
        users: unassignedUsers,
        organization: updatedOrg,
        action: UpdateSignWsPaymentActions.UNASSIGN_SEAT,
        isPublishUpdateSignWorkspacePayment,
      });
    }
    return { availableSignSeats: newAvailableSignSeats };
  }

  notifySignSeatChange(input: {
    actor: User;
    users: User[];
    organization: IOrganization;
    action: UpdateSignWsPaymentActions;
    isPublishUpdateSignWorkspacePayment?: boolean;
  }) {
    const {
      actor,
      users,
      organization,
      action,
      isPublishUpdateSignWorkspacePayment = true,
    } = input;
    users.forEach((user) => {
      let emailType: EmailType = null;
      let notiType: number = null;

      switch (action) {
        case UpdateSignWsPaymentActions.ASSIGN_SEAT:
          emailType = EMAIL_TYPE.ASSIGN_SIGN_SEATS;
          notiType = NotiOrg.ASSIGNED_SIGN_SEATS;
          break;
        case UpdateSignWsPaymentActions.UNASSIGN_SEAT:
          emailType = EMAIL_TYPE.UNASSIGN_SIGN_SEATS;
          notiType = NotiOrg.UNASSIGNED_SIGN_SEATS;
          break;
        case UpdateSignWsPaymentActions.REJECT_SIGN_SEAT_REQUEST:
          emailType = EMAIL_TYPE.REJECT_SIGN_SEAT_REQUEST;
          notiType = NotiOrg.REJECT_SIGN_SEAT_REQUEST;
          break;
        default:
          break;
      }

      if (emailType) {
        const subjectTemplate = SUBJECT[emailType.description].replace(
          '#{orgName}',
          organization.name,
        );
        const emailData = {
          subject: subjectTemplate,
          userName: user.name,
          orgName: organization.name,
          orgUrl: organization.url,
        };

        this.emailService.sendEmailHOF(
          emailType,
          [user.email],
          emailData,
        );
      }

      if (notiType) {
        const notification = notiOrgFactory.create(notiType, {
          actor: { user: actor },
          target: { user },
          entity: { organization },
        });
        this.notificationService.createUsersNotifications(
          notification,
          [user._id],
          NotificationTab.GENERAL,
          NotificationProduct.LUMIN_SIGN,
        );
      }
    });
    const userIds = users.map((user) => user._id);

    if (isPublishUpdateSignWorkspacePayment) {
      this.publishUpdateSignWorkspacePayment({
        organization,
        userIds,
        action,
      });
    }
    this.publishUpdateSignSeat({
      organization,
      userIds,
      action,
    });
  }

  publishUpdateSignWorkspacePayment({
    organization,
    userIds,
    action,
  }: {
    organization: IOrganization;
    userIds: string[];
    action: UpdateSignWsPaymentActions;
  }) {
    const updateSignSeatActions = [UpdateSignWsPaymentActions.ASSIGN_SEAT, UpdateSignWsPaymentActions.UNASSIGN_SEAT];
    if (updateSignSeatActions.includes(action)) {
      const signPayment = OrganizationUtils.interceptPaymentByProduct(organization, PaymentProductEnums.SIGN);
      signPayment.isSignProSeat = action === UpdateSignWsPaymentActions.ASSIGN_SEAT;
      this.rabbitMQService.publish(
        EXCHANGE_KEYS.LUMIN_SIGN_UPDATE_WORKSPACE_PAYMENT,
        ROUTING_KEY.LUMIN_SIGN_UPDATE_WORKSPACE_PAYMENT,
        {
          organizationId: organization._id,
          receiverIds: userIds,
          action,
          organization: {
            ...organization,
            payment: {
              ...organization.payment,
              ...signPayment,
            },
          },
        },
      );
    } else {
      userIds.forEach((userId) => {
        const signPayment = OrganizationUtils.interceptPaymentByProduct(organization, PaymentProductEnums.SIGN, userId);
        this.rabbitMQService.publish(
          EXCHANGE_KEYS.LUMIN_SIGN_UPDATE_WORKSPACE_PAYMENT,
          ROUTING_KEY.LUMIN_SIGN_UPDATE_WORKSPACE_PAYMENT,
          {
            organizationId: organization._id,
            receiverIds: [userId],
            action,
            organization: {
              ...organization,
              payment: {
                ...organization.payment,
                ...signPayment,
              },
            },
          },
        );
      });
    }
  }

  async handleCancelSignSubscription({
    organization,
    managers,
    refundedFraudWarning,
    numberDaysUsePremium,
  }: {
    organization: IOrganization,
    managers: User[],
    refundedFraudWarning: string,
    numberDaysUsePremium: number,
  }) {
    const updatedOrganization = await this.updateOrganizationProperty(organization._id, {
      premiumSeats: [],
    });
    const emails = managers.map(({ email }: { email: string, _id?: string}) => email);
    this.paymentService.sendOrgSubscriptionCanceledEmail({
      refundedFraudWarningAmount: refundedFraudWarning, targetEmails: emails, orgData: organization, numberDaysUsePremium,
    });
    const assignedSeatUserIds = organization.premiumSeats.map((userId) => userId.toString());
    this.publishUpdateSignWorkspacePayment({
      organization: updatedOrganization,
      userIds: assignedSeatUserIds,
      action: UpdateSignWsPaymentActions.CANCELED_SUBSCRIPTION,
    });
  }

  async requestSignSeat(input: { orgId: string; user: User, requestMessage: string }): Promise<void> {
    const { orgId, user, requestMessage = '' } = input;
    const { organization } = await this.prepareSignSeatOperation({ orgId, userIds: [user._id], checkSignSubscription: false });

    const premiumSeatSet = new Set(
      organization.premiumSeats.map((seat) => seat.toString()),
    );
    const existSignSeat = premiumSeatSet.has(user._id.toString());

    if (existSignSeat) {
      throw GraphErrorException.Conflict('User already has seat', ErrorCode.Payment.USER_ALREADY_HAS_SEAT);
    }

    const existSignSeatRequest = await this.findMemberInRequestAccessWithType({
      actor: user.email,
      target: orgId,
      type: AccessTypeOrganization.REQUEST_SIGN_SEAT,
    });

    if (existSignSeatRequest) {
      return;
    }

    const requester = new RequestOrganizationConcreteBuilder()
      .setActor(user.email)
      .setTarget(orgId)
      .setType(AccessTypeOrganization.REQUEST_SIGN_SEAT);
    const requestAccess = await this.createRequestAccess(requester.build());

    const managerMembers = await this.findMemberWithRoleInOrg(
      organization._id,
      [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ],
      { userId: 1 },
    );

    const managerIds: string[] = managerMembers.filter(Boolean).map(({ userId }) => userId.toHexString());
    const managerUsers = await this.userService.findUserByIds(managerIds, { name: 1, email: 1, timezoneOffset: 1 });

    const subjectTemplate = SUBJECT[EMAIL_TYPE.REQUEST_SIGN_SEAT.description].replace(
      '#{requesterName}',
      user.name,
    );
    managerUsers.forEach((managerUser) => {
      const emailData = {
        subject: subjectTemplate,
        requesterName: user.name,
        approverName: managerUser.name,
        orgName: organization.name,
        orgUrl: organization.url,
        orgId: organization._id,
        encodedRequesterEmail: encodeURIComponent(encodeURIComponent(user.email)),
        commenterName: user.name,
        comments: [{
          userName: user.name,
          time: Utils.convertToLocalTime(requestAccess.createdAt, managerUser.timezoneOffset),
          comment: requestMessage,
          displayTime: true,
        }],
      };
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.REQUEST_SIGN_SEAT,
        [managerUser.email],
        emailData,
      );
    });
  }

  async rejectSignSeatRequests(input: { orgId: string; userIds: string[], actor: User }): Promise<void> {
    const { orgId, userIds, actor } = input;
    const { organization, users } = await this.prepareSignSeatOperation({ orgId, userIds, checkSignSubscription: false });
    const userEmails = users.map((user) => user.email);

    const signSeatRequests = await this.getRequestAccessByCondition({
      actor: { $in: userEmails },
      target: orgId,
      type: AccessTypeOrganization.REQUEST_SIGN_SEAT,
    });

    if (signSeatRequests.length === 0) {
      throw GraphErrorException.Conflict('Seat request already rejected', ErrorCode.Payment.SEAT_REQUEST_ALREADY_REJECTED);
    }
    const requestedEmails = new Set(signSeatRequests.map((request) => request.actor));

    const usersWithRequest = users.filter((u) => requestedEmails.has(u.email));

    if (usersWithRequest.length > 0) {
      await this.handleRemoveSignSeatRequest({ orgId, userIds: usersWithRequest.map((user) => user._id) });
      this.notifySignSeatChange({
        actor,
        users: usersWithRequest,
        organization,
        action: UpdateSignWsPaymentActions.REJECT_SIGN_SEAT_REQUEST,
        isPublishUpdateSignWorkspacePayment: false,
      });
    }
  }

  async handleRemoveSignSeatRequest(input: { orgId: string; userIds: string[] }): Promise<void> {
    const { orgId, userIds } = input;
    const users = await this.userService.findUserByIds(userIds);
    const userEmails = users.map((user) => user.email);
    if (userEmails.length > 0) {
      await this.requestAccessModel.deleteMany({
        actor: { $in: userEmails },
        target: orgId,
        type: AccessTypeOrganization.REQUEST_SIGN_SEAT,
      });
    }
  }

  async handleRemoveSeatRelateToSign({
    orgId,
    userIds,
    actor,
    signSubscription,
    isPublishUpdateSignWorkspacePayment = false,
  }: {
    orgId: string;
    userIds: string[];
    actor?: User;
    signSubscription?: SubScriptionItemSchemaInterface;
    isPublishUpdateSignWorkspacePayment?: boolean;
  }) {
    if (signSubscription) {
      await this.unassignSignSeats({
        orgId,
        userIds,
        actor,
        isPublishUpdateSignWorkspacePayment,
      });
    }

    await this.handleRemoveSignSeatRequest({ orgId, userIds });
  }

  async getSignDocStackStorage(req: GetContractStackInfoRequest) {
    return this.luminContractService.getContractStackInfo(req);
  }

  public publishSignUploadAgreement({ signDocStackStorage, orgId }: { signDocStackStorage: SignDocStackStorage, orgId: string }): void {
    this.pubSub.publish(`${SUBSCRIPTION_UPDATE_CONTRACT_STACK}.${orgId}`, {
      [SUBSCRIPTION_UPDATE_CONTRACT_STACK]: signDocStackStorage,
    });
  }

  public publishUpdateSignSeat({ userIds, organization, action }
    : { userIds: string[], organization: IOrganization, action: UpdateSignWsPaymentActions }): void {
    userIds.forEach((userId) => {
      this.pubSub.publish(`${SUBSCRIPTION_UPDATE_SIGN_SEAT}.${organization._id}.${userId}`, {
        [SUBSCRIPTION_UPDATE_SIGN_SEAT]:
          { action },
      });
    });
  }

  public getSignSeatInfo(organization: Organization) {
    const premiumSignSeats = organization.premiumSeats?.length ?? 0;

    const { subscriptionItems = [] } = organization.payment;
    const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);

    const totalSignSeats = signSubscription?.quantity ?? 0;
    const availableSignSeats = totalSignSeats - premiumSignSeats;

    return { premiumSignSeats, totalSignSeats, availableSignSeats };
  }

  async trackIpAddress({ userId, orgId, request }: { userId: string; orgId: string; request: Request }) {
    if (!orgId || !userId) {
      return;
    }

    const membership = await this.getMembershipByOrgAndUser(orgId, userId);
    const role = membership?.role as OrganizationRoleEnums;
    if (!membership || ![OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR].includes(role)) {
      return;
    }

    const hashedIp = Utils.getHashedIpRequest(request);

    await this.organizationModel.findOneAndUpdate(
      { _id: orgId },
      { $pull: { hashedIpAddresses: hashedIp } },
    );

    await this.organizationModel.findOneAndUpdate(
      { _id: orgId },
      {
        $push: {
          hashedIpAddresses: {
            $each: [hashedIp],
            $position: 0,
            $slice: MAX_TRACKING_IP_ADDRESSES,
          },
        },
      },
    );
  }

  public async uploadDocumentTemplate(data: {
    uploader: User;
    clientId: string;
    documentOwnerType: DocumentOwnerTypeEnum;
    fileRemoteId: string;
    fileName: string;
    context: IOrganization;
    thumbnailRemoteId?: string;
  }): Promise<IDocumentTemplate> {
    const {
      uploader,
      clientId,
      documentOwnerType,
      fileRemoteId,
      context,
      fileName,
      thumbnailRemoteId,
    } = data;
    const metaData = await this.awsService.getDocumentMetadata(fileRemoteId);
    const { ContentLength: size } = metaData;
    const isPremium = (context.payment.type as PaymentPlanEnums) !== PaymentPlanEnums.FREE;

    if (!this.rateLimiterService.verifyUploadFilesSize(isPremium, [{ size }])) {
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

    await this.documentTemplateService.validateTemplateQuota({
      uploader,
      clientId,
      documentOwnerType,
      organizationId: context._id,
    });

    const document = await this.documentTemplateService.createDocumentTemplateWithBufferData({
      fileName,
      clientId,
      fileRemoteId,
      uploader,
      docType: documentOwnerType,
      documentInfo: metaData,
      thumbnailRemoteId,
    });
    document.etag = await this.documentService.getDocumentETag(document.remoteId);
    return this.documentTemplateService.processAfterUpdateDocumentTemplateToDb({
      clientId, document, documentOwnerType, uploader, organization: context,
    });
  }

  async getDocumentTemplates(params: {
    user: User;
    resource: IOrganization | ITeam;
  } & Omit<GetOrganizationDocumentTemplatesInput, 'orgId'>): Promise<GetDocumentTemplatesPayload> {
    const {
      resource,
      user,
      query,
      tab,
    } = params;

    const { cursor = '', searchKey } = query || {};

    const permissionBuilder = new OrganizationPermissionFilter(this.organizationTeamService);
    const documentTemplateBuilder = new DocumentTemplateFilter(this.documentTemplateService);

    const [permFilter, documentFilter] = await Promise.all([
      permissionBuilder
        .of(user)
        .in(resource)
        .addTab(tab)
        .addKind(DocumentKindEnum.TEMPLATE)
        .build(),
      documentTemplateBuilder
        .of(user)
        .in(resource)
        .addTab(tab)
        .addCursor(cursor)
        .addSearch(searchKey)
        .build(),
    ]);
    const queryManager = new OrganizationDocumentTemplateQuery(
      this.documentTemplateService,
      this.userService,
      this.environmentService,
    );
    const result = await queryManager
      .of(user)
      .in(resource)
      .getDocuments({
        query,
        permFilter,
        documentFilter,
      });
    return result;
  }

  async getAccessibleDocumentTemplates(params: {
    user: User;
    resource: IOrganization | ITeam;
  }): Promise<Pick<GetDocumentTemplatesPayload, 'documents'>> {
    const {
      resource,
      user,
    } = params;

    const permissionBuilder = new OrganizationPermissionFilter(this.organizationTeamService);
    const documentTemplateBuilder = new DocumentTemplateFilter(this.documentTemplateService);

    const [permFilter, documentFilter] = await Promise.all([
      permissionBuilder
        .of(user)
        .in(resource)
        .addTab(DocumentTab.ACCESSIBLE)
        .addKind(DocumentKindEnum.TEMPLATE)
        .build(),
      documentTemplateBuilder
        .of(user)
        .in(resource)
        .addTab(DocumentTab.ACCESSIBLE)
        .build(),
    ]);
    const queryManager = new OrganizationDocumentTemplateQuery(
      this.documentTemplateService,
      this.userService,
      this.environmentService,
    );
    const result = await queryManager
      .of(user)
      .in(resource)
      .getAccessibleDocuments({
        permFilter,
        documentFilter,
      });
    return result;
  }

  private async validateImageResponse(response: Response): Promise<Buffer> {
    if (!response.ok) {
      throw GraphErrorException.UnprocessableError(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw GraphErrorException.UnprocessableError(`Invalid content-type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_AVATAR_SIZE) {
      throw GraphErrorException.UnprocessableError('Image size exceeds limit');
    }

    return Buffer.from(arrayBuffer);
  }

  async getOrgAvatarSuggestionKey(params: {
    emailDomain: string;
  }): Promise<{ keyFile: string } | null> {
    const { emailDomain } = params;

    try {
      const cachedKey = await this.redisService.getAvatarSuggestionFromExternalUrl(emailDomain);
      if (cachedKey) return { keyFile: cachedKey };

      const logoDevApiKey = this.environmentService.getByKey(EnvConstants.LOGO_DEV_API_KEY);
      const logoUrl = `https://img.logo.dev/${emailDomain}?token=${logoDevApiKey}&fallback=404`;

      const logoResponse = await fetch(logoUrl);
      if (logoResponse.status === 404) {
        this.loggerService.info({
          message: `No logo found for domain: ${emailDomain}`,
          context: 'getOrgAvatarSuggestionKey',
        });
        return null;
      }

      const imageBuffer = await this.validateImageResponse(logoResponse);
      const keyFile = await this.awsService.uploadSuggestionAvatarByEmailDomain(
        imageBuffer,
        emailDomain,
        DocumentMimeType.JPEG,
      );

      this.redisService.setAvatarSuggestionFromExternalUrl(emailDomain, keyFile);
      return { keyFile };
    } catch (error) {
      this.loggerService.error({
        message: 'Failed to get org avatar suggestion',
        context: 'getOrgAvatarSuggestionKey',
        extraInfo: { error: error?.message ?? error },
      });
      return null;
    }
  }

  public async updatePromotionTracking({
    org,
    subscription,
  }: {
    org: IOrganization;
    subscription: Stripe.Subscription | null;
  }): Promise<void> {
    const promotion = OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL;
    const orgId = org._id;
    const discount = subscription?.discount;
    const coupon = discount?.coupon;
    const couponId = typeof coupon === 'string' ? coupon : coupon?.id;

    const isTimeSensitive = couponId
      && this.paymentService.isTimeSensitiveCoupon(couponId, org.payment.stripeAccountId);

    if (isTimeSensitive) {
      await this.organizationModel.updateOne(
        { _id: orgId },
        { $addToSet: { 'metadata.promotions': promotion } },
      );
      return;
    }

    await this.organizationModel.updateOne(
      { _id: orgId },
      { $pull: { 'metadata.promotions': promotion } },
    );

    if (!discount) {
      await this.redisService.deleteTimeSensitiveCoupon(orgId);
    }
  }

  public async updatePromotionClaimed({
    org,
    promotion,
  }: { org: IOrganization, promotion: OrganizationPromotionEnum }) {
    await this.organizationModel.updateOne(
      { _id: org._id },
      { $addToSet: { 'metadata.promotionsClaimed': promotion } },
    );
  }

  public async updatePromotionOffered({
    org,
    promotion,
  }: { org: IOrganization, promotion: OrganizationPromotionEnum }) {
    await this.organizationModel.updateOne(
      { _id: org._id },
      { $addToSet: { 'metadata.promotionsOffered': promotion } },
    );
  }

  public async clearPromotionsOffered(orgId: string) {
    await this.organizationModel.updateOne(
      { _id: orgId },
      { $set: { 'metadata.promotionsOffered': [] } },
    );
  }
}
