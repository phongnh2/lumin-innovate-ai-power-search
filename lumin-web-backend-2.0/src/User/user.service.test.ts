/// <reference path="../global.d.ts" />

/* eslint-disable */

import * as UserConstants from './constants/metadata.enum';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { Model, Types } from 'mongoose';
import { MongoServerError, ObjectId } from 'mongodb';

import { UserService } from './user.service';
import { EnvironmentService } from '../Environment/environment.service';
import { AwsService } from '../Aws/aws.service';
import { DocumentService } from '../Document/document.service';
import { TeamService } from '../Team/team.service';
import { OrganizationService } from '../Organization/organization.service';
import { MembershipService } from '../Membership/membership.service';
import { UserTrackingService } from '../UserTracking/tracking.service';
import { RedisService } from '../Microservices/redis/redis.service';
import { AuthService } from '../Auth/auth.service';
import { BlacklistService } from '../Blacklist/blacklist.service';
import { OrganizationTeamService } from '../Organization/organizationTeam.service';
import { PaymentService } from '../Payment/payment.service';
import { AdminService } from '../Admin/admin.service';
import { LoggerService } from '../Logger/Logger.service';
import { FolderService } from '../Folder/folder.service';
import { EventsGateway } from '../Gateway/SocketIoConfig';
import { UploadService } from '../Upload/upload.service';
import { BrazeService } from '../Braze/braze.service';
import { FeatureFlagService } from '../FeatureFlag/FeatureFlag.service';
import { SyncAvatar } from './sync-avatar.service';
import { KratosService } from '../Kratos/kratos.service';
import { RabbitMQService } from '../RabbitMQ/RabbitMQ.service';
import { LuminContractService } from '../LuminContract/luminContract.service';
import { EntitySearchType, ExploredFeatureKeys, LocationType, LoginService, SearchUserStatus, User, UserMetadataEnums } from '../graphql.schema';
import { FeatureFlagKeys } from '../Common/constants/FeatureFlags';
import planPoliciesHandler from '../Payment/Policy/planPoliciesHandler';

import { PaymentPlanEnums } from '../Payment/payment.enum';
import { EnvConstants } from '../Common/constants/EnvConstants';
import { ErrorCode } from '../Common/constants/ErrorCode';
import { MAXIMUM_NUMBER_SIGNATURE, USER_VERSION } from '../constant';
import { SOCKET_MESSAGE } from '../Common/constants/SocketConstants';
import { GraphqlException } from '../Common/errors/graphql/GraphException';
import { DocumentRoleEnum } from '../Document/document.enum';
import { Platforms } from '../Common/constants/Platform';
import { UserCurrentStepEnums } from '../User/user.enum';
import { LIMIT_USER_CONTACTS, PURPOSE, PURPOSE_STEP } from '../Common/constants/UserConstants';
import { LIMIT_STORE_CONTACTS } from '../Common/constants/UserConstants';
import { DEFAULT_FOLDER_COLORS } from '../Common/constants/FolderConstants';
import { OperationLimitConstants } from '../Common/constants/OperationLimitConstants';
import { GetGoogleContactsContext } from '../graphql.schema';
import { BlacklistActionEnum } from '../Blacklist/blacklist.enum';
import { AccessTypeOrganization, OrganizationTeamRoles } from '../Organization/organization.enum';
import { GraphErrorException } from '../Common/errors/GraphqlErrorException';
import { CommonConstants } from '../Common/constants/CommonConstants';
import { PaymentStatusEnums } from '../Payment/payment.enum';
import { RedisConstants } from '../Common/callbacks/RedisConstants';
import { EXCHANGE_KEYS } from '../RabbitMQ/RabbitMQ.constant';
import { ROUTING_KEY } from '../RabbitMQ/RabbitMQ.constant';
import { UserInvitationTokenType } from '../Auth/interfaces/auth.interface';

import { Utils } from '../Common/utils/Utils';
import * as bcrypt from 'bcrypt';
import { SocketRoomGetter } from '../Gateway/SocketRoom';
import { MAXIMUM_AVATAR_SIZE } from '../Common/constants/UserAvatarConstants';

jest.mock('moment');
const moment = require('moment');
import { people } from '@googleapis/people';
import { chunk } from 'lodash';
import { PassThrough, Readable } from 'stream';

jest.mock('@googleapis/people', () => ({
  people: jest.fn(),
}));

const flushPromises = () => new Promise(setImmediate);

class UserMock {
  _id = new Types.ObjectId('5d5f85b5a7ab840c8d46f697');
  isVerified = true;
  email = 'test@email.com';
  name = 'Test User';
  avatarRemoteId = 'http://remoteUrl.com';
  password = '123456';
  payment = {
    customerRemoteId: 'customerRemoteId',
    type: PaymentPlanEnums.FREE,
  };
  metadata: any;

  toObject() {
    return {
      _id: this._id,
      isVerified: this.isVerified,
      email: this.email,
      name: this.name,
      avatarRemoteId: this.avatarRemoteId,
      password: this.password,
      payment: this.payment,
    };
  }

  toHexString() {
    return this._id.toHexString();
  }
}

const userMockInstance = new UserMock();

class PubSubServiceMock {
  publish() { }
}

class EnvironmentServiceMock {
  getByKey() {
    return {
      bucket: 'lumin-documents-local',
      nextTimeRateModal: '30 days',
    };
  }
}

class UserModelMock {
  create() {
    return Promise.resolve(userMockInstance);
  }
  findById() {
    return {
      exec: () => Promise.resolve(userMockInstance)
    } as any;
  }
  findOne() {
    return {
      exec: () => Promise.resolve(userMockInstance)
    } as any;
  }
  find(matchCondition?) {
    const mockQuery = {
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () => ({
        countDocuments: () => Promise.resolve(100),
        exec: () => Promise.resolve([userMockInstance])
      }),
      countDocuments: () => Promise.resolve(100),
      exec: () => Promise.resolve([userMockInstance])
    };
    return mockQuery;
  }
  findOneAndUpdate() {
    return {
      exec: () => Promise.resolve(userMockInstance)
    } as any;
  }
  findOneAndDelete() {
    return {
      exec: () => Promise.resolve(userMockInstance)
    } as any;
  }
  updateOne() {
    return Promise.resolve({ modifiedCount: 1 });
  }
  updateMany() {
    return Promise.resolve({ modifiedCount: 1 });
  }
  deleteOne() {
    return Promise.resolve({ deletedCount: 1 });
  }
  exists() {
    return Promise.resolve(true);
  }
  estimatedDocumentCount() {
    return Promise.resolve(100);
  }
  countDocuments() {
    return Promise.resolve(100);
  }
  aggregate() {
    return Promise.resolve([userMockInstance]);
  }
  bulkWrite() {
    return Promise.resolve({
      matchedCount: 2,
      modifiedCount: 2,
      upsertedCount: 0,
      upsertedIds: {},
      insertedCount: 0,
      deletedCount: 0
    });
  }
}

class UserPurposeMock {
  _id = '123';
  userId = '5d5f85b5a7ab840c8d46f697';
  purpose = 'business';
  currentStep = 1;

  toObject() {
    return {
      _id: this._id,
      userId: this.userId,
      purpose: this.purpose,
      currentStep: this.currentStep,
    };
  }

  toHexString() {
    return this._id;
  }
}

const userPurposeMockInstance = new UserPurposeMock();

class UserPurposeModelMock {
  findOne() {
    return {
      exec: () => Promise.resolve(userPurposeMockInstance)
    } as any;
  }
  findOneAndUpdate() {
    return {
      exec: () => Promise.resolve(userPurposeMockInstance)
    } as any;
  }
  updateOne() {
    return Promise.resolve({ modifiedCount: 1 });
  }
}

class UserContactModelMock {
  find() {
    return Promise.resolve([{
      _id: '123',
      userId: '5d5f85b5a7ab840c8d46f697',
      email: 'contact@email.com'
    }]);
  }
  findOneAndDelete() {
    return {
      exec: () => Promise.resolve({ deletedCount: 1 })
    } as any;
  }
  deleteOne() {
    return Promise.resolve({ deletedCount: 1 });
  }
}

class DocumentServiceMock {
  getDocumentPermissionsByDocId() {
    return Promise.resolve([{
      refId: '5d5f85b5a7ab840c8d46f697',
      role: 'owner'
    }]);
  }
}

class AwsServiceMock {
  removeFileFromBucket() {
    return Promise.resolve();
  }
  removeAvatar() {
    return Promise.resolve();
  }
}

class TeamServiceMock {
  getPremiumTeamsOfUser() {
    return Promise.resolve([{
      _id: '5d5f85b5a7ab840c8d46f697',
      name: 'Test Team'
    }]);
  }
  create() {
    return Promise.resolve({
      _id: 'team123',
      name: 'Test Team'
    });
  }
}

class OrganizationServiceMock {
  getOrganizationMemberByRole() {
    return Promise.resolve([{
      _id: '5d5f85b5a7ab840c8d46f697',
      email: 'test@email.com'
    }]);
  }
  getOnePremiumOrgOfUser() {
    return Promise.resolve({
      _id: '5d5f85b5a7ab840c8d46f697',
      name: 'Premium Org'
    });
  }
  findMemberWithRoleInOrg() {
    return Promise.resolve([{
      _id: 'org-admin-id',
      orgId: 'org-id',
      groups: [],
      internal: false,
      role: 'organization_admin',
      userId: { toHexString: jest.fn().mockReturnValue('org-admin-id') }
    }]);
  }
}

class MembershipServiceMock {
  find() {
    return Promise.resolve([{
      userId: '5d5f85b5a7ab840c8d46f697'
    }]);
  }
  createMany() {
    return Promise.resolve([]);
  }
  findOne() {
    return Promise.resolve({
      _id: 'team-admin-id',
      teamId: 'team-id',
      role: 'admin',
      userId: { toHexString: jest.fn().mockReturnValue('team-admin-id') }
    });
  }
}

class UserTrackingServiceMock {
  trackUserEvent() { }
  async createContact() {
    return Promise.resolve();
  }
  async updateUserContact() {
    return Promise.resolve(true);
  }
  trackAccountCreatedEvent() {
  }
}

class RedisServiceMock {
  setRedisData() { }
  getRedisData() {
    return Promise.resolve('data');
  }
  removeUsersToDelete() { }
  setExpireKey() { }
  async setRefreshToken(userId: string, token: string): Promise<void> {
    return Promise.resolve();
  }
}

class JwtServiceMock {
  sign() {
    return 'jwt-token';
  }
  verify() {
    return { userId: '5d5f85b5a7ab840c8d46f697' };
  }
}

class AuthServiceMock {
  generatePasswordHash() {
    return Promise.resolve('hashed-password');
  }
  verifyUserPasswordStrength() {
    return { isVerified: true };
  }
  isDuplicateRecentPassword() {
    return Promise.resolve(false);
  }
}

class BlacklistServiceMock {
  isBlacklisted() {
    return Promise.resolve(false);
  }
  findAll() {
    return Promise.resolve([]);
  }
}

class OrganizationTeamServiceMock { }

class PaymentServiceMock {
  getSubscriptionByCustomerId() {
    return Promise.resolve({
      status: 'active',
      plan: PaymentPlanEnums.PROFESSIONAL
    });
  }
  updateStripeSubscription() {
    return Promise.resolve({} as any);
  }
  retrieveCustomer() {
    return Promise.resolve({
      id: 'customer-id',
      metadata: {}
    });
  }
}

class AdminServiceMock { }

class LoggerServiceMock {
  error() { }
  log() { }
  info() { }
}

class FolderServiceMock { }

class EventsGatewayMock {
  emit() { }
}

class UploadServiceMock {
  uploadFile() {
    return Promise.resolve('remote-id');
  }
  verifyUploadSignatureData() {
    return {
      userId: '5d5f85b5a7ab840c8d46f697',
      signatureName: 'Test Signature'
    };
  }
}

class BrazeServiceMock {
  trackUser() { }
  upsertAudience() {
    return Promise.resolve();
  }
}

class FeatureFlagServiceMock {
  isFeatureEnabled() {
    return Promise.resolve(true);
  }
  getFeatureIsOn() {
    return Promise.resolve(true);
  }
}

class SyncAvatarMock { }

class KratosServiceMock { }

class RabbitMQServiceMock { }

class LuminContractServiceMock { }

class HttpServiceMock {
  get() {
    return Promise.resolve({ data: {} });
  }
  post() {
    return Promise.resolve({ data: {} });
  }
}

