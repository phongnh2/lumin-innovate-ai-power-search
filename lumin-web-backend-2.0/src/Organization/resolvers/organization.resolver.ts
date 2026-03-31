import {
  UseInterceptors, UseGuards, HttpStatus, Inject,
} from '@nestjs/common';
import {
  Context, Mutation, Resolver, Args, Query, ResolveField, Parent, Subscription,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { isNil } from 'lodash';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import { MAX_NUMBER_OF_CREATED_ORGANIZATION } from 'Common/constants/OrganizationConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION } from 'Common/constants/SubscriptionConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { RejectDeletingUserGuard } from 'Common/guards/reject.deleting.user.guard';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';
import { CustomRulesGuards } from 'CustomRules/custom.rules.guard';
import { CustomRulesInterceptor } from 'CustomRules/custom.rules.interceptor';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import {
  CreateOrganizationInput,
  OrganizationWithRole,
  CreateOrganizationPayload,
  BasicResponse,
  OrganizationCanJoinPayload,
  Organization,
  QueryOptionsInput,
  Team,
  Membership,
  TransferTeamsOwnershipInput,
  TransferTeamsOwnershipPayload,
  ResetPasswordRequired,
  Folder,
  CheckMainOrgCreationAbilityPayload,
  RequestJoinOrganizationPayload,
  RejectInvitationInput,
  DomainVisibilitySetting,
  JoinOrganizationStatus,
  JoinOrganizationPayload,
  AcceptInvitationPayload,
  DocStack,
  OrganizationRequestingPayload,
  SignDocStackStorage,
} from 'graphql.schema';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { OrganizationScimGuard } from 'Organization/guards/organization-scim.guard';
import {
  IOrganization,
} from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import {
  AccessTypeOrganization,
  OrganizationRoleEnums,
  OrganizationTeamRoles,
} from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { PaymentService } from 'Payment/payment.service';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@UseInterceptors(SanitizeInputInterceptor)
@CustomRulesGuards()
@Resolver('Organization')
export class OrganizationResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly organizationService: OrganizationService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly membershipService: MembershipService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly paymentUtilsService: PaymentUtilsService,
  ) {}

  @Subscription(SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION, {
    filter: (payload, variables) => variables.orgIds.includes(
      payload.updateConvertedOrganization._id,
    ),
  })
  updateConvertedOrganization(): Organization {
    return this.pubSub.asyncIterator(SUBSCRIPTION_UPDATE_CONVERTED_ORGANIZATION);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async orgsOfUser(@Context() context): Promise<OrganizationWithRole[]> {
    const { user } = context.req;
    const orgsOfUser = await this.organizationService.getOrgsOfUserWithRole(user._id as string);
    this.userService.trackPlanAttributes(user._id as string, orgsOfUser);
    return orgsOfUser;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async confirmOrganizationAdminTransfer(
    @Context() context,
    @Args('token') token: string,
  ) : Promise<BasicResponse> {
    const { user } = context.req;

    await this.organizationService.confirmOrganizationAdminTransfer(user._id as string, token);

    return {
      statusCode: HttpStatus.OK,
      message: 'Transfer organization admin successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RejectDeletingUserGuard)
  /**
   * TODO: convert to presigned url to upload
   */
  @CustomRuleValidator(CustomRuleAction.CREATE_ORGANIZATION)
  @Mutation()
  async createOrganization(
    @Context() context,
    @Args('organization') input: CreateOrganizationInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      organizationAvatar: { fileBuffer: Buffer; mimetype: string; filename: string },
  ): Promise<CreateOrganizationPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const creator = await this.userService.findUserById(user._id, undefined, true);
    if (creator.metadata.numberCreatedOrg >= MAX_NUMBER_OF_CREATED_ORGANIZATION) {
      throw GraphErrorException.BadRequest('User reached limit number created org', ErrorCode.Org.REACH_LIMIT_CREATED_ORG);
    }
    const { organization, fullyAddedMembers, invitations } = await this.organizationService.handleUserCreateOrganization({
      creator,
      input,
      organizationAvatar,
      disableEmail: true,
    });
    await this.userService.findOneAndUpdate(
      { _id: user._id },
      {
        $inc: { 'metadata.numberCreatedOrg': 1 },
      },
    );
    if (!fullyAddedMembers) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        invitations,
        /**
         * @deprecated
         * This field is deprecated.
         */
        organizations: [organization],
        organization,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      invitations,
      /**
       * @deprecated
       * This field is deprecated.
       */
      organizations: [organization],
      organization,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  checkMainOrgCreationAbility(
    @Context() context,
  ): Promise<CheckMainOrgCreationAbilityPayload> {
    const { user } = context.req;
    return this.organizationService.checkMainOrgCreationAbility(user.email as string);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  getMainOrganizationCanRequest(): OrganizationRequestingPayload {
    return null;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getMainOrganizationCanJoin(
    @Context() context,
  ): Promise<OrganizationCanJoinPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const currentUser = await this.userService.findUserById(user._id);

    const { isHiddenSuggestedOrganization } = currentUser.metadata;
    if (isHiddenSuggestedOrganization) {
      return null;
    }

    const emailDomain = Utils.getEmailDomain(currentUser.email);
    const organization = await this.organizationService.getOrgByDomain(emailDomain);
    if (!organization) {
      return null;
    }
    const orgId = organization._id;
    const isUnallowAutoJoin = this.organizationService.isBelongToUnallowedList(organization.unallowedAutoJoin, user._id as string);

    const isVisible = [
      DomainVisibilitySetting.VISIBLE_AUTO_APPROVE,
      DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
    ].includes(organization.settings.domainVisibility);

    if (isUnallowAutoJoin || !isVisible) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const membership = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id);
    if (membership) {
      return null;
    }
    const [existedRequest, [existedInvitation]] = await Promise.all([
      this.organizationService.findMemberInRequestAccessWithType({
        actor: currentUser.email,
        type: AccessTypeOrganization.REQUEST_ORGANIZATION,
        target: orgId,
      }),
      this.organizationService.getRequestAccessByCondition({
        actor: user.email, target: orgId, type: AccessTypeOrganization.INVITE_ORGANIZATION,
      }),
    ]);

    const determineJoinStatus = (defaultStatus: JoinOrganizationStatus) => {
      if (existedInvitation) {
        return JoinOrganizationStatus.PENDING_INVITE;
      }
      if (existedRequest) {
        return JoinOrganizationStatus.REQUESTED;
      }
      return defaultStatus;
    };

    const returnOrganization = {
      _id: orgId,
      name: organization.name,
      avatarRemoteId: organization.avatarRemoteId,
    };

    switch (organization.settings.domainVisibility) {
      case DomainVisibilitySetting.VISIBLE_AUTO_APPROVE: {
        return {
          ...returnOrganization,
          joinStatus: determineJoinStatus(JoinOrganizationStatus.CAN_JOIN),
        };
      }
      case DomainVisibilitySetting.VISIBLE_NEED_APPROVE: {
        return {
          ...returnOrganization,
          joinStatus: determineJoinStatus(JoinOrganizationStatus.CAN_REQUEST),
        };
      }
      default:
        return null;
    }
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async requestJoinOrganization(
    @Context() context,
  ): Promise<RequestJoinOrganizationPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const currentUser = await this.userService.findUserById(user._id);
    const emailDomain = Utils.getEmailDomain(currentUser.email);
    const existedOrg = await this.organizationService.getOrgByDomain(emailDomain);
    if (!existedOrg) {
      throw GraphErrorException.BadRequest('Organization is not existed', ErrorCode.Common.NOT_FOUND);
    }

    const isSettingNeedApprove = existedOrg.settings.domainVisibility === DomainVisibilitySetting.VISIBLE_NEED_APPROVE;
    if (!isSettingNeedApprove) {
      throw GraphErrorException.NotAcceptable('Cannot request to this organization');
    }

    const orgId: string = existedOrg._id;

    const [existedRequest, [existedInvitation]] = await Promise.all([
      this.organizationService.findMemberInRequestAccessWithType({
        actor: currentUser.email,
        type: AccessTypeOrganization.REQUEST_ORGANIZATION,
        target: orgId,
      }, { _id: 1 }),
      this.organizationService.getRequestAccessByCondition({
        actor: user.email, target: orgId, type: AccessTypeOrganization.INVITE_ORGANIZATION,
      }, { _id: 1 }),
    ]);

    if (existedRequest) {
      throw GraphErrorException.BadRequest('You already request to organization', ErrorCode.Org.ALREADY_REQUEST_TO_JOIN_ORG);
    }

    if (existedInvitation) {
      throw GraphErrorException.BadRequest('You have been invited to organization');
    }
    const requestData = await this.organizationService.requestJoinOrganization(existedOrg, currentUser);
    return {
      message: 'Request to join organization successfully',
      statusCode: HttpStatus.OK,
      orgData: existedOrg,
      requestData,
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async joinOrganization(
    @Args('orgId') orgId,
    @Context() context,
  ): Promise<JoinOrganizationPayload> {
    const { user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userInfo = await this.userService.findUserById(user._id);
    const { error, organization } = await this.organizationService.joinOrganization(
      userInfo,
      orgId as string,
      Utils.getTrackingContext(context.req),
    );
    if (error) {
      throw error;
    }
    return {
      organization,
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @CustomRuleValidator(CustomRuleAction.SEND_REQUEST_JOIN_ORG)
  @Mutation()
  async sendRequestJoinOrg(
    @Context() context,
    @Args('orgId') orgId,
  ): Promise<RequestJoinOrganizationPayload> {
    const { _id: userId } = context.req.user;
    const [user, organization] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(userId),
      this.organizationService.getOrgById(orgId as string),
    ]);
    const isRequestAccess = organization.settings.domainVisibility === DomainVisibilitySetting.VISIBLE_NEED_APPROVE;
    const emailDomain = Utils.getEmailDomain(user.email);
    if (!isRequestAccess || emailDomain !== organization.domain && !organization.associateDomains.includes(emailDomain)) {
      throw GraphErrorException.NotAcceptable('Cannot request to this organization');
    }
    const existedRequest = await this.organizationService.findMemberInRequestAccessWithType(
      { actor: user.email, target: organization._id, type: AccessTypeOrganization.REQUEST_ORGANIZATION },
      { _id: 1 },
    );
    if (existedRequest) {
      throw GraphErrorException.BadRequest('You already request to organization', ErrorCode.Org.ALREADY_REQUEST_TO_JOIN_ORG);
    }
    const existedMember = await this.organizationService.getMembershipByOrgAndUser(orgId as string, userId as string);
    if (existedMember) {
      throw GraphErrorException.BadRequest('You are already a member of this organization', ErrorCode.Org.ALREADY_IN_THIS_ORG);
    }
    const requestData = await this.organizationService.requestJoinOrganization(organization, user);
    const newOrg = await this.organizationService.createFirstOrgOnFreeUser(user);
    return {
      message: 'Request to join organization successfully',
      statusCode: HttpStatus.OK,
      orgData: organization,
      requestData,
      newOrg,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getTeamsOfTeamAdmin(
    @Context() context,
    @Args('orgId') orgId: string,
    @Args('userId') userId: string,
  ): Promise<Team[]> {
    const { user } = context.req;
    const canProcess = await this.organizationService.canProcessByRole(
      orgId,
      user._id as string,
      [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
    );

    if (!canProcess) {
      throw GraphErrorException.Forbidden('Not have permission', ErrorCode.Common.NO_PERMISSION);
    }

    return this.organizationTeamService.getOrgTeamsByUserId(orgId, userId, OrganizationTeamRoles.ADMIN);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getMembersOfTeam(
    @Context() context,
    @Args('teamId') teamId: string,
  ): Promise<Membership[]> {
    const { user } = context.req;
    const team = await this.organizationTeamService.getOrgTeamById(teamId);
    if (!team) {
      throw GraphErrorException.NotFound('Team not found', ErrorCode.Common.NOT_FOUND);
    }
    const canProcess = await this.organizationService.canProcessByRole(
      team.belongsTo as string,
      user._id as string,
      [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
    );

    if (!canProcess) {
      throw GraphErrorException.Forbidden('Not have permission', ErrorCode.Common.NO_PERMISSION);
    }

    return this.membershipService.getMembers(team);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async transferListTeamOwnership(
    @Context() context,
    @Args('input') input: TransferTeamsOwnershipInput,
  ): Promise<TransferTeamsOwnershipPayload> {
    const { user } = context.req;
    const { orgId, adminId } = input;
    const canProcess = await this.organizationService.canProcessByRole(
      orgId,
      user._id as string,
      [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
    );

    if (!canProcess || adminId === user._id) {
      throw GraphErrorException.Forbidden('Not have permission', ErrorCode.Common.NO_PERMISSION);
    }

    const isHigherRole = await this.organizationService.isActorHigherRoleInOrg({ orgId, actorId: user._id as string, targetId: adminId });
    if (!isHigherRole) {
      throw GraphErrorException.Forbidden('Not have permission', ErrorCode.Common.NO_PERMISSION);
    }

    const [teamAdmin, actorUser] = await Promise.all([
      this.userService.findUserById(adminId),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(user._id),
    ]);
    if (!teamAdmin) {
      throw GraphErrorException.NotFound('Team admin is not found', ErrorCode.OrgTeam.TEAM_ADMIN_NOT_FOUND);
    }

    const teamsFailed = await this.organizationTeamService.transferListTeamOwnership(actorUser, teamAdmin, input);

    return {
      teamsFailed,
    };
  }

  @ResolveField('totalMember')
  async getTotalOrgMember(@Parent() organization: Organization): Promise<number> {
    if (!organization.totalMember) {
      const totalMember = await this.organizationService.getTotalMemberInOrg(organization._id);
      return totalMember;
    }
    return organization.totalMember;
  }

  @ResolveField('convertFromTeam')
  IsConvertFromTeam(@Parent() organization: Organization): boolean {
    const { payment } = organization;
    const oldTeamPlans = this.paymentService.getOldTeamPlans();
    return oldTeamPlans.includes(payment.planRemoteId);
  }

  @ResolveField('hasPendingInvoice')
  async hasPendingInvoice(
    @Parent() organization: Organization,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<boolean> {
    const enterpriseUpgrade = await loaders.enterpriseUpgradesLoader.load(organization._id);
    return Boolean(enterpriseUpgrade && enterpriseUpgrade.status === UpgradeEnterpriseStatus.PENDING);
  }

  @ResolveField('owner')
  async getOwnerOrganization(
    @Parent() organization: IOrganization,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<User> {
    if (!organization.ownerId) return null;
    return loaders.usersLoader.load(organization.ownerId as string);
  }

  @ResolveField('userRole')
  async getUserRole(
    @Parent() organization: IOrganization,
    @Context() context,
    @Context() { loaders }: { loaders: DataLoaderRegistry },
  ): Promise<string> {
    const { user } = context.req;
    const membership = await loaders.orgMembershipLoader.load(`${user._id}-${organization._id}`);
    return membership?.role;
  }

  @ResolveField('members')
  async getMembersWithLimitation(
    @Parent() organization: IOrganization,
      @Args('options') options: QueryOptionsInput = {},
  ): Promise<User[]> {
    const members: User[] = await this.organizationService.getAllMembersByOrganization(organization._id, options);
    return members;
  }

  /**
   * @deprecated
   */
  @ResolveField('resetPassword')
  resetPasswordRequired(): ResetPasswordRequired {
    return {
      isRequired: false,
      actorEmail: '',
    };
  }

  @ResolveField('teams')
  async getOrgteams(
    @Parent() organization: IOrganization,
    @Context() context,
  ): Promise<ITeam[]> {
    const { user: { _id: userId } } = context.req as { user: User };
    const orgId = organization._id;
    const { loaders } = context as { loaders: DataLoaderRegistry };
    const teams = await loaders.teamsOfUserLoader.load(`${userId}-${orgId}`);
    const lastAccessedTeamIds = await this.organizationTeamService.getLastAccessedTeams(userId, orgId);
    if (!lastAccessedTeamIds.length) {
      return teams;
    }
    const teamIdsOrder = [
      ...lastAccessedTeamIds,
      ...teams
        .map(({ _id }) => _id)
        .filter((id) => !lastAccessedTeamIds.includes(id)),
    ];
    return teams.sort((current, next) => teamIdsOrder.indexOf(current._id) - teamIdsOrder.indexOf(next._id));
  }

  @ResolveField('totalTeam')
  getTotalTeam(
    @Parent() organization: IOrganization,
  ): Promise<number> {
    return this.organizationTeamService.getTotalTeamByOrgId(organization._id);
  }

  @ResolveField('folders')
  getOrgFolders(@Parent() organization: Organization): Promise<Folder[]> {
    return this.organizationService.getFolders(organization._id);
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async rejectJoinedOrgInvitation(
    @Context() context,
    @Args('input') input: RejectInvitationInput,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { invitationId, notificationId } = input;
    const notification = await this.notificationService.getNotificationById(notificationId);
    const isNotificationBelongToUser = notification.target.targetId.toString() === userId;
    if (!notification || !isNotificationBelongToUser) {
      throw GraphErrorException.NotFound('Notification not found', ErrorCode.Noti.NOTIFICATION_NOT_FOUND);
    }
    const invitation = await this.organizationService.getRequestAccessById(invitationId);
    const { invitationList } = notification.target.targetData;
    const isInvitationBelongToNoti = invitationList.some((item: Record<string, any>) => item._id.toString() === invitationId);
    if (!invitation || !isInvitationBelongToNoti) {
      throw GraphErrorException.BadRequest('Reject invitation failed');
    }
    const { error } = await this.organizationService.removeInvitation({
      input, notification, userId, requestAccess: invitation,
    });
    if (error) {
      throw error;
    }
    return {
      message: 'Reject invitation from this organization successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard, OrganizationScimGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async acceptInvitationOrganization(
    @Context() context,
    @Args('orgId') orgId: string,
  ): Promise<AcceptInvitationPayload> {
    const { user } = context.req;
    const { email }: { email: string } = user;

    const [invitation] = await this.organizationService.getRequestAccessByCondition({
      actor: email, target: orgId, type: AccessTypeOrganization.INVITE_ORGANIZATION,
    });
    if (invitation) {
      const [invitationNoti] = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'entity.entityId': orgId,
        'target.targetData.invitationList._id': invitation._id,
      });
      const { isSuccess, error } = await this.organizationService.acceptInvitation(
        invitation,
        invitationNoti._id,
        Utils.getTrackingContext(context.req),
      );
      if (isSuccess) {
        const org = await this.organizationService.getOrgById(orgId);
        return {
          organization: org,
        };
      }
      if (error) {
        throw error;
      }
    }
    throw GraphErrorException.BadRequest('Accept invitation failed');
  }

  @ResolveField('totalActiveMember')
  async getTotalActiveOrgMember(@Parent() organization: Organization): Promise<number> {
    if (!organization.totalActiveMember) {
      const totalActiveMember = await this.organizationService.countTotalActiveOrgMember({ orgId: organization._id });
      return totalActiveMember;
    }
    return organization.totalActiveMember;
  }

  @ResolveField('docStackStorage')
  async getStorageOfOrganization(@Parent() organization: Organization): Promise<DocStack> {
    if (organization.docStackStorage) {
      return organization.docStackStorage;
    }
    return this.organizationService.getDocStackStorage(organization);
  }

  @ResolveField('isUpgradingToEnterprise')
  isUpgradingToEnterprise(): boolean {
    return false;
  }

  @ResolveField('purpose')
  getPurpose(@Parent() organization: Organization) {
    if (!organization.purpose) {
      return null;
    }
    return organization.purpose;
  }

  /**
    * @deprecated
    * This field is deprecated.
  */
  @ResolveField('creationType')
  creationType() {
    return null;
  }

  @ResolveField('isDefault')
  isDefault() {
    return false;
  }

  @ResolveField('signDocStackStorage')
  async resolveSignDocStackStorage(
    @Parent() organization: IOrganization,
    @Context() context,
  ): Promise<SignDocStackStorage> {
    const userId: string = context.req.user._id;
    const { data } = await this.organizationService.getSignDocStackStorage({
      userId,
      organizationId: organization._id,
    });

    return {
      isOverDocStack: data.isOverDocStack,
      totalStack: Number(data.totalStack ?? 0),
      totalUsed: Number(data.totalUsed ?? 0),
    };
  }

  @ResolveField('isSignProSeat')
  getSignProSeat(@Parent() organization: Organization, @Context() context): boolean {
    if (!isNil(organization.isSignProSeat)) {
      return organization.isSignProSeat;
    }
    const { user } = context.req;
    return Boolean(organization.premiumSeats?.some((seat) => seat.toString() === user._id));
  }

  @ResolveField('premiumSignSeats')
  getPremiumSignSeats(@Parent() organization: Organization): number {
    if (!isNil(organization.premiumSignSeats)) {
      return organization.premiumSignSeats;
    }
    return this.organizationService.getSignSeatInfo(organization).premiumSignSeats;
  }

  @ResolveField('totalSignSeats')
  getTotalSignSeats(@Parent() organization: Organization): number {
    if (!isNil(organization.totalSignSeats)) {
      return organization.totalSignSeats;
    }
    return this.organizationService.getSignSeatInfo(organization).totalSignSeats;
  }

  @ResolveField('availableSignSeats')
  getAvailableSignSeats(@Parent() organization: Organization): number {
    if (!isNil(organization.availableSignSeats)) {
      return organization.availableSignSeats;
    }
    return this.organizationService.getSignSeatInfo(organization).availableSignSeats;
  }
}
