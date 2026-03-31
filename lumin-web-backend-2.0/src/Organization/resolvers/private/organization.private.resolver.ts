import {
  forwardRef,
  HttpStatus, Inject, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  Context,
  Query,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { get, intersectionBy, isBoolean } from 'lodash';
import * as moment from 'moment';
import { PipelineStage, QuerySelector } from 'mongoose';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode, ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { OperationLimitConstants } from 'Common/constants/OperationLimitConstants';
import { ORG_PLAN_INDEX } from 'Common/constants/PaymentConstant';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_UPDATE_ORG,
  SUBSCRIPTION_SETTING_UPDATE,
} from 'Common/constants/SubscriptionConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { CurrentOrganization } from 'Common/decorators/organization.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { UpgradingInvoicePayment } from 'Common/guards/upgrading-invoice-payment.guard';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { PaymentLoggingInterceptor } from 'Common/interceptors/payment-logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';

import { AuthService } from 'Auth/auth.service';
import { CountryCodeEnums } from 'Auth/countryCode.enum';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { DocumentMimeType, DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { OrganizationEventService } from 'Event/services/organization.event.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderTypeEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import {
  Document,
  BasicResponse,
  OrganizationProfileInput,
  ChangeOrganizationAvatarPayload,
  OrganizationProfilePayload,
  SetOrganizationMembersRoleInput,
  ExportDomainPayload,
  GetOrganizationInsightPayload,
  GetOrganizationPricePayload,
  Organization,
  DeleteOrganizationPayload,
  ChargeResponse,
  PaymentResponse,
  ReactiveOrganizationPayload,
  ForceResetPasswordPayload,
  CreateOrganizationFolderInput,
  Folder,
  UpdateOrgTemplateWorkspaceInput,
  AddAssociateDomainInput,
  EditAssociateDomainInput,
  RemoveAssociateDomainInput,
  OrganizationSettings,
  DomainVisibilitySetting,
  CreateOrganizationSubscriptionInput,
  UpgradeOrganizationSubscriptionInput,
  SubscriptionTrialInput,
  UpgradeOrganizationSubscriptionPlans,
  PreviewUpcomingDocStackInvoiceInput,
  PreviewDocStackInvoicePayload,
  LoginService,
  Currency,
  GetGoogleUsersNotInCircleInput,
  ExtraTrialDaysOrganizationInput,
  InviteUsersSetting,
  PromptInviteBannerPayload,
  OrganizationInviteLinkInput,
  OrganizationInviteLink,
  GetRequesterInput,
  OrganizationRequesterConnection,
  OrganizationPendingConnection,
  PendingUserOrganizationInput,
  GetSuggestedUserToInviteInput,
  GetSuggestedUserToInvitePayload,
  FindUserPayload,
  BasicResponseData,
  CreateUnifySubscriptionInput,
  PreviewUpcomingSubscriptionInvoiceInput,
  PreviewUpcomingSubscriptionInvoicePayload,
  CreateFreeTrialUnifySubscriptionInput,
  UpgradeUnifySubscriptionInput,
  SamlSsoConfigurationInput,
  SamlSsoConfiguration,
  ScimSsoConfiguration,
  ReactivateUnifySubscriptionInput,
  PaymentPeriod,
  AssignSignSeatsInput,
  UpdateSignSeatsResponse,
  RejectSignSeatRequestsInput,
  RetrieveOrganizationSetupIntentType,
  RetrieveOrganizationSetupIntentV2Input,
  AvatarSuggestionSource,
  ChargeData,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { ActionTypeOfUserInOrg } from 'LuminContract/luminContract.constant';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { CheckLastJoinedOrgGuard } from 'Organization/guards/check-last-joined-org.guard';
import { OrganizationPermissionGuard, AllowInDeleteProcess } from 'Organization/guards/Gql/organization.permission.guard';
import { OrganizationScimGuard } from 'Organization/guards/organization-scim.guard';
import { OrganizationSettingsGuard } from 'Organization/guards/organization-settings.guard';
import { SamlScimFeatureFlagGuard } from 'Organization/guards/saml-scim-feature-flag.guard';
import { IOrganization, IUpdateOrganization } from 'Organization/interfaces/organization.interface';
import { PageInfo } from 'Organization/interfaces/pagination.interface';
import {
  AccessTypeOrganization,
  OrganizationValidationStrategy,
  OrganizationRoleEnums,
  OrganizationTeamRoles,
  OrganizationPromotionEnum,
  SortStrategy,
} from 'Organization/organization.enum';
import { OrganizationInviteLinkService } from 'Organization/organization.inviteLink.service';
import { OrganizationPaymentService } from 'Organization/organization.payment.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { RestrictBillingActionsOrgGuard } from 'Payment/guards';
import { SubScriptionItemSchemaInterface, PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import {
  PaymentPlanEnums, PaymentStatusEnums, UpdateSignWsPaymentActions,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { IUserContext, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Resolver()
@OrganizationPermissionGuard(OrganizationValidationStrategy.PRIVATE, Resource.ORGANIZATION)
@UseInterceptors(SanitizeInputInterceptor)
export class OrganizationPrivateResolver {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly awsService: AwsService,
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly organizationEventService: OrganizationEventService,
    private readonly membershipService: MembershipService,
    private readonly notificationService: NotificationService,
    private readonly blacklistService: BlacklistService,
    private readonly paymentService: PaymentService,
    private readonly folderService: FolderService,
    private readonly authService: AuthService,
    private readonly organizationPaymentService: OrganizationPaymentService,
    private readonly loggerService: LoggerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly organizationInviteLinkService: OrganizationInviteLinkService,
    @Inject(forwardRef(() => LuminContractService))
    private readonly luminContractService: LuminContractService,
    private readonly paymentUtilsService: PaymentUtilsService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateGoogleSignInSecurity(
    @Context() context,
    @Args('isActive') isActive: boolean,
  ): Promise<Organization> {
    const { organization, user } = context.req;
    if (user.loginService !== LoginService.GOOGLE) {
      throw GraphErrorException.Forbidden('Cannot update google sign in security');
    }
    return this.organizationService.updateGoogleSignInSecurity(
      user._id as string,
      organization._id as string,
      { $set: { 'settings.googleSignIn': isActive } },
    );
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async deletePendingInvite(
    @Args('orgId') orgId: string,
    @Args('email') email: string,
  ): Promise<BasicResponse> {
    await this.organizationService.removeRequesterByEmailInOrg(
      email,
      orgId,
      AccessTypeOrganization.INVITE_ORGANIZATION,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete successfully',
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async deleteMemberInOrganization(
    @Context() context,
    @Args('orgId') orgId: string,
    @Args('userId') userId: string,
  ): Promise<BasicResponse> {
    const { user, organization: org } = context.req;
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
    const [userData, adminOfTeams, transferUserEmail] = await Promise.all([
      this.userService.findUserById(userId, {
        name: 1,
        email: 1,
        avatarRemoteId: 1,
        payment: 1,
        setting: 1,
      }, true),
      this.organizationTeamService.getOrgTeamsByUserId(orgId, userId, OrganizationTeamRoles.ADMIN),
      this.redisService.getRedisValueWithKey(transferKey),
    ]);
    if (!userData) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    if (transferUserEmail === userData.email) {
      throw GraphErrorException.BadRequest('Organization owner transfer is processing', ErrorCode.Org.GRANTED_ADMIN_IS_PROCESSING);
    }
    const membershipsOfTeams = await Promise.all(adminOfTeams.map((team) => this.membershipService.find({ teamId: team._id })));
    if (membershipsOfTeams.some((memberships) => memberships.length > 1)) {
      throw GraphErrorException.BadRequest('Cannot remove team admin', ErrorCode.Org.CANNOT_REMOVE_TEAM_ADMIN);
    }

    await Promise.all(adminOfTeams.map((team, teamIndex) => this.organizationTeamService.deleteOrgTeamAndPublishSocket({
      organization: org,
      team,
      actorUser: userData,
      memberships: membershipsOfTeams[teamIndex],
    })));

    const [teamIds, destinationOrg] = await Promise.all([
      this.organizationTeamService.getOrgTeamIdsOfUser(orgId, userId),
      this.organizationService.getDestinationOrgToTransferAgreements(userData, orgId),
    ]);
    const { existAgreement, existAgreementGenDocuments } = await this.organizationService.transferAgreementsToAnotherOrg({
      userId,
      organization: org,
      destinationOrg,
      actionType: ActionTypeOfUserInOrg.DELETE_MEMBER,
    });

    await Promise.all([
      this.organizationService.handleDeleteUserInOrganization({
        actor: user,
        removedId: userId,
        org,
        existAgreement,
        existAgreementGenDocuments,
        destinationTransferAgreement: destinationOrg,
      }),
      this.documentService.removePermissionInGroupPermissions(userId, orgId),
      this.organizationService.insertUnallowedAutoJoinList(userId, orgId),
      this.organizationTeamService.removeMembershipInTeams(
        teamIds,
        userId,
        org._id as string,
      ),
      this.documentService.removeAllPersonalDocInOrg(userData, orgId),
      this.documentService.updateDocumentOwnerId({
        refId: orgId,
        oldOwnerId: userData._id,
        ownerId: org.ownerId as string,
        role: DocumentRoleEnum.ORGANIZATION,
      }),
      this.folderService.removeAllPersonalFolderInOrg({
        user: userData,
        orgId,
      }),
      this.authService.unlinkSamlLoginService({ userId }),
    ]);

    this.userService.trackPlanAttributes(userId);
    const shouldDeleteDefaultWorkspace = userData.setting.defaultWorkspace?.toHexString() === orgId;
    if (shouldDeleteDefaultWorkspace) {
      await this.userService.findOneAndUpdate({ _id: userData._id }, { $unset: { 'setting.defaultWorkspace': 1 } });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async changeProfileOrganization(
    @Args('orgId') orgId: string,
    @Args('profile') profile: OrganizationProfileInput,
  ): Promise<Partial<OrganizationProfilePayload>> {
    const { name } = profile;

    const updateOrganization = await this.organizationService.updateOrganizationById(
      orgId,
      {
        $set: {
          name,
        },
      },
    );

    if (!updateOrganization) {
      throw GraphErrorException.UnprocessableError(
        "Can't update profile of organization",
        ErrorCode.Org.CANNOT_UPDATE_ORG_PROFILE,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Update successfully',
      data: updateOrganization,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async removeAvatarOrganization(
    @Args('orgId') orgId: string,
  ): Promise<BasicResponse> {
    const { avatarRemoteId } = await this.organizationService.getOrgById(
      orgId,
      { avatarRemoteId: 1 },
    );

    await this.awsService.removeFileFromBucket(avatarRemoteId, EnvConstants.S3_PROFILES_BUCKET);
    const updateOrganization = await this.organizationService.updateOrganizationById(
      orgId,
      {
        $set: {
          avatarRemoteId: '',
        },
      },
    );

    if (!updateOrganization) {
      throw GraphErrorException.UnprocessableError(
        "Can't update profile of organization",
        ErrorCode.Org.CANNOT_UPDATE_ORG_PROFILE,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Update successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async changeAvatarOrganization(
    @Args('orgId') orgId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      {
        fileBuffer,
        mimetype,
      }: { fileBuffer: Buffer; mimetype: string; filename: string },
  ): Promise<ChangeOrganizationAvatarPayload> {
    const keyFile = await this.awsService.uploadOrganizationAvatar(
      fileBuffer,
      mimetype,
    );

    const updateOrganization = await this.organizationService.updateOrganizationById(
      orgId,
      {
        $set: {
          avatarRemoteId: keyFile,
        },
        $unset: {
          'metadata.avatarSuggestion': 1,
        },
      },
    );
    if (!updateOrganization) {
      throw GraphErrorException.UnprocessableError(
        "Can't update avatar of organization",
        ErrorCode.Org.CANNOT_UPDATE_ORG_PROFILE,
      );
    }
    return {
      avatarRemoteId: keyFile,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async setAvatarOrganizationSuggestion(
    @Args('orgId') orgId: string,
    @Context() context,
  ): Promise<ChangeOrganizationAvatarPayload> {
    const { user } = context.req;
    const emailDomain = Utils.getEmailDomain(user.email as string);
    const result = await this.organizationService.getOrgAvatarSuggestionKey({
      emailDomain,
    });

    if (!result?.keyFile) {
      return { avatarRemoteId: null };
    }
    const { keyFile } = result;
    const updatedOrganization = await this.organizationService.updateOrganizationByCondition(
      {
        _id: orgId,
        avatarRemoteId: { $in: [null, ''] },
        'metadata.avatarSuggestion.suggestionAvatarRemoteId': { $in: [null, ''] },
      },
      {
        $set: {
          'metadata.avatarSuggestion.suggestionAvatarRemoteId': keyFile,
          'metadata.avatarSuggestion.source': AvatarSuggestionSource.external_logo,
          'metadata.avatarSuggestion.suggestedAt': new Date(),
        },
      },
    );

    if (!updatedOrganization) {
      return { avatarRemoteId: null };
    }
    return { avatarRemoteId: keyFile };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async setAvatarFromSuggestion(
    @Args('orgId') orgId: string,
    @Context() context,
  ): Promise<ChangeOrganizationAvatarPayload> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const { metadata } = organization;
    const emailDomain = Utils.getEmailDomain(user.email as string);
    const keyFile = metadata?.avatarSuggestion?.suggestionAvatarRemoteId ?? (await this.redisService.getAvatarSuggestionFromExternalUrl(emailDomain));
    if (!keyFile) {
      throw GraphErrorException.UnprocessableError('Avatar suggestion not found');
    }
    const avatarRemoteId = await this.awsService.applySuggestionAvatar(
      keyFile,
      DocumentMimeType.JPEG,
    );
    const updatedOrganization = await this.organizationService.updateOrganizationById(orgId, {
      $set: { avatarRemoteId },
      $unset: { 'metadata.avatarSuggestion': 1 },
    });
    if (!updatedOrganization) {
      throw GraphErrorException.UnprocessableError('Failed to set avatar from suggestion');
    }
    return { avatarRemoteId };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async setOrganizationMembersRole(
    @Args('input') input: SetOrganizationMembersRoleInput,
    @Context() context,
  ) : Promise<BasicResponse> {
    const { user } = context.req;
    const { orgId, members } = input;
    if (members.length === 0) {
      throw GraphErrorException.BadRequest("Members can't be empty", ErrorCode.Common.INVALID_INPUT);
    }
    await this.organizationService.grantOrgMembersRole(orgId, user._id as string, members);
    return {
      statusCode: HttpStatus.OK,
      message: 'Grant role successfully!',
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async acceptRequestingAccessOrganization(
    @Args('orgId') orgId: string,
    @Args('userId') userId: string,
    @Context() context,
  ): Promise<BasicResponseData> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const [currentUser, approvedUser] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
      this.userService.findUserById(userId),
    ]);
    await this.organizationService.validateUpgradingEnterprise(organization._id);
    if (!approvedUser) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const requesting = await this.organizationService.getRequestAccessByCondition({
      actor: approvedUser.email, target: orgId, type: AccessTypeOrganization.REQUEST_ORGANIZATION,
    });
    if (!requesting) {
      throw GraphErrorException.NotFound('User not found in requesting access', ErrorCode.User.USER_NOT_FOUND);
    }
    const totalOrgMember = await this.organizationService.getTotalMemberInOrg(organization._id);
    const isUnlimitMemberPayment = this.organizationService.checkIsUnlimitMemberPayment(organization.payment.type as PaymentPlanEnums);
    const validatedMember = this.organizationService.validateTotalMemberJoinOrg(1, organization, totalOrgMember);
    if (!validatedMember.isAllow) {
      throw GraphErrorException.BadRequest(validatedMember.message, ErrorCode.Org.ORGANIZATION_MEMBER_EXCEEDED);
    }
    if (!isUnlimitMemberPayment) {
      await this.organizationService.updatePaymentWhenInviteMember(organization, 1, totalOrgMember);
    }

    const { _id, email } = approvedUser;
    const memberData = {
      userId: _id,
      email,
      orgId,
      internal: Utils.isInternalOrgMember(email, organization),
      role: OrganizationRoleEnums.MEMBER,
    };
    const result = await this.organizationService.handleAddMemberToOrg(memberData);
    if (!result) {
      throw GraphErrorException.Forbidden('Can not add member to organization', ErrorCode.Org.CANNOT_ADD_MEMBER_TO_ORGANIZATION);
    }

    this.organizationService.removeRequestOrInviteOrg(approvedUser, orgId);

    const totalMemberAfterAdded = totalOrgMember + 1;
    const isUsingAutoApprove = organization.settings.domainVisibility === DomainVisibilitySetting.VISIBLE_AUTO_APPROVE;
    const shouldDisableAutoApprove = isUsingAutoApprove
      && !this.organizationService.validateTotalMemberJoinOrg(1, organization, totalMemberAfterAdded).isAllow;

    if (shouldDisableAutoApprove) {
      await this.organizationService.turnOffAutoApprove(orgId);
    }

    this.organizationService.notifyAcceptJoinOrg(approvedUser, currentUser, organization);
    this.organizationService.sendEmailAcceptJoinOrg(approvedUser, currentUser, organization);
    return {
      statusCode: HttpStatus.OK,
      message: 'Accepted',
      data: {
        email,
      },
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async rejectRequestingAccessOrganization(
    @Args('orgId') orgId: string,
    @Args('userId') userId: string,
  ): Promise<BasicResponse> {
    const foundUser = await this.userService.findUserById(userId, { email: 1, _id: 1 });
    if (!foundUser) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const requestAccess = await this.organizationService.getRequestAccessByCondition({
      actor: foundUser.email, target: orgId, type: AccessTypeOrganization.REQUEST_ORGANIZATION,
    });

    if (requestAccess.length > 0) {
      await Promise.all([
        this.organizationService.removeRequestOrInviteOrg(foundUser, orgId),
        this.organizationService.insertUnallowedAutoJoinList(userId, orgId),
        this.notificationService.removeRequestJoinOrgNotification({
          actorId: userId,
          entityId: orgId,
        }),
      ]);
      return {
        statusCode: HttpStatus.OK,
        message: 'Rejected',
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Reject requesting fail',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async exportDomainData(
    @Context() context,
    @Args('orgId') orgId: string,
  ) : Promise<ExportDomainPayload> {
    const { user } = context.req;
    const url: string = await this.organizationService.exportDomainData(orgId, user._id as string);
    return {
      url,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @AllowInDeleteProcess()
  @Query()
  async getOrganizationInsight(
    @Args('orgId') orgId: string,
  ): Promise<GetOrganizationInsightPayload> {
    const organization = await this.organizationService.getOrgById(orgId);
    if (organization.payment.type === PaymentPlanEnums.FREE) {
      throw GraphErrorException.Forbidden('Your free org cannot get insight statistic', ErrorCode.Org.ORG_FREE_CANNOT_GET_INSIGHT);
    }
    const [documentInsight, nonDocumentInsight] = await Promise.all([
      this.organizationEventService.getDocumentInsightStats(orgId),
      this.organizationEventService.getNonDocumentInsightStats(orgId),
    ]);
    const lastUpdated = Math.max(
      documentInsight.documentStat.lastUpdated,
      nonDocumentInsight.nonDocumentStat.lastUpdated,
    ).toString();
    return {
      ...documentInsight,
      ...nonDocumentInsight,
      lastUpdated,
    };
  }

  @UseGuards(RateLimiterGuard, CheckLastJoinedOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(UpgradingInvoicePayment)
  @Mutation()
  async scheduleDeleteOrganization(
    @Context() context,
  ): Promise<DeleteOrganizationPayload> {
    const {
      organization: {
        _id: orgId, payment: orgPayment, deletedAt,
      },
      user,
    } = context.req;
    if (deletedAt) {
      throw GraphErrorException.BadRequest('Organization has been processed to delete', ErrorCode.Org.OGANIZATION_DELETING);
    }
    const isOrganizationUpgradeEnterprise = await this.organizationService.isOrganizationUpgradeEnterprise(orgId as string);
    if (isOrganizationUpgradeEnterprise) {
      throw GraphErrorException.BadRequest('Can not delete organization', ErrorCode.Org.CANNOT_DELETE_ORGANIZATION);
    }
    const updatedObj: IUpdateOrganization = {
      deletedAt: moment().add(3, 'days').toDate(),
    };
    const isTrialing = orgPayment.status === PaymentStatusEnums.TRIALING;
    if (orgPayment.type !== PaymentPlanEnums.FREE) {
      if (isTrialing) {
        const updatedOrg = await this.paymentService.cancelFreeTrial({
          targetId: orgId,
          subscriptionRemoteId: orgPayment.subscriptionRemoteId,
        });
        updatedObj.payment = updatedOrg.payment;
      } else if (orgPayment.status !== PaymentStatusEnums.CANCELED) {
        await this.paymentService.updateStripeSubscription(
          orgPayment.subscriptionRemoteId as string,
          {
            cancel_at_period_end: true,
          },
          {
            stripeAccount: orgPayment.stripeAccountId,
          },
        );
      }
      if (!isTrialing) {
        updatedObj['payment.status'] = PaymentStatusEnums.CANCELED;
        const { subscriptionItems = [] } = orgPayment as PaymentSchemaInterface;
        updatedObj['payment.subscriptionItems'] = subscriptionItems.map((item) => ({
          ...item,
          paymentStatus: PaymentStatusEnums.CANCELED,
        }));
      }
      updatedObj['settings.domainVisibility'] = DomainVisibilitySetting.VISIBLE_NEED_APPROVE;
    }
    const [newOrg, allMembers] = await Promise.all([
      this.organizationService.updateOrganizationById(
        orgId as string,
        updatedObj,
      ),
      this.organizationService.getMembersByOrgId(orgId as string, { userId: 1 }),
    ]);
    this.userService.updateUsers(
      {
        _id: {
          $in: allMembers
            .map((member) => member.userId.toHexString())
            .filter((userId) => userId !== user._id),
        },
        'metadata.beRemovedFromDeletedOrg': { $ne: true },
      },
      { $set: { 'metadata.beRemovedFromDeletedOrg': true } },
    );
    this.redisService.addOrgToDelete(orgId as string);
    this.userService.trackPlanAttributes(user._id as string);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization has been processed to delete',
      organization: newOrg,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @AllowInDeleteProcess()
  @Query()
  async getOrganizationPrice(
    @Args('orgId') orgId: string,
  ): Promise<GetOrganizationPricePayload> {
    const orgPlan = await this.organizationService.getOrgPlan(orgId);
    return {
      pricePerUnit: orgPlan.amount,
      interval: orgPlan.interval,
    };
  }

  /** @deprecated use createUnifySubscriptionInOrganization instead */
  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createSubscriptionInOrganization(
    @Context() context,
    @Args('subcriptionInput') input: CreateOrganizationSubscriptionInput,
  ): Promise<ChargeResponse> {
    const { user: { _id, countryCode }, organization } = context.req;
    const {
      plan, tokenId, period, currency, couponCode, stripeAccountId: stripeAccountIdInput, isBlockedPrepaidCardOnTrial,
    } = input;
    if (organization.payment.type === plan) {
      throw GraphErrorException.BadRequest('This org has already charged', ErrorCode.Org.ORG_ALREADY_CHARGED);
    }
    if (organization.payment.type !== PaymentPlanEnums.FREE) {
      throw GraphErrorException.BadRequest('You can\'t create subscription', ErrorCode.Common.CANNOT_CREATE_SUBSCRIPTION);
    }
    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const actorInfo = await this.userService.findUserById(_id, {
        _id: 1, email: 1, name: 1, payment: 1, metadata: 1,
      });
      const updatePayment = await this.organizationService.createOrganizationSubcription({
        actor: actorInfo as IUserContext,
        organization,
        incomingPayment: {
          planName: plan,
          period,
          currency,
          stripeAccountId,
        },
        paymentMethod: tokenId,
        couponCode,
        ...(isBoolean(isBlockedPrepaidCardOnTrial) && { blockedPrepaidCardOnTrial: 'true' }),
      });
      return { statusCode: 200, message: 'Create subscription successfully', data: updatePayment };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: _id,
          orgId: organization._id,
          stripeAccountId,
          countryCode,
          plan,
          tokenId,
          period,
          currency,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createUnifySubscriptionInOrganization(
    @Context() context,
    @Args('subscriptionInput') input: CreateUnifySubscriptionInput,
  ): Promise<ChargeResponse> {
    const { user, organization } = context.req;
    const { _id, countryCode }: IUserContext = user;
    const {
      paymentMethod, couponCode, stripeAccountId: stripeAccountIdInput, period, currency, subscriptionItems, isBlockedPrepaidCardOnTrial,
    } = input;
    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }

    if (!!organization.payment.subscriptionItems.length) {
      throw GraphErrorException.BadRequest('This org has already charged', ErrorCode.Org.ORG_ALREADY_CHARGED);
    }

    if (organization.payment.type !== PaymentPlanEnums.FREE) {
      throw GraphErrorException.BadRequest('You can\'t create subscription', ErrorCode.Common.CANNOT_CREATE_SUBSCRIPTION);
    }

    if (user.payment.type !== PaymentPlanEnums.FREE && !this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('You can\'t create subscription', ErrorCode.Common.CANNOT_CREATE_SUBSCRIPTION);
    }

    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      const updatedOrg = await this.organizationService.createOrganizationUnifySubscription({
        actor: user,
        organization,
        incomingPayment: {
          stripeAccountId,
          currency,
          period,
          subscriptionItems: subscriptionItems.map((sub) => ({
            productName: sub.productName,
            paymentType: sub.planName,
            quantity: sub.quantity,
          })),
        },
        paymentMethod,
        couponCode,
        ...(isBoolean(isBlockedPrepaidCardOnTrial) && { blockedPrepaidCardOnTrial: 'true' }),
      });

      return {
        statusCode: 200,
        message: 'Create subscription successfully',
        data: updatedOrg.payment as ChargeData,
        organization: updatedOrg,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: _id,
          orgId: organization._id,
          stripeAccountId,
          countryCode,
          paymentMethod,
          couponCode,
          subscriptionItems,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  /** @deprecated use `upgradeUnifySubscriptionInOrganization` instead */
  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async upgradeOrganizationSubcription(
    @Args('upgradeSubcriptionInput') input: UpgradeOrganizationSubscriptionInput,
    @Context() context,
  ): Promise<ChargeResponse> {
    const { organization, user: actor } = context.req;
    const { plan } = input;
    try {
      if ([
        UpgradeOrganizationSubscriptionPlans.ORG_BUSINESS,
        UpgradeOrganizationSubscriptionPlans.ORG_STARTER,
        UpgradeOrganizationSubscriptionPlans.ORG_PRO,
      ].includes(plan)) {
        return await this.organizationService.upgradeDocStackPlanSubscription({ userId: actor._id, organization, input });
      }
      // Upgrade size only
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const upgradeOrgSubscriptionData = await this.paymentService.upgradeBusinessSubscription(input, organization);
      return upgradeOrgSubscriptionData;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          plan,
          orgId: organization._id,
          userId: actor._id,
          countryCode: actor.countryCode,
          stripeAccountId: organization.payment.stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async upgradeUnifySubscriptionInOrganization(
    @Args('subscriptionInput') input: UpgradeUnifySubscriptionInput,
    @Context() context,
  ): Promise<ChargeResponse> {
    const { organization } = context.req;
    const { user }: { user: IUserContext } = context.req;
    const {
      period, currency, subscriptionItems, couponCode, paymentMethod, isBlockedPrepaidCardOnTrial,
    } = input;
    const { stripeAccountId, subscriptionItems: currentSubscriptionItems, type } = organization.payment;
    await this.organizationService.validateUpgradingEnterprise(organization._id as string);

    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }
    if (type === PaymentPlanEnums.ENTERPRISE) {
      const isChargedSign = this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: currentSubscriptionItems });
      if (!isChargedSign) {
        throw GraphErrorException.BadRequest(
          'You can\'t upgrade new Sign product while workspace has Enterprise plan',
          ErrorCode.Payment.CANNOT_UPGRADE_SUBSCRIPTION,
        );
      }
    }
    if (user.payment.type !== PaymentPlanEnums.FREE && !this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('You can\'t upgrade subscription', ErrorCode.Payment.CANNOT_UPGRADE_SUBSCRIPTION);
    }
    let discountCode = couponCode;
    let isUpgradedWithSensitiveCoupon = false;
    if (couponCode) {
      const promotionCode = await this.paymentService.getTimeSensitivePromotionCode({ orgId: organization._id, couponCode, stripeAccountId });
      if (promotionCode) {
        this.paymentService.validatePromotionCode({ promotionCode, stripeAccountId, period });
        discountCode = promotionCode.id;
        isUpgradedWithSensitiveCoupon = true;
      }
    }

    try {
      const updatedOrganization = await this.organizationService.upgradeUnifySubscription({
        organization,
        actor: user,
        paymentMethod,
        ...(isBoolean(isBlockedPrepaidCardOnTrial) && { blockedPrepaidCardOnTrial: 'true' }),
        ...(isUpgradedWithSensitiveCoupon && { upgradedWithSensitiveCoupon: 'true' }),
        incomingPayment: {
          currency,
          period,
          discountCode,
          stripeAccountId,
          subscriptionItems: subscriptionItems.map((sub) => ({
            paymentType: sub.planName,
            quantity: sub.quantity,
            productName: sub.productName,
          })),
        },
      });

      // Mark promotion as claimed when upgraded with sensitive coupon
      if (isUpgradedWithSensitiveCoupon) {
        await this.organizationService.updatePromotionClaimed({
          org: organization,
          promotion: OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL,
        });
      }

      return {
        message: 'Upgrade Plan Success!',
        statusCode: 200,
        data: updatedOrganization.payment as ChargeData,
        organization: updatedOrganization,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          subscriptionItems,
          orgId: organization._id,
          userId: user._id,
          countryCode: user.countryCode,
          stripeAccountId: organization.payment.stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @AllowInDeleteProcess()
  @Mutation()
  async reactiveOrganization(@Context() context): Promise<ReactiveOrganizationPayload> {
    const { organization } : { organization: IOrganization } = context.req;
    const { _id: orgId, payment, deletedAt } = organization;

    if (!deletedAt) {
      throw GraphErrorException.BadRequest(
        'Organization has not been scheduled to delete',
        ErrorCode.Org.ORGANIZATION_HAS_NOT_BEEN_SCHEDULED_TO_DELETE,
      );
    }

    const updatedObj = { deletedAt: null, payment };
    if (payment.type !== PaymentPlanEnums.FREE) {
      const currentPayment = await this.paymentService.getNewPaymentObject(payment);
      const incomingPayment = {
        status: PaymentStatusEnums.ACTIVE,
        currency: payment.currency as Currency,
        period: payment.period as PaymentPeriod,
        subscriptionItems: currentPayment.subscriptionItems,
        stripeAccountId: currentPayment.stripeAccountId,
      };
      const subscription = await this.organizationService.reactivatePaymentOrganization({
        organization: {
          ...organization,
          payment: currentPayment,
        },
        incomingPayment,
      });
      updatedObj.payment = this.paymentService.getIncomingPaymentObject({
        currentPayment,
        incomingPayment,
        subscription,
        trialInfo: currentPayment.trialInfo,
      });
    }
    const newOrganization = await this.organizationService.updateOrganizationById(orgId, updatedObj);
    this.redisService.removeOrgsToDelete([orgId]);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reactive organization success',
      organization: newOrganization,
    };
  }

  @UseGuards(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async reactiveOrganizationSubscription(@Context() context): Promise<PaymentResponse> {
    const { organization, user } : { organization: IOrganization, user: User } = context.req;
    const { _id: orgId, payment: orgPayment } = organization;
    try {
      let updatedClient: IOrganization;
      const subscriptionData = await this.organizationService.reactivePaymentOrganization(orgPayment, async () => {
        updatedClient = await this.organizationService.updateOrganizationProperty(orgId, {
          'payment.status': PaymentStatusEnums.ACTIVE,
        });
      });
      this.userService.trackPlanAttributes(user._id);
      const productId = get(subscriptionData, 'items[0].price.product');
      Object.assign(updatedClient.payment, { productId });
      return {
        message: 'Reactive subscription success',
        statusCode: 200,
        data: updatedClient.payment,
        organization: updatedClient,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          scope: 'Payment',
          orgId,
          userId: user._id,
          countryCode: user.countryCode,
          stripeAccountId: orgPayment.stripeAccountId,
          originError: error,
        },
      );
    }
  }

  @UseGuards(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async reactivateUnifyOrganizationSubscription(
    @Context() context,
    @Args('input') input: ReactivateUnifySubscriptionInput,
  ): Promise<PaymentResponse> {
    const { organization, user } : { organization: IOrganization, user: User } = context.req;
    const { _id: orgId } = organization;
    const { subscriptionItems: subscriptionItemsInput } = input;
    const currentPayment = await this.paymentService.getNewPaymentObject(organization.payment);
    const { subscriptionItems } = currentPayment;
    const toReactiveItems = intersectionBy(subscriptionItems, subscriptionItemsInput, 'productName');
    if (!toReactiveItems.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED)) {
      throw GraphErrorException.BadRequest('Cannot reactivate subscription');
    }
    try {
      const incomingPayment = {
        status: PaymentStatusEnums.ACTIVE,
        currency: currentPayment.currency as Currency,
        period: currentPayment.period as PaymentPeriod,
        subscriptionItems: toReactiveItems,
        stripeAccountId: currentPayment.stripeAccountId,
      };
      const subscription = await this.organizationService.reactivatePaymentOrganization({
        organization: {
          ...organization,
          payment: currentPayment,
        },
        incomingPayment,
      });
      const updatedClient = await this.organizationService.updateOrganizationProperty(orgId, {
        payment: this.paymentService.getIncomingPaymentObject({
          currentPayment,
          incomingPayment,
          subscription,
          trialInfo: currentPayment.trialInfo,
        }),
      });
      this.userService.trackPlanAttributes(user._id);
      const productId = get(subscription, 'items.data')
        .find((subItem) => subItem.metadata.productName === toReactiveItems[0].productName)?.price?.product;
      this.organizationService.publishUpdateSignWorkspacePayment({
        organization,
        userIds: [user._id],
        action: UpdateSignWsPaymentActions.REACTIVATE_SUBSCRIPTION,
      });
      (updatedClient.payment as any).productId = productId as string;
      return {
        message: 'Reactive subscription success',
        statusCode: 200,
        data: updatedClient.payment,
        organization: updatedClient,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          scope: 'Payment',
          orgId,
          userId: user._id,
          countryCode: user.countryCode,
          stripeAccountId: currentPayment.stripeAccountId,
          originError: error,
        },
      );
    }
  }

  /**
   * @deprecated
   */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  forceResetOrgMemberPassword(): ForceResetPasswordPayload {
    return { signOut: false };
  }

  @Mutation()
  async createOrganizationFolder(
    @Context() context,
    @Args('input') input: CreateOrganizationFolderInput,
  ): Promise<Folder> {
    const { _id: ownerId } = context.req.user;
    const {
      name, color, orgId, parentId, isNotify,
    } = input;
    return this.organizationService.createFolder({
      name,
      color,
      parentId,
      ownerId,
      refId: orgId,
      folderType: FolderTypeEnum.ORGANIZATION,
      isNotify,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateOrgTemplateWorkspace(
    @Context() context,
    @Args('input') input: UpdateOrgTemplateWorkspaceInput,
  ) : Promise<Organization> {
    const { user } = context.req;
    const { workspaceTemplate, orgId } = input;
    const organization = await this.organizationService.updateOrganizationById(orgId, { 'settings.templateWorkspace': workspaceTemplate });
    const receiverIds = await this.organizationService.getReceiverSubscriptionIds(orgId, [user._id as string]);
    this.organizationService.publishUpdateOrganization(
      receiverIds,
      {
        orgId,
        organization,
        type: SUBSCRIPTION_SETTING_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
    return organization;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  addAssociateDomain(
    @Context() context,
    @Args('input') input: AddAssociateDomainInput,
  ) : Promise<Organization> {
    const { organization } = context.req;
    const { associateDomain } = input;
    return this.organizationService.addAssociateDomain({ organization, associateDomain });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  editAssociateDomain(
    @Context() context,
    @Args('input') input: EditAssociateDomainInput,
  ) : Promise<Organization> {
    const { organization } = context.req;
    const { oldAssociateDomain, newAssociateDomain } = input;
    return this.organizationService.editAssociateDomain({ organization, newAssociateDomain, oldAssociateDomain });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  removeAssociateDomain(
    @Context() context,
    @Args('input') input: RemoveAssociateDomainInput,
  ) : Promise<Organization> {
    const { organization } = context.req;
    const { associateDomain } = input;
    return this.organizationService.removeAssociateDomain({ organization, associateDomain });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createOrgStartedDocument(
    @Args('orgId') orgId: string,
    @Args('isMobile') isMobile: boolean,
    @Context() context,
  ): Promise<Document> {
    const { user } = context.req;
    const { document, error } = await this.documentService.createOrgStartedDocument(user._id as string, orgId, isMobile);

    if (error) {
      throw error;
    }

    return document;
  }

  @UseGuards(RateLimiterGuard, OrganizationSettingsGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateDomainVisibilitySetting(
    @Args('visibilitySetting') visibilitySetting: DomainVisibilitySetting,
    @Context() context,
  ): Promise<OrganizationSettings> {
    const { organization }: { organization: IOrganization } = context.req;
    const { error } = await this.organizationService.validateUpdateVisibilitySetting(visibilitySetting, organization);
    if (error) {
      throw error;
    }
    const updatedOrg = await this.organizationService.updateOrganizationById(organization._id, {
      'settings.domainVisibility': visibilitySetting,
    });
    return updatedOrg.settings;
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async resendOrganizationInvitation(
    @Context() context,
    @Args('invitationId') invitationId: string,
  ): Promise<BasicResponse> {
    const { organization, user: { _id: userId } } = context.req;
    const [requestAccess] = await this.organizationService.getRequestAccessByCondition({
      _id: invitationId,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
      target: organization._id,
    });
    const actor = await this.userService.findUserById(userId as string, { name: 1, email: 1 });
    if (!requestAccess) {
      throw GraphErrorException.NotFound('Invitation was not existed');
    }
    const { value: hasSentOrgInvitation, ttl } = await this.redisService.hasSentOrgInvitation(requestAccess._id);
    if (hasSentOrgInvitation) {
      throw GraphErrorException.BadRequest(
        'You already resent invitation, try again later',
        ErrorCode.Org.ORG_INVITATION_ALREADY_SENT,
        { ttl: Math.round(ttl / 60) },
      );
    }
    this.redisService.setResentOrgInvitation(requestAccess._id);

    const invitedUser = await this.userService.findUserByEmail(requestAccess.actor);
    if (invitedUser) {
      const rejectedBlacklist = await this.blacklistService.getBlacklistByUserIds(
        BlacklistActionEnum.INVITE_USER,
        organization._id as string,
        [invitedUser._id],
      );
      if (rejectedBlacklist.length) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Resend organization invitation successfully',
        };
      }
      this.organizationService.resendOrgInvitationNotification({
        actor,
        requestAccess,
        invitedUser,
        organization,
      });
    }
    this.organizationService.updateRequestAccessUser(requestAccess._id, { inviterId: actor._id });

    const isSameUnpopularDomain = Utils.checkSameUnpopularDomainEmail(actor.email, requestAccess.actor);
    this.organizationService.sendMailToInvitedUser({
      actor: actor as { name: string, email: string },
      organization,
      emails: [requestAccess.actor],
      existedUsers: invitedUser ? [invitedUser] : [],
      isNeedApprove: !isSameUnpopularDomain,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Resend organization invitation successfully',
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async removeOrganizationInvitation(
    @Context() context,
    @Args('invitationId') invitationId: string,
  ): Promise<BasicResponse> {
    const { organization, user } = context.req;
    const [[requestAccess], membership] = await Promise.all([
      this.organizationService.getRequestAccessByCondition({
        _id: invitationId,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
        target: organization._id,
      }),
      this.organizationService.getMembershipByOrgAndUser(
        organization._id as string,
        user._id as string,
      ),
    ]);
    if (!requestAccess) {
      throw GraphErrorException.NotFound('Invitation was not existed');
    }
    if (
      membership.role === OrganizationRoleEnums.BILLING_MODERATOR
      && membership.role === requestAccess.entity.role
    ) {
      throw GraphErrorException.Forbidden(
        'You do not have permission to remove this invitation',
      );
    }
    await this.organizationService.removeRequestAccessAndNotification({ requestAccess, organization });
    return {
      statusCode: HttpStatus.OK,
      message: 'Remove organization invitation successfully',
    };
  }

  /** @deprecated use `createFreeTrialUnifySubscription` instead */
  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createFreeTrialSubscription(
    @Args('input') input: SubscriptionTrialInput,
    @Context() context,
  ): Promise<PaymentResponse> {
    const { user: { _id: userId, countryCode }, organization } = context.req;
    const {
      plan, currency, period, orgId, stripeAccountId: stripeAccountIdInput,
    } = input;
    const user = await this.userService.findUserById(userId as string);
    const isUsingProfessional = user.payment.type === PaymentPlanEnums.PROFESSIONAL;
    const isBusinessOrg = organization.payment.type === PaymentPlanEnums.BUSINESS;
    const { highestTrial } = organization?.payment?.trialInfo || {};
    if (highestTrial === plan) {
      throw GraphErrorException.NotAcceptable('You are already use this free trial', ErrorCode.Payment.CANNOT_USE_SAME_TRIAL);
    }
    if (ORG_PLAN_INDEX[plan] <= ORG_PLAN_INDEX[highestTrial] || isUsingProfessional || isBusinessOrg) {
      throw GraphErrorException.NotAcceptable('You can not start this trial', ErrorCode.Payment.CANNOT_USE_LOWER_TRIAL);
    }
    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      const updatedOrg = await this.paymentService.createFreeTrialPlan({
        userId, organization, input, stripeAccountId,
      });
      const documentUploadKey = `${RedisConstants.RATE_LIMIT_PREFIX}${OperationLimitConstants.DOCUMENT_UPLOAD}:${userId}`;
      this.redisService.deleteRedisByKey(documentUploadKey);
      const canExtraFreeTrialDay = await this.featureFlagService.getFeatureIsOn({
        user,
        featureFlagKey: FeatureFlagKeys.MODAL_EXTRA_FREE_TRIAL_DAYS,
        extraInfo: {
          browserLanguage: context.req.headers['accept-language'],
        },
      });
      if (canExtraFreeTrialDay) {
        const key = `${RedisConstants.CAN_EXTRA_TRIAL}${userId}-${orgId}`;
        this.redisService.setRedisDataWithExpireTime({ key, value: '1', expireTime: 60 * 60 * 24 * 7 });
      }
      return {
        statusCode: 200,
        message: 'Create subscription successfully',
        data: updatedOrg.payment,
        organization: updatedOrg,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId,
          plan,
          currency,
          period,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createFreeTrialUnifySubscription(
    @Args('input') input: CreateFreeTrialUnifySubscriptionInput,
    @Context() context,
  ): Promise<PaymentResponse> {
    const { user, organization } = context.req;
    const { _id: userId, countryCode } = user as IUserContext;
    const {
      currency,
      period,
      orgId,
      stripeAccountId: stripeAccountIdInput,
      subscriptionItems: subscriptionItemsInput,
      paymentMethod,
      isBlockedPrepaidCardOnTrial,
    } = input;

    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems: subscriptionItemsInput })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }

    if (this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: subscriptionItemsInput })) {
      throw GraphErrorException.NotAcceptable('You can not start this trial', ErrorCode.Payment.CANNOT_START_SIGN_TRIAL);
    }

    const currentSubscriptionItems = organization.payment.subscriptionItems as SubScriptionItemSchemaInterface[] || [];
    if (this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: currentSubscriptionItems })) {
      throw GraphErrorException.NotAcceptable('You can not start this trial', ErrorCode.Payment.CANNOT_START_SIGN_TRIAL);
    }

    const { highestTrial } = organization?.payment?.trialInfo || {};
    const subscriptionItem = subscriptionItemsInput[0];
    if (highestTrial === subscriptionItem.planName) {
      throw GraphErrorException.NotAcceptable('You are already use this free trial', ErrorCode.Payment.CANNOT_USE_SAME_TRIAL);
    }

    const isUsingProfessional = user.payment.type === PaymentPlanEnums.PROFESSIONAL;
    if (ORG_PLAN_INDEX[subscriptionItem.planName] <= ORG_PLAN_INDEX[highestTrial] || isUsingProfessional) {
      throw GraphErrorException.NotAcceptable('You can not start this trial', ErrorCode.Payment.CANNOT_USE_LOWER_TRIAL);
    }
    let stripeAccountId = stripeAccountIdInput;

    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      const updatedOrg = await this.paymentService.createUnifySubscriptionFreeTrial({
        organization,
        paymentMethod,
        ...(isBoolean(isBlockedPrepaidCardOnTrial) && { blockedPrepaidCardOnTrial: 'true' }),
        actor: user,
        incomingPayment: {
          period,
          currency,
          stripeAccountId,
          subscriptionItems: [
            {
              productName: subscriptionItem.productName,
              paymentType: subscriptionItem.planName,
              quantity: subscriptionItem.quantity,
            },
          ],
        },
      });
      const documentUploadKey = `${RedisConstants.RATE_LIMIT_PREFIX}${OperationLimitConstants.DOCUMENT_UPLOAD}:${userId}`;
      this.redisService.deleteRedisByKey(documentUploadKey);
      this.paymentService.addExtraTrialDay({ orgId: organization._id, user, browserLanguage: context.req.headers['accept-language'] });
      return {
        statusCode: 200,
        message: 'Create subscription successfully',
        data: updatedOrg.payment,
        organization: updatedOrg,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId,
          subscriptionItem,
          currency,
          period,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async cancelOrganizationFreeTrial(@Args('orgId') orgId: string, @Context() context): Promise<PaymentResponse> {
    const { user: { _id: userId } } = context.req;
    const orgData = await this.organizationService.getOrgById(orgId);
    if (!orgData || orgData.payment.status !== PaymentStatusEnums.TRIALING) {
      throw GraphErrorException.BadRequest('Cannot cancel free trial');
    }
    try {
      const updatedOrg = await this.paymentService.cancelFreeTrial({
        targetId: orgId,
        subscriptionRemoteId: orgData.payment.subscriptionRemoteId,
      });
      this.userService.trackPlanAttributes(userId as string);
      this.organizationService.notifyCancelFreeTrial(orgData);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cancel free trial successfully',
        data: updatedOrg.payment,
        organization: updatedOrg,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId,
          stripeAccountId: orgData.payment.stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(UpgradingInvoicePayment, RestrictBillingActionsOrgGuard)
  @Mutation()
  async changeAutoUpgradeSetting(
    @Context() context,
    @Args('enabled') enabled: boolean,
  ): Promise<OrganizationSettings> {
    const { organization }: { organization: IOrganization } = context.req;

    const updatedOrg = await this.organizationService.updateOrganizationById(organization._id, {
      'settings.autoUpgrade': enabled,
    });
    return updatedOrg.settings;
  }

  /** @deprecated remove this api in favor of previewUpcomingSubscriptionInvoice */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async previewUpcomingDocStackInvoice(
    @Args('input') input: PreviewUpcomingDocStackInvoiceInput,
    @Context() context,
  ): Promise<PreviewDocStackInvoicePayload> {
    const { _id: userId, countryCode } = context.req.user;
    const {
      orgId, plan: incomingPlan, period: incomingPeriod, currency, startTrial, couponCode, stripeAccountId: stripeAccountIdInput,
    } = input;
    const [actor, organization] = await Promise.all([
      this.userService.findUserById(userId as string),
      this.organizationService.getOrgById(orgId),
    ]);
    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      const { payment } = organization;
      const previewDocStackInvoiceData = await this.paymentService.previewUpgradeSubscriptionInvoice({
        actor,
        orgId,
        currentPayment: payment,
        nextPayment: {
          type: incomingPlan as any,
          period: incomingPeriod,
          couponCode,
          status: startTrial ? PaymentStatusEnums.TRIALING : PaymentStatusEnums.ACTIVE,
          currency: (payment?.currency || currency) as Currency,
        },
        stripeAccountId: payment.stripeAccountId || stripeAccountId,
      });
      return previewDocStackInvoiceData;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId,
          incomingPlan,
          incomingPeriod,
          currency,
          startTrial,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(UpgradingInvoicePayment)
  @Query()
  async previewUpcomingSubscriptionInvoice(
    @Args('input') input: PreviewUpcomingSubscriptionInvoiceInput,
    @Context() context,
  ): Promise<PreviewUpcomingSubscriptionInvoicePayload> {
    const { user, organization } = context.req;
    const { _id: userId, countryCode } = user;
    const {
      orgId, period, currency, couponCode, stripeAccountId: stripeAccountIdInput, subscriptionItems, startTrial,
    } = input;

    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }

    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: organization.payment, userCountrycode: countryCode, stripeAccountIdInput,
      });
      const { payment } = organization;
      const previewInvoiceData = await this.paymentService.previewUpcomingSubscriptionInvoice({
        actor: user,
        orgId,
        currentPayment: payment,
        nextPayment: {
          stripeAccountId: payment.stripeAccountId || stripeAccountId,
          couponCode,
          currency,
          period,
          status: startTrial ? PaymentStatusEnums.TRIALING : PaymentStatusEnums.ACTIVE,
          subscriptionItems: subscriptionItems.map((sub) => ({
            productName: sub.productName,
            paymentType: sub.planName,
            quantity: sub.quantity,
          })),
        },
      });
      return previewInvoiceData;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId,
          currency,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, RestrictBillingActionsOrgGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async removeOrganizationPaymentMethod(
    @Context() context,
  ): Promise<BasicResponse> {
    const { organization } = context.req;
    const { customerRemoteId, stripeAccountId } = organization.payment;
    if (!customerRemoteId) {
      throw GraphErrorException.NotFound('Customer not found');
    }
    if (!stripeAccountId) {
      throw GraphErrorException.NotFound('Stripe account id not found');
    }
    await this.paymentService.removePaymentMethodsFromCustomer({ customerRemoteId, stripeAccountId });
    return {
      message: 'Remove card successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @AllowInDeleteProcess()
  @Mutation()
  async retrieveOrganizationSetupIntent(
    @Context() context,
    @Args('reCaptchaTokenV3') reCaptchaTokenV3: string,
    @Args('type') type: RetrieveOrganizationSetupIntentType,
  ) {
    const { user } = context.req;
    const {
      _id, email, countryCode, metadata,
    } = user;
    const stripeAccountMatchWithCountry = this.paymentService.getStripeAccountFromCountryCode(countryCode as CountryCodeEnums);
    const { organization } = context.req;
    const { payment, _id: orgId } = organization;
    const stripeAccountId = payment.stripeAccountId || stripeAccountMatchWithCountry;
    try {
      const score = await this.authService.validateRecaptcha({
        reCaptchaTokenV3,
        context,
        email,
      });
      const orgSetupIntent = await this.organizationPaymentService.retrieveSetupIntentForOrganization({
        user,
        organization,
        stripeAccountId,
        score,
        openGoogleReferrer: metadata.openGoogleReferrer,
        type,
        ...Utils.getTrackingContext(context.req),
      });
      return orgSetupIntent;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId: _id,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async deactivateOrganizationSetupIntent(
    @Context() context,
    @Args('orgId') orgId: string,
    @Args('stripeAccountId') stripeAccountId: string,
  ) {
    const { user: { _id } } = context.req;
    await this.organizationPaymentService.deactivateOrganizationSetupIntent({ orgId, userId: _id, stripeAccountId });
    return {
      message: 'Deactivate setup intent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getGoogleUsersNotInCircle(
    @Args('input') input: GetGoogleUsersNotInCircleInput,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<FindUserPayload[]> {
    const { shareEmails, googleAuthorizationEmail } = input;
    const { _id: organizationId } = organization;
    const isPopularDomain = Utils.verifyDomain(googleAuthorizationEmail);
    if (isPopularDomain) {
      return [];
    }
    return this.organizationService.getGoogleUsersNotInCircle({
      organizationId, shareEmails,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async extraTrialDaysOrganization(
    @Context() context,
    @Args('input') input: ExtraTrialDaysOrganizationInput,
  ): Promise<BasicResponse> {
    const { action, days } = input;
    const { organization } = context.req;
    const { payment } = organization;
    const extraTrialDaysInfo = await this.redisService.getExtraTrialDaysOrganizationInfo(organization._id as string, action);
    const { error } = this.organizationService.validateExtraTrialDays(organization as IOrganization, days, extraTrialDaysInfo);
    if (error) {
      throw error;
    }
    await this.paymentService.addTrialDays({ payment, days });

    this.organizationService.handleExtraTrialDaysLog(
      organization as IOrganization,
      action,
      extraTrialDaysInfo,
      context,
    );

    this.redisService.deleteExtraTrialDaysOrganizationInfo(organization._id as string, action);
    return {
      statusCode: HttpStatus.OK,
      message: 'Extra trial days successfully',
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationSettingsGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateInviteUsersSetting(
    @Context() context,
    @Args('inviteUsersSetting') inviteUsersSetting: InviteUsersSetting,
  ): Promise<OrganizationSettings> {
    const { organization } = context.req;
    const updatedOrg = await this.organizationService.updateOrganizationById(organization._id as string, {
      'settings.inviteUsersSetting': inviteUsersSetting,
    });
    return updatedOrg.settings;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.GET_PROMPT_DRIVE_USERS)
  @Query()
  getPromptInviteUsersBanner(
    @Context() context,
    @Args('input') input,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<PromptInviteBannerPayload> {
    const { user } = context.req;
    const { accessToken, forceUpdate, googleAuthorizationEmail } = input;
    const { _id: userId } = user;
    return this.organizationService.getPromptInviteUsersBanner({
      userId, organization, accessToken, forceUpdate, googleAuthorizationEmail,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getSuggestedUsersToInvite(
    @Context() context,
    @Args('input') input: GetSuggestedUserToInviteInput,
    @CurrentOrganization() organization: IOrganization,
  ): Promise<GetSuggestedUserToInvitePayload> {
    const { user } = context.req;
    const { accessToken, forceUpdate, googleAuthorizationEmail } = input;
    const { _id: userId } = user;
    return this.organizationService.getSuggestedUsersToInvite({
      userId, organization, accessToken, forceUpdate, googleAuthorizationEmail,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(OrganizationScimGuard)
  @CustomRuleValidator(CustomRuleAction.ONLY_INTERNAL_INVITE)
  @Mutation()
  async createOrganizationInviteLink(
    @Context() context,
    @Args('input') input: OrganizationInviteLinkInput,
  ): Promise<OrganizationInviteLink> {
    const { _id: userId } = context.req.user as User;
    const inviteLink = await this.organizationInviteLinkService.createInviteLink({
      orgId: input.orgId,
      role: input.role,
      actorId: userId,
    });
    this.organizationInviteLinkService.publishUpdateInviteLink(
      {
        orgId: input.orgId,
        inviteLink,
        actorId: userId,
      },
    );
    return inviteLink;
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.ONLY_INTERNAL_INVITE)
  @Mutation()
  async regenerateOrganizationInviteLink(
    @Context() context,
    @Args('input') input: OrganizationInviteLinkInput,
  ): Promise<OrganizationInviteLink> {
    const { _id: userId } = context.req.user as User;
    const { orgId, role } = input;
    // delete old invite link
    await this.organizationInviteLinkService.deleteInviteLink(orgId);
    // create new invite link
    const inviteLink = await this.organizationInviteLinkService.createInviteLink({
      orgId,
      role,
      actorId: userId,
    });
    this.organizationInviteLinkService.publishUpdateInviteLink(
      {
        orgId,
        inviteLink,
        actorId: userId,
      },
    );
    return inviteLink;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.ONLY_INTERNAL_INVITE)
  @Mutation()
  async deleteOrganizationInviteLink(@Context() context, @Args('orgId') orgId: string): Promise<BasicResponse> {
    const { _id: userId } = context.req.user as User;
    await this.organizationInviteLinkService.deleteInviteLink(orgId);
    this.organizationInviteLinkService.publishUpdateInviteLink(
      {
        orgId,
        inviteLink: null,
        actorId: userId,
      },
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete organization invite link successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getListRequestJoinOrganization(
    @Args('input') input: GetRequesterInput,
  ): Promise<OrganizationRequesterConnection> {
    const {
      orgId, limit, offset, option = {}, searchKey = '',
    } = input;

    const isScimEnabled = await this.organizationService.checkEnableScimSsoProvision(orgId);
    if (isScimEnabled) {
      return {
        totalItem: 0,
        totalRecord: 0,
        edges: [],
      };
    }

    const sortStrategy: Record<string, unknown> = {};

    if ('nameSort' in option) sortStrategy['user.name'] = SortStrategy[option.nameSort];
    if ('requestDateSort' in option) {
      sortStrategy.createdAt = SortStrategy[option.requestDateSort];
    } else {
      sortStrategy.createdAt = SortStrategy.DESC;
    }
    const matchConditions = {
      target: orgId,
      type: AccessTypeOrganization.REQUEST_ORGANIZATION,
    };
    const lookupMatchExpression = {
      $expr: {
        $eq: ['$email', '$$actorEmail'],
      },
    };

    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(lookupMatchExpression, {
        $or: [{ email: { $regex: searchKeyRegex, $options: 'i' } }, { name: { $regex: searchKeyRegex, $options: 'i' } }],
      });
    }

    const facetStage = {
      $facet: {
        metadata: [{ $count: 'total' }],
        members: [
          { $sort: { ...sortStrategy } },
          { $skip: offset },
          { $limit: limit },
        ],
      },
    };
    const optionsPipeline = [
      {
        $match: matchConditions,
      },
      {
        $project: {
          actor: 1,
          createdAt: 1,
          entity: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            actorEmail: '$actor',
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
      facetStage,
    ];

    const [data] = await this.organizationService.getRequesterWithPagination(
      optionsPipeline as PipelineStage[],
    );
    const { members, metadata } = data;
    const pageInfo: PageInfo = {
      offset,
      limit,
    };
    const result = members.map((member) => ({
      node: {
        user: member.user,
        role: member.entity.role,
        requestDate: member.createdAt,
      },
    }));
    return {
      totalItem: metadata[0]?.total || 0,
      totalRecord: result.length,
      edges: result,
      pageInfo,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getListPendingUserOrganization(
    @Args('input') input: PendingUserOrganizationInput,
  ):Promise<OrganizationPendingConnection> {
    const {
      orgId, limit, offset, option = {}, searchKey = '',
    } = input;

    const isScimEnabled = await this.organizationService.checkEnableScimSsoProvision(orgId);
    if (isScimEnabled) {
      return {
        totalItem: 0,
        totalRecord: 0,
        edges: [],
      };
    }

    const sortStrategy: Record<string, unknown> = {};

    if ('emailSort' in option) sortStrategy.actor = SortStrategy[option.emailSort];
    if (!Object.keys(sortStrategy).length) {
      sortStrategy['entity.role'] = 1;
      sortStrategy.createdAt = -1;
    }
    const matchConditions: {target: string; type: string, actor?: QuerySelector<string>} = {
      target: orgId,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
    } as { target: string; type: AccessTypeOrganization; actor?: Record<string, unknown> };
    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      matchConditions.actor = { $regex: searchKeyRegex };
    }
    const facetStage = {
      $facet: {
        metadata: [{ $count: 'total' }],
        members: [
          { $sort: { ...sortStrategy } },
          { $skip: offset },
          { $limit: limit },
        ],
      },
    };
    const optionsPipeline = [
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'actor',
          foreignField: 'email',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 1,
          actor: 1,
          entity: 1,
          createdAt: 1,
          'user.name': 1,
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      facetStage,
    ];
    const [data] = await this.organizationService.getRequesterWithPagination(
      optionsPipeline as PipelineStage[],
    );
    const { members, metadata } = data;
    const pageInfo: PageInfo = {
      offset,
      limit,
    };
    const result = members.map((member) => ({
      node: {
        _id: member._id,
        email: member.actor,
        role: member.entity.role,
        name: member.user?.name,
        requestDate: member.createdAt,
      },
    }));
    return {
      totalItem: metadata[0]?.total || 0,
      totalRecord: result.length,
      edges: result,
      pageInfo,
    };
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async upsertSamlSsoConfiguration(
    @Context() context,
    @Args('input') input: SamlSsoConfigurationInput,
  ): Promise<SamlSsoConfiguration> {
    const actor = context.req.user as User;
    return this.organizationService.upsertSamlSsoConfiguration(actor, input);
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async deleteSamlSsoConfiguration(
    @Args('orgId') orgId: string,
  ): Promise<BasicResponse> {
    await this.organizationService.deleteSamlSsoConfiguration(orgId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete SAML SSO sign in successfully',
    };
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSamlSsoConfiguration(
    @Args('orgId') orgId: string,
  ): Promise<SamlSsoConfiguration> {
    return this.organizationService.getSamlSsoConfiguration(orgId);
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async enableScimSsoProvision(
    @Args('orgId') orgId: string,
  ): Promise<ScimSsoConfiguration> {
    return this.organizationService.enableScimSsoProvision(orgId);
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async disableScimSsoProvision(
    @Args('orgId') orgId: string,
  ): Promise<BasicResponse> {
    await this.organizationService.disableScimSsoProvision(orgId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Disable SCIM SSO provision successfully',
    };
  }

  @UseGuards(RateLimiterGuard, SamlScimFeatureFlagGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getScimSsoConfiguration(
    @Args('orgId') orgId: string,
  ): Promise<ScimSsoConfiguration> {
    return this.organizationService.getScimSsoConfiguration(orgId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async assignSignSeats(
    @Context() context,
    @Args('input') input: AssignSignSeatsInput,
  ): Promise<UpdateSignSeatsResponse> {
    const { user } = context.req;
    const { orgId, userIds, isPublishUpdateSignWorkspacePayment } = input;

    const { availableSignSeats } = await this.organizationService.assignSignSeats({
      orgId, userIds, actor: user, isPublishUpdateSignWorkspacePayment,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Assign sign seats successfully',
      data: {
        availableSignSeats,
      },
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async unassignSignSeats(
    @Context() context,
    @Args('input') input: AssignSignSeatsInput,
  ): Promise<UpdateSignSeatsResponse> {
    const { orgId, userIds } = input;
    const { user } = context.req;

    const { availableSignSeats } = await this.organizationService.unassignSignSeats({ orgId, userIds, actor: user });
    return {
      statusCode: HttpStatus.OK,
      message: 'Unassign sign seats successfully',
      data: {
        availableSignSeats,
      },
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async rejectSignSeatRequests(
    @Context() context,
    @Args('input') input: RejectSignSeatRequestsInput,
  ): Promise<BasicResponse> {
    const { orgId, userIds } = input;
    const { user } = context.req;

    await this.organizationService.rejectSignSeatRequests({ orgId, userIds, actor: user });
    return {
      statusCode: HttpStatus.OK,
      message: 'Reject sign seats successfully',
    };
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @AllowInDeleteProcess()
  @Mutation()
  async retrieveOrganizationSetupIntentV2(
    @Context() context,
    @Args('input') input: RetrieveOrganizationSetupIntentV2Input,
  ) {
    const { user } = context.req;
    const {
      _id, email, countryCode, metadata,
    } = user;
    const { reCaptchaTokenV3, type, reCaptchaAction } = input;
    const stripeAccountMatchWithCountry = this.paymentService.getStripeAccountFromCountryCode(countryCode as CountryCodeEnums);
    const { organization } = context.req;
    const { payment, _id: orgId } = organization;
    const stripeAccountId = payment.stripeAccountId || stripeAccountMatchWithCountry;
    try {
      const score = await this.authService.validateRecaptchaEnterprise({
        reCaptchaTokenV3,
        email,
        expectedAction: reCaptchaAction,
      });
      const orgSetupIntent = await this.organizationPaymentService.retrieveSetupIntentForOrganization({
        user,
        organization,
        stripeAccountId,
        score,
        openGoogleReferrer: metadata.openGoogleReferrer,
        type,
        ...Utils.getTrackingContext(context.req),
      });
      return orgSetupIntent;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          orgId,
          userId: _id,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }
}