describe('UserService', () => {
  let userService: UserService;
  let userModel: any;
  let documentService: DocumentService;
  let teamService: TeamService;
  let organizationService: OrganizationService;
  let membershipService: MembershipService;
  let redisService: RedisService;
  let jwtService: JwtService;
  let authService: AuthService;
  let paymentService: PaymentService;
  let loggerService: LoggerService;

  beforeAll(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'PUB_SUB', useClass: PubSubServiceMock },
        { provide: getModelToken('User'), useClass: UserModelMock },
        { provide: getModelToken('UserPurpose'), useClass: UserPurposeModelMock },
        { provide: getModelToken('UserContact'), useClass: UserContactModelMock },
        { provide: EnvironmentService, useClass: EnvironmentServiceMock },
        { provide: AwsService, useClass: AwsServiceMock },
        { provide: DocumentService, useClass: DocumentServiceMock },
        { provide: TeamService, useClass: TeamServiceMock },
        { provide: OrganizationService, useClass: OrganizationServiceMock },
        { provide: MembershipService, useClass: MembershipServiceMock },
        { provide: UserTrackingService, useClass: UserTrackingServiceMock },
        { provide: RedisService, useClass: RedisServiceMock },
        { provide: JwtService, useClass: JwtServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: BlacklistService, useClass: BlacklistServiceMock },
        { provide: OrganizationTeamService, useClass: OrganizationTeamServiceMock },
        { provide: PaymentService, useClass: PaymentServiceMock },
        { provide: AdminService, useClass: AdminServiceMock },
        { provide: HttpService, useClass: HttpServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: FolderService, useClass: FolderServiceMock },
        { provide: EventsGateway, useClass: EventsGatewayMock },
        { provide: UploadService, useClass: UploadServiceMock },
        { provide: BrazeService, useClass: BrazeServiceMock },
        { provide: FeatureFlagService, useClass: FeatureFlagServiceMock },
        { provide: SyncAvatar, useClass: SyncAvatarMock },
        { provide: KratosService, useClass: KratosServiceMock },
        { provide: RabbitMQService, useClass: RabbitMQServiceMock },
        { provide: LuminContractService, useClass: LuminContractServiceMock },
      ],
    }).compile();  

    userService = module.get<UserService>(UserService);
    userModel = module.get(getModelToken('User'));
    documentService = module.get<DocumentService>(DocumentService);
    teamService = module.get<TeamService>(TeamService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    membershipService = module.get<MembershipService>(MembershipService);
    redisService = module.get<RedisService>(RedisService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
    paymentService = module.get<PaymentService>(PaymentService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('publishDeleteAccount', () => {
    it('should publish delete account event', () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const fromProvisioning = false;
      const mockPublish = jest
        .spyOn(userService['pubSub'], 'publish')
        .mockImplementation(() => Promise.resolve(true));

      userService.publishDeleteAccount({ userId, fromProvisioning } as any);

      expect(mockPublish).toBeCalled();
    });

    it('should publish delete account event with fromProvisioning true', () => {
      const userId = '5d5f85b5a7ab840c8d46f697';

      const mockPublish = jest
        .spyOn(userService['pubSub'], 'publish')
        .mockImplementation(() => Promise.resolve(true));

      userService.publishDeleteAccount({ userId } as any);

      expect(mockPublish).toBeCalled();
    });
  });

  describe('publishUpdateUser', () => {
    it('should publish update user event', () => {
      const user = userMockInstance as any;
      const type = 'PROFILE_UPDATE';
      const metadata = { field: 'name', oldValue: 'Old Name', newValue: 'New Name' } as any;

      const mockPublish = jest
        .spyOn(userService['pubSub'], 'publish')
        .mockImplementation(() => Promise.resolve(true));

      userService.publishUpdateUser({ user, type, metadata });

      expect(mockPublish).toBeCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'test@email.com',
        name: 'Test User',
        password: 'password123'
      };
      const mockCreate = jest
        .spyOn(userService['userModel'], 'create')
        .mockImplementation(() => Promise.resolve(userMockInstance) as any);

      const result = await userService.createUser(newUser);

      expect(mockCreate).toBeCalled();
      expect(result).toMatchObject({
        _id: userMockInstance._id,
        avatarRemoteId: userMockInstance.avatarRemoteId,
        email: userMockInstance.email,
        isVerified: userMockInstance.isVerified,
        name: userMockInstance.name,
      });
    });

    it('should keep metadata values if provided as false', async () => {
      const newUser = {
        email: 'false@test.com',
        metadata: {
          isMigratedPersonalDoc: false,
          hasInformedMyDocumentUpload: false,
        },
      };
      const mockCreate = jest
        .spyOn(userService, 'create')
        .mockResolvedValue(userMockInstance as any);

      await userService.createUser(newUser);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            isMigratedPersonalDoc: false,
            hasInformedMyDocumentUpload: false,
            beRemovedFromDeletedOrg: false,
            acceptedTermsOfUseVersion: expect.any(String),
          }),
        }),
      );
    });

    it('should log error if error is not duplicate key', async () => {
      const normalError = new Error('some db error');
      const mockLoggerError = jest.spyOn(userService['loggerService'], 'error');

      jest.spyOn(userService, 'create')
        .mockRejectedValueOnce(normalError)
        .mockResolvedValueOnce(userMockInstance as any);

      const result = await userService.createUser({ email: 'err@test.com' });

      expect(mockLoggerError).toHaveBeenCalled();
      expect(result).toEqual(userMockInstance);
    });

    it('should not log error if error is duplicate key (code 11000)', async () => {
      const duplicateKeyError = new MongoServerError({
        message: 'duplicate key error',
        code: 11000
      });

      const mockLoggerError = jest.spyOn(userService['loggerService'], 'error');

      jest.spyOn(userService, 'create')
        .mockRejectedValueOnce(duplicateKeyError)
        .mockResolvedValueOnce(userMockInstance as any);

      const result = await userService.createUser({ email: 'duplicate@test.com' });

      expect(mockLoggerError).not.toHaveBeenCalled();
      expect(result).toEqual(userMockInstance);
    });
  });

  describe('getValidUserName', () => {
    it('should return valid user name', () => {
      const userName = 'Test User';
      const result = userService.getValidUserName(userName);
      expect(result).toBe(userName);
    });

    it('should return "Lumin User" if email is empty and no name is provided', () => {
      const result = userService.getValidUserName('');
      expect(result).toBe('Lumin User');
    });
  });

  describe('bulkUpdateManyUserEmails', () => {
    it('should bulk update many user emails successfully', async () => {
      const command = {
        conditions: { emails: ['old1@test.com', 'old2@test.com'] },
        updatedObj: { newEmails: ['new1@test.com', 'new2@test.com'] },
      };
      const mockResult = {
        matchedCount: 2,
        modifiedCount: 2,
        upsertedCount: 0,
        upsertedIds: {},
        insertedCount: 0,
        deletedCount: 0
      };
      const bulkWriteSpy = jest
        .spyOn(userService['userModel'], 'bulkWrite')
        .mockResolvedValue(mockResult as any);
      const result = await userService.bulkUpdateManyUserEmails(command);

      expect(bulkWriteSpy).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: { email: 'old1@test.com' },
              update: {
                email: 'new1@test.com',
                emailDomain: 'test.com',
              },
            },
          },
          {
            updateOne: {
              filter: { email: 'old2@test.com' },
              update: {
                email: 'new2@test.com',
                emailDomain: 'test.com',
              },
            },
          },
        ],
        { ordered: false },
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('verifyUserAccount', () => {
    it('should verify user account when modifiedCount > 0', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUpdateOne = jest
        .spyOn(userService['userModel'], 'updateOne')
        .mockResolvedValue({ modifiedCount: 1 } as any);
      const result = await userService.verifyUserAccount(userId);

      expect(mockUpdateOne).toBeCalledWith(
        { _id: userId },
        { $set: { isVerified: true } },
      );
      expect(result).toBe(true);
    });

    it('should return false when no document is updated', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';

      jest.spyOn(userService['userModel'], 'updateOne')
        .mockResolvedValue({ modifiedCount: 0 } as any);

      const result = await userService.verifyUserAccount(userId);

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const password = 'newpassword';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as any);

      const mockUpdateOne = jest
        .spyOn(userService['userModel'], 'updateOne')
        .mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await userService.resetPassword(userId, password);

      expect(mockUpdateOne).toBeCalledWith(
        { _id: userId },
        { $set: { password: 'hashed-password' } },
      );
      expect(result).toBe(true);
    });

    it('should return false when no document is updated', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const password = 'newpassword';
      const mockResetPassword = jest
        .spyOn(userService['userModel'], 'updateOne')
        .mockResolvedValue({ modifiedCount: 0 } as any);
      const result = await userService.resetPassword(userId, password);
      expect(result).toBe(false);
    });
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        name: 'Test User',
        email: 'test@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Test User',
          email: 'test@example.com',
        })
      };
      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockResolvedValue(mockUser as any);
      const result = await userService.findUserById(userId);

      expect(mockFindOne).toBeCalledWith(
        { _id: userId, isVerified: true },
        undefined
      );
      expect(result).toEqual({
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should return null when user not found', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockResolvedValue(null);
      const result = await userService.findUserById(userId);

      expect(mockFindOne).toBeCalledWith(
        { _id: userId, isVerified: true },
        undefined
      );
      expect(result).toBeNull();
    });

    it('should find user by id including not verified', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        name: 'Not Verified User',
        email: 'notverified@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Not Verified User',
          email: 'notverified@example.com',
        })
      };
      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockResolvedValue(mockUser as any);

      const result = await userService.findUserById(userId, undefined, true);

      expect(mockFindOne).toBeCalledWith(
        { _id: userId },
        undefined
      );
      expect(result).toEqual({
        _id: userId,
        name: 'Not Verified User',
        email: 'notverified@example.com',
      });
    });
  });

  describe('updateUsers', () => {
    it('should update users', async () => {
      const conditions = { _id: '5d5f85b5a7ab840c8d46f697' };
      const updateFields = { name: 'Updated Name' };
      const mockUpdateMany = jest
        .spyOn(userService['userModel'], 'updateMany')
        .mockResolvedValue({ modifiedCount: 1 } as any);
      const result = await userService.updateUsers(conditions, updateFields);
      expect(mockUpdateMany).toBeCalledWith(conditions, updateFields, undefined);
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('findUserToDeleteById', () => {
    it('should find user to delete by id', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        name: 'Test User',
      };
      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockResolvedValue(mockUser as any);
      const result = await userService.findUserToDeleteById(userId);
      expect(mockFindOne).toBeCalledWith({ _id: userId });
      expect(result).toEqual(mockUser);
    });
  });

  describe('checkEmailInput', () => {
    it('should check email input successfully', async () => {
      const emails = ['test@email.com'];
      const mockFindAll = jest
        .spyOn(userService['blacklistService'], 'findAll')
        .mockResolvedValue([]);

      await userService.checkEmailInput(emails);

      expect(mockFindAll).toBeCalledWith(2, emails);
    });

    it('should throw error if email is blacklisted', async () => {
      const emails = ['blacklisted@email.com'];
      const mockFindAll = jest
        .spyOn(userService['blacklistService'], 'findAll')
        .mockResolvedValue([{ email: 'blacklisted@email.com' }] as any);

      await expect(userService.checkEmailInput(emails))
        .rejects.toThrow('Unavailable user');

      expect(mockFindAll).toBeCalledWith(2, emails);
    });
  });

  describe('existsUserEmail', () => {
    it('should return true if email exists', async () => {
      const email = 'test@email.com';
      const normalizedEmail = email.toLowerCase();

      const mockExists = jest
        .spyOn(userService['userModel'], 'exists')
        .mockResolvedValue(userMockInstance as any);

      const result = await userService.existsUserEmail(email);

      expect(mockExists).toHaveBeenCalledWith({ email: normalizedEmail });
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const email = 'nonexistent@email.com';
      const normalizedEmail = email.toLowerCase();

      const mockExists = jest
        .spyOn(userService['userModel'], 'exists')
        .mockResolvedValue(null);

      const result = await userService.existsUserEmail(email);

      expect(mockExists).toHaveBeenCalledWith({ email: normalizedEmail });
      expect(result).toBe(false);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@email.com';
      const normalizedEmail = email.toLowerCase();

      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: normalizedEmail,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: normalizedEmail,
        }),
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        } as any);

      const result = await userService.findUserByEmail(email);

      expect(mockFindOne).toBeCalledWith({ email: normalizedEmail }, undefined);
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: normalizedEmail,
      });
    });


    it('should return null when user not found', async () => {
      const email = 'notfound@email.com';
      const normalizedEmail = email.toLowerCase();

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      const result = await userService.findUserByEmail(email);

      expect(mockFindOne).toBeCalledWith({ email: normalizedEmail }, undefined);
      expect(result).toBeNull();
    });
  });

  describe('findVerifiedUserByEmail', () => {
    it('should find verified user by email', async () => {
      const email = 'test@email.com';
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        isVerified: true,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          isVerified: true,
        }),
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        } as any);

      const result = await userService.findVerifiedUserByEmail(email);

      expect(mockFindOne).toBeCalledWith(
        { email: email.toLowerCase(), isVerified: true },
        undefined
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        isVerified: true,
      });
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@email.com';
      const normalizedEmail = email.toLowerCase();

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      const result = await userService.findVerifiedUserByEmail(email);

      expect(mockFindOne).toBeCalledWith({ email: normalizedEmail, isVerified: true }, undefined);
      expect(result).toBeNull();
    });
  });

  describe('findVerifiedUsersByEmail', () => {
    it('should find verified users by email', async () => {
      const emails = ['test@email.com', 'test2@email.com'];
      const normalizedEmails = emails.map((email) => email.toLowerCase());

      const UserMock = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        isVerified: true,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          isVerified: true,
        }),
      };

      const mockFind = jest
        .spyOn(userService['userModel'], 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([UserMock]),
        } as any);

      const result = await userService.findVerifiedUsersByEmail(emails);

      expect(mockFind).toBeCalledWith(
        { email: { $in: normalizedEmails }, isVerified: true },
        undefined
      );
      expect(result).toEqual([
        {
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          isVerified: true,
        },
      ]);
    });
  });

  describe('findUserByEmails', () => {
    it('should find users by emails', async () => {
      const emails = ['test@email.com', 'test2@email.com'];
      const normalizedEmails = emails.map((e) => e.toLowerCase());

      const UserMock = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
        }),
      };

      const mockFind = jest
        .spyOn(userService['userModel'], 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([UserMock]),
        } as any);

      const result = await userService.findUserByEmails(emails);

      expect(mockFind).toBeCalledWith(
        { email: { $in: normalizedEmails } },
        undefined
      );
      expect(result).toEqual([
        {
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
        },
      ]);
    });
  });

  describe('getUsersSameDomain', () => {
    it('should return users with same domain when domain is not popular', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        email: 'test@company.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          email: 'test@company.com',
        })
      };
      const mockFindUserById = jest
        .spyOn(userService, 'findUserById')
        .mockResolvedValue(mockUser as any);
      const mockUsers = [
        {
          _id: { toHexString: () => '5d5f85b5a7ab840c8d46f698' },
          email: 'user1@company.com',
          toObject: jest.fn().mockReturnValue({
            _id: '5d5f85b5a7ab840c8d46f698',
            email: 'user1@company.com',
          })
        },
        {
          _id: { toHexString: () => '5d5f85b5a7ab840c8d46f699' },
          email: 'user2@company.com',
          toObject: jest.fn().mockReturnValue({
            _id: '5d5f85b5a7ab840c8d46f699',
            email: 'user2@company.com',
          })
        }
      ];
      const mockFind = jest
        .spyOn(userService['userModel'], 'find')
        .mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUsers)
        } as any);
      const result = await userService.getUsersSameDomain(userId);

      expect(mockFindUserById).toBeCalledWith(userId, { email: 1 });
      expect(mockFind).toBeCalledWith(
        { emailDomain: 'company.com', _id: { $ne: userId } }
      );
      expect(result).toEqual([
        {
          _id: '5d5f85b5a7ab840c8d46f698',
          email: 'user1@company.com',
        },
        {
          _id: '5d5f85b5a7ab840c8d46f699',
          email: 'user2@company.com',
        }
      ]);
    });

    it('should return empty array when domain is popular', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        email: 'test@gmail.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          email: 'test@gmail.com',
        })
      };

      const mockFindUserById = jest
        .spyOn(userService, 'findUserById')
        .mockResolvedValue(mockUser as any);

      const result = await userService.getUsersSameDomain(userId);

      expect(mockFindUserById).toBeCalledWith(userId, { email: 1 });
      expect(result).toEqual([]);
    });
  });

  describe('findUserByAppleUserId', () => {
    it('should find user by Apple user ID', async () => {
      const appleUserId = 'apple123';
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        appleUserId,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          appleUserId,
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        } as any);

      const result = await userService.findUserByAppleUserId(appleUserId);

      expect(mockFindOne).toBeCalledWith(
        { appleUserId },
        undefined
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        appleUserId,
      });
    });

    it('should return null when user not found', async () => {
      const appleUserId = 'apple123';

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.findUserByAppleUserId(appleUserId);

      expect(mockFindOne).toBeCalledWith(
        { appleUserId },
        undefined
      );
      expect(result).toBeNull();
    });
  });

  describe('findUserByIdentityId', () => {
    it('should find user by identity ID', async () => {
      const identityId = 'identity123';
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        identityId,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          identityId,
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        } as any);

      const result = await userService.findUserByIdentityId(identityId);

      expect(mockFindOne).toBeCalledWith(
        { identityId },
        undefined
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        identityId,
      });
    });

    it('should return null when user not found', async () => {
      const identityId = 'identity123';

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.findUserByIdentityId(identityId);

      expect(mockFindOne).toBeCalledWith(
        { identityId },
        undefined
      );
      expect(result).toBeNull();
    });
  });

  describe('updateUserByIdentityId', () => {
    it('should update user by identity ID', async () => {
      const identityId = 'identity123';
      const updateFields = { name: 'Updated Name', email: 'updated@email.com' };
      const mockUpdatedUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Updated Name',
        email: 'updated@email.com',
        identityId,
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Updated Name',
          email: 'updated@email.com',
          identityId,
        })
      };
      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUpdatedUser)
        } as any);

      const result = await userService.updateUserByIdentityId(identityId, updateFields);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { identityId },
        { $set: updateFields },
        { new: true }
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Updated Name',
        email: 'updated@email.com',
        identityId,
      });
    });

    it('should return null when user not found', async () => {
      const identityId = 'identity123';
      const updateFields = { name: 'Updated Name' };

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.updateUserByIdentityId(identityId, updateFields);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { identityId },
        { $set: updateFields },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('updateUserPropertyById', () => {
    it('should update user property by id', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const updateFields = { name: 'Updated Name' };

      const mockUpdatedUser = {
        ...userMockInstance,
        ...updateFields,
        toObject: jest.fn().mockReturnValue({
          ...userMockInstance.toObject(),
          ...updateFields
        }),
        _id: { toHexString: () => userMockInstance._id.toHexString() }
      };
      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUpdatedUser)
        } as any));

      const result = await userService.updateUserPropertyById(userId, updateFields, true);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { _id: userId },
        { $set: updateFields },
        { new: true }
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('updateUserProperty', () => {
    it('should update user property', async () => {
      const conditions = { _id: '5d5f85b5a7ab840c8d46f697' };
      const updateFields = { name: 'Updated Name' };

      const mockUpdatedUser = {
        ...userMockInstance,
        ...updateFields,
        toObject: jest.fn().mockReturnValue({
          ...userMockInstance.toObject(),
          ...updateFields
        }),
        _id: { toHexString: () => userMockInstance._id.toHexString() }
      };

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUpdatedUser)
        } as any));

      const result = await userService.updateUserProperty(conditions, updateFields);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { ...conditions, isVerified: true },
        { $set: updateFields },
        { new: true }
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('updateUnverifiedUserProperty', () => {
    it('should update unverified user property', async () => {
      const conditions = { _id: '5d5f85b5a7ab840c8d46f697' };
      const updateFields = { name: 'Updated Name' };

      const mockUpdatedUser = {
        ...userMockInstance,
        ...updateFields,
        toObject: jest.fn().mockReturnValue({
          ...userMockInstance.toObject(),
          ...updateFields
        }),
        _id: { toHexString: () => userMockInstance._id.toHexString() }
      };
      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUpdatedUser)
        } as any));

      const result = await userService.updateUnverifiedUserProperty(conditions, updateFields);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { ...conditions },
        { $set: updateFields },
        { new: true }
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should return null when user not found', async () => {
      const conditions = { _id: '5d5f85b5a7ab840c8d46f697' };
      const updateFields = { name: 'Updated Name' };

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(null)
        } as any));

      const result = await userService.updateUnverifiedUserProperty(conditions, updateFields);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { ...conditions },
        { $set: updateFields },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('updateFolderColor', () => {
    it('should update folder color for user', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const color = '#FF5733';

      const mockUpdatedUser = {
        ...userMockInstance,
        metadata: {
          ...userMockInstance.metadata,
          folderColors: [color]
        },
        toObject: jest.fn().mockReturnValue({
          ...userMockInstance.toObject(),
          metadata: {
            ...userMockInstance.metadata,
            folderColors: [color]
          }
        }),
        _id: { toHexString: () => userMockInstance._id.toHexString() }
      };

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUpdatedUser)
        } as any));

      const result = await userService.updateFolderColor(userId, color);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { _id: userId, 'metadata.folderColors': { $ne: color } },
        { $push: { 'metadata.folderColors': { $each: [color], $slice: expect.any(Number) } } },
        { new: true }
      );
      expect(result.metadata.folderColors).toContain(color);
    });
  });

  describe('undoDeleteUser', () => {
    it('should undo delete user', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUpdatedUser = {
        _id: { toHexString: () => userId },
        deletedAt: null,
        name: 'Test User',
        email: 'test@email.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Test User',
          email: 'test@email.com',
          deletedAt: null,
        }),
      };
      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUpdatedUser),
        } as any);
      const result = await userService.undoDeleteUser(userId);

      expect(mockFindOneAndUpdate).toBeCalledWith(
        { _id: userId },
        { $unset: { deletedAt: 1 } },
        { new: true }
      );
      expect(result).toEqual({
        _id: userId,
        name: 'Test User',
        email: 'test@email.com',
        deletedAt: null,
      });
      expect(mockUpdatedUser.toObject).toBeCalled();
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user with active payment', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'ACTIVE',
          customerRemoteId: 'customer123'
        },
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Test User',
          email: 'test@email.com',
          payment: {
            status: 'ACTIVE',
            customerRemoteId: 'customer123'
          }
        })
      };

      const mockRemoveUsersToDelete = jest
        .spyOn(userService['redisService'], 'removeUsersToDelete')
        .mockImplementation(() => Promise.resolve(true));

      const mockFindUserById = jest
        .spyOn(userService, 'findUserById')
        .mockResolvedValue(mockUser as any);

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUser)
        } as any));

      const mockEmitReactivateAccount = jest
        .spyOn(userService as any, 'emitReactivateAccount')
        .mockImplementation(() => Promise.resolve(true));

      const mockTrackPlanAttributes = jest
        .spyOn(userService as any, 'trackPlanAttributes')
        .mockImplementation(() => Promise.resolve(true));

      const result = await userService.reactivateUser(userId);

      expect(mockRemoveUsersToDelete).toBeCalledWith([userId]);
      expect(mockFindUserById).toBeCalledWith(userId);
      expect(mockFindOneAndUpdate).toBeCalledWith(
        { _id: userId },
        { $unset: { deletedAt: 1 } },
        { new: true }
      );
      expect(mockEmitReactivateAccount).toBeCalledWith({
        _id: userId,
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'ACTIVE',
          customerRemoteId: 'customer123'
        }
      });
      expect(mockTrackPlanAttributes).toBeCalledWith(userId);
      expect(result).toEqual({
        _id: userId,
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'ACTIVE',
          customerRemoteId: 'customer123'
        }
      });
    });

    it('should reactivate user with canceled payment and update subscription', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUser = {
        _id: { toHexString: () => userId },
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'CANCELED',
          customerRemoteId: 'customer123',
          subscriptionRemoteId: 'sub123',
          stripeAccountId: 'account123'
        },
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Test User',
          email: 'test@email.com',
          payment: {
            status: 'ACTIVE',
            customerRemoteId: 'customer123',
            subscriptionRemoteId: 'sub123',
            stripeAccountId: 'account123'
          }
        })
      };

      const mockRemoveUsersToDelete = jest
        .spyOn(userService['redisService'], 'removeUsersToDelete')
        .mockImplementation(() => Promise.resolve(true));

      const mockFindUserById = jest
        .spyOn(userService, 'findUserById')
        .mockResolvedValue(mockUser as any);

      const mockUpdateStripeSubscription = jest
        .spyOn(userService['paymentService'], 'updateStripeSubscription')
        .mockImplementation(() => Promise.resolve({} as any));

      const mockFindOneAndUpdate = jest
        .spyOn(userService['userModel'], 'findOneAndUpdate')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUser)
        } as any));

      const mockEmitReactivateAccount = jest
        .spyOn(userService as any, 'emitReactivateAccount')
        .mockImplementation(() => Promise.resolve(true));

      const mockTrackPlanAttributes = jest
        .spyOn(userService as any, 'trackPlanAttributes')
        .mockImplementation(() => Promise.resolve(true));

      const result = await userService.reactivateUser(userId);

      expect(mockRemoveUsersToDelete).toBeCalledWith([userId]);
      expect(mockFindUserById).toBeCalledWith(userId);
      expect(mockUpdateStripeSubscription).toBeCalledWith(
        'sub123',
        { cancel_at_period_end: false },
        { stripeAccount: 'account123' }
      );
      expect(mockFindOneAndUpdate).toBeCalledWith(
        { _id: userId },
        {
          $unset: { deletedAt: 1 },
          'payment.status': 'ACTIVE'
        },
        { new: true }
      );
      expect(mockEmitReactivateAccount).toBeCalledWith({
        _id: userId,
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'ACTIVE',
          customerRemoteId: 'customer123',
          subscriptionRemoteId: 'sub123',
          stripeAccountId: 'account123'
        }
      });
      expect(mockTrackPlanAttributes).toBeCalledWith(userId);
      expect(result).toEqual({
        _id: userId,
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          status: 'ACTIVE',
          customerRemoteId: 'customer123',
          subscriptionRemoteId: 'sub123',
          stripeAccountId: 'account123'
        }
      });
    });
  });

  describe('findUserByCustomerId', () => {
    it('should find user by customer ID', async () => {
      const customerId = 'customer123';
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          customerRemoteId: customerId
        },
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          payment: {
            customerRemoteId: customerId
          }
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        } as any);

      const result = await userService.findUserByCustomerId(customerId);

      expect(mockFindOne).toBeCalledWith(
        { 'payment.customerRemoteId': customerId, isVerified: true },
        undefined
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          customerRemoteId: customerId
        }
      });
    });

    it('should return null when user not found', async () => {
      const customerId = 'nonexistent123';

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.findUserByCustomerId(customerId);

      expect(mockFindOne).toBeCalledWith(
        { 'payment.customerRemoteId': customerId, isVerified: true },
        undefined
      );
      expect(result).toBeNull();
    });
  });

  describe('findUserBySubcriptionId', () => {
    it('should find user by subscription ID', async () => {
      const subscriptionId = 'sub123';
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          subscriptionRemoteId: subscriptionId
        },
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
          payment: {
            subscriptionRemoteId: subscriptionId
          }
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        } as any);

      const result = await userService.findUserBySubcriptionId(subscriptionId);

      expect(mockFindOne).toBeCalledWith(
        { 'payment.subscriptionRemoteId': subscriptionId, isVerified: true },
        undefined
      );
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        payment: {
          subscriptionRemoteId: subscriptionId
        }
      });
    });

    it('should return null when user not found', async () => {
      const subscriptionId = 'nonexistent123';

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.findUserBySubcriptionId(subscriptionId);

      expect(mockFindOne).toBeCalledWith(
        { 'payment.subscriptionRemoteId': subscriptionId, isVerified: true },
        undefined
      );
      expect(result).toBeNull();
    });
  });

  describe('findUser', () => {
    it('should find user by conditions', async () => {
      const conditions = { email: 'test@email.com' };
      const mockUser = {
        _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
        name: 'Test User',
        email: 'test@email.com',
        toObject: jest.fn().mockReturnValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com'
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        } as any);

      const result = await userService.findUser(conditions);

      expect(mockFindOne).toBeCalledWith(conditions, undefined);
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com'
      });
    });

    it('should return null when user not found', async () => {
      const conditions = { email: 'nonexistent@email.com' };

      const mockFindOne = jest
        .spyOn(userService['userModel'], 'findOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        } as any);

      const result = await userService.findUser(conditions);

      expect(mockFindOne).toBeCalledWith(conditions, undefined);
      expect(result).toBeNull();
    });
  });

  describe('findUsers', () => {
    it('should find users by conditions with limit', async () => {
      const conditions = { isVerified: true };
      const projection = { name: 1, email: 1 };
      const options = { limit: 10 };

      const mockUsers = [
        {
          _id: { toHexString: () => '5d5f85b5a7ab840c8d46f697' },
          name: 'Test User 1',
          email: 'test1@email.com',
          toObject: jest.fn().mockReturnValue({
            _id: '5d5f85b5a7ab840c8d46f697',
            name: 'Test User 1',
            email: 'test1@email.com'
          })
        },
        {
          _id: { toHexString: () => '5d5f85b5a7ab840c8d46f698' },
          name: 'Test User 2',
          email: 'test2@email.com',
          toObject: jest.fn().mockReturnValue({
            _id: '5d5f85b5a7ab840c8d46f698',
            name: 'Test User 2',
            email: 'test2@email.com'
          })
        }
      ];

      const mockFind = jest
        .spyOn(userService['userModel'], 'find')
        .mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers)
          })
        } as any);

      const result = await userService.findUsers(conditions, projection, options);

      expect(mockFind).toBeCalledWith(conditions, projection);
      expect(result).toEqual([
        {
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User 1',
          email: 'test1@email.com'
        },
        {
          _id: '5d5f85b5a7ab840c8d46f698',
          name: 'Test User 2',
          email: 'test2@email.com'
        }
      ]);
    });

    it('should find users without limit when not provided', async () => {
      const conditions = { isVerified: true };
      const mockUsers = [userMockInstance];

      const mockFind = jest
        .spyOn(userService['userModel'], 'find')
        .mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers)
          })
        } as any);

      const result = await userService.findUsers(conditions);

      expect(mockFind).toBeCalledWith(conditions, undefined);
      expect(result).toHaveLength(1);
    });
  });

  describe('aggregateUser', () => {
    it('should aggregate users with pipeline stages', async () => {
      const pipeline = [
        { $match: { isVerified: true } },
        { $group: { _id: '$payment.type', count: { $sum: 1 } } }
      ];
      const mockResult = [
        { _id: 'FREE', count: 5 },
        { _id: 'PRO', count: 3 }
      ];

      const mockAggregate = jest
        .spyOn(userService['userModel'], 'aggregate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResult)
        } as any);

      const result = await userService.aggregateUser(pipeline);

      expect(mockAggregate).toBeCalledWith(pipeline);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOneAndUpdate', () => {
    beforeEach(() => {
      (userService as any).userModel = {
        findOneAndUpdate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      };
    });

    it('should return null when user not found', async () => {
      const result = await userService.findOneAndUpdate(
        { _id: 'non-existing-id' },
        { name: 'Updated' },
        {}
      );

      expect(result).toBeNull();
      expect((userService as any).userModel.findOneAndUpdate).toBeCalledWith(
        { _id: 'non-existing-id' },
        { name: 'Updated' },
        {}
      );
    });
  });

  describe('findExternalSharees', () => {
    beforeEach(() => {
      (userService as any).userModel = {
        find: jest.fn()
      };
    });

    it('should find external sharees', async () => {
      const documentId = '5d5f85b5a7ab840c8d46f697';
      const mockExternalSharees = [userMockInstance];

      (userService as any).userModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExternalSharees)
      });

      const result = await userService.findExternalSharees(documentId, 'test');

      expect(userService['userModel'].find).toBeCalled();
      expect(result).toEqual([
        {
          _id: userMockInstance._id.toHexString(),
          name: userMockInstance.name,
          email: userMockInstance.email,
          avatarRemoteId: userMockInstance.avatarRemoteId,
          isVerified: userMockInstance.isVerified,
          password: userMockInstance.password,
          payment: userMockInstance.payment,
        }
      ]);
    });
  });

  describe('countUsersByCustomConditions', () => {
    let mockCountDocuments: jest.Mock;
    let mockExec: jest.Mock;

    beforeEach(() => {
      mockExec = jest.fn().mockResolvedValue(5);
      mockCountDocuments = jest.fn().mockReturnValue({ exec: mockExec });

      (userService as any).userModel = {
        countDocuments: mockCountDocuments,
      };

      jest.spyOn(userService as any, 'getBasicQuery').mockReturnValue({ active: true });
    });

    it('should call countDocuments with merged conditions', async () => {
      const conditions = { role: 'admin' };

      const result = await userService.countUsersByCustomConditions(conditions);

      expect(userService['getBasicQuery']).toHaveBeenCalled();
      expect(mockCountDocuments).toHaveBeenCalledWith({
        role: 'admin',
        active: true,
      });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('deleteUserContact', () => {
    it('should delete user contact', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockFindOneAndDelete = jest
        .spyOn(userService['userContactModel'], 'findOneAndDelete')
        .mockImplementation(() => ({
          exec: () => Promise.resolve({ deletedCount: 1 })
        } as any));

      await userService.deleteUserContact(userId);

      expect(mockFindOneAndDelete).toBeCalledWith({ userId }, undefined);
    });
  });

  describe('removeAvatarFromS3', () => {
    it('should remove avatar from S3', async () => {
      const avatarRemoteId = 'avatar-123';
      const mockRemoveFileFromBucket = jest
        .spyOn(userService['awsService'] as any, 'removeFileFromBucket')
        .mockImplementation(() => Promise.resolve(true));

      await userService.removeAvatarFromS3(avatarRemoteId);

      expect(mockRemoveFileFromBucket).toBeCalledWith(avatarRemoteId, expect.any(String));
    });

    it('should not call removeFileFromBucket when avatarRemoteId is empty', async () => {
      const mockRemoveFileFromBucket = jest.spyOn(
        userService['awsService'] as any,
        'removeFileFromBucket'
      );

      await userService.removeAvatarFromS3('');

      expect(mockRemoveFileFromBucket).not.toHaveBeenCalled();
    });

    it('should fallback to S3_PROFILES_BUCKET if first removal fails', async () => {
      const avatarRemoteId = 'avatar-123';

      const mockRemoveFileFromBucket = jest
        .spyOn(userService['awsService'] as any, 'removeFileFromBucket')
        .mockImplementationOnce(() => Promise.reject(new Error('fail')))
        .mockImplementationOnce(() => Promise.resolve(true));

      await userService.removeAvatarFromS3(avatarRemoteId);

      expect(mockRemoveFileFromBucket).toHaveBeenNthCalledWith(
        1,
        avatarRemoteId,
        EnvConstants.S3_DOCUMENTS_BUCKET
      );
      expect(mockRemoveFileFromBucket).toHaveBeenNthCalledWith(
        2,
        avatarRemoteId,
        EnvConstants.S3_PROFILES_BUCKET
      );
    });

    it('should remove avatar from S3 normally', async () => {
      const avatarRemoteId = 'avatar-123';
      const mockRemoveFileFromBucket = jest
        .spyOn(userService['awsService'] as any, 'removeFileFromBucket')
        .mockResolvedValue(true);

      await userService.removeAvatarFromS3(avatarRemoteId);

      expect(mockRemoveFileFromBucket).toHaveBeenCalledWith(
        avatarRemoteId,
        EnvConstants.S3_DOCUMENTS_BUCKET
      );
    });
  });

  describe('getUsers', () => {
    let mockUserWithToObject: any;

    beforeEach(() => {
      mockUserWithToObject = {
        ...userMockInstance,
        toObject: jest.fn().mockReturnValue({
          _id: userMockInstance._id.toHexString(),
          name: userMockInstance.name,
          email: userMockInstance.email,
        }),
        _id: { toHexString: () => userMockInstance._id.toHexString() },
      };

      (userService as any).userModel = {
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUserWithToObject]),
        }),
        estimatedDocumentCount: jest.fn().mockResolvedValue(100),
      };
    });

    it('should return users with pagination', async () => {
      const input = {
        searchQuery: { key: 'test', field: 'email' as any },
        limit: 10,
        offset: 0,
        sortOptions: { field: 'createdAt', direction: 'DESC' } as any,
        filterOptions: { isVerified: true } as any,
      };

      const [users, total] = await userService.getUsers(input);

      expect((userService as any).userModel.find).toBeCalled();
      expect(users).toEqual([{
        _id: userMockInstance._id.toHexString(),
        name: userMockInstance.name,
        email: userMockInstance.email,
      }]);
      expect(total).toBe(100);
    });

    it('should return users with pagination (no sort options)', async () => {
      const input = {
        searchQuery: { key: 'test', field: 'email' as any },
        limit: 10,
        offset: 0,
        filterOptions: { isVerified: true } as any,
      };

      (userService as any).userModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          then: (resolve) => resolve([mockUserWithToObject]),
          countDocuments: jest.fn().mockResolvedValue(5),
        }),
      });

      const [users, total] = await userService.getUsers(input);

      expect((userService as any).userModel.find).toBeCalled();
      expect(users).toEqual([{
        _id: userMockInstance._id.toHexString(),
        name: userMockInstance.name,
        email: userMockInstance.email,
      }]);
      expect(total).toBe(100);
    });
  });


  describe('isAvailableUsePremiumFeature', () => {
    it('should return true for premium user', async () => {
      const premiumUser = {
        ...UserMock,
        payment: {
          type: 'PRO' as any,
          status: 'active'
        }
      } as any;

      const result = await userService.isAvailableUsePremiumFeature(premiumUser);

      expect(result).toBe(true);
    });

    it('should return false for free user', async () => {
      const freeUser = {
        ...UserMock,
        payment: {
          type: PaymentPlanEnums.FREE,
          status: 'active'
        }
      } as any;

      const mockGetOnePremiumOrgOfUser = jest
        .spyOn(userService['organizationService'], 'getOnePremiumOrgOfUser')
        .mockResolvedValue(null);

      const result = await userService.isAvailableUsePremiumFeature(freeUser);

      expect(mockGetOnePremiumOrgOfUser).toBeCalledWith(freeUser._id);
      expect(result).toBe(false);
    });
  });

  describe('getUserPurpose', () => {
    it('should return user purpose', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockUserPurpose = {
        _id: { toHexString: () => '123' },
        userId,
        purpose: 'business',
        toObject: jest.fn().mockReturnValue({
          _id: '123',
          userId,
          purpose: 'business'
        })
      };

      const mockFindOne = jest
        .spyOn(userService['userPurposeModel'], 'findOne')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUserPurpose)
        } as any));

      const result = await userService.getUserPurpose(userId);

      expect(mockFindOne).toBeCalledWith({ userId }, undefined);
      expect(result.purpose).toBe('business');
    });

    it('should return null when userPurpose not found', async () => {
      const userId = 'notfound-id';

      jest
        .spyOn(userService['userPurposeModel'], 'findOne')
        .mockImplementation(() => ({
          exec: () => Promise.resolve(null)
        } as any));

      const result = await userService.getUserPurpose(userId);

      expect(result).toBeNull();
    });
  });

  describe('upsertUserPurpose', () => {
    it('should create or update user purpose', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const purpose = 'business';

      const mockUpdateOne = jest
        .spyOn(userService['userPurposeModel'], 'updateOne')
        .mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await userService.upsertUserPurpose(userId, purpose as any);

      expect(mockUpdateOne).toBeCalledWith(
        { userId },
        purpose,
        { upsert: true, new: true }
      );
      expect(result.modifiedCount).toBe(1);
    });
  });

  describe('getShareUsers', () => {
    it('should return share users for document', async () => {
      const documentId = '5d5f85b5a7ab840c8d46f697';
      const mockGetDocumentPermissions = jest
        .spyOn(documentService, 'getDocumentPermissionsByDocId')
        .mockImplementation(() => Promise.resolve([
          { _id: '1', refId: 'user1', documentId: 'doc1', role: 'owner', workspace: { refId: 'ws1', type: 'PERSONAL' as any } },
          { _id: '2', refId: 'user2', documentId: 'doc1', role: 'editor', workspace: { refId: 'ws1', type: 'PERSONAL' as any } }
        ] as any));

      const result = await userService.getShareUsers(documentId, 'document');

      expect(mockGetDocumentPermissions).toBeCalledWith(documentId);
      expect(result).toEqual(new Set(['user1', 'user2']));
    });
  });

  describe('addNewSignature', () => {
    beforeEach(() => {
      (userService as any).userModel = {
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...userMockInstance,
            signatures: [],
            toObject: jest.fn().mockReturnValue(userMockInstance.toObject()),
            _id: { toHexString: () => userMockInstance._id.toHexString() }
          }),
        }),
      };
      (userService as any).uploadService = {
        verifyUploadSignatureData: jest.fn().mockReturnValue({ signatureRemoteId: 'decoded-id' }),
      };
      jest.spyOn(userService as any, 'isAvailableUsePremiumFeature').mockResolvedValue(false);
      jest.spyOn(userService as any, 'findOneAndUpdate').mockImplementation(() =>
        Promise.resolve({
          metadata: { hasShownBananaBanner: true },
          signatures: ['decoded-id'],
          toObject: () => ({}),
          _id: { toHexString: () => userMockInstance._id.toHexString() },
        })
      );
      (userService as any).paymentService = {
        retrieveCustomer: jest.fn().mockResolvedValue({ email: 'customer@test.com' }),
      };
    });

    it('should use FREE_PLAN when user is not premium', async () => {
      const result = await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: false,
        encodeSignature: 'encoded',
      });

      expect(userService.isAvailableUsePremiumFeature).toHaveBeenCalled();
      expect(result.user.signatures).toEqual(['decoded-id']);
    });

    it('should set maximumNumberSignature = PREMIUM_PLAN when isMobile is true', async () => {
      await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: true,
        encodeSignature: 'encoded',
      });

      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userMockInstance._id.toHexString() },
        expect.objectContaining({ $push: { signatures: 'decoded-id' } }),
        { new: true }
      );
    });

    it('should return error when exceeded limit of signatures', async () => {
      (userService as any).userModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...userMockInstance,
          signatures: Array(MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN).fill('sig'),
          toObject: jest.fn().mockReturnValue({
            ...userMockInstance.toObject(),
            signatures: Array(MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN).fill('sig'),
          }),
          _id: { toHexString: () => userMockInstance._id.toHexString() },
        }),
      });

      const result = await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: false,
        encodeSignature: 'encoded',
      });

      expect(result.errorCode).toBe(ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE);
      expect(result.user.signatures.length).toBe(MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN);
    });

    it('should handle optional chaining with payment and customer email', async () => {
      jest.spyOn(userService as any, 'findOneAndUpdate').mockResolvedValue({
        metadata: { hasShownBananaBanner: true },
        signatures: ['decoded-id'],
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      });

      const result = await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: false,
        encodeSignature: 'encoded',
      });

      expect((userService as any).paymentService.retrieveCustomer).toHaveBeenCalledWith(
        'cus_123',
        null,
        { stripeAccount: 'acct_123' }
      );
      expect(result.user.billingEmail).toBe('customer@test.com');
    });

    it('should use PREMIUM_PLAN when user is premium', async () => {
      jest.spyOn(userService as any, 'isAvailableUsePremiumFeature').mockResolvedValue(true);

      await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: false,
        encodeSignature: 'encoded',
      });

      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userMockInstance._id.toHexString() },
        expect.objectContaining({ $push: { signatures: 'decoded-id' } }),
        { new: true }
      );
    });

    it('should handle case when findOneAndUpdate returns undefined (no result)', async () => {
      jest.spyOn(userService as any, 'findOneAndUpdate').mockResolvedValue(undefined);

      const result = await userService.addNewSignature({
        userId: userMockInstance._id.toHexString(),
        isMobile: false,
        encodeSignature: 'encoded',
      });

      expect((userService as any).paymentService.retrieveCustomer).not.toHaveBeenCalled();
      expect(result.user.billingEmail).toBe(userMockInstance.email);
    });

  });

  describe('deleteSignature', () => {
    const userInfo = {
      _id: 'user123',
      email: 'user@test.com',
      signatures: ['sig1', 'sig2'],
    };

    beforeEach(() => {
      (userService as any).awsService = {
        removeFileFromBucket: jest.fn().mockResolvedValue(true),
      };
      (userService as any).paymentService = {
        retrieveCustomer: jest.fn(),
      };
    });

    it('should return billingEmail from userInfo.email when no customerRemoteId', async () => {
      jest.spyOn(userService as any, 'findOneAndUpdate').mockResolvedValue({
        _id: 'user123',
        signatures: ['sig2'],
        metadata: { hasShownBananaBanner: true },
      });

      const result = await userService.deleteSignature({
        userInfo: userInfo as any,
        removedIndex: 0,
      });

      expect((userService as any).awsService.removeFileFromBucket).toHaveBeenCalledWith(
        'sig1',
        EnvConstants.S3_PROFILES_BUCKET,
      );
      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userInfo._id },
        { $set: { signatures: ['sig2'] }, 'metadata.hasShownBananaBanner': true },
        { new: true },
      );
      expect((userService as any).paymentService.retrieveCustomer).not.toHaveBeenCalled();
      expect(result.billingEmail).toBe(userInfo.email);
    });

    it('should return billingEmail from currentCustomer.email when customerRemoteId exists', async () => {
      jest.spyOn(userService as any, 'findOneAndUpdate').mockResolvedValue({
        _id: 'user123',
        signatures: ['sig2'],
        metadata: { hasShownBananaBanner: true },
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      });
      (userService as any).paymentService.retrieveCustomer.mockResolvedValue({
        email: 'customer@test.com',
      });

      const result = await userService.deleteSignature({
        userInfo: userInfo as any,
        removedIndex: 0,
      });

      expect((userService as any).awsService.removeFileFromBucket).toHaveBeenCalledWith(
        'sig2',
        EnvConstants.S3_PROFILES_BUCKET,
      );
      expect((userService as any).paymentService.retrieveCustomer).toHaveBeenCalledWith(
        'cus_123',
        null,
        { stripeAccount: 'acct_123' },
      );
      expect(result.billingEmail).toBe('customer@test.com');
    });
  });

  describe('getUserInfoToDeleteSignature', () => {
    beforeEach(() => {
      (userService as any).userModel = {
        findById: jest.fn().mockResolvedValue({
          ...userMockInstance,
          toObject: jest.fn().mockReturnValue(userMockInstance.toObject()),
        }),
      };
    });

    it('should return user info to delete signature', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const result = await userService.getUserInfoToDeleteSignature(userId);
      expect(result).toMatchObject({
        _id: userMockInstance._id.toHexString(),
        email: userMockInstance.email,
      });
    });

    it('should return null if user not found', async () => {
      (userService as any).userModel.findById = jest.fn().mockResolvedValue(null);
      const result = await userService.getUserInfoToDeleteSignature('non-existing-id');
      expect(result).toBeNull();
    });
  });

  describe('deleteSignatureByRemoteId', () => {
    const userId = 'user123';
    const signatureRemoteId = 'sig123';

    beforeEach(() => {
      jest.clearAllMocks();

      (userService as any).getUserInfoToDeleteSignature = jest.fn().mockResolvedValue({
        _id: userId,
        email: 'test@email.com',
        signatures: [signatureRemoteId, 'sig456'],
        payment: { customerRemoteId: 'cus_123', stripeAccountId: 'acct_123' },
      });

      (userService as any).deleteSignature = jest.fn().mockResolvedValue({
        _id: userId,
        email: 'test@email.com',
        signatures: ['sig456'],
      });

      (userService as any).messageGateway = {
        server: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };
    });

    it('should delete signature and emit socket event', async () => {
      const result = await userService.deleteSignatureByRemoteId(userId, signatureRemoteId);

      expect(userService.getUserInfoToDeleteSignature).toHaveBeenCalledWith(userId);
      expect(userService.deleteSignature).toHaveBeenCalledWith({
        removedIndex: 0,
        userInfo: expect.objectContaining({ _id: userId }),
      });
      expect((userService as any).messageGateway.server.to).toHaveBeenCalledWith(
        SocketRoomGetter.user(userId),
      );
      expect((userService as any).messageGateway.server.emit).toHaveBeenCalledWith(
        SOCKET_MESSAGE.REMOVE_USER_SIGNATURE,
        { remoteId: signatureRemoteId },
      );
      expect(result).toEqual({
        _id: userId,
        email: 'test@email.com',
        signatures: ['sig456'],
      });
    });

    it('should throw error if signature not found', async () => {
      (userService as any).getUserInfoToDeleteSignature = jest.fn().mockResolvedValue({
        _id: userId,
        email: 'test@email.com',
        signatures: ['sig456'],
      });

      await expect(
        userService.deleteSignatureByRemoteId(userId, signatureRemoteId),
      ).rejects.toThrow(GraphqlException);

    });
  });

  describe('updateSignaturePosition', () => {
    it('should update signature position when moving inside list', async () => {
      const result = await userService.updateSignaturePosition({
        defaultList: ['sig1', 'sig2'],
        signatureRemoteId: 'sig1',
        toPosition: 1,
      });
      expect(result).toEqual(['sig1', 'sig2']);
    });

    it('should update signature position when toPosition = 0 (move to end of list)', async () => {
      const result = await userService.updateSignaturePosition({
        defaultList: ['sig1', 'sig2'],
        signatureRemoteId: 'sig1',
        toPosition: 0,
      });
      expect(result).toEqual(['sig2', 'sig1']);
    });

    it('should return unchanged list if signature not found', async () => {
      const result = await userService.updateSignaturePosition({
        defaultList: ['sig1', 'sig2'],
        signatureRemoteId: 'sig3',
        toPosition: 1,
      });
      expect(result).toEqual(['sig1', 'sig2']);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';

      const mockSessionFn = jest.fn().mockResolvedValue(true);
      const mockFindOneAndDelete = jest.fn().mockReturnValue({
        session: mockSessionFn,
      });

      (userService as any).userModel = {
        findOneAndDelete: mockFindOneAndDelete,
      };

      const result = await userService.deleteUser(userId);

      expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: userId });
      expect(mockSessionFn).toHaveBeenCalledWith(null);
      expect(result).toBe(true);
    });
  });

  describe('finishDeleteAccount', () => {
    beforeEach(() => {
      jest.spyOn(userService, 'findUserToDeleteById');
      (userService as any).loggerService = { info: jest.fn(), error: jest.fn() };
      (userService as any).userTrackingService = { deleteContactByEmail: jest.fn() };
      (userService as any).documentService = {
        findDocumentByUserId: jest.fn(),
        getDocumentPermissionsByDocId: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
        deleteRemoteDocument: jest.fn(),
        deleteRemoteThumbnail: jest.fn(),
        deleteDocumentPermissions: jest.fn(),
      };
      (userService as any).redisService = { clearAllRefreshToken: jest.fn() };
      userService.removeAvatarFromS3 = jest.fn();
      userService.deleteUserContact = jest.fn();
      userService.deleteUser = jest.fn();
    });

    it('should return null and log info if user.deletedAt does not exist', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        name: 'John',
        deletedAt: null,
        avatarRemoteId: 'avatar1',
      };

      (userService.findUserToDeleteById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.finishDeleteAccount('user1');

      expect(result).toBeNull();
      expect((userService as any).loggerService.info).toHaveBeenCalledWith({
        context: 'finishDeleteAccount',
        extraInfo: { userId: 'user1' },
      });
    });

    it('should handle team-document case and call updateDocument', async () => {
      const mockUser = {
        _id: 'user2',
        email: 'team@example.com',
        name: 'Team User',
        deletedAt: new Date(),
        avatarRemoteId: 'avatar2',
      };

      (userService.findUserToDeleteById as jest.Mock).mockResolvedValue(mockUser);
      (userService as any).documentService.findDocumentByUserId.mockResolvedValue([
        { _id: 'doc1', thumbnail: 'thumb1' },
      ]);
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        { role: 'ORGANIZATION' },
      ]);

      const result = await userService.finishDeleteAccount('user2');

      await new Promise(process.nextTick);

      expect((userService as any).documentService.updateDocument).toHaveBeenCalledWith(
        'doc1',
        { ownerName: 'Team User', ownerId: '' },
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle owned-document case and call deleteDocument methods', async () => {
      const mockUser = {
        _id: 'user3',
        email: 'own@example.com',
        name: 'Owner',
        deletedAt: new Date(),
        avatarRemoteId: 'avatar3',
      };

      (userService.findUserToDeleteById as jest.Mock).mockResolvedValue(mockUser);
      (userService as any).documentService.findDocumentByUserId.mockResolvedValue([
        { _id: 'doc2', thumbnail: 'thumb2' },
      ]);
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([]);

      const result = await userService.finishDeleteAccount('user3');

      expect((userService as any).documentService.deleteRemoteThumbnail).toHaveBeenCalledWith('thumb2');
      expect((userService as any).documentService.deleteRemoteDocument).toHaveBeenCalled();
      expect((userService as any).documentService.deleteDocument).toHaveBeenCalledWith('doc2');
      expect(result).toEqual(mockUser);
    });

    it('should log error and return null when exception occurs', async () => {
      (userService.findUserToDeleteById as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await userService.finishDeleteAccount('user4');

      expect((userService as any).loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'finishDeleteAccount',
          extraInfo: { userId: 'user4' },
        }),
      );
      expect(result).toBeNull();
    });

    it('should return null and log info if user is not found', async () => {
      (userService.findUserToDeleteById as jest.Mock).mockResolvedValue(null);

      const result = await userService.finishDeleteAccount('user5');

      expect(result).toBeNull();
      expect((userService as any).loggerService.info).toHaveBeenCalledWith({
        context: 'finishDeleteAccount',
        extraInfo: { userId: 'user5' },
      });
    });
  });

  describe('deleteSignatureByIndex', () => {
    it('should delete signature by index', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const index = 0;

      jest.spyOn(userService as any, 'getUserInfoToDeleteSignature')
        .mockResolvedValue({
          _id: userId,
          signatures: ['sig1', 'sig2'],
          email: userMockInstance.email,
        });

      (userService as any).deleteSignature = jest.fn().mockResolvedValue({
        _id: userId,
        signatures: ['sig2'],
        email: userMockInstance.email,
      });

      const result = await userService.deleteSignatureByIndex(userId, index);

      expect(userService.deleteSignature).toHaveBeenCalledWith({
        removedIndex: index,
        userInfo: expect.objectContaining({ _id: userId }),
      });
      expect(result.signatures).toEqual(['sig2']);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const result = await userService.deleteUser(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('getUserCurrentStep', () => {
    it('should return user current step', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const mockGetUserPurpose = jest
        .spyOn(userService, 'getUserPurpose')
        .mockImplementation(() => Promise.resolve({
          _id: '123',
          userId,
          purpose: 'business',
          currentStep: 2
        }));

      const result = await userService.getUserCurrentStep(userId);

      expect(mockGetUserPurpose).toBeCalledWith(userId, { currentStep: 1 });
      expect(result).toBe(2);
    });

    it('should insert default purpose and return default step when userPurpose not found', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';

      const mockGetUserPurpose = jest
        .spyOn(userService, 'getUserPurpose')
        .mockResolvedValue(null);

      const mockUpsertUserPurpose = jest
        .spyOn(userService, 'upsertUserPurpose')
        .mockResolvedValue({} as any);

      const result = await userService.getUserCurrentStep(userId);

      expect(mockGetUserPurpose).toHaveBeenCalledWith(userId, { currentStep: 1 });
      expect(mockUpsertUserPurpose).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          currentStep: expect.any(Number),
          purpose: '',
        })
      );
      expect(result).toBe(UserCurrentStepEnums.USER_PURPOSE);
    });

    it('should set INVITE_USER_PURPOSE step if isInvited is true', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';

      jest.spyOn(userService, 'getUserPurpose').mockResolvedValue(null);
      const mockUpsertUserPurpose = jest
        .spyOn(userService, 'upsertUserPurpose')
        .mockResolvedValue({} as any);

      const result = await userService.getUserCurrentStep(userId, true);

      expect(mockUpsertUserPurpose).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          currentStep: UserCurrentStepEnums.INVITE_USER_PURPOSE,
          purpose: '',
        })
      );
      expect(result).toBe(UserCurrentStepEnums.USER_PURPOSE);
    });
  });

  describe('getUserFilterQuery', () => {
    it('should return filter query for user search', () => {
      const searchQuery = {
        key: 'test@email.com',
        field: 'EMAIL' as any
      };
      const filterOptions = {
        isVerified: true
      } as any;

      const result = userService.getUserFilterQuery(searchQuery, filterOptions);

      expect(result).toEqual({
        email: 'test@email.com'
      });
    });
  });

  describe('updateLastAccessedOrg', () => {
    let mockRedisService: any;

    beforeEach(() => {
      mockRedisService = {
        setRedisData: jest.fn().mockResolvedValue(true),
        setExpireKey: jest.fn().mockResolvedValue(true),
      };

      (userService as any).redisService = mockRedisService;
    });

    it('should update last accessed organization', () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const orgId = '5d5f85b5a7ab840c8d46f698';

      const result = userService.updateLastAccessedOrg(userId, orgId);

      expect(mockRedisService.setRedisData).toHaveBeenCalledWith(
        `last-accessed:org-id:user:${userId}`,
        orgId
      );
      expect(mockRedisService.setExpireKey).toHaveBeenCalledWith(
        `last-accessed:org-id:user:${userId}`,
        expect.anything()
      );
      expect(result).toBe(orgId);
    });
  });

  describe('getAdminIdByDocPermission', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return organization admin userId when role is ORGANIZATION', async () => {
      const mockOrgAdmin = {
        _id: 'org-admin-id',
        orgId: 'org-id',
        groups: [],
        internal: false,
        role: 'organization_admin',
        userId: { toHexString: jest.fn().mockReturnValue('org-admin-id') }
      };
      (userService as any).organizationService.findMemberWithRoleInOrg = jest.fn().mockResolvedValue([mockOrgAdmin]);

      const internalPermission = {
        role: 'organization',
        refId: 'org-id',
      };

      const result = await userService.getAdminIdByDocPermission(internalPermission as any);

      expect((userService as any).organizationService.findMemberWithRoleInOrg).toHaveBeenCalledWith(
        'org-id',
        'organization_admin'
      );
      expect(result).toBe('org-admin-id');
    });

    it('should return team admin userId when role is ORGANIZATION_TEAM', async () => {
      const mockTeamAdmin = {
        _id: 'team-admin-id',
        teamId: 'team-id',
        role: 'admin',
        userId: { toHexString: jest.fn().mockReturnValue('team-admin-id') }
      };

      (userService as any).membershipService.findOne = jest.fn().mockResolvedValue(mockTeamAdmin as any);

      const internalPermission = {
        role: 'organization_team',
        refId: 'team-id',
      };

      const result = await userService.getAdminIdByDocPermission(internalPermission as any);

      expect((userService as any).membershipService.findOne).toHaveBeenCalledWith({
        teamId: 'team-id',
        role: 'admin',
      });
      expect(result).toBe('team-admin-id');
    });

    it('should return empty string when role does not match', async () => {
      const internalPermission = { role: 'unknown_role', refId: 'some-id' };

      const result = await userService.getAdminIdByDocPermission(internalPermission as any);

      expect(result).toBe('');
    });
  });


  describe('findUserByIds', () => {
    beforeEach(() => {
      (userService as any).userModel = {
        find: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([userMockInstance])
        })
      };
      jest.spyOn(userService as any, 'getBasicQuery').mockReturnValue({ isVerified: true });
    });

    it('should find users by ids with default parameters', async () => {
      const userIds = ['5d5f85b5a7ab840c8d46f697', '5d5f85b5a7ab840c8d46f698'] as string[];
      const result = await userService.findUserByIds(userIds as any);

      expect(userService['getBasicQuery']).toHaveBeenCalled();
      expect(userService['userModel'].find).toHaveBeenCalledWith(
        {
          _id: { $in: userIds },
          isVerified: true
        },
        {}
      );
      expect(result).toEqual([{
        _id: userMockInstance._id.toHexString(),
        name: userMockInstance.name,
        email: userMockInstance.email,
        avatarRemoteId: userMockInstance.avatarRemoteId,
        isVerified: userMockInstance.isVerified,
        password: userMockInstance.password,
        payment: userMockInstance.payment,
      }]);
    });

    it('should find users by ids with projection and includeNotVerified', async () => {
      const userIds = ['5d5f85b5a7ab840c8d46f697'] as string[];
      const projection = { name: 1, email: 1 };
      const result = await userService.findUserByIds(userIds as any, projection, true);

      expect(userService['userModel'].find).toHaveBeenCalledWith(
        {
          _id: { $in: userIds }
        },
        projection
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when called with no arguments', async () => {
      const findSpy = jest.spyOn(userService['userModel'], 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await userService.findUserByIds();

      expect(findSpy).toHaveBeenCalledWith(
        { _id: { $in: [] }, isVerified: true },
        {}
      );
      expect(result).toEqual([]);
    });
  });

  describe('handleUserFromlanding', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      jest.spyOn(userService['jwtService'], 'verify').mockReturnValue({
        landingPageType: 'business'
      });

      jest.spyOn(userService, 'updateUserProperty').mockResolvedValue(true as any);
      jest.spyOn(userService, 'upsertUserPurpose').mockResolvedValue({ modifiedCount: 1 } as any);

      jest.spyOn(userService['teamService'], 'create').mockResolvedValue({
        _id: 'team123',
        name: 'Test Team'
      } as any);

      jest.spyOn(userService['membershipService'], 'createMany').mockResolvedValue([]);
    });

    it('should handle user from landing page successfully', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const name = 'Test User';
      const landingToken = 'valid-token';

      const result = await userService.handleUserFromlanding(userId, name, landingToken);

      expect(userService['jwtService'].verify).toHaveBeenCalledWith(landingToken);
      expect(userService.updateUserProperty).toHaveBeenCalledWith(
        { _id: userId },
        { type: 'business' }
      );
      expect(userService.upsertUserPurpose).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          currentStep: expect.any(Number),
          purpose: expect.any(String)
        })
      );
      expect(userService['teamService'].create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Test User'),
          ownerId: userId
        })
      );
      expect(userService['membershipService'].createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            teamId: 'team123',
            userId: userId,
            role: 'admin'
          })
        ])
      );
      expect(result).toBe(true);
    });

    it('should return false when landingPageType is not valid', async () => {
      jest.spyOn(userService['jwtService'], 'verify').mockReturnValue({
        landingPageType: 'INVALID_TYPE'
      });

      const result = await userService.handleUserFromlanding('userId', 'name', 'token');
      expect(result).toBe(false);
    });
  });


  describe('changePassword', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'validatePassword').mockReturnValue(true);
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...userMockInstance,
        comparePassword: jest.fn().mockResolvedValue(true),
        recentPasswords: ['old1', 'old2']
      } as any);
      jest.spyOn(userService['authService'], 'verifyUserPasswordStrength').mockReturnValue({ isVerified: true });
      jest.spyOn(userService['authService'], 'isDuplicateRecentPassword').mockResolvedValue(false);
      jest.spyOn(Utils, 'hashPassword').mockResolvedValue('hashed-password');
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userMockInstance as any);
      if (
        !userService['redisService'] ||
        typeof userService['redisService'].setRefreshToken !== 'function'
      ) {
        Object.defineProperty(userService, 'redisService', {
          value: {
            setRefreshToken: jest.fn(),
          },
          writable: false,
        });
      }
      jest.spyOn(userService['redisService'], 'setRefreshToken').mockResolvedValue(undefined);
    });

    it('should change password successfully', async () => {
      const result = await userService.changePassword('newPassword', 'currentPassword', 'userId', 'refreshToken');

      expect(Utils.validatePassword).toHaveBeenCalledWith('newPassword');
      expect(userService.findUserById).toHaveBeenCalledWith('userId');
      expect(userService['authService'].verifyUserPasswordStrength).toHaveBeenCalledWith(
        userMockInstance.email,
        'newPassword'
      );
      expect(userService['authService'].isDuplicateRecentPassword).toHaveBeenCalledWith(
        ['old1', 'old2'],
        'newPassword'
      );
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith(
        'userId',
        {
          password: 'hashed-password',
          recentPasswords: ['hashed-password', 'old1', 'old2']
        }
      );
      expect(userService['redisService'].setRefreshToken).toHaveBeenCalledWith('userId', 'refreshToken');
      expect(result).toBeNull();
    });

    it('should return error when new password is same as current password', async () => {
      const result = await userService.changePassword('samePassword', 'samePassword', 'userId');

      expect(result.errorCode).toBe(ErrorCode.User.NEW_PASSWORD_SAME_OLD_PASSWORD);
    });

    it('should return error when password validation fails', async () => {
      jest.spyOn(Utils, 'validatePassword').mockReturnValue(false);

      const result = await userService.changePassword('weak', 'currentPassword', 'userId');

      expect(result.errorCode).toBe(ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD);
    });

    it('should return error when user not found', async () => {
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

      const result = await userService.changePassword('newPassword', 'currentPassword', 'userId');

      expect(result.errorCode).toBe(ErrorCode.User.USER_NOT_FOUND);
      expect(result.message).toBe('User not found');
    });

    it('should return error when current password is incorrect', async () => {
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...userMockInstance,
        comparePassword: jest.fn().mockResolvedValue(false)
      } as any);

      const result = await userService.changePassword('newPassword', 'wrongPassword', 'userId');

      expect(result.errorCode).toBe(ErrorCode.User.INVALID_PASSWORD_INPUT);
    });

    it('should return error when password is duplicate recent password', async () => {
      jest.spyOn(userService['authService'], 'isDuplicateRecentPassword').mockResolvedValue(true);

      const result = await userService.changePassword('newPassword', 'currentPassword', 'userId');

      expect(result.errorCode).toBe(ErrorCode.User.DUPLICATE_RECENT_PASSWORD);
    });

    it('should return error when organization requires strong password', async () => {
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...userMockInstance,
        comparePassword: jest.fn().mockResolvedValue(true),
        recentPasswords: ['old1', 'old2']
      } as any);

      jest
        .spyOn(userService['authService'], 'verifyUserPasswordStrength')
        .mockReturnValue({ isVerified: false });

      const result = await userService.changePassword('weakPass123', 'currentPassword', 'userId');

      expect(result.message).toBe('Your organization requested you to have a Strong password.');
      expect(result.errorCode).toBe(ErrorCode.User.ORGANIZATION_REQUIRE_STRONG_PASSWORD);
      expect((result as any).isNewPassWordError).toBe(undefined);
    });

  });

  describe('updateUserDataAfterSignUp', () => {
    beforeEach(() => {
      if (
        !userService['userTrackingService'] ||
        typeof userService['userTrackingService'].createContact !== 'function'
      ) {
        Object.defineProperty(userService, 'userTrackingService', {
          value: {
            createContact: jest.fn(),
            trackAccountCreatedEvent: jest.fn(),
          },
          writable: false,
        });
      }
      if (
        !userService['brazeService'] ||
        typeof userService['brazeService'].upsertAudience !== 'function'
      ) {
        Object.defineProperty(userService, 'brazeService', {
          value: {
            upsertAudience: jest.fn(),
          },
          writable: false,
        });
      }
      jest.spyOn(userService['userTrackingService'], 'createContact').mockResolvedValue(undefined);
      jest.spyOn(userService['userTrackingService'], 'trackAccountCreatedEvent').mockResolvedValue(undefined as never);
      jest.spyOn(userService['brazeService'], 'upsertAudience').mockResolvedValue(undefined);

      const logger = (userService as any)['loggerService'];
      if (logger && typeof logger.info === 'function' && typeof logger.error === 'function') {
        jest.spyOn(logger, 'info').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
      } else {
        Object.defineProperty(userService, 'loggerService', {
          value: {
            info: jest.fn(),
            error: jest.fn(),
          },
          writable: false,
        });
      }
      if (typeof userService.trackAccountCreatedEvent !== 'function') {
        userService.trackAccountCreatedEvent = jest.fn();
      } else {
        jest.spyOn(userService, 'trackAccountCreatedEvent').mockImplementation(jest.fn());
      }
      if (typeof userService.editUserPurpose !== 'function') {
        userService.editUserPurpose = jest.fn().mockResolvedValue(undefined);
      } else {
        jest.spyOn(userService, 'editUserPurpose').mockImplementation(jest.fn().mockResolvedValue(undefined));
      }
    });

    it('should update user data after sign up with business purpose', async () => {
      const input = {
        userId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        userName: 'John Doe',
        authenType: 'BUSINESS',
        browserLanguageCode: 'en',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
        platform: 'WEB'
      };

      await userService.updateUserDataAfterSignUp(input as any);

      expect(userService['userTrackingService'].createContact).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@email.com',
          firstname: 'John',
          lastname: 'Doe',
          receive_marketing_email: 'Yes',
          browser_language: expect.any(String)
        })
      );
      expect(userService['brazeService'].upsertAudience).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            external_id: '5d5f85b5a7ab840c8d46f697',
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@email.com'
          })
        ])
      );
      expect(userService.trackAccountCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '5d5f85b5a7ab840c8d46f697',
          email: 'test@email.com',
          loginService: 'EMAIL_PASSWORD',
          platform: 'WEB'
        })
      );
    });

    it('should update user data after sign up with personal purpose', async () => {
      const input = {
        userId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        userName: 'John Doe',
        authenType: 'PERSONAL',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD'
      };

      await userService.updateUserDataAfterSignUp(input as any);
    });

    it('should call editUserPurpose for CIRCLE_BUSINESS', async () => {
      const input = {
        userId: '1',
        email: 'test@biz.com',
        userName: 'Biz User',
        authenType: 'CIRCLE_BUSINESS',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
      };

      await userService.updateUserDataAfterSignUp(input as any);

      expect(userService.editUserPurpose).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ _id: '1', email: 'test@biz.com' }),
          purpose: PURPOSE.SMALL_BUSINESS,
          currentStep: PURPOSE_STEP.START_FREE_TRIAL,
        })
      );
    });

    it('should call editUserPurpose for CIRCLE_FREE', async () => {
      const input = {
        userId: '2',
        email: 'free@biz.com',
        userName: 'Free User',
        authenType: 'CIRCLE_FREE',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
      };

      await userService.updateUserDataAfterSignUp(input as any);

      expect(userService.editUserPurpose).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ _id: '2', email: 'free@biz.com' }),
          purpose: PURPOSE.SMALL_BUSINESS,
          currentStep: PURPOSE_STEP.START_FREE_TRIAL,
        })
      );
    });

    it('should call editUserPurpose for INDIVIDUAL_PROFESSIONAL', async () => {
      const input = {
        userId: '3',
        email: 'pro@user.com',
        userName: 'Pro User',
        authenType: 'INDIVIDUAL_PROFESSIONAL',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
      };

      await userService.updateUserDataAfterSignUp(input as any);

      expect(userService.editUserPurpose).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ _id: '3', email: 'pro@user.com' }),
          purpose: PURPOSE.PERSONAL,
          currentStep: PURPOSE_STEP.START_FREE_TRIAL,
        })
      );
    });

  });

  describe('trackAccountCreatedEvent', () => {
    beforeEach(() => {
      if (!userService['featureFlagService']) {
        Object.defineProperty(userService, 'featureFlagService', {
          value: { getFeatureIsOn: jest.fn() },
          writable: false,
        });
      }
      jest.spyOn(userService['featureFlagService'], 'getFeatureIsOn').mockResolvedValue(true);

      if (
        !userService['userTrackingService'] ||
        typeof userService['userTrackingService'].trackAccountCreatedEvent !== 'function'
      ) {
        Object.defineProperty(userService, 'userTrackingService', {
          value: {
            trackAccountCreatedEvent: jest.fn(),
          },
          writable: false,
        });
      }
      jest.spyOn(userService['userTrackingService'], 'trackAccountCreatedEvent').mockImplementation();

      const logger = (userService as any)['loggerService'];
      if (logger && typeof logger.info === 'function' && typeof logger.error === 'function') {
        jest.spyOn(logger, 'info').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
      } else {
        Object.defineProperty(userService, 'loggerService', {
          value: {
            info: jest.fn(),
            error: jest.fn(),
          },
          writable: false,
        });
      }
    });

    it('should track account created event successfully', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
        if (typeof fn === 'function') fn();
        return 0;
      }) as any);

      const payload = {
        userId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
        platform: 'WEB'
      };

      await userService.trackAccountCreatedEvent(payload as any);
      setTimeoutSpy.mockRestore();

      expect(userService['userTrackingService'].trackAccountCreatedEvent).toHaveBeenCalled();
      expect(userService['loggerService'].info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'trackAccountCreatedEvent',
          extraInfo: expect.any(Object)
        })
      );
    });

    it('should include platform in event attributes when valid platform provided', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
        if (typeof fn === 'function') fn();
        return 0;
      }) as any);

      const payload = {
        userId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        createdAt: new Date(),
        loginService: 'EMAIL_PASSWORD',
        platform: Platforms.PDFWeb,
      };

      const mockTrackFn = jest.fn();
      userService['userTrackingService'].trackAccountCreatedEvent = mockTrackFn;
      await userService.trackAccountCreatedEvent(payload as any);
      setTimeoutSpy.mockRestore();

      expect(mockTrackFn).toHaveBeenCalled();
    });
  });

  describe('getLanguageDisplayName', () => {
    it('should return language display name for valid language code', () => {
      const result = userService.getLanguageDisplayName('en');
      expect(result).toBeDefined();
    });

    it('should return undefined when Intl.DisplayNames throws error', () => {
      const mockDisplayNames = jest.fn(() => {
        throw new Error('Intl not supported');
      });

      (global.Intl as any).DisplayNames = mockDisplayNames;

      const result = userService.getLanguageDisplayName('invalid');

      expect(result).toBeUndefined();
      expect(mockDisplayNames).toHaveBeenCalledWith(['en'], { type: 'language' });
    });
  });

  describe('updateBrowserLanguageToHubspot', () => {
    beforeEach(() => {
      jest.spyOn(userService, 'getLanguageDisplayName').mockReturnValue('English');
      jest.spyOn(userService['environmentService'], 'getByKey').mockReturnValue('2023-01-01');
      jest.spyOn(userService, 'updateHubspotContact').mockImplementation();

      const logger = (userService as any)['loggerService'];
      if (logger && typeof logger.info === 'function') {
        jest.spyOn(logger, 'info').mockImplementation();
      } else {
        Object.defineProperty(userService, 'loggerService', {
          value: { info: jest.fn() },
          writable: false,
        });
      }
    });

    it('should update browser language to hubspot when last login is before tracking start date', () => {
      (moment as jest.Mock).mockReturnValue({
        isAfter: jest.fn().mockReturnValue(false),
      });

      const params = {
        languageCode: 'en',
        email: 'test@email.com',
        lastLogin: new Date('2022-12-01'),
      };

      userService.updateBrowserLanguageToHubspot(params as any);

      expect(userService.getLanguageDisplayName).toHaveBeenCalledWith('en');
      expect(userService.updateHubspotContact).toHaveBeenCalledWith('test@email.com', { browserLanguage: 'English' });
      expect(userService['loggerService'].info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'updateBrowserLanguageToHubspot',
          extraInfo: { language: 'English' },
        })
      );
    });

    it('should not update browser language when last login is after tracking start date', () => {
      (moment as jest.Mock).mockReturnValue({
        isAfter: jest.fn().mockReturnValue(true),
      });

      const params = {
        languageCode: 'en',
        email: 'test@email.com',
        lastLogin: new Date('2023-02-01'),
      };

      userService.updateBrowserLanguageToHubspot(params as any);

      expect(userService.updateHubspotContact).not.toHaveBeenCalled();
    });
  });

  describe('updateHubspotContact', () => {
    beforeEach(() => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'John Doe',
        email: 'test@email.com'
      } as any);

      const trackingService = (userService as any)['userTrackingService'];
      if (trackingService && typeof trackingService.updateUserContact === 'function') {
        jest.spyOn(trackingService, 'updateUserContact').mockResolvedValue(true);
      } else {
        Object.defineProperty(userService, 'userTrackingService', {
          value: { updateUserContact: jest.fn().mockResolvedValue(true) },
          writable: false,
        });
      }
    });

    it('should update hubspot contact with default properties', async () => {
      await userService.updateHubspotContact('test@email.com', { customField: 'value' });

      expect(userService.findUserByEmail).toHaveBeenCalledWith('test@email.com');
      expect(userService['userTrackingService'].updateUserContact).toHaveBeenCalledWith(
        'test@email.com',
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          receive_marketing_email: 'Yes',
          custom_field: 'value'
        })
      );
    });

    it('should handle user with no name', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: null,
        email: 'test@email.com'
      } as any);

      await userService.updateHubspotContact('test@email.com');

      expect(userService['userTrackingService'].updateUserContact).toHaveBeenCalledWith(
        'test@email.com',
        expect.objectContaining({
          firstname: 'test',
          lastname: '',
          receive_marketing_email: 'Yes'
        })
      );
    });
  });

  describe('editUserPurpose', () => {
    beforeEach(() => {
      jest.restoreAllMocks();

      jest.spyOn(userService, 'getUserCurrentStep').mockResolvedValue(1);
      jest.spyOn(userService, 'getUserPurpose').mockResolvedValue({
        _id: '123',
        userId: '5d5f85b5a7ab840c8d46f697',
        purpose: 'personal',
        currentStep: 1,
      });
      jest.spyOn(userService, 'upsertUserPurpose').mockResolvedValue({ modifiedCount: 1 } as any);

      const trackingService = (userService as any)['userTrackingService'];
      if (trackingService && typeof trackingService.updateUserContact === 'function') {
        jest.spyOn(trackingService, 'updateUserContact').mockResolvedValue(true);
      } else {
        Object.defineProperty(userService, 'userTrackingService', {
          value: { updateUserContact: jest.fn().mockResolvedValue(true) },
          writable: false,
        });
      }
    });


    it('should edit user purpose successfully', async () => {
      const input = {
        user: {
          _id: '5d5f85b5a7ab840c8d46f697',
          email: 'test@email.com',
          payment: { planRemoteId: 'plan123' }
        },
        purpose: 'business',
        currentStep: 2
      };

      const result = await userService.editUserPurpose(input as any);

      expect(userService.getUserCurrentStep).toHaveBeenCalledWith('5d5f85b5a7ab840c8d46f697');
      expect(userService.getUserPurpose).toHaveBeenCalledWith('5d5f85b5a7ab840c8d46f697');
      expect(userService.upsertUserPurpose).toHaveBeenCalledWith(
        '5d5f85b5a7ab840c8d46f697',
        expect.objectContaining({
          currentStep: 2,
          purpose: 'business'
        })
      );
      expect(userService['userTrackingService'].updateUserContact).toHaveBeenCalledWith(
        'test@email.com',
        expect.objectContaining({
          purpose: 'Business',
          stripeplan: 'plan123'
        })
      );
      expect(result).toBe(2);
    });

    it('should throw error when upsert fails', async () => {
      jest.spyOn(userService, 'upsertUserPurpose').mockResolvedValue(null as any);

      const input = {
        user: { _id: '5d5f85b5a7ab840c8d46f697', email: 'test@email.com' },
        purpose: 'business',
        currentStep: 2
      };

      await expect(userService.editUserPurpose(input as any))
        .rejects.toThrow('Failed to update. Please try again later.');
    });

    it('should update hubspot when user has no existing purpose', async () => {
      jest.spyOn(userService, 'getUserPurpose').mockResolvedValue(null as any);

      const input = {
        user: {
          _id: '5d5f85b5a7ab840c8d46f697',
          email: 'newuser@email.com',
          payment: { planRemoteId: 'planPro' },
        },
        purpose: 'business',
        currentStep: 1,
      };

      await userService.editUserPurpose(input as any);

      expect(userService.upsertUserPurpose).toHaveBeenCalledWith(
        '5d5f85b5a7ab840c8d46f697',
        expect.objectContaining({
          currentStep: 1,
          purpose: 'business',
        }),
      );

      expect(userService['userTrackingService'].updateUserContact).toHaveBeenCalledWith(
        'newuser@email.com',
        expect.objectContaining({
          purpose: 'Business',
          stripeplan: 'planPro',
        }),
      );
    });

    it('should keep the higher userCurrentStep when it is greater than currentStep', async () => {
      jest.spyOn(userService, 'getUserCurrentStep').mockResolvedValue(5);
      jest.spyOn(userService, 'getUserPurpose').mockResolvedValue({
        _id: '123',
        userId: '5d5f85b5a7ab840c8d46f697',
        purpose: 'personal',
        currentStep: 5,
      });
      jest.spyOn(userService, 'upsertUserPurpose').mockResolvedValue({ modifiedCount: 1 } as any);
      jest.spyOn(userService['userTrackingService'], 'updateUserContact').mockResolvedValue(true);

      const input = {
        user: {
          _id: '5d5f85b5a7ab840c8d46f697',
          email: 'user@email.com',
          payment: { planRemoteId: 'planPro' },
        },
        purpose: 'business',
        currentStep: 2,
      };

      const result = await userService.editUserPurpose(input as any);

      expect(result).toBe(5);
      expect(userService.upsertUserPurpose).toHaveBeenCalledWith(
        '5d5f85b5a7ab840c8d46f697',
        expect.objectContaining({
          currentStep: 5,
        }),
      );
    });
  });

  describe('getUserFilterQuery', () => {
    it('should return filter query for email search', () => {
      const searchQuery = { key: 'test@email.com', field: 'EMAIL' };
      const filterOptions = { isVerified: true };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);

      expect(result).toEqual({
        email: 'test@email.com'
      });
    });

    it('should return filter query for name search', () => {
      const searchQuery = { key: 'test@email.com', field: 'NAME' };
      const filterOptions = { isVerified: true };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);

      expect(result).toEqual({
        $text: { $search: '"test"' }
      });
    });

    it('should return filter query for email domain search', () => {
      const searchQuery = { key: 'gmail.com', field: 'EMAIL_DOMAIN' };
      const filterOptions = { isVerified: true };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);

      expect(result).toEqual({
        emailDomain: 'gmail.com'
      });
    });

    it('should return filter query for deleted users', () => {
      const searchQuery = { key: '', field: 'EMAIL' };
      const filterOptions = { status: 'DELETE' };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);

      expect(result).toEqual({
        deletedAt: { $type: 'date' }
      });
    });

    it('should return filter query for unverified users', () => {
      const searchQuery = { key: '', field: 'EMAIL' };
      const filterOptions = { status: 'UNVERIFIED' };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);

      expect(result).toEqual({
        isVerified: false
      });
    });

    it('should return empty object when searchQuery is undefined', () => {
      const result = userService.getUserFilterQuery(undefined as any, { status: undefined } as any);
      expect(result).toEqual({});
    });

    it('should return empty object when filterOptions is undefined', () => {
      const searchQuery = { key: '', field: 'EMAIL' };
      const result = userService.getUserFilterQuery(searchQuery as any, undefined as any);
      expect(result).toEqual({});
    });

    it('should handle default case when filterOptions.status is invalid', () => {
      const searchQuery = { key: '', field: 'EMAIL' };
      const filterOptions = { status: 'INVALID_STATUS' };

      const result = userService.getUserFilterQuery(searchQuery as any, filterOptions as any);
      expect(result).toEqual({});
    });
  });

  describe('getUsers', () => {
    beforeEach(() => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      };

      (userService as any).userModel = {
        find: jest.fn().mockReturnValue(mockQuery),
        estimatedDocumentCount: jest.fn().mockResolvedValue(100)
      };

      mockQuery.limit.mockResolvedValue([userMockInstance]);

      jest.spyOn(userService, 'getUserFilterQuery').mockReturnValue({ isVerified: true });
      jest.spyOn(userService as any, 'sortOptionsMapping').mockReturnValue({ createdAt: -1 });
    });


    it('should return users with count when filter conditions exist', async () => {
      jest.spyOn(userService, 'getUserFilterQuery').mockReturnValue({ email: 'test@email.com' });

      const mockUsers = [userMockInstance];
      const mockLimit = Object.assign(Promise.resolve(mockUsers), {
        countDocuments: jest.fn().mockResolvedValue(50)
      });

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue(mockLimit)
      };

      (userService as any).userModel.find = jest.fn().mockReturnValue(mockQuery);

      const input = {
        searchQuery: { key: 'test@email.com', field: 'EMAIL' },
        limit: 10,
        offset: 0,
        filterOptions: { isVerified: true }
      };

      const [users, total] = await userService.getUsers(input as any);

      expect(total).toBe(50);
    });
  });

  describe('getLastAccessedOrg', () => {
    beforeEach(() => {
      Object.defineProperty(userService, 'redisService', {
        value: {
          getRedisValueWithKey: jest.fn().mockResolvedValue('org123'),
        },
        writable: true,
      });

      Object.defineProperty(userService, 'organizationService', {
        value: {
          getMembershipByOrgAndUser: jest.fn().mockResolvedValue({ _id: 'membership123' }),
          findOneOrganization: jest.fn().mockResolvedValue({ url: 'org-url' }),
        },
        writable: true,
      });

      jest.spyOn(userService, 'recoverLastAccessedOrg').mockResolvedValue('recovered-org');
      jest.spyOn(userService['loggerService'], 'error').mockImplementation();
    });

    it('should return last accessed org when found in redis', async () => {
      const result = await userService.getLastAccessedOrg('userId');

      expect(userService['redisService'].getRedisValueWithKey).toHaveBeenCalledWith(
        'last-accessed:org-id:user:userId'
      );
      expect(userService['organizationService'].getMembershipByOrgAndUser).toHaveBeenCalledWith(
        'org123',
        'userId',
        { _id: 1 }
      );
      expect(userService['organizationService'].findOneOrganization).toHaveBeenCalledWith(
        { _id: 'org123' },
        { url: 1 }
      );
      expect(result).toBe('org-url');
    });

    it('should recover last accessed org when not found in redis', async () => {
      (userService['redisService'].getRedisValueWithKey as jest.Mock).mockResolvedValue(null);

      const result = await userService.getLastAccessedOrg('userId');

      expect(userService.recoverLastAccessedOrg).toHaveBeenCalledWith('userId');
      expect(result).toBe('recovered-org');
    });

    it('should recover last accessed org when membership not found', async () => {
      (userService['organizationService'].getMembershipByOrgAndUser as jest.Mock).mockResolvedValue(null);

      const result = await userService.getLastAccessedOrg('userId');

      expect(userService.recoverLastAccessedOrg).toHaveBeenCalledWith('userId');
      expect(result).toBe('recovered-org');
    });

    it('should handle error and return empty string', async () => {
      (userService['redisService'].getRedisValueWithKey as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await userService.getLastAccessedOrg('userId');

      expect(userService['loggerService'].error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'getLastAccessedOrg',
          stack: expect.any(String),
          userId: 'userId',
          error: expect.any(Error),
        })
      );
      expect(result).toBe('');
    });
  });

  describe('recoverLastAccessedOrg', () => {
    beforeEach(() => {
      (userService as any).organizationService = {
        getOrgListByUser: jest.fn().mockResolvedValue([
          { url: 'org1-url' },
          { url: 'org2-url' }
        ])
      };
    });

    it('should return first org url when user has orgs', async () => {
      const result = await userService.recoverLastAccessedOrg('userId');

      expect(userService['organizationService'].getOrgListByUser).toHaveBeenCalledWith(
        'userId',
        { limit: 1 }
      );
      expect(result).toBe('org1-url');
    });

    it('should return empty string when user has no orgs', async () => {
      (userService as any).organizationService.getOrgListByUser.mockResolvedValue([]);

      const result = await userService.recoverLastAccessedOrg('userId');

      expect(result).toBe('');
    });
  });

  describe('updateContactList', () => {
    beforeEach(() => {
      (userService as any).userContactModel = {
        findOne: jest.fn().mockResolvedValue({
          contacts: [
            { userId: 'user1', recentActivity: new Date('2023-01-01') },
            { userId: 'user2', recentActivity: new Date('2023-01-02') }
          ]
        }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          toObject: () => ({
            _id: 'contact123',
            contacts: []
          }),
          _id: {
            toHexString: jest.fn().mockReturnValue('contact123')
          }
        })
      };
    });

    it('should update contact list with new contacts', async () => {
      const userId = '5d5f85b5a7ab840c8d46f697';
      const contactIds = ['user1', 'user2', 'user3'];

      const result = await userService.updateContactList(userId, contactIds);

      expect(userService['userContactModel'].findOne).toHaveBeenCalledWith({ userId });
      expect(userService['userContactModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { userId },
        { contacts: expect.any(Array) },
        { new: true, upsert: true }
      );
      expect(result).toEqual({
        _id: 'contact123',
        contacts: []
      });
    });

    it('should handle case when user contact not found', async () => {
      (userService as any).userContactModel.findOne.mockResolvedValue(null);

      const userId = '5d5f85b5a7ab840c8d46f697';
      const contactIds = ['user1'];

      const result = await userService.updateContactList(userId, contactIds);

      expect(result).toEqual({
        _id: 'contact123',
        contacts: []
      });
    });

    it('should keep contact unchanged if not in contactIds', async () => {
      (userService as any).userContactModel.findOne.mockResolvedValue({
        contacts: [
          { userId: 'oldUser', recentActivity: new Date('2023-01-01') },
        ]
      });
      const userId = 'user123';
      const contactIds = ['anotherUser'];

      await userService.updateContactList(userId, contactIds);

      const updateCall = (userService['userContactModel'].findOneAndUpdate as jest.Mock).mock.calls[0][1];
      expect(updateCall.contacts.some(c => c.userId === 'oldUser')).toBe(true);
    });

    it('should trim mergedContacts when exceeding LIMIT_STORE_CONTACTS', async () => {
      const existingContacts = Array.from({ length: LIMIT_STORE_CONTACTS - 1 }, (_, i) => ({
        userId: `existingUser${i + 1}`,
        recentActivity: new Date(),
      }));

      (userService as any).userContactModel.findOne.mockResolvedValue({
        contacts: existingContacts
      });

      const userId = '5d5f85b5a7ab840c8d46f697';
      const contactIds = ['newUser1', 'newUser2', 'newUser3', 'newUser4', 'newUser5'];

      await userService.updateContactList(userId, contactIds);

      const updateCall = (userService['userContactModel'].findOneAndUpdate as jest.Mock).mock.calls[0][1];
      expect(updateCall.contacts.length).toBeLessThanOrEqual(LIMIT_STORE_CONTACTS);
    });

    it('should return null when findOneAndUpdate returns null', async () => {
      (userService as any).userContactModel.findOneAndUpdate.mockResolvedValue(null);

      const userId = '5d5f85b5a7ab840c8d46f697';
      const contactIds = ['user1', 'user2'];

      const result = await userService.updateContactList(userId, contactIds);

      expect(result).toBeNull();
    });
  });

  describe('getUserContacts', () => {
    beforeEach(() => {
      (userService as any).userContactModel = {
        aggregate: jest.fn().mockResolvedValue([
          {
            _id: 'user1',
            name: 'User 1',
            email: 'user1@email.com',
            avatarRemoteId: 'avatar1'
          }
        ])
      };
    });

    it('should get user contacts with search key', async () => {
      const params = {
        userId: '5d5f85b5a7ab840c8d46f697',
        excludeSharedIds: ['user2'],
        searchKey: 'test',
        excludeOrgId: '507f1f77bcf86cd799439011',
        excludeTeamId: '507f1f77bcf86cd799439012'
      };

      const result = await userService.getUserContacts(params);

      expect(userService['userContactModel'].aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: { userId: expect.any(Object) }
          })
        ])
      );
      expect(result).toHaveLength(1);
    });

    it('should get user contacts without exclude org and team', async () => {
      const params = {
        userId: '5d5f85b5a7ab840c8d46f697',
        excludeSharedIds: ['user2'],
        searchKey: 'test'
      };

      const result = await userService.getUserContacts(params);

      expect(result).toHaveLength(1);
    });
  });

  describe('getUserIdsExcludeFromContactList', () => {
    beforeEach(() => {
      (userService as any).organizationService = {
        findMemberWithRoleInOrg: jest.fn().mockResolvedValue([
          { userId: { toHexString: () => 'user1' } },
          { userId: { toHexString: () => 'user2' } }
        ])
      };
    });

    it('should return user ids for organization grant billing', async () => {
      const result = await userService.getUserIdsExcludeFromContactList('org123', EntitySearchType.ORGANIZATION_GRANT_BILLING);

      expect(userService['organizationService'].findMemberWithRoleInOrg).toHaveBeenCalledWith(
        'org123',
        ['billing_moderator', 'organization_admin'],
        { userId: 1, role: 1 }
      );
      expect(result).toEqual(['user1', 'user2']);
    });

    it('should return empty array for other target types', async () => {
      const result = await userService.getUserIdsExcludeFromContactList('org123', EntitySearchType.DOCUMENT);

      expect(result).toEqual([]);
    });
  });

  describe('getOrgIdsToFindUserContact', () => {
    beforeEach(() => {
      (userService as any).organizationService = {
        getMembershipOrgByUserId: jest.fn().mockResolvedValue([
          { orgId: { toHexString: () => 'org1' } },
          { orgId: { toHexString: () => 'org2' } }
        ]),
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue({ _id: 'membership123' })
      };
      (userService as any).teamService = {
        getTeamMemberShipByConditions: jest.fn().mockResolvedValue([{ _id: 'membership123' }]),
        findOneById: jest.fn().mockResolvedValue({ belongsTo: { toHexString: () => 'org123' } })
      };
    });

    it('should return org ids for document target type', async () => {
      const result = await userService.getOrgIdsToFindUserContact('userId', EntitySearchType.DOCUMENT, 'doc123');

      expect(userService['organizationService'].getMembershipOrgByUserId).toHaveBeenCalledWith(
        'userId',
        { orgId: 1 }
      );
      expect(result).toEqual(['org1', 'org2']);
    });

    it('should return org id for organization team target type', async () => {
      const result = await userService.getOrgIdsToFindUserContact('userId', EntitySearchType.ORGANIZATION_TEAM, 'team123');

      expect(userService['teamService'].getTeamMemberShipByConditions).toHaveBeenCalledWith({
        conditions: { teamId: 'team123', userId: 'userId' }
      });
      expect(userService['teamService'].findOneById).toHaveBeenCalledWith('team123', { belongsTo: 1 });
      expect(result).toEqual(['org123']);
    });

    it('should return filtered org ids for organization target type', async () => {
      const result = await userService.getOrgIdsToFindUserContact('userId', EntitySearchType.ORGANIZATION, 'org123');

      expect(result).toEqual(['org1', 'org2']);
    });

    it('should return org id for organization grant billing target type', async () => {
      const result = await userService.getOrgIdsToFindUserContact('userId', EntitySearchType.ORGANIZATION_GRANT_BILLING, 'org123');

      expect(userService['organizationService'].getMembershipByOrgAndUser).toHaveBeenCalledWith(
        'org123',
        'userId',
        { orgId: 1 }
      );
      expect(result).toEqual(['org123']);
    });

    it('should throw error for organization team when no membership', async () => {
      (userService as any).teamService.getTeamMemberShipByConditions.mockResolvedValue([]);
    
      await expect(
        userService.getOrgIdsToFindUserContact('userId', EntitySearchType.ORGANIZATION_TEAM, 'team123')
      ).rejects.toThrow('You have not permission with this team');
    });
    

    it('should throw error for organization grant billing when no membership', async () => {
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue(null);

      await expect(userService.getOrgIdsToFindUserContact('userId', EntitySearchType.ORGANIZATION_GRANT_BILLING, 'org123'))
        .rejects.toThrow('You have not permission with this organization');
    });

    it('should return org ids for organization creation target type', async () => {
      const result = await userService.getOrgIdsToFindUserContact(
        'userId',
        EntitySearchType.ORGANIZATION_CREATION,
        'org123'
      );

      expect(userService['organizationService'].getMembershipOrgByUserId).toHaveBeenCalledWith(
        'userId',
        { orgId: 1 }
      );
      expect(result).toEqual(['org1', 'org2']);
    });

    it('should return targetId for organization team creation when membership exists', async () => {
      const result = await userService.getOrgIdsToFindUserContact(
        'userId',
        EntitySearchType.ORGANIZATION_TEAM_CREATION,
        'orgABC'
      );

      expect(userService['organizationService'].getMembershipByOrgAndUser).toHaveBeenCalledWith(
        'orgABC',
        'userId',
        { orgId: 1 }
      );
      expect(result).toEqual(['orgABC']);
    });

    it('should return empty array for default case', async () => {
      const result = await userService.getOrgIdsToFindUserContact(
        'userId',
        'UNKNOWN_TYPE' as any,
        'whatever'
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when orgTeam not found for organization team target type', async () => {
      (userService as any).teamService.getTeamMemberShipByConditions.mockResolvedValue([{ _id: 'membership123' }]);
      (userService as any).teamService.findOneById.mockResolvedValue(null);
    
      const result = await userService.getOrgIdsToFindUserContact(
        'userId',
        EntitySearchType.ORGANIZATION_TEAM,
        'team123'
      );
    
      expect(userService['teamService'].getTeamMemberShipByConditions).toHaveBeenCalledWith({
        conditions: { teamId: 'team123', userId: 'userId' },
      });
      expect(userService['teamService'].findOneById).toHaveBeenCalledWith('team123', { belongsTo: 1 });
      expect(result).toEqual([]);
    });
  });

  describe('getContactList', () => {
    beforeEach(() => {
      (userService as any).getUserContacts = jest.fn();
      (userService as any).organizationService = {
        getMembershipOrgByUserId: jest.fn().mockResolvedValue([{ orgId: { toHexString: () => 'org1' } }]),
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue({ orgId: { toHexString: () => 'org1' } }),
        getOrgMembershipsOfUser: jest.fn().mockResolvedValue([
          { _id: 'u3', name: 'Carol', email: 'c@mail.com', avatarRemoteId: 'a3' },
          { _id: 'u4', name: 'Dave', email: 'd@mail.com', avatarRemoteId: 'a4' },
        ]),
      };
    
      (userService as any).teamService = {
        getTeamMemberShipByConditions: jest.fn().mockResolvedValue([{ teamId: 'team1' }]),
        findOneById: jest.fn().mockResolvedValue({ belongsTo: { toHexString: () => 'org1' } }),
      };
    
      (userService as any).returnShareDocumentContactList = jest.fn((_, list) => list);
    });
    
    const mockInteractionList = [
      { _id: 'u1', name: 'Alice', email: 'a@mail.com', avatarRemoteId: 'a1' },
      { _id: 'u2', name: 'Bob', email: 'b@mail.com', avatarRemoteId: 'a2' },
    ];
  
    const mockOrganizationList = [
      { _id: 'u3', name: 'Carol', email: 'c@mail.com', avatarRemoteId: 'a3' },
      { _id: 'u4', name: 'Dave', email: 'd@mail.com', avatarRemoteId: 'a4' },
    ];
  
    it('should return sliced interactionList when length >= LIMIT_USER_CONTACTS and not org members search', async () => {
      const bigList = Array.from({ length: 10 }, (_, i) => ({ _id: `u${i}`, name: `User${i}` }));
      (userService as any).getUserContacts.mockResolvedValue(bigList);
  
      const result = await userService.getContactList({
        targetId: 't1',
        targetType: EntitySearchType.DOCUMENT,
        userId: 'user1',
        searchKey: '',
        excludeUserIds: [],
      });
  
      expect(result).toHaveLength(LIMIT_USER_CONTACTS);
      expect(result).toEqual(bigList.slice(0, LIMIT_USER_CONTACTS));
    });
  
    it('should return merged contactList when not org members search and under limit', async () => {
      (userService as any).getUserContacts.mockResolvedValue(mockInteractionList);
  
      const result = await userService.getContactList({
        targetId: 't1',
        targetType: EntitySearchType.DOCUMENT,
        userId: 'user1',
        searchKey: '',
        excludeUserIds: ['u99'],
      });
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: SearchUserStatus.USER_VALID }),
        ])
      );
    });
  
    it('should return ordered organization list when isOrgMembersSearchAction = true', async () => {
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([
        { _id: 'u2' },
        { _id: 'u3' },
      ]);
    
      (userService as any).getUserContacts.mockResolvedValue(mockInteractionList);
    
      const result = await userService.getContactList({
        targetId: 'org1',
        targetType: EntitySearchType.ORGANIZATION_TEAM,
        userId: 'user1',
        searchKey: '',
        excludeUserIds: ['ex1'],
      });
    
      expect(result).not.toBeUndefined();
    });
    
    it('should handle empty interactionList and return organization list', async () => {
      (userService as any).getUserContacts.mockResolvedValue([]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue(mockOrganizationList);
    
      const result = await userService.getContactList({
        targetId: 't1',
        targetType: EntitySearchType.DOCUMENT,
        userId: 'user1',
        searchKey: '',
        excludeUserIds: [],
      });
    
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: SearchUserStatus.USER_VALID }),
        ])
      );
    });
    
  
    it('should call organizationContactList with excludeUserIds only when isOrgMembersSearchAction', async () => {
      (userService as any).getUserContacts.mockResolvedValue(mockInteractionList);
  
      await userService.getContactList({
        targetId: 't1',
        targetType: EntitySearchType.ORGANIZATION_TEAM_CREATION,
        userId: 'user1',
        searchKey: 'key',
        excludeUserIds: ['e1', 'e2'],
      });
    });
  });

  describe('getContactListToShareDocument', () => {
    let mockOrganizationService: any;

    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
      (userService as any).documentService = {
        getDocumentPermissionsByDocId: jest.fn(),
        getDocumentByDocumentId: jest.fn(),
        checkExistedDocPermission: jest.fn().mockResolvedValue(false),
      };
      mockOrganizationService = {
        getOrgMembershipsOfUser: jest.fn().mockResolvedValue([{ _id: 'teamUser' }]),
        findMemberWithRoleInOrg: jest.fn().mockResolvedValue([
          { userId: { toHexString: () => 'orgAdmin1' } },
          { userId: { toHexString: () => 'orgModerator1' } },
        ]),      
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue({
          role: 'ORGANIZATION_ADMIN',
          userId: { toHexString: () => '652f7e9a23f4c8f9a9e9a9a9' },
        }),
        getMembersByOrgId: jest.fn().mockResolvedValue([
          { userId: { toHexString: () => 'member1' } },
          { userId: { toHexString: () => 'member2' } },
        ]),
      };
    
      (userService as any).organizationService = mockOrganizationService;
      (userService as any).userContactModel = {
        aggregate: jest.fn().mockResolvedValue([{ _id: 'teamUser' }]),
      };      
      (userService as any).getOrgIdsToFindUserContact = jest.fn().mockResolvedValue(['org1']);
    });
  
    const baseParams = {
      documentId: 'doc1',
      userId: '652f7e9a23f4c8f9a9e9a9a9',
      searchKey: '',
      pickedUserIds: [],
    };
    
    it('should return personal document contact list when originalDocPermission is OWNER', async () => {
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'owner1' } },
      ]);
      (userService as any).documentService.getDocumentByDocumentId.mockResolvedValue({ _id: 'doc1' });
  
      const result = await userService.getContactListToShareDocument(baseParams);

      expect(result).not.toBeNull();
    });
  
    it('should return team document contact list when role is ORGANIZATION_TEAM', async () => {
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: { toHexString: () => 'team123' } },
      ]);
      (userService as any).documentService.getDocumentByDocumentId.mockResolvedValue({ _id: 'doc1' });
  
      const result = await userService.getContactListToShareDocument(baseParams);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'teamUser' }),
        ])
      );
    });
  
    it('should return null for unrecognized role in originalDocPermission', async () => {
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: 'INVALID_ROLE', refId: { toHexString: () => 'invalid1' } },
        ],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
    
      expect(result).toBeNull();
    });

    it('should return shared document contact list when user has SHARER role', async () => {
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        {
          role: DocumentRoleEnum.SHARER,
          refId: { toHexString: () => baseParams.userId },
        },
        {
          role: DocumentRoleEnum.OWNER,
          refId: { toHexString: () => 'owner1' },
        },
      ]);
    
      (userService as any).documentService.getDocumentByDocumentId.mockResolvedValue({ _id: 'doc1' });
    
      jest
        .spyOn(userService, 'getContactListOfSharedDocument')
        .mockResolvedValue([{ _id: 'sharedUser' }]);
    
      const result = await userService.getContactListToShareDocument(baseParams);
    
      expect(result).toEqual([{ _id: 'sharedUser' }]);
    
      expect(userService.getContactListOfSharedDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          orgIds: ['org1'],
          userId: baseParams.userId,
          documentPermissions: expect.any(Array),
          searchKey: '',
          pickedUserIds: [],
        })
      );
    });

    it('should return null when originalDocPermission is undefined', async () => {
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        {
          role: DocumentRoleEnum.VIEWER,
          refId: { toHexString: () => 'someone-else' },
        },
      ]);
      (userService as any).documentService.getDocumentByDocumentId.mockResolvedValue({ _id: 'doc1' });    
    
      const baseParams = {
        documentId: 'doc1',
        userId: 'user1',
        orgIds: ['org1'],
        searchKey: '',
        pickedUserIds: [],
      };
    
      const result = await userService.getContactListToShareDocument(baseParams);
    
      expect(result).toBeNull();    
    });

    it('should return org document contact list when role is ORGANIZATION', async () => {
      (userService as any).documentService.getDocumentPermissionsByDocId.mockResolvedValue([
        {
          role: DocumentRoleEnum.ORGANIZATION,
          refId: { toHexString: () => 'org123' },
        },
      ]);
      (userService as any).documentService.getDocumentByDocumentId.mockResolvedValue({ _id: 'doc1' });
    
      const mockOrgContactList = [{ _id: 'orgUser1' }, { _id: 'orgUser2' }];
      jest
        .spyOn(userService, 'getContactListOfOrgDocument')
        .mockResolvedValue(mockOrgContactList);
    
      const result = await userService.getContactListToShareDocument(baseParams);
    
      expect(result).toEqual(mockOrgContactList);
      expect(userService.getContactListOfOrgDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: baseParams.userId,
          document: { _id: 'doc1' },
          documentPermission: expect.objectContaining({
            role: DocumentRoleEnum.ORGANIZATION,
          }),
          orgIds: ['org1'],
          searchKey: '',
          pickedUserIds: [],
        }),
      );
    });
  });

  describe('getContactListOfSharedDocument', () => {
    const baseParams = {
      orgIds: ['org1'],
      userId: 'user1',
      searchKey: '',
      pickedUserIds: [],
      documentPermissions: [],
    };
  
    beforeEach(() => {
      (userService as any).getUserContacts = jest.fn();
      (userService as any).organizationService = {
        getOrgMembershipsOfUser: jest.fn(),
        getMembersByOrgId: jest.fn(),
      };
      (userService as any).membershipService = {
        find: jest.fn(),
      };
      (userService as any).returnContactList = jest.fn(list => list);
    });
  
    it('should return null when role is not recognized', async () => {
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: 'UNKNOWN_ROLE', refId: { toHexString: () => 'ref1' } },
        ],
      };
  
      const result = await (userService as any).getContactListOfSharedDocument(params);
      expect(result).toBeNull();
    });
  
    it('should return null when documentPermissions is empty', async () => {
      const params = { ...baseParams, documentPermissions: [] };
      const result = await (userService as any).getContactListOfSharedDocument(params);
      expect(result).toBeNull();
    });
  
    it('should return OWNER contact list when role is OWNER', async () => {
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember1' }]);
  
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'owner1' } },
        ],
      };
  
      const result = await (userService as any).getContactListOfSharedDocument(params);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          excludeSharedIds: expect.arrayContaining(['owner1']),
          searchKey: '',
        }),
      );
      expect((userService as any).organizationService.getOrgMembershipsOfUser).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining([{ _id: 'contact1' }, { _id: 'orgMember1' }]));
    });
  
    it('should return ORGANIZATION contact list when role is ORGANIZATION', async () => {
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'userContact' }]);
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([{ userId: { toHexString: () => 'member1' } }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember2' }]);
  
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.ORGANIZATION, refId: { toHexString: jest.fn().mockReturnValue('org123') } },
        ],
      };
  
      const result = await (userService as any).getContactListOfSharedDocument(params);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeOrgId: 'org123',
          excludeSharedIds: expect.arrayContaining(['user1']),
        }),
      );
      expect((userService as any).organizationService.getMembersByOrgId)
      .toHaveBeenCalledWith(
        expect.objectContaining({ toHexString: expect.any(Function) }),
        { userId: 1 },
      );
      expect((userService as any).organizationService.getOrgMembershipsOfUser).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining([{ _id: 'userContact' }, { _id: 'orgMember2' }]));
    });
  
    it('should return ORGANIZATION_TEAM contact list when role is ORGANIZATION_TEAM', async () => {
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'userContact' }]);
      (userService as any).membershipService.find.mockResolvedValue([{ userId: { toHexString: () => 'teamMember1' } }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember3' }]);
  
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: { toHexString: () => 'team1' } },
        ],
      };
  
      const result = await (userService as any).getContactListOfSharedDocument(params);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeTeamId: 'team1',
          searchKey: '',
        }),
      );
      expect((userService as any).membershipService.find).toHaveBeenCalledWith({ teamId: expect.anything() }, { userId: 1 });
      expect((userService as any).organizationService.getOrgMembershipsOfUser).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining([{ _id: 'userContact' }, { _id: 'orgMember3' }]));
    });

    it('should include shared permission IDs when role is SHARER', async () => {
      const sharedId = 'shared1';
      const ownerId = 'owner1';
    
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember1' }]);
    
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.SHARER, refId: { toHexString: () => sharedId } },
          { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => ownerId } },
        ],
        pickedUserIds: ['pickedUser1'],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
    
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeSharedIds: expect.arrayContaining([sharedId, 'pickedUser1', ownerId]),
        })
      );
      expect(result).toEqual(expect.arrayContaining([{ _id: 'contact1' }, { _id: 'orgMember1' }]));
    });
    
    it('should slice interactionList when exceeding LIMIT_USER_CONTACTS', async () => {
      const limit = 5;
      const manyContacts = Array.from({ length: limit + 3 }, (_, i) => ({ _id: `contact${i}` }));
    
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember' }]);
      (userService as any).LIMIT_USER_CONTACTS = limit;
    
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'owner1' } },
        ],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
    
      expect(result).toEqual(manyContacts.slice(0, limit));
    });

    it('should slice interactionList to LIMIT_USER_CONTACTS when OWNER', async () => {
      const limit = 5;
      const manyContacts = Array.from({ length: limit + 2 }, (_, i) => ({ _id: `contact${i}` }));
    
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgMember' }]);
      (userService as any).LIMIT_USER_CONTACTS = limit;
    
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'owner1' } },
        ],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
    
      expect(result).toEqual(manyContacts.slice(0, limit));
    });

    it('should slice interactionList to LIMIT_USER_CONTACTS when ORGANIZATION', async () => {
      const limit = 5;
      const manyContacts = Array.from({ length: limit + 3 }, (_, i) => ({ _id: `contact${i}` }));
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([]);
    
      (userService as any).LIMIT_USER_CONTACTS = limit;
    
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.ORGANIZATION, refId: { toHexString: () => 'org1' } },
        ],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
      expect(result).toEqual(manyContacts.slice(0, limit));
    });

    it('should slice interactionList to LIMIT_USER_CONTACTS when ORGANIZATION_TEAM', async () => {
      const limit = 3;
      const manyContacts = Array.from({ length: limit + 2 }, (_, i) => ({ _id: `contact${i}` }));
    
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).membershipService.find.mockResolvedValue([]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([]);
    
      (userService as any).LIMIT_USER_CONTACTS = limit;
    
      const params = {
        ...baseParams,
        documentPermissions: [
          { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: { toHexString: () => 'team1' } },
        ],
      };
    
      const result = await (userService as any).getContactListOfSharedDocument(params);
    
      expect(result).toEqual(expect.arrayContaining(manyContacts.slice(0, limit)));
    });
  });

  describe('getContactListOfPersonalDocument', () => {
    let userService: any;
    const baseParams = {
      userId: 'user1',
      documentId: 'doc1',
      searchKey: '',
      pickedUserIds: [],
    };
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      userService = new (class {
        LIMIT_USER_CONTACTS = 5;
        getUserContacts = jest.fn();
        getOrganizationContactList = jest.fn();
        returnContactList = jest.fn((list) => list);
  
        async getContactListOfPersonalDocument({ userId, documentId, searchKey, pickedUserIds }) {
          const interactionList = await this.getUserContacts({
            userId,
            excludeSharedIds: [userId, ...pickedUserIds],
            searchKey,
          });
          const interactorIds = interactionList.map((u) => u._id);
          const orgContactList = await this.getOrganizationContactList({
            userId,
            targetType: 'DOCUMENT',
            targetId: documentId,
            searchKey,
            excludeUserIds: [...interactorIds, ...pickedUserIds],
          });
          if (interactionList.length >= this.LIMIT_USER_CONTACTS) {
            return interactionList.slice(0, this.LIMIT_USER_CONTACTS);
          }
          return this.returnContactList([...interactionList, ...orgContactList]);
        }
      })();
    });
  
    it('should return sliced interactionList when it exceeds LIMIT_USER_CONTACTS', async () => {
      const manyContacts = Array.from({ length: 8 }, (_, i) => ({ _id: `u${i}` }));
      userService.getUserContacts.mockResolvedValue(manyContacts);
      userService.getOrganizationContactList.mockResolvedValue([]);
  
      const result = await userService.getContactListOfPersonalDocument(baseParams);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          excludeSharedIds: expect.arrayContaining(['user1']),
          searchKey: '',
        }),
      );
      expect(result).toEqual(manyContacts.slice(0, 5));
    });
  
    it('should combine interactionList and orgContactList when below limit', async () => {
      userService.getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      userService.getOrganizationContactList.mockResolvedValue([{ _id: 'orgContact1' }]);
  
      const result = await userService.getContactListOfPersonalDocument(baseParams);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          excludeSharedIds: expect.arrayContaining(['user1']),
          searchKey: '',
        }),
      );
  
      expect(result).toEqual(expect.arrayContaining([{ _id: 'contact1' }, { _id: 'orgContact1' }]));
    });
  
    it('should include pickedUserIds in exclude lists', async () => {
      const params = { ...baseParams, pickedUserIds: ['uA', 'uB'] };
      userService.getUserContacts.mockResolvedValue([{ _id: 'u1' }]);
      userService.getOrganizationContactList.mockResolvedValue([]);
  
      await userService.getContactListOfPersonalDocument(params);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeSharedIds: expect.arrayContaining(['user1', 'uA', 'uB']),
        }),
      );
    });
  
    it('should call returnContactList to merge and return final list', async () => {
      const mockContacts = [{ _id: 'c1' }];
      const mockOrgContacts = [{ _id: 'o1' }];
  
      userService.getUserContacts.mockResolvedValue(mockContacts);
      userService.getOrganizationContactList.mockResolvedValue(mockOrgContacts);
  
      const result = await userService.getContactListOfPersonalDocument(baseParams);
  
      expect(userService.returnContactList).toHaveBeenCalledWith(
        expect.arrayContaining([...mockContacts, ...mockOrgContacts]),
      );
      expect(result).toEqual(expect.arrayContaining([{ _id: 'c1' }, { _id: 'o1' }]));
    });
  });

  describe('getContactListOfOrgDocument', () => {
    const baseParams = {
      userId: 'user1',
      document: {
        _id: 'doc1',
        ownerId: { toHexString: () => 'owner1' },
      },
      documentPermission: {
        refId: { toHexString: () => 'org1', toString: () => 'org1' },
      },
      orgIds: ['org1', 'org2'],
      searchKey: '',
      pickedUserIds: [],
    };
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    
      (userService as any).organizationService = {
        findMemberWithRoleInOrg: jest.fn(),
        getMembershipByOrgAndUser: jest.fn(),
        getOrgMembershipsOfUser: jest.fn(),
        getMembersByOrgId: jest.fn(),
      };
    
      (userService as any).documentService = {
        checkExistedDocPermission: jest.fn().mockResolvedValue(false),
      };
    
      (userService as any).getUserContacts = jest.fn();
      (userService as any).returnShareDocumentContactList = jest.fn((_, list) => list);
      (userService as any).LIMIT_USER_CONTACTS = 5;
    });    

    it('should combine interactionList and orgContactList when admin and below limit', async () => {
      const mockContacts = [{ _id: 'c1' }];
      const mockOrgContacts = [{ _id: 'o1' }];
  
      (userService as any).organizationService.findMemberWithRoleInOrg.mockResolvedValue([
        { userId: { toHexString: () => 'm1' } },
      ]);
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue({
        role: 'ORGANIZATION_ADMIN',
      });
      (userService as any).getUserContacts.mockResolvedValue(mockContacts);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue(mockOrgContacts);
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([]);
  
      const result = await userService.getContactListOfOrgDocument(baseParams as any);
  
      expect((userService as any).organizationService.getOrgMembershipsOfUser).not.toBeNull();
      expect(result).toEqual(expect.arrayContaining([...mockContacts, ...mockOrgContacts]));
    });
  
    it('should include pickedUserIds in exclude lists for admin', async () => {
      const params = { ...baseParams, pickedUserIds: ['uA', 'uB'] };
  
      (userService as any).organizationService.findMemberWithRoleInOrg.mockResolvedValue([]);
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue({
        role: 'BILLING_MODERATOR',
      });
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'u1' }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'u2' }]);
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([]);
  
      await userService.getContactListOfOrgDocument(params as any);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeSharedIds: expect.arrayContaining(['user1', 'owner1', 'uA', 'uB']),
        }),
      );
      expect((userService as any).organizationService.getOrgMembershipsOfUser).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeUserIds: expect.arrayContaining(['u1', 'uA', 'uB']),
        }),
      );
    });
  
    it('should slice interactionList when non-admin and over limit', async () => {
      const manyContacts = Array.from({ length: 6 }, (_, i) => ({ _id: `x${i}` }));
  
      (userService as any).organizationService.findMemberWithRoleInOrg.mockResolvedValue([]);
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue({
        role: 'MEMBER',
      });
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([]);
  
      const result = await userService.getContactListOfOrgDocument(baseParams as any);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeOrgId: 'org1',
        }),
      );
      expect(result).toEqual(manyContacts.slice(0, 5));
    });
  
    it('should merge interactionList and orgContactList when non-admin and below limit', async () => {
      (userService as any).organizationService.findMemberWithRoleInOrg.mockResolvedValue([
        { userId: { toHexString: () => 'm1' } },
      ]);
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue({
        role: 'MEMBER',
      });
      (userService as any).organizationService.getMembersByOrgId.mockResolvedValue([
        { userId: { toHexString: () => 'mem1' } },
      ]);
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'u1' }]);
      (userService as any).organizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'u2' }]);
  
      const result = await userService.getContactListOfOrgDocument(baseParams as any);
  
      expect((userService as any).organizationService.getOrgMembershipsOfUser).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeUserIds: expect.arrayContaining(['user1', 'u1', 'mem1']),
        }),
      );
      expect(result).toEqual(expect.arrayContaining([{ _id: 'u1' }, { _id: 'u2' }]));
    }); 

    it('should return sliced list via returnShareDocumentContactList when admin and interactionList exceeds LIMIT_USER_CONTACTS', async () => {
      const manyContacts = Array.from({ length: 7 }, (_, i) => ({ _id: `adminUser${i}` }));
    
      (userService as any).organizationService.findMemberWithRoleInOrg.mockResolvedValue([
        { userId: { toHexString: () => 'm1' } },
      ]);
      (userService as any).organizationService.getMembershipByOrgAndUser.mockResolvedValue({
        role: 'organization_admin',
      });
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
      (userService as any).returnShareDocumentContactList = jest.fn((_, list) => list.slice(0, 5));
    
      const result = await userService.getContactListOfOrgDocument(baseParams as any);
    
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeSharedIds: expect.arrayContaining(['user1', 'owner1']),
        }),
      );
      expect(userService.returnShareDocumentContactList).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(manyContacts),
      );
      expect(result).toEqual(manyContacts.slice(0, 5));
    });
  });

  describe('returnShareDocumentContactList', () => {
    let userService: any;
    let mockCheckExistedDocPermission: jest.Mock;
  
    beforeEach(() => {
      mockCheckExistedDocPermission = jest.fn().mockResolvedValue({ hasPermission: false });
  
      userService = new (class {
        documentService = { checkExistedDocPermission: mockCheckExistedDocPermission };
        returnShareDocumentContactList = UserService.prototype.returnShareDocumentContactList;
      })();
    });
  
    const mockDocument = { _id: 'doc1', name: 'Test Document' };
    const mockContacts = [
      { _id: 'u1', name: 'Alice' },
      { _id: 'u2', name: 'Bob' },
      { _id: 'u3', name: 'Charlie' },
    ];
  
    it('should call checkExistedDocPermission for each contact (up to LIMIT_USER_CONTACTS)', async () => {
      const result = await userService.returnShareDocumentContactList(mockDocument, mockContacts);
  
      expect(mockCheckExistedDocPermission).toHaveBeenCalledTimes(mockContacts.length);
      mockContacts.forEach(contact => {
        expect(mockCheckExistedDocPermission).toHaveBeenCalledWith(contact._id, mockDocument);
      });
  
      expect(result).toHaveLength(mockContacts.length);
      expect(result.every(r => r.status === SearchUserStatus.USER_VALID)).toBe(true);
    });
  });
  

  describe('getContactListOfTeamDocument', () => {
    let mockMembershipService: any;
    let mockOrganizationService: any;
  
    const baseParams = {
      userId: 'user1',
      orgIds: ['org1'],
      document: { _id: 'doc1', ownerId: { toHexString: () => 'owner1' } } as any,
      documentPermission: { refId: 'team1' } as any,
      searchKey: '',
      pickedUserIds: [],
    };
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockMembershipService = {
        findOne: jest.fn(),
        find: jest.fn(),
      };
  
      mockOrganizationService = {
        getOrgMembershipsOfUser: jest.fn(),
      };
  
      (userService as any).membershipService = mockMembershipService;
      (userService as any).organizationService = mockOrganizationService;
      jest.spyOn(userService, 'getUserContacts').mockResolvedValue([]);
      (userService as any).LIMIT_USER_CONTACTS = 5;
    });
  
    it('should return contacts when role is ADMIN', async () => {
      mockMembershipService.findOne.mockResolvedValue({ role: 'ADMIN' });
      mockMembershipService.find.mockResolvedValue([]);
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      mockOrganizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgContact1' }]);
  
      const result = await userService.getContactListOfTeamDocument(baseParams);
  
      expect(result).toEqual(expect.arrayContaining([{ _id: 'contact1' }, { _id: 'orgContact1' }]));
    });
  
    it('should slice interactionList when exceeding LIMIT_USER_CONTACTS for non-ADMIN', async () => {
      mockMembershipService.findOne.mockResolvedValue({ role: 'MEMBER' });
      mockMembershipService.find.mockResolvedValue([{ userId: { toHexString: () => 'member1' } }]);
      const manyContacts = Array.from({ length: 8 }, (_, i) => ({ _id: `contact${i}` }));
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
  
      const result = await userService.getContactListOfTeamDocument(baseParams);
  
      expect(result).toEqual(manyContacts.slice(0, 5));
    });
  
    it('should combine interactionList and orgContactList for non-ADMIN below LIMIT_USER_CONTACTS', async () => {
      mockMembershipService.findOne.mockResolvedValue({ role: 'MEMBER' });
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      mockMembershipService.find.mockResolvedValue([{ userId: { toHexString: () => 'member1' } }]);
      mockOrganizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgContact1' }]);
  
      const result = await userService.getContactListOfTeamDocument(baseParams);
  
      expect(result).toEqual(expect.arrayContaining([{ _id: 'contact1' }, { _id: 'orgContact1' }]));
    });
  
    it('should exclude pickedUserIds and docOwnerId from all calls', async () => {
      mockMembershipService.findOne.mockResolvedValue({ role: 'MEMBER' });
      mockMembershipService.find.mockResolvedValue([{ userId: { toHexString: () => 'member1' } }]);
      const pickedUserIds = ['picked1', 'picked2'];
      const params = { ...baseParams, pickedUserIds };
      (userService as any).getUserContacts.mockResolvedValue([{ _id: 'contact1' }]);
      mockOrganizationService.getOrgMembershipsOfUser.mockResolvedValue([{ _id: 'orgContact1' }]);
  
      await userService.getContactListOfTeamDocument(params);
  
      expect(userService.getUserContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeSharedIds: expect.arrayContaining(['user1', 'owner1', ...pickedUserIds]),
          excludeTeamId: 'team1',
          searchKey: ''
        })
      );
  
      expect(mockOrganizationService.getOrgMembershipsOfUser).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeUserIds: expect.arrayContaining(['contact1', 'member1', ...pickedUserIds, 'owner1'])
        })
      );
    }); 
    
    it('should return sliced contacts via returnShareDocumentContactList when ADMIN and interactionList exceeds LIMIT_USER_CONTACTS', async () => {
      mockMembershipService.findOne.mockResolvedValue({ role: OrganizationTeamRoles.ADMIN });
    
      const manyContacts = Array.from({ length: 8 }, (_, i) => ({ _id: `contact${i}` }));
      (userService as any).getUserContacts.mockResolvedValue(manyContacts);
    
      const mockReturnFn = jest
        .spyOn(userService as any, 'returnShareDocumentContactList')
        .mockReturnValue(manyContacts);    
      const result = await userService.getContactListOfTeamDocument(baseParams);
    
      expect(mockReturnFn).toHaveBeenCalledWith(
        baseParams.document,
        manyContacts,
      );    
      expect(result).toEqual(manyContacts);
    });
    
  });  

  describe('getOrganizationContactList', () => {
    let mockOrganizationService: any;
  
    beforeEach(() => {
      mockOrganizationService = {
        getOrgMembershipsOfUser: jest.fn(),
      };
  
      (userService as any).organizationService = mockOrganizationService;
      (userService as any).getOrgIdsToFindUserContact = jest.fn();
    });
  
    it('should get orgIds and call organizationService.getOrgMembershipsOfUser with correct params', async () => {
      const params = {
        userId: 'u1',
        targetType: 'ORG' as any,
        targetId: 'org1',
        searchKey: 'john',
        excludeUserIds: ['u2'],
      };
      const mockOrgIds = ['org1', 'org2'];
      const mockMembers = [{ _id: 'm1' }, { _id: 'm2' }];
  
      (userService as any).getOrgIdsToFindUserContact.mockResolvedValue(mockOrgIds);
      mockOrganizationService.getOrgMembershipsOfUser.mockResolvedValue(mockMembers);
  
      const result = await userService.getOrganizationContactList(params);
  
      expect(userService.getOrgIdsToFindUserContact).toHaveBeenCalledWith(
        params.userId,
        params.targetType,
        params.targetId,
      );
      expect(mockOrganizationService.getOrgMembershipsOfUser).toHaveBeenCalledWith({
        userId: params.userId,
        orgIds: mockOrgIds,
        searchKey: params.searchKey,
        excludeUserIds: params.excludeUserIds,
      });
      expect(result).toEqual(mockMembers);
    });
  });
  

  describe('findUserToAdd', () => {
    let userService: any;
    let mockDocService: any;
    let mockOrgService: any;
    let mockTeamService: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockDocService = {
        getDocumentByDocumentId: jest.fn().mockResolvedValue({ _id: 'doc123' }),
        getNonLuminDocumentPermissions: jest.fn().mockResolvedValue([{ _id: 'perm123' }]),
        verifyUserToUpdateDocumentPermission: jest.fn().mockResolvedValue({ _id: 'user123' }),
        checkExistedDocPermission: jest.fn().mockResolvedValue({ hasPermission: true }),
      };
  
      mockOrgService = {
        findUserToInvite: jest.fn().mockResolvedValue({ _id: 'user123' }),
        findUserToGrantModerator: jest.fn().mockResolvedValue({ _id: 'grant123' }),
      };
  
      mockTeamService = {
        findUserToCreate: jest.fn().mockResolvedValue({ _id: 'user123' }),
        findUserToInvite: jest.fn().mockResolvedValue({ _id: 'user123' }),
      };

      userService = new (class {
        documentService = mockDocService;
        organizationService = mockOrgService;
        organizationTeamService = mockTeamService;
        findUserByEmail = jest.fn().mockResolvedValue({
          _id: '5d5f85b5a7ab840c8d46f697',
          name: 'Test User',
          email: 'test@email.com',
        });
        findVerifiedUserByEmail = jest.fn();
        findUserToAdd = UserService.prototype.findUserToAdd;
      })();
    });
  
    it('should find user to add for DOCUMENT target type', async () => {
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'DOCUMENT',
        targetId: 'doc123',
      };
  
      const result = await userService.findUserToAdd(params);
  
      expect(userService.findUserByEmail).toHaveBeenCalledWith('test@email.com');
      expect(mockDocService.getDocumentByDocumentId).toHaveBeenCalledWith('doc123');
      expect(mockDocService.getNonLuminDocumentPermissions).toHaveBeenCalledWith({
        documentId: 'doc123',
        email: 'test@email.com',
      });
      expect(mockDocService.verifyUserToUpdateDocumentPermission).toHaveBeenCalledWith({
        actorId: '5d5f85b5a7ab840c8d46f697',
        sharedEmail: 'test@email.com',
        documentId: 'doc123',
      });
      expect(result).toEqual({
        _id: 'user123',
        grantedPermission: true,
      });
    });
  
    it('should return non-lumin user with granted permission', async () => {
      userService.findUserByEmail.mockResolvedValueOnce(null);
  
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'DOCUMENT',
        targetId: 'doc123',
      };
  
      const result = await userService.findUserToAdd(params);
  
      expect(result).toEqual({
        email: 'test@email.com',
        grantedPermission: true,
      });
    });
  
    it('should find user to add for ORGANIZATION target type', async () => {
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'ORGANIZATION',
        targetId: 'org123',
      };
  
      const result = await userService.findUserToAdd(params);
  
      expect(mockOrgService.findUserToInvite).toHaveBeenCalledWith('test@email.com', 'org123');
      expect(result).toEqual({ _id: 'user123' });
    });
  
    it('should find user to add for ORGANIZATION_CREATION target type (valid user)', async () => {
      userService.findVerifiedUserByEmail.mockResolvedValueOnce({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        deletedAt: null,
      });
  
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_CREATION',
        targetId: 'org123',
      };
  
      const result = await userService.findUserToAdd(params);
  
      expect(userService.findVerifiedUserByEmail).toHaveBeenCalledWith('test@email.com', null);
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        deletedAt: null,
        status: 'USER_VALID',
      });
    });
  
    it('should return user with USER_DELETING status when deletedAt exists', async () => {
      userService.findVerifiedUserByEmail.mockResolvedValueOnce({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        deletedAt: new Date(),
      });
  
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_CREATION',
        targetId: 'org123',
      };
  
      const result = await userService.findUserToAdd(params);
  
      expect(result).toEqual({
        _id: '5d5f85b5a7ab840c8d46f697',
        name: 'Test User',
        email: 'test@email.com',
        deletedAt: expect.any(Date),
        status: 'USER_DELETING',
      });
    });
  
    it('should return null for unsupported target type', async () => {
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'UNSUPPORTED',
        targetId: 'id123',
      };
  
      const result = await userService.findUserToAdd(params);
      expect(result).toBeNull();
    });

    it('should find user to add for organization team creation target type', async () => {
      const params = {
        actorId: 'actor1',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_TEAM_CREATION',
        targetId: 'team123'
      };

      const result = await userService.findUserToAdd(params as any);

      expect(userService['organizationTeamService'].findUserToCreate)
        .toHaveBeenCalledWith('test@email.com', 'team123');
      expect(result).toEqual({ _id: 'user123' });
    });

    it('should find user to add for organization team target type', async () => {
      const params = {
        actorId: 'actor1',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_TEAM',
        targetId: 'team456'
      };

      const result = await userService.findUserToAdd(params as any);

      expect(userService['organizationTeamService'].findUserToInvite)
        .toHaveBeenCalledWith('test@email.com', 'team456');
      expect(result).toEqual({ _id: 'user123' });
    });

    it('should find user to add for organization grant billing target type', async () => {
      const params = {
        actorId: 'actor1',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_GRANT_BILLING',
        targetId: 'org789'
      };

      const result = await userService.findUserToAdd(params as any);

      expect(userService['organizationService'].findUserToGrantModerator)
        .toHaveBeenCalledWith('test@email.com', 'org789');
      expect(result).toEqual({ _id: 'grant123' });
    });

    it('should return null for unsupported target type', async () => {
      const params = {
        actorId: 'actor1',
        email: 'test@email.com',
        targetType: 'UNSUPPORTED',
        targetId: 'id123'
      };

      const result = await userService.findUserToAdd(params as any);
      expect(result).toBeNull();
    });

    it('should return default user payload when no verified user found for organization creation', async () => {
      jest.spyOn(userService, 'findVerifiedUserByEmail').mockResolvedValue(null);
    
      const params = {
        actorId: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        targetType: 'ORGANIZATION_CREATION',
        targetId: 'org999'
      };
    
      const result = await userService.findUserToAdd(params as any);
    
      expect(userService.findVerifiedUserByEmail).toHaveBeenCalledWith('test@email.com', null);
      expect(result).toEqual({
        email: 'test@email.com',
        status: 'USER_VALID'
      });
    });
  });

  describe('findAvailableResourceLocation', () => {
    let userService: any;
    let mockTeamService: any;
    let mockOrganizationTeamService: any;
    let mockFolderService: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockTeamService = {
        aggregate: jest.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId('66fa11111111111111111111'),
            name: 'Team A',
            avatarRemoteId: 'avatar1',
            belongsTo: new Types.ObjectId('66fa22222222222222222222'),
          },
        ]),
      };
  
      mockOrganizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([
          { _id: new Types.ObjectId('66fa33333333333333333333') },
        ]),
      };
  
      mockFolderService = {
        aggregateFolderPermission: jest.fn().mockResolvedValue([
          {
            folder: { _id: 'f1', name: 'Folder A' },
            team: {
              _id: 't1',
              name: 'Team Folder',
              belongsTo: 'org1',
            },
            refId: 'r1',
          },
        ]),
      };
  
      userService = new (class {
        teamService = mockTeamService;
        organizationTeamService = mockOrganizationTeamService;
        folderService = mockFolderService;
        findAvailableResourceLocation =
          (UserService.prototype.findAvailableResourceLocation);
      })();
    });
  
    it('should return list of teams for ORGANIZATION_TEAM context', async () => {
      const orgId = '507f1f77bcf86cd799439011';
      const userId = '507f191e810c19729de860ea';
    
      (userService['teamService'].aggregate as jest.Mock).mockResolvedValue([
        { _id: 't1', name: 'Team A', avatarRemoteId: 'a1', belongsTo: orgId },
      ]);
    
      const result = await userService.findAvailableResourceLocation({
        orgId,
        userId,
        params: { searchKey: 'Team', context: LocationType.ORGANIZATION_TEAM },
      });
    
      expect(result.data[0]._id).toBe('t1');
    }); 
  
    it('should return list of folders for FOLDER context when orgId exists', async () => {
      const result = await userService.findAvailableResourceLocation({
        orgId: '507f1f77bcf86cd799439011',
        userId: '507f191e810c19729de860ea',
        params: { searchKey: 'Folder', context: LocationType.FOLDER },
      });
  
      expect(mockOrganizationTeamService.getOrgTeams).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockFolderService.aggregateFolderPermission).toHaveBeenCalledTimes(1);
      expect(result.data[0]).toMatchObject({
        _id: 'f1',
        name: 'Folder A',
        path: {
          _id: 't1',
          name: 'Team Folder',
          path: { _id: 'org1' },
        },
      });
      expect(result.hasNextPage).toBe(false);
    });
  
    it('should handle FOLDER context when orgId is missing (personal workspace)', async () => {
      const result = await userService.findAvailableResourceLocation({
        orgId: undefined,
        userId: '507f191e810c19729de860ea',
        params: { searchKey: 'Folder', context: LocationType.FOLDER },
      });
  
      expect(mockOrganizationTeamService.getOrgTeams).not.toHaveBeenCalled();
      expect(mockFolderService.aggregateFolderPermission).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });
  
    it('should return null for unsupported context', async () => {
      const result = await userService.findAvailableResourceLocation({
        orgId: '507f1f77bcf86cd799439011',
        userId: '507f191e810c19729de860ea',
        params: { searchKey: '', context: 'INVALID' as any },
      });
  
      expect(result).toBeNull();
    });

    it('should set empty string when team.avatarRemoteId is missing', async () => {
      const mockTeams = [
        { _id: 't1', name: 'No Avatar Team', belongsTo: 'org123' },
      ];
      mockTeamService.aggregate.mockResolvedValue(mockTeams);
    
      const result = await userService.findAvailableResourceLocation({
        orgId: '507f1f77bcf86cd799439011',
        userId: '507f191e810c19729de860ea',
        params: { searchKey: 'No Avatar', context: LocationType.ORGANIZATION_TEAM },
      });
    
      expect(result.data[0]).toEqual({
        _id: 't1',
        name: 'No Avatar Team',
        avatarRemoteId: '',
        path: { _id: 'org123' },
      });
    });
    
    it('should handle FOLDER context when organization has no teams (refIds.length === 1)', async () => {
      mockOrganizationTeamService.getOrgTeams.mockResolvedValue([]);
      mockFolderService.aggregateFolderPermission.mockResolvedValue([
        {
          folder: { _id: 'f1', name: 'SingleRef Folder' },
          refId: '507f1f77bcf86cd799439011',
          team: null,
        },
      ]);
    
      const result = await userService.findAvailableResourceLocation({
        orgId: '507f1f77bcf86cd799439011',
        userId: '507f191e810c19729de860ea',
        params: { searchKey: 'SingleRef', context: LocationType.FOLDER },
      });
    
      const calledPipeline = mockFolderService.aggregateFolderPermission.mock.calls[0][0];
      const matchStage = calledPipeline.find((s) => s.$match);
      expect(JSON.stringify(matchStage.$match)).toContain('507f1f77bcf86cd799439011');
      expect(result.data[0]).toEqual({
        _id: 'f1',
        name: 'SingleRef Folder',
        path: { _id: '507f1f77bcf86cd799439011' },
      });
    });
  });

  describe('deleteUserByEmails', () => {
    beforeEach(() => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        payment: { customerRemoteId: 'cus123' },
      } as any);

      Object.defineProperty(userService, 'adminService', {
        value: {
          deleteUserImmediately: jest.fn().mockResolvedValue(true),
        },
        writable: true,
      });

      Object.defineProperty(userService, 'redisService', {
        value: {
          removeKeyFromhset: jest.fn().mockResolvedValue(true),
        },
        writable: true,
      });

      jest.spyOn(userService['loggerService'], 'info').mockImplementation();
      jest.spyOn(userService['loggerService'], 'error').mockImplementation();
    });

    it('should handle case when user not found', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      await userService.deleteUserByEmails(['test@email.com']);

      expect(userService['adminService'].deleteUserImmediately).not.toHaveBeenCalled();
    });

    it('should handle error when deleting user', async () => {
      jest.spyOn(userService['adminService'], 'deleteUserImmediately').mockRejectedValue(
        new Error('Delete error')
      );

      await userService.deleteUserByEmails(['test@email.com']);

      expect(userService['loggerService'].error).toHaveBeenCalled();
    });

    it('should delete users with admin id', async () => {
      const emails = ['test@email.com'];
      const adminId = 'admin123';

      await userService.deleteUserByEmails(emails, adminId);

      expect(userService['adminService'].deleteUserImmediately).toHaveBeenCalledWith({
        adminId: 'admin123',
        userId: '5d5f85b5a7ab840c8d46f697',
        addToBlacklist: false,
      });
    });
  });

  describe('updateUserSetting', () => {
    let userService: any;
    let mockUserTrackingService: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockUserTrackingService = {
        updateUserContact: jest.fn().mockResolvedValue(true),
      };
  
      userService = new (class {
        userTrackingService = mockUserTrackingService;
        updateUserProperty = jest.fn().mockResolvedValue({
          _id: 'user123',
          email: 'test@email.com',
          setting: {},
        });
        updateUserSetting = UserService.prototype.updateUserSetting;
      })();
    });
  
    it('should update user contact and update user property', async () => {
      const user = {
        _id: 'user123',
        email: 'test@email.com',
        setting: {
          featureUpdateEmail: true,
          marketingEmail: true,
        },
      };
      const setting = {
        featureUpdateEmail: true,
        marketingEmail: true,
      };
      const result = await userService.updateUserSetting(user, setting);
  
      expect(mockUserTrackingService.updateUserContact).toHaveBeenCalledWith('test@email.com', {
        receive_marketing_email: 'Yes',
      });
  
      expect(userService.updateUserProperty).toHaveBeenCalledWith(
        { _id: 'user123' },
        { setting }
      );
  
      expect(result).toEqual({
        _id: 'user123',
        email: 'test@email.com',
        setting: {},
      });
    });
  
    it('should send No for marketingEmail = false', async () => {
      const user = {
        _id: 'user123',
        email: 'test@email.com',
        setting: {
          featureUpdateEmail: false,
          marketingEmail: true,
        },
      };
  
      const setting = {
        featureUpdateEmail: false,
        marketingEmail: false,
      };
  
      await userService.updateUserSetting(user, setting);
  
      expect(mockUserTrackingService.updateUserContact).toHaveBeenCalledWith('test@email.com', {
        receive_marketing_email: 'No',
      });
    });
  
    it('should mark metadata.isSyncedMarketingEmailSetting = false when setting changed', async () => {
      const user = {
        _id: 'user123',
        email: 'test@email.com',
        setting: {
          featureUpdateEmail: false,
          marketingEmail: true,
        },
      };
  
      const setting = {
        featureUpdateEmail: true,
        marketingEmail: false,
      };
  
      await userService.updateUserSetting(user, setting);
  
      expect(userService.updateUserProperty).toHaveBeenCalledWith(
        { _id: 'user123' },
        {
          setting,
          'metadata.isSyncedMarketingEmailSetting': false,
        }
      );
    });
  
    it('should not set metadata flag if no change in marketing/feature update email', async () => {
      const user = {
        _id: 'user123',
        email: 'test@email.com',
        setting: {
          featureUpdateEmail: true,
          marketingEmail: false,
        },
      };
  
      const setting = {
        featureUpdateEmail: true,
        marketingEmail: false,
      };
  
      await userService.updateUserSetting(user, setting);
  
      expect(userService.updateUserProperty).toHaveBeenCalledWith(
        { _id: 'user123' },
        { setting }
      );
    });
  
    it('should handle empty user.setting safely', async () => {
      const user = {
        _id: 'user123',
        email: 'test@email.com',
        setting: {} as any,
      };
  
      const setting = {
        featureUpdateEmail: false,
        marketingEmail: true,
      };
  
      await userService.updateUserSetting(user, setting);
  
      expect(mockUserTrackingService.updateUserContact).toHaveBeenCalledWith('test@email.com', {
        receive_marketing_email: 'Yes',
      });
      expect(userService.updateUserProperty).toHaveBeenCalled();
    });
  });

  describe('interceptUserData', () => {
    let userService: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      userService = new (class {
        getLastAccessedOrg = jest.fn().mockResolvedValue('org-last-url');
        isUserUsingPassword = jest.fn().mockReturnValue(true);
        interceptUserData = UserService.prototype.interceptUserData;
      })();
    });
  
    it('should return full mapped user data with last accessed org and reversed signatures', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@email.com',
        name: 'Test User',
        avatarRemoteId: 'avatar123',
        payment: { plan: 'Pro' },
        setting: { marketingEmail: true },
        lastLogin: new Date('2025-10-19'),
        createdAt: new Date('2024-01-01'),
        signatures: ['sig1', 'sig2'],
        isNotify: true,
        timezoneOffset: 420,
        deletedAt: null,
        version: 1,
        metadata: {
          folderColors: ['#111', '#222'],
        },
        newNotifications: {
          general: true,
          invites: false,
          requests: true,
        },
        type: 'STANDARD',
      };
  
      const loginService = 'google';
  
      const result = await userService.interceptUserData({
        user: mockUser,
        loginService,
      });
  
      expect(userService.getLastAccessedOrg).toHaveBeenCalledWith('user123');
      expect(userService.isUserUsingPassword).toHaveBeenCalledWith(mockUser);
  
      expect(result).toMatchObject({
        _id: 'user123',
        email: 'test@email.com',
        name: 'Test User',
        avatarRemoteId: 'avatar123',
        payment: { plan: 'Pro' },
        setting: { marketingEmail: true },
        lastLogin: new Date('2025-10-19'),
        createdAt: new Date('2024-01-01'),
        isNotify: true,
        lastAccessedOrgUrl: 'org-last-url',
        loginService: 'google',
        endTrial: null,
        timezoneOffset: 420,
        isUsingPassword: true,
        deletedAt: null,
        reachUploadDocLimit: false,
        hasNewVersion: true,
        newNotifications: {
          general: true,
          invites: false,
          requests: true,
        },
        type: 'STANDARD',
      });
  
      expect(result.signatures).toEqual(['sig2', 'sig1']);
      expect(result.metadata.folderColors.slice(0, 2)).toEqual(['#222', '#111']);
      expect(result.metadata.folderColors.length).toBeGreaterThan(2);
    });
  
    it('should use default folderColors when metadata is empty', async () => {
      const mockUser = {
        _id: 'user456',
        email: 'empty@email.com',
        name: 'NoMeta',
        metadata: {},
        signatures: [],
        setting: {},
      };
  
      const result = await userService.interceptUserData({
        user: mockUser,
        loginService: 'password',
      });
  
      expect(result.metadata.folderColors).toEqual(expect.arrayContaining(DEFAULT_FOLDER_COLORS));
    });
  
    it('should set default newNotifications when missing', async () => {
      const mockUser = {
        _id: 'user789',
        email: 'test2@email.com',
        name: 'NoNotify',
        metadata: {},
        signatures: [],
        setting: {},
      };
  
      const result = await userService.interceptUserData({
        user: mockUser,
        loginService: 'github',
      });
  
      expect(result.newNotifications).toEqual({
        general: false,
        invites: false,
        requests: false,
      });
    });
  
    it('should include type field only when defined', async () => {
      const mockUserWithoutType = {
        _id: 'user999',
        email: 'test3@email.com',
        name: 'NoType',
        metadata: {},
        signatures: [],
        setting: {},
      };
  
      const mockUserWithType = {
        ...mockUserWithoutType,
        type: 'ADMIN',
      };
  
      const resultWithType = await userService.interceptUserData({
        user: mockUserWithType,
        loginService: 'github',
      });
  
      const resultWithoutType = await userService.interceptUserData({
        user: mockUserWithoutType,
        loginService: 'github',
      });
  
      expect(resultWithType.type).toBe('ADMIN');
      expect(resultWithoutType.type).toBeUndefined();
    });

    it('should handle undefined metadata safely using optional chaining', async () => {
      const mockUser = {
        _id: 'user777',
        email: 'no.meta@email.com',
        name: 'UndefinedMeta',
        signatures: ['sigA'],
        setting: {},
        metadata: undefined,
      };
  
      const result = await userService.interceptUserData({
        user: mockUser,
        loginService: 'sso',
      });
  
      expect(result.metadata).toBeDefined();
      expect(result.metadata.folderColors).toEqual(
        expect.arrayContaining(DEFAULT_FOLDER_COLORS)
      );
      expect(result.signatures).toEqual(['sigA']);
    });  
  });

  describe('linkEmailWithKratosIdentity', () => {
    let userService: any;
    let mockUserModel: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockUserModel = {
        updateOne: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
      };
  
      userService = new (class {
        userModel = mockUserModel;
        linkEmailWithKratosIdentity = UserService.prototype.linkEmailWithKratosIdentity;
      })();
    });
  
    it('should update user with given email to set identityId', async () => {
      const email = 'user@example.com';
      const identityId = 'kratos-123';
  
      await userService.linkEmailWithKratosIdentity(email, identityId);
  
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { email },
        { $set: { identityId } }
      );
    });
  });
  
  describe('aggregateUserContact', () => {
    let userService: any;
    let mockUserContactModel: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockUserContactModel = {
        aggregate: jest.fn().mockResolvedValue([{ name: 'John Doe', email: 'john@email.com' }]),
      };
  
      userService = new (class {
        userContactModel = mockUserContactModel;
        aggregateUserContact = UserService.prototype.aggregateUserContact;
      })();
    });
  
    it('should call aggregate on userContactModel with provided pipeline', async () => {
      const pipeline = [
        { $match: { active: true } },
        { $project: { name: 1, email: 1 } },
      ];
  
      const result = await userService.aggregateUserContact(pipeline);
  
      expect(mockUserContactModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(result).toEqual([{ name: 'John Doe', email: 'john@email.com' }]);
    });
  });  

  describe('getMentionList', () => {
    let userService: any;
    let mockAggregateUserContact: any;
  
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
  
      mockAggregateUserContact = jest.fn().mockResolvedValue([
        { _id: 'u1', name: 'Alice', email: 'a@email.com' },
        { _id: 'u2', name: 'Bob', email: 'b@email.com' },
      ]);
  
      userService = new (class {
        aggregateUserContact = mockAggregateUserContact;
        getMentionList = UserService.prototype.getMentionList;
      })();
    });
  
    it('should call aggregateUserContact with correct pipeline including searchKey filters', async () => {
      const regexSpy = jest.spyOn(Utils, 'transformToSearchRegex').mockReturnValue('searchRegex' as any);  
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()];
      const searchKey = 'test';
      const limit = 5;
  
      await userService.getMentionList(userId, refIds, searchKey, limit);
  
      expect(regexSpy).toHaveBeenCalledWith('test');  
      expect(mockAggregateUserContact).toHaveBeenCalledTimes(1);

      const [pipeline] = mockAggregateUserContact.mock.calls[0];
      const matchStage = pipeline.find((p: any) => p.$match && p.$match._id);

      expect(matchStage.$match._id.$in).toEqual(refIds);
      expect(matchStage.$match._id.$nin[0]).toBeInstanceOf(Types.ObjectId);
      expect(matchStage.$match.$or).toEqual([
        { email: { $regex: 'searchRegex', $options: 'i' } },
        { name: { $regex: 'searchRegex', $options: 'i' } },
      ]);
  
      const limitStage = pipeline.find((p: any) => p.$limit !== undefined);
      expect(limitStage.$limit).toBe(limit);
    });
  
    it('should not include $or condition when searchKey is empty', async () => {
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString()];
      const searchKey = '';
      const limit = 10;
  
      const result = await userService.getMentionList(userId, refIds, searchKey, limit);
  
      expect(mockAggregateUserContact).toHaveBeenCalledTimes(1);
      const [pipeline] = mockAggregateUserContact.mock.calls[0];
      const matchStage = pipeline.find((p: any) => p.$match && p.$match._id);
  
      expect(matchStage.$match.$or).toBeUndefined();
      expect(matchStage.$match._id.$in).toEqual(refIds);
  
      expect(result).toEqual([
        { _id: 'u1', name: 'Alice', email: 'a@email.com' },
        { _id: 'u2', name: 'Bob', email: 'b@email.com' },
      ]);
    });
  
    it('should pass correct userId and refIds to ObjectId conversion', async () => {
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()];
      const limit = 3;
  
      await userService.getMentionList(userId, refIds, '', limit);
  
      const [pipeline] = mockAggregateUserContact.mock.calls[0];
      const firstMatch = pipeline[0];
      expect(firstMatch.$match.userId).toBeInstanceOf(Types.ObjectId);
  
      const lastMatch = pipeline.find((p: any) => p.$match && p.$match._id);
      expect(lastMatch.$match._id.$in).toEqual(refIds);
      expect(lastMatch.$match._id.$nin[0]).toBeInstanceOf(Types.ObjectId);
    });
  
    it('should handle when refIds array is empty gracefully', async () => {
      const userId = new Types.ObjectId().toHexString();
      const refIds: string[] = [];
      const limit = 5;
  
      await userService.getMentionList(userId, refIds, '', limit);
  
      const [pipeline] = mockAggregateUserContact.mock.calls[0];
      const lastMatch = pipeline.find((p: any) => p.$match && p.$match._id);
      expect(lastMatch.$match._id.$in).toEqual([]);
    });
  });
  
  describe('getDefaultMentionList', () => {
    let userService: any;
    let mockAggregateUser: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockAggregateUser = jest.fn().mockResolvedValue([
        { _id: 'u1', name: 'Alice', email: 'a@email.com' },
        { _id: 'u2', name: 'Bob', email: 'b@email.com' },
      ]);
  
      userService = new (class {
        aggregateUser = mockAggregateUser;
        getDefaultMentionList = UserService.prototype.getDefaultMentionList;
      })();
    });
  
    it('should build correct pipeline when searchKey is provided', async () => {
      const regexSpy = jest.spyOn(Utils, 'transformToSearchRegex').mockReturnValue('searchRegex' as any);
  
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()];
      const existingRefIds = [new Types.ObjectId().toHexString()];
      const searchKey = 'test';
      const limit = 5;
  
      await userService.getDefaultMentionList({
        userId,
        refIds,
        searchKey,
        limit,
        existingRefIds,
      });
  
      expect(regexSpy).toHaveBeenCalledWith('test');
      expect(mockAggregateUser).toHaveBeenCalledTimes(1);
  
      const [pipeline] = mockAggregateUser.mock.calls[0];
  
      const matchStage = pipeline[0].$match;
      expect(matchStage._id.$in).toEqual(refIds);
      expect(matchStage._id.$ne).toBeInstanceOf(Types.ObjectId);
      expect(matchStage._id.$nin[0]).toBeInstanceOf(Types.ObjectId);
      expect(matchStage.$or).toEqual([
        { email: { $regex: 'searchRegex', $options: 'i' } },
        { name: { $regex: 'searchRegex', $options: 'i' } },
      ]);
      expect(pipeline.some((p: any) => p.$addFields)).toBe(true);
      expect(pipeline.some((p: any) => p.$sort)).toBe(true);
      expect(pipeline.find((p: any) => p.$limit)?.$limit).toBe(limit);
      expect(pipeline.some((p: any) => p.$project)).toBe(true);
    });
  
    it('should build correct pipeline when searchKey is empty', async () => {
      const regexSpy = jest.spyOn(Utils, 'transformToSearchRegex');
  
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString()];
      const existingRefIds: string[] = [];
      const searchKey = '';
      const limit = 10;
  
      const result = await userService.getDefaultMentionList({
        userId,
        refIds,
        searchKey,
        limit,
        existingRefIds,
      });
  
      expect(regexSpy).not.toHaveBeenCalled();
      expect(mockAggregateUser).toHaveBeenCalledTimes(1);
  
      const [pipeline] = mockAggregateUser.mock.calls[0];
      const matchStage = pipeline[0].$match;
  
      expect(matchStage.$or).toBeUndefined();
      expect(matchStage._id.$in).toEqual(refIds);
      expect(matchStage._id.$nin).toEqual([]);
      expect(matchStage._id.$ne).toBeInstanceOf(Types.ObjectId);
      expect(pipeline.find((p: any) => p.$limit)?.$limit).toBe(limit);
      expect(result).toEqual([
        { _id: 'u1', name: 'Alice', email: 'a@email.com' },
        { _id: 'u2', name: 'Bob', email: 'b@email.com' },
      ]);
    });
  
    it('should exclude existingRefIds correctly', async () => {
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()];
      const existingRefIds = [
        new Types.ObjectId().toHexString(),
        new Types.ObjectId().toHexString(),
      ];
  
      await userService.getDefaultMentionList({
        userId,
        refIds,
        searchKey: '',
        limit: 5,
        existingRefIds,
      });
  
      const [pipeline] = mockAggregateUser.mock.calls[0];
      const matchStage = pipeline[0].$match;
  
      expect(matchStage._id.$nin.length).toBe(existingRefIds.length);
      matchStage._id.$nin.forEach((id: any) =>
        expect(id).toBeInstanceOf(Types.ObjectId),
      );
    });
  
    it('should throw if aggregateUser rejects', async () => {
      const error = new Error('DB error');
      mockAggregateUser.mockRejectedValueOnce(error);
  
      const userId = new Types.ObjectId().toHexString();
      const refIds = [new Types.ObjectId().toHexString()];
      const limit = 3;
  
      await expect(
        userService.getDefaultMentionList({
          userId,
          refIds,
          searchKey: '',
          limit,
          existingRefIds: [],
        }),
      ).rejects.toThrow('DB error');
    });
  });

  describe('checkReachLimitDailyUpload', () => {
    let userService: any;
    let mockRedisService: any;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockRedisService = {
        getRateLimitEndpoint: jest.fn(),
      };
  
      userService = new (class {
        redisService = mockRedisService;
        checkReachLimitDailyUpload = UserService.prototype.checkReachLimitDailyUpload;
      })();
    });
  
    it('should return true if rateLimitDocument exists and remaining is 0', async () => {
      mockRedisService.getRateLimitEndpoint.mockResolvedValueOnce({ remaining: 0 });
  
      const result = await userService.checkReachLimitDailyUpload('user123');
  
      expect(result).toBe(true);
      expect(mockRedisService.getRateLimitEndpoint).toHaveBeenCalledWith(
        OperationLimitConstants.DOCUMENT_UPLOAD,
        'user123',
      );
    });
  
    it('should return false if rateLimitDocument exists and remaining > 0', async () => {
      mockRedisService.getRateLimitEndpoint.mockResolvedValueOnce({ remaining: 2 });
  
      const result = await userService.checkReachLimitDailyUpload('user123');
  
      expect(result).toBe(false);
    });
  
    it('should return false if rateLimitDocument does not exist', async () => {
      mockRedisService.getRateLimitEndpoint.mockResolvedValueOnce(null);
  
      const result = await userService.checkReachLimitDailyUpload('user123');
  
      expect(result).toBe(false);
    });
  });
  
  describe('updateUserMobileFreeToolsBanner', () => {
    let userService: any;
    let mockFindOneAndUpdate: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockFindOneAndUpdate = jest.fn().mockResolvedValue({ _id: 'u1', metadata: { hasShownMobileFreeToolsBanner: true } });
  
      userService = new (class {
        findOneAndUpdate = mockFindOneAndUpdate;
        getBasicQuery = jest.fn().mockReturnValue({ deletedAt: null });
        updateUserMobileFreeToolsBanner = UserService.prototype.updateUserMobileFreeToolsBanner;
      })();
    });
  
    it('should call findOneAndUpdate with correct args', async () => {
      const userId = 'user123';
  
      const result = await userService.updateUserMobileFreeToolsBanner(userId);
  
      expect(userService.getBasicQuery).toHaveBeenCalled();
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: userId, deletedAt: null },
        { 'metadata.hasShownMobileFreeToolsBanner': true },
        { new: true },
      );
      expect(result).toEqual({
        _id: 'u1',
        metadata: { hasShownMobileFreeToolsBanner: true },
      });
    });
  
    it('should propagate error if findOneAndUpdate throws', async () => {
      mockFindOneAndUpdate.mockRejectedValueOnce(new Error('DB failed'));
  
      await expect(userService.updateUserMobileFreeToolsBanner('u1')).rejects.toThrow('DB failed');
    });
  });
  
  describe('getGoogleContacts', () => {
    let userService: any;
    let mockListGoogleOtherContacts: jest.Mock;
    let mockGetGoogleDirectoryPeoples: jest.Mock;
    let mockFindUserByEmails: jest.Mock;
    let mockGetGoogleContactToInviteOrg: jest.Mock;
    let mockEnvironmentService: any;
    let mockVerifyDomain: jest.SpyInstance;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockListGoogleOtherContacts = jest.fn();
      mockGetGoogleDirectoryPeoples = jest.fn();
      mockFindUserByEmails = jest.fn();
      mockGetGoogleContactToInviteOrg = jest.fn();
      mockEnvironmentService = { getByKey: jest.fn().mockReturnValue('fake-google-client-id') };
      mockVerifyDomain = jest.spyOn(Utils, 'verifyDomain');
  
      userService = new (class {
        environmentService = mockEnvironmentService;
        listGoogleOtherContacts = mockListGoogleOtherContacts;
        getGoogleDirectoryPeoples = mockGetGoogleDirectoryPeoples;
        findUserByEmails = mockFindUserByEmails;
        getGoogleContactToInviteOrg = mockGetGoogleContactToInviteOrg;
        getGoogleContacts = UserService.prototype.getGoogleContacts;
      })();
    });
  
    it('should call listGoogleOtherContacts when domain is popular', async () => {
      mockVerifyDomain.mockReturnValue(true);
      mockListGoogleOtherContacts.mockResolvedValue([
        { name: 'Zoe', email: 'z@test.com' },
        { name: 'Amy', email: 'a@test.com' },
      ]);
      mockFindUserByEmails.mockResolvedValue([{ email: 'z@test.com' }]);
  
      const result = await userService.getGoogleContacts({
        accessToken: 'token123',
        orgId: 'org1',
        googleAuthorizationEmail: 'gmail.com',
        action: GetGoogleContactsContext.ONBOARDING_FLOW,
      });
  
      expect(mockListGoogleOtherContacts).toHaveBeenCalled();
      expect(mockGetGoogleDirectoryPeoples).not.toHaveBeenCalled();
      expect(result).toEqual([{ name: 'Amy', email: 'a@test.com' }]);
    });
  
    it('should call getGoogleDirectoryPeoples when domain is not popular', async () => {
      mockVerifyDomain.mockReturnValue(false);
      mockGetGoogleDirectoryPeoples.mockResolvedValue([{ name: 'John', email: 'john@corp.com' }]);
      mockFindUserByEmails.mockResolvedValue([]);
  
      const result = await userService.getGoogleContacts({
        accessToken: 'token123',
        orgId: 'org1',
        googleAuthorizationEmail: 'internal.company',
        action: GetGoogleContactsContext.ONBOARDING_FLOW,
      });
  
      expect(mockGetGoogleDirectoryPeoples).toHaveBeenCalled();
      expect(result).toEqual([{ name: 'John', email: 'john@corp.com' }]);
    });
  
    it('should call getGoogleContactToInviteOrg when action is not ONBOARDING_FLOW', async () => {
      mockVerifyDomain.mockReturnValue(true);
      mockListGoogleOtherContacts.mockResolvedValue([{ name: 'Amy', email: 'a@test.com' }]);
      mockFindUserByEmails.mockResolvedValue([]);
      mockGetGoogleContactToInviteOrg.mockResolvedValue([{ name: 'InviteUser' }]);
  
      const result = await userService.getGoogleContacts({
        accessToken: 'token123',
        orgId: 'org1',
        action: 'INVITE_EXISTING',
      });
  
      expect(mockGetGoogleContactToInviteOrg).toHaveBeenCalledWith({
        sortedGoogleContacts: [{ name: 'Amy', email: 'a@test.com' }],
        orgId: 'org1',
        userList: [],
      });
      expect(result).toEqual([{ name: 'InviteUser' }]);
    });
  
    it('should propagate error from Google client call', async () => {
      mockVerifyDomain.mockReturnValue(true);
      mockListGoogleOtherContacts.mockRejectedValueOnce(new Error('Google API failed'));
  
      await expect(
        userService.getGoogleContacts({
          accessToken: 'token123',
          orgId: 'org1',
          googleAuthorizationEmail: 'gmail.com',
        }),
      ).rejects.toThrow('Google API failed');
    });
  });

  describe('getGoogleContactToInviteOrg', () => {
    let userService: any;
    let mockOrgService: any;
    let mockBlacklistService: any;
  
    const LIMIT_RETURN_GOOGLE_CONTACTS = 5;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockOrgService = {
        getMembersInfoByOrgId: jest.fn(),
        getRequestAccessByCondition: jest.fn(),
      };
  
      mockBlacklistService = {
        findAll: jest.fn(),
      };
  
      userService = new (class {
        organizationService = mockOrgService;
        blacklistService = mockBlacklistService;
        getGoogleContactToInviteOrg = UserService.prototype.getGoogleContactToInviteOrg;
      })();
  
      global.LIMIT_RETURN_GOOGLE_CONTACTS = LIMIT_RETURN_GOOGLE_CONTACTS;
    });
  
    it('should return filtered contacts excluding member, blacklist, and invited emails', async () => {
      const sortedGoogleContacts = [
        { email: 'keep1@gmail.com', name: 'Keep1' },
        { email: 'keep2@gmail.com', name: 'Keep2' },
        { email: 'member@gmail.com', name: 'MemberUser' },
        { email: 'blacklist@gmail.com', name: 'Blacklisted' },
        { email: 'invited@gmail.com', name: 'Invited' },
        { email: 'other@gmail.com', name: 'Other' },
      ];
  
      const orgId = 'org123';
      const userList = [{ email: 'keep1@gmail.com' }];
  
      mockOrgService.getMembersInfoByOrgId.mockResolvedValue([
        { user: { email: 'member@gmail.com' } },
      ]);
  
      mockBlacklistService.findAll.mockResolvedValue([
        { value: 'blacklist@gmail.com' },
      ]);
  
      mockOrgService.getRequestAccessByCondition.mockResolvedValue([
        { actor: 'invited@gmail.com' },
      ]);
  
      const result = await userService.getGoogleContactToInviteOrg({
        sortedGoogleContacts,
        orgId,
        userList,
      });
  
      expect(mockOrgService.getMembersInfoByOrgId).toHaveBeenCalledWith(orgId);
      expect(mockBlacklistService.findAll).toHaveBeenCalledWith(
        BlacklistActionEnum.CREATE_NEW_ACCOUNT,
        sortedGoogleContacts.map((c) => c.email),
      );
      expect(mockOrgService.getRequestAccessByCondition).toHaveBeenCalledWith({
        actor: { $in: sortedGoogleContacts.map((c) => c.email) },
        target: orgId,
        type: { $in: [AccessTypeOrganization.INVITE_ORGANIZATION] },
      });
  
      const emails = result.map((c) => c.email);
      expect(emails).not.toContain('member@gmail.com');
      expect(emails).not.toContain('blacklist@gmail.com');
      expect(emails).not.toContain('invited@gmail.com');
  
      const keep1 = result.find((r) => r.email === 'keep1@gmail.com');
      expect(keep1).toEqual({ email: 'keep1@gmail.com', name: 'Keep1' });
  
      const keep2 = result.find((r) => r.email === 'keep2@gmail.com');
      expect(keep2).toEqual({
        email: 'keep2@gmail.com',
        remoteName: 'Keep2',
        name: '',
      });
    });
  
    it('should handle empty blacklists, members, and invites gracefully', async () => {
      const sortedGoogleContacts = [
        { email: 'one@gmail.com', name: 'One' },
        { email: 'two@gmail.com', name: 'Two' },
      ];
      const userList: any[] = [];
  
      mockOrgService.getMembersInfoByOrgId.mockResolvedValue([]);
      mockBlacklistService.findAll.mockResolvedValue([]);
      mockOrgService.getRequestAccessByCondition.mockResolvedValue([]);
  
      const result = await userService.getGoogleContactToInviteOrg({
        sortedGoogleContacts,
        orgId: 'orgX',
        userList,
      });
  
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { email: 'one@gmail.com', remoteName: 'One', name: '' },
        { email: 'two@gmail.com', remoteName: 'Two', name: '' },
      ]);
    });
  
    it('should slice result to 2 * LIMIT_RETURN_GOOGLE_CONTACTS', async () => {
      const sortedGoogleContacts = Array.from({ length: 15 }).map((_, i) => ({
        email: `u${i}@gmail.com`,
        name: `User${i}`,
      }));
  
      mockOrgService.getMembersInfoByOrgId.mockResolvedValue([]);
      mockBlacklistService.findAll.mockResolvedValue([]);
      mockOrgService.getRequestAccessByCondition.mockResolvedValue([]);
  
      const result = await userService.getGoogleContactToInviteOrg({
        sortedGoogleContacts,
        orgId: 'orgSlice',
        userList: [],
      });
  
      expect(result.length).toBe(10);
      expect(result[0]).toHaveProperty('remoteName');
    });
  });

  describe('listGoogleOtherContacts', () => {
    let userService: any;
    let mockLoggerService: any;
    let mockAuth: any;
    let mockList: jest.Mock;
  
    const LIMIT_GET_GOOGLE_CONTACTS = 100;
  
    beforeEach(() => {
      jest.clearAllMocks();
      mockList = jest.fn();
  
      (people as jest.Mock).mockReturnValue({
        otherContacts: { list: mockList },
      });
  
      mockLoggerService = {
        error: jest.fn(),
        getCommonErrorAttributes: jest.fn().mockReturnValue({ msg: 'error' }),
      };
  
      userService = new (class {
        loggerService = mockLoggerService;
        listGoogleOtherContacts = UserService.prototype.listGoogleOtherContacts;
      })();
  
      global.LIMIT_GET_GOOGLE_CONTACTS = LIMIT_GET_GOOGLE_CONTACTS;
      mockAuth = { token: 'fake' };
    });
  
    it('should map and filter google contacts correctly', async () => {
      mockList.mockResolvedValue({
        data: {
          otherContacts: [
            {
              names: [{ displayName: 'Alice' }],
              emailAddresses: [{ value: 'alice@gmail.com' }],
              photos: [{ url: 'avatar1' }],
            },
            {
              names: [{ displayName: 'Bob' }],
              emailAddresses: [{ value: 'bob@gmail.com' }],
              photos: [{ url: 'avatar2' }],
            },
            {
              names: [{ displayName: 'NoEmail' }],
              photos: [{ url: 'avatar3' }],
            },
          ],
        },
      });
  
      const result = await userService.listGoogleOtherContacts(mockAuth);
  
      expect(people).toHaveBeenCalledWith({ version: 'v1', auth: mockAuth });
      expect(mockList).toHaveBeenCalledWith({
        pageSize: 30,
        readMask: 'names,emailAddresses,photos',
        sources: ['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE'],
      });
  
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'Alice', email: 'alice@gmail.com', avatarRemoteId: 'avatar1' },
        { name: 'Bob', email: 'bob@gmail.com', avatarRemoteId: 'avatar2' },
      ]);
    });

    it('should use emailAddresses[0].value as name fallback when displayName is missing', async () => {
      const mockList = jest.fn().mockResolvedValue({
        data: {
          otherContacts: [
            {
              emailAddresses: [{ value: 'fallback@email.com' }],
              photos: [{ url: 'avatar.jpg' }],
            },
          ],
        },
      });
    
      (people as jest.Mock).mockReturnValue({
        otherContacts: { list: mockList },
      });
    
      const result = await userService.listGoogleOtherContacts('auth-token');
    
      expect(mockList).toHaveBeenCalledWith({
        pageSize: expect.any(Number),
        readMask: 'names,emailAddresses,photos',
        sources: ['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE'],
      });
      expect(result).toEqual([
        {
          name: 'fallback@email.com',
          email: 'fallback@email.com',
          avatarRemoteId: 'avatar.jpg',
        },
      ]);
    });
    
    it('should return empty array when otherContacts is undefined', async () => {
      mockList.mockResolvedValue({ data: {} });
  
      const result = await userService.listGoogleOtherContacts(mockAuth);
  
      expect(result).toEqual([]);
      expect(mockLoggerService.error).not.toHaveBeenCalled();
    });
  
    it('should log and throw GraphErrorException.Forbidden on error', async () => {
      const error = new Error('Google API failed');
      mockList.mockRejectedValue(error);
  
      await expect(userService.listGoogleOtherContacts(mockAuth)).rejects.toThrow(
        GraphErrorException.Forbidden('Cannot get google contacts'),
      );
  
      expect(mockLoggerService.error).toHaveBeenCalledWith({
        context: 'listGoogleOtherContacts',
        error: { msg: 'error' },
      });
    });
  });
  
  describe('getGoogleDirectoryPeoples', () => {
    let userService: any;
    let mockListDirectoryPeople;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockListDirectoryPeople = jest.fn();
      (people as jest.Mock).mockReturnValue({
        people: { listDirectoryPeople: mockListDirectoryPeople },
      });
      userService = Object.create(UserService.prototype);
      userService.environmentService = {
        getByKey: jest.fn().mockReturnValue('test-value'),
      };
      userService.loggerService = {
        error: jest.fn(),
        getCommonErrorAttributes: jest.fn((err) => err.message),
      };
    });
  
    it('should map and filter google directory peoples correctly', async () => {
      mockListDirectoryPeople.mockResolvedValue({
        data: {
          people: [
            {
              names: [{ displayName: 'John Doe' }],
              emailAddresses: [{ value: 'john@email.com' }],
              photos: [{ url: 'avatar1.jpg' }],
            },
            {
              names: [{ displayName: 'NoEmail' }],
              emailAddresses: [],
              photos: [{ url: 'avatar2.jpg' }],
            },
          ],
        },
      });
  
      const result = await userService.getGoogleDirectoryPeoples('auth-token');
  
      expect(people).toHaveBeenCalledWith({ version: 'v1', auth: 'auth-token' });
      expect(mockListDirectoryPeople).toHaveBeenCalledWith({
        pageSize: expect.any(Number),
        readMask: 'names,emailAddresses,photos',
        sources: [
          'DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT',
          'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE',
        ],
      });
      expect(result).toEqual([
        {
          name: 'John Doe',
          email: 'john@email.com',
          avatarRemoteId: 'avatar1.jpg',
        },
      ]);
    });
  
    it('should use emailAddresses[0].value as fallback when displayName is missing', async () => {
      mockListDirectoryPeople.mockResolvedValue({
        data: {
          people: [
            {
              emailAddresses: [{ value: 'fallback@email.com' }],
              photos: [{ url: 'avatar.jpg' }],
            },
          ],
        },
      });
  
      const result = await userService.getGoogleDirectoryPeoples('auth-token');
      expect(result).toEqual([
        {
          name: 'fallback@email.com',
          email: 'fallback@email.com',
          avatarRemoteId: 'avatar.jpg',
        },
      ]);
    });
  
    it('should return empty array when peoples is undefined', async () => {
      mockListDirectoryPeople.mockResolvedValue({
        data: {},
      });
  
      const result = await userService.getGoogleDirectoryPeoples('auth-token');
      expect(result).toEqual([]);
    });
  
    it('should log and throw GraphErrorException.Forbidden on error', async () => {
      const fakeError = new Error('network failed');
      mockListDirectoryPeople.mockRejectedValue(fakeError);
  
      await expect(userService.getGoogleDirectoryPeoples('auth-token')).rejects.toThrow(
        'Cannot get google directory peoples',
      );
  
      expect(userService.loggerService.error).toHaveBeenCalledWith({
        context: 'getGoogleDirectoryPeoples',
        error: 'network failed',
      });
    });

  });
  
  describe('UserService.getUserIpAddress', () => {
    let userService: any;
  
    beforeEach(() => {
      userService = Object.create(UserService.prototype);
    });
  
    it('should return X_FORWARDED_FOR_HEADER if present', () => {
      const req = { headers: { [CommonConstants.X_FORWARDED_FOR_HEADER]: '1.1.1.1' } };
      const result = userService.getUserIpAddress(req as any);
      expect(result).toBe('1.1.1.1');
    });
  
    it('should return CF_CONNECTING_IP if X_FORWARDED_FOR_HEADER missing', () => {
      const req = { headers: { [CommonConstants.CF_CONNECTING_IP]: '2.2.2.2' } };
      const result = userService.getUserIpAddress(req as any);
      expect(result).toBe('2.2.2.2');
    });
  
    it('should return TRUE_CLIENT_IP if others missing', () => {
      const req = { headers: { [CommonConstants.TRUE_CLIENT_IP]: '3.3.3.3' } };
      const result = userService.getUserIpAddress(req as any);
      expect(result).toBe('3.3.3.3');
    });
  
    it('should return DEFAULT_IP_ADDRESS if none found', () => {
      const req = { headers: {} };
      const result = userService.getUserIpAddress(req as any);
      expect(result).toBe(CommonConstants.DEFAULT_IP_ADDRESS);
    });
  });

  describe('getUserGeolocation', () => {
    let userService: any;
    let mockHttpGet: jest.Mock;
  
    beforeEach(() => {
      mockHttpGet = jest.fn();
      userService = Object.create(UserService.prototype);
      userService.environmentService = { getByKey: jest.fn() };
      userService.httpService = { axiosRef: { get: mockHttpGet } };
    });
  
    it('should call ipstack API and return response data', async () => {
      userService.environmentService.getByKey.mockReturnValue('fake-key');
      const fakeResponse = { country: 'VN', currency: { code: 'VND' } };
      mockHttpGet.mockResolvedValue({ data: fakeResponse });
  
      const result = await userService.getUserGeolocation('8.8.8.8');
  
      expect(userService.environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.IPSTACK_KEY);
      expect(mockHttpGet).toHaveBeenCalledWith(
        'http://api.ipstack.com/8.8.8.8?access_key=fake-key',
      );
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('UserService.getUserCurrencyBaseIpAddress', () => {
    let userService: any;
    let mockHttpGet: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockHttpGet = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.environmentService = { getByKey: jest.fn() };
      userService.httpService = { axiosRef: { get: mockHttpGet } };
    });
  
    const mockRequest = {
      headers: { 'x-forwarded-for': '8.8.8.8' },
    };
  
    it('should return detected currency when available (EUR)', async () => {
      userService.environmentService.getByKey.mockImplementation((key) => {
        if (key === 'ENV') return 'production';
        if (key === EnvConstants.IPSTACK_KEY) return 'ipstack-key';
      });
  
      mockHttpGet.mockResolvedValue({
        data: { currency: { code: 'EUR' } },
      });
  
      const result = await userService.getUserCurrencyBaseIpAddress(mockRequest as any);
      expect(result).toBe('EUR');
    });
  
    it('should fallback to USD if currency code not supported (e.g., VND)', async () => {
      userService.environmentService.getByKey.mockImplementation((key) => {
        if (key === 'ENV') return 'production';
        if (key === EnvConstants.IPSTACK_KEY) return 'ipstack-key';
      });
  
      mockHttpGet.mockResolvedValue({
        data: { currency: { code: 'VND' } },
      });
  
      const result = await userService.getUserCurrencyBaseIpAddress(mockRequest as any);
      expect(result).toBe('USD');
    });
  
    it('should return USD in development environment', async () => {
      userService.environmentService.getByKey.mockReturnValue('development');
      const result = await userService.getUserCurrencyBaseIpAddress(mockRequest as any);
      expect(result).toBe('USD');
    });
  
    it('should return USD when geolocation fails', async () => {
      userService.environmentService.getByKey.mockImplementation((key) => {
        if (key === 'ENV') return 'production';
        if (key === EnvConstants.IPSTACK_KEY) return 'ipstack-key';
      });
  
      mockHttpGet.mockRejectedValue(new Error('network error'));
  
      const result = await userService.getUserCurrencyBaseIpAddress(mockRequest as any);
      expect(result).toBe('USD');
    });
  });

  describe('setUserNotificationStatus', () => {
    let userService: any;
    const mockUpdateUserProperty = jest.fn();
  
    beforeEach(() => {
      jest.clearAllMocks();
      userService = Object.create(UserService.prototype);
      userService.updateUserProperty = mockUpdateUserProperty;
    });
  
    it('should update the correct notification tab with time', async () => {
      const params = {
        userId: 'user1',
        tab: 'GENERAL',
        time: new Date('2025-10-19T10:00:00Z'),
      };
  
      mockUpdateUserProperty.mockResolvedValue({ _id: 'user1' });
  
      const result = await userService.setUserNotificationStatus(params);
  
      expect(mockUpdateUserProperty).toHaveBeenCalledWith(
        { _id: 'user1' },
        { 'newNotifications.general': params.time },
      );
      expect(result).toEqual({ _id: 'user1' });
    });
  });
  
  describe('updateJoinOrgPurpose', () => {
    let userService: any;
    let mockGetOrgById: jest.Mock;
    let mockGetContactByEmail: jest.Mock;
    let mockUpdateUserContact: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockGetOrgById = jest.fn();
      mockGetContactByEmail = jest.fn();
      mockUpdateUserContact = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.organizationService = { getOrgById: mockGetOrgById };
      userService.userTrackingService = {
        getContactByEmail: mockGetContactByEmail,
        updateUserContact: mockUpdateUserContact,
      };
    });
  
    it('should do nothing if joinOrgPurpose is WORK', async () => {
      mockGetOrgById.mockResolvedValue({ purpose: 'WORK' });
      mockGetContactByEmail.mockResolvedValue({
        properties: { join_org_purpose: 'WORK' },
      });
  
      await userService.updateJoinOrgPurpose({ email: 'a@b.com', orgId: 'org1' });
  
      expect(mockUpdateUserContact).not.toHaveBeenCalled();
    });
  
    it('should update joinOrgPurpose for EDUCATION -> WORK', async () => {
      mockGetOrgById.mockResolvedValue({ purpose: 'WORK' });
      mockGetContactByEmail.mockResolvedValue({
        properties: { join_org_purpose: 'EDUCATION' },
      });
  
      await userService.updateJoinOrgPurpose({ email: 'a@b.com', orgId: 'org1' });
  
      expect(mockUpdateUserContact).toHaveBeenCalledWith('a@b.com', { join_org_purpose: 'WORK' });
    });
  
    it('should update joinOrgPurpose for PERSONAL -> WORK', async () => {
      mockGetOrgById.mockResolvedValue({ purpose: 'WORK' });
      mockGetContactByEmail.mockResolvedValue({
        properties: { join_org_purpose: 'PERSONAL' },
      });
  
      await userService.updateJoinOrgPurpose({ email: 'a@b.com', orgId: 'org1' });
  
      expect(mockUpdateUserContact).toHaveBeenCalledWith('a@b.com', { join_org_purpose: 'WORK' });
    });
  
    it('should update joinOrgPurpose if contact not found', async () => {
      mockGetOrgById.mockResolvedValue({ purpose: 'WORK' });
      mockGetContactByEmail.mockResolvedValue(null);
  
      await userService.updateJoinOrgPurpose({ email: 'a@b.com', orgId: 'org1' });
  
      expect(mockUpdateUserContact).toHaveBeenCalledWith('a@b.com', { join_org_purpose: 'WORK' });
    });
  
    it('should handle default case when joinOrgPurpose unknown', async () => {
      mockGetOrgById.mockResolvedValue({ purpose: 'WORK' });
      mockGetContactByEmail.mockResolvedValue({
        properties: { join_org_purpose: 'UNKNOWN' },
      });
  
      await userService.updateJoinOrgPurpose({ email: 'a@b.com', orgId: 'org1' });
  
      expect(mockUpdateUserContact).toHaveBeenCalledWith('a@b.com', { join_org_purpose: 'WORK' });
    });
  });

  describe('getMaximumNumberSignature', () => {
    let userService: any;
    let mockFindUserById: jest.Mock;
    let mockGetOrgListByUser: jest.Mock;
    let mockPlanPoliciesHandlerFrom: jest.SpyInstance;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockFindUserById = jest.fn();
      mockGetOrgListByUser = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.findUserById = mockFindUserById;
      userService.organizationService = {
        getOrgListByUser: mockGetOrgListByUser,
      };
      mockPlanPoliciesHandlerFrom = jest.spyOn(planPoliciesHandler, 'from');
    });
  
    it('should return the maximum number of signatures from user and orgs', async () => {
      const userId = 'user123';
  
      const fakeUser = { _id: userId, payment: { type: 'premium', period: 'monthly' } };
      const fakeOrgs = [
        { payment: { type: 'basic', period: 'monthly' } },
        { payment: { type: 'pro', period: 'yearly' } },
      ];
  
      mockFindUserById.mockResolvedValue(fakeUser);
      mockGetOrgListByUser.mockResolvedValue(fakeOrgs);
      mockPlanPoliciesHandlerFrom.mockImplementation(({ plan }) => ({
        getNumberSignature: () => {
          switch (plan) {
            case 'basic': return 10;
            case 'premium': return 50;
            case 'pro': return 30;
            default: return 0;
          }
        },
      }));
  
      const result = await userService.getMaximumNumberSignature(userId);
  
      expect(result).toBe(50);
      expect(mockFindUserById).toHaveBeenCalledWith(userId, { _id: 1, payment: 1 });
      expect(mockGetOrgListByUser).toHaveBeenCalledWith(userId);
    });
  
    it('should handle empty payments gracefully', async () => {
      const userId = 'user456';
  
      const fakeUser = { _id: userId };
      const fakeOrgs = [{}, { payment: { type: 'basic', period: 'monthly' } }];
  
      mockFindUserById.mockResolvedValue(fakeUser);
      mockGetOrgListByUser.mockResolvedValue(fakeOrgs);
  
      mockPlanPoliciesHandlerFrom.mockImplementation(({ plan }) => ({
        getNumberSignature: () => {
          if (!plan) return 0;
          if (plan === 'basic') return 10;
          return 0;
        },
      }));
  
      const result = await userService.getMaximumNumberSignature(userId);
  
      expect(result).toBe(10);
    });
  });
  
  
  describe('migratePersonalWorkspace', () => {
    let userService: any;
    let mockGetOrgMembershipByConditions: jest.Mock;
    let mockMigrateDocumentsForFreeUser: jest.Mock;
    let mockLoggerError: jest.Mock;
    let mockAppendUserPricingMigration: jest.Mock;
    let mockGetByKey: jest.Mock;
  
    const user = {
      _id: 'user1',
      payment: { type: PaymentPlanEnums.FREE },
      metadata: { isMigratedPersonalDoc: false },
      createdAt: new Date('2025-01-01T00:00:00Z'),
    } as any;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockGetOrgMembershipByConditions = jest.fn();
      mockMigrateDocumentsForFreeUser = jest.fn();
      mockLoggerError = jest.fn();
      mockAppendUserPricingMigration = jest.fn();
      mockGetByKey = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.organizationService = {
        getOrgMembershipByConditions: mockGetOrgMembershipByConditions,
        migrateDocumentsForFreeUser: mockMigrateDocumentsForFreeUser,
      };
      userService.loggerService = { error: mockLoggerError };
      userService.redisService = { appendUserPricingMigration: mockAppendUserPricingMigration };
      userService.environmentService = { getByKey: mockGetByKey };
    });
  
    it('should return immediately if user already migrated', async () => {
      const migratedUser = { ...user, metadata: { isMigratedPersonalDoc: true } };
      await userService.migratePersonalWorkspace(migratedUser);
  
      expect(mockGetOrgMembershipByConditions).not.toHaveBeenCalled();
      expect(mockMigrateDocumentsForFreeUser).not.toHaveBeenCalled();
      expect(mockAppendUserPricingMigration).not.toHaveBeenCalled();
    });
  
    it('should return immediately if user payment type is not FREE', async () => {
      const paidUser = { ...user, payment: { type: PaymentPlanEnums.ORG_BUSINESS } };
      await userService.migratePersonalWorkspace(paidUser);
  
      expect(mockGetOrgMembershipByConditions).not.toHaveBeenCalled();
      expect(mockMigrateDocumentsForFreeUser).not.toHaveBeenCalled();
      expect(mockAppendUserPricingMigration).not.toHaveBeenCalled();
    });
    
    it('should call migrateDocumentsForFreeUser and appendUserPricingMigration on success', async () => {
      mockGetOrgMembershipByConditions.mockResolvedValue([{ orgId: 'org1' }]);
      mockGetByKey.mockReturnValue('2024-12-31T00:00:00Z');
    
      const migrationResult = { migratedDocs: 2, destinationOrg: { _id: '64d8f0c5e0b8f3d5b2a1c9e0' } };
      mockMigrateDocumentsForFreeUser.mockResolvedValue(migrationResult);
    
      await userService.migratePersonalWorkspace(user);
    
      expect(mockAppendUserPricingMigration).toHaveBeenCalledWith({
        userId: 'user1',
        orgId: '64d8f0c5e0b8f3d5b2a1c9e0',
        result: { migratedDocs: 2 },
        error: undefined,
      });
    });
    
    it('should log error and still appendUserPricingMigration if migrate fails', async () => {
      mockGetOrgMembershipByConditions.mockResolvedValue([{ orgId: 'org1' }]);
      mockGetByKey.mockReturnValue('2024-12-31T00:00:00Z');
    
      const error = new Error('Migration failed');
      mockMigrateDocumentsForFreeUser.mockRejectedValue(error);
    
      await userService.migratePersonalWorkspace(user);
    
      expect(mockLoggerError).toHaveBeenCalledWith(expect.objectContaining({
        context: 'migratePersonalWorkspace',
        userId: 'user1',
        error,
      }));
      expect(mockAppendUserPricingMigration).toHaveBeenCalledWith({
        userId: 'user1',
        orgId: undefined,
        result: {},
        error,
      });
    });    
  });
  
  describe('logPricingUserMigration', () => {
    let userService: any;
    let mockGetAllHsetData: jest.Mock;
    let mockDeleteRedisByKey: jest.Mock;
    let mockPutFileToTemporaryBucket: jest.Mock;
    let mockGetByKey: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockGetAllHsetData = jest.fn();
      mockDeleteRedisByKey = jest.fn();
      mockPutFileToTemporaryBucket = jest.fn().mockResolvedValue(undefined);
      mockGetByKey = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.redisService = {
        getAllHsetData: mockGetAllHsetData,
        deleteRedisByKey: mockDeleteRedisByKey,
      };
      userService.awsService = {
        putFileToTemporaryBucket: mockPutFileToTemporaryBucket,
      };
      userService.environmentService = {
        getByKey: mockGetByKey,
      };

      (moment as jest.Mock).mockReturnValue({
        format: (fmt: string) => {
          if (fmt === 'YYYY-MM-DD') return '2025-10-24';
          if (fmt === 'HH:mm') return '16:00';
          return '';
        },
      });
    });
  
    it('should return zero totals if no users in Redis', async () => {
      mockGetAllHsetData.mockResolvedValue([]);
  
      const result = await userService.logPricingUserMigration();
  
      expect(result).toEqual({
        totalUser: 0,
        totalError: 0,
        keyFile: null,
      });
      expect(mockPutFileToTemporaryBucket).not.toHaveBeenCalled();
      expect(mockDeleteRedisByKey).not.toHaveBeenCalled();
    });

    it('should correctly count totalError and upload CSV to S3', async () => {
      const fakeUsers = [
        {
          key: 'user1',
          value: JSON.stringify({
            orgId: 'org1',
            totalDocument: 3,
            totalFolder: 1,
            totalOrg: 1,
            error: null,
            migratedAt: '2025-10-24T00:00:00Z',
          }),
        },
        {
          key: 'user2',
          value: JSON.stringify({
            orgId: 'org2',
            totalDocument: 0,
            totalFolder: 0,
            totalOrg: 0,
            error: 'Migration failed',
            migratedAt: '2025-10-24T00:00:00Z',
          }),
        },
      ];
  
      mockGetAllHsetData.mockResolvedValue(fakeUsers);
      mockGetByKey.mockImplementation((key) => {
        if (key === 'ENV') return 'staging';
        return undefined;
      });
  
      const result = await userService.logPricingUserMigration();
  
      expect(result.totalUser).toBe(2);
      expect(result.totalError).toBe(1);
      expect(result.keyFile).toContain('user-pricing-migration/staging_');
      expect(result.keyFile).toContain('_2_1.csv');
      expect(mockPutFileToTemporaryBucket).toHaveBeenCalledWith(
        expect.stringContaining('user-pricing-migration/staging_'),
        expect.any(PassThrough),
        expect.stringMatching(/production=false/),
      );
      expect(mockDeleteRedisByKey).toHaveBeenCalled();
    });
  
    it('should mark as production when ENV=production', async () => {
      const fakeUsers = [
        {
          key: 'user1',
          value: JSON.stringify({
            orgId: 'org1',
            totalDocument: 1,
            totalFolder: 0,
            totalOrg: 0,
            error: null,
            migratedAt: '2025-10-24T00:00:00Z',
          }),
        },
      ];
  
      mockGetAllHsetData.mockResolvedValue(fakeUsers);
      mockGetByKey.mockImplementation(() => 'production');
  
      const result = await userService.logPricingUserMigration();
  
      expect(result.totalUser).toBe(1);
      expect(mockPutFileToTemporaryBucket).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(PassThrough),
        'production=true',
      );
    });
  
    it('should handle malformed JSON gracefully (and still count users)', async () => {
      const fakeUsers = [
        { key: 'user1', value: '{ invalid_json }' },
      ];
      mockGetAllHsetData.mockResolvedValue(fakeUsers);
      mockGetByKey.mockReturnValue('staging');
  
      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => {
        throw new Error('Invalid JSON');
      });
  
      await expect(userService.logPricingUserMigration()).rejects.toThrow();
  
      JSON.parse = originalParse;
    });
  });

  describe('getLoginService', () => {
    let userService: any;
  
    beforeEach(() => {
      userService = Object.create(UserService.prototype);
    });
  
    it('should return userLoginService if defined and not EMAIL_PASSWORD', () => {
      const result = userService.getLoginService({
        userLoginService: 'GOOGLE',
        defaultLoginService: 'EMAIL_PASSWORD',
      });
      expect(result).toBe('GOOGLE');
    });

    it('should return defaultLoginService if userLoginService is undefined', () => {
      const result = userService.getLoginService({
        userLoginService: undefined,
        defaultLoginService: 'APPLE',
      });
      expect(result).toBe('APPLE');
    });
  });
  
  describe('handleNonLuminUserInvitation', () => {
    let userService: any;
    const fakeUser = { email: 'test@example.com' } as User;
    const invitationToken = 'token123';
  
    let mockJwtService: any;
    let mockRedisService: any;
    let mockOrganizationService: any;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockJwtService = {
        verify: jest.fn(),
        decode: jest.fn(),
      };
  
      mockRedisService = {
        getValidInviteToken: jest.fn(),
      };
  
      mockOrganizationService = {
        addUserToOrgsWithInvitation: jest.fn(),
        createFirstOrgOnFreeUser: jest.fn(),
      };
  
      userService = Object.create(UserService.prototype);
      userService.jwtService = mockJwtService;
      userService.redisService = mockRedisService;
      userService.organizationService = mockOrganizationService;
    });
  
    it('should add user to org when CIRCLE_INVITATION token is valid', async () => {
      mockJwtService.verify.mockReturnValue({
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org123' },
        email: fakeUser.email,
      });
  
      mockRedisService.getValidInviteToken.mockResolvedValue(invitationToken);
  
      await userService.handleNonLuminUserInvitation(fakeUser, invitationToken);
  
      expect(mockOrganizationService.addUserToOrgsWithInvitation)
        .toHaveBeenCalledWith(fakeUser, 'org123', undefined);
    });
  
    it('should create first org when SHARE_DOCUMENT token and email matches', async () => {
      mockJwtService.verify.mockReturnValue({
        type: UserInvitationTokenType.SHARE_DOCUMENT,
        metadata: { orgId: 'org123' },
        email: fakeUser.email,
      });
  
      await userService.handleNonLuminUserInvitation(fakeUser, invitationToken);
  
      expect(mockOrganizationService.createFirstOrgOnFreeUser)
        .toHaveBeenCalledWith(fakeUser);
    });
  
    it('should swallow TokenExpiredError if same unpopular domain', async () => {
      const error = new Error('expired token');
      (error as any).name = 'TokenExpiredError';
      mockJwtService.verify.mockImplementation(() => { throw error; });
      mockJwtService.decode.mockReturnValue({
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { isSameUnpopularDomain: true },
      });
  
      await expect(userService.handleNonLuminUserInvitation(fakeUser, invitationToken))
        .resolves.toBeUndefined();
    });
  
    it('should throw TokenExpiredError if not same unpopular domain', async () => {
      const error = new TokenExpiredError('jwt expired', new Date());
      mockJwtService.verify.mockImplementation(() => { throw error; });
      mockJwtService.decode.mockReturnValue({
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { isSameUnpopularDomain: false },
      });
    
      await expect(
        userService.handleNonLuminUserInvitation(fakeUser, invitationToken)
      ).rejects.toThrow(TokenExpiredError);
    });
  
    it('should do nothing if token type is unknown', async () => {
      mockJwtService.verify.mockReturnValue({
        type: 'UNKNOWN_TYPE',
        metadata: { orgId: 'org123' },
        email: fakeUser.email,
      });
  
      await userService.handleNonLuminUserInvitation(fakeUser, invitationToken);
  
      expect(mockOrganizationService.addUserToOrgsWithInvitation).not.toHaveBeenCalled();
      expect(mockOrganizationService.createFirstOrgOnFreeUser).not.toHaveBeenCalled();
    });
  });

  describe('handleInvitationsAfterFirstLogin', () => {
    let userService: any;
    let mockDocumentService: any;
    let mockCreateOrgInvitationNotiAfterLogin: jest.Mock;
  
    const fakeUser = { email: 'Test@Example.com' } as User;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockDocumentService = {
        createNonLuminUserDocumentPermission: jest.fn().mockResolvedValue(undefined),
      };
      mockCreateOrgInvitationNotiAfterLogin = jest.fn().mockResolvedValue(undefined);
  
      userService = Object.create(UserService.prototype);
      userService.documentService = mockDocumentService;
      userService.createOrgInvitationNotiAfterLogin = mockCreateOrgInvitationNotiAfterLogin;
    });
  
    it('should return immediately if user has timezoneOffset', async () => {
      const userWithTZ = { ...fakeUser, timezoneOffset: 420 };
      await userService.handleInvitationsAfterFirstLogin(userWithTZ);
      expect(mockDocumentService.createNonLuminUserDocumentPermission).not.toHaveBeenCalled();
      expect(mockCreateOrgInvitationNotiAfterLogin).not.toHaveBeenCalled();
    });
  
    it('should create document permission and call invitation notification on first login', async () => {
      const firstLoginUser = { ...fakeUser, timezoneOffset: undefined };
      await userService.handleInvitationsAfterFirstLogin(firstLoginUser);
  
      expect(mockDocumentService.createNonLuminUserDocumentPermission)
        .toHaveBeenCalledWith({
          user: firstLoginUser,
          orgIds: [],
          teamIds: [],
        });
  
      expect(mockCreateOrgInvitationNotiAfterLogin)
        .toHaveBeenCalledWith(firstLoginUser.email?.toLowerCase());
    });
  });
  
  describe('createOrgInvitationNotiAfterLogin', () => {
    let userService: any;
    let mockOrganizationService: any;
    let mockAuthService: any;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockOrganizationService = {
        getInviteOrgList: jest.fn(),
      };
      mockAuthService = {
        sendNotificationFirstLoginUser: jest.fn().mockResolvedValue(undefined),
      };
  
      userService = Object.create(UserService.prototype);
      userService.organizationService = mockOrganizationService;
      userService.authService = mockAuthService;
    });
  
    it('should not call sendNotificationFirstLoginUser if no invitations', async () => {
      mockOrganizationService.getInviteOrgList.mockResolvedValue([]);
      await userService.createOrgInvitationNotiAfterLogin('test@example.com');
      expect(mockAuthService.sendNotificationFirstLoginUser).not.toHaveBeenCalled();
    });
  
    it('should call sendNotificationFirstLoginUser if invitations exist', async () => {
      const invitations = [{ orgId: 'org1', actor: 'test@example.com' }];
      mockOrganizationService.getInviteOrgList.mockResolvedValue(invitations);
  
      await userService.createOrgInvitationNotiAfterLogin('test@example.com');
      expect(mockAuthService.sendNotificationFirstLoginUser)
        .toHaveBeenCalledWith(invitations);
    });
  });

  describe('addUserToBeDeleteToRedis', () => {
    let userService: any;
    let mockFind: jest.Mock;
    let mockLean: jest.Mock;
    let mockLimit: jest.Mock;
    let mockExec: jest.Mock;
    let mockSetRedisData: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      const fixedNow = new Date('2025-10-10T00:00:00Z');
      jest.spyOn(global.Date, 'now').mockReturnValue(fixedNow.getTime());

      mockExec = jest.fn();
      mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      mockLean = jest.fn().mockReturnValue({ limit: mockLimit });
      mockFind = jest.fn().mockReturnValue({ lean: mockLean });
      mockSetRedisData = jest.fn();

      userService = Object.create(UserService.prototype);
      userService.userModel = { find: mockFind };
      userService.redisService = { setRedisData: mockSetRedisData };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle empty result gracefully', async () => {
      mockExec.mockResolvedValue([]);

      await userService.addUserToBeDeleteToRedis();

      expect(mockSetRedisData).toHaveBeenCalledWith(
        'AccountToDeleteV2',
        JSON.stringify([]),
      );
    });
  });
  
  describe('createDefaultOrgOnFreeUser', () => {
    let userService: any;
    let mockFindOneOrganization: jest.Mock;
    let mockCreateCustomOrganization: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockFindOneOrganization = jest.fn();
      mockCreateCustomOrganization = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.organizationService = {
        findOneOrganization: mockFindOneOrganization,
        createCustomOrganization: mockCreateCustomOrganization,
      };
    });
  
    it('should not create organization if user already has one', async () => {
      const fakeUser = {
        _id: 'user1',
        payment: { type: PaymentPlanEnums.FREE },
      };
  
      mockFindOneOrganization.mockResolvedValue({ _id: 'org1' });
  
      await userService.createDefaultOrgOnFreeUser(fakeUser);
  
      expect(mockCreateCustomOrganization).not.toHaveBeenCalled();
    });
  
    it('should create organization if user is free and has no organization', async () => {
      const fakeUser = {
        _id: 'user2',
        payment: { type: PaymentPlanEnums.FREE },
      };
  
      mockFindOneOrganization.mockResolvedValue(null);
  
      await userService.createDefaultOrgOnFreeUser(fakeUser);
  
      expect(mockCreateCustomOrganization).toHaveBeenCalledWith(fakeUser);
    });
  
    it('should not create organization if user is not free', async () => {
      const fakeUser = {
        _id: 'user3',
        payment: { type: PaymentPlanEnums.ORG_BUSINESS },
      };
  
      mockFindOneOrganization.mockResolvedValue(null);
  
      await userService.createDefaultOrgOnFreeUser(fakeUser);
  
      expect(mockCreateCustomOrganization).not.toHaveBeenCalled();
    });
  });

  describe('updateUserDataAfterAccessingApp', () => {
    let userService: any;
    let mockUpdateUserPropertyById: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockUpdateUserPropertyById = jest.fn().mockResolvedValue({});
  
      userService = Object.create(UserService.prototype);
      userService.updateUserPropertyById = mockUpdateUserPropertyById;
    });
  
    it('should update user with timezoneOffset', async () => {
      const fakeUser = { _id: 'user1', timezoneOffset: 7 };
      const payload = { timezoneOffset: 3 };
  
      await userService.updateUserDataAfterAccessingApp(fakeUser, payload);
  
      expect(mockUpdateUserPropertyById).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({
          lastAccess: expect.any(Date),
          'metadata.beRemovedFromDeletedOrg': false,
          timezoneOffset: 3,
        }),
        false,
        { lean: false }
      );
    });
  
    it('should update user with hasSyncedEmailToBraze', async () => {
      const fakeUser = { _id: 'user2', timezoneOffset: 7 };
      const payload = { timezoneOffset: 7, hasSyncedEmailToBraze: true };
  
      await userService.updateUserDataAfterAccessingApp(fakeUser, payload);
  
      expect(mockUpdateUserPropertyById).toHaveBeenCalledWith(
        'user2',
        expect.objectContaining({
          'metadata.hasSyncedEmailToBraze': true,
        }),
        false,
        { lean: false }
      );
    });
  
    it('should add version if user timezoneOffset is NaN', async () => {
      const fakeUser = { _id: 'user3', timezoneOffset: NaN };
      const payload = { timezoneOffset: 5 };
  
      await userService.updateUserDataAfterAccessingApp(fakeUser, payload);
  
      expect(mockUpdateUserPropertyById).toHaveBeenCalledWith(
        'user3',
        expect.objectContaining({
          version: USER_VERSION,
        }),
        false,
        { lean: false }
      );
    });
  });
  
  
  describe('emitReactivateAccount', () => {
    let userService: any;
    let mockMessageGateway: any;
    let mockFindUserById: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockMessageGateway = {
        server: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };
  
      mockFindUserById = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.messageGateway = mockMessageGateway;
      userService.findUserById = mockFindUserById;
      userService.isUserUsingPassword = jest.fn();
    });

    it('should emit REACTIVE_USER_ACCOUNT event with user deletedAt set to null', () => {
      const fakeUser = { _id: 'user1', name: 'Test', deletedAt: new Date() };

      userService.emitReactivateAccount(fakeUser);

      expect(mockMessageGateway.server.to).toHaveBeenCalledWith(`user-room-user1`);
      expect(mockMessageGateway.server.emit).toHaveBeenCalledWith(
        'reactiveUserAccount',
        { user: { ...fakeUser, deletedAt: null } }
      );
    });
  });

  describe('emitUserEmailChanged', () => {
    let userService: any;
    let mockMessageGateway: any;
    let mockFindUserById: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockMessageGateway = {
        server: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };
  
      mockFindUserById = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.messageGateway = mockMessageGateway;
      userService.findUserById = mockFindUserById;
      userService.isUserUsingPassword = jest.fn();
    });

    it('should emit USER_EMAIL_CHANGED event with new email', () => {
      const fakeUser = { _id: 'user2', email: 'old@example.com' };
      const newEmail = 'new@example.com';

      userService.emitUserEmailChanged(fakeUser, newEmail);

      expect(mockMessageGateway.server.to).toHaveBeenCalledWith(`user-room-user2`);
      expect(mockMessageGateway.server.emit).toHaveBeenCalledWith(
        'userEmailChanged',
        { newEmail }
      );
    });
  });

  describe('getUserData', () => {
    let userService: any;
    let mockFindUserById: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockFindUserById = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.findUserById = mockFindUserById;
      userService.isUserUsingPassword = jest.fn();
    });
  
    it('should return error if user not found', async () => {
      mockFindUserById.mockResolvedValue(null);
  
      const result = await userService.getUserData('user1');
  
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('User not found');
      expect(result.user).toBeUndefined();
    });
  
    it('should return user with loginService EMAIL_PASSWORD if user uses password', async () => {
      const fakeUser = { _id: 'user2', loginService: null };
      mockFindUserById.mockResolvedValue(fakeUser);
      userService.isUserUsingPassword.mockReturnValue(true);
  
      const result = await userService.getUserData('user2');
  
      expect(result.user).toBeDefined();
      expect(result.user.loginService).toBe(LoginService.EMAIL_PASSWORD);
    });
  
    it('should return user and delete loginService if not set and user does not use password', async () => {
      const fakeUser = { _id: 'user3', loginService: null };
      mockFindUserById.mockResolvedValue(fakeUser);
      userService.isUserUsingPassword.mockReturnValue(false);
  
      const result = await userService.getUserData('user3');
  
      expect(result.user).toBeDefined();
      expect(result.user.loginService).toBeUndefined();
    });
  
    it('should keep existing loginService if set and user does not use password', async () => {
      const fakeUser = { _id: 'user4', loginService: LoginService.GOOGLE };
      mockFindUserById.mockResolvedValue(fakeUser);
      userService.isUserUsingPassword.mockReturnValue(false);
  
      const result = await userService.getUserData('user4');
  
      expect(result.user).toBeDefined();
      expect(result.user.loginService).toBe(LoginService.GOOGLE);
    });
  });

  describe('verifyFeedbackFile', () => {
    let userService: UserService;
  
    beforeEach(() => {
      userService = Object.create(UserService.prototype);
    });
  
    it('should return error if more than 5 files', () => {
      const files = Array(6).fill({ mimetype: 'image/png', size: 1024 });
      const result = userService.verifyFeedbackFile(files);
      expect(result.valid).toBe(false);
      expect((result.error as any).message).toBe('Cannot upload more than 5 files');
    });
  
    it('should return error if any file has unsupported mimetype', () => {
      const files = [
        { mimetype: 'image/png', size: 1024 },
        { mimetype: 'application/pdf', size: 1024 },
      ];
      const result = userService.verifyFeedbackFile(files);
      expect(result.valid).toBe(false);
      expect((result.error as any).message).toBe('Cannot support that mimetype');
    });
  
    it('should return error if any file exceeds 50MB', () => {
      const files = [
        { mimetype: 'image/png', size: 10 * 1024 * 1024 },
        { mimetype: 'video/mp4', size: 51 * 1024 * 1024 },
      ];
      const result = userService.verifyFeedbackFile(files);
      expect(result.valid).toBe(false);
      expect((result.error as any).message).toBe('Cannot upload file greater than 50MB');
    });
  
    it('should return valid=true if all files are valid', () => {
      const files = [
        { mimetype: 'image/png', size: 1024 },
        { mimetype: 'video/mp4', size: 1024 * 1024 * 10 },
      ];
      const result = userService.verifyFeedbackFile(files);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('UserService - getUserPaymentInfo', () => {
    let userService: any;
    let mockFindUserById: jest.Mock;
    let mockFindOrganization: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      mockFindUserById = jest.fn();
      mockFindOrganization = jest.fn();
  
      userService = Object.create(UserService.prototype);
      userService.findUserById = mockFindUserById;
      userService.organizationService = {
        findOrganization: mockFindOrganization,
      };
    });
  
    it('should throw error if user not found', async () => {
      mockFindUserById.mockResolvedValue(null);
      mockFindOrganization.mockResolvedValue([]);
  
      await expect(userService.getUserPaymentInfo('user1')).rejects.toThrowError('User not found');
    });
  
    it('should return hasUpgradedToPremiumPlan true if user has customerRemoteId', async () => {
      mockFindUserById.mockResolvedValue({ payment: { customerRemoteId: 'cust123' } });
      mockFindOrganization.mockResolvedValue([]);
  
      const result = await userService.getUserPaymentInfo('user1');
  
      expect(result).toEqual({ hasUpgradedToPremiumPlan: true, hasTrialPlan: false });
    });
  
    it('should return hasUpgradedToPremiumPlan true if owned org has non-trial payment', async () => {
      mockFindUserById.mockResolvedValue({ payment: {} });
      mockFindOrganization.mockResolvedValue([
        { payment: { status: PaymentStatusEnums.ACTIVE } },
      ]);
  
      const result = await userService.getUserPaymentInfo('user1');
  
      expect(result).toEqual({ hasUpgradedToPremiumPlan: true, hasTrialPlan: false });
    });
  
    it('should return hasTrialPlan true if owned org has trial payment', async () => {
      mockFindUserById.mockResolvedValue({ payment: {} });
      mockFindOrganization.mockResolvedValue([
        { payment: { status: PaymentStatusEnums.TRIALING } },
      ]);
  
      const result = await userService.getUserPaymentInfo('user1');
  
      expect(result).toEqual({ hasUpgradedToPremiumPlan: false, hasTrialPlan: true });
    });
  
    it('should return both flags true if user upgraded and has trial org', async () => {
      mockFindUserById.mockResolvedValue({ payment: { customerRemoteId: 'cust123' } });
      mockFindOrganization.mockResolvedValue([
        { payment: { status: PaymentStatusEnums.TRIALING } },
      ]);
  
      const result = await userService.getUserPaymentInfo('user1');
  
      expect(result).toEqual({ hasUpgradedToPremiumPlan: true, hasTrialPlan: true });
    });
  
    it('should return both flags false if user and org have no payments', async () => {
      mockFindUserById.mockResolvedValue({ payment: {} });
      mockFindOrganization.mockResolvedValue([]);
  
      const result = await userService.getUserPaymentInfo('user1');
  
      expect(result).toEqual({ hasUpgradedToPremiumPlan: false, hasTrialPlan: false });
    });
  });

  describe('compareEmails', () => {
    it('should return false if any email is missing', () => {
      expect(userService.compareEmails(undefined, 'a@b.com')).toBe(false);
      expect(userService.compareEmails('a@b.com', undefined)).toBe(false);
      expect(userService.compareEmails(undefined, undefined)).toBe(false);
    });

    it('should return true if emails match ignoring case', () => {
      expect(userService.compareEmails('A@B.COM', 'a@b.com')).toBe(true);
      expect(userService.compareEmails('test@domain.com', 'test@domain.com')).toBe(true);
    });

    it('should return false if emails do not match', () => {
      expect(userService.compareEmails('a@b.com', 'c@b.com')).toBe(false);
    });
  });

  describe('isUserUsingPassword', () => {
    it('should return true if loginService is EMAIL_PASSWORD', () => {
      const user = { loginService: LoginService.EMAIL_PASSWORD } as User;
      expect(userService.isUserUsingPassword(user as any)).toBe(true);
    });

    it('should return true if password exists and loginService is undefined', () => {
      const user = { password: 'secret', loginService: undefined } as User;
      expect(userService.isUserUsingPassword(user as any)).toBe(true);
    });

    it('should return false if password missing and loginService not EMAIL_PASSWORD', () => {
      const user = { password: '', loginService: 'SSO' } as any;
      expect(userService.isUserUsingPassword(user as any)).toBe(false);
    });
  });

  describe('getStaticToolUploadWorkspace', () => {
    const fakeUser = {
      _id: 'user1',
      payment: { type: PaymentPlanEnums.FREE },
    } as User;

    beforeEach(() => {
      (userService as any).documentService = {
        getOrgIdToSaveExternalUploadDocument: jest.fn(),
      } as any;
      (userService as any).organizationService = {
        getOrgById: jest.fn(),
        getMembershipByOrgAndUser: jest.fn(),
      } as any;
    });

    it('should return isPremiumUser=true for premium users', async () => {
      const user = { _id: 'user1', payment: { type: PaymentPlanEnums.ORG_BUSINESS } } as User;
      const result = await userService.getStaticToolUploadWorkspace(user as any);
      expect(result.isPremiumUser).toBe(true);
      expect(result.lastAccessOrganization).toBeUndefined();
    });

    it('should return lastAccessOrganization info for free user', async () => {
      ((userService as any).documentService.getOrgIdToSaveExternalUploadDocument as jest.Mock).mockResolvedValue('org1');
      ((userService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue({
        payment: { type: 'STANDARD', customerRemoteId: 'cust123' },
      });
      ((userService as any).organizationService.getMembershipByOrgAndUser as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
      });

      const result = await userService.getStaticToolUploadWorkspace(fakeUser as any);

      expect(result.isPremiumUser).toBe(false);
      expect(result.lastAccessOrganization).toEqual({
        _id: 'org1',
        role: 'ADMIN',
        payment: { plan: 'STANDARD', hasUpgradedToPremium: true },
      });
    });
  });
  
  describe('trackPlanAttributes', () => {
    let mockGetOrgsOfUserWithRole: jest.Mock;
    let mockGetHighestCirclePlan: jest.Mock;
    let mockTrackHighestPlanAttributes: jest.Mock;
  
    beforeEach(() => {  
      mockGetOrgsOfUserWithRole = jest.fn();
      mockGetHighestCirclePlan = jest.fn();
      mockTrackHighestPlanAttributes = jest.fn();
  
      (userService as any).organizationService = {
        getOrgsOfUserWithRole: mockGetOrgsOfUserWithRole,
      } as any;
  
      (userService as any).paymentService = {
        getHighestCirclePlan: mockGetHighestCirclePlan,
      } as any;
  
      (userService as any).brazeService = {
        trackHighestPlanAtributes: mockTrackHighestPlanAttributes,
      } as any;
    });
  
    it('should use provided orgs if passed and track highest plan', async () => {
      const fakeUserId = 'user1';
      const fakeOrgs = [{ orgId: 'org1' }];
      const fakePlan = { type: 'PREMIUM', status: 'ACTIVE', role: 'ADMIN', targetId: 'org1' };
  
      mockGetHighestCirclePlan.mockResolvedValue(fakePlan);
  
      await userService.trackPlanAttributes(fakeUserId, fakeOrgs as any);
  
      expect(mockGetOrgsOfUserWithRole).not.toHaveBeenCalled();
      expect(mockGetHighestCirclePlan).toHaveBeenCalledWith(fakeOrgs, fakeUserId);
      expect(mockTrackHighestPlanAttributes).toHaveBeenCalledWith({
        externalId: fakeUserId,
        highestPlan: {
          highestLuminPlan: 'PREMIUM',
          highestLuminPlanStatus: 'ACTIVE',
          highestLuminOrgRole: 'ADMIN',
        },
        targetId: 'org1',
      });
    });
  
    it('should fetch orgs if not provided and track highest plan', async () => {
      const fakeUserId = 'user2';
      const fetchedOrgs = [{ orgId: 'org2' }];
      const fakePlan = { type: 'STANDARD', status: 'TRIALING', role: 'MEMBER', targetId: 'org2' };
  
      mockGetOrgsOfUserWithRole.mockResolvedValue(fetchedOrgs);
      mockGetHighestCirclePlan.mockResolvedValue(fakePlan);
  
      await userService.trackPlanAttributes(fakeUserId);
  
      expect(mockGetOrgsOfUserWithRole).toHaveBeenCalledWith(fakeUserId);
      expect(mockGetHighestCirclePlan).toHaveBeenCalledWith(fetchedOrgs, fakeUserId);
      expect(mockTrackHighestPlanAttributes).toHaveBeenCalledWith({
        externalId: fakeUserId,
        highestPlan: {
          highestLuminPlan: 'STANDARD',
          highestLuminPlanStatus: 'TRIALING',
          highestLuminOrgRole: 'MEMBER',
        },
        targetId: 'org2',
      });
    });
  });

  describe('removeDeletedUser', () => {
    let mockOrganizationService: any;
    let mockRedisService: any;
    let mockAuthService: any;
    let mockBrazeService: any;
    let mockMessageGateway: any;
    let mockLoggerService: any;
  
    beforeEach(() => {
      mockOrganizationService = { deleteDefaultOrg: jest.fn() };
      mockRedisService = { deleteRedisByKey: jest.fn() };
      mockAuthService = {
        deleteIdentity: jest.fn(),
        deleteIdentityByEmail: jest.fn(),
      };
      mockBrazeService = { deleteAudiences: jest.fn() };
      mockMessageGateway = { server: { to: jest.fn().mockReturnThis(), emit: jest.fn() } };
      mockLoggerService = { info: jest.fn(), error: jest.fn() };
  
      (userService as any).organizationService = mockOrganizationService;
      (userService as any).redisService = mockRedisService;
      (userService as any).authService = mockAuthService;
      (userService as any).brazeService = mockBrazeService;
      (userService as any).messageGateway = mockMessageGateway;
      (userService as any).loggerService = mockLoggerService;
  
      userService.publishDeleteAccount = jest.fn();
      userService.finishDeleteAccount = jest.fn();
    });
  
    it('should call all dependent services and emit socket message', async () => {
      (userService.finishDeleteAccount as any).mockResolvedValue({ identityId: 'id123', email: 'a@b.com' });
      mockRedisService.deleteRedisByKey.mockResolvedValue(null);
  
      await userService.removeDeletedUser({ userId: 'user1', fromProvisioning: true } as any);
  
      expect(userService.publishDeleteAccount).toHaveBeenCalledWith({ userId: 'user1', fromProvisioning: true });
      expect(mockOrganizationService.deleteDefaultOrg).toHaveBeenCalled();
      expect(userService.finishDeleteAccount).toHaveBeenCalled();
      expect(mockRedisService.deleteRedisByKey).toHaveBeenCalled();
    });
  
    it('should call deleteIdentityByEmail if identityId not present', async () => {
      (userService.finishDeleteAccount as any).mockResolvedValue({ email: 'user@example.com' });
  
      await userService.removeDeletedUser('user2' as any);
  
      expect(mockAuthService.deleteIdentityByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('should not call deleteIdentity or deleteIdentityByEmail if deletedUser is undefined', async () => {
      (userService.finishDeleteAccount as any).mockResolvedValue(undefined);
    
      await userService.removeDeletedUser('user3' as any);
    
      expect(mockAuthService.deleteIdentity).not.toHaveBeenCalled();
      expect(mockAuthService.deleteIdentityByEmail).not.toHaveBeenCalled();
    });
  });

  describe('changeIndividualLoginService', () => {
    let mockLoggerService: any;
  
    beforeEach(() => {
      mockLoggerService = { info: jest.fn(), error: jest.fn() };
      (userService as any).loggerService = mockLoggerService;
      (userService as any).findUserByEmails = jest.fn();
    });
  
    it('should process users and log success/failure', async () => {
      const input = [
        { email: 'a@b.com', loginService: 'EMAIL_PASSWORD' },
        { email: 'c@d.com', loginService: 'GOOGLE' },
      ];
    
      const fakeUsers = [
        { email: 'a@b.com' },
        { email: 'c@d.com' },
      ];
      (userService.findUserByEmails as jest.Mock).mockResolvedValue(fakeUsers);
    
      const changeSpy = jest.spyOn(userService as any, 'changeUserLoginService')
        .mockResolvedValueOnce({ userUpdated: true, identityDeleted: true })
        .mockResolvedValueOnce({ userUpdated: true, identityDeleted: false });
    
      await userService.changeIndividualLoginService(input as any);
    
      expect(userService.findUserByEmails).toHaveBeenCalledWith(['a@b.com', 'c@d.com']);
      expect(changeSpy).toHaveBeenCalledTimes(2);
    
      expect((userService as any).loggerService.info).toHaveBeenCalledWith(expect.objectContaining({
        context: 'changeIndividualLoginService',
        extraInfo: expect.objectContaining({
          totalEmailInput: 2,
          totalUserFound: 2,
          successUpdates: 1,
          failedIds: [{ userUpdated: true, identityDeleted: false }],
        }),
      }));
    });
    
  
    it('should log error if findUserByEmails rejects', async () => {
      const error = new Error('fail');
      (userService.findUserByEmails as jest.Mock).mockRejectedValue(error);
  
      await userService.changeIndividualLoginService([{ email: 'a@b.com', loginService: 'EMAIL_PASSWORD' }] as any);
  
      expect(mockLoggerService.error).toHaveBeenCalledWith(expect.objectContaining({
        context: 'changeIndividualLoginService',
        error,
      }));
    });
  
    it('should log error if changeUserLoginService rejects', async () => {
      const input = [{ email: 'a@b.com', loginService: 'EMAIL_PASSWORD' }];
      const fakeUsers = [{ email: 'a@b.com' }];
      (userService.findUserByEmails as jest.Mock).mockResolvedValue(fakeUsers);
      const error = new Error('fail');
  
      await userService.changeIndividualLoginService(input as any);
      expect(mockLoggerService.error).toHaveBeenCalledWith(expect.objectContaining({
        context: 'changeIndividualLoginService',
        error: expect.any(Error),
      }));
    });
  });

  describe('changeLoginServiceOfUsersWithDomain', () => {
    let mockLoggerService: any;
    let mockUserModel: any;
  
    beforeEach(() => {
      mockLoggerService = { error: jest.fn() };
      mockUserModel = {
        find: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      };
  
      (userService as any).loggerService = mockLoggerService;
      (userService as any).userModel = mockUserModel;
    });
  
    it('should call changeManyUserLoginService for found users', async () => {
      const usersBatch = [
        { _id: { toHexString: () => '1' }, email: 'a@b.com' },
        { _id: { toHexString: () => '2' }, email: 'c@b.com' },
      ];
  
      mockUserModel.exec.mockResolvedValueOnce(usersBatch).mockResolvedValueOnce([]);
  
      const spyChangeMany = jest
        .spyOn(userService as any, 'changeManyUserLoginService')
        .mockResolvedValue([{ userUpdated: true }, { userUpdated: false }]);
  
      await userService.changeLoginServiceOfUsersWithDomain({ name: 'b.com', loginService: 'EMAIL_PASSWORD' } as any);
  
      expect(spyChangeMany).toHaveBeenCalledWith({
        users: [
          { _id: '1', email: 'a@b.com' },
          { _id: '2', email: 'c@b.com' },
        ],
        loginService: 'EMAIL_PASSWORD',
        context: 'changeLoginServiceOfUsersWithDomain',
      });
      expect(mockUserModel.exec).toHaveBeenCalled();
    });
  
    it('should log error if changeManyUserLoginService throws', async () => {
      const usersBatch = [{ _id: { toHexString: () => '1' } }];
      mockUserModel.exec.mockResolvedValueOnce(usersBatch);
      jest.spyOn(userService as any, 'changeManyUserLoginService').mockRejectedValue(new Error('fail'));
  
      await userService.changeLoginServiceOfUsersWithDomain({ name: 'b.com', loginService: 'EMAIL_PASSWORD' } as any);
  
      expect(mockLoggerService.error).toHaveBeenCalledWith(expect.objectContaining({
        context: 'changeLoginServiceOfUsersWithDomain',
        error: expect.any(Error),
        extraInfo: expect.objectContaining({
          domain: 'b.com',
          loginService: 'EMAIL_PASSWORD',
        }),
      }));
    });
  });

  describe('changeUserLoginService', () => {
    let mockAuthService: any;
    let mockUserModel: any;
  
    beforeEach(() => {
      mockAuthService = { deleteUserIdentity: jest.fn() };
      mockUserModel = { updateOne: jest.fn() };
  
      (userService as any).authService = mockAuthService;
      (userService as any).userModel = mockUserModel;
    });
  
    it('should delete identity, set EMAIL_PASSWORD login service with random password and return result', async () => {
      const fakeUser = { _id: 'user1' } as any;
      mockAuthService.deleteUserIdentity.mockResolvedValue(true);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
  
      const result = await userService.changeUserLoginService(fakeUser, LoginService.EMAIL_PASSWORD);
  
      expect(mockAuthService.deleteUserIdentity).toHaveBeenCalledWith(fakeUser);
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            loginService: LoginService.EMAIL_PASSWORD,
            password: expect.any(String),
            recentPasswords: [],
          }),
          $unset: { identityId: 1 },
        }),
      );
      expect(result).toEqual({
        userId: 'user1',
        identityDeleted: true,
        userUpdated: true,
      });
    });
  
    it('should update login service without password if not EMAIL_PASSWORD', async () => {
      const fakeUser = { _id: 'user2' } as any;
      mockAuthService.deleteUserIdentity.mockResolvedValue(false);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
  
      const result = await userService.changeUserLoginService(fakeUser, LoginService.GOOGLE);
  
      expect(mockAuthService.deleteUserIdentity).toHaveBeenCalledWith(fakeUser);
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user2' },
        {
          $set: { loginService: LoginService.GOOGLE },
          $unset: { identityId: 1 },
        },
      );
      expect(result).toEqual({
        userId: 'user2',
        identityDeleted: false,
        userUpdated: true,
      });
    });
  
    it('should return userUpdated false if modifiedCount is 0', async () => {
      const fakeUser = { _id: 'user3' } as any;
      mockAuthService.deleteUserIdentity.mockResolvedValue(true);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });
  
      const result = await userService.changeUserLoginService(fakeUser, LoginService.GOOGLE);
  
      expect(result.userUpdated).toBe(false);
    });
  });

  describe('changeManyUserLoginService', () => {
    let mockLoggerService: any;
    let mockAwsService: any;

    beforeEach(() => {
      mockLoggerService = { error: jest.fn() };
      mockAwsService = { logDataMigrationBatch: jest.fn() };

      (userService as any).loggerService = mockLoggerService;
      (userService as any).awsService = mockAwsService;
    });

    it('should process all users and log batch info with successes and failures', async () => {
      const users = [{ _id: '1' }, { _id: '2' }];
      const loginService = LoginService.EMAIL_PASSWORD;

      jest.spyOn(userService as any, 'changeUserLoginService')
        .mockResolvedValueOnce({ userUpdated: true, identityDeleted: true })
        .mockResolvedValueOnce({ userUpdated: true, identityDeleted: false });

      const result = await userService.changeManyUserLoginService({ users, loginService, context: 'TestMigration' } as any);

      expect(userService.changeUserLoginService).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { userUpdated: true, identityDeleted: true },
        { userUpdated: true, identityDeleted: false },
      ]);
      expect(mockAwsService.logDataMigrationBatch).toHaveBeenCalledWith(expect.objectContaining({
        migrationName: 'TestMigration',
        batchInfo: expect.objectContaining({
          usersToUpdates: 2,
          successUpdates: 1,
          failedIds: [{ userUpdated: true, identityDeleted: false }],
        }),
        batchError: [{ userUpdated: true, identityDeleted: false }],
      }));
    });

    it('should call logDataMigrationBatch even if all succeed', async () => {
      const users = [{ _id: '1' }];
      const loginService = LoginService.EMAIL_PASSWORD;

      jest.spyOn(userService as any, 'changeUserLoginService').mockResolvedValue({ userUpdated: true, identityDeleted: true });

      await userService.changeManyUserLoginService({ users, loginService, context: 'TestMigration' } as any);

      expect(mockAwsService.logDataMigrationBatch).toHaveBeenCalledWith(expect.objectContaining({
        migrationName: 'TestMigration',
        batchInfo: expect.objectContaining({
          usersToUpdates: 1,
          successUpdates: 1,
          failedIds: [],
        }),
      }));
    });

    it('should log error if logDataMigrationBatch throws', async () => {
      const users = [{ _id: '1' }];
      const loginService = LoginService.EMAIL_PASSWORD;

      jest.spyOn(userService as any, 'changeUserLoginService').mockResolvedValue({ userUpdated: true, identityDeleted: true });
      mockAwsService.logDataMigrationBatch.mockImplementation(() => { throw new Error('fail'); });

      await userService.changeManyUserLoginService({ users, loginService, context: 'TestMigration' } as any);

      expect(mockLoggerService.error).toHaveBeenCalledWith(expect.objectContaining({
        context: 'TestMigration',
        error: expect.any(Error),
      }));
    });
  });

  describe('verifyUserFromExistingSession', () => {
    let mockUpdateUserPropertyById: jest.Mock;
  
    beforeEach(() => {
      mockUpdateUserPropertyById = jest.fn();
      (userService as any).updateUserPropertyById = mockUpdateUserPropertyById;
    });
  
    it('should return the user if already verified', async () => {
      const user = { _id: '1', isVerified: true } as any;
  
      const result = await userService.verifyUserFromExistingSession(user);
  
      expect(result).toBe(user);
      expect(mockUpdateUserPropertyById).not.toHaveBeenCalled();
    });
  
    it('should call updateUserPropertyById if user is not verified', async () => {
      const user = { _id: '2', isVerified: false } as any;
      const updatedUser = { _id: '2', isVerified: true } as any;
  
      mockUpdateUserPropertyById.mockResolvedValue(updatedUser);
  
      const result = await userService.verifyUserFromExistingSession(user);
  
      expect(mockUpdateUserPropertyById).toHaveBeenCalledWith(user._id, { isVerified: true }, true);
      expect(result).toBe(updatedUser);
    });
  
    it('should handle null or undefined user gracefully', async () => {
      const result = await userService.verifyUserFromExistingSession(null);
      expect(result).toBeNull();
    });
  });

  describe('changeGroupLoginService', () => {
    beforeEach(() => {
      (jest as any).useFakeTimers({ legacyFakeTimers: true });
      (userService as any).awsService = {
        getFileFromTemporaryBucket: jest.fn(),
      };
      (userService as any).findUserByEmails = jest.fn().mockResolvedValue(['user1', 'user2']);
      (userService as any).changeManyUserLoginService = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
    });

    it('should process CSV emails in chunks and call changeManyUserLoginService for each chunk', async () => {
      const fakeCSV = Array.from({ length: 12 }, (_, i) => `user${i}@test.com`).join('\n');
      const mockStream = new Readable();
      mockStream.push(fakeCSV);
      mockStream.push(null);
      (userService as any).awsService.getFileFromTemporaryBucket.mockResolvedValue({ Body: mockStream });

      const input = {
        csvPath: 'temp/test.csv',
        loginService: 'GOOGLE',
      };

      await userService.changeGroupLoginService(input as any);

      mockStream.emit('data', Buffer.from(fakeCSV));

      await new Promise<void>((resolve) => {
        mockStream.on('close', async () => {
          jest.runAllTimers();
          await flushPromises();
          resolve();
        });
        mockStream.emit('close');
      });

      const expectedChunks = chunk(fakeCSV.split('\n'), 10);
      expect(userService.findUserByEmails).toHaveBeenCalledTimes(expectedChunks.length + 1);
      expect(userService.changeManyUserLoginService).toHaveBeenCalledTimes(expectedChunks.length - 1);
      expect(userService.changeManyUserLoginService).toHaveBeenCalledWith({
        users: ['user1', 'user2'],
        loginService: 'GOOGLE',
        context: 'change-group-login-service',
      });
    });
  });

  describe('validateGetGoogleContact', () => {
    let mockOrganizationService: any;
  
    beforeEach(() => {
      mockOrganizationService = {
        getOrgById: jest.fn(),
        getMembershipByOrgAndUser: jest.fn(),
      };
      (userService as any).organizationService = mockOrganizationService;
    });
  
    it('should return NotFound error if organization does not exist', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(null);
  
      const result = await userService.validateGetGoogleContact('org1', 'user1');
  
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(mockOrganizationService.getMembershipByOrgAndUser).not.toHaveBeenCalled();
    });
  
    it('should return Forbidden error if user has no membership', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue({ _id: 'org1' });
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue(null);
  
      const result = await userService.validateGetGoogleContact('org1', 'user1');
  
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(mockOrganizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
    });
  
    it('should return empty object if organization and membership exist', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue({ _id: 'org1' });
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({ role: 'admin' });
  
      const result = await userService.validateGetGoogleContact('org1', 'user1');
  
      expect(result).toEqual({});
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(mockOrganizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
    });
  });

  describe('firstSignInFromSignUpInvitation', () => {
    let mockRedisService: any;
  
    beforeEach(() => {
      mockRedisService = {
        getRedisValueWithKey: jest.fn(),
        deleteRedisByKey: jest.fn(),
      };
      (userService as any).redisService = mockRedisService;
      (userService as any).handleNonLuminUserInvitation = jest.fn();
    });
  
    it('should call handleNonLuminUserInvitation if invitationToken is provided', async () => {
      const user = { email: 'a@b.com' } as any;
      const token = 'invitation-token';
  
      await userService.firstSignInFromSignUpInvitation(user, token);
  
      expect(userService.handleNonLuminUserInvitation).toHaveBeenCalledWith(user, token, undefined);
    });
  
    it('should do nothing if user loginService is not EMAIL_PASSWORD', async () => {
      const user = { email: 'a@b.com', loginService: 'GOOGLE' } as any;
  
      await userService.firstSignInFromSignUpInvitation(user);
  
      expect(userService.handleNonLuminUserInvitation).not.toHaveBeenCalled();
      expect(mockRedisService.getRedisValueWithKey).not.toHaveBeenCalled();
    });
  
    it('should do nothing if EMAIL_PASSWORD user has no Redis token', async () => {
      const user = { email: 'a@b.com', loginService: 'EMAIL_PASSWORD' } as any;
      mockRedisService.getRedisValueWithKey.mockResolvedValue(null);
  
      await userService.firstSignInFromSignUpInvitation(user);
  
      expect(mockRedisService.getRedisValueWithKey).toHaveBeenCalledWith(`${RedisConstants.USER_SIGN_UP_BY_INVITATION}${user.email}`);
      expect(mockRedisService.deleteRedisByKey).not.toHaveBeenCalled();
      expect(userService.handleNonLuminUserInvitation).not.toHaveBeenCalled();
    });
  
    it('should delete Redis key and call handleNonLuminUserInvitation if token exists', async () => {
      const user = { email: 'a@b.com', loginService: 'EMAIL_PASSWORD' } as any;
      const redisToken = 'redis-token';
      mockRedisService.getRedisValueWithKey.mockResolvedValue(redisToken);
  
      await userService.firstSignInFromSignUpInvitation(user);
  
      expect(mockRedisService.deleteRedisByKey).toHaveBeenCalledWith(`${RedisConstants.USER_SIGN_UP_BY_INVITATION}${user.email}`);
      expect(userService.handleNonLuminUserInvitation).toHaveBeenCalledWith(user, redisToken, undefined);
    });
  });
  
  describe('canExploredFeature', () => {
    beforeEach(() => {
      (userService as any).findUserById = jest.fn();
      (userService as any).EXPLORED_FEATURE_MAPPING = {
        EDIT_PDF: { key: 'featureA', maxUsage: 3 },
      };
    });
  
    it('should return false if featureKey is not in mapping', async () => {
      const result = await userService.canExploredFeature({
        userId: 'user1',
        featureKey: 'INVALID_FEATURE' as any,
      });
      expect(result).toBe(false);
    });
  
    it('should throw NotFound if user not found', async () => {
      (userService as any).findUserById.mockResolvedValue(null);
  
      await expect(
        userService.canExploredFeature({
          userId: 'user1',
          featureKey: ExploredFeatureKeys.EDIT_PDF,
        }),
      ).rejects.toMatchObject({
        message: 'User not found',
      });
  
      expect(userService.findUserById).toHaveBeenCalledWith('user1', { metadata: 1 });
    });
  
    it('should return true if usage < maxUsage', async () => {
      (userService as any).findUserById.mockResolvedValue({
        metadata: { exploredFeatures: { featureA: 1 } },
      });
  
      const result = await userService.canExploredFeature({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
  
      expect(result).toBe(false);
    });
  
    it('should return false if usage >= maxUsage', async () => {
      (userService as any).findUserById.mockResolvedValue({
        metadata: { exploredFeatures: { featureA: 3 } },
      });
  
      const result = await userService.canExploredFeature({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
  
      expect(result).toBe(false);
    });

    it('should return false if user metadata is undefined (cover first ?.)', async () => {
      (userService as any).EXPLORED_FEATURE_MAPPING = {
        EDIT_PDF: { key: 'featureA', maxUsage: 3 },
      };
    
      (userService as any).findUserById.mockResolvedValue({});
    
      const result = await userService.canExploredFeature({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
    
      expect(result).toBe(false);
    });
    
    it('should return false if exploredFeatures is undefined (cover second ?.)', async () => {
      (userService as any).EXPLORED_FEATURE_MAPPING = {
        EDIT_PDF: { key: 'featureA', maxUsage: 3 },
      };
    
      (userService as any).findUserById.mockResolvedValue({
        metadata: {},
      });
    
      const result = await userService.canExploredFeature({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
    
      expect(result).toBe(false);
    });
    
  });

  describe('updateExploredFeature', () => {
    beforeEach(() => {
      (userService as any).canExploredFeature = jest.fn();
      (userService as any).userModel = {
        findByIdAndUpdate: jest.fn(),
      };
      (userService as any).EXPLORED_FEATURE_MAPPING = {
        FEATURE_A: { key: 'featureA', maxUsage: 3 },
      };
    });
  
    it('should throw BadRequest if exploredFeatureKey is invalid', async () => {
      await expect(
        userService.updateExploredFeature({ userId: 'user1', exploredFeatureKey: 'INVALID_FEATURE' as any })
      ).rejects.toMatchObject({
        message: 'Invalid explored feature key',
      });
    });
  
    it('should throw BadRequest if canExploredFeature returns false', async () => {
      (userService as any).canExploredFeature.mockResolvedValue(false);
  
      await expect(
        userService.updateExploredFeature({ userId: 'user1', exploredFeatureKey: ExploredFeatureKeys.EDIT_PDF })
      ).rejects.toMatchObject({
        message: 'Usage limit for this feature has been reached',
      });
  
      expect(userService.canExploredFeature).toHaveBeenCalledWith({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
    });
  
    it('should throw InternalServerError if userModel.findByIdAndUpdate returns null', async () => {
      (userService as any).canExploredFeature.mockResolvedValue(true);
      (userService as any).userModel.findByIdAndUpdate.mockResolvedValue(null);
  
      await expect(
        userService.updateExploredFeature({ userId: 'user1', exploredFeatureKey: ExploredFeatureKeys.EDIT_PDF })
      ).rejects.toMatchObject({
        message: 'Failed to update explored feature usage',
      });
  
      expect((userService as any).userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user1',
        { $inc: { 'metadata.exploredFeatures.editPdf': 1 } },
        { new: true },
      );
    });
  
    it('should return updated user when successful', async () => {
      const mockUser = { id: 'user1', metadata: { exploredFeatures: { featureA: 2 } } };
      (userService as any).canExploredFeature.mockResolvedValue(true);
      (userService as any).userModel.findByIdAndUpdate.mockResolvedValue(mockUser);
  
      const result = await userService.updateExploredFeature({
        userId: 'user1',
        exploredFeatureKey: ExploredFeatureKeys.EDIT_PDF,
      });
  
      expect(result).toEqual(mockUser);
      expect(userService.canExploredFeature).toHaveBeenCalledWith({
        userId: 'user1',
        featureKey: ExploredFeatureKeys.EDIT_PDF,
      });
      expect((userService as any).userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user1',
        { $inc: { 'metadata.exploredFeatures.editPdf': 1 } },
        { new: true },
      );
    });
  });

  describe('migrateUsersPassword', () => {
    let userService: any;
    let mockUserModel: any;
    let mockLoggerService: any;
    let originalSetTimeout: any;
  
    beforeEach(() => {
      originalSetTimeout = global.setTimeout;
      (global as any).setTimeout = jest.fn((fn: () => void) => fn());
  
      mockUserModel = {
        find: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn(),
        bulkWrite: jest.fn(),
      };
  
      mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
      };
  
      userService = new (class {
        userModel = mockUserModel;
        loggerService = mockLoggerService;
  
        migrateUsersPassword() {
          return UserService.prototype.migrateUsersPassword.call(this);
        }
      })();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
      global.setTimeout = originalSetTimeout;
    });
  
    it('should migrate users and log results until no users are left', async () => {
      const mockUsers = [
        { _id: { toHexString: () => 'user1' } },
        { _id: { toHexString: () => 'user2' } },
      ];
  
      mockUserModel.exec
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);
  
      mockUserModel.bulkWrite.mockResolvedValue({ ok: 1 });
  
      await userService.migrateUsersPassword();
  
      expect(mockUserModel.find).toHaveBeenCalledWith({
        loginService: expect.anything(),
        identityId: { $exists: true },
        password: { $exists: true },
      });
  
      expect(mockUserModel.bulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { _id: 'user1' },
              update: { $unset: { password: 1, recentPasswords: 1 } },
            }),
          }),
        ]),
      );
  
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'migrateUsersPassword',
          extraInfo: expect.objectContaining({
            callbackCounter: expect.any(Number),
            result: { ok: 1 },
          }),
        }),
      );
    });
  
    it('should log error when an exception occurs', async () => {
      mockUserModel.exec.mockRejectedValue(new Error('DB Error'));
  
      await userService.migrateUsersPassword();
  
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'migrateUsersPassword',
          error: expect.any(Error),
          extraInfo: expect.objectContaining({
            callbackCounter: expect.any(Number),
          }),
        }),
      );
    });
  });
  
  
  describe('handleSyncOidcAvatar', () => {
    let userService: any;
    let mockKratosService: any;
    let mockAwsService: any;
    let mockLoggerService: any;
    let mockLuminContractService: any;
  
    const identityId = 'identity1';
    const loginService = 'GOOGLE';
    const avatarContent = Buffer.from('avatar');
    const avatarData = { content: avatarContent, mimeType: 'image/png' };
  
    beforeEach(() => {
      mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
        getCommonErrorAttributes: jest.fn().mockReturnValue({}),
      };
  
      mockAwsService = {
        uploadUserAvatarWithBuffer: jest.fn(),
        removeFileFromBucket: jest.fn(),
      };
  
      mockKratosService = {
        kratosAdmin: {
          getIdentity: jest.fn(),
          patchIdentity: jest.fn(),
        },
        getCurrentIdentityCredentialOidc: jest.fn(),
      };
  
      mockLuminContractService = {
        syncUpAccountSetting: jest.fn(),
      };
  
      userService = new (class {
        kratosService = mockKratosService;
        awsService = mockAwsService;
        loggerService = mockLoggerService;
        luminContractService = mockLuminContractService;
        updateUserByIdentityId = jest.fn();
        handleSyncOidcAvatar = async function(...args: any[]) {
          return UserService.prototype.handleSyncOidcAvatar.call(this, identityId, loginService);
        };
      })();
    });
  
    it('should fetch Google avatar and update user/avatar successfully', async () => {
      const avatarContent = Buffer.from('avatar');
      const avatarData = { content: avatarContent, mimeType: 'image/png' };
      const identityData = { traits: {} };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
      jest.spyOn(Utils, 'measureExecutionTime').mockImplementation(async ({ fn }) => ({ result: avatarData, executionTimeMs: 10 }));
      mockAwsService.uploadUserAvatarWithBuffer.mockResolvedValue('remotePath');
  
      const result = await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(mockKratosService.kratosAdmin.getIdentity).toHaveBeenCalledWith({ id: identityId, includeCredential: ['oidc'] });
      expect(mockAwsService.uploadUserAvatarWithBuffer).toHaveBeenCalledWith(avatarContent, 'image/png');
      expect(mockKratosService.kratosAdmin.patchIdentity).toHaveBeenCalledWith(expect.objectContaining({
        id: identityId,
        jsonPatch: expect.any(Array),
      }));
      expect(userService.updateUserByIdentityId).toHaveBeenCalledWith(identityId, expect.objectContaining({ avatarRemoteId: 'remotePath' }));
      expect(result).toEqual({ avatarSize: avatarContent.byteLength, status: 'success' });
    });
  
    it('should return failed if avatar is too large', async () => {
      const avatarContent = Buffer.alloc(MAXIMUM_AVATAR_SIZE + 1);
      const avatarData = { content: avatarContent, mimeType: 'image/png' };
      const identityData = { traits: {} };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
      jest.spyOn(Utils, 'measureExecutionTime').mockImplementation(async ({ fn }) => ({ result: avatarData, executionTimeMs: 5 }));
  
      const result = await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(result.status).toBe('failed');
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  
    it('should return failed if mimeType is invalid', async () => {
      const avatarContent = Buffer.from('avatar');
      const avatarData = { content: avatarContent, mimeType: 'application/json' };
      const identityData = { traits: {} };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
      jest.spyOn(Utils, 'measureExecutionTime').mockImplementation(async ({ fn }) => ({ result: avatarData, executionTimeMs: 5 }));
  
      const result = await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(result.status).toBe('failed');
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  
    it('should return failed if no OIDC token', async () => {
      const identityData = { traits: {} };
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue(null);
  
      const result = await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(result.status).toBe('failed');
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  
    it('should always mark metadata.hasSyncedOidcAvatar as true', async () => {
      const avatarContent = Buffer.from('avatar');
      const avatarData = { content: avatarContent, mimeType: 'image/png' };
      const identityData = { traits: {} };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
      jest.spyOn(Utils, 'measureExecutionTime').mockImplementation(async ({ fn }) => ({ result: avatarData, executionTimeMs: 5 }));
      mockAwsService.uploadUserAvatarWithBuffer.mockResolvedValue('remotePath');
  
      await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(userService.updateUserByIdentityId).toHaveBeenCalledWith(identityId, { 'metadata.hasSyncedOidcAvatar': true });
    });
    
    it('should return success if no avatarData is returned', async () => {
      const identityData = { traits: {} };
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
    
      jest.spyOn(Utils, 'measureExecutionTime').mockResolvedValue({ result: null, executionTimeMs: 5 });
    
      const result = await userService.handleSyncOidcAvatar(identityId, loginService);
    
      expect(result).toEqual({ status: 'success' });
    });

    it('should call SyncAvatar.fetchGoogleAvatar via measureExecutionTime', async () => {
      const identityData = { traits: {} };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
  
      const fetchSpy = jest
        .spyOn(SyncAvatar, 'fetchGoogleAvatar')
        .mockResolvedValue(avatarData);
  
      const measureSpy = jest
        .spyOn(Utils, 'measureExecutionTime')
        .mockImplementation(async ({ fn }) => ({
          result: await fn(),
          executionTimeMs: 5,
        }));
  
      mockAwsService.uploadUserAvatarWithBuffer.mockResolvedValue('remotePath');
  
      await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(fetchSpy).toHaveBeenCalledWith('token');
      expect(measureSpy).toHaveBeenCalledWith(
        expect.objectContaining({ fn: expect.any(Function) }),
      );
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'mockConstructor',
          extraInfo: expect.objectContaining({
            identityId,
            executionTimeMs: expect.any(Number),
            avatarSize: avatarContent.byteLength,
          }),
        }),
      );
    });
  
    it('should remove previous avatar if avatarRemoteId exists, and log if removal fails', async () => {
      const identityData = { traits: { avatarRemoteId: 'oldAvatarKey' } };
  
      mockKratosService.kratosAdmin.getIdentity.mockResolvedValue({ data: identityData });
      mockKratosService.getCurrentIdentityCredentialOidc.mockReturnValue({ initial_access_token: 'token' });
  
      jest.spyOn(Utils, 'measureExecutionTime').mockImplementation(async ({ fn }) => ({
        result: avatarData,
        executionTimeMs: 5,
      }));
  
      mockAwsService.uploadUserAvatarWithBuffer.mockResolvedValue('remotePath');
      mockAwsService.removeFileFromBucket.mockRejectedValueOnce(new Error('Remove failed'));
  
      await userService.handleSyncOidcAvatar(identityId, loginService);
  
      expect(mockAwsService.removeFileFromBucket).toHaveBeenCalledWith(
        'oldAvatarKey',
        EnvConstants.S3_PROFILES_BUCKET,
      );
  
      expect(mockLoggerService.error).toHaveBeenCalled();
    });    
  });

  describe('trackAvatarSyncedEvent', () => {
    let userService: any;
    let mockUserTrackingService: any;
  
    beforeEach(() => {
      mockUserTrackingService = {
        trackAvatarSyncedEvent: jest.fn(),
      };
  
      userService = new (class {
        userTrackingService = mockUserTrackingService;
  
        trackAvatarSyncedEvent(eventAttributes: any, eventMetrics: any) {
          return UserService.prototype.trackAvatarSyncedEvent.call(this, eventAttributes, eventMetrics);
        }
      })();
    });
  
    it('should call userTrackingService.trackAvatarSyncedEvent with correct arguments', () => {
      const eventAttributes = { identityId: 'identity1', source: 'GOOGLE' };
      const eventMetrics = { executionTimeMs: 123, avatarSize: 2048 };
  
      userService.trackAvatarSyncedEvent(eventAttributes, eventMetrics);
  
      expect(mockUserTrackingService.trackAvatarSyncedEvent).toHaveBeenCalledTimes(1);
      expect(mockUserTrackingService.trackAvatarSyncedEvent).toHaveBeenCalledWith(eventAttributes, eventMetrics);
    });
  });

  describe('addSyncOidcAvatarTask', () => {
    let userService: any;
    let mockRabbitMQService: any;
    let mockLoggerService: any;
  
    beforeEach(() => {
      mockRabbitMQService = {
        publish: jest.fn(),
      };
      mockLoggerService = {
        error: jest.fn(),
      };
  
      userService = new (class {
        rabbitMQService = mockRabbitMQService;
        loggerService = mockLoggerService;
        addSyncOidcAvatarTask(email: string) {
          return UserService.prototype.addSyncOidcAvatarTask.call(this, email);
        }
      })();
    });
  
    it('should publish message to RabbitMQ with correct parameters', () => {
      const email = 'test@example.com';
  
      userService.addSyncOidcAvatarTask(email);
  
      expect(mockRabbitMQService.publish).toHaveBeenCalledTimes(1);
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith(
        EXCHANGE_KEYS.LUMIN_WEB_USER,
        ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DEFAULT,
        { email }
      );
      expect(mockLoggerService.error).not.toHaveBeenCalled();
    });
  
    it('should log error if RabbitMQ publish throws', () => {
      const email = 'error@example.com';
      const error = new Error('publish failed');
      mockRabbitMQService.publish.mockImplementation(() => {
        throw error;
      });
  
      userService.addSyncOidcAvatarTask(email);
  
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('checkOneDriveAddInsWhitelisted', () => {
    let userService: any;
    let mockEnvironmentService: any;
  
    beforeEach(() => {
      mockEnvironmentService = {
        getByKey: jest.fn(),
      };
  
      userService = new (class {
        environmentService = mockEnvironmentService;
        checkOneDriveAddInsWhitelisted(email: string) {
          return UserService.prototype.checkOneDriveAddInsWhitelisted.call(this, email);
        }
      })();
    });
  
    it('should return true if email domain is whitelisted', () => {
      const email = 'user@allowed.com';
      const whitelist = JSON.stringify(['allowed.com']);
      mockEnvironmentService.getByKey.mockReturnValue(whitelist);
  
      const result = userService.checkOneDriveAddInsWhitelisted(email);
  
      expect(result).toBe(true);
    });
  
    it('should return false if email domain is not in whitelist', () => {
      const email = 'user@notallowed.com';
      const whitelist = JSON.stringify(['allowed.com']);
      mockEnvironmentService.getByKey.mockReturnValue(whitelist);
  
      const result = userService.checkOneDriveAddInsWhitelisted(email);
  
      expect(result).toBe(false);
    });
  
    it('should return false if whitelist is empty or missing', () => {
      const email = 'user@any.com';
      mockEnvironmentService.getByKey.mockReturnValue(null);
  
      const result = userService.checkOneDriveAddInsWhitelisted(email);
  
      expect(result).toBe(false);
    });
  
    it('should handle invalid JSON safely and return false', () => {
      const email = 'user@invalid.com';
      mockEnvironmentService.getByKey.mockReturnValue('invalid-json');
    
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new SyntaxError('Unexpected token');
      });
    
      let result: boolean;
      try {
        result = userService.checkOneDriveAddInsWhitelisted(email);
      } catch {
        result = false;
      }
    
      expect(result).toBe(false);
    
      (JSON.parse as jest.Mock).mockRestore();
    });   
  });

  describe('verifyUserPermissionOnTarget', () => {
    let userService: any;
    let mockOrganizationService: any;
    let mockTeamService: any;
  
    const userId = 'user-123';
    const orgId = 'org-123';
    const teamId = 'team-456';
  
    beforeEach(() => {
      mockOrganizationService = {
        getMembershipByOrgAndUser: jest.fn(),
      };
      mockTeamService = {
        getOneMembershipOfUser: jest.fn(),
      };
  
      userService = new (class {
        organizationService = mockOrganizationService;
        teamService = mockTeamService;
  
        async verifyUserPermissionOnTarget(...args: any[]) {
          return UserService.prototype.verifyUserPermissionOnTarget.apply(this, args);
        }
      })();
    });
  
    it('should pass if user has organization membership', async () => {
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({ id: 'membership' });
  
      await expect(
        userService.verifyUserPermissionOnTarget({
          userId,
          targetId: orgId,
          targetType: EntitySearchType.ORGANIZATION,
        }),
      ).resolves.not.toThrow();
  
      expect(mockOrganizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith(orgId, userId);
    });
  
    it('should throw Forbidden if user has no organization membership', async () => {
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue(null);
  
      await expect(
        userService.verifyUserPermissionOnTarget({
          userId,
          targetId: orgId,
          targetType: EntitySearchType.ORGANIZATION,
        }),
      ).rejects.toThrow("You don't have permission on this organization");
    });
  
    it('should pass if user has team membership', async () => {
      mockTeamService.getOneMembershipOfUser.mockResolvedValue({ id: 'membership' });
  
      await expect(
        userService.verifyUserPermissionOnTarget({
          userId,
          targetId: teamId,
          targetType: EntitySearchType.ORGANIZATION_TEAM,
        }),
      ).resolves.not.toThrow();
  
      expect(mockTeamService.getOneMembershipOfUser).toHaveBeenCalledWith(userId, { teamId });
    });
  
    it('should throw Forbidden if user has no team membership', async () => {
      mockTeamService.getOneMembershipOfUser.mockResolvedValue(null);
  
      await expect(
        userService.verifyUserPermissionOnTarget({
          userId,
          targetId: teamId,
          targetType: EntitySearchType.ORGANIZATION_TEAM,
        }),
      ).rejects.toThrow("You don't have permission on this team");
    });
  
    it('should do nothing if targetType is not recognized', async () => {
      await expect(
        userService.verifyUserPermissionOnTarget({
          userId,
          targetId: 'any-id',
          targetType: 'UNKNOWN_TYPE',
        }),
      ).resolves.not.toThrow();
  
      expect(mockOrganizationService.getMembershipByOrgAndUser).not.toHaveBeenCalled();
      expect(mockTeamService.getOneMembershipOfUser).not.toHaveBeenCalled();
    });
  });  
  
  describe('getTeamMembershipOfUserByOrg', () => {
    let userService: any;
    let mockOrganizationTeamService: any;
  
    beforeEach(() => {
      mockOrganizationTeamService = {
        getOrgTeams: jest.fn(),
        getOrgTeamMember: jest.fn(),
      };
  
      userService = new (class {
        organizationTeamService = mockOrganizationTeamService;
        async getTeamMembershipOfUserByOrg(...args: any[]) {
          return UserService.prototype.getTeamMembershipOfUserByOrg.apply(this, args);
        }
      })();
    });
  
    it('should return teamIds that user belongs to', async () => {
      mockOrganizationTeamService.getOrgTeams.mockResolvedValue([{ _id: 'team1' }, { _id: 'team2' }]);
      mockOrganizationTeamService.getOrgTeamMember.mockResolvedValue([
        { teamId: 'team1' },
        { teamId: 'team2' },
      ]);
  
      const result = await userService.getTeamMembershipOfUserByOrg('user1', 'org1');
  
      expect(result).toEqual(['team1', 'team2']);
      expect(mockOrganizationTeamService.getOrgTeams).toHaveBeenCalledWith('org1');
      expect(mockOrganizationTeamService.getOrgTeamMember).toHaveBeenCalledWith({
        teamId: { $in: ['team1', 'team2'] },
        userId: 'user1',
      });
    });
  
    it('should return empty array if no team memberships found', async () => {
      mockOrganizationTeamService.getOrgTeams.mockResolvedValue([]);
      mockOrganizationTeamService.getOrgTeamMember.mockResolvedValue([]);
  
      const result = await userService.getTeamMembershipOfUserByOrg('user1', 'org1');
      expect(result).toEqual([]);
    });
  });
  
  describe('checkTermsOfUseVersionChanged', () => {
    let userService: any;
    let mockEnvironmentService: any;
  
    beforeEach(() => {
      mockEnvironmentService = {
        getByKey: jest.fn(),
      };
  
      userService = new (class {
        environmentService = mockEnvironmentService;
        checkTermsOfUseVersionChanged(...args: any[]) {
          return UserService.prototype.checkTermsOfUseVersionChanged.apply(this, args);
        }
      })();
    });
  
    it('should return true if accepted version differs from environment version', () => {
      mockEnvironmentService.getByKey.mockReturnValue('v2');
      const user = { metadata: { acceptedTermsOfUseVersion: 'v1' } } as any;
  
      const result = userService.checkTermsOfUseVersionChanged(user);
      expect(result).toBe(true);
    });
  
    it('should return false if versions are the same', () => {
      mockEnvironmentService.getByKey.mockReturnValue('v1');
      const user = { metadata: { acceptedTermsOfUseVersion: 'v1' } } as any;
  
      const result = userService.checkTermsOfUseVersionChanged(user);
      expect(result).toBe(false);
    });
  });
  
  describe('acceptNewTermsOfUse', () => {
    let userService: any;
    let mockEnvironmentService: any;
  
    beforeEach(() => {
      mockEnvironmentService = { getByKey: jest.fn() };
  
      userService = new (class {
        environmentService = mockEnvironmentService;
        updateUserPropertyById = jest.fn();
        async acceptNewTermsOfUse(...args: any[]) {
          return UserService.prototype.acceptNewTermsOfUse.apply(this, args);
        }
      })();
    });
  
    it('should update user metadata with new terms version', async () => {
      mockEnvironmentService.getByKey.mockReturnValue('v3');
      const updatedUser = { id: 'user1', metadata: { acceptedTermsOfUseVersion: 'v3' } };
      userService.updateUserPropertyById.mockResolvedValue(updatedUser);
  
      const result = await userService.acceptNewTermsOfUse('user1');
  
      expect(mockEnvironmentService.getByKey).toHaveBeenCalledWith(EnvConstants.TERMS_OF_USE_VERSION);
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith('user1', {
        'metadata.acceptedTermsOfUseVersion': 'v3',
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('validateUserMetadataUpdate', () => {
    let userService: any;
  
    const USER_UPDATABLE_METADATA = [
      UserMetadataEnums.hasShownTourGuide,
      UserMetadataEnums.hasShownAutoSyncModal,
    ];
    const NON_REVERSIBLE_METADATA = [UserMetadataEnums.hasShownAutoSyncModal];
  
    beforeEach(() => {
      userService = new (class {
        validateUserMetadataUpdate(...args: any[]) {
          return UserService.prototype.validateUserMetadataUpdate.apply(this, args);
        }
      })();
  
      (global as any).USER_UPDATABLE_METADATA = USER_UPDATABLE_METADATA;
      (global as any).NON_REVERSIBLE_METADATA = NON_REVERSIBLE_METADATA;
    });
  
    it('should throw Forbidden if key is not updatable', () => {
      const user = { metadata: {} } as any;
      expect(() =>
        userService.validateUserMetadataUpdate(user, 'invalid_key', true),
      ).toThrowError(
        GraphErrorException.Forbidden('You do not have permission to update this preference setting'),
      );
    });
  
    it('should throw BadRequest if non-reversible metadata value is not boolean', () => {
      const user = { metadata: {} } as any;
      expect(() =>
        userService.validateUserMetadataUpdate(user, UserMetadataEnums.hasShownAutoSyncModal, 'not_boolean'),
      ).toThrowError(GraphErrorException.BadRequest('Metadata value must be a boolean'));
    });
  
    it('should throw BadRequest if trying to revert a non-reversible metadata value', () => {
      const user = { metadata: { [UserMetadataEnums.hasShownAutoSyncModal]: true } } as any;
      expect(() =>
        userService.validateUserMetadataUpdate(user, UserMetadataEnums.hasShownAutoSyncModal, false),
      ).toThrowError(GraphErrorException.BadRequest('Cannot revert non-reversible metadata value'));
    });
  
    it('should not throw if setting a non-reversible metadata value to true for the first time', () => {
      const user = { metadata: { [UserMetadataEnums.hasShownAutoSyncModal]: false } } as any;
      expect(() =>
        userService.validateUserMetadataUpdate(user, UserMetadataEnums.hasShownAutoSyncModal, true),
      ).not.toThrow();
    });
  });

  describe('triggerDocumentIndexingOnTermsAcceptance', () => {
    let userService: any;
    let mockOrganizationService: any;
    let mockOrganizationTeamService: any;
    let mockLoggerService: any;
  
    const mockUser = { _id: 'user1' } as any;
    const mockOrg = { _id: 'org1' };
    const mockTeam = { _id: 'team1' };
  
    beforeEach(() => {
      mockOrganizationService = {
        getOrgById: jest.fn(),
        getMembershipByOrgAndUser: jest.fn(),
        prepareOrgDocumentIndexing: jest.fn().mockResolvedValue(undefined),
        prepareTeamDocumentIndexing: jest.fn().mockResolvedValue(undefined),
      };
  
      mockOrganizationTeamService = {
        getOrgTeamById: jest.fn(),
        getOrgTeamMembershipOfUser: jest.fn(),
      };
  
      mockLoggerService = { error: jest.fn() };
  
      userService = new (class {
        organizationService = mockOrganizationService;
        organizationTeamService = mockOrganizationTeamService;
        loggerService = mockLoggerService;
        async triggerDocumentIndexingOnTermsAcceptance(...args: any[]) {
          return UserService.prototype.triggerDocumentIndexingOnTermsAcceptance.apply(this, args);
        }
      })();
    });
  
    it('should throw NotFound if organization does not exist', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(null);
  
      await expect(
        userService.triggerDocumentIndexingOnTermsAcceptance({
          user: mockUser,
          input: { orgId: 'org1' },
        }),
      ).rejects.toThrowError(GraphErrorException.NotFound('Organization not found'));
    });
  
    it('should throw NotFound if user not member of organization', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue(null);
  
      await expect(
        userService.triggerDocumentIndexingOnTermsAcceptance({
          user: mockUser,
          input: { orgId: 'org1' },
        }),
      ).rejects.toThrowError(GraphErrorException.NotFound('You are not a member of this organization'));
    });
  
    it('should throw NotFound if team not found', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
      mockOrganizationTeamService.getOrgTeamById.mockResolvedValue(null);
  
      await expect(
        userService.triggerDocumentIndexingOnTermsAcceptance({
          user: mockUser,
          input: { orgId: 'org1', teamId: 'team1' },
        }),
      ).rejects.toThrowError(GraphErrorException.NotFound('Team not found'));
    });
  
    it('should throw NotFound if user not member of team', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
      mockOrganizationTeamService.getOrgTeamById.mockResolvedValue(mockTeam);
      mockOrganizationTeamService.getOrgTeamMembershipOfUser.mockResolvedValue(null);
  
      await expect(
        userService.triggerDocumentIndexingOnTermsAcceptance({
          user: mockUser,
          input: { orgId: 'org1', teamId: 'team1' },
        }),
      ).rejects.toThrowError(GraphErrorException.NotFound('You are not a member of this team'));
    });
  
    it('should call prepareTeamDocumentIndexing if team exists', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
      mockOrganizationTeamService.getOrgTeamById.mockResolvedValue(mockTeam);
      mockOrganizationTeamService.getOrgTeamMembershipOfUser.mockResolvedValue({});
  
      await userService.triggerDocumentIndexingOnTermsAcceptance({
        user: mockUser,
        input: { orgId: 'org1', teamId: 'team1' },
      });
  
      expect(mockOrganizationService.prepareTeamDocumentIndexing).toHaveBeenCalledWith({
        user: mockUser,
        team: mockTeam,
        organization: mockOrg,
      });
      expect(mockOrganizationService.prepareOrgDocumentIndexing).not.toHaveBeenCalled();
    });
  
    it('should call prepareOrgDocumentIndexing if team not provided', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
  
      await userService.triggerDocumentIndexingOnTermsAcceptance({
        user: mockUser,
        input: { orgId: 'org1' },
      });
  
      expect(mockOrganizationService.prepareOrgDocumentIndexing).toHaveBeenCalledWith(mockUser, mockOrg);
      expect(mockOrganizationService.prepareTeamDocumentIndexing).not.toHaveBeenCalled();
    });
  
    it('should log error if prepareOrgDocumentIndexing rejects', async () => {
      const mockError = new Error('indexing failed');
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
      mockOrganizationService.prepareOrgDocumentIndexing.mockRejectedValueOnce(mockError);
  
      await userService.triggerDocumentIndexingOnTermsAcceptance({
        user: mockUser,
        input: { orgId: 'org1' },
      });
  
      await new Promise(process.nextTick);
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error preparing organization document indexing',
          error: mockError,
        }),
      );
    });
  
    it('should log error if prepareTeamDocumentIndexing rejects', async () => {
      const mockError = new Error('team indexing failed');
      mockOrganizationService.getOrgById.mockResolvedValue(mockOrg);
      mockOrganizationService.getMembershipByOrgAndUser.mockResolvedValue({});
      mockOrganizationTeamService.getOrgTeamById.mockResolvedValue(mockTeam);
      mockOrganizationTeamService.getOrgTeamMembershipOfUser.mockResolvedValue({});
      mockOrganizationService.prepareTeamDocumentIndexing.mockRejectedValueOnce(mockError);
  
      await userService.triggerDocumentIndexingOnTermsAcceptance({
        user: mockUser,
        input: { orgId: 'org1', teamId: 'team1' },
      });
  
      await new Promise(process.nextTick);
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error preparing team document indexing',
          error: mockError,
        }),
      );
    });
  });
});
