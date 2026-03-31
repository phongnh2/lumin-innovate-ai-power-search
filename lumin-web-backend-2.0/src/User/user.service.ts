import {
  FormatterOptionsArgs, Row, write,
} from '@fast-csv/format';
import { people } from '@googleapis/people';
import { HttpService } from '@nestjs/axios';
import {
  Injectable, Inject, forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as human from 'humanparser';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  orderBy, difference, without, get, isEmpty, uniqBy, reverse,
  partition,
  chunk,
} from 'lodash';
import * as moment from 'moment';
import {
  AnyBulkWriteOperation, BulkWriteResult, MongoServerError, UpdateResult,
} from 'mongodb';
import {
  Types, Model, ClientSession, QueryOptions, PipelineStage, FilterQuery, UpdateQuery, SortOrder, ProjectionType, UpdateWithAggregationPipeline,
} from 'mongoose';
import { PassThrough, Readable } from 'stream';
import { v4 as uuid } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { SortStrategy } from 'Common/common.enum';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { DEFAULT_FOLDER_COLORS } from 'Common/constants/FolderConstants';
import { OperationLimitConstants } from 'Common/constants/OperationLimitConstants';
import { popularDomains } from 'Common/constants/OrganizationConstants';
import { Platforms } from 'Common/constants/Platform';
import { SOCKET_MESSAGE, SOCKET_NAMESPACE } from 'Common/constants/SocketConstants';
import { SUBSCRIPTION_DELETE_USER_ACCOUNT, SUBSCRIPTION_UPDATE_USER } from 'Common/constants/SubscriptionConstants';
import { TeamRole } from 'Common/constants/TeamConstant';
import { ALLOW_AVATAR_MIMETYPE, MAXIMUM_AVATAR_SIZE } from 'Common/constants/UserAvatarConstants';
import {
  USER_TYPE,
  MAPPING_USER_PURPOSE,
  PURPOSE_STEP, PURPOSE,
  LIMIT_STORE_CONTACTS,
  LIMIT_USER_CONTACTS,
  LIMIT_GET_USERS,
  LIMIT_FOLDER_COLORS,
  LIMIT_GET_GOOGLE_CONTACTS,
  LIMIT_RETURN_GOOGLE_CONTACTS,
} from 'Common/constants/UserConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { ApplicationError, ServerErrorException } from 'Common/errors/ServerErrorException';
import { Utils } from 'Common/utils/Utils';

import { AwsService } from 'Aws/aws.service';

