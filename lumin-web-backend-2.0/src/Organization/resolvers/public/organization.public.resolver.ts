/* eslint-disable dot-notation */
import {
  HttpStatus, Inject, UseInterceptors, UseGuards,
  forwardRef,
} from '@nestjs/common';
import {
  Context, Args, Query, Resolver, Mutation, Subscription,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { uniqBy } from 'lodash';
import { Types } from 'mongoose';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { Email } from 'Common/common.interface';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { GET_ORGANIZATION_RESOURCES_LIMIT } from 'Common/constants/OrganizationConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_CONVERT_ORGANIZATION,
  SUBSCRIPTION_DELETE_ORGANIZATION, SUBSCRIPTION_REMOVE_ORG_MEMBER, SUBSCRIPTION_UPDATE_ORG, SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
  SUBSCRIPTION_CHANGED_DOCUMENT_STACK,
  SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK,
  SUBSCRIPTION_UPDATE_CONTRACT_STACK,
  SUBSCRIPTION_UPDATE_SIGN_SEAT,
  SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED,
} from 'Common/constants/SubscriptionConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { CurrentOrganization } from 'Common/decorators/organization.decorator';
import { CurrentTeam } from 'Common/decorators/team.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { RejectDeletingUserGuard } from 'Common/guards/reject.deleting.user.guard';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';
import { CustomRulesInterceptor } from 'CustomRules/custom.rules.interceptor';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { DocumentOwnerTypeEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocumentTemplate } from 'Document/DocumentTemplate/documentTemplate.interface';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';
import {
  IDocument,
} from 'Document/interfaces/document.interface';
import { DOCUMENT_INDEXING_PREPARATION_CONTEXT } from 'DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import { IFolder } from 'Folder/interfaces/folder.interface';
import {
  OrganizationMemberConnection,
  GetMemberInput,
  OrganizationTotalCount,
  GetUserRoleInOrgPayload,
  GetOrganizationPayload,
  BasicResponse,
  GetOrganizationDocumentsInput,
  GetDocumentPayload,
  AddMemberOrgTeamInput,
  TeamInput,
  OrganizationMember,
  CreateOrganizationTeamPayload,
  SubscriptionDeleteOrganizationPayload,
  SubscriptionConvertOrganizationPayload,
  GetOrgTeamsPayload,
  GetOrganizationFoldersInput,
  Folder,
  GetTemplatesInput,
  GetTemplatesPayload,
  Template,
  TemplateOwnerType,
  UploadOrganizationTemplateInput,
  OrganizationTemplateTabs,
  UploadThirdPartyDocumentsInput,
  CreateOrganizationFolderInput,
  SubscriptionChangedDocStackPayload,
  Document,
  UploadDocumentToOrgInput,
  UploadPersonalDocumentInputV2,
  InviteMemberToOrganizationPayload,
  GetRepresentativeMembersPayload,
  GetUsersInvitableToOrgInput,
  InviteUsersSetting,
  MembershipInput,
  DocumentTab,
  GetOrganizationResourcesInput,
  GetOrganizationResourcesPayload,
  CheckOrganizationDocStackPayload,
  OrganizationInviteLink,
  InviteToOrganizationInput,
  GetOrganizationFolderTreePayload,
  GetOrganizationFolderTreeInput,
  GetOrganizationTeamsFolderTreePayload,
  GetFoldersAvailabilityInput,
  GetFoldersAvailabilityPayload,
  UpdateOrganizationInviteLinkPayload,
  ThirdPartyService,
  RequestSignSeatInput,
  SignDocStackStorage,
  UpdateSignSeatSubscriptionPayload,
  UploadPersonalDocumentTemplateInput,
  UploadDocumentTemplateToOrgInput,
  GetDocumentTemplatesPayload,
  GetOrganizationDocumentTemplatesInput,
  TimeSensitiveCouponPayload,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { CheckLastJoinedOrgGuard } from 'Organization/guards/check-last-joined-org.guard';
import { OrganizationPermissionGuard, PreventInDeleteProcess } from 'Organization/guards/Gql/organization.permission.guard';
import { OrganizationScimGuard } from 'Organization/guards/organization-scim.guard';
import {
  IOrganization,
} from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import {
  OrganizationRoleEnums,
  OrganizationValidationStrategy,
  AccessTypeOrganization,
  OrganizationTeamRoles,
} from 'Organization/organization.enum';
import { OrganizationInviteLinkService } from 'Organization/organization.inviteLink.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { PaymentPlanEnums, PaymentProductEnums } from 'Payment/payment.enum';
import { DEFAULT_ACTION_COUNT_DOC_STACK } from 'Payment/Policy/newPriceModel';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { getActionSyncForNewPriceModel } from 'Payment/utils/newPriceModelUtil';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { IMembership } from 'Team/interfaces/membership.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { TemplateService } from 'Template/template.service';
import { UploadService } from 'Upload/upload.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@UseInterceptors(DocumentPaymentInterceptor)
@OrganizationPermissionGuard(OrganizationValidationStrategy.PUBLIC, Resource.ORGANIZATION)
@UseInterceptors(SanitizeInputInterceptor)
@Resolver('Organization')
export class OrganizationPublicResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly documentService: DocumentService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly eventService: EventServiceFactory,
    private readonly templateService: TemplateService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly uploadService: UploadService,
    private readonly blacklistService: BlacklistService,
    private readonly organizationInviteLinkService: OrganizationInviteLinkService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => FeatureFlagService))
    private readonly featureFlagService: FeatureFlagService,
    private readonly paymentUtilsService: PaymentUtilsService,
  ) {}

  @Subscription(SUBSCRIPTION_UPDATE_ORG, {
    filter: (payload, variables, context) => {
      const { user } = context.req;
      const { userId } = payload.updateOrganization;
      return (!userId || user._id === payload.updateOrganization.userId);
    },
    resolve: (payload) => payload[SUBSCRIPTION_UPDATE_ORG],
  })
  updateOrganization(@Args('input') input, @Args('orgId') orgId): any {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_ORG}.${input?.orgId || orgId}`);
  }

  @Subscription(SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK, {
    resolve: (payload) => payload[SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK],
  })
  updateOrganizationInviteLink(@Args('orgId') orgId): UpdateOrganizationInviteLinkPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK}.${orgId}`);
  }

  @Subscription(SUBSCRIPTION_CHANGED_DOCUMENT_STACK, {
    resolve: (payload) => payload[SUBSCRIPTION_CHANGED_DOCUMENT_STACK],
  })
  changedDocStackSubscription(@Args('orgId') orgId): SubscriptionChangedDocStackPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_CHANGED_DOCUMENT_STACK}.${orgId}`);
  }

  @Subscription(SUBSCRIPTION_REMOVE_ORG_MEMBER, {
    resolve: (payload) => payload[SUBSCRIPTION_REMOVE_ORG_MEMBER],
  })
  removeOrgMember(@Args('input') input, @Args('orgId') orgId, @Context() context): any {
    const { user } = context.req;
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_REMOVE_ORG_MEMBER}.${input?.orgId || orgId}.${user._id}`);
  }

  @Subscription(SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE, {
    resolve: (payload) => payload[SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE],
  })
  updateOrgMemberRole(@Args('input') input, @Args('orgId') orgId, @Context() context): any {
    const { user } = context.req;
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE}.${input?.orgId || orgId}.${user._id}`);
  }

  @Subscription(SUBSCRIPTION_DELETE_ORGANIZATION, {
    resolve: (payload) => payload[SUBSCRIPTION_DELETE_ORGANIZATION],
  })
  deleteOrganizationSub(@Context() context, @Args('orgId') orgId): SubscriptionDeleteOrganizationPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_DELETE_ORGANIZATION}.${orgId}.${context.req.user._id}`);
  }

  @Subscription(SUBSCRIPTION_CONVERT_ORGANIZATION)
  convertOrganization(@Args('orgId') orgId): SubscriptionConvertOrganizationPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_CONVERT_ORGANIZATION}.${orgId}`);
  }

  @Subscription(SUBSCRIPTION_UPDATE_CONTRACT_STACK, {
    resolve: (payload) => payload[SUBSCRIPTION_UPDATE_CONTRACT_STACK],
  })
  updateContractStackSubscription(@Args('orgId') orgId): SignDocStackStorage {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_CONTRACT_STACK}.${orgId}`);
  }

  @Subscription(SUBSCRIPTION_UPDATE_SIGN_SEAT, {
    resolve: (payload) => payload[SUBSCRIPTION_UPDATE_SIGN_SEAT],
  })
  updateSignSeatSubscription(@Context() context, @Args('orgId') orgId): UpdateSignSeatSubscriptionPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_SIGN_SEAT}.${orgId}.${context.req.user._id}`);
  }

  @Subscription(SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED, {
    resolve: (payload) => payload[SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED],
  })
  timeSensitiveCouponCreated(@Context() context, @Args('orgId') orgId): TimeSensitiveCouponPayload {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_TIME_SENSITIVE_COUPON_CREATED}.${orgId}.${context.req.user._id}`);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getUserRoleInOrg(@Context() context, @Args('orgId') orgId: string): Promise<GetUserRoleInOrgPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const memberShip = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id, { role: 1 });
    return {
      role: memberShip.role,
      userId: user._id,
      orgId,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async getOrganizationByUrl(@Context() context, @CurrentOrganization() organization: IOrganization): Promise<GetOrganizationPayload> {
    const { user }: { user: User } = context.req;
    if (user && organization) {
      this.userService.updateLastAccessedOrg(user._id, organization._id);
    }
    this.organizationService.prepareOrgDocumentIndexing(user, organization).catch((error) => {
      this.loggerService.error({
        context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
        message: 'Error preparing organization document indexing',
        extraInfo: {
          organizationId: organization._id,
          userId: user._id,
        },
        error,
      });
    });

    const orgData = this.organizationService.getOrgAdditionSetting(organization);
    const [reachUploadDocLimit, userInActiveOrgs, canUseMultipleMerge] = await Promise.all([
      this.organizationService.checkReachLimitUploadOrg({
        organization,
        userId: user._id,
      }),
      this.organizationService.getOrgListByUser(user?._id, {
        filterQuery: {
          $or: [
            { deletedAt: { $exists: false } },
            { deletedAt: { $eq: null } },
          ],
        },
      }),
      this.organizationService.getCanUseMultipleMerge(organization),
    ]);
    orgData.reachUploadDocLimit = reachUploadDocLimit;
    orgData.isLastActiveOrg = userInActiveOrgs.length === 1 && userInActiveOrgs[0]._id === orgData._id;
    orgData.userPermissions = { canUseMultipleMerge };
    const ownerOrg = await this.userService.findUserById(orgData.ownerId as Types.ObjectId);
    let actionCountDocStack = DEFAULT_ACTION_COUNT_DOC_STACK;
    if (ownerOrg) {
      const variant = await this.featureFlagService.getFeatureValue<string>({
        user: ownerOrg,
        organization: orgData,
        featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
      });
      actionCountDocStack = getActionSyncForNewPriceModel(variant);
    }
    const documentsAvailable = await this.documentService.haveDocumentsAvailable(user, organization);

    const aiChatbotDailyLimit = planPoliciesHandler.from({
      plan: organization.payment.type,
      period: organization.payment.period,
    }).getAIChatbotDailyLimit();
    this.organizationService.trackIpAddress({ userId: user._id, orgId: organization._id, request: context.req });

    return {
      orgData,
      actionCountDocStack,
      documentsAvailable,
      message: 'Successfully',
      statusCode: HttpStatus.OK,
      aiChatbotDailyLimit,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getOrganizationById(@CurrentOrganization() organization: IOrganization): GetOrganizationPayload {
    return {
      orgData: organization,
      message: 'Successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getMemberOfOrganization(
    @Context() context,
    @Args('input') input: GetMemberInput,
    @Args('internal') internal: boolean,
  ): Promise<OrganizationMemberConnection> {
    const { _id: userId } = context.req.user;
    return this.organizationService.getMembers(Object.assign(input, { internal, userId }));
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getTotalMembers(
    @Args('orgId') orgId: string,
  ): Promise<OrganizationTotalCount> {
    const [inviteOrgList, memberships] = await Promise.all([this.organizationService.getInviteOrgList({ target: orgId }, { type: 1, actor: 1 }),
      this.organizationService.getMembersByOrgId(
        orgId,
        { internal: 1 },
      ),
    ]);

    const [member, guest] = memberships.reduce(
      ([internal, external], value) => {
        if (value.internal) {
          return [internal + 1, external];
        }
        return [internal, external + 1];
      },
      [0, 0],
    );

    const pendingInvites = inviteOrgList.filter(
      ({ type }) => type === AccessTypeOrganization.INVITE_ORGANIZATION,
    );
    const requestList = inviteOrgList.filter(
      ({ type }) => type === AccessTypeOrganization.REQUEST_ORGANIZATION,
    );
    const requestListActors = requestList.map((item) => item.actor);

    const foundUsers = await this.userService.findUserByEmails(requestListActors, { email: 1 });

    const isScimEnabled = await this.organizationService.checkEnableScimSsoProvision(orgId);

    return {
      member,
      guest,
      pending: isScimEnabled ? 0 : pendingInvites.length,
      request: isScimEnabled ? 0 : foundUsers.length,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getOrgTeams(
    @Context() context,
    @Args('orgId') orgId: string,
  ): Promise<GetOrgTeamsPayload> {
    const { user } = context.req;
    const teams = await this.organizationTeamService.getOrgTeamsByUserId(orgId, user._id as string);
    return {
      teams,
    };
  }

  @UseGuards(RateLimiterGuard, CheckLastJoinedOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @PreventInDeleteProcess()
  @Mutation()
  @UseGuards(OrganizationScimGuard)
  async leaveOrganization(
    @Context() context,
    @Args('orgId') orgId: string,
  ): Promise<BasicResponse> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const [memberFound, userFound] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.organizationService.getMembershipByOrgAndUser(orgId, user._id),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
    ]);
    if (!memberFound) {
      throw GraphErrorException.NotFound('Member not found', ErrorCode.Org.USER_NOT_IN_ORGANIZATION);
    }
    if (memberFound.role === OrganizationRoleEnums.ORGANIZATION_ADMIN) {
      throw GraphErrorException.NotAcceptable('Can not leave organization', ErrorCode.Org.ORGANIZATION_ADMIN_CANNOT_LEAVE_ORG);
    }
    const isTeamAdmin = await this.organizationTeamService.isAdmin(user._id as string, orgId);
    if (isTeamAdmin) {
      throw GraphErrorException.NotAcceptable('Can not leave organization', ErrorCode.OrgTeam.ORGANIZATION_TEAM_ADMIN_CANNOT_LEAVE_ORG);
    }
    const { subscriptionItems = [] } = organization.payment;
    const [signSubscription] = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, PaymentProductEnums.SIGN);
    await this.organizationService.handleRemoveSeatRelateToSign({
      orgId, userIds: [user._id], actor: user, signSubscription,
    });
    await this.organizationService.handleMemberLeaveOrganization(userFound, orgId);
    return {
      message: 'Leave organization successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async uploadDocumentToOrganizationV2(
    @Context() context,
    @Args('input') input: UploadDocumentToOrgInput,
  ): Promise<Partial<IDocument> & ExtendedDocumentIntercept & BasicResponse> {
    const {
      isNotify: pushNotiOrg, folderId, documentName, encodedUploadData,
    } = input;
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const setUploadDocumentKey = await this.redisService.setKeyIfNotExist(`${organization._id}:${user._id}`, '1', '1000');
    if (!setUploadDocumentKey) {
      throw GraphErrorException.NotAcceptable('You are uploading document');
    }
    const { thumbnailRemoteId, documentRemoteId: fileRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: 1,
    });
    if (!hasRemainingDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('You currently reached Doc Stack limitation', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
    const documentUploaded = await this.organizationService.uploadDocument({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION,
      fileRemoteId,
      fileName: documentName,
      thumbnailRemoteId,
      context: organization,
      folderId,
      isNotify: pushNotiOrg,
    });

    return {
      ...documentUploaded,
      message: 'Upload organization document successfully',
      statusCode: HttpStatus.OK,
      interceptRequest: {
        documentIds: [documentUploaded._id],
        strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
      },
    };
  }

  @FolderPermissionGuard()
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getOrganizationDocuments(
    @Args('input') input: GetOrganizationDocumentsInput,
    @Context() context,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<GetDocumentPayload> {
    const { user } = context.req;
    if (input.tab === DocumentTab.RECENT) {
      return this.organizationService.getRecentDocumentList({ user, organization, input });
    }
    return this.organizationService.getDocuments({
      user,
      resource: organization,
      ...input,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async checkOrganizationTransfering(
    @Args('orgId') orgId: string,
  ): Promise<boolean> {
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
    const transferedEmail = await this.redisService.getRedisValueWithKey(transferKey);
    return Boolean(transferedEmail);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RejectDeletingUserGuard)
  @PreventInDeleteProcess()
  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async createOrganizationTeam(
    @Context() context,
    @Args('team') teamInput: TeamInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      avatarData: { fileBuffer: Buffer; mimetype: string; filename: string },
    @Args('members') members: AddMemberOrgTeamInput,
  ): Promise<CreateOrganizationTeamPayload> {
    const { user, organization }: { user: any, organization: IOrganization } = context.req;
    const { luminUsers } = members;

    const { canCreateTeam, maxTeam } = await this.organizationTeamService.canCreateTeam(organization);
    if (!canCreateTeam) {
      const organizationTeamLimit = planPoliciesHandler
        .from({ plan: organization.payment.type, period: organization.payment.period })
        .getOrganizationTeamLimit();
      throw GraphErrorException.BadRequest(
        `This organization can have up to ${maxTeam} teams`,
        maxTeam === organizationTeamLimit
          ? ErrorCode.Org.ORGANIZATION_FREE_LIMIT_TEAMS
          : ErrorCode.Org.ORGANIZATION_PREMIUM_LIMIT_TEAMS,
      );
    }

    const uniqueLuminUsers: MembershipInput[] = uniqBy(luminUsers, 'userId');
    const avatarRemoteId = avatarData ? await this.organizationTeamService.uploadTeamAvatarToS3(avatarData) : '';
    const createdTeamData = {
      name: teamInput.name,
      belongsTo: organization._id,
      ownerId: user._id,
      avatarRemoteId,
    };
    const createdTeam = await this.organizationTeamService.createTeam(createdTeamData);
    const [actorInfo, groupPermissions] = await Promise.all([
      this.organizationTeamService.getUserById(user._id as string),
      this.organizationTeamService.createDefaultPermissionWhenCreateTeam(createdTeam, user._id as string),
      this.organizationTeamService.createMembershipInTeam({
        userId: user._id,
        teamId: createdTeam._id,
        role: OrganizationTeamRoles.ADMIN,
      }),
    ]);
    let addedMembers: IMembership[] = [];
    if (uniqueLuminUsers.length) {
      const memberInOrg = await this.organizationTeamService.validateMembershipsInOrganization(organization._id, uniqueLuminUsers);
      addedMembers = await this.organizationTeamService.inviteMemberWhenCreateOrgTeam({
        members: memberInOrg, actorInfo, team: createdTeam, organization, groupPermissions,
      });
    }

    const validAddedMembers = addedMembers.filter((member) => member);
    const memberIds = validAddedMembers.map((member) => member.userId.toHexString());
    this.organizationService.updateContactListWhenInviteMember(user._id as string, memberIds);
    if (validAddedMembers.length !== uniqueLuminUsers.length) {
      return {
        message: 'Some members can not be invited',
        statusCode: HttpStatus.BAD_REQUEST,
        organizationTeam: createdTeam,
      };
    }
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.ORG_TEAM_CREATED,
      eventScope: EventScopes.ORGANIZATION,
      actor: actorInfo,
      team: createdTeam,
      organization,
    });
    return {
      message: 'Create successfully',
      statusCode: HttpStatus.OK,
      organizationTeam: createdTeam,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getRecentNewOrgMembers(
    @Args('orgId') orgId: string,
    @Args('limit') limit: number,
  ): Promise<OrganizationMember[]> {
    return this.organizationService.getRecentNewOrgMembers(orgId, limit);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getOrganizationFolders(
    @Context() context,
    @Args('input') input: GetOrganizationFoldersInput,
  ): Promise<Folder[]> {
    const { _id: userId } = context.req.user;
    const {
      orgId, sortOptions, isStarredTab, searchKey,
    } = input;
    return this.organizationService.getOrganizationFolders({
      orgId,
      userId,
      sortOptions,
      isStarredTab,
      searchKey,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getPersonalFoldersInOrg(
    @Context() context,
    @Args('input') input: GetOrganizationFoldersInput,
  ): Promise<Folder[]> {
    const { user } = context.req;
    const {
      orgId, sortOptions, searchKey,
    } = input;
    return this.organizationService.getPersonalFoldersInOrg({
      orgId, user, searchKey, sortOptions,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getOrganizationFolderTree(
    @Args('input') input: GetOrganizationFolderTreeInput,
  ): Promise<GetOrganizationFolderTreePayload> {
    const { orgId } = input;
    return this.organizationService.getOrganizationFolderTree({
      orgId,
    });
  }

  @Query()
  getOrganizationTeamsFolderTree(
    @Context() context,
    @Args('input') input: GetOrganizationFolderTreeInput,
  ): Promise<GetOrganizationTeamsFolderTreePayload> {
    const { _id: userId } = context.req.user as User;
    const { orgId, teamIds } = input;
    return this.organizationService.getOrgTeamsFolderTree({
      orgId, userId, teamIds,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getPersonalFolderTreeInOrg(
    @Context() context,
    @Args('input') input: GetOrganizationFolderTreeInput,
  ): Promise<GetOrganizationFolderTreePayload> {
    const { _id: userId } = context.req.user;
    const { orgId } = input;
    return this.organizationService.getPersonalFolderTreeInOrg({
      orgId, userId,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getOrganizationTemplates(
    @Args('orgId') orgId: string,
    @Args('tab') tab: OrganizationTemplateTabs,
    @Args('pagingOption') pagingOption: GetTemplatesInput,
    @Context() context,
  ): Promise<GetTemplatesPayload> {
    const { _id: userId } = context.req.user;
    const clientIds = await this.templateService.getClientIdToGetOrgTemplates({ userId, orgId, tab });
    return this.templateService.getTemplatesList(clientIds, pagingOption);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async uploadOrganizationTemplate(
    @Args('input') input: UploadOrganizationTemplateInput,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe())
      files: [FileData],
    @Context() context,
  ): Promise<Template> {
    const { user } = context.req;
    const { template, error } = await this.templateService.uploadTemplate({
      ...input,
      uploaderId: user._id,
      ownerType: TemplateOwnerType.ORGANIZATION,
      files,
    });

    if (error) {
      throw error;
    }
    return template;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard()
  @Mutation()
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  async uploadDocumentToPersonalV2(
    @Context() context,
    @Args('input') input: UploadPersonalDocumentInputV2,
  ): Promise<IDocument> {
    const { user, organization } = context.req;
    const {
      documentId,
      encodedUploadData,
      fileName,
    } = input;
    const { thumbnailRemoteId, documentRemoteId: fileRemoteId } = await this.uploadService.verifyUploadData(user._id as string, encodedUploadData);

    if (documentId) {
      return this.organizationService.convertPersonalDocToLuminByUpload({
        uploader: user,
        fileRemoteId,
        documentId,
      });
    }

    return this.organizationService.uploadDocument({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.PERSONAL,
      fileRemoteId,
      fileName,
      thumbnailRemoteId,
      context: organization,
      folderId: input.folderId,
      isNotify: false,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard()
  @CustomRuleValidator(CustomRuleAction.UPLOAD_THIRD_PARTY_DOCUMENTS)
  @Mutation()
  async uploadThirdPartyDocuments(
    @Args('input') input: UploadThirdPartyDocumentsInput,
    @Context() context,
  ): Promise<Document[]> {
    const { user, organization }: { user: any, organization: IOrganization } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const ownerUser = await this.userService.findUserById(user._id);
    const thirdPartyAccessToken: string = context.req.cookies['google_implicit_access_token'];
    if (thirdPartyAccessToken) {
      this.redisService.setThirdPartyAccessTokenForIndexing(ownerUser._id, thirdPartyAccessToken);
    }
    const { error, documents } = await this.documentService.createThirdPartyDocuments(
      ownerUser,
      {
        ...input,
        clientId: ownerUser._id,
      },
      organization,
    );
    if (error) {
      throw error;
    }

    if (input.documents.some((document) => document.service === ThirdPartyService.google) && !thirdPartyAccessToken) {
      this.loggerService.warn({
        context: 'uploadThirdPartyDocuments',
        message: 'Google access token is not set',
        extraInfo: {
          ownerUserId: ownerUser._id,
          docIds: documents.map((document) => document._id),
        },
      });
    }

    return documents;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  createPersonalFolderInOrg(
    @Args('input') input: CreateOrganizationFolderInput,
    @Context() context,
  ): Promise<IFolder> {
    const { _id: ownerId } = context.req.user;
    const {
      name, color, orgId, parentId,
    } = input;
    return this.organizationService.createPersonalFolderInOrg({
      name,
      color,
      parentId,
      ownerId,
      orgId,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async hideInformMyDocumentModal(
    @Context() context,
  ): Promise<BasicResponse> {
    const { organization, user } = context.req;
    const { _id: userId } = user;
    const migratedOrgUrl = await this.redisService.getMigratedOrgUrl(userId as string);
    if (migratedOrgUrl === organization.url) {
      const key = `${RedisConstants.MIGRATED_ORG_URL_PREFIX}${userId}`;
      await this.redisService.deleteRedisByKey(key);
      return {
        statusCode: HttpStatus.OK,
        message: 'Hide inform modal of migrated document workspace successfully',
      };
    }
    await this.userService.updateUserPropertyById(userId as string, { 'metadata.hasInformedMyDocumentUpload': true });
    return {
      statusCode: HttpStatus.OK,
      message: 'Hide inform modal of upload document successfully',
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.INVITE_MEMBER_TO_ORGANIZATION)
  @Mutation()
  async inviteMemberToOrganization(
    @Args('members') members: [InviteToOrganizationInput],
    @Args('extraTrial') extraTrial: boolean,
    @Context() context,
  ): Promise<InviteMemberToOrganizationPayload> {
    const { user, organization } = context.req;

    const {
      isHasInvalidInvites,
      updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    } = await this.organizationService.inviteMemberToOrganization(
      members,
      organization as IOrganization,
      user as User,
      extraTrial,
    );

    if (isHasInvalidInvites) {
      return {
        message: 'Some members can not be invited',
        statusCode: HttpStatus.BAD_REQUEST,
        organization: updatedOrganization,
        invitations,
      };
    }
    return {
      message: 'Add member successfully',
      statusCode: HttpStatus.OK,
      organization: updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async inviteMemberToOrganizationAddDocStack(
    @Args('members') members: [InviteToOrganizationInput],
    @Args('extraTrial') extraTrial: boolean,
    @Context() context,
  ): Promise<InviteMemberToOrganizationPayload> {
    const { user, organization } = context.req;

    const {
      isHasInvalidInvites,
      updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    } = await this.organizationService.inviteMemberToOrganizationAddDocStack({
      members,
      organization: organization as IOrganization,
      user: user as User,
      extraTrial,
    });

    if (isHasInvalidInvites) {
      return {
        message: 'Some members can not be invited',
        statusCode: HttpStatus.BAD_REQUEST,
        organization: updatedOrganization,
        invitations,
      };
    }
    return {
      message: 'Add member successfully',
      statusCode: HttpStatus.OK,
      organization: updatedOrganization,
      invitations,
      sameDomainEmails,
      notSameDomainEmails,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getRepresentativeMembers(
    @Context() context,
    @CurrentOrganization() organization: IOrganization,
    @CurrentTeam() team: ITeam,
  ): Promise<GetRepresentativeMembersPayload> {
    const { user }: { user: User } = context.req;
    const representativeMembers = await this.organizationService.getRepresentativeMembers({
      teamId: team?._id,
      orgId: organization._id,
      user,
    });
    return {
      representativeMembers,
      message: 'Successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getUsersInvitableToOrg(
    @Context() context: { req: { user: User } },
    @CurrentOrganization() organization: IOrganization,
    @Args('input') input: GetUsersInvitableToOrgInput,
  ): Promise<Email[]> {
    const { user } = context.req;
    const { orgId, userEmails } = input;
    const { settings } = organization;
    const membership = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id, { _id: 1, role: 1 });

    if (settings.inviteUsersSetting === InviteUsersSetting.ADMIN_BILLING_CAN_INVITE && membership.role === OrganizationRoleEnums.MEMBER) {
      throw GraphErrorException.Forbidden('You do not have permission to invite users', ErrorCode.Common.NO_PERMISSION);
    }

    return this.organizationService.getUsersInvitableToOrg({ orgId, userEmails });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getOrganizationResources(
    @Args('input') input: GetOrganizationResourcesInput,
    @CurrentOrganization() organization: IOrganization,
    @Context() ctx: { req: { user: User } },
  ): Promise<GetOrganizationResourcesPayload> {
    return this.organizationService.getOrganizationResources(ctx.req.user, organization, {
      ...input,
      limit: input.limit || GET_ORGANIZATION_RESOURCES_LIMIT,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async checkOrganizationDocStack(
    @Args('orgId') orgId: string,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<CheckOrganizationDocStackPayload> {
    const docStackInfo = await this.organizationDocStackService.getDocStackInfo({
      orgId, payment: organization.payment, totalNewDocument: 1,
    });
    return {
      isOverDocStack: docStackInfo.isOverDocStack,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.ONLY_INTERNAL_INVITE)
  @Query()
  async getOrganizationInviteLink(
    @Context() context,
    @Args('orgId') orgId: string,
  ): Promise<OrganizationInviteLink> {
    const { user, organization } = context.req as { user: User; organization: IOrganization};
    const isPremiumPlan = (this.paymentUtilsService.getPdfPaymentType(organization.payment) as PaymentPlanEnums) !== PaymentPlanEnums.FREE;
    const membership = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id);
    if (!membership || (membership.role === OrganizationRoleEnums.MEMBER && isPremiumPlan)) {
      throw GraphErrorException.Forbidden('You have no permission', ErrorCode.Common.NO_PERMISSION);
    }
    return this.organizationInviteLinkService.getInviteLinkByOrgId(orgId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getFoldersAvailability(
    @Context() context,
    @Args('input') input: GetFoldersAvailabilityInput,
  ): Promise<GetFoldersAvailabilityPayload> {
    const { _id: userId } = context.req.user;
    const {
      orgId,
    } = input;
    return this.organizationService.getFoldersAvailability({ userId, orgId });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async requestSignSeat(
    @Context() context,
    @Args('input') input: RequestSignSeatInput,
  ): Promise<BasicResponse> {
    const { orgId, requestMessage } = input;
    const { user } = context.req;
    await this.organizationService.requestSignSeat({ orgId, user, requestMessage });

    return {
      statusCode: HttpStatus.OK,
      message: 'Request sign seat successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE, CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async uploadDocumentTemplateToPersonal(
    @Context() context,
    @Args('input') input: UploadPersonalDocumentTemplateInput,
  ): Promise<IDocumentTemplate> {
    const { user, organization }: { user: User, organization: IOrganization } = context.req;
    const {
      encodedUploadData,
      fileName,
    } = input;
    const { thumbnailRemoteId, documentRemoteId: fileRemoteId } = await this.uploadService.verifyUploadData(user._id, encodedUploadData);

    return this.organizationService.uploadDocumentTemplate({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.PERSONAL,
      fileRemoteId,
      fileName,
      thumbnailRemoteId,
      context: organization,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE, CustomRuleAction.USE_S3_STORAGE)
  @Mutation()
  async uploadDocumentTemplateToOrganization(
    @Context() context,
    @Args('input') input: UploadDocumentTemplateToOrgInput,
  ): Promise<Partial<IDocumentTemplate> & BasicResponse> {
    const { fileName, encodedUploadData } = input;
    const { organization, user }: { organization: IOrganization, user: User } = context.req;
    const setUploadDocumentKey = await this.redisService.setKeyIfNotExist(`${organization._id}:${user._id}`, '1', '1000');
    if (!setUploadDocumentKey) {
      throw GraphErrorException.NotAcceptable('You are uploading document');
    }
    const { thumbnailRemoteId, documentRemoteId: fileRemoteId } = await this.uploadService.verifyUploadData(user._id, encodedUploadData);
    const documentUploaded = await this.organizationService.uploadDocumentTemplate({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION,
      fileRemoteId,
      fileName,
      thumbnailRemoteId,
      context: organization,
    });

    return {
      ...documentUploaded,
      message: 'Upload organization document template successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE)
  @Query()
  async getOrganizationDocumentTemplates(
    @Args('input') input: GetOrganizationDocumentTemplatesInput,
    @Context() context,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<GetDocumentTemplatesPayload> {
    const { user }: { user: User } = context.req;
    return this.organizationService.getDocumentTemplates({ user, resource: organization, ...input });
  }
}
