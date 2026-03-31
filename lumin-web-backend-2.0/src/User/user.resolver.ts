/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  UseGuards, HttpStatus, UseInterceptors, Inject, forwardRef,
} from '@nestjs/common';
import {
  Args, Query, Mutation, Resolver, Context, Parent, ResolveField, Subscription,
} from '@nestjs/graphql';
import { get, reverse } from 'lodash';
import * as moment from 'moment';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode, DefaultErrorCode } from 'Common/constants/ErrorCode';
import { NotiDocument, NotificationType } from 'Common/constants/NotificationConstants';
import { OpenOneDriveCookie } from 'Common/constants/OpenFlowFileConstants';
import { popularDomains } from 'Common/constants/OrganizationConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
  SUBSCRIPTION_DOCUMENT_INFO_NAME,
  SUBSCRIPTION_DELETE_USER_ACCOUNT,
  SUBSCRIPTION_UPDATE_USER,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiFirebaseDocumentFactory } from 'Common/factory/NotiFirebaseFactory';
import { RejectDeletingUserGuard } from 'Common/guards/reject.deleting.user.guard';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';

import { AwsService } from 'Aws/aws.service';

import { CustomRulesInterceptor } from 'CustomRules/custom.rules.interceptor';

import { AuthService } from 'Auth/auth.service';
import { GqlAttachUserGuard } from 'Auth/guards/graph.attachUser';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { USER_VERSION } from 'constant';
import { DocumentService } from 'Document/document.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import {
  OrganizationDocumentRoles,
  OrgTeamDocumentRoles,
} from 'Document/enums/organization.roles.enum';
import { DocumentGuestLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import { EnvironmentService } from 'Environment/environment.service';
import {
  BasicResponse, ChangePasswordInput, EditUserInput, UpdateSettingInput,
  UpdateUserGuidePayload,
  UserMetadataInput,
  DeleteAccountSubscriptionPayload,
  UpdateUserSubscriptionPayload,
  FindUserInput,
  FindUserPayload,
  RatingModalStatus,
  User as UserGraph,
  ConfirmUpdatingAnnotInput,
  HubspotPropertiesInput,
  EntitySearchType,
  NewNotificationsData,
  NotificationTab,
  GetUserLocationPayload,
  FindLocationInput,
  FindLocationPayload,
  Signature,
  UserRating,
  MobileFeedbackModalStatusInput,
  GetSignedUrlSignaturesInput,
  UpdateSignaturePositionInput,
  GetSignedUrlSignaturesPayload,
  Document,
  GetGoogleContactsContext,
  SuggestedOrganizationList,
  SuggestedPremiumOrganization,
  GetGoogleContactInput,
  OneDriveTokenResponse,
  IncreaseExploredFeatureUsageInput,
  VerifyOrganizationInviteLinkPayload,
  DomainVisibilitySetting,
  AcceptNewTermsOfUseInput,
  RatedAppInput,
} from 'graphql.schema';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { OpenOneDriveService } from 'OpenOneDrive/OpenOneDrive.service';
import { AccessTypeOrganization } from 'Organization/organization.enum';
import { OrganizationInviteLinkService } from 'Organization/organization.inviteLink.service';
import { OrganizationService } from 'Organization/organization.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';
import { UserTrackingService } from 'UserTracking/tracking.service';

@Resolver('User')
export class UserResolver {
  cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);

  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly userService: UserService,
    private readonly membershipService: MembershipService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly authService: AuthService,
    private readonly organizationService: OrganizationService,
    private readonly userTrackingService: UserTrackingService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => OpenOneDriveService))
    private readonly openOneDriveService: OpenOneDriveService,
    private readonly organizationInviteLinkService: OrganizationInviteLinkService,
  ) { }

  @UseGuards(GqlAttachUserGuard)
  @Subscription(SUBSCRIPTION_DELETE_USER_ACCOUNT)
  deleteAccountSubscription(@Context() context): DeleteAccountSubscriptionPayload {
    const { user } = context.req;
    if (user) {
      return this.pubSub.asyncIterator(`${SUBSCRIPTION_DELETE_USER_ACCOUNT}.${user._id}`);
    }
    return this.pubSub.asyncIterator(SUBSCRIPTION_DELETE_USER_ACCOUNT);
  }

  @UseGuards(GqlAttachUserGuard)
  @Subscription(SUBSCRIPTION_UPDATE_USER)
  updateUserSubscription(@Context() context): UpdateUserSubscriptionPayload {
    const { user } = context.req;
    if (user) {
      return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_USER}.${user._id}`);
    }
    return this.pubSub.asyncIterator(SUBSCRIPTION_UPDATE_USER);
  }

  @ResolveField('roleInTeam')
  async getRoleInTeam(@Parent() user, @Args('teamId') teamId) {
    const membership = await this.membershipService.findOne({ userId: user._id, teamId }, { role: 1 });
    if (!membership) return '';
    return membership.role;
  }

  @ResolveField('name')
  resolveName(@Parent() user): string {
    if (user.name) return user.name;
    const name = user.email ? user.email.substring(0, 32) : 'Lumin User';
    this.userService.updateUserPropertyById(user._id, { name });
    return name;
  }

  @ResolveField('isPopularDomain')
  isPopularDomain(@Parent() user): boolean {
    if (user.isPopularDomain) return user.isPopularDomain;
    return Utils.verifyDomain(user.email);
  }

  @ResolveField('isUsingPassword')
  async isUsingPassword(@Parent() user): Promise<boolean> {
    if (typeof user.isUsingPassword === 'boolean') {
      return user.isUsingPassword;
    }
    if (this.userService.isUserUsingPassword(user)) {
      return true;
    }
    const foundUser = await this.userService.findUserById(user._id);
    return this.userService.isUserUsingPassword(foundUser);
  }

  @ResolveField('migratedOrgUrl')
  getMigratedOrgUrl(@Parent() user): Promise<string> {
    if (user.migratedOrgUrl) {
      return user.migratedOrgUrl;
    }

    return this.redisService.getMigratedOrgUrl(user._id);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(CustomRulesInterceptor)
  @Query('findUser')
  async findUser(
    @Args('input') input: FindUserInput,
    @Context() context,
  ): Promise<FindUserPayload[]> {
    const { _id: userId } = context.req.user;
    const {
      targetId, targetType, searchKey = '', excludeUserIds: selectedUserIds,
    } = input;

    await this.userService.verifyUserPermissionOnTarget({ userId, targetId, targetType });

    const isValidEmailFormat = Utils.validateEmail(searchKey);
    if (isValidEmailFormat) {
      await this.userService.checkEmailInput([searchKey]);
      const foundUser = await this.userService.findUserToAdd({
        actorId: userId, email: searchKey, targetType, targetId,
      });
      return [foundUser];
    }
    if (targetType === EntitySearchType.DOCUMENT) {
      return this.userService.getContactListToShareDocument({
        documentId: targetId, userId, searchKey, pickedUserIds: selectedUserIds,
      });
    }
    const excludeUserIds = await this.userService.getUserIdsExcludeFromContactList(targetId, targetType);
    const contactList = await this.userService.getContactList({
      targetId, targetType, userId, searchKey, excludeUserIds: excludeUserIds.concat(selectedUserIds),
    });
    if (targetType === EntitySearchType.ORGANIZATION) {
      const requesters = await this.organizationService.getRequesterListByOrgIdAndType(targetId, AccessTypeOrganization.INVITE_ORGANIZATION);
      const requestEmails = requesters.map((request) => request.actor);
      return contactList.filter((contact) => !requestEmails.includes(contact.email));
    }
    return contactList;
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard, RejectDeletingUserGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updateSetting')
  // eslint-disable-next-line consistent-return
  async updateSetting(
    @Args('input') input: UpdateSettingInput,
    @Context() context,
  ): Promise<User> {
    const { user } = context.req;
    if (!user) {
      throw GraphErrorException.Unauthorized('Please sign in to do this action');
    }
    const updatedUser = await this.userService.updateUserSetting(user, input);
    return updatedUser;
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard, RejectDeletingUserGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('editUser')
  async editUser(
    @Args('input') input: EditUserInput,
    @Context() context,
  ): Promise<User> {
    const promises = [];
    const { _id } = context.req.user;
    const updateObj: EditUserInput = {
      name: input.name,
    };
    if (input.avatarRemoteId) {
      updateObj.avatarRemoteId = input.avatarRemoteId;
      const oldRemoteId = (await this.userService.findUserById(_id))
        .avatarRemoteId;
      promises.push(this.userService.removeAvatarFromS3(oldRemoteId));
    }
    promises.push(this.userService.updateUserPropertyById(_id, updateObj, false, { lean: false }));
    const results = await Promise.all(promises);

    const documents = await this.documentService.findDocumentByUserId(_id);
    documents.forEach(async (document) => {
      const { allReceivers: receiverIds } = await this.documentService.getReceiverIdsFromDocumentId(document._id);
      const updatedDocument = JSON.parse(JSON.stringify(document));
      updatedDocument.ownerName = input.name;
      this.documentService.publishUpdateDocument(
        receiverIds,
        {
          document: updatedDocument,
          type: SUBSCRIPTION_DOCUMENT_INFO_NAME,
        },
        SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
      );
    });
    const result = results[promises.length - 1];
    result.isUsingPassword = this.userService.isUserUsingPassword(result);
    return result;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('removeAvatar')
  async removeAvatar(@Context() context): Promise<Partial<User> & { isUsingPassword: boolean }> {
    const { user } = context.req;
    const { _id } = user;
    const userData = await this.userService.findUserById(_id);
    this.userService.removeAvatarFromS3(userData.avatarRemoteId).catch((error) => console.warn(error));
    const updatedUser = await this.userService.updateUserPropertyById(_id, { avatarRemoteId: '' });
    return {
      ...updatedUser,
      isUsingPassword: this.userService.isUserUsingPassword(updatedUser),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async seenNewNotificationsTab(
    @Context() context,
    @Args('tab') tab: NotificationTab,
  ): Promise<User> {
    const { user } = context.req;
    const { _id } = user;
    return this.userService.setUserNotificationStatus({
      userId: _id,
      tab,
      time: new Date(),
    });
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard, RejectDeletingUserGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @Mutation('changePassword')
  async changePassword(
    @Context() context,
    @Args('input') input: ChangePasswordInput,
  ): Promise<BasicResponse> {
    const { newPassword, currentPassword } = input;
    const error = await this.userService.changePassword(newPassword, currentPassword, context.req.user?._id, input.refreshToken);
    if (error) {
      throw GraphErrorException.ApplicationError(error);
    }
    return {
      message: 'Change password successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @ResolveField('addedInTeam')
  async getOwner(@Parent() user, @Args('teamId') teamId: string): Promise<boolean> {
    const membership = await this.membershipService.findOne({ userId: user._id, teamId }, { _id: 1 });
    return Boolean(membership);
  }

  /*
  Delete account has 2 steps:
  1. Make account leave all team, cancel payment, mark the deletedAt field in database and
  save the account to redis['AccountToDelete']
  2. After 3 days, the cronjob will delete permantly all data of account in database
  */

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @UseInterceptors(LoggingInterceptor)
  @Mutation('deleteAccount')
  async deleteAccount(@Context() context): Promise<User> {
    const currentUser = context.req.user;
    const { _id } = currentUser;
    const { error, user } = await this.authService.deleteAccount({ userId: _id });
    if (error) {
      throw GraphErrorException.ApplicationError(error);
    }
    return user;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('deleteSignatureByIndex')
  async deleteSignatureByIndex(@Args('index') index: number, @Context() context): Promise<any> {
    const { user } = context.req;
    return this.userService.deleteSignatureByIndex(user._id, index);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('deleteSignatureByRemoteId')
  async deleteSignatureByRemoteId(@Args('signatureRemoteId') signatureRemoteId: string, @Context() context): Promise<any> {
    const { user } = context.req;
    return this.userService.deleteSignatureByRemoteId(user._id, signatureRemoteId);
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updateUserMetadata')
  async updateUserMetadata(
    @Context() context,
    @Args('input') input: UserMetadataInput,
  ): Promise<UpdateUserGuidePayload> {
    const { user } = context.req;
    const { key, value } = input;
    const currentUser = await this.userService.findUserById(user._id);
    this.userService.validateUserMetadataUpdate(currentUser, key, value);
    const userProperty = {
      [`metadata.${key}`]: value,
    };
    const updatedUser = await this.userService.updateUserPropertyById(user._id, userProperty);

    return {
      user: updatedUser,
      statusCode: HttpStatus.OK,
      message: 'Update successfully',
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updateUserMobileFreeToolsBanner')
  async updateUserMobileFreeToolsBanner(
    @Context() context,
  ): Promise<User> {
    const { user } = context.req;
    const userUpdated = await this.userService.updateUserMobileFreeToolsBanner(user._id);
    return userUpdated;
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('reactivateUser')
  async reactivateUser(
    @Context() context,
  ): Promise<User> {
    const { user } = context.req;
    const userUpdated = await this.userService.reactivateUser(user._id);
    return userUpdated;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  hideRatingModal(@Context() context): Promise<User> {
    const { _id: userId } = context.req.user;
    return this.userService.updateUserPropertyById(userId, {
      'metadata.rating.googleModalStatus': RatingModalStatus.HIDE,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async saveAutoSyncTrial(
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { email } = await this.userService.findUserById(userId, { email: 1 });
    this.userTrackingService.updateUserContact(email, {
      auto_sync_trial: 'Yes',
    });
    return {
      message: 'Update auto_sync_trial contact successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async saveAbSignatureHubspot(
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { email } = await this.userService.findUserById(userId, { email: 1 });
    this.userTrackingService.updateUserContact(email, {
      ab_signature_testing: 'true',
    });
    return {
      message: 'Update ab_signature_testing contact successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getCurrentUser(
    @Context() context,
  ): Promise<Partial<User> & { isUsingPassword: boolean } & { hasNewVersion: boolean }> {
    const { _id: userId } = context.req.user;
    // TODO: check if user is verified
    const user = await this.userService.findUserById(userId, null, true);
    return {
      ...user,
      hasNewVersion: user.version !== USER_VERSION,
      isUsingPassword: this.userService.isUserUsingPassword(user),
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async seenNewVersion(
    @Context() context,
  ): Promise<UserGraph> {
    const { _id: userId } = context.req.user;
    const user = await this.userService.updateUserPropertyById(userId, { version: USER_VERSION });
    return { ...user, hasNewVersion: false };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestLevelGuard(
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
    OrganizationDocumentRoles.ALL,
  )
  @Mutation('confirmUpdatingAnnotOfAnother')
  async confirmUpdatingAnnotOfAnother(
    @Args('input') input: ConfirmUpdatingAnnotInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { authorEmails, documentId, remoteId } = input;
    const actor = await this.userService.findUserById(userId, { _id: 1, name: 1, avatarRemoteId: 1 });
    const foundUsers = await this.userService.findUserByEmails(authorEmails);

    if (!foundUsers) throw GraphErrorException.BadRequest('User does not have any account in Lumin');
    const currentDocument = await this.documentService.findOneById(documentId);
    const clientIds = foundUsers.map((user) => user._id);
    const authorsHasDocPermision = await this.documentService.getUserIdsHasDocPermission(clientIds, currentDocument as unknown as Document);
    const createDocumentNotification = ({ user, document, userIds }) => {
      const notification = {
        actor: {
          actorId: user._id,
          type: 'user',
          actorName: user.name,
          avatarRemoteId: user.avatarRemoteId,
        },
        entity: {
          entityId: document._id,
          entityName: document.name,
          type: 'document',
        },
        actionType: NotiDocument.UPDATE_ANNOT_OF_ANOTHER,
        notificationType: NotificationType.DOCUMENT,
      };
      this.notificationService.createUsersNotifications(notification, userIds);

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseDocumentFactory.create(NotiDocument.UPDATE_ANNOT_OF_ANOTHER, {
        document,
        actor: user,
      });
      this.notificationService.publishFirebaseNotifications(
        userIds,
        notificationContent,
        notificationData,
      );
    };

    const createNotificationByDocumentId = async () => {
      const document = await this.documentService.getDocumentByDocumentId(documentId, { _id: 1, name: 1 });
      createDocumentNotification({
        user: actor,
        document,
        userIds: authorsHasDocPermision,
      });
    };

    if (remoteId) {
      const documentsByRemoteId = await this.documentService.getDocumentsByRemoteId(remoteId, clientIds);
      // Push notifications
      if (!documentsByRemoteId.length) {
        createNotificationByDocumentId();
      } else {
        documentsByRemoteId.forEach((doc) => {
          createDocumentNotification({
            user: actor,
            document: doc,
            userIds: [doc.ownerId],
          });
        });
      }
    } else {
      createNotificationByDocumentId();
    }

    return {
      message: 'Notified to the authors of the annotations',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async trackDownloadClickedEvent(
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { email } = await this.userService.findUserById(userId, { email: 1 });
    await this.userTrackingService.updateUserContact(email, {
      clicked_install_now: 'true',
    });
    return {
      message: 'Update Hubspot contact property successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async saveHubspotProperties(
    @Context() context,
    @Args('input') input: HubspotPropertiesInput,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { key, value } = input;
    const { email } = await this.userService.findUserById(userId, { email: 1 });
    await this.userTrackingService.updateUserContact(email, {
      [key]: value,
    });
    return {
      message: `Update ${key} contact successfully`,
      statusCode: HttpStatus.OK,
    };
  }

  @ResolveField('notificationStatus')
  async getNotificationStatus(@Parent() user: User & UserGraph): Promise<NewNotificationsData> {
    if (user.notificationStatus) {
      return user.notificationStatus;
    }
    const [general, invites, requests] = await Promise.all(
      Object
        .values(NotificationTab)
        .map((tab) => this.notificationService.countUnreadNotifications(user, tab)),
    );
    return {
      general,
      invites,
      requests,
    };
  }

  @ResolveField('hasJoinedOrg')
  async hasJoinedAtLeastOneOrg(@Parent() user: UserGraph): Promise<boolean> {
    if (user.hasJoinedOrg as unknown instanceof Boolean) {
      return user.hasJoinedOrg;
    }
    const orgMemberships = await this.organizationService.getMembersByUserId(user._id);
    return Boolean(orgMemberships.length);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(CustomRulesInterceptor)
  @Query()
  async getGoogleContacts(
    @Args('accessToken') accessToken: string,
    @Args('input') input: GetGoogleContactInput,
    @Context() context,
  ): Promise<FindUserPayload[]> {
    const { _id: userId } = context.req.user;
    const { orgId, googleAuthorizationEmail, action } = input || {};
    if (action === GetGoogleContactsContext.INVITE_ORG_MEMBER) {
      const { error } = await this.userService.validateGetGoogleContact(orgId, userId);
      if (error) {
        throw error;
      }
    }
    return this.userService.getGoogleContacts({
      accessToken, action, orgId, googleAuthorizationEmail,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  getUsersSameDomain(
    @Context() context,
  ): Promise<FindUserPayload[]> {
    const { _id: userId } = context.req.user;
    return this.userService.getUsersSameDomain(userId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getSuggestedOrgListOfUser(
    @Context() context,
  ): Promise<SuggestedOrganizationList[]> {
    const { email, _id: userId } = context.req.user;
    const { orgList, error } = await this.organizationService.getSuggestedOrgListByUserDomain({ userEmail: email, userId });

    if (error) {
      throw error;
    }
    return orgList;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query('getUserCurrency')
  async getUserCurrency(@Context() context): Promise<GetUserLocationPayload> {
    const currency = await this.userService.getUserCurrencyBaseIpAddress(context.req);
    return {
      currency,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('updateDefaultWorkspace')
  async updateDefaultWorkspace(
    @Context() context,
    @Args('orgId') orgId: string,
  ): Promise<User> {
    const { user } = context.req;
    const existedUser = await this.userService.findUserById(user._id);
    const orgMembership = await this.organizationService.getMembershipByOrgAndUser(orgId, existedUser._id);
    if (!orgMembership) {
      throw GraphErrorException.NotAcceptable('This user can not update default workspace', ErrorCode.User.CANNOT_UPDATE_DEFAULT_WORKSPACE);
    }
    return this.userService.updateUserPropertyById(existedUser._id, { 'setting.defaultWorkspace': orgId });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async findAvailableLocation(
    @Context() context,
    @Args('input') input: FindLocationInput,
  ): Promise<FindLocationPayload> {
    const { user } = context.req;
    const {
      orgId,
      context: searchContext,
      cursor,
      searchKey,
    } = input;

    if (orgId) {
      const orgMembership = await this.organizationService.getMembershipByOrgAndUser(orgId, user._id, { _id: 1 });
      if (!orgMembership) {
        throw GraphErrorException.Forbidden('Forbidden Resource');
      }
    }

    const result = await this.userService.findAvailableResourceLocation({
      userId: user._id,
      orgId,
      params: {
        context: searchContext,
        searchKey,
        cursor,
      },
    });

    return result;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('ratedApp')
  async ratedApp(
    @Context() context,
    @Args('input') input: RatedAppInput,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const { ratedScore } = input || {};
    const userInformation = await this.userService.findUserById(user._id, { metadata: 1, email: 1 });
    const isRatedApp = get(userInformation, 'metadata.ratedApp', false);
    if (isRatedApp) {
      throw GraphErrorException.BadRequest('Failed to update Rating score', DefaultErrorCode.BAD_REQUEST);
    }

    try {
      /**
       * Fallback for old version, ratedScore is not required.
       * We can remove this after 1 month
       */
      if (ratedScore) {
        await this.userTrackingService.updateUserContact(user.email, {
          lumin_last_nps_survey_date: moment.utc().startOf('day').valueOf().toString(),
          lumin_last_nps_rating: String(ratedScore),
        });

        const userProperty = {
          'metadata.ratedApp': true,
        };
        await this.userService.updateUserPropertyById(user._id, userProperty);
        return {
          statusCode: HttpStatus.OK,
          message: 'Rating score is updated successfully',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'You are on the legacy version',
      };
    } catch (err) {
      throw GraphErrorException.BadRequest(`Failed to update Rating score: ${err.message}` || 'unknown error', DefaultErrorCode.BAD_REQUEST);
    }
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getUserSignatureSignedUrls(@Context() context): Promise<Signature[]> {
    const { signatures } = await this.userService.findUserById(context.req.user._id, { signatures: 1 });

    if (!signatures.length) {
      return [];
    }

    const signedUrlSignatures = signatures.map(async (signature) => ({
      remoteId: signature,
      presignedUrl: await this.awsService.getSignedUrl({
        keyFile: signature,
        bucketName: this.environmentService.getByKey(
          EnvConstants.S3_PROFILES_BUCKET,
        ),
      }),
    }));
    return Promise.all(signedUrlSignatures);
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updateMobileFeedbackModalStatus')
  updateMobileFeedbackModalStatus(
    @Context() context,
    @Args('input') input: MobileFeedbackModalStatusInput,
  ): Promise<UserRating> {
    const { _id: userId } = context.req.user;
    return this.userService.updateRatingModalStatus(userId, input);
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getUserSignatureSignedUrlsInRange(
    @Context() context,
    @Args('input') input: GetSignedUrlSignaturesInput,
  ): Promise<GetSignedUrlSignaturesPayload> {
    const { limit, offset } = input;
    const endIndex = offset + limit;
    const { signatures } = await this.userService.findUserById(context.req.user._id, { signatures: 1 });
    const hasNext = endIndex < signatures.length;
    if (!signatures.length) {
      return {
        signatures: [],
        hasNext,
        offset,
        limit,
        total: signatures.length,
      };
    }
    // the signatures in front-end is reversed (the latest will be shown first) , so we need to reverse again to get the correct list
    const reversedSignatures = reverse(signatures);
    const paginationSignatures = reversedSignatures.slice(endIndex - limit, endIndex);
    const signedUrlSignatures = paginationSignatures.map(async (signature) => ({
      remoteId: signature,
      presignedUrl: await this.awsService.getSignedUrl({
        keyFile: signature,
        bucketName: this.environmentService.getByKey(
          EnvConstants.S3_PROFILES_BUCKET,
        ),
      }),
    }));

    const signedSignatures = await Promise.all(signedUrlSignatures);
    return {
      signatures: signedSignatures,
      hasNext,
      offset,
      limit,
      total: signatures.length,
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updateSignaturePosition')
  async updateSignaturePosition(
    @Context() context,
    @Args('input') input: UpdateSignaturePositionInput,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const { signatureRemoteId, toPosition } = input;

    const { signatures: defaultList } = await this.userService.findUserById(user._id, { signatures: 1 });
    const updatedPositionList = this.userService.updateSignaturePosition({ defaultList, signatureRemoteId, toPosition });
    const userProperty = {
      signatures: updatedPositionList,
    };

    await this.userService.updateUserPropertyById(user._id, userProperty);
    return {
      statusCode: HttpStatus.OK,
      message: "Signature 's position has been updated",
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  getSuggestedPremiumOrgListOfUser(
    @Context() context,
  ): Promise<SuggestedPremiumOrganization[]> {
    const { user } = context.req;

    const targetDomain = Utils.getEmailDomain(user.email);
    if (popularDomains[targetDomain]) {
      throw GraphErrorException.Forbidden('Does not support popular domain');
    }
    return this.organizationService.getSuggestedPremiumOrganization({
      user, targetDomain,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getOnedriveToken(
    @Context() context,
  ): Promise<OneDriveTokenResponse> {
    const { cookies } = context.req;
    const oneDriveAccessTokenKey = cookies[OpenOneDriveCookie.OneDriveKey];
    const encryptData = await this.redisService.getRedisValueWithKey(`${RedisConstants.ONEDRIVE_ACCESS_TOKEN}${oneDriveAccessTokenKey}`);
    if (!encryptData) {
      return null;
    }
    return this.openOneDriveService.decryptData(encryptData);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation()
  async increaseExploredFeatureUsage(
    @Context() context,
    @Args('input') input: IncreaseExploredFeatureUsageInput,
  ) {
    const { key } = input;
    const { user } = context.req;
    await this.userService.updateExploredFeature({
      exploredFeatureKey: key,
      userId: user._id,
    });

    return {
      statusCode: HttpStatus.OK,
      message: "Explored feature's usage has been updated",
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async verifyOrganizationInviteLink(
    @Context() context: { req: { user: User } },
    @Args('inviteLinkId') inviteLinkId: string,
  ): Promise<VerifyOrganizationInviteLinkPayload> {
    const { user } = context.req;
    return this.organizationInviteLinkService.verifyInviteLink(inviteLinkId, user);
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getOrganizationWithJoinStatus(
    @Args('orgId') orgId: string,
    @Context() ctx: { req: { user: User } },
  ): Promise<SuggestedPremiumOrganization> {
    const { user } = ctx.req;
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }
    const { associateDomains, settings } = organization;
    if (!associateDomains.length) {
      throw GraphErrorException.NotAcceptable(
        'Organization associated domains must have at least one',
      );
    }
    if (settings.domainVisibility === DomainVisibilitySetting.INVITE_ONLY) {
      throw GraphErrorException.NotAcceptable(
        "Organization's visibility only accept invite only",
      );
    }
    if (!associateDomains.includes(user.emailDomain)) {
      throw GraphErrorException.NotAcceptable(
        'User does not match any associated domains of Organization',
      );
    }
    const [organizationWithExtraInfo] = await this.organizationService.getExtraOrganizationInfos({
      user,
      organizations: [organization],
      options: {
        withOwner: false,
      },
    });

    if (!organizationWithExtraInfo) {
      throw GraphErrorException.UnprocessableError(
        'Cannot get organization with join status',
      );
    }

    return {
      _id: organizationWithExtraInfo._id,
      name: organizationWithExtraInfo.name,
      url: organizationWithExtraInfo.url,
      avatarRemoteId: organizationWithExtraInfo.avatarRemoteId,
      domainVisibility: organizationWithExtraInfo.settings.domainVisibility,
      paymentType: organizationWithExtraInfo.payment.type,
      paymentStatus: organizationWithExtraInfo.payment.status,
      paymentPeriod: organizationWithExtraInfo.payment.period,
      joinStatus: organizationWithExtraInfo.joinStatus,
      members: organizationWithExtraInfo.members,
      totalMember: organizationWithExtraInfo.totalMember,
      createdAt: organizationWithExtraInfo.createdAt,
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('acceptNewTermsOfUse')
  async acceptNewTermsOfUse(
    @Context() context,
    @Args('input') input?: AcceptNewTermsOfUseInput,
  ): Promise<UpdateUserGuidePayload> {
    const { user } = context.req;
    const updatedUser = await this.userService.acceptNewTermsOfUse(user._id, input);
    return {
      user: updatedUser,
      statusCode: HttpStatus.OK,
      message: 'Update successfully',
    };
  }
}