import { AdminService } from 'Admin/admin.service';
import { AuthService } from 'Auth/auth.service';
import { UserInvitationTokenType } from 'Auth/interfaces/auth.interface';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { BrazeService } from 'Braze/braze.service';
import { USER_VERSION, MAXIMUM_NUMBER_SIGNATURE } from 'constant';
import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { ORIGINAL_DOCUMENT_PERMISSION_ROLE } from 'Document/documentConstant';
import { IDocumentPermission } from 'Document/interfaces/document.interface';
import { DOCUMENT_INDEXING_PREPARATION_CONTEXT } from 'DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  AuthenType, UserFilterOptions, UserSortOptions, UserStatus, EntitySearchType,
  FindUserPayload, SearchUserStatus, Setting, User as UserGraph,
  LoginService, GetUserListInput, UserSearchField, UserSearchQuery, Currency, Document, NotificationTab, OrganizationPurpose,
  UpdateUserSubscriptionMetadata, FindLocationPayload, LocationType, Payment, UserRating, MobileFeedbackModalStatusInput,
  GetGoogleContactsContext,
  ExploredFeatureKeys,
  UserMetadataEnums,
  AcceptNewTermsOfUseInput,
} from 'graphql.schema';
import { KratosService } from 'Kratos/kratos.service';
import { LoggerService } from 'Logger/Logger.service';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { MembershipService } from 'Membership/membership.service';
import { IPricingUserMigration } from 'Microservices/redis/redis.interface';
import { RedisService } from 'Microservices/redis/redis.service';
import { DocumentMigrationResult, IOrganization, IOrganizationWithRole } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums, OrganizationTeamRoles, AccessTypeOrganization } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import {
  OrganizationPlans, PaymentPlanEnums, PaymentStatusEnums,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { UploadService } from 'Upload/upload.service';
import { USER_UPDATABLE_METADATA, NON_REVERSIBLE_METADATA } from 'User/constants/metadata.enum';
import { UserContact, UserContactItem, UserContactModel } from 'User/interfaces/user.contact.interface';
import {
  UpdateUserDataAfterSignUpInput,
  User,
  INewNotifications,
  GetUserPaymentInfoPayload,
  IDeleteSignature,
  IUpdateUserEmailsCommand,
  IGetStaticToolUploadWorkspacePayload,
  UserModel,
  ITrackAccountCreatedEventPayload,
  ChangeUserLoginServiceResult,
  OidcAvatarData,
} from 'User/interfaces/user.interface';
import { EditUserPurposeInput, UserPurpose, UserPurposeModel } from 'User/interfaces/user.purpose.interface';
import { UserCurrentStepEnums } from 'User/user.enum';
import { AuthenticationMethod, TAuthenticationEventAttributes } from 'UserTracking/authentication-event';
import { SyncAvatarEventAttributes, SyncAvatarEventMetrics } from 'UserTracking/sync-avatar-event';
import { UserTrackingService } from 'UserTracking/tracking.service';

// eslint-disable-next-line import/no-extraneous-dependencies
import { EXPLORED_FEATURE_MAPPING } from './constants/exploredFeatureMapping';
import { ChangeDomainLoginServiceInput, ChangeGroupLoginServiceInput, ChangeIndividualLoginServiceInput } from './dtos/changeUserLoginService.dto';
import { SyncAvatar } from './sync-avatar.service';

@Injectable()
export class UserService {
  /* eslint-disable no-return-await, global-require */

  nextTimeRateModalStatus = this.environmentService.getByKey(
    EnvConstants.NEXT_TIME_RATE_MODAL,
  ) || '';

  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('User') private readonly userModel: Model<UserModel>,
    @InjectModel('UserPurpose') private readonly userPurposeModel: Model<UserPurposeModel>,
    @InjectModel('UserContact') private readonly userContactModel: Model<UserContactModel>,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly environmentService: EnvironmentService,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    private readonly userTrackingService: UserTrackingService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly blacklistService: BlacklistService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly messageGateway: EventsGateway,
    private readonly uploadService: UploadService,
    @Inject(forwardRef(() => BrazeService))
    private readonly brazeService: BrazeService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly kratosService: KratosService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly luminContractService: LuminContractService,
  ) { }

  public publishDeleteAccount(
    { userId, fromProvisioning = false }:
    { userId: string; fromProvisioning?: boolean },
  ): void {
    this.pubSub.publish(`${SUBSCRIPTION_DELETE_USER_ACCOUNT}.${userId}`, {
      [SUBSCRIPTION_DELETE_USER_ACCOUNT]: {
        userId,
        fromProvisioning,
      },
    });
  }

  publishUpdateUser(payload: { user: User, type: string, metadata?: UpdateUserSubscriptionMetadata }): void {
    this.pubSub.publish(`${SUBSCRIPTION_UPDATE_USER}.${payload.user._id}`, {
      [SUBSCRIPTION_UPDATE_USER]: {
        type: payload.type,
        user: payload.user,
        metadata: payload.metadata,
      },
    });
  }

  public async createUser(newUser): Promise<User> {
    try {
      const isMigratedPersonalDoc = newUser.metadata?.isMigratedPersonalDoc;
      const hasInformedMyDocumentUpload = newUser.metadata?.hasInformedMyDocumentUpload;
      const data = {
        ...newUser,
        metadata: {
          ...newUser.metadata,
          isMigratedPersonalDoc: isMigratedPersonalDoc ?? true,
          hasInformedMyDocumentUpload: hasInformedMyDocumentUpload ?? true,
          beRemovedFromDeletedOrg: false,
          acceptedTermsOfUseVersion: `${this.environmentService.getByKey(EnvConstants.TERMS_OF_USE_VERSION)}`,
        },
      };
      const createdUser = await this.create(data as User);
      this.loggerService.info({
        context: 'info:createUser',
        extraInfo: {
          userId: createdUser._id,
        },
      });
      return createdUser;
    } catch (err) {
      this.loggerService.info({
        context: 'info:createUser:failed',
        error: err,
      });
      if (err instanceof MongoServerError && err.code === 11000) {
        // Ignore log for duplicate key
      } else {
        this.loggerService.error({
          error: err,
          context: 'createUser',
        });
      }
    }
    const createdUser = await this.create(newUser as User);
    this.loggerService.info({
      context: 'info:createUser:tryToCreate',
      extraInfo: {
        userId: createdUser._id,
      },
    });
    return createdUser;
  }

  async create(data: User): Promise<User> {
    const user = await this.userModel.create(data);
    return { ...user.toObject(), _id: user._id.toHexString() };
  }

  getValidUserName(email: string, name?: string) {
    return name || email.substring(0, 32) || 'Lumin User';
  }

  public async bulkUpdateManyUserEmails(updateUserEmailsCommand: IUpdateUserEmailsCommand): Promise<BulkWriteResult> {
    const { conditions: { emails }, updatedObj: { newEmails } } = updateUserEmailsCommand;
    const bulOps = emails.map((email, idx) => ({
      updateOne: {
        filter: { email },
        update: { email: newEmails[idx], emailDomain: Utils.getEmailDomain(newEmails[idx]) },
      },
    }));
    return this.userModel.bulkWrite(bulOps, { ordered: false });
  }

  public async verifyUserAccount(userId: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          isVerified: true,
        },
      },
    );
    if (result.modifiedCount > 0) {
      return true;
    }
    return false;
  }

  public async resetPassword(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    const newHashedPassword = await Utils.hashPassword(newPassword);
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          password: newHashedPassword,
        },
      },
    );
    if (result.modifiedCount > 0) {
      return true;
    }
    return false;
  }

  public async findUserById(userId: string | Types.ObjectId, projection?: ProjectionType<User>, includeNotVerified?: boolean): Promise<User> {
    const findConditions = {
      _id: userId,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    if (includeNotVerified) delete findConditions.isVerified;
    const user = await this.userModel.findOne(findConditions, projection);
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async updateUsers(
    conditions: FilterQuery<User>,
    updateFields: UpdateQuery<User>,
    options?: QueryOptions,
  ): Promise<any> {
    return this.userModel.updateMany(conditions, updateFields, options);
  }

  public async findUserToDeleteById(userId: string): Promise<User> {
    return await this.userModel.findOne({ _id: userId });
  }

  public async checkEmailInput(emails: string[]): Promise<void> {
    const unavailableEmails = await this.blacklistService.findAll(BlacklistActionEnum.CREATE_NEW_ACCOUNT, emails);
    if (unavailableEmails.length) {
      throw GraphErrorException.Forbidden('Unavailable user', ErrorCode.User.UNAVAILABLE_USER);
    }
  }

  public async existsUserEmail(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email: email.toLowerCase() });
    return !!user;
  }

  public async findUserByEmail(userEmail: string, projection?: ProjectionType<User>): Promise<User> {
    const findConditions = {
      email: userEmail.toLowerCase(),
    };
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findVerifiedUserByEmail(userEmail: string, projection?: ProjectionType<User>): Promise<User> {
    const findConditions = {
      email: userEmail.toLowerCase(),
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findVerifiedUsersByEmail(emails: string[], projection?: ProjectionType<User>): Promise<User[]> {
    const findConditions = {
      email: { $in: emails.map((email) => email.toLowerCase()) },
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    const users = await this.userModel.find(findConditions, projection).exec();
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
  }

  public async findUserByEmails(userEmails: string[], projection?: ProjectionType<User>): Promise<User[]> {
    const findConditions = {
      email: { $in: userEmails.map((email) => email.toLowerCase()) },
    };
    const users = await this.userModel.find(findConditions, projection).exec();
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
  }

  public async getUsersSameDomain(userId: string): Promise<FindUserPayload[]> {
    const currentUser = await this.findUserById(userId, { email: 1 });
    const emailDomain = Utils.getEmailDomain(currentUser.email);
    if (!popularDomains[emailDomain]) {
      const users = await this.userModel.find({ emailDomain, _id: { $ne: userId } }).limit(LIMIT_USER_CONTACTS);
      return users.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
    }
    return [];
  }

  public async findUserByAppleUserId(appleUserId: string, projection?: ProjectionType<User>): Promise<User> {
    const findConditions = {
      appleUserId,
    };
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findUserByIdentityId(identityId: string, projection?: unknown): Promise<User> {
    const findConditions = {
      identityId,
    };
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async updateUserByIdentityId(identityId: string, updateFields): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate({ identityId }, { $set: updateFields }, { new: true }).exec();
    return updatedUser ? { ...updatedUser.toObject(), _id: updatedUser._id.toHexString() } : null;
  }

  public async updateUserPropertyById(
    userId: string | Types.ObjectId,
    updateFields,
    includeNotVerified?: boolean,
    options: QueryOptions = {},
  ): Promise<User> {
    const findConditions = {
      _id: userId,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    if (includeNotVerified) delete findConditions.isVerified;
    return this.findOneAndUpdate(
      findConditions,
      { $set: { ...updateFields } },
      { new: true, ...options },
    );
  }

  public updateUserProperty(conditions, updateFields): Promise<User> {
    const findConditions = {
      ...conditions,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    return this.findOneAndUpdate(findConditions, { $set: { ...updateFields } }, { new: true });
  }

  public async updateUnverifiedUserProperty(conditions, updateFields): Promise<User> {
    const findConditions = {
      ...conditions,
    } as FilterQuery<User>;
    const updatedUser = await this.userModel.findOneAndUpdate(findConditions, { $set: { ...updateFields } }, { new: true }).exec();
    return updatedUser ? { ...updatedUser.toObject(), _id: updatedUser._id.toHexString() } : null;
  }

  public updateFolderColor(userId: string, color: string): Promise<User> {
    return this.findOneAndUpdate(
      { _id: userId, 'metadata.folderColors': { $ne: color } },
      { $push: { 'metadata.folderColors': { $each: [color], $slice: LIMIT_FOLDER_COLORS - DEFAULT_FOLDER_COLORS.length } } },
      { new: true },
    );
  }

  public undoDeleteUser(userId): Promise<User> {
    return this.findOneAndUpdate({ _id: userId }, { $unset: { deletedAt: 1 } }, { new: true });
  }

  public async reactivateUser(userId: string): Promise<User> {
    this.redisService.removeUsersToDelete([userId]);
    const { payment } = await this.findUserById(userId);
    if (payment.status === PaymentStatusEnums.CANCELED) {
      this.paymentService.updateStripeSubscription(
        payment.subscriptionRemoteId,
        { cancel_at_period_end: false },
        { stripeAccount: payment.stripeAccountId },
      );
    }
    const updatedProperties = { 'payment.status': PaymentStatusEnums.ACTIVE };
    const updatedUser = await this.findOneAndUpdate(
      { _id: userId },
      {
        $unset: { deletedAt: 1 },
        ...(payment.status === PaymentStatusEnums.CANCELED && updatedProperties),
      },
      { new: true },
    );
    this.emitReactivateAccount(updatedUser);
    this.trackPlanAttributes(userId);
    return updatedUser;
  }

  public async findUserByCustomerId(customerId: string, projection?: ProjectionType<User>): Promise<User> {
    const findConditions = {
      'payment.customerRemoteId': customerId,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findUserBySubcriptionId(subscriptionId: string, projection?: ProjectionType<User>): Promise<User> {
    const findConditions = {
      'payment.subscriptionRemoteId': subscriptionId,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    const user = await this.userModel.findOne(findConditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findUser(conditions: FilterQuery<User>, projection?: ProjectionType<User>): Promise<User> {
    const user = await this.userModel.findOne(conditions, projection).exec();
    return user ? { ...user.toObject(), _id: user._id.toHexString() } : null;
  }

  public async findUsers(conditions: FilterQuery<User>, projection?: ProjectionType<User>, options?: { limit?: number }): Promise<User[]> {
    const { limit = 0 } = options || {};
    const users = await this.userModel.find({ ...conditions }, projection).limit(limit).exec();
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
  }

  public aggregateUser(conditions: PipelineStage[]): Promise<any[]> {
    return this.userModel.aggregate(conditions).exec();
  }

  public async findOneAndUpdate(filter: FilterQuery<User>, update: UpdateQuery<User>, options?: QueryOptions): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(filter, update, options).exec();
    return updatedUser ? { ...updatedUser.toObject(), _id: updatedUser._id.toHexString() } : null;
  }

  public async findExternalSharees(refIds, searchKey: string) {
    const conditions = {
      _id: { $in: refIds },
    };
    if (searchKey) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(conditions, {
        $or: [
          { email: { $regex: searchKeyRegex, $options: 'i' } },
          { name: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      });
    }
    const projection = {
      _id: 1,
      avatarRemoteId: 1,
      email: 1,
      name: 1,
    };
    return this.findUsers(conditions, projection);
  }

  public countUsersByCustomConditions(conditions): Promise<number> {
    const findConditions = {
      ...conditions,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    return this.userModel.countDocuments(findConditions).exec();
  }

  public async deleteUserContact(userId: string, options?: QueryOptions<UserContact>): Promise<void> {
    await this.userContactModel.findOneAndDelete({ userId }, options).exec();
  }

  public async removeAvatarFromS3(avatarRemoteId: string): Promise<void> {
    if (!avatarRemoteId) {
      return;
    }
    try {
      await this.awsService.removeFileFromBucket(avatarRemoteId, EnvConstants.S3_DOCUMENTS_BUCKET);
    } catch (err) {
      /**
       * fallback for the previous migration data
       */
      await this.awsService.removeFileFromBucket(avatarRemoteId, EnvConstants.S3_PROFILES_BUCKET);
    }
  }

  public async getShareUsers(documentId: string, docType: string): Promise<Set<string>> {
    const shareUsers = new Set<string>();
    const documentPermissionList = await this.documentService.getDocumentPermissionsByDocId(documentId);
    documentPermissionList.forEach((documentPermission) => {
      if (documentPermission.role !== docType) {
        shareUsers.add(documentPermission.refId);
      }
    });
    return shareUsers;
  }

  public async addNewSignature({
    userId, isMobile, encodeSignature,
  }
    : { userId: string, isMobile: boolean, encodeSignature: string }): Promise<any> {
    const resultUser = await this.userModel.findById(userId).exec();
    const user = { ...resultUser.toObject(), _id: resultUser._id.toHexString() };
    const decodedData = this.uploadService.verifyUploadSignatureData(userId, encodeSignature);

    const isPremiumUser = await this.isAvailableUsePremiumFeature(user);
    let maximumNumberSignature = isPremiumUser ? MAXIMUM_NUMBER_SIGNATURE.PREMIUM_PLAN : MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;
    const { signatures: userSignatures = [] } = user;
    if (isMobile) { maximumNumberSignature = MAXIMUM_NUMBER_SIGNATURE.PREMIUM_PLAN; }
    if (userSignatures.length >= maximumNumberSignature) {
      return {
        errorCode: ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE,
        user: {
          signatures: userSignatures,
        },
        decodedData,
      };
    }

    const result = await this.findOneAndUpdate(
      { _id: userId },
      { $push: { signatures: decodedData.signatureRemoteId }, 'metadata.hasShownBananaBanner': true },
      {
        new: true,
      },
    );

    const customerRemoteId = result?.payment?.customerRemoteId;
    let currentCustomer;
    if (customerRemoteId) {
      currentCustomer = await this.paymentService.retrieveCustomer(customerRemoteId, null, { stripeAccount: result.payment.stripeAccountId });
    }

    const { metadata, signatures } = result || { metadata: {}, signatures: [] };
    return {
      // eslint-disable-next-line object-curly-newline, prefer-object-spread
      user: Object.assign(
        { billingEmail: currentCustomer?.email || user.email },
        {
          metadata,
          signatures,
        },
      ),
      decodedData,
    };
  }

  async deleteSignature({
    userInfo, removedIndex,
  }: IDeleteSignature): Promise<any> {
    const currentSignatures = userInfo.signatures;
    this.awsService.removeFileFromBucket(currentSignatures[removedIndex], EnvConstants.S3_PROFILES_BUCKET);
    currentSignatures.splice(removedIndex, 1);
    const userUpdated = await this.findOneAndUpdate(
      { _id: userInfo._id },
      { $set: { signatures: currentSignatures }, 'metadata.hasShownBananaBanner': true },
      {
        new: true,
      },
    );
    const customerRemoteId = userUpdated && userUpdated.payment && userUpdated.payment.customerRemoteId;
    let currentCustomer;
    if (customerRemoteId) {
      currentCustomer = await this.paymentService.retrieveCustomer(customerRemoteId, null, { stripeAccount: userUpdated.payment.stripeAccountId });
    }
    return {
      ...JSON.parse(JSON.stringify(userUpdated)),
      billingEmail: currentCustomer ? currentCustomer.email : userInfo.email,
    };
  }

  async getUserInfoToDeleteSignature(userId: string): Promise<any> {
    const projection = {
      _id: 1,
      signatures: 1,
      email: 1,
    };
    const userInfo = await this.userModel.findById(userId, projection);
    return userInfo ? { ...userInfo.toObject(), _id: userInfo._id.toHexString() } : null;
  }

  public async deleteSignatureByIndex(userId: string, index: number): Promise<any> {
    const userInfo = await this.getUserInfoToDeleteSignature(userId);
    const deleteResult = await this.deleteSignature({
      removedIndex: index,
      userInfo,
    });

    return deleteResult;
  }

  public async deleteSignatureByRemoteId(userId: string, signatureRemoteId: string): Promise<any> {
    const userInfo = await this.getUserInfoToDeleteSignature(userId);
    const currentSignatures = userInfo.signatures;
    const deleteSignatureIndex = currentSignatures.findIndex((signature) => signature === signatureRemoteId);
    if (deleteSignatureIndex === -1) {
      throw GraphErrorException.BadRequest('Signature not found');
    }
    const deleteResult = await this.deleteSignature({
      removedIndex: deleteSignatureIndex,
      userInfo,
    });

    this.messageGateway.server
      .to(SocketRoomGetter.user(userId))
      .emit(SOCKET_MESSAGE.REMOVE_USER_SIGNATURE, { remoteId: signatureRemoteId });

    return deleteResult;
  }

  public updateSignaturePosition({ defaultList, signatureRemoteId, toPosition }:
    { defaultList: string[], signatureRemoteId: string, toPosition: number }): any[] {
    const currentPosition = defaultList.findIndex((signature) => signatureRemoteId === signature);
    const updateSignaturePositions = [...defaultList];
    if (currentPosition !== -1) {
      updateSignaturePositions.splice(currentPosition, 1);
      // the signatures in front-end is revered(the latest will be shown first )
      // so we need to add - in front of toPosition to have the correct position to update
      updateSignaturePositions.splice(toPosition === 0 ? defaultList.length : -toPosition, 0, signatureRemoteId);
    }
    return updateSignaturePositions;
  }

  public async deleteUser(_id: string, session: ClientSession = null) {
    return this.userModel.findOneAndDelete({ _id }).session(session);
  }

  public async finishDeleteAccount(userId: string): Promise<User> {
    try {
      const promises = [];
      const ownedDocIds = [];
      const user = await this.findUserToDeleteById(userId);
      if (!user?.deletedAt) {
        this.loggerService.info({
          context: 'finishDeleteAccount',
          extraInfo: {
            userId,
          },
        });
        return null;
      }
      /* Delete user contact in Hubspot when user finally delete account */
      this.userTrackingService.deleteContactByEmail(user.email);
      const documents = await this.documentService.findDocumentByUserId(user._id);
      documents.forEach(async (document) => {
        const internalPermissions = await this.documentService.getDocumentPermissionsByDocId(
          document._id,
          { role: { $in: [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] } },
        );
        if (internalPermissions.length) {
          // If document is team-document
          // Update owner name of document
          const adminId = await this.getAdminIdByDocPermission(internalPermissions[0]);
          promises.push(this.documentService.updateDocument(document._id, { ownerName: user.name, ownerId: adminId }));
        } else {
          ownedDocIds.push(document._id);
          promises.push(this.documentService.deleteRemoteThumbnail(document.thumbnail));
          promises.push(this.documentService.deleteRemoteDocument(document));
          promises.push(this.documentService.deleteDocument(document._id));
        }
      });
      promises.push(
        this.documentService.deleteDocumentPermissions({
          refId: user._id,
        }),
        this.documentService.deleteDocumentPermissions({
          documentId: { $in: ownedDocIds },
        }),
      );
      promises.push(this.redisService.clearAllRefreshToken(user._id));
      promises.push(this.removeAvatarFromS3(user.avatarRemoteId));
      this.deleteUserContact(user._id);
      await Promise.all(promises);
      await this.deleteUser(user._id);
      return user;
    } catch (err) {
      this.loggerService.error({
        context: 'finishDeleteAccount',
        error: err,
        extraInfo: {
          userId,
        },
      });
      return null;
    }
  }

  public async getAdminIdByDocPermission(internalPermission: IDocumentPermission): Promise<string> {
    switch (internalPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        const [orgAdmin] = await this.organizationService.findMemberWithRoleInOrg(
          internalPermission.refId,
          OrganizationRoleEnums.ORGANIZATION_ADMIN,
        );
        return orgAdmin.userId.toHexString();
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const teamAdmin = await this.membershipService.findOne({
          teamId: internalPermission.refId, role: OrganizationTeamRoles.ADMIN,
        });
        return teamAdmin.userId.toHexString();
      }
      default: return '';
    }
  }

  public async isAvailableUsePremiumFeature(user: User): Promise<boolean> {
    if (user.payment.type !== PaymentPlanEnums.FREE) return true;
    const organization = await this.organizationService.getOnePremiumOrgOfUser(user._id);
    return Boolean(organization);
  }

  private getBasicQuery() {
    return {
      isVerified: true,
    } as any;
  }

  public async getUserPurpose(userId: string, projection?: ProjectionType<UserPurpose>): Promise<UserPurpose> {
    const userPurpose = await this.userPurposeModel.findOne({ userId }, projection).exec();
    return userPurpose ? { ...userPurpose.toObject(), _id: userPurpose._id.toHexString() } : null;
  }

  public async upsertUserPurpose(
    userId: string,
    newUserPurposeData: UpdateWithAggregationPipeline | UpdateQuery<UserPurpose>,
  ): Promise<UpdateResult> {
    return await this.userPurposeModel.updateOne({ userId }, newUserPurposeData, { upsert: true, new: true });
  }

  public async getUserCurrentStep(userId: string, isInvited = false): Promise<number> {
    const userPurpose = await this.getUserPurpose(userId, { currentStep: 1 });
    if (!userPurpose) {
      const userPurposeDefault = {
        currentStep: isInvited ? UserCurrentStepEnums.INVITE_USER_PURPOSE : UserCurrentStepEnums.USER_PURPOSE,
        purpose: '',
      };
      await this.upsertUserPurpose(userId, userPurposeDefault);
      return UserCurrentStepEnums.USER_PURPOSE;
    }
    return userPurpose.currentStep;
  }

  public async findUserByIds(
    userIds = [],
    projection: ProjectionType<User> = {},
    includeNotVerified: boolean = false,
  ): Promise<User[]> {
    const findConditions = {
      _id: {
        $in: userIds,
      },
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    if (includeNotVerified) delete findConditions.isVerified;
    const users = await this.userModel.find(findConditions, projection).exec();
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
  }

  public async handleUserFromlanding(userId: string, name: string, landingToken: string): Promise<boolean> {
    const { landingPageType } = this.jwtService.verify(landingToken);
    if (landingPageType && Object.values(USER_TYPE).includes(landingPageType as string)) {
      const userPurpose = MAPPING_USER_PURPOSE[landingPageType];
      await Promise.all([
        this.updateUserProperty({ _id: userId }, { type: landingPageType }),
        this.upsertUserPurpose(userId, { currentStep: PURPOSE_STEP.START_FREE_TRIAL, purpose: userPurpose }),
      ]);
      const teamData = { name: `${name.slice(0, 23)}${CommonConstants.DEFAULT_TEAM_NAME_POSTFIX}`, ownerId: userId };
      const createdTeam = await this.teamService.create(teamData);
      this.membershipService.createMany([{
        userId,
        teamId: createdTeam._id,
        role: TeamRole.ADMIN as any,
      }]);
      return true;
    }
    return false;
  }

  public async changePassword(newPassword: string, currentPassword: string, userId: string, refreshToken?: string): Promise<ApplicationError> {
    const validatePassword = Utils.validatePassword(newPassword);
    if (newPassword === currentPassword) {
      return ServerErrorException.BadRequest(
        'New password must be different from the current password',
        ErrorCode.User.NEW_PASSWORD_SAME_OLD_PASSWORD,
      );
    }
    if (!validatePassword) {
      return ServerErrorException.BadRequest(
        'New password must be greater than 6 characters and less than 32 characters',
        ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD,
      );
    }
    const user = await this.findUserById(userId);
    if (!user) {
      return ServerErrorException.BadRequest('User not found', ErrorCode.User.USER_NOT_FOUND);
    }
    const verifyPasswordStrength = this.authService.verifyUserPasswordStrength(user.email, newPassword);
    if (!verifyPasswordStrength.isVerified) {
      return ServerErrorException.BadRequest(
        'Your organization requested you to have a Strong password.',
        ErrorCode.User.ORGANIZATION_REQUIRE_STRONG_PASSWORD,
        { isNewPassWordError: true },
      );
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ServerErrorException.BadRequest('Current password is incorrect', ErrorCode.User.INVALID_PASSWORD_INPUT);
    }
    const password = await Utils.hashPassword(newPassword);
    const isDuplicated = await this.authService.isDuplicateRecentPassword(user.recentPasswords, newPassword);
    if (isDuplicated) {
      return ServerErrorException.BadRequest(
        'You used this password recently. Please use another password.',
        ErrorCode.User.DUPLICATE_RECENT_PASSWORD,
      );
    }
    const recentPasswords = [password, ...user.recentPasswords].filter(Boolean).slice(0, 3);
    this.updateUserPropertyById(userId, { password, recentPasswords });

    await this.redisService.setRefreshToken(userId, refreshToken);
    return null;
  }

  public async updateUserDataAfterSignUp({
    userId, email, userName, authenType, browserLanguageCode, createdAt, loginService, platform, userAgent, anonymousUserId,
  }: UpdateUserDataAfterSignUpInput & { browserLanguageCode?: string }): Promise<void> {
    let purpose = '';
    const promise = [];
    switch (authenType) {
      case AuthenType.CIRCLE_BUSINESS:
      case AuthenType.CIRCLE_FREE: {
        purpose = PURPOSE.SMALL_BUSINESS;
        break;
      }
      case AuthenType.INDIVIDUAL_PROFESSIONAL: {
        purpose = PURPOSE.PERSONAL;
        break;
      }
      default:
        break;
    }

    if (purpose) {
      promise.push(this.editUserPurpose({
        user: {
          _id: userId,
          email,
        },
        purpose,
        currentStep: PURPOSE_STEP.START_FREE_TRIAL,
      }));
    }

    const { firstName, middleName, lastName } = human.parseName(userName);
    const lastname = [middleName, lastName].filter(Boolean).join(' ');

    await this.userTrackingService.createContact({
      email,
      firstname: firstName,
      lastname,
      receive_marketing_email: 'Yes',
      api_key_user_ever: 'false',
      ...(browserLanguageCode && { browser_language: this.getLanguageDisplayName(browserLanguageCode) }),
    });

    await this.brazeService.upsertAudience([{
      external_id: userId,
      first_name: firstName,
      last_name: lastname,
      email,
      lumin_email_address: email,
      // Pause tracking for this attribute: https://lumin.atlassian.net/browse/LP-11558
      // lumin_email_domain: Utils.getEmailDomain(email),
    }]);
    this.trackAccountCreatedEvent({
      userId,
      email,
      createdAt,
      loginService,
      platform,
      userAgent,
      anonymousUserId,
    });
    await Promise.all(promise);
  }

  async trackAccountCreatedEvent({
    userId,
    loginService,
    platform,
    userAgent,
    anonymousUserId,
  }: ITrackAccountCreatedEventPayload) {
    try {
      const eventAttributes: TAuthenticationEventAttributes = {
        LuminUserId: userId,
        method: AuthenticationMethod[loginService.toUpperCase()],
        userAgent,
        anonymousUserId,
      };

      if (platform && Object.values(Platforms).includes(platform)) {
        eventAttributes.platform = platform;
      }

      this.userTrackingService.trackAccountCreatedEvent(eventAttributes);
      await new Promise((resolve) => { setTimeout(resolve, 30000); });
      this.loggerService.info({ context: this.trackAccountCreatedEvent.name, extraInfo: eventAttributes });
    } catch (error) {
      this.loggerService.error({
        context: this.trackAccountCreatedEvent.name,
        stack: error.stack,
        userId,
        error,
      });
    }
  }

  getLanguageDisplayName(languageCode: string): string {
    try {
      const languageNameInEnglish = new (Intl as any).DisplayNames(['en'], { type: 'language' });
      return languageNameInEnglish.of(languageCode);
    } catch {
      return undefined;
    }
  }

  updateBrowserLanguageToHubspot(params: { languageCode: string, email: string, lastLogin: Date }): void {
    const { languageCode, email, lastLogin } = params;
    const browserLanguage = this.getLanguageDisplayName(languageCode);
    const trackingBrowserLanguageDate = this.environmentService.getByKey(EnvConstants.TRACKING_BROWSER_LANGUAGE_START_DATE);
    const lastLoginDate = moment(lastLogin);
    const isUpdatedBrowserLanguage = lastLoginDate.isAfter(trackingBrowserLanguageDate);
    // Update the browser language setting if the last login was before the code release.
    if (!isUpdatedBrowserLanguage && browserLanguage) {
      this.updateHubspotContact(email, { browserLanguage });
      this.loggerService.info({
        context: 'updateBrowserLanguageToHubspot',
        extraInfo: {
          language: browserLanguage,
        },
      });
    }
  }

  async updateHubspotContact(email: string, attributes: Record<string, any> = {}): Promise<void> {
    const user = await this.findUserByEmail(email);
    const { firstName, middleName, lastName } = human.parseName(user.name || email.split('@')[0]);
    const lastname = [middleName, lastName].filter(Boolean).join(' ');
    const defaultProperties = {
      firstname: firstName,
      lastname,
      receive_marketing_email: 'Yes',
    };
    return this.userTrackingService.updateUserContact(
      email,
      {
        ...Utils.toSnakeCaseKeys(attributes),
        ...defaultProperties,
      },
    );
  }

  async editUserPurpose({
    user, purpose, currentStep,
  }: EditUserPurposeInput, options: { disableHubspot?: boolean } = {}): Promise<number> {
    const { _id: userId, email, payment } = user;
    const [userCurrentStep, userPurpose] = await Promise.all([
      this.getUserCurrentStep(userId),
      this.getUserPurpose(userId),
    ]);
    const newUserCurrentStep: number = (userCurrentStep && userCurrentStep > currentStep) ? userCurrentStep : currentStep;
    const updateData = {
      currentStep: newUserCurrentStep,
    } as { currentStep: number, purpose: string };

    const purposeChanged = userPurpose?.purpose !== purpose;

    if (!options.disableHubspot && purposeChanged) {
      updateData.purpose = purpose;
      const purposeFormatted = Utils.capitalizeAllWords(purpose);
      this.userTrackingService.updateUserContact(
        email,
        {
          purpose: purposeFormatted,
          stripeplan: payment?.planRemoteId || UserTrackingService.STRIPE_PLAN.FREE_USER,
        },
      );
    }

    const result = await this.upsertUserPurpose(userId, updateData);

    if (!result) {
      throw GraphErrorException.BadRequest('Failed to update. Please try again later.');
    }
    return newUserCurrentStep;
  }

  private sortOptionsMapping(sortOptions: UserSortOptions): Record<string, SortStrategy> {
    return Object.entries(sortOptions).reduce((prevValue, [key, value]) => ({
      ...prevValue,
      [key]: SortStrategy[value as string],
    }), {});
  }

  public getUserFilterQuery(searchQuery: UserSearchQuery, filterOptions: UserFilterOptions): Record<string, any> {
    const matchCondition = {};
    const { key: searchKey, field: searchField } = searchQuery || {};

    if (searchKey?.length) {
      switch (searchField) {
        case UserSearchField.EMAIL: {
          Object.assign(
            matchCondition,
            { email: searchKey },
          );
          break;
        }
        case UserSearchField.NAME: {
          const searchPhrase = searchKey.split('@')[0];
          Object.assign(
            matchCondition,
            { $text: { $search: `"${searchPhrase}"` } },
          );
          break;
        }
        case UserSearchField.EMAIL_DOMAIN: {
          Object.assign(
            matchCondition,
            { emailDomain: searchKey },
          );
          break;
        }
        default: break;
      }
    }

    if (filterOptions?.status) {
      switch (filterOptions.status) {
        case UserStatus.DELETE:
          Object.assign(matchCondition, {
            deletedAt: { $type: 'date' },
          });
          break;
        case UserStatus.UNVERIFIED:
          Object.assign(matchCondition, {
            isVerified: false,
          });
          break;
        default:
          break;
      }
    }
    return matchCondition;
  }

  public async getUsers({
    searchQuery,
    limit,
    offset,
    sortOptions,
    filterOptions,
  }: GetUserListInput): Promise<[User[], number]> {
    const matchCondition = this.getUserFilterQuery(searchQuery, filterOptions);

    const projection = {
      _id: 1,
      name: 1,
      email: 1,
      payment: 1,
      timezoneOffset: 1,
      createdAt: 1,
      avatarRemoteId: 1,
      deletedAt: 1,
      isVerified: 1,
    };
    const sortCondition = sortOptions
      ? this.sortOptionsMapping(sortOptions)
      : { createdAt: -1 };
    const userList = await this.userModel.find(matchCondition, projection)
      .sort(sortCondition as unknown as { [key: string]: SortOrder }).skip(offset)
      .limit(limit);
    const returnUsers = userList.map((user) => ({ ...user.toObject(), _id: user._id.toHexString() }));
    let totalUsers = 0;
    if (!Object.keys(matchCondition).length) {
      totalUsers = await this.userModel.estimatedDocumentCount();
    } else {
      totalUsers = await this.userModel.find(matchCondition).limit(LIMIT_GET_USERS).countDocuments();
    }
    return [returnUsers, Math.min(totalUsers, LIMIT_GET_USERS)];
  }

  updateLastAccessedOrg(userId: string, orgId: string): string {
    this.redisService.setRedisData(`${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${userId}`, orgId);
    this.redisService.setExpireKey(`${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${userId}`, CommonConstants.EXPIRE_LAST_ACCESSED_ORG_ID);
    return orgId;
  }

  async getLastAccessedOrg(userId: string): Promise<string> {
    try {
      const orgId = await this.redisService.getRedisValueWithKey(`${RedisConstants.USER_LAST_ACCESSED_ORG_ID}${userId}`);
      if (!orgId) {
        return this.recoverLastAccessedOrg(userId);
      }
      const [orgMembership, lastOrg] = await Promise.all([
        this.organizationService.getMembershipByOrgAndUser(orgId, userId, { _id: 1 }),
        this.organizationService.findOneOrganization({ _id: orgId }, { url: 1 }),
      ]);
      if (orgMembership && lastOrg) {
        return lastOrg.url;
      }
      return this.recoverLastAccessedOrg(userId);
    } catch (err) {
      this.loggerService.error({
        context: 'getLastAccessedOrg',
        stack: err.stack,
        userId,
        error: err,
      });
      return '';
    }
  }

  async recoverLastAccessedOrg(userId: string): Promise<string> {
    const userOrgs = await this.organizationService.getOrgListByUser(userId, { limit: 1 });
    return userOrgs.length ? userOrgs[0].url : '';
  }

  public async updateContactList(userId: string, contactIds: string[]): Promise<UserContact> {
    const userContact = await this.userContactModel.findOne({ userId });
    const contactList: UserContactItem[] = userContact?.contacts || [];
    const activityDate = new Date();

    const currentContactListIds = contactList.map((contact) => contact.userId);
    const newContacts = difference(contactIds, currentContactListIds).map((id) => ({ userId: id, recentActivity: activityDate }));

    const updatedExistContacts = contactList
      .map((contact) => {
        if (contactIds.includes(contact.userId)) {
          return { userId: contact.userId, recentActivity: activityDate };
        }
        return contact;
      })
      .sort((contact1: UserContactItem, contact2: UserContactItem) => contact1.recentActivity.getTime() - contact2.recentActivity.getTime());
    const mergedContacts: UserContactItem[] = [...newContacts, ...updatedExistContacts];
    if (mergedContacts.length > LIMIT_STORE_CONTACTS) {
      mergedContacts.splice(LIMIT_STORE_CONTACTS);
    }
    const updatedContact = await this.userContactModel.findOneAndUpdate(
      { userId },
      { contacts: mergedContacts },
      { new: true, upsert: true },
    );
    return updatedContact ? { ...updatedContact.toObject(), _id: updatedContact._id.toHexString() } : null;
  }

  public async getUserContacts(
    params: { userId: string, excludeSharedIds: string[], searchKey: string, excludeOrgId?: string, excludeTeamId?: string },
  ): Promise<FindUserPayload[]> {
    const {
      userId, excludeSharedIds, searchKey, excludeOrgId, excludeTeamId,
    } = params;
    const orgId = new Types.ObjectId(excludeOrgId);
    const teamId = new Types.ObjectId(excludeTeamId);
    const matchUserCondition = {
      $expr: {
        $eq: ['$_id', '$$userId'],
      },
      deletedAt: { $exists: false },
    };
    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(matchUserCondition, {
        $or: [
          { email: { $regex: searchKeyRegex, $options: 'i' } },
          { name: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      });
    }

    const aggregatePipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      { $unwind: '$contacts' },
      {
        $match: {
          'contacts.userId': { $nin: excludeSharedIds },
        },
      },
      {
        $addFields: {
          contactUserId: { $toObjectId: '$contacts.userId' },
        },
      },
      {
        $lookup: {
          from: excludeOrgId ? 'organizationmembers' : 'memberships',
          let: { userId: '$contactUserId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: excludeOrgId ? ['$orgId', orgId] : ['$teamId', teamId] },
                  ],
                },
              },
            },
          ],
          as: 'member',
        },
      },
      { $match: { member: [] } },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$contactUserId' },
          pipeline: [
            {
              $match: matchUserCondition,
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      { $sort: { 'contacts.recentActivity': -1 } },
      { $limit: LIMIT_USER_CONTACTS },
      {
        $replaceRoot: {
          newRoot: '$user',
        },
      },
      {
        $addFields: {
          status: SearchUserStatus.USER_VALID,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          avatarRemoteId: 1,
          email: 1,
          status: 1,
        },
      },
    ];
    if (!excludeOrgId && !excludeTeamId) {
      aggregatePipeline.splice(4, 2);
    }
    const result = await this.userContactModel.aggregate(aggregatePipeline as PipelineStage[]);
    return uniqBy(result, 'email');
  }

  public async getUserIdsExcludeFromContactList(targetId: string, targetType: EntitySearchType): Promise<string[]> {
    switch (targetType) {
      case EntitySearchType.ORGANIZATION_GRANT_BILLING: {
        const orgMemberships = await this.organizationService.findMemberWithRoleInOrg(
          targetId,
          [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
          { userId: 1, role: 1 },
        );
        return orgMemberships.map((member) => member.userId.toHexString());
      }
      default: return [];
    }
  }

  public async getOrgIdsToFindUserContact(userId: string, targetType: EntitySearchType, targetId: string): Promise<string[]> {
    switch (targetType) {
      case EntitySearchType.DOCUMENT: {
        const memberships = await this.organizationService.getMembershipOrgByUserId(userId, { orgId: 1 });
        return memberships.map((member) => member.orgId.toHexString());
      }
      case EntitySearchType.ORGANIZATION_TEAM: {
        const [teamMembership] = await this.teamService.getTeamMemberShipByConditions({ conditions: { teamId: targetId, userId } });
        if (teamMembership) {
          const orgTeam = await this.teamService.findOneById(targetId, { belongsTo: 1 });
          return orgTeam ? [orgTeam.belongsTo.toHexString()] : [];
        }
        throw GraphErrorException.NotAcceptable('You have not permission with this team');
      }
      case EntitySearchType.ORGANIZATION: {
        const memberships = await this.organizationService.getMembershipOrgByUserId(userId, { orgId: 1 });
        return memberships.filter((mem) => mem.orgId.toHexString() !== targetId).map((member) => member.orgId.toHexString());
      }
      case EntitySearchType.ORGANIZATION_CREATION: {
        const memberships = await this.organizationService.getMembershipOrgByUserId(userId, { orgId: 1 });
        return memberships.map((mem) => mem.orgId.toHexString());
      }
      case EntitySearchType.ORGANIZATION_GRANT_BILLING:
      case EntitySearchType.ORGANIZATION_TEAM_CREATION: {
        const membership = await this.organizationService.getMembershipByOrgAndUser(targetId, userId, { orgId: 1 });
        if (membership) {
          return [targetId];
        }
        throw GraphErrorException.NotAcceptable('You have not permission with this organization');
      }
      default: return [];
    }
  }

  public async getContactList(
    {
      targetId, targetType, userId, searchKey, excludeUserIds,
    }
      : { targetId: string, targetType: EntitySearchType, userId: string, searchKey: string, excludeUserIds: string[] },
  ): Promise<FindUserPayload[]> {
    let interactionList: FindUserPayload[] = [];
    const isOrgMembersSearchAction = [
      EntitySearchType.ORGANIZATION_GRANT_BILLING, EntitySearchType.ORGANIZATION_TEAM, EntitySearchType.ORGANIZATION_TEAM_CREATION,
    ].includes(targetType);
    interactionList = await this.getUserContacts({ userId, excludeSharedIds: excludeUserIds, searchKey });
    const exceptedMembers = isOrgMembersSearchAction
      ? excludeUserIds
      : excludeUserIds.concat(interactionList.map((interactor) => interactor._id));
    if (interactionList.length >= LIMIT_USER_CONTACTS && !isOrgMembersSearchAction) {
      return interactionList.slice(0, LIMIT_USER_CONTACTS);
    }
    const organizationContactList = await this.getOrganizationContactList({
      userId, targetType, targetId, searchKey, excludeUserIds: exceptedMembers,
    });
    const interactorIds = interactionList.map((interactor) => interactor._id);
    if (isOrgMembersSearchAction) {
      const contactListWithPriority = organizationContactList.map((user) => {
        const index = interactorIds.indexOf(user._id);
        return {
          priority: index < 0 ? interactorIds.length : index,
          status: SearchUserStatus.USER_VALID,
          ...user,
        };
      });
      return orderBy(contactListWithPriority, 'priority', 'asc');
    }
    const contactList = interactionList.concat(organizationContactList.slice(0, LIMIT_USER_CONTACTS - interactionList.length));
    return contactList.map(({
      avatarRemoteId, name, email, _id,
    }) => ({
      _id, avatarRemoteId, name, email, status: SearchUserStatus.USER_VALID,
    }));
  }

  public async getContactListToShareDocument(
    params: { documentId: string, userId: string, searchKey: string, pickedUserIds: string[] },
  ): Promise<FindUserPayload[]> {
    const {
      documentId, userId, searchKey, pickedUserIds,
    } = params;
    const [allDocumentPermissions, document] = await Promise.all([
      this.documentService.getDocumentPermissionsByDocId(documentId),
      this.documentService.getDocumentByDocumentId(documentId),
    ]);
    const originalDocPermission = allDocumentPermissions
      .find((docPermission) => ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(docPermission.role as DocumentRoleEnum));
    const orgIds = await this.getOrgIdsToFindUserContact(userId, EntitySearchType.DOCUMENT, documentId);
    const sharedPermission = allDocumentPermissions.find(({ role, refId }) => refId.toHexString() === userId && role === DocumentRoleEnum.SHARER);
    if (sharedPermission) {
      return this.getContactListOfSharedDocument({
        orgIds, userId, documentPermissions: allDocumentPermissions, searchKey, pickedUserIds,
      });
    }
    switch (originalDocPermission?.role) {
      case DocumentRoleEnum.OWNER: {
        return this.getContactListOfPersonalDocument({
          userId, documentId, searchKey, pickedUserIds,
        });
      }
      case DocumentRoleEnum.ORGANIZATION: {
        return this.getContactListOfOrgDocument({
          userId, document: document as unknown as Document, documentPermission: originalDocPermission, orgIds, searchKey, pickedUserIds,
        });
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        return this.getContactListOfTeamDocument({
          userId, orgIds, document: document as unknown as Document, documentPermission: originalDocPermission, searchKey, pickedUserIds,
        });
      }
      default: {
        return null;
      }
    }
  }

  async getContactListOfSharedDocument(
    params: { orgIds: string[], userId: string, searchKey: string, documentPermissions: IDocumentPermission[], pickedUserIds: string[] },
  ): Promise<FindUserPayload[]> {
    const {
      userId, documentPermissions, searchKey, orgIds, pickedUserIds,
    } = params;

    if (!documentPermissions || documentPermissions.length === 0) {
      return null;
    }

    const [canSharePermissionIds, docOwnerId, originalDocPermission] = documentPermissions
      .reduce(([sharedIds, ownerId, rootDocPermission], docPermission) => {
        if (docPermission.role === DocumentRoleEnum.SHARER) {
          return [[...sharedIds, docPermission.refId.toHexString()], ownerId, rootDocPermission];
        }
        if (docPermission.role === DocumentRoleEnum.OWNER) {
          return [sharedIds, docPermission.refId.toHexString(), docPermission];
        }
        if (ORIGINAL_DOCUMENT_PERMISSION_ROLE.includes(docPermission.role as DocumentRoleEnum)) {
          return [sharedIds, ownerId, docPermission];
        }
        return [sharedIds, ownerId, rootDocPermission];
      }, [[], '', null]);

    if (!originalDocPermission) {
      return null;
    }
    const { role: docRole, refId } = originalDocPermission;
    switch (docRole) {
      case DocumentRoleEnum.OWNER: {
        const interactionList = await this.getUserContacts({
          userId, excludeSharedIds: [...canSharePermissionIds, ...pickedUserIds, docOwnerId], searchKey,
        });
        if (interactionList.length >= LIMIT_USER_CONTACTS) {
          return interactionList.slice(0, LIMIT_USER_CONTACTS);
        }
        const interactorIds = interactionList.map(({ _id }) => _id);
        const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
          userId, orgIds, searchKey, excludeUserIds: [...canSharePermissionIds, ...interactorIds, ...pickedUserIds, docOwnerId],
        });
        return this.returnContactList([...interactionList, ...orgContactList]);
      }
      case DocumentRoleEnum.ORGANIZATION: {
        const interactionList = await this.getUserContacts({
          userId, excludeSharedIds: [userId, ...canSharePermissionIds, ...pickedUserIds], searchKey, excludeOrgId: refId.toHexString(),
        });
        if (interactionList.length >= LIMIT_USER_CONTACTS) {
          return interactionList.slice(0, LIMIT_USER_CONTACTS);
        }
        const interactorIds = interactionList.map(({ _id }) => _id);
        const orgMemberships = await this.organizationService.getMembersByOrgId(refId as string, { userId: 1 });
        const orgMemberIds = orgMemberships.map(({ userId: _id }) => _id.toHexString());
        const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
          userId,
          searchKey,
          orgIds: without(orgIds, refId.toHexString()),
          excludeUserIds: [...canSharePermissionIds, ...interactorIds, ...orgMemberIds, ...pickedUserIds, refId.toHexString()],
        });
        return this.returnContactList([...interactionList, ...orgContactList]);
      }
      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const interactionList = await this.getUserContacts({
          userId, searchKey, excludeSharedIds: [userId, ...canSharePermissionIds, ...pickedUserIds], excludeTeamId: refId.toHexString(),
        });
        if (interactionList.length >= LIMIT_USER_CONTACTS) {
          return interactionList.slice(0, LIMIT_USER_CONTACTS);
        }
        const interactorIds = interactionList.map(({ _id }) => _id);
        const teamMembership = await this.membershipService.find({ teamId: refId }, { userId: 1 });
        const membershipIds = teamMembership.map(({ userId: memberId }) => memberId.toHexString());
        const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
          userId, searchKey, orgIds, excludeUserIds: [...interactorIds, ...membershipIds, ...canSharePermissionIds, ...pickedUserIds],
        });
        return this.returnContactList([...interactionList, ...orgContactList]);
      }
      default: return null;
    }
  }

  async getContactListOfPersonalDocument(
    params: { userId: string, documentId: string, searchKey: string, pickedUserIds: string[] },
  ): Promise<FindUserPayload[]> {
    const {
      userId, searchKey, documentId, pickedUserIds,
    } = params;
    const interactionList = await this.getUserContacts({ userId, excludeSharedIds: [userId, ...pickedUserIds], searchKey });
    const interactorIds = interactionList.map((interactor) => interactor._id);

    const orgContactList = await this.getOrganizationContactList({
      userId, targetType: EntitySearchType.DOCUMENT, targetId: documentId, searchKey, excludeUserIds: [...interactorIds, ...pickedUserIds],
    });

    if (interactionList.length >= LIMIT_USER_CONTACTS) {
      return interactionList.slice(0, LIMIT_USER_CONTACTS);
    }
    return this.returnContactList([...interactionList, ...orgContactList]);
  }

  async getContactListOfOrgDocument(
    params: {
      userId: string, document: Document, documentPermission: IDocumentPermission, orgIds: string[], searchKey: string, pickedUserIds: string[]
    },
  ): Promise<FindUserPayload[]> {
    const {
      userId, documentPermission, searchKey, orgIds, document, pickedUserIds,
    } = params;
    const docOwnerId = document.ownerId?.toHexString();
    const { refId: orgId } = documentPermission;
    const [orgManagers, membership] = await Promise.all([
      this.organizationService.findMemberWithRoleInOrg(
        documentPermission.refId,
        [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
      ),
      this.organizationService.getMembershipByOrgAndUser(orgId, userId),
    ]);
    const managerIds = orgManagers.map((manager) => manager.userId.toHexString());
    if ([OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR].includes(membership.role as OrganizationRoleEnums)) {
      const interactionList = await this.getUserContacts({
        userId, excludeSharedIds: [...managerIds, ...pickedUserIds, userId, docOwnerId], searchKey,
      });
      if (interactionList.length >= LIMIT_USER_CONTACTS) {
        return this.returnShareDocumentContactList(document, interactionList);
      }
      const interactorIds = interactionList.map((interactor) => interactor._id);
      const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
        userId, orgIds, searchKey, excludeUserIds: [...managerIds, ...interactorIds, ...pickedUserIds, userId, docOwnerId],
      });
      return this.returnShareDocumentContactList(document, [...interactionList, ...orgContactList]);
    }
    const interactionList = await this.getUserContacts({
      userId, excludeSharedIds: [...managerIds, ...pickedUserIds, userId, docOwnerId], searchKey, excludeOrgId: orgId.toString(),
    });
    const interactorIds = interactionList.map(({ _id }) => _id);
    if (interactionList.length >= LIMIT_USER_CONTACTS) {
      return interactionList.slice(0, LIMIT_USER_CONTACTS);
    }
    const orgMemberships = await this.organizationService.getMembersByOrgId(orgId, { userId: 1 });
    const orgMemberIds = orgMemberships.map(({ userId: _id }) => _id.toHexString());
    const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
      userId,
      orgIds: without(orgIds, documentPermission.refId.toHexString()),
      searchKey,
      excludeUserIds: [userId, ...interactorIds, ...orgMemberIds, ...pickedUserIds],
    });
    return this.returnShareDocumentContactList(document, [...interactionList, ...orgContactList]);
  }

  returnShareDocumentContactList(document: Document, contacts: FindUserPayload[]): Promise<FindUserPayload[]> {
    return Promise.all(contacts.slice(0, LIMIT_USER_CONTACTS).map(async (contact) => {
      const existedPermission = await this.documentService.checkExistedDocPermission(contact._id, document);
      return {
        ...contact,
        status: SearchUserStatus.USER_VALID,
        grantedPermission: existedPermission.hasPermission,
      };
    }));
  }

  async getContactListOfTeamDocument(
    params: {
      userId: string, orgIds: string[], document: Document, documentPermission: IDocumentPermission, searchKey: string, pickedUserIds: string[]
    },
  ): Promise<FindUserPayload[]> {
    const {
      userId, documentPermission, searchKey, orgIds, document, pickedUserIds,
    } = params;
    const docOwnerId = document.ownerId?.toHexString();
    const { refId: teamId } = documentPermission;
    const teamMembership = await this.membershipService.findOne({ userId, teamId });
    if (teamMembership.role === OrganizationTeamRoles.ADMIN) {
      const interactionList = await this.getUserContacts({
        userId, excludeSharedIds: [...pickedUserIds, userId, docOwnerId], searchKey,
      });
      if (interactionList.length >= LIMIT_USER_CONTACTS) {
        return this.returnShareDocumentContactList(document, interactionList);
      }
      const interactorIds = interactionList.map((interactor) => interactor._id);
      const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
        userId, orgIds, searchKey, excludeUserIds: [userId, ...interactorIds, ...pickedUserIds, docOwnerId],
      }) as unknown as FindUserPayload[];
      return this.returnShareDocumentContactList(document, [...interactionList, ...orgContactList]);
    }
    const interactionList = await this.getUserContacts({
      userId, excludeSharedIds: [userId, ...pickedUserIds, docOwnerId], excludeTeamId: teamId, searchKey,
    });
    if (interactionList.length >= LIMIT_USER_CONTACTS) {
      return interactionList.slice(0, LIMIT_USER_CONTACTS);
    }
    const interactorIds = interactionList.map(({ _id }) => _id);
    const allTeamMemberships = await this.membershipService.find({ teamId });
    const membershipIds = allTeamMemberships.map(({ userId: _id }) => _id.toHexString());
    const orgContactList = await this.organizationService.getOrgMembershipsOfUser({
      userId, orgIds, searchKey, excludeUserIds: [...interactorIds, ...membershipIds, ...pickedUserIds, docOwnerId],
    }) as unknown as FindUserPayload[];
    return this.returnShareDocumentContactList(document, [...interactionList, ...orgContactList]);
  }

  returnContactList(contacts: User[] | FindUserPayload[]): FindUserPayload[] {
    return ((contacts as unknown[]) as User[]).slice(0, LIMIT_USER_CONTACTS).map(({
      avatarRemoteId, name, email, _id,
    }) => ({
      _id, avatarRemoteId, name, email, status: SearchUserStatus.USER_VALID,
    }));
  }

  async getOrganizationContactList({
    userId, targetType, targetId, searchKey, excludeUserIds,
  }:
    { userId: string, targetType: EntitySearchType, targetId: string, searchKey: string, excludeUserIds: string[] }): Promise<FindUserPayload[]> {
    const orgIds = await this.getOrgIdsToFindUserContact(userId, targetType, targetId);
    return this.organizationService.getOrgMembershipsOfUser({
      userId, orgIds, searchKey, excludeUserIds,
    });
  }

  async findUserToAdd(params: { actorId: string, email: string, targetType: EntitySearchType, targetId: string }): Promise<FindUserPayload> {
    const {
      actorId, email, targetType, targetId,
    } = params;
    switch (targetType) {
      case EntitySearchType.DOCUMENT: {
        const [user, document, [sharedNonLuminUser], userWithStatus] = await Promise.all([
          this.findUserByEmail(email),
          this.documentService.getDocumentByDocumentId(targetId),
          this.documentService.getNonLuminDocumentPermissions({ documentId: targetId, email }),
          this.documentService.verifyUserToUpdateDocumentPermission({ actorId, sharedEmail: email, documentId: targetId }),
        ]);
        if (!user) {
          return {
            email,
            grantedPermission: Boolean(sharedNonLuminUser),
          };
        }
        const existedPermission = await this.documentService.checkExistedDocPermission(user._id, document as unknown as Document);
        return {
          ...userWithStatus,
          grantedPermission: existedPermission.hasPermission,
        };
      }
      case EntitySearchType.ORGANIZATION:
        return this.organizationService.findUserToInvite(email, targetId);
      case EntitySearchType.ORGANIZATION_CREATION: {
        const userFound = await this.findVerifiedUserByEmail(email, null);
        if (userFound?.deletedAt) return { ...userFound, status: SearchUserStatus.USER_DELETING };
        return userFound
          ? { ...userFound, status: SearchUserStatus.USER_VALID }
          : { email, status: SearchUserStatus.USER_VALID };
      }
      case EntitySearchType.ORGANIZATION_TEAM_CREATION:
        return this.organizationTeamService.findUserToCreate(email, targetId);
      case EntitySearchType.ORGANIZATION_TEAM:
        return this.organizationTeamService.findUserToInvite(email, targetId);
      case EntitySearchType.ORGANIZATION_GRANT_BILLING:
        return this.organizationService.findUserToGrantModerator(email, targetId);
      default: break;
    }
    return null;
  }

  async findAvailableResourceLocation({
    orgId, userId, params,
  }: {
    orgId: string,
    userId: string,
    params: { cursor?: string, searchKey: string, context: LocationType, }
  }): Promise<FindLocationPayload> {
    const searchKeyRegex = Utils.transformToSearchRegex(params.searchKey);
    const teamPipeBase = [
      {
        $match: {
          belongsTo: new Types.ObjectId(orgId),
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          avatarRemoteId: 1,
          belongsTo: 1,
        },
      },
      {
        $lookup: {
          from: 'memberships',
          localField: '_id',
          foreignField: 'teamId',
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$userId', new Types.ObjectId(userId)] } },
                ],
              },
            },
          ],
          as: 'membership',
        },
      },
    ];
    switch (params.context) {
      case LocationType.ORGANIZATION_TEAM: {
        const teamPipe = [
          ...teamPipeBase,
          {
            $match: {
              membership: { $ne: [] },
              name: { $regex: searchKeyRegex, $options: 'i' },
            },
          },
          { $sort: { _id: 1 } },
          // FIXME: view all search. Handle loadmore later
          // { $limit: LOCATION_LIMIT },
        ];
        const teams = await this.teamService.aggregate(teamPipe as PipelineStage[]);
        const data = teams.map((team) => ({
          _id: team._id,
          name: team.name,
          avatarRemoteId: team.avatarRemoteId || '',
          path: {
            _id: team.belongsTo,
          },
        }));
        return {
          data,
          // FIXME: view all search. Handle loadmore later
          hasNextPage: false,
          cursor: data.length && data[data.length - 1]._id,
        };
      }
      case LocationType.FOLDER: {
        const teamRefObjectIds = [];
        const matchCondition = {};
        if (orgId) {
          const orgTeams = await this.organizationTeamService.getOrgTeams(orgId);
          teamRefObjectIds.push(...orgTeams.map(({ _id }) => new Types.ObjectId(_id)));
          const refIds = [new Types.ObjectId(orgId), ...teamRefObjectIds];
          Object.assign(matchCondition, {
            $or: [
              {
                refId: refIds.length === 1 ? refIds[0] : { $in: refIds },
              },
              {
                refId: new Types.ObjectId(userId),
                'workspace.refId': new Types.ObjectId(orgId),
              },
            ],
          });
        } else {
          Object.assign(matchCondition, {
            refId: new Types.ObjectId(userId),
            'workspace.refId': { $exists: false },
          });
        }
        const pipeline = [
          {
            $match: matchCondition,
          },
          {
            $lookup: {
              from: 'folders',
              foreignField: '_id',
              localField: 'folderId',
              pipeline: [
                {
                  $match: {
                    name: { $regex: searchKeyRegex, $options: 'i' },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                  },
                },
              ],
              as: 'folder',
            },
          },
          {
            $unwind: '$folder',
          },
          {
            $lookup: {
              from: 'teams',
              foreignField: '_id',
              localField: 'refId',
              let: { role: '$role' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$$role', FolderRoleEnum.ORGANIZATION_TEAM],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    belongsTo: 1,
                  },
                },
              ],
              as: 'team',
            },
          },
          {
            $unwind: {
              path: '$team',
              preserveNullAndEmptyArrays: true,
            },

          },
        ];
        const aggregateResult = await this.folderService.aggregateFolderPermission(pipeline);
        const data = aggregateResult.map((result) => ({
          ...result.folder,
          path: result.team ? {
            _id: result.team._id,
            name: result.team.name,
            path: {
              _id: result.team.belongsTo,
            },
          } : {
            _id: result.refId,
          },
        }));
        return {
          data,
          // FIXME: view all search. Handle loadmore later
          hasNextPage: false,
          cursor: data.length && data[data.length - 1]._id,
        };
      }
      default:
        break;
    }

    return null;
  }

  async deleteUserByEmails(emails: string[], adminId?: string): Promise<void> {
    await Promise.all(emails.map(async (email) => {
      try {
        const user = await this.findUserByEmail(email, { _id: 1, payment: 1 });
        if (!user) return;
        const userId = user._id;
        await this.adminService.deleteUserImmediately({ adminId, userId, addToBlacklist: false });
        await this.redisService.removeKeyFromhset(RedisConstants.DELETE_USER_IMMEDIATELY, email);
        this.loggerService.info({
          context: 'deleteUserAccount',
          error: `User deleted ${email} - ${userId}`,
        });
      } catch (err) {
        this.loggerService.error({
          context: 'deleteUserAccount',
          extraInfo: {
            email,
          },
          error: err,
        });
      }
    }));
  }

  async updateUserSetting(user: User, setting: Setting): Promise<User> {
    const { _id, email } = user;
    const receiveMarketingEmail = setting.marketingEmail ? 'Yes' : 'No';
    await this.userTrackingService.updateUserContact(email, { receive_marketing_email: receiveMarketingEmail });
    let updateFields = { setting } as { setting: Setting, 'metadata.isSyncedMarketingEmailSetting'?: boolean };

    // check Marketing email settings for changes
    const { featureUpdateEmail: updatedFeatureUpdateEmail, marketingEmail: updatedMarketingEmail } = setting;
    const { featureUpdateEmail: existingFeatureUpdateEmail, marketingEmail: existingMarketingEmail } = user.setting;
    if ((existingFeatureUpdateEmail !== updatedFeatureUpdateEmail) || (existingMarketingEmail !== updatedMarketingEmail)) {
      updateFields = { ...updateFields, 'metadata.isSyncedMarketingEmailSetting': false };
    }
    return this.updateUserProperty({ _id }, updateFields);
  }

  async interceptUserData({ user, loginService }
    : { user: User, loginService: LoginService }): Promise<UserGraph & { newNotifications: INewNotifications }> {
    const userId: string = user._id;
    const lastAccessedOrgUrl = await this.getLastAccessedOrg(userId);
    return {
      _id: userId,
      email: user.email,
      name: user.name,
      avatarRemoteId: user.avatarRemoteId,
      payment: user.payment,
      setting: user.setting,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      signatures: reverse(user.signatures),
      isNotify: user.isNotify,
      lastAccessedOrgUrl,
      loginService,
      endTrial: null,
      timezoneOffset: user.timezoneOffset,
      isUsingPassword: this.isUserUsingPassword(user),
      deletedAt: user.deletedAt,
      /**
       * @deprecated
       * We don't use daily upload limit anymore
       */
      reachUploadDocLimit: false,
      metadata: {
        ...user.metadata,
        folderColors: [...(user.metadata?.folderColors || []).reverse(), ...DEFAULT_FOLDER_COLORS],
      },
      hasNewVersion: user.version !== USER_VERSION,
      newNotifications: user.newNotifications || {
        general: false,
        invites: false,
        requests: false,
      },
      ...(user.type && { type: user.type }),
    };
  }

  async linkEmailWithKratosIdentity(email: string, id: string): Promise<void> {
    await this.userModel.updateOne({ email }, { $set: { identityId: id } });
  }

  async aggregateUserContact(conditions: PipelineStage[]): Promise<any[]> {
    return this.userContactModel.aggregate(conditions);
  }

  public async getMentionList(
    userId: string,
    refIds: string[],
    searchKey: string,
    limit: number,
  ): Promise<any[]> {
    const searchKeyRegex = searchKey ? Utils.transformToSearchRegex(searchKey) : '';
    const excludeIdList = [
      new Types.ObjectId(userId),
    ];
    const match = {
      _id: { $in: refIds, $nin: excludeIdList },
    };
    if (searchKeyRegex) {
      Object.assign(match, {
        $or: [
          { email: { $regex: searchKeyRegex, $options: 'i' } },
          { name: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      });
    }
    const conditions = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $unwind: '$contacts',
      },
      {
        $group: {
          _id: '$contacts.userId',
          contacts: {
            $last: '$contacts',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$contacts',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: { $toObjectId: '$userId' },
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
                _id: 1,
                avatarRemoteId: 1,
                email: 1,
                name: 1,
              },
            },
          ],
          as: 'userData',
        },
      },
      {
        $unwind: '$userData',
      },
      {
        $addFields: {
          'userData.recentActivity': '$recentActivity',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$userData',
        },
      },
      {
        $match: match,
      },
      {
        $sort: {
          recentActivity: -1,
        },
      },
      {
        $limit: limit,
      },
    ];
    return this.aggregateUserContact(conditions as PipelineStage[]);
  }

  public async getDefaultMentionList({
    userId, refIds, searchKey, limit, existingRefIds,
  }: {
    userId: string,
    refIds: string[],
    searchKey: string,
    limit: number,
    existingRefIds: string[],
  }): Promise<any[]> {
    const searchKeyRegex = searchKey ? Utils.transformToSearchRegex(searchKey) : '';

    let searchKeyMatch = {};
    if (searchKeyRegex) {
      searchKeyMatch = {
        $or: [
          { email: { $regex: searchKeyRegex, $options: 'i' } },
          { name: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      };
    }
    const conditions = [
      {
        $match: {
          _id: { $in: refIds, $nin: existingRefIds.map((id) => new Types.ObjectId(id)), $ne: new Types.ObjectId(userId) },
          ...searchKeyMatch,
        },
      },
      {
        $addFields: {
          order: {
            $indexOfArray: [refIds, '$_id'],
          },
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          avatarRemoteId: 1,
          email: 1,
          name: 1,
        },
      },
    ];
    return this.aggregateUser(conditions as PipelineStage[]);
  }

  public async checkReachLimitDailyUpload(userId: string): Promise<boolean> {
    const rateLimitDocument = await this.redisService.getRateLimitEndpoint(OperationLimitConstants.DOCUMENT_UPLOAD, userId);
    return Boolean(rateLimitDocument) && !rateLimitDocument.remaining;
  }

  public async updateUserMobileFreeToolsBanner(userId: string): Promise<User> {
    const findConditions = {
      _id: userId,
      ...this.getBasicQuery(),
    } as FilterQuery<User>;
    return this.findOneAndUpdate(findConditions, { 'metadata.hasShownMobileFreeToolsBanner': true }, { new: true });
  }

  public async getGoogleContacts({
    accessToken, orgId, action, googleAuthorizationEmail = '',
  }: {
    accessToken: string,
    orgId: string,
    action?: GetGoogleContactsContext,
    googleAuthorizationEmail?: string,
  }): Promise<FindUserPayload[]> {
    const googleClient = new OAuth2Client(this.environmentService.getByKey(EnvConstants.GOOGLE_CLIENT_ID));
    googleClient.setCredentials({ access_token: accessToken });
    const isPopularDomain = Utils.verifyDomain(googleAuthorizationEmail);
    let googleContacts: FindUserPayload[];
    if (isPopularDomain) {
      googleContacts = await this.listGoogleOtherContacts(googleClient);
    } else {
      googleContacts = await this.getGoogleDirectoryPeoples(googleClient);
    }
    const sortedGoogleContacts = orderBy(googleContacts, ['name'], ['asc']);
    const emailList = googleContacts.map(({ email }) => email);
    const userList = await this.findUserByEmails(emailList, { _id: 1, email: 1 });
    if (!action || action === GetGoogleContactsContext.ONBOARDING_FLOW) {
      return sortedGoogleContacts
        .filter((contact) => !userList.find(({ email }) => email === contact.email))
        .slice(0, LIMIT_RETURN_GOOGLE_CONTACTS);
    }
    return this.getGoogleContactToInviteOrg({ sortedGoogleContacts, orgId, userList });
  }

  async getGoogleContactToInviteOrg({ sortedGoogleContacts, orgId, userList }: {
    sortedGoogleContacts: FindUserPayload[], orgId: string, userList: User[],
  }): Promise<FindUserPayload[]> {
    const emailList = sortedGoogleContacts.map(({ email }) => email);
    const existedEmails = userList.map(({ email }) => email);
    const membersInfo = await this.organizationService.getMembersInfoByOrgId(orgId);
    const memberEmails = membersInfo.map((member) => member.user.email);
    const blacklists = await this.blacklistService.findAll(BlacklistActionEnum.CREATE_NEW_ACCOUNT, emailList);
    const blacklistEmails = blacklists.map(({ value }) => value);
    const orgInvites = await this.organizationService.getRequestAccessByCondition({
      actor: { $in: emailList },
      target: orgId,
      type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION] },
    });
    const invitedEmails = orgInvites.map((invite) => invite.actor);
    const unavailableEmails = [...memberEmails, ...blacklistEmails, ...invitedEmails];
    const googleContacts = sortedGoogleContacts
      .filter((contact) => !unavailableEmails.includes(contact.email))
      .slice(0, 2 * LIMIT_RETURN_GOOGLE_CONTACTS);
    return googleContacts.map((contact) => {
      if (existedEmails.includes(contact.email)) {
        return contact;
      }
      return {
        ...contact,
        remoteName: contact.name,
        name: '',
      };
    });
  }

  async listGoogleOtherContacts(auth): Promise<FindUserPayload[]> {
    const service = people({ version: 'v1', auth });
    try {
      const response = await service.otherContacts.list({
        pageSize: LIMIT_GET_GOOGLE_CONTACTS,
        readMask: 'names,emailAddresses,photos',
        sources: ['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE'],
      });
      const { otherContacts } = response.data;
      if (!otherContacts) {
        return [];
      }
      return otherContacts.map((contact) => ({
        name: get(contact, 'names[0].displayName') || get(contact, 'emailAddresses[0].value'),
        email: get(contact, 'emailAddresses[0].value'),
        avatarRemoteId: get(contact, 'photos[0].url'),
      })).filter(({ email }) => email);
    } catch (error) {
      this.loggerService.error({
        context: this.listGoogleOtherContacts.name,
        error: this.loggerService.getCommonErrorAttributes(error),
      });
      throw GraphErrorException.Forbidden('Cannot get google contacts');
    }
  }

  async getGoogleDirectoryPeoples(auth): Promise<FindUserPayload[]> {
    const service = people({ version: 'v1', auth });
    try {
      const response = await service.people.listDirectoryPeople({
        pageSize: LIMIT_GET_GOOGLE_CONTACTS,
        readMask: 'names,emailAddresses,photos',
        sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT', 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
      });
      const { people: peoples } = response.data;
      if (!peoples) {
        return [];
      }
      return peoples.map((_people) => ({
        name: get(_people, 'names[0].displayName') || get(_people, 'emailAddresses[0].value'),
        email: get(_people, 'emailAddresses[0].value'),
        avatarRemoteId: get(_people, 'photos[0].url'),
      })).filter(({ email }) => email);
    } catch (error) {
      this.loggerService.error({
        context: this.getGoogleDirectoryPeoples.name,
        error: this.loggerService.getCommonErrorAttributes(error),
      });
      throw GraphErrorException.Forbidden('Cannot get google directory peoples');
    }
  }

  getUserIpAddress(request: IGqlRequest | Request): string {
    return request.headers[CommonConstants.X_FORWARDED_FOR_HEADER]
      || request.headers[CommonConstants.CF_CONNECTING_IP]
      || request.headers[CommonConstants.TRUE_CLIENT_IP]
      || CommonConstants.DEFAULT_IP_ADDRESS;
  }

  async getUserGeolocation(ipAddress: string): Promise<any> {
    const ipStackKey = this.environmentService.getByKey(EnvConstants.IPSTACK_KEY);
    const { data } = await this.httpService.axiosRef.get(`http://api.ipstack.com/${ipAddress}?access_key=${ipStackKey}`);
    return data;
  }

  async getUserCurrencyBaseIpAddress(request: IGqlRequest): Promise<string> {
    if (this.environmentService.getByKey('ENV') !== 'development') {
      try {
        const ipAddress = this.getUserIpAddress(request);
        const data = await this.getUserGeolocation(ipAddress);
        const userCurrency = Object.keys(Currency).includes(data.currency.code as string) ? data.currency.code : Currency.USD;
        return userCurrency;
      } catch (err) {
        return Currency.USD;
      }
    }
    return Currency.USD;
  }

  async setUserNotificationStatus(params: {
    userId: string,
    tab: NotificationTab,
    time: Date,
  }): Promise<User> {
    const { userId, tab, time } = params;
    return this.updateUserProperty({ _id: userId }, { [`newNotifications.${tab.toLowerCase()}`]: time });
  }

  async updateJoinOrgPurpose({ email, orgId }: { email: string, orgId: string }): Promise<void> {
    const organization = await this.organizationService.getOrgById(orgId);
    const contact = await this.userTrackingService.getContactByEmail(email);
    if (contact) {
      const { properties: { join_org_purpose: joinOrgPurpose } } = contact;
      switch (joinOrgPurpose) {
        case OrganizationPurpose.WORK: {
          return;
        }
        case OrganizationPurpose.EDUCATION: {
          if (organization.purpose === OrganizationPurpose.WORK) {
            await this.userTrackingService.updateUserContact(email, { join_org_purpose: organization.purpose });
          }
          break;
        }
        case OrganizationPurpose.PERSONAL: {
          if ([OrganizationPurpose.WORK, OrganizationPurpose.EDUCATION].includes(organization.purpose)) {
            await this.userTrackingService.updateUserContact(email, { join_org_purpose: organization.purpose });
          }
          break;
        }
        default: {
          if (organization.purpose) {
            await this.userTrackingService.updateUserContact(email, { join_org_purpose: organization.purpose });
          }
          break;
        }
      }
    } else {
      await this.userTrackingService.updateUserContact(email, { join_org_purpose: organization.purpose });
    }
  }

  async getMaximumNumberSignature(userId: string): Promise<number> {
    const projection = {
      _id: 1,
      payment: 1,
    };
    const user = await this.findUserById(userId, projection);
    const userPayment: Payment = get(user, 'payment', {});
    const orgList = await this.organizationService.getOrgListByUser(userId);
    const listOrgPayment: Payment[] = orgList.map((org) => get(org, 'payment', {}));
    const listNumberSignature = [userPayment, ...listOrgPayment].map(
      (payment) => planPoliciesHandler
        .from({ plan: payment.type, period: payment.period })
        .getNumberSignature(),
    );
    return Math.max(...listNumberSignature);
  }

  async migratePersonalWorkspace(user: User): Promise<void> {
    const {
      payment, metadata, createdAt, _id: userId,
    } = user;
    // User was migrated or not FREE.
    if (metadata.isMigratedPersonalDoc || payment.type !== PaymentPlanEnums.FREE) {
      return;
    }
    // get all orgs of users
    const orgMemberships = await this.organizationService.getOrgMembershipByConditions({
      conditions: {
        userId,
      },
      projection: {
        orgId: 1,
      },
    });
    const orgIds = orgMemberships.map(({ orgId }) => orgId);
    const newAuthenDate = moment(this.environmentService.getByKey(EnvConstants.ENABLE_NEW_AUTHEN_DATE));
    // If user has no orgs and is created in new authen flow.
    // This user will go to new authen flow again and create org.
    // After that, when user refresh the browser, user will be migrated.
    if (!orgIds.length && newAuthenDate.isBefore(createdAt)) {
      return;
    }
    let error: Error;
    let data: DocumentMigrationResult & { destinationOrg?: IOrganization };
    try {
      data = await this.organizationService.migrateDocumentsForFreeUser(user);
    } catch (e) {
      error = e;
      this.loggerService.error({
        context: 'migratePersonalWorkspace',
        stack: e.stack,
        userId,
        error: e,
      });
    } finally {
      const { destinationOrg, ...result } = data || {};
      this.redisService.appendUserPricingMigration({
        userId,
        orgId: destinationOrg?._id && new Types.ObjectId(destinationOrg._id).toHexString(),
        result,
        error,
      });
    }
  }

  async logPricingUserMigration(): Promise<{ totalUser: number, keyFile: string, totalError: number }> {
    const users = await this.redisService.getAllHsetData(RedisConstants.PRICING_USER_MIGRATION);
    if (!users.length) {
      return {
        totalUser: 0,
        totalError: 0,
        keyFile: null,
      };
    }
    let totalError = 0;
    const rows: Row[] = users.map(({ key, value }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const data: IPricingUserMigration = JSON.parse(value);
      if (data.error) {
        ++totalError;
      }
      return [
        key,
        data.orgId,
        data.totalDocument,
        data.totalFolder,
        data.totalOrg,
        data.error,
        data.migratedAt,
      ];
    });
    const options: FormatterOptionsArgs<Row, Row> = {
      headers: ['userId', 'orgId', 'totalDocument', 'totalFolder', 'totalOrg', 'error', 'migratedAt'],
    };

    const stream = new PassThrough();
    write(rows, options)
      .pipe(stream)
      .on('end', () => {
        stream.end();
      });

    const s3Folder = 'user-pricing-migration';
    const m = moment();
    const date = m.format('YYYY-MM-DD');
    const time = m.format('HH:mm');
    const env = this.environmentService.getByKey(EnvConstants.ENV);
    const fileName = `${env}_${date}_${time}_${rows.length}_${totalError}.csv`;
    const logKey = `${s3Folder}/${fileName}`;

    const isProduction = this.environmentService.getByKey(EnvConstants.ENV) === 'production';
    await this.awsService.putFileToTemporaryBucket(logKey, stream, `production=${isProduction}`);

    this.redisService.deleteRedisByKey(RedisConstants.PRICING_USER_MIGRATION);

    return {
      totalUser: rows.length,
      totalError,
      keyFile: logKey,
    };
  }

  getLoginService({ userLoginService, defaultLoginService }:
    { userLoginService: LoginService, defaultLoginService: LoginService }): LoginService {
    return (userLoginService && userLoginService !== LoginService.EMAIL_PASSWORD)
      ? userLoginService
      : defaultLoginService;
  }

  async handleNonLuminUserInvitation(
    user: User,
    invitationToken: string,
    trackingContext?: { anonymousUserId?: string; userAgent?: string },
  ): Promise<void> {
    try {
      const { email, metadata, type }: { email: string; type: string; metadata: { orgId: string } } = this.jwtService.verify(invitationToken);
      const { orgId } = metadata;
      switch (type) {
        case UserInvitationTokenType.CIRCLE_INVITATION: {
          const validInvitationToken = await this.redisService.getValidInviteToken(email, orgId);
          if (validInvitationToken === invitationToken) {
            await this.organizationService.addUserToOrgsWithInvitation(user, orgId, trackingContext);
          }
          break;
        }
        case UserInvitationTokenType.SHARE_DOCUMENT:
          if (email === user.email) {
            await this.organizationService.createFirstOrgOnFreeUser(user);
          }
          break;
        default:
          break;
      }
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        const expiredTokenData = this.jwtService.decode(invitationToken);
        if (!(expiredTokenData.type === UserInvitationTokenType.CIRCLE_INVITATION && expiredTokenData.metadata.isSameUnpopularDomain)) {
          throw e;
        }
      }
    }
  }

  async handleInvitationsAfterFirstLogin(user: User): Promise<void> {
    if (user.timezoneOffset) {
      return;
    }
    /**
     * First login
     */
    const email = user.email.toLowerCase();
    /**
     * Create shared document after first login
     */
    await this.documentService.createNonLuminUserDocumentPermission({
      user,
      orgIds: [],
      teamIds: [],
    });
    await this.createOrgInvitationNotiAfterLogin(email);
  }

  async createOrgInvitationNotiAfterLogin(email: string): Promise<void> {
    const joinOrganizationInvitations = await this.organizationService.getInviteOrgList({
      actor: email, type: AccessTypeOrganization.INVITE_ORGANIZATION,
    });
    if (!isEmpty(joinOrganizationInvitations)) {
      await this.authService.sendNotificationFirstLoginUser(joinOrganizationInvitations);
    }
  }

  async addUserToBeDeleteToRedis(): Promise<void> {
    const userToBeDeleted = await this.userModel.find({ deletedAt: { $type: 'date' } }).lean().limit(5000).exec();
    const currentDate = moment(new Date());
    const userToDeleteFormated = userToBeDeleted
      .filter(
        (user) => currentDate.diff(moment(user.deletedAt), 'days') > 4
          && (!user.lastAccess
            || moment(user.lastAccess).diff(moment(user.deletedAt), 'days') < 3),
      )
      .map((user) => ({
        userId: user._id,
        date: new Date(user.deletedAt).getTime(),
      }));
    this.redisService.setRedisData('AccountToDeleteV2', JSON.stringify(userToDeleteFormated));
  }

  async createDefaultOrgOnFreeUser(user: User): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const organization = await this.organizationService.findOneOrganization({ ownerId: user._id });
    const freeUser = user.payment.type === PaymentPlanEnums.FREE;
    if (!organization && freeUser) {
      await this.organizationService.createCustomOrganization(user);
    }
  }

  async updateUserDataAfterAccessingApp(
    user: User,
    payload : { timezoneOffset: number; hasSyncedEmailToBraze?: boolean },
  ): Promise<User> {
    const { timezoneOffset, hasSyncedEmailToBraze } = payload;
    return this.updateUserPropertyById(user._id, {
      lastAccess: new Date(),
      'metadata.beRemovedFromDeletedOrg': false,
      ...timezoneOffset && { timezoneOffset },
      ...(typeof hasSyncedEmailToBraze === 'boolean') && { 'metadata.hasSyncedEmailToBraze': hasSyncedEmailToBraze },
      // First login
      // eslint-disable-next-line no-restricted-globals
      ...isNaN(user.timezoneOffset) && { version: USER_VERSION },
    }, false, { lean: false });
  }

  emitReactivateAccount(user: User): void {
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${user._id}`)
      .emit(SOCKET_MESSAGE.REACTIVE_USER_ACCOUNT, { user: { ...user, deletedAt: null } });
  }

  emitUserEmailChanged(user: User, newEmail: string): void {
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${user._id}`)
      .emit(SOCKET_MESSAGE.USER_EMAIL_CHANGED, { newEmail });
  }

  async getUserData(userId: string): Promise<{ user?: User, error?: GraphErrorException }> {
    const user = await this.findUserById(userId, null, true);

    if (!user) {
      return { error: GraphErrorException.NotFound('User not found') };
    }

    if (!user.loginService) {
      delete user.loginService;
    }
    if (this.isUserUsingPassword(user)) {
      user.loginService = LoginService.EMAIL_PASSWORD;
    }
    return {
      user,
    };
  }

  async updateRatingModalStatus(userId: string, modalStatusObject: MobileFeedbackModalStatusInput): Promise<UserRating> {
    const { status, isRateLater } = modalStatusObject;
    const currentDate = moment(new Date());
    const nextTimeRateModal = this.nextTimeRateModalStatus.split(' ');
    const nextModalAppearanceTime = currentDate.add(nextTimeRateModal[0], nextTimeRateModal[1] as moment.unitOfTime.DurationConstructor).unix();

    const updatedUser = await this.updateUserPropertyById(userId, {
      'metadata.rating.mobileFeedbackModalStatus': {
        status,
        ...(isRateLater && { nextModalAppearanceTime }),
      },
    });
    return updatedUser.metadata.rating;
  }

  verifyFeedbackFile(files: any[]): { error: GraphErrorException, valid: boolean } {
    const supportedMimeType = ['image/png', 'image/jpg', 'image/jpeg', 'image/heic', 'video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (files.length > 5) {
      return {
        error: HttpErrorException.BadRequest('Cannot upload more than 5 files'),
        valid: false,
      };
    }
    if (!files.every((file) => supportedMimeType.includes(file.mimetype as string))) {
      return {
        error: HttpErrorException.BadRequest('Cannot support that mimetype'),
        valid: false,
      };
    }
    // Prevent upload file size > 50MB
    if (files.some((file) => file.size > 50 * 1024 * 1024)) {
      return {
        error: HttpErrorException.BadRequest('Cannot upload file greater than 50MB'),
        valid: false,
      };
    }
    return { error: null, valid: true };
  }

  async getUserPaymentInfo(userId: string): Promise<GetUserPaymentInfoPayload> {
    const paymentInfo = {
      hasUpgradedToPremiumPlan: false,
      hasTrialPlan: false,
    };
    const [user, ownedOrg] = await Promise.all([
      this.findUserById(userId, { payment: 1 }),
      this.organizationService.findOrganization(
        { ownerId: userId, 'payment.customerRemoteId': { $exists: true } },
        { payment: 1 },
      ),
    ]);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    if (user.payment.customerRemoteId || ownedOrg.some(({ payment }) => payment.status !== PaymentStatusEnums.TRIALING)) {
      paymentInfo.hasUpgradedToPremiumPlan = true;
    }
    if (ownedOrg.some(({ payment }) => payment.status === PaymentStatusEnums.TRIALING)) {
      paymentInfo.hasTrialPlan = true;
    }

    return paymentInfo;
  }

  compareEmails(firstEmail?: string, secondEmail?: string): boolean {
    if (!firstEmail || !secondEmail) {
      return false;
    }
    return firstEmail.toLowerCase() === secondEmail.toLowerCase();
  }

  isUserUsingPassword(user: User): boolean {
    return Boolean(user.loginService === LoginService.EMAIL_PASSWORD || (user.password && !user.loginService));
  }

  async getStaticToolUploadWorkspace(user: User): Promise<IGetStaticToolUploadWorkspacePayload> {
    const { _id: userId, payment: { type: userPaymentType } } = user;
    const isPremiumUser = userPaymentType !== PaymentPlanEnums.FREE;

    const responseInfo: IGetStaticToolUploadWorkspacePayload = {
      isPremiumUser,
    };

    if (isPremiumUser) {
      return responseInfo;
    }

    const orgId = await this.documentService.getOrgIdToSaveExternalUploadDocument(user);
    const [
      { payment: { type: orgPlan, customerRemoteId } },
      { role },
    ] = await Promise.all([
      this.organizationService.getOrgById(orgId, { payment: 1 }),
      this.organizationService.getMembershipByOrgAndUser(orgId, userId, { role: 1 }),
    ]);

    responseInfo.lastAccessOrganization = {
      _id: orgId,
      role: role as OrganizationRoleEnums,
      payment: {
        plan: orgPlan as OrganizationPlans,
        hasUpgradedToPremium: Boolean(customerRemoteId),
      },
    };

    return responseInfo;
  }

  async trackPlanAttributes(userId: string, orgsWithRole?: IOrganizationWithRole[]): Promise<void> {
    let orgsWithMemberRole = orgsWithRole;
    if (!orgsWithRole) {
      orgsWithMemberRole = await this.organizationService.getOrgsOfUserWithRole(userId);
    }
    const highestOrgPlan = await this.paymentService.getHighestCirclePlan(orgsWithMemberRole, userId);
    const payload = {
      externalId: userId,
      highestPlan: {
        highestLuminPlan: highestOrgPlan.type,
        highestLuminPlanStatus: highestOrgPlan.status,
        highestLuminOrgRole: highestOrgPlan.role,
      },
      targetId: highestOrgPlan.targetId,
    };
    await this.brazeService.trackHighestPlanAtributes(payload);
  }

  async removeDeletedUser({ userId, fromProvisioning }: { userId: string; fromProvisioning?: boolean }): Promise<void> {
    this.publishDeleteAccount({ userId, fromProvisioning });
    await this.organizationService.deleteDefaultOrg(userId);

    const [deletedUser] = await Promise.all([
      this.finishDeleteAccount(userId),
      this.redisService.deleteRedisByKey(`OM-${userId}`),
      this.redisService.deleteRedisByKey(`token-${userId}`),
    ]);
    const identityId = deletedUser?.identityId;
    this.loggerService.info({
      context: 'info:removeDeletedUser',
      extraInfo: {
        deletedUserId: deletedUser?._id?.toHexString(),
        identityId: deletedUser?.identityId,
      },
    });
    if (identityId) {
      await this.authService.deleteIdentity(identityId);
    } else if (deletedUser?.email) {
      await this.authService.deleteIdentityByEmail(deletedUser.email);
    }
    this.brazeService.deleteAudiences([userId]);

    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${userId}`)
      .emit(SOCKET_MESSAGE.COMPLETED_DELETE_USER, { fromProvisioning });

    this.loggerService.info({
      context: 'RemoveDeletedUsers',
      extraInfo: {
        userId,
      },
    });
  }

  async changeIndividualLoginService(input: ChangeIndividualLoginServiceInput[]): Promise<void> {
    try {
      const emailToLoginService = new Map(input.map(({ email, loginService }) => [email, loginService]));
      const emailsList = [...emailToLoginService.keys()];
      const users = await this.findUserByEmails(emailsList);
      const result = await Promise.all(
        users
          .filter((user) => emailToLoginService.has(user.email))
          .map((user) => this.changeUserLoginService(
            user,
            emailToLoginService.get(user.email),
          )),
      );
      const [success, failed] = partition(result, ({ userUpdated, identityDeleted }) => userUpdated && identityDeleted);
      this.loggerService.info({
        context: this.changeIndividualLoginService.name,
        extraInfo: {
          totalEmailInput: emailsList.length,
          totalUserFound: users.length,
          successUpdates: success.length,
          failedIds: failed,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.changeIndividualLoginService.name,
        error,
      });
    }
  }

  async changeLoginServiceOfUsersWithDomain(input: ChangeDomainLoginServiceInput): Promise<void> {
    const { name: domain, loginService } = input;
    let callbackCounter = 0;
    const batchSize = 10;
    const maxCallback = 1000;
    const context = this.changeLoginServiceOfUsersWithDomain.name;

    const changeLoginServiceCallback = async () => {
      try {
        const users = await this.userModel
          .find({ emailDomain: domain, loginService: { $ne: loginService } })
          .limit(batchSize)
          .lean()
          .exec();

        const result = await this.changeManyUserLoginService({
          users: users.map((user) => ({ ...user, _id: user._id.toHexString() })),
          loginService,
          context,
        });
        callbackCounter++;

        if (result.length && callbackCounter < maxCallback) {
          setTimeout(changeLoginServiceCallback, 1000);
        }
      } catch (error) {
        this.loggerService.error({
          context,
          error,
          extraInfo: {
            domain,
            loginService,
            callbackCounter,
          },
        });
      }
    };

    await changeLoginServiceCallback();
  }

  async changeUserLoginService(user: User, loginService: LoginService): Promise<ChangeUserLoginServiceResult> {
    const deleted = await this.authService.deleteUserIdentity(user);
    const updatePayload: { loginService: LoginService, password?: string, recentPasswords?: string[] } = { loginService };
    if (loginService === LoginService.EMAIL_PASSWORD) {
      // Random password, which have no meaning and cannot be used
      // But we need this field for our authentication flow
      updatePayload.password = await Utils.hashPassword(uuid());
      updatePayload.recentPasswords = [];
    }
    const { modifiedCount } = await this.userModel.updateOne({ _id: user._id }, { $set: updatePayload, $unset: { identityId: 1 } });
    return { userId: user._id, identityDeleted: deleted, userUpdated: Boolean(modifiedCount) };
  }

  async changeManyUserLoginService(input: { users: User[], loginService: LoginService, context: string }): Promise<ChangeUserLoginServiceResult[]> {
    const { users, loginService, context } = input;
    const result = await Promise.all(
      users.map((user) => this.changeUserLoginService(user, loginService)),
    );

    const [success, failed] = partition(result, ({ userUpdated, identityDeleted }) => userUpdated && identityDeleted);

    try {
      const batchId = uuid();
      const batchInfo = {
        batchId,
        loginService,
        usersToUpdates: users.length,
        successUpdates: success.length,
        failedIds: failed,
      };

      this.awsService.logDataMigrationBatch({
        migrationName: context,
        batchId,
        batchInfo,
        batchError: failed,
      });
    } catch (error) {
      this.loggerService.error({
        context,
        error,
      });
    }

    return result;
  }

  async verifyUserFromExistingSession(user: User): Promise<User> {
    if (!user) {
      return null;
    }
    if (user.isVerified) {
      return user;
    }
    return this.updateUserPropertyById(user._id, { isVerified: true }, true);
  }

  async changeGroupLoginService(input: ChangeGroupLoginServiceInput): Promise<void> {
    const { loginService } = input;
    let dataByString = '';
    const stream = (await this.awsService.getFileFromTemporaryBucket(input.csvPath)).Body as Readable;
    stream.on('data', (buf: Buffer) => {
      dataByString = dataByString.concat(buf.toString());
    });

    stream.on('close', () => {
      const userEmails = dataByString.split('\n');
      const emailChunks = chunk(userEmails, 10);
      const changeGroupLoginServiceByChunk = async (index: number) => {
        const users = await this.findUserByEmails(emailChunks[index]);

        await this.changeManyUserLoginService({
          users,
          loginService,
          context: 'change-group-login-service',
        });

        if (index < emailChunks.length - 1) {
          setTimeout(() => changeGroupLoginServiceByChunk(index + 1), 1000);
        }
      };
      changeGroupLoginServiceByChunk(0);
    });
  }

  async validateGetGoogleContact(orgId: string, userId: string): Promise<{ error?: GraphErrorException }> {
    const org = await this.organizationService.getOrgById(orgId);
    if (!org) {
      return { error: GraphErrorException.NotFound('Organization not found') };
    }
    const membership = await this.organizationService.getMembershipByOrgAndUser(orgId, userId);
    if (!membership) {
      return { error: GraphErrorException.Forbidden('User has not permission in this organization') };
    }
    return {};
  }

  async firstSignInFromSignUpInvitation(
    user: User,
    invitationToken?: string,
    trackingContext?: { anonymousUserId?: string; userAgent?: string },
  ): Promise<void> {
    if (invitationToken) {
      // Third party sign in after an signup invitation have invitation token
      await this.handleNonLuminUserInvitation(user, invitationToken, trackingContext);
      return;
    }
    if (user.loginService !== LoginService.EMAIL_PASSWORD) {
      return;
    }
    const signUpInvitationToken = await this.redisService.getRedisValueWithKey(`${RedisConstants.USER_SIGN_UP_BY_INVITATION}${user.email}`);
    if (!signUpInvitationToken) {
      return;
    }
    this.redisService.deleteRedisByKey(`${RedisConstants.USER_SIGN_UP_BY_INVITATION}${user.email}`);
    await this.handleNonLuminUserInvitation(user, signUpInvitationToken, trackingContext);
  }

  async canExploredFeature({ userId, featureKey }: {
    userId: string,
    featureKey: ExploredFeatureKeys
  }) {
    const exploredFeatureConfig = EXPLORED_FEATURE_MAPPING[featureKey];
    if (!exploredFeatureConfig) {
      return false;
    }

    const userInfo = await this.findUserById(userId, { metadata: 1 });
    if (!userInfo) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }
    return userInfo.metadata?.exploredFeatures?.[exploredFeatureConfig.key] < EXPLORED_FEATURE_MAPPING[featureKey].maxUsage;
  }

  async updateExploredFeature({
    userId,
    exploredFeatureKey,
  }: {
    userId: string,
    exploredFeatureKey: ExploredFeatureKeys
  }) {
    const exploredFeatureConfig = EXPLORED_FEATURE_MAPPING[exploredFeatureKey];

    if (!exploredFeatureConfig) {
      throw GraphErrorException.BadRequest('Invalid explored feature key');
    }

    const canExploredFeature = await this.canExploredFeature({ userId, featureKey: exploredFeatureKey });

    if (!canExploredFeature) {
      throw GraphErrorException.BadRequest('Usage limit for this feature has been reached');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          [`metadata.exploredFeatures.${exploredFeatureConfig.key}`]: 1,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw GraphErrorException.InternalServerError('Failed to update explored feature usage');
    }

    return updatedUser;
  }

  async migrateUsersPassword(): Promise<void> {
    let callbackCounter = 0;
    const batchSize = 1000;
    const maxCallback = 250;
    const context = this.migrateUsersPassword.name;

    const migrateUsersPasswordCallback = async () => {
      try {
        const usersToUpdate = await this.userModel
          .find({ loginService: LoginService.EMAIL_PASSWORD, identityId: { $exists: true }, password: { $exists: true } })
          .limit(batchSize)
          .select({ _id: 1 })
          .lean()
          .exec();

        const bulkWriteList: AnyBulkWriteOperation<User>[] = usersToUpdate.map((user) => ({
          updateOne: {
            filter: { _id: user._id.toHexString() },
            update: { $unset: { password: 1, recentPasswords: 1 } },
          },
        }));

        const result = await this.userModel.bulkWrite(bulkWriteList);

        this.loggerService.info({
          context,
          extraInfo: {
            callbackCounter,
            result,
          },
        });

        callbackCounter++;
        if (!usersToUpdate.length || callbackCounter >= maxCallback) {
          return;
        }

        setTimeout(migrateUsersPasswordCallback, 1000);
      } catch (error) {
        this.loggerService.error({
          context,
          error,
          extraInfo: {
            callbackCounter,
          },
        });
      }
    };

    await migrateUsersPasswordCallback();
  }

  async handleSyncOidcAvatar(identityId: string, loginService: LoginService): Promise<{ avatarSize?: number, status: 'success' | 'failed' }> {
    let hasError = false;
    let avatarData: OidcAvatarData | null = null;
    try {
      // 1. get OIDC access_token
      const { data: identityData } = await this.kratosService.kratosAdmin.getIdentity({ id: identityId, includeCredential: ['oidc'] });
      const currentIdentityCredentialOidc = this.kratosService.getCurrentIdentityCredentialOidc(identityData, loginService);
      const oidcAccessToken = currentIdentityCredentialOidc?.initial_access_token;
      if (!oidcAccessToken) {
        throw new Error('Missing OIDC access token');
      }

      if (loginService === LoginService.GOOGLE) {
        const { result, executionTimeMs } = await Utils.measureExecutionTime({
          fn: async () => SyncAvatar.fetchGoogleAvatar(oidcAccessToken),
        });
        avatarData = result;
        this.loggerService.info({
          context: SyncAvatar.fetchGoogleAvatar.name,
          extraInfo: {
            identityId,
            executionTimeMs,
            avatarSize: result?.content?.byteLength,
          },
        });
      }
      if (!avatarData) {
        return { status: 'success' };
      }
      const { content: avatarContent, mimeType: avatarMimeType } = avatarData;
      if (avatarContent.byteLength > MAXIMUM_AVATAR_SIZE) {
        throw new Error('Avatar size is too large');
      }
      if (!ALLOW_AVATAR_MIMETYPE.some((mime) => mime === avatarMimeType)) {
        throw new Error('Invalid type');
      }

      // 2. upload avatar
      const avatarRemotePath = await this.awsService.uploadUserAvatarWithBuffer(avatarContent, avatarMimeType);
      if (identityData.traits.avatarRemoteId) {
        await this.awsService.removeFileFromBucket(identityData.traits.avatarRemoteId as string, EnvConstants.S3_PROFILES_BUCKET)
          .catch((err) => this.loggerService.error({
            context: this.handleSyncOidcAvatar.name,
            error: err,
            extraInfo: { identityId },
          }));
      }

      // 3. update `avatarRemoteId` property in identity and user
      await Promise.all([
        this.kratosService.kratosAdmin.patchIdentity({
          id: identityId,
          jsonPatch: [
            {
              op: 'replace',
              path: '/traits/avatarRemoteId',
              value: avatarRemotePath,
            },
          ],
        }),
        this.updateUserByIdentityId(identityId, { avatarRemoteId: avatarRemotePath }),
      ]);
      this.luminContractService.syncUpAccountSetting({ identityId, type: 'uploadAvatar' });
    } catch (error) {
      hasError = true;
      this.loggerService.error({
        context: this.handleSyncOidcAvatar.name,
        stack: error?.stack,
        message: error?.message,
        ...this.loggerService.getCommonErrorAttributes(error),
        extraInfo: { identityId },
      });
    } finally {
      await this.updateUserByIdentityId(identityId, { 'metadata.hasSyncedOidcAvatar': true });
    }

    return { avatarSize: avatarData?.content?.byteLength, status: hasError ? 'failed' : 'success' };
  }

  trackAvatarSyncedEvent(eventAttributes: SyncAvatarEventAttributes, eventMetrics: SyncAvatarEventMetrics): void {
    this.userTrackingService.trackAvatarSyncedEvent(eventAttributes, eventMetrics);
  }

  addSyncOidcAvatarTask(email: string): void {
    try {
      this.rabbitMQService.publish(EXCHANGE_KEYS.LUMIN_WEB_USER, ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DEFAULT, {
        email,
      });
    } catch (error) {
      this.loggerService.error({
        context: 'publish sync oidc avatar task to rabbitmq',
        error,
      });
    }
  }

  checkOneDriveAddInsWhitelisted(email: string) {
    const lowerCaseEmail = email.toLowerCase();
    const emailDomain = Utils.getEmailDomain(lowerCaseEmail);

    const whitelistedDomainsValue = this.environmentService.getByKey(
      EnvConstants.ONE_DRIVE_ADD_INS_WHITELISTED_DOMAINS,
    );
    const whitelistedEmailsByDomainValue = this.environmentService.getByKey(
      EnvConstants.ONE_DRIVE_ADD_INS_WHITELISTED_EMAILS_BY_DOMAIN,
    );

    const whitelistedDomains: string[] = whitelistedDomainsValue
      ? JSON.parse(whitelistedDomainsValue) || []
      : [];
    const whitelistedEmailsByDomain: Record<string, string[]> = whitelistedEmailsByDomainValue
      ? JSON.parse(whitelistedEmailsByDomainValue) || {}
      : {};

    const whitelistedEmails = whitelistedEmailsByDomain[emailDomain] || [];

    if (!whitelistedEmails.length) {
      return whitelistedDomains.includes(emailDomain);
    }

    return whitelistedEmails.includes(lowerCaseEmail);
  }

  checkOneDriveFilePickerWhitelisted(email: string) {
    const lowerCaseEmail = email.toLowerCase();
    const emailDomain = Utils.getEmailDomain(lowerCaseEmail);
    const whitelistedDomainsValue = this.environmentService.getByKey(
      EnvConstants.ONE_DRIVE_FILE_PICKER_WHITELISTED_DOMAINS,
    );
    const whitelistedDomains: string[] = whitelistedDomainsValue
      ? JSON.parse(whitelistedDomainsValue) || []
      : [];
    return whitelistedDomains.includes(emailDomain);
  }

  async verifyUserPermissionOnTarget({ userId, targetId, targetType }: {targetId: string; userId: string; targetType: string}) {
    switch (targetType) {
      case EntitySearchType.ORGANIZATION:
      case EntitySearchType.ORGANIZATION_TEAM_CREATION:
      case EntitySearchType.ORGANIZATION_GRANT_BILLING: {
        const member = await this.organizationService.getMembershipByOrgAndUser(targetId, userId);
        if (!member) {
          throw GraphErrorException.Forbidden("You don't have permission on this organization");
        }
        break;
      }
      case EntitySearchType.ORGANIZATION_TEAM: {
        const member = await this.teamService.getOneMembershipOfUser(userId, { teamId: targetId });
        if (!member) {
          throw GraphErrorException.Forbidden("You don't have permission on this team");
        }
        break;
      }
      default: break;
    }
  }

  async getTeamMembershipOfUserByOrg(userId: string, orgId: string): Promise<string[]> {
    const teamsBelongToOrg = await this.organizationTeamService.getOrgTeams(orgId);
    const teamMembership = await this.organizationTeamService.getOrgTeamMember({
      teamId: { $in: teamsBelongToOrg.map((team) => team._id) },
      userId,
    });
    return teamMembership.map((membership) => membership.teamId);
  }

  validateUserMetadataUpdate(user: User, key: string, value: any): void {
    if (!USER_UPDATABLE_METADATA.includes(key as UserMetadataEnums)) {
      throw GraphErrorException.Forbidden(
        'You do not have permission to update this preference setting',
      );
    }
    if (NON_REVERSIBLE_METADATA.includes(key as UserMetadataEnums)) {
      if (typeof value !== 'boolean') {
        throw GraphErrorException.BadRequest('Metadata value must be a boolean');
      }

      const currentValue = user.metadata?.[key];
      if (currentValue === true && value === false) {
        throw GraphErrorException.BadRequest('Cannot revert non-reversible metadata value');
      }
    }
  }

  checkTermsOfUseVersionChanged(user: User): boolean {
    return user.metadata.acceptedTermsOfUseVersion !== this.environmentService.getByKey(EnvConstants.TERMS_OF_USE_VERSION);
  }

  async acceptNewTermsOfUse(userId: string, documentIndexingInput?: AcceptNewTermsOfUseInput): Promise<User> {
    const updateFields = {
      'metadata.acceptedTermsOfUseVersion': this.environmentService.getByKey(EnvConstants.TERMS_OF_USE_VERSION),
    };
    const updatedUser = await this.updateUserPropertyById(userId, updateFields);
    if (documentIndexingInput) {
      this.triggerDocumentIndexingOnTermsAcceptance({ user: updatedUser, input: documentIndexingInput }).catch((error) => {
        this.loggerService.error({
          context: 'Trigger document indexing on terms acceptance',
          error: JSON.stringify(error),
          extraInfo: {
            userId,
          },
        });
      });
    }
    return updatedUser;
  }

  async triggerDocumentIndexingOnTermsAcceptance({ user, input }: { user: User, input: AcceptNewTermsOfUseInput }): Promise<void> {
    const { orgId, teamId } = input;

    const [organization, orgMembershipFound] = await Promise.all([
      this.organizationService.getOrgById(orgId),
      this.organizationService.getMembershipByOrgAndUser(orgId, user._id, { _id: 1 }),
    ]);

    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }
    if (!orgMembershipFound) {
      throw GraphErrorException.NotFound('You are not a member of this organization');
    }

    let team: ITeam | null = null;
    if (teamId) {
      const [teamResult, teamMembershipFound] = await Promise.all([
        this.organizationTeamService.getOrgTeamById(teamId),
        this.organizationTeamService.getOrgTeamMembershipOfUser(user._id, teamId, { _id: 1 }),
      ]);

      if (!teamResult) {
        throw GraphErrorException.NotFound('Team not found');
      }
      if (!teamMembershipFound) {
        throw GraphErrorException.NotFound('You are not a member of this team');
      }

      team = teamResult;
    }

    if (team) {
      this.organizationService.prepareTeamDocumentIndexing({ user, team, organization }).catch((error) => {
        this.loggerService.error({
          context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
          message: 'Error preparing team document indexing',
          extraInfo: {
            teamId: team._id,
            organizationId: organization._id,
            userId: user._id,
          },
          error,
        });
      });
    } else {
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
    }
  }

  notifyXeroApp({
    type,
    userId,
    workspaceId,
    data,
  }: {
    type: string,
    userId: string,
    workspaceId: string,
    data: Record<string, unknown>,
  }): void {
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${userId}`)
      .emit(SOCKET_MESSAGE.NOTIFY_XERO_APP, {
        type,
        user_id: userId,
        workspace_id: workspaceId,
        data,
      });
  }
}
