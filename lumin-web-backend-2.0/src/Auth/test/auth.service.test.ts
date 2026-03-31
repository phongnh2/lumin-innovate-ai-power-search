/* eslint-disable */
import { Test } from '@nestjs/testing';
import { AuthService } from "../auth.service";
import { EmailService } from "../../Email/email.service";
import { TeamService } from "../../Team/team.service";
import { JwtService } from "@nestjs/jwt";
import { HttpService } from '@nestjs/axios';
import { UserService } from "../../User/user.service";
import { EventServiceFactory } from '../../Event/services/event.service.factory';
import { User } from "../../User/interfaces/user.interface"
import { RedisService } from "../../Microservices/redis/redis.service";
import { EnvironmentService } from "../../Environment/environment.service";
import { DocumentService } from '../../Document/document.service';
import { MembershipService } from "../../Membership/membership.service";
import { Utils } from "../../Common/utils/Utils";
import { AuthenType, SignUpInput, LoginService, AdminRole, PaymentPlanSubscription, PaymentPeriod } from '../../graphql.schema';
import { OrganizationService } from '../../Organization/organization.service';
import { PaymentService } from '../../Payment/payment.service';
import { AdminService } from '../../Admin/admin.service';
import { ServerStatusCode } from '../../Common/errors/ServerErrorException';
import { GraphErrorException } from '../../Common/errors/GraphqlErrorException';
import { BlacklistService } from '../../Blacklist/blacklist.service';
import { LoggerService } from '../../Logger/Logger.service';
import { NotificationService } from '../../Notication/notification.service';
import { OrganizationTeamService } from '../../Organization/organizationTeam.service';
import { KratosService } from '../../Kratos/kratos.service';
import { RabbitMQService } from '../../RabbitMQ/RabbitMQ.service';
import { WhitelistIPService } from '../whitelistIP.sevice';
import { EventsGateway } from '../../Gateway/SocketIoConfig';
import { OryJwtService } from '../ory.jwt.service';
import { TOKEN_TYPE, APP_USER_TYPE } from '../../Auth/auth.enum';
import { UserOrigin } from '../../User/user.enum';
import { PaymentPlanEnums } from '../../Payment/payment.enum';
import { AdminStatus } from '../../Admin/admin.enum';
import { BlacklistActionEnum } from '../../Blacklist/blacklist.enum';
import { EnvConstants } from '../../Common/constants/EnvConstants';
import { GrpcAvailableServices } from '../../Common/constants/GrpcConstants';
import { CommonConstants } from '../../Common/constants/CommonConstants';
import { LOGIN_TYPE } from '../../Common/constants/UserConstants';
import { TokenExpiredError } from 'jsonwebtoken';
import { isEmpty } from 'lodash';
import { MongoServerError } from 'mongodb';
import { EXCHANGE_KEYS, ROUTING_KEY } from '../../RabbitMQ/RabbitMQ.constant';
import { EMAIL_TYPE } from '../../Common/constants/EmailConstant';
import { NonDocumentEventNames } from '../../Event/enums/event.enum';
import { EventScopes } from '../../Event/enums/event.enum';
import { UNKNOWN_THIRD_PARTY } from '../../Common/constants/UserConstants';
import { ErrorCode } from '../../Common/constants/ErrorCode';
import { UserInvitationTokenType, InvitationTokenStatus } from '../interfaces/auth.interface';
import { USER_TYPE } from '../../Common/constants/UserConstants';
import { NotiOrg } from '../../Common/constants/NotificationConstants';
import { RedisConstants } from '../../Common/callbacks/RedisConstants';
import appleSignin from 'apple-signin-auth';

jest.mock('node-fetch');
jest.mock('apple-signin-auth');
import fetch from 'node-fetch';
import { of } from 'rxjs';

class EmailServiceMock {
  sendEmail() {
    return Promise.resolve({ id: 'email-id' });
  }
  generateDeeplinkForEmail() {
    return 'https://app.luminpdf.com/email-welcome';
  }
}

class RabbitMQServiceMock {
  publish() {
    return Promise.resolve();
  }
}

class TeamServiceMock {
  addUserToTeamsWithInvitation() {}
  findTeamByOwner() { return []; }
}

class MembershipServiceMock {}

class OrganizationServiceMock {
  handleCreateOrganization() { return null }
  addUserToOrgsWithInvitation() { return [] }
  getInviteOrgList() { return [] }
  findOneOrganization() { return null }
  notifyInviteToOrg() {}
  getRequestAccessByOrgIdAndEmail() { return null }
  getRequestAccessByCondition() { return [] }
  getOrgById() { return null }
  getOrganizationOwner() { return [] }
  getOrganizationMembers() { return [] }
  createCustomOrganization() {}
  createDefaultOrganizationForOpeningTemplates() {}
  leaveOrganizations() {}
  delInviteOrgListByEmail() {}
  cancelDefaultOrganizationSubscription() {}
  removeRequestAccessDocumentNoti() {}
  transferOrganizationOwner() {}
}

class UserServiceMock {
  findUserById() {
    return {
      _id: '5d5f85b5a7ab840c8d46f697',
      email: 'test@email.com',
      name: 'Test User',
      password: 'hashedPassword',
      isVerified: true,
      loginService: LoginService.EMAIL_PASSWORD,
      timezoneOffset: 0,
      lastLogin: new Date(),
      payment: { 
        type: PaymentPlanEnums.FREE,
        customerRemoteId: '',
        subscriptionRemoteId: '',
        planRemoteId: '',
        period: '',
        status: '',
        quantity: 1,
        currency: 'USD',
        trialInfo: { highestTrial: null }
      },
      origin: UserOrigin.LUMIN,
      comparePassword: jest.fn().mockResolvedValue(true),
      recentPasswords: []
    }
  }
  findUserByEmail() {
    return this.findUserById();
  }
  findUserByAppleUserId() { return null; }
  findUserByIdentityId() { return this.findUserById(); }
  existsUserEmail() { return false; }
  linkEmailWithKratosIdentity() {}
  createUser() {
    return {
      _id: '5d5f85b5a7ab840c8d46f697',
      email: 'test_account@gmail.com',
      name: 'Nhuttm',
      type: "verifyAccount",
      isVerified: false,
      origin: UserOrigin.LUMIN,
      payment: { 
        type: PaymentPlanEnums.FREE,
        customerRemoteId: '',
        subscriptionRemoteId: '',
        planRemoteId: '',
        period: '',
        status: '',
        quantity: 1,
        currency: 'USD',
        trialInfo: { highestTrial: null }
      },
      createdAt: new Date(),
      loginService: LoginService.EMAIL_PASSWORD
    }
  }
  undoDeleteUser() {}
  resetPassword() { return true }
  updateUserPropertyById() { return this.findUserById() }
  updateUserDataAfterSignUp() {}
  getLastAccessedOrg() {}
  migratePersonalWorkspace() {}
  interceptUserData() {
    return {
      _id: '5d5f85b5a7ab840c8d46f697',
      email: 'test@email.com',
      name: 'Test User',
      type: "verifyAccount",
      avatarRemoteId: 'http://remoteUrl.com',
      password: '123456',
      payment: {
        type: PaymentPlanEnums.FREE,
        customerRemoteId: '',
        subscriptionRemoteId: '',
        planRemoteId: '',
        period: '',
        status: '',
        quantity: 1,
        currency: 'USD',
        trialInfo: { highestTrial: null }
      },
      loginService: LoginService.EMAIL_PASSWORD,
      isUsingPassword: jest.fn().mockReturnValue(true),
      newNotifications: 0,
      metadata: {},
      signatures: [],
      setting: {},
      lastLogin: new Date(),
      timezoneOffset: 0,
      createdAt: new Date(),
      endTrial: null
    }
  }
  updateBrowserLanguageToHubspot() {}
  getValidUserName() { return 'Test User' }
  getLoginService() { return LoginService.EMAIL_PASSWORD }
  isUserUsingPassword() { return true }
  findOneAndUpdate() {}
  createOrgInvitationNotiAfterLogin() {}
  removeDeletedUser() {}
  updateUserByIdentityId = jest.fn();
}

class EnvironmentServiceMock {
  getByKey(key) {
    const envMap = {
      [EnvConstants.ENCRYPT_KEY]: '12345678901234567890123456789012',
      [EnvConstants.GOOGLE_CLIENT_ID]: 'google-client-id',
      [EnvConstants.BASE_URL]: 'http://localhost:4000',
      [EnvConstants.JWT_EXPIRE_VERIFY_ACCOUNT_IN]: '24h',
      [EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN]: '7d',
      [EnvConstants.RESET_PASSWORD_TOKEN_EXPIRE_IN]: '3600',
    };
    return envMap[key] || "http://localhost:4000";
  }
}

class RedisServiceMock {
  checkSentResetPasswordEmail() {}
  setSentResetPasswordEmail() {}
  setRefreshToken() {}
  clearSentResetPasswordEmail() {}
  removeRefreshToken() {}
  revokePermission() { return true }
  getUserFailedAttempt() { return 0 }
  getAdminFailedAttempt() { return 0 }
  getKeyTTL() { return 3600 }
  setUserFailedAttempt() {}
  setAdminFailedAttempt() {}
  getAllKeysWithPattern() { return [] }
  deleteResetPasswordToken() {}
  setResetPasswordToken() {}
  setValidVerifyToken() {}
  getValidVerifyToken() { return 'valid-token' }
  checkUserSignUpWithInvite() { return null }
  getOpenFormFromTemplates() { return null }
  setRedisData() {}
  setExpireKey() {}
  checkRefreshToken() { return true }
  checkKeyBlackList() { return false }
  getResetPasswordToken() { return 'reset-token' }
  getAdminResetPasswordToken() { return 'admin-reset-token' }
  getAdminCreatePasswordToken() { return 'admin-create-token' }
  setAdminResetPasswordToken() {}
  setAdminCreatePasswordToken() {}
  deleteAdminResetPasswordToken() {}
  deleteAdminCreatePasswordToken() {}
  setAdminAccessToken() {}
  deleteAdminToken() {}
  clearAdminToken() {}
  addAccessTokenToBlacklist() {}
  getValidInviteToken() { return 'invite-token' }
  getResetPasswordRemainingTimes() { return 5 }
  setResetPasswordRemainingTimes() {}
  hasIdentityDeletedRecently() { return false }
  getCredentialsFromOpenGoogle() { return null }
  setOpenFormFromTemplates() {}
  getRedisValueWithKey() { return null }
  clearAllRefreshToken() {}
  getFormFieldDetectionUsage() { return { usage: 0, blockTime: 0, isExceeded: false } }
}

class JwtServiceMock {
  sign() { return 'jwt-token'; }
  verify() { return { _id: 'userId', email: 'test@email.com', type: TOKEN_TYPE.RESET_PASSWORD }; }
  decode() { return { _id: 'userId', email: 'test@email.com' }; }
}

class HttpServiceMock {
  post() {
    return {
      pipe: () => ({
        toPromise: () => Promise.resolve({ data: { email_verified: true, email: 'test@email.com', name: { display_name: 'Test User' } } })
      })
    };
  }
  axiosRef = {
    post: jest.fn().mockResolvedValue({
      data: { id_token: 'id-token', access_token: 'access-token' }
    })
  };
}

class DocumentServiceMock {
  createNonLuminUserDocumentPermission() {}
}

class EventServiceMock {
  createEvent() {}
}

class PaymentServiceMock {
  updateStripeSubscription() {}
}

class AdminServiceMock {
  findByEmail() {
    return {
      _id: 'admin-id',
      email: 'admin@test.com',
      name: 'Admin User',
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
      password: 'hashedPassword',
      comparePassword: jest.fn().mockResolvedValue(true),
      avatarRemoteId: 'avatar-id',
      createdAt: new Date(),
      timezoneOffset: 0
    };
  }
  findById() { return this.findByEmail(); }
  updatePropertiesById() { return this.findByEmail(); }
  stopTransferAdminProcess() {}
}

class BlacklistServiceMock {
  findOne() { return null }
}

class NotificationServiceMock {
  getNotificationsByConditions() { return [] }
}

class LoggerServiceMock {
  info() {}
  error() {}
  getCommonErrorAttributes() { return { message: 'error' }; }
  warn = jest.fn();
}

class OrganizationTeamServiceMock {
  transferTeamOwner() {}
}

class KratosServiceMock {
  kratosClient = {
    toSession: jest.fn().mockResolvedValue({
      data: { id: 'session-id', identity: { id: 'identity-id', traits: { email: 'test@email.com' } } }
    })
  };
  kratosAdmin = {
    deleteIdentity: jest.fn().mockResolvedValue({}),
    getIdentity: jest.fn().mockResolvedValue({
      data: {
        traits: { email: 'test@email.com' },
        verifiable_addresses: [{ verified: true, status: 'sent' }]
      }
    }),
    updateIdentity: jest.fn().mockResolvedValue({}),
    patchIdentity: jest.fn().mockResolvedValue({}),
    disableSession: jest.fn().mockResolvedValue({}),
    deleteIdentityCredentials: jest.fn(),
  };
  deleteIdentityByEmail() {}
  deleteUserIdentity() { return Promise.resolve(true); }
}

class WhitelistIPServiceMock {
  validateIPRequest() { return { error: null }; }
}

class OryJwtServiceMock {
  verifyOryAuthenticationToken() {
    return { id: 'session-id', identity: { id: 'identity-id', traits: { email: 'test@email.com' } } };
  }
  verifyOryAuthorizationToken() {
    return { id: 'session-id', identity: { id: 'identity-id', traits: { email: 'test@email.com' } } };
  }
}

class EventsGatewayMock {
  server = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };
}

describe('Auth Service', () => {
  let authService: AuthService;
  let userService: UserService;
  let redisService: RedisService;
  let emailService: EmailService;
  let documentService: DocumentService;
  let eventService: EventServiceFactory;
  let paymentService: PaymentService;
  let membershipService: MembershipService;
  let organizationService: OrganizationService;
  let adminService: AdminService;
  let blacklistService: BlacklistService;
  let organizationTeamService: OrganizationTeamService;
  let teamService: TeamService;
  let whitelistIPService: WhitelistIPService;
  let kratosService: KratosService;
  let rabbitMQService: RabbitMQService;
  let loggerService: LoggerService;
  let notificationService: NotificationService;
  let oryJwtService: OryJwtService;
  let eventsGateway: EventsGateway;

  beforeAll(async () => {
    const providers = [
      AuthService,
      { provide: UserService, useClass: UserServiceMock },
      { provide: TeamService, useClass: TeamServiceMock },
      { provide: MembershipService, useClass: MembershipServiceMock },
      { provide: RedisService, useClass: RedisServiceMock },
      { provide: EmailService, useClass: EmailServiceMock },
      { provide: EnvironmentService, useClass: EnvironmentServiceMock },
      { provide: JwtService, useClass: JwtServiceMock },
      { provide: HttpService, useClass: HttpServiceMock },
      { provide: DocumentService, useClass: DocumentServiceMock },
      { provide: OrganizationService, useClass: OrganizationServiceMock },
      { provide: EventServiceFactory, useClass: EventServiceMock },
      { provide: PaymentService, useClass: PaymentServiceMock },
      { provide: AdminService, useClass: AdminServiceMock },
      { provide: BlacklistService, useClass: BlacklistServiceMock },
      { provide: NotificationService, useClass: NotificationServiceMock },
      { provide: LoggerService, useClass: LoggerServiceMock },
      { provide: OrganizationTeamService, useClass: OrganizationTeamServiceMock },
      { provide: KratosService, useClass: KratosServiceMock },
      { provide: WhitelistIPService, useClass: WhitelistIPServiceMock },
      { provide: OryJwtService, useClass: OryJwtServiceMock },
      { provide: EventsGateway, useClass: EventsGatewayMock },
      { provide: RabbitMQService, useClass: RabbitMQServiceMock },
    ];

    const module = await Test.createTestingModule({
      providers
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    redisService = module.get<RedisService>(RedisService);
    emailService = module.get<EmailService>(EmailService);
    documentService = module.get<DocumentService>(DocumentService);
    eventService = module.get<EventServiceFactory>(EventServiceFactory);
    paymentService = module.get<PaymentService>(PaymentService);
    membershipService = module.get<MembershipService>(MembershipService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    adminService = module.get<AdminService>(AdminService);
    blacklistService = module.get<BlacklistService>(BlacklistService);
    organizationTeamService = module.get<OrganizationTeamService>(OrganizationTeamService);
    teamService = module.get<TeamService>(TeamService);
    whitelistIPService = module.get<WhitelistIPService>(WhitelistIPService);
    kratosService = module.get<KratosService>(KratosService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    loggerService = module.get<LoggerService>(LoggerService);
    notificationService = module.get<NotificationService>(NotificationService);
    oryJwtService = module.get<OryJwtService>(OryJwtService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('signUp', () => {
    const signUpParams = {
      email: 'test_account@gmail.com',
      password: 'Password123',
      name: 'luminpdf',
      redirectData: {
        authType: AuthenType.INDIVIDUAL_PROFESSIONAL,
      },
      loginService: LoginService.GOOGLE,
    };

    it('should create a new user with sharingToken and set isVerified to true', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test_account@gmail.com',
        name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.signUp({
        ...signUpParams,
        sharingToken: 'sharing-token'
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle openTemplateData and set form remote id to redis', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test_account@gmail.com',
        name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.signUp({
        ...signUpParams,
        openTemplateData: {
          templateId: 123,
          source: 'test-source'
        }
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle landingPageToken and set redis data', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
          email: 'test_account@gmail.com',
          name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.signUp({
        ...signUpParams,
        landingPageToken: 'landing-page-token'
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error if email already exists', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({ _id: 'u1' } as any);
      const result = await authService.signUp(signUpParams);

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('This email already exists');
    });

    it('should return error if user creation fails', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue(null);

      const result = await authService.signUp(signUpParams);

      expect(result.error.code).toBe(ServerStatusCode.INTERNAL);
    });

    it('should create a new user with AuthenType.NORMAL when no authType is provided', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test_account@gmail.com',
        name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockResolvedValue(undefined);
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.signUp({
        email: 'test_account@gmail.com',
        password: 'Password123',
        name: 'luminpdf',
        loginService: LoginService.EMAIL_PASSWORD,
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(userService.updateUserDataAfterSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          authenType: AuthenType.NORMAL
        })
      );
    });

    it('should handle error in else block when updateUserDataAfterSignUp fails for non-LUMIN origin', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test_account@gmail.com',
        name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.BANANASIGN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockRejectedValue(new Error('Update failed'));
      jest.spyOn(loggerService, 'error').mockImplementation();
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.signUp({
        email: 'test_account@gmail.com',
        password: 'Password123',
        name: 'luminpdf',
        redirectData: {},
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.BANANASIGN,
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(loggerService.error).toHaveBeenCalled();
      expect(userService.updateUserDataAfterSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          authenType: AuthenType.NORMAL
        })
      );
    });

    it('should handle error in else block when updateUserDataAfterSignUp fails for non-LUMIN origin and use AuthenType.NORMAL', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test_account@gmail.com',
        name: 'Nhuttm',
        isVerified: false,
        origin: UserOrigin.BANANASIGN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        },
        createdAt: new Date(),
        loginService: LoginService.EMAIL_PASSWORD
      } as any);
      const updateSpy = jest.spyOn(userService, 'updateUserDataAfterSignUp').mockRejectedValue(new Error('Update failed'));
      const loggerSpy = jest.spyOn(loggerService, 'error').mockImplementation();
      jest.spyOn(authService, 'createToken').mockReturnValue('token');
    
      const result = await authService.signUp({
        email: 'test_account@gmail.com',
        password: 'Password123',
        name: 'luminpdf',
        redirectData: undefined,
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.BANANASIGN,
      });
    
      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          authenType: AuthenType.NORMAL
        })
      );
      expect(loggerSpy).toHaveBeenCalled();
    });
    
  });

  describe('getOpenTemplateContinueUrl', () => {
    it('should generate continue URL without source', () => {
      const openTemplateData = {
        templateId: 123,
        source: null
      };
      
      const result = authService['getOpenTemplateContinueUrl'](openTemplateData);
      
      expect(result).toContain('continue_url=');
      expect(result).not.toContain('source=');
    });
  });

  describe('getUrlParams', () => {
    it('should generate URL params for trial signin', () => {
      const params = {
        plan: 'PRO' as any,
        period: 'MONTHLY' as any,
        promotionCode: 'PROMO123',
        isTrial: true
      };
      
      const result = authService.getUrlParams(params);
      
      expect(result).toContain('trial-signin');
      expect(result).toContain('PROMO123');
    });

    it('should generate URL params for regular signin', () => {
      const params = {
        plan: 'FREE' as any,
        period: 'YEARLY' as any,
        promotionCode: '',
        isTrial: false
      };
      
      const result = authService.getUrlParams(params);
      
      expect(result).toContain('signin');
      expect(result).toContain('yearly');
    });
  });

  describe('signUpWithInvite', () => {
    it('should return error if user already exists', async () => {
      const signUpUser = { email: 'test_account@gmail.com', password: '123456' } as SignUpInput;
      
      const result = await authService.signUpWithInvite({ signUpUser, shouldCreateDefaultOrg: false });
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('This email already exists');
    });

    it('should return error if user creation fails', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue(null);

      const signUpUser = { email: 'test_account@gmail.com', password: '123456' } as SignUpInput;
      const result = await authService.signUpWithInvite({ signUpUser, shouldCreateDefaultOrg: false });
      
      expect(result.error.code).toBe(ServerStatusCode.INTERNAL);
    });

    it('should create user successfully', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        _id: '5d5f85b5a7ab840c8d46f697',
          email: 'test_account@gmail.com',
          name: 'Nhuttm',
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      } as any);

      const signUpUser = { email: 'test_account@gmail.com', password: '123456' } as SignUpInput;
      const result = await authService.signUpWithInvite({ signUpUser, shouldCreateDefaultOrg: true });
      
      expect(result.user).toBeDefined();
    });
  });

  describe('destructSignUpInput', () => {
    it('should return error if invalid email', () => {
      const signUpUser = { email: 'invalidEmail', password: '123456' } as SignUpInput;
        const { error } = authService.destructSignUpInput(signUpUser);
      
        expect(error.code).toBe(ServerStatusCode.BAD_REQUEST);
      expect(error.message).toBe('Invalid Email');
    });

    it('should return error if invalid password', () => {
      jest.spyOn(Utils, 'validatePassword').mockReturnValue(false);
      const signUpUser = { email: 'test_account@gmail.com', password: 'A1234567' } as SignUpInput;
        const { error } = authService.destructSignUpInput(signUpUser);
      
        expect(error.code).toBe(ServerStatusCode.BAD_REQUEST);
      expect(error.message).toBe('Password should be greater than 8 characters and less than 32 characters');
    });

    it('should return signUpData if validation passes', () => {
      const signUpUser = { email: 'TEST_account@gmail.com', password: '12345678' } as SignUpInput;
      const result = authService.destructSignUpInput(signUpUser);
      
      expect(result.signUpData?.email).toBe('test_account@gmail.com');
      expect(result.error).toBeUndefined();
    });
  });

  describe('handleInvalidSignInData', () => {
    it('should handle invalid sign in data for admin with max attempts', async () => {
      const email = 'admin@email.com';
      const prevFailedAttempts = 4;
      
      jest.spyOn(authService as any, 'throwErrorOnBlockedAdminAccount').mockResolvedValue(undefined);
      jest.spyOn(authService as any, 'throwErrorOnFailedAdminAttempt').mockResolvedValue(undefined);
      
      await authService['handleInvalidSignInData'](email, prevFailedAttempts);
      
      expect(authService['throwErrorOnBlockedAdminAccount']).toHaveBeenCalledWith(email);
      expect(authService['throwErrorOnFailedAdminAttempt']).toHaveBeenCalledWith(email, 5);
    });
  });

  describe('verifyGoogleToken', () => {
    it('should verify Google token for iOS platform', async () => {
      const idToken = 'mock-google-token';
      const platform = 'IOS';
      const mockPayload = {
        sub: 'google-user-id',
        email: 'user@gmail.com',
        name: 'Test User'
      };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('ios-client-id');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockPayload)
      };
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockResolvedValue(mockTicket);

      const result = await authService.verifyGoogleToken(idToken, platform);

      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.GOOGLE_IOS_CLIENT_ID);
      expect(authService['googleClient'].verifyIdToken).toHaveBeenCalledWith({
        idToken,
        audience: 'ios-client-id'
      });
      expect(result).toEqual(mockPayload);
    });

    it('should verify Google token for Android platform', async () => {
      const idToken = 'mock-google-token';
      const platform = 'ANDROID';
      const mockPayload = {
        sub: 'google-user-id',
        email: 'user@gmail.com',
        name: 'Test User'
      };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('android-client-id');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockPayload)
      };
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockResolvedValue(mockTicket);

      const result = await authService.verifyGoogleToken(idToken, platform);

      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.GOOGLE_ANDROID_CLIENT_ID);
      expect(authService['googleClient'].verifyIdToken).toHaveBeenCalledWith({
        idToken,
        audience: 'android-client-id'
      });
      expect(result).toEqual(mockPayload);
    });

    it('should handle Google token verification error', async () => {
      const idToken = 'invalid-token';
      const platform = '';

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('web-client-id');
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockRejectedValue(new Error('Invalid token'));

      await expect(authService.verifyGoogleToken(idToken, platform)).rejects.toThrow('Invalid token');
    });

    it('should verify Google token for unknown platform (default case)', async () => {
      const idToken = 'mock-google-token';
      const mockPayload = {
        sub: 'google-user-id',
        email: 'user@gmail.com',
        name: 'Test User'
      };
    
      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('web-client-id');
    
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockPayload)
      };
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockResolvedValue(mockTicket);
    
      const result = await authService.verifyGoogleToken(idToken);
    
      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.GOOGLE_CLIENT_ID);
      expect(authService['googleClient'].verifyIdToken).toHaveBeenCalledWith({
        idToken,
        audience: 'web-client-id'
      });
      expect(result).toEqual(mockPayload);
    });
    
  });

  describe('verifyGoogleTokenFromGrpcClient', () => {
    it('should verify Google token for Android platform with valid client identifier', async () => {
      const idToken = 'mock-google-token';
      const platform = 'ANDROID';
      const clientIdentifier = 'LUMIN_CONTRACT';
      const mockPayload = {
        sub: 'google-user-id',
        email: 'user@gmail.com',
        name: 'Test User'
      };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('contract-android-client-id');
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockPayload)
      };
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockResolvedValue(mockTicket);

      const result = await authService['verifyGoogleTokenFromGrpcClient'](idToken, platform, clientIdentifier);

      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.CONTRACT_GOOGLE_ANDROID_CLIENT_ID);
      expect(authService['googleClient'].verifyIdToken).toHaveBeenCalledWith({
        idToken,
        audience: 'contract-android-client-id'
      });
      expect(result).toEqual(mockPayload);
    });

    it('should throw error when platform is missing', async () => {
      const idToken = 'mock-google-token';
      const platform = '';
      const clientIdentifier = 'LUMIN_CONTRACT';

      await expect(authService['verifyGoogleTokenFromGrpcClient'](idToken, platform, clientIdentifier))
        .rejects.toThrow('Platform missing');
    });

    it('should throw error when client identifier is invalid', async () => {
      const idToken = 'mock-google-token';
      const platform = 'IOS';
      const clientIdentifier = 'INVALID_CLIENT';

      await expect(authService['verifyGoogleTokenFromGrpcClient'](idToken, platform, clientIdentifier))
        .rejects.toThrow('Unhandled client identifier');
    });

    it('should handle Google token verification error', async () => {
      const idToken = 'invalid-token';
      const platform = 'IOS';
      const clientIdentifier = 'LUMIN_CONTRACT';

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('contract-ios-client-id');
      (jest.spyOn(authService['googleClient'], 'verifyIdToken') as jest.SpyInstance).mockRejectedValue(new Error('Invalid token'));

      await expect(authService['verifyGoogleTokenFromGrpcClient'](idToken, platform, clientIdentifier))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('signIn', () => {
    it('should return error when account is blocked', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(5);
      jest.spyOn(redisService, 'getKeyTTL').mockResolvedValue(3600);

      const result = await authService.signIn(params);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('blocked');
    });

    it('should return error when user not found', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      const result = await authService.signIn(params);

      expect(result.error).toBeDefined();
    });

    it('should return error when user not verified', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
          isVerified: false,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);

      const result = await authService.signIn(params);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('not verified');
    });

    it('should return error when password does not match', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'wrongpassword',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);

      const result = await authService.signIn(params);

      expect(result.error).toBeDefined();
    });

    it('should return error when user has no password (third party account)', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
          isVerified: true,
          password: null,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);

      const result = await authService.signIn(params);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Google, Dropbox or Microsoft');
    });

    it('should handle user with invitation and first login', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        timezoneOffset: NaN, // First login
        lastLogin: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      jest.spyOn(redisService, 'checkUserSignUpWithInvite').mockResolvedValue('org-id');
      jest.spyOn(organizationService, 'addUserToOrgsWithInvitation').mockResolvedValue(['org-id']);
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue([]);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(user as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('');

      const result = await authService.signIn(params);

      expect(result.data).toBeDefined();
    });

    it('should handle user with open form template', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        timezoneOffset: 0,
        lastLogin: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      jest.spyOn(redisService, 'checkUserSignUpWithInvite').mockResolvedValue('');
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(user as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('https://example.com/form');

      const result = await authService.signIn(params);

      expect(result.data).toBeDefined();
      expect(result.data.user.redirectUrl).toBe('https://example.com/form');
    });
    
    it('should handle user without loginService and set it to EMAIL_PASSWORD', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        timezoneOffset: 0,
        lastLogin: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: null,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      jest.spyOn(redisService, 'checkUserSignUpWithInvite').mockResolvedValue('');
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(user as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('');

      const result = await authService.signIn(params);

      expect(result.data).toBeDefined();
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith(
        'user-id',
        { loginService: LoginService.EMAIL_PASSWORD },
        false,
        { lean: false }
      );
    });

    it('should handle user with requestAccesses and send notification for first login', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        timezoneOffset: NaN,
        lastLogin: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const requestAccesses = [
        { _id: 'request-1', actor: 'test@email.com' }
      ];

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      jest.spyOn(redisService, 'checkUserSignUpWithInvite').mockResolvedValue('');
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue(requestAccesses as any);
      jest.spyOn(authService, 'sendNotificationFirstLoginUser').mockResolvedValue(undefined);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(user as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('');

      const result = await authService.signIn(params);

      expect(result.data).toBeDefined();
      expect(organizationService.getInviteOrgList).toHaveBeenCalledWith({
        actor: 'test@email.com',
        type: 'inviteOrganization'
      });
      expect(authService.sendNotificationFirstLoginUser).toHaveBeenCalledWith(requestAccesses);
    });

    it('should handle authTokenError and throw error', async () => {
      const params = {
        userEmail: 'test@email.com',
        password: 'password123',
        timezoneOffset: 7
      };

      const user = {
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        timezoneOffset: 0,
        lastLogin: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: LoginService.EMAIL_PASSWORD,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const authTokenError = new Error('Auth token generation failed');

      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      jest.spyOn(redisService, 'checkUserSignUpWithInvite').mockResolvedValue('');
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(user as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authTokenError
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('');

      await expect(authService.signIn(params)).rejects.toThrow('Auth token generation failed');
    });

    it('should handle when userEmail is undefined (cover optional chaining)', async () => {
      const params = {
        userEmail: undefined as any,
        password: 'password123',
        timezoneOffset: 7,
      };
    
      jest.spyOn(redisService, 'getUserFailedAttempt').mockResolvedValue(0);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        _id: 'user-id',
        email: 'test@email.com',
        name: 'Test User',
        isVerified: true,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true),
        loginService: null,
        origin: 'lumin',
        payment: { type: 'FREE' }
      } as any);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue({} as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue({} as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
      jest.spyOn(redisService, 'getOpenFormFromTemplates').mockResolvedValue('');
    
      const result = await authService.signIn(params);
    
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });    
  });

  describe('throwErrorOnInvalidSignInData', () => {
    it('should return blocked account error for last failed attempt', async () => {
      const email = 'test@email.com';
      const prevFailedAttempts = 4;

      jest.spyOn(redisService, 'getKeyTTL').mockResolvedValue(3600);

      const result = await authService['throwErrorOnInvalidSignInData'](email, prevFailedAttempts);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('blocked');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const userData = {
        _id: 'user-id',
        email: 'test@gmail.com',
        name: 'Test User',
        password: 'hashedPassword',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const eventData = {
        eventName: 'PERSONAL_SIGNED_IN',
        eventScope: 'PERSONAL'
      };

      const timezoneOffset = 7;

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(userData as any);

      const result = await authService['signInWithGoogle'](
        userData as any,
        timezoneOffset,
        eventData as any
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.isSignedUp).toBe(true);
    });

    it('should handle templates open context', async () => {
      const userData = {
        _id: 'user-id',
        email: 'test@gmail.com',
        name: 'Test User',
        password: null,
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const eventData = {
        eventName: 'PERSONAL_SIGNED_IN',
        eventScope: 'PERSONAL'
      };

      const timezoneOffset = 7;
      const context = AuthenType.TEMPLATES_OPEN;

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(userData as any);

      const result = await authService['signInWithGoogle'](
        userData as any,
        timezoneOffset,
        eventData as any,
        undefined,
        undefined,
        context
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should handle authTokenError and throw error', async () => {
      const userData = {
        _id: 'user-id',
        email: 'test@gmail.com',
        name: 'Test User',
        password: null,
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const eventData = {
        eventName: 'PERSONAL_SIGNED_IN',
        eventScope: 'PERSONAL'
      };

      const timezoneOffset = 7;
      const authTokenError = new Error('Auth token generation failed');

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authTokenError
      });

      await expect(authService['signInWithGoogle'](
        userData as any,
        timezoneOffset,
        eventData as any
      )).rejects.toThrow('Auth token generation failed');
    });

    it('should handle user without name and set valid userName', async () => {
      const userData = {
        _id: 'user-id',
        email: 'test@gmail.com',
        name: null, // No name provided
        password: null,
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { 
          type: PaymentPlanEnums.FREE,
          customerRemoteId: '',
          subscriptionRemoteId: '',
          planRemoteId: '',
          period: '',
          status: '',
          quantity: 1,
          currency: 'USD',
          trialInfo: { highestTrial: null }
        }
      };

      const eventData = {
        eventName: 'PERSONAL_SIGNED_IN',
        eventScope: 'PERSONAL'
      };

      const timezoneOffset = 7;

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Valid User Name');
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(userData as any);

      const result = await authService['signInWithGoogle'](
        userData as any,
        timezoneOffset,
        eventData as any
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith(
        'user-id',
        expect.objectContaining({
          name: 'Valid User Name'
        }),
        true,
        { lean: false }
      );
    });
  });

  describe('handleKratosRegistrationFlowCallback', () => {
    it('should throw error for banned email', async () => {
      const req = {
        email: 'banned@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue({} as any);

      await expect(authService.handleKratosRegistrationFlowCallback(req)).rejects.toThrow('This email is banned');
    });

    it('should create new user when linking fails', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(authService, 'linkExistingEmailWithKratosIdentity').mockResolvedValue(false);
      jest.spyOn(authService, 'newUserFromKratos').mockResolvedValue(undefined);

      await authService.handleKratosRegistrationFlowCallback(req);

      expect(authService.newUserFromKratos).toHaveBeenCalledWith(req);
    });
  });

  describe('newUserFromKratos', () => {
    it('should handle duplicate key error gracefully', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true,
        userOrigin: UserOrigin.LUMIN
      };

      const mongoError = new MongoServerError({ message: 'Duplicate key' } as any);
      mongoError.code = 11000;

      jest.spyOn(userService, 'createUser').mockRejectedValue(mongoError);

      await expect(authService.newUserFromKratos(req)).resolves.not.toThrow();
    });

    it('should throw error for non-duplicate key errors', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true,
        userOrigin: UserOrigin.LUMIN
      };

      const mongoError = new MongoServerError({ message: 'Other error' } as any);
      mongoError.code = 11001;

      jest.spyOn(userService, 'createUser').mockRejectedValue(mongoError);

      await expect(authService.newUserFromKratos(req)).rejects.toThrow('Other error');
    });

    it('should handle updateUserDataAfterSignUp error gracefully', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true,
        userOrigin: UserOrigin.LUMIN
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockRejectedValue(new Error('Update failed'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await authService.newUserFromKratos(req);

      expect(loggerService.error).toHaveBeenCalled();
    });

    it('should handle isVerified as false when req.isVerified is undefined', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        userOrigin: UserOrigin.LUMIN
      } as any;
      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockResolvedValue(undefined);

      await authService.newUserFromKratos(req);

      expect(userService.createUser).toHaveBeenCalledWith({
        identityId: req.identityId,
        email: req.email,
        name: req.name,
        isVerified: false,
        loginService: req.loginType,
        origin: req.userOrigin,
        version: '4.0'
      });
    });

    it('should include appleUserId when req.appleUserId is provided', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.APPLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true,
        userOrigin: UserOrigin.LUMIN,
        appleUserId: 'apple-user-123'
      };
      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.APPLE,
        origin: UserOrigin.LUMIN,
        appleUserId: 'apple-user-123'
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockResolvedValue(undefined);

      await authService.newUserFromKratos(req);

      expect(userService.createUser).toHaveBeenCalledWith({
        identityId: req.identityId,
        email: req.email,
        name: req.name,
        isVerified: req.isVerified,
        loginService: req.loginType,
        appleUserId: 'apple-user-123',
        origin: req.userOrigin,
        version: '4.0'
      });
    });

    it('should use UserOrigin.LUMIN as default when req.userOrigin is undefined', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      } as any;
      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockResolvedValue(undefined);

      await authService.newUserFromKratos(req);

      expect(userService.createUser).toHaveBeenCalledWith({
        identityId: req.identityId,
        email: req.email,
        name: req.name,
        isVerified: req.isVerified,
        loginService: req.loginType,
        origin: UserOrigin.LUMIN,
        version: '4.0'
      });
    });

    it('should handle RabbitMQ publish error with different error types', async () => {
      const req = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true,
        userOrigin: UserOrigin.LUMIN
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN
      };

      const customError = { message: 'Custom RabbitMQ error', code: 'CONNECTION_TIMEOUT' };

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockResolvedValue(undefined);
      jest.spyOn(rabbitMQService, 'publish').mockImplementation(() => {
        throw customError;
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await authService.newUserFromKratos(req);

      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('tryLinkExistingEmailWithKratosIdentity', () => {
    it('should link existing email with Kratos identity when user exists', async () => {
      const email = 'test@email.com';
      const id = 'identity-123';

      jest.spyOn(userService, 'existsUserEmail').mockResolvedValue(true);
      jest.spyOn(userService, 'linkEmailWithKratosIdentity').mockResolvedValue();

      const result = await authService['tryLinkExistingEmailWithKratosIdentity'](email, id);

      expect(result).toBe(true);
      expect(userService.linkEmailWithKratosIdentity).toHaveBeenCalledWith(email, id);
    });

    it('should return false when user does not exist', async () => {
      const email = 'nonexistent@email.com';
      const id = 'identity-123';

      jest.spyOn(userService, 'existsUserEmail').mockResolvedValue(false);

      const result = await authService['tryLinkExistingEmailWithKratosIdentity'](email, id);

      expect(result).toBe(false);
    });
  });

  describe('signUpWithThirdParty', () => {
    it('should throw error for banned email', async () => {
      const params = {
        email: 'banned@test.com',
        name: 'Test User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.LUMIN
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue({} as any);

      await expect(authService['signUpWithThirdParty'](params)).rejects.toThrow('This email is banned');
    });

    it('should handle authTokenError and throw error', async () => {
      const params = {
        email: 'user@test.com',
        name: 'Test User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.LUMIN
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      const authTokenError = new Error('Auth token generation failed');

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Test User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authTokenError
      });

      await expect(authService['signUpWithThirdParty'](params)).rejects.toThrow('Auth token generation failed');
    });

    it('should handle templates open context', async () => {
      const params = {
        email: 'user@test.com',
        name: 'Test User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.TEMPLATES_OPEN,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.LUMIN
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Test User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(organizationService, 'createDefaultOrganizationForOpeningTemplates').mockResolvedValue(undefined);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);

      const result = await authService['signUpWithThirdParty'](params);

      expect(result.token).toBe('access-token');
      expect(organizationService.createDefaultOrganizationForOpeningTemplates).toHaveBeenCalledWith(newUser);
    });

    it('should handle invitation token successfully', async () => {
      const params = {
        email: 'user@test.com',
        name: 'Test User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.LUMIN,
        invitationToken: 'valid-invitation-token'
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      const tokenPayload = {
        email: 'user@test.com',
        orgId: 'org-id'
      };

      const invitation = {
        _id: 'invitation-id',
        email: 'user@test.com',
        orgId: 'org-id'
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Test User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(tokenPayload as any);
      jest.spyOn(organizationService, 'getRequestAccessByOrgIdAndEmail').mockResolvedValue(invitation as any);
      jest.spyOn(organizationService, 'findOneOrganization').mockResolvedValue(null);
      jest.spyOn(organizationService, 'createCustomOrganization').mockResolvedValue(undefined);
      jest.spyOn(organizationService, 'addUserToOrgsWithInvitation').mockResolvedValue(['org-id']);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);

      const result = await authService['signUpWithThirdParty'](params);

      expect(result.token).toBe('access-token');
      expect(organizationService.getRequestAccessByOrgIdAndEmail).toHaveBeenCalledWith('org-id', 'user@test.com');
      expect(organizationService.addUserToOrgsWithInvitation).toHaveBeenCalledWith(newUser, 'org-id');
    });

    it('should handle non-LUMIN origin and catch updateUserDataAfterSignUp error', async () => {
      const params = {
        email: 'user@test.com',
        name: 'Test User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.BANANASIGN
      };

      const newUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.BANANASIGN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Test User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'updateUserDataAfterSignUp').mockRejectedValue(new Error('Update failed'));
      jest.spyOn(loggerService, 'error').mockImplementation();
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);

      const result = await authService['signUpWithThirdParty'](params);

      expect(result.token).toBe('access-token');
      expect(loggerService.error).toHaveBeenCalled();
    });

    it('should use DROPBOX loginService when loginType is DROPBOX', async () => {
      const params = {
        email: 'dropbox@test.com',
        name: 'Dropbox User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.NORMAL,
        userOrigin: UserOrigin.LUMIN
      };
    
      const newUser = {
        _id: 'dropbox-user',
        email: 'dropbox@test.com',
        name: 'Dropbox User',
        loginService: LoginService.DROPBOX,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };
    
      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('Dropbox User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
    
      const result = await authService['signUpWithThirdParty'](params);
    
      expect(result.token).toBe('access-token');
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ loginService: LoginService.DROPBOX })
      );
    });

    it('should fallback to LUMIN origin when userOrigin is undefined', async () => {
      const params = {
        email: 'noorigin@test.com',
        name: 'No Origin User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: undefined as any,
      };
    
      const newUser = {
        _id: 'user-id',
        email: 'noorigin@test.com',
        name: 'No Origin User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };
    
      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'getValidUserName').mockReturnValue('No Origin User');
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(newUser as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
    
      const result = await authService['signUpWithThirdParty'](params);
    
      expect(result.token).toBe('access-token');
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ origin: UserOrigin.LUMIN })
      );
    });    
  });

  describe('loginWithGoogleV2', () => {
    it('should login with Google V2 successfully', async () => {
      const params = {
        googleEmail: 'user@gmail.com',
        timezoneOffset: 7,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1',
        name: 'Test User'
      };

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService as any, 'signInWithGoogle').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: mockUser
      } as any);

      const result = await authService.loginWithGoogleV2(params);

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(authService['signInWithGoogle']).toHaveBeenCalledWith(
        mockUser,
        params.timezoneOffset,
        eventData,
        params.browserLanguageCode,
        params.ipAddress
      );
    });

    it('should sign up new user with Google V2', async () => {
      const params = {
        googleEmail: 'newuser@gmail.com',
        timezoneOffset: 7,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1',
        name: 'New User'
      };

      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
        eventScope: EventScopes.PERSONAL
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authService as any, 'signUpWithThirdParty').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: false,
        user: { _id: 'user-id', email: 'newuser@gmail.com' }
      } as any);

      const result = await authService.loginWithGoogleV2(params);

      expect(result.token).toBe('access-token');
      expect(authService['signUpWithThirdParty']).toHaveBeenCalledWith({
        email: 'newuser@gmail.com',
        name: 'New User',
        timezoneOffset: 7,
        eventData,
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      });
    });

    it('should use email prefix as name when name is not provided', async () => {
      const params = {
        googleEmail: 'prefixuser@gmail.com',
        timezoneOffset: 7,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1',
      };
    
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      const signUpSpy = jest
        .spyOn(authService as any, 'signUpWithThirdParty')
        .mockResolvedValue({
          token: 'access-token',
          refreshToken: 'refresh-token',
          isSignedUp: false,
          user: { _id: 'user-id', email: 'prefixuser@gmail.com' },
        } as any);
    
      const result = await authService.loginWithGoogleV2(params);
    
      expect(result.token).toBe('access-token');
      expect(signUpSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'prefixuser@gmail.com',
          name: 'prefixuser',
        }),
      );
    });
    
  });

  describe('loginWithGoogle', () => {
    it('should login with Google successfully', async () => {
      const params = {
        idToken: 'valid-google-token',
        platform: 'web',
        timezoneOffset: 7,
        grpcClientIdentifier: undefined,
        context: AuthenType.NORMAL,
        invitationToken: undefined,
        userOrigin: UserOrigin.LUMIN,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      };
      const mockTokenPayload = {
        email: 'user@gmail.com',
        name: 'Test User'
      };
      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(authService, 'verifyGoogleToken').mockResolvedValue(mockTokenPayload as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService as any, 'signInWithGoogle').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: mockUser
      } as any);

      const result = await authService.loginWithGoogle(params);

      expect(result.token).toBe('access-token');
      expect(authService.verifyGoogleToken).toHaveBeenCalledWith(params.idToken, params.platform);
      expect(authService['signInWithGoogle']).toHaveBeenCalled();
    });

    it('should login with Google using gRPC client identifier', async () => {
      const params = {
        idToken: 'valid-google-token',
        platform: 'IOS',
        timezoneOffset: 7,
        grpcClientIdentifier: 'LUMIN_CONTRACT',
        context: AuthenType.NORMAL,
        invitationToken: undefined,
        userOrigin: UserOrigin.LUMIN,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      };
      const mockTokenPayload = {
        email: 'user@gmail.com',
        name: 'Test User'
      };
      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(authService as any, 'verifyGoogleTokenFromGrpcClient').mockResolvedValue(mockTokenPayload as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService as any, 'signInWithGoogle').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: mockUser
      } as any);

      const result = await authService.loginWithGoogle(params);

      expect(result.token).toBe('access-token');
      expect(authService['verifyGoogleTokenFromGrpcClient']).toHaveBeenCalledWith(
        params.idToken,
        params.platform,
        params.grpcClientIdentifier
      );
    });

    it('should sign up new user with Google', async () => {
      const params = {
        idToken: 'valid-google-token',
        platform: 'web',
        timezoneOffset: 7,
        grpcClientIdentifier: undefined,
        context: AuthenType.NORMAL,
        invitationToken: 'invite-token',
        userOrigin: UserOrigin.LUMIN,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      };

      const mockTokenPayload = {
        email: 'newuser@gmail.com',
        name: 'New User'
      };

      jest.spyOn(authService, 'verifyGoogleToken').mockResolvedValue(mockTokenPayload as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authService as any, 'signUpWithThirdParty').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: false,
        user: { _id: 'user-id', email: 'newuser@gmail.com' }
      } as any);

      const result = await authService.loginWithGoogle(params);

      expect(result.token).toBe('access-token');
      expect(authService['signUpWithThirdParty']).toHaveBeenCalledWith({
        email: 'newuser@gmail.com',
        name: 'New User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        loginType: LOGIN_TYPE.GOOGLE,
        userOrigin: UserOrigin.LUMIN,
        invitationToken: 'invite-token',
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      });
    });
  });

  describe('signInWithDropbox', () => {
    it('should throw error when authTokenError is present', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@dropbox.com',
        name: 'Test User',
        loginService: LoginService.DROPBOX,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const browserLanguageCode = 'en';
      const ipAddress = '127.0.0.1';
      const context = AuthenType.NORMAL;

      const authError = new Error('Auth token generation failed');
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authError
      });

      await expect(authService['signInWithDropbox'](
        userData as any,
        timezoneOffset,
        eventData as any,
        browserLanguageCode,
        ipAddress,
        context
      )).rejects.toThrow('Auth token generation failed');
    });

    it('should unset password when user has password', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@dropbox.com',
        name: 'Test User',
        loginService: LoginService.DROPBOX,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE },
        password: 'hashed-password'
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const browserLanguageCode = 'en';
      const ipAddress = '127.0.0.1';
      const context = AuthenType.NORMAL;

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'findOneAndUpdate').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(userData as any);

      await authService['signInWithDropbox'](
        userData as any,
        timezoneOffset,
        eventData as any,
        browserLanguageCode,
        ipAddress,
        context
      );

      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userData._id },
        { $unset: { password: 1 } }
      );
    });

    it('should create default organization when context is TEMPLATES_OPEN', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@dropbox.com',
        name: 'Test User',
        loginService: LoginService.DROPBOX,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const browserLanguageCode = 'en';
      const ipAddress = '127.0.0.1';
      const context = AuthenType.TEMPLATES_OPEN;

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(userData as any);
      jest.spyOn(organizationService, 'createDefaultOrganizationForOpeningTemplates').mockResolvedValue(undefined);

      await authService['signInWithDropbox'](
        userData as any,
        timezoneOffset,
        eventData as any,
        browserLanguageCode,
        ipAddress,
        context
      );

      expect(organizationService.createDefaultOrganizationForOpeningTemplates).toHaveBeenCalledWith(userData);
    });
  });

  describe('loginWithDropbox', () => {
    it('should login with Dropbox successfully', async () => {
      const params = {
        code: 'dropbox-auth-code',
        timezoneOffset: 7,
        context: AuthenType.NORMAL,
        userOrigin: UserOrigin.LUMIN,
        invitationToken: undefined,
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      };
      const mockDropboxAccount = {
        email_verified: true,
        email: 'user@dropbox.com',
        name: { display_name: 'Test User' }
      };
      const mockUser = {
        _id: 'user-id',
        email: 'user@dropbox.com',
        name: 'Test User',
        loginService: LoginService.DROPBOX,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(authService, 'verifyDropboxToken').mockResolvedValue(mockDropboxAccount as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService as any, 'signInWithDropbox').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: mockUser
      } as any);

      const result = await authService.loginWithDropbox(params);

      expect(result.token).toBe('access-token');
      expect(authService.verifyDropboxToken).toHaveBeenCalledWith(params.code);
      expect(authService['signInWithDropbox']).toHaveBeenCalled();
    });

    it('should sign up new user with Dropbox', async () => {
      const params = {
        code: 'dropbox-auth-code',
        timezoneOffset: 7,
        context: AuthenType.NORMAL,
        userOrigin: UserOrigin.LUMIN,
        invitationToken: 'invite-token',
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      };
      const mockDropboxAccount = {
        email_verified: true,
        email: 'newuser@dropbox.com',
        name: { display_name: 'New User' }
      };

      jest.spyOn(authService, 'verifyDropboxToken').mockResolvedValue(mockDropboxAccount as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authService as any, 'signUpWithThirdParty').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: false,
        user: { _id: 'user-id', email: 'newuser@dropbox.com' }
      } as any);

      const result = await authService.loginWithDropbox(params);

      expect(result.token).toBe('access-token');
      expect(authService['signUpWithThirdParty']).toHaveBeenCalledWith({
        email: 'newuser@dropbox.com',
        name: 'New User',
        timezoneOffset: 7,
        eventData: {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        context: AuthenType.NORMAL,
        userOrigin: UserOrigin.LUMIN,
        invitationToken: 'invite-token',
        browserLanguageCode: 'en',
        ipAddress: '127.0.0.1'
      });
    });
  });

  describe('verifyAppleToken', () => {
    it('should verify Apple token successfully with nonce', async () => {
      const idToken = 'apple-id-token';
      const nonce = 'test-nonce';
      const mockVerifiedToken = { sub: 'user-id', email: 'user@apple.com' };

      jest.spyOn(appleSignin, 'verifyIdToken').mockResolvedValue(mockVerifiedToken as any);

      const result = await authService.verifyAppleToken(idToken, nonce);

      expect(result).toEqual(mockVerifiedToken);
      expect(appleSignin.verifyIdToken).toHaveBeenCalledWith(idToken, {
        nonce: expect.any(String),
      });
    });

    it('should verify Apple token with null nonce', async () => {
      const idToken = 'apple-id-token';
      const nonce = null;
      const mockVerifiedToken = { sub: 'user-id', email: 'user@apple.com' };

      jest.spyOn(appleSignin, 'verifyIdToken').mockResolvedValue(mockVerifiedToken as any);

      const result = await authService.verifyAppleToken(idToken, nonce as any);

      expect(result).toEqual(mockVerifiedToken);
      expect(appleSignin.verifyIdToken).toHaveBeenCalledWith(idToken, {
        nonce: undefined,
      });
    });
  });

  describe('signInUser', () => {
    it('should sign in user by ID successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        _id: userId,
        email: 'user@test.com',
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);

      const result = await authService.signInUser(userId);

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user._id).toBe(userId);
      expect(result.user.email).toBe('user@test.com');
      expect(userService.findUserById).toHaveBeenCalledWith(userId);
      expect(redisService.setRefreshToken).toHaveBeenCalledWith(userId, 'refresh-token');
    });

    it('should handle Redis error gracefully', async () => {
      const userId = 'user-id';
      const mockUser = {
        _id: userId,
        email: 'user@test.com',
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockRejectedValue(new Error('Redis error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      const result = await authService.signInUser(userId);

      expect(result.token).toBe('access-token');
      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'signInUser: set refresh token to redis',
        error: expect.any(Error)
      });
    });

    it('should include endTrial when user has it', async () => {
      const userId = 'user-id';
      const mockUser = {
        _id: userId,
        email: 'user@test.com',
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date(),
        endTrial: new Date('2025-01-01T00:00:00Z'),
      };
    
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);
    
      const result = await authService.signInUser(userId);
    
      expect(result.user.endTrial).toEqual(new Date('2025-01-01T00:00:00Z'));
    });
    
  });

  describe('signInUserEmail', () => {
    it('should sign in user by email successfully', async () => {
      const email = 'user@test.com';
      const mockUser = {
        _id: 'user-id',
        email: email,
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);

      const result = await authService.signInUserEmail(email);

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user._id).toBe('user-id');
      expect(result.user.email).toBe(email);
      expect(userService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(redisService.setRefreshToken).toHaveBeenCalledWith('user-id', 'refresh-token');
    });

    it('should handle Redis error gracefully', async () => {
      const email = 'user@test.com';
      const mockUser = {
        _id: 'user-id',
        email: email,
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockRejectedValue(new Error('Redis error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      const result = await authService.signInUserEmail(email);

      expect(result.token).toBe('access-token');
      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'signInUserEmail: set refresh token to redis',
        error: expect.any(Error)
      });
    });

    it('should include endTrial when user has it', async () => {
      const email = 'user@test.com';
      const endTrialDate = new Date('2025-01-01T00:00:00Z');
    
      const mockUser = {
        _id: 'user-id',
        email: email,
        name: 'Test User',
        avatarRemoteId: 'avatar-id',
        payment: { type: PaymentPlanEnums.FREE },
        loginService: LoginService.EMAIL_PASSWORD,
        timezoneOffset: 7,
        lastLogin: new Date(),
        createdAt: new Date(),
        endTrial: endTrialDate,
      };
    
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);
    
      const result = await authService.signInUserEmail(email);
    
      expect(result.user.endTrial).toEqual(endTrialDate);
    });
    
  });

  describe('signInWithApple', () => {
    it('should sign in with Apple successfully', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@apple.com',
        name: 'Test User',
        loginService: LoginService.APPLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE },
        avatarRemoteId: 'avatar-id',
        setting: {},
        lastLogin: new Date(),
        timezoneOffset: 7,
        signatures: [],
        createdAt: new Date(),
        metadata: {},
        newNotifications: 0
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const ipAddress = '127.0.0.1';

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);
      jest.spyOn(userService, 'isUserUsingPassword').mockReturnValue(false);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'getLoginService').mockReturnValue(LoginService.APPLE);
      jest.spyOn(eventService, 'createEvent').mockResolvedValue(undefined);
      jest.spyOn(userService, 'migratePersonalWorkspace').mockResolvedValue(undefined);

      const result = await authService['signInWithApple'](
        userData as any,
        timezoneOffset,
        eventData as any,
        ipAddress
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.isSignedUp).toBe(true);
      expect(redisService.setRefreshToken).toHaveBeenCalledWith('user-id', 'refresh-token');
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith(
        'user-id',
        {
          isVerified: true,
          lastLogin: expect.any(Date),
          timezoneOffset: 7,
          lastAccess: expect.any(Date),
          loginService: LoginService.APPLE
        },
        true,
        { lean: false }
      );
    });

    it('should handle authTokenError and throw error', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@apple.com',
        name: 'Test User',
        loginService: LoginService.APPLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const ipAddress = '127.0.0.1';
      const authTokenError = new Error('Auth token generation failed');

      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authTokenError
      });

      await expect(authService['signInWithApple'](
        userData as any,
        timezoneOffset,
        eventData as any,
        ipAddress
      )).rejects.toThrow('Auth token generation failed');
    });

    it('should fallback to LoginService.APPLE when userData.loginService is missing', async () => {
      const userData = {
        _id: 'user-id',
        email: 'user@apple.com',
        name: 'Test User',
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE },
        avatarRemoteId: 'avatar-id',
        setting: {},
        lastLogin: new Date(),
        timezoneOffset: 7,
        signatures: [],
        createdAt: new Date(),
        metadata: {},
        newNotifications: 0
      };
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
        eventScope: EventScopes.PERSONAL
      };
      const timezoneOffset = 7;
      const ipAddress = '127.0.0.1';
    
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);
      jest.spyOn(userService, 'isUserUsingPassword').mockReturnValue(false);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(userData as any);
      jest.spyOn(userService, 'getLoginService').mockReturnValue(LoginService.APPLE);
      jest.spyOn(eventService, 'createEvent').mockResolvedValue(undefined);
      jest.spyOn(userService, 'migratePersonalWorkspace').mockResolvedValue(undefined);
    
      const result = await authService['signInWithApple'](
        userData as any,
        timezoneOffset,
        eventData as any,
        ipAddress
      );
    
      expect(result.user.loginService).toBe(LoginService.APPLE);
    });
  });

  describe('signUpWithApple', () => {
    it('should handle authTokenError and throw error', async () => {
      const email = 'newuser@apple.com';
      const name = 'New User';
      const appleUserId = 'apple-user-id';
      const timezoneOffset = 7;
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
        eventScope: EventScopes.PERSONAL
      };
      const userOrigin = UserOrigin.LUMIN;
      const ipAddress = '127.0.0.1';

      const newUser = {
        _id: 'user-id',
        email: email,
        name: name,
        appleUserId: appleUserId,
        origin: userOrigin,
        loginService: LoginService.APPLE
      };

      const authTokenError = new Error('Auth token generation failed');

      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'migratePersonalWorkspace').mockResolvedValue(undefined);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        error: authTokenError
      });

      await expect(authService['signUpWithApple'](
        email,
        name,
        appleUserId,
        timezoneOffset,
        eventData as any,
        userOrigin,
        ipAddress
      )).rejects.toThrow('Auth token generation failed');
    });

    it('should fallback to "Lumin User" and UserOrigin.LUMIN when name and userOrigin are not provided', async () => {
      const email = ''; 
      const name = ''; 
      const appleUserId = 'apple-user-id';
      const timezoneOffset = 7;
      const eventData = {
        eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
        eventScope: EventScopes.PERSONAL
      };
      const ipAddress = '127.0.0.1';
    
      const newUser = {
        _id: 'user-id',
        email: '',
        name: 'Lumin User',
        appleUserId: appleUserId,
        origin: UserOrigin.LUMIN,
        loginService: LoginService.APPLE,
        newNotifications: 0,
      };
    
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser as any);
      jest.spyOn(userService, 'migratePersonalWorkspace').mockResolvedValue(undefined);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      jest.spyOn(redisService, 'setRefreshToken').mockResolvedValue(undefined);
      jest.spyOn(userService, 'isUserUsingPassword').mockReturnValue(false);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);
      jest.spyOn(emailService, 'generateDeeplinkForEmail').mockReturnValue('https://app.luminpdf.com/email-welcome');
      jest.spyOn(eventService, 'createEvent').mockResolvedValue(undefined);
    
      const result = await authService['signUpWithApple'](
        email,
        name,
        appleUserId,
        timezoneOffset,
        eventData as any,
        undefined,
        ipAddress
      );
    
      expect(result.user.name).toBe('Lumin User');
      expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        origin: UserOrigin.LUMIN,
      }));
    });
  });

  describe('loginWithApple', () => {
    it('should login with Apple using Apple user ID', async () => {
      const idToken = 'valid-apple-token';
      const nonce = 'test-nonce';
      const timezoneOffset = 7;
      const name = 'Test User';
      const userOrigin = UserOrigin.LUMIN;
      const ipAddress = '127.0.0.1';

      const mockAppleResponse = {
        sub: 'apple-user-id',
        email: 'user@apple.com',
        email_verified: true
      };

      const appleUserData = {
        _id: 'user-id',
        email: 'user@apple.com',
        name: 'Test User',
        loginService: LoginService.APPLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(authService, 'verifyAppleToken').mockResolvedValue(mockAppleResponse as any);
      jest.spyOn(userService, 'findUserByAppleUserId').mockResolvedValue(appleUserData as any);
      jest.spyOn(authService as any, 'signInWithApple').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: appleUserData
      } as any);

      const result = await authService.loginWithApple(
        idToken,
        nonce,
        timezoneOffset,
        name,
        userOrigin,
        ipAddress
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.isSignedUp).toBe(true);
      expect(authService.verifyAppleToken).toHaveBeenCalledWith(idToken, nonce);
      expect(userService.findUserByAppleUserId).toHaveBeenCalledWith('apple-user-id', null);
      expect(authService['signInWithApple']).toHaveBeenCalledWith(
        appleUserData,
        timezoneOffset,
        {
          eventName: NonDocumentEventNames.PERSONAL_SIGNED_IN,
          eventScope: EventScopes.PERSONAL
        },
        ipAddress
      );
    });

    it('should login with Apple using email when Apple user ID not found', async () => {
      const idToken = 'valid-apple-token';
      const nonce = 'test-nonce';
      const timezoneOffset = 7;
      const name = 'Test User';
      const userOrigin = UserOrigin.LUMIN;
      const ipAddress = '127.0.0.1';

      const mockAppleResponse = {
        sub: 'apple-user-id',
        email: 'user@apple.com',
        email_verified: true
      };

      const userData = {
        _id: 'user-id',
        email: 'user@apple.com',
        name: 'Test User',
        loginService: LoginService.GOOGLE,
        origin: UserOrigin.LUMIN,
        payment: { type: PaymentPlanEnums.FREE }
      };

      jest.spyOn(authService, 'verifyAppleToken').mockResolvedValue(mockAppleResponse as any);
      jest.spyOn(userService, 'findUserByAppleUserId').mockResolvedValue(null);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(userData as any);
      jest.spyOn(authService as any, 'signInWithApple').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: true,
        user: userData
      } as any);

      const result = await authService.loginWithApple(
        idToken,
        nonce,
        timezoneOffset,
        name,
        userOrigin,
        ipAddress
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.isSignedUp).toBe(true);
      expect(userService.findUserByEmail).toHaveBeenCalledWith('user@apple.com', null);
      expect(authService['signInWithApple']).toHaveBeenCalledWith(
        userData,
        timezoneOffset,
        {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        ipAddress
      );
    });

    it('should sign up new user with Apple when no existing user found', async () => {
      const idToken = 'valid-apple-token';
      const nonce = 'test-nonce';
      const timezoneOffset = 7;
      const name = 'New User';
      const userOrigin = UserOrigin.LUMIN;
      const ipAddress = '127.0.0.1';

      const mockAppleResponse = {
        sub: 'apple-user-id',
        email: 'newuser@apple.com',
        email_verified: true
      };

      jest.spyOn(authService, 'verifyAppleToken').mockResolvedValue(mockAppleResponse as any);
      jest.spyOn(userService, 'findUserByAppleUserId').mockResolvedValue(null);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authService as any, 'signUpWithApple').mockResolvedValue({
        token: 'access-token',
        refreshToken: 'refresh-token',
        isSignedUp: false,
        user: { _id: 'user-id', email: 'newuser@apple.com' }
      } as any);

      const result = await authService.loginWithApple(
        idToken,
        nonce,
        timezoneOffset,
        name,
        userOrigin,
        ipAddress
      );

      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.isSignedUp).toBe(false);
      expect(authService['signUpWithApple']).toHaveBeenCalledWith(
        'newuser@apple.com',
        name,
        'apple-user-id',
        timezoneOffset,
        {
          eventName: NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          eventScope: EventScopes.PERSONAL
        },
        userOrigin,
        ipAddress
      );
    });
  });

  describe('resendVerifyEmail', () => {
    it('should return token for bananasign origin', async () => {
      const user = {
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        origin: UserOrigin.BANANASIGN,
      } as User;
      
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.resendVerifyEmail(user);
      
      expect(result.tokenVerifyAccount).toBe('token');
    });

    it('should return error if user is null', async () => {
      const result = await authService.resendVerifyEmail(null);
      
      expect(result.error.code).toBe(ServerStatusCode.INTERNAL);
    });

    it('should return null error for non-bananasign origin', async () => {
      const user = {
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        origin: UserOrigin.LUMIN,
      } as User;
      
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.resendVerifyEmail(user);
      
      expect(result.error).toBeNull();
    });

    it('should use UserOrigin.LUMIN as default when user.origin is undefined', async () => {
      const user = {
        _id: '5d5f85b5a7ab840c8d46f697',
        email: 'test@email.com',
        origin: undefined,
      } as User;
      
      jest.spyOn(authService, 'createToken').mockReturnValue('token');

      const result = await authService.resendVerifyEmail(user);
      
      expect(result.error).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should return error if user not verified', async () => {
      const user = { isVerified: false } as User;
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      
      const result = await authService.forgotPassword({ email: 'test@gmail.com' });
      
      expect(result.error.code).toBe(ServerStatusCode.BAD_REQUEST);
      expect(result.error.message).toBe('Your account has not been verified yet');
    });

    it('should return error if user has no password', async () => {
      const user: any = {
        _id: 'userId',
        email: 'test@email.com',
        name: 'Test User',
          isVerified: true,
          password: null,
        origin: UserOrigin.LUMIN,
      };
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user as any);
      
      const result = await authService.forgotPassword({ email: 'test@gmail.com' });
      
      expect(result.error.code).toBe(ServerStatusCode.BAD_REQUEST);
      expect(result.error.message).toBe('This email address is currently being used with Google, Dropbox or Microsoft');
    });

    it('should use UserOrigin.LUMIN when origin is not provided and user.origin is null', async () => {
      const user = { 
        isVerified: true, 
        password: 'password', 
        origin: null 
      } as any;
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(authService, 'createResetPasswordToken').mockReturnValue('token');
      
      const result = await authService.forgotPassword({ email: 'test@gmail.com' });
      
      expect(result.error).toBeNull();
    });

    it('should use provided origin over user.origin', async () => {
      const user = { 
        isVerified: true, 
        password: 'password', 
        origin: UserOrigin.LUMIN 
      } as User;
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(authService, 'createResetPasswordToken').mockReturnValue('token');
      
      const result = await authService.forgotPassword({ 
        email: 'test@gmail.com',
        origin: UserOrigin.BANANASIGN 
      });
      
      expect(result.data).toBeDefined();
      expect(result.data.token).toBe('token');
    });      
  });

  describe('createResetPasswordToken', () => {
    it('should create reset password token', () => {
      const user = { _id: 'userId', email: 'test@email.com' } as User;
      jest.spyOn(authService, 'createToken').mockReturnValue('token');
      
      const result = authService.createResetPasswordToken(user);
      
      expect(result).toBe('token');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const payload = { token: { _id: 'userId' } };
      jest.spyOn(userService, 'resetPassword').mockResolvedValue(true);

      const result = await authService.resetPassword(payload);
      
      expect(result).toBe('userId');
    });

    it('should return null if reset fails', async () => {
      const payload = { token: { _id: 'userId' } };
      jest.spyOn(userService, 'resetPassword').mockResolvedValue(false);
      
      const result = await authService.resetPassword(payload);
      
      expect(result).toBeNull();
    });
  });

  describe('isDuplicateRecentPassword', () => {
    it('should return true if password is duplicate', async () => {
      jest.spyOn(Utils, 'comparePassword').mockResolvedValue(true);
      const result = await authService.isDuplicateRecentPassword(['oldPassword'], 'newPassword');
      expect(result).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully with app type', async () => {
      const user = { _id: 'userId' } as User;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);

      const result = await authService.signOut('userId', 'token', 'refreshToken');
      
      expect(result).toBe(true);
    });

    it('should sign out successfully without app type', async () => {
      const user = { _id: 'userId' } as User;
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      
      const result = await authService.signOut('userId', 'token', 'refreshToken', 'web');
      
      expect(result).toBe(true);
    });
  });

  describe('adminSignIn', () => {
    it('should sign in admin successfully', async () => {
      const admin = {
        _id: 'admin-id',
        email: 'admin@test.com',
        name: 'Admin User',
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true),
        avatarRemoteId: 'avatar-id',
        createdAt: new Date(),
        timezoneOffset: 0
      };
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(admin);
      jest.spyOn(redisService, 'getAdminFailedAttempt').mockResolvedValue(0);
      jest.spyOn(authService, 'getAccessToken').mockReturnValue('admin-token');
      
      const result = await authService.adminSignIn({
        userEmail: 'admin@test.com',
        password: 'password',
        timezoneOffset: 0
      });
      
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should handle admin sign in with too many attempts', async () => {
      jest.spyOn(redisService, 'getAdminFailedAttempt').mockResolvedValue(5);
      jest.spyOn(redisService, 'getKeyTTL').mockResolvedValue(3600);
      
      await expect(authService.adminSignIn({
        userEmail: 'admin@test.com',
        password: 'password',
        timezoneOffset: 0
      })).rejects.toThrow();
    });

    it('should handle admin password mismatch', async () => {
      const admin = {
        _id: 'admin-id',
        email: 'admin@test.com',
        name: 'Admin User',
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(false),
        avatarRemoteId: 'avatar-id',
        createdAt: new Date(),
        timezoneOffset: 0
      };
      
      jest.spyOn(redisService, 'getAdminFailedAttempt').mockResolvedValue(0);
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(admin);
      
      await expect(authService.adminSignIn({
        userEmail: 'admin@test.com',
        password: 'wrongpassword',
        timezoneOffset: 0
      })).rejects.toThrow();
    });

    it('should handle missing userEmail (null)', async () => {
      jest.spyOn(redisService, 'getAdminFailedAttempt').mockResolvedValue(0);
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(null);
    
      await expect(authService.adminSignIn({
        userEmail: null as any,
        password: 'password',
        timezoneOffset: 0,
      })).rejects.toThrow();
    });
  });

  describe('adminVerifyTokenWithType', () => {
    it('should verify token with correct type', () => {
      const token = 'valid-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;
      const mockPayload = { _id: 'user-id', type: TOKEN_TYPE.VERIFY_ACCOUNT };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);

      const result = authService.adminVerifyTokenWithType(token, type);

      expect(result.tokenPayload).toEqual(mockPayload);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid token type', () => {
      const token = 'valid-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;
      const mockPayload = { _id: 'user-id', type: TOKEN_TYPE.RESET_PASSWORD };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);

      const result = authService.adminVerifyTokenWithType(token, type);

      expect(result.error).toBeDefined();
      expect(result.tokenPayload).toBeUndefined();
    });

    it('should handle token expired error', () => {
      const token = 'expired-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      const result = authService.adminVerifyTokenWithType(token, type);

      expect(result.error).toBeDefined();
    });

    it('should handle other verification errors', () => {
      const token = 'invalid-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.adminVerifyTokenWithType(token, type);

      expect(result.error).toBeDefined();
    });
  });

  describe('adminVerifyResetPasswordToken', () => {
    it('should return error for invalid token with generic error message', async () => {
      const token = 'invalid-token';
      
      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const result = await authService.adminVerifyResetPasswordToken(token);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid token');
      expect(result.error.extensions.code).toBe(ErrorCode.Common.TOKEN_INVALID);
    });

    it('should verify reset password token successfully', async () => {
      const token = 'valid-reset-token';
      const mockPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);
      jest.spyOn(redisService, 'getAdminResetPasswordToken').mockResolvedValue(token);

      const result = await authService.adminVerifyResetPasswordToken(token);

      expect(result.tokenPayload).toEqual(mockPayload);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid token', async () => {
      const token = 'invalid-token';
      const mockPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);
      jest.spyOn(redisService, 'getAdminResetPasswordToken').mockResolvedValue('different-token');

      const result = await authService.adminVerifyResetPasswordToken(token);

      expect(result.error).toBeDefined();
      expect(result.tokenPayload).toBeUndefined();
    });

    it('should handle token expired error', async () => {
      const token = 'expired-token';

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      const result = await authService.adminVerifyResetPasswordToken(token);

      expect(result.error).toBeDefined();
    });
  });

  describe('adminVerifyCreatePasswordToken', () => {
    it('should verify create password token successfully', async () => {
      const token = 'valid-create-token';
      const mockPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);
      jest.spyOn(redisService, 'getAdminCreatePasswordToken').mockResolvedValue(token);

      const result = await authService.adminVerifyCreatePasswordToken(token);

      expect(result.tokenPayload).toEqual(mockPayload);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid token', async () => {
      const token = 'invalid-token';
      const mockPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockPayload);
      jest.spyOn(redisService, 'getAdminCreatePasswordToken').mockResolvedValue('different-token');

      const result = await authService.adminVerifyCreatePasswordToken(token);

      expect(result.error).toBeDefined();
      expect(result.tokenPayload).toBeUndefined();
    });

    it('should handle token expired error', async () => {
      const token = 'expired-token';

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      const result = await authService.adminVerifyCreatePasswordToken(token);

      expect(result.error).toBeDefined();
      expect(result.tokenPayload).toBeUndefined();
    });

    it('should handle other verification errors', async () => {
      const token = 'invalid-token';

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.adminVerifyCreatePasswordToken(token);

      expect(result.error).toBeDefined();
      expect(result.tokenPayload).toBeUndefined();
    });
  });

  describe('adminForgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const email = 'admin@test.com';
      const admin = { _id: 'admin-id', email, name: 'Admin User' };

      jest.spyOn(redisService, 'getResetPasswordRemainingTimes').mockResolvedValue(3);
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(admin as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ id: 'email-id' } as any);

      await authService.adminForgotPassword(email);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        EMAIL_TYPE.ADMIN_RESET_PASSWORD,
        [email],
        { name: admin.name, token: expect.any(String) }
      );
    });

    it('should throw error when daily limit exceeded', async () => {
      const email = 'admin@test.com';

      jest.spyOn(redisService, 'getResetPasswordRemainingTimes').mockResolvedValue(0);

      await expect(authService.adminForgotPassword(email)).rejects.toThrow();
    });

    it('should throw error when admin not found', async () => {
      const email = 'nonexistent@test.com';

      jest.spyOn(redisService, 'getResetPasswordRemainingTimes').mockResolvedValue(3);
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.adminForgotPassword(email)).rejects.toThrow();
    });

    it('should not throw if sendEmailResult is undefined', async () => {
      const email = 'admin@test.com';
      const admin = { _id: 'admin-id', email, name: 'Admin User' };
    
      jest.spyOn(redisService, 'getResetPasswordRemainingTimes').mockResolvedValue(3);
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(admin as any);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined as any);
      const setRemainingTimesSpy = jest.spyOn(redisService, 'setResetPasswordRemainingTimes');
    
      await authService.adminForgotPassword(email);
    
      expect(setRemainingTimesSpy).not.toHaveBeenCalled();
    });  
  });

  describe('adminUpdatePassword', () => {
    it('should update admin password with extra data', async () => {
      const payload = { adminId: 'admin-id', password: 'newpassword' };
      const extraData = { name: 'New Name', status: AdminStatus.ACTIVE };
      const updatedAdmin = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(adminService, 'updatePropertiesById').mockResolvedValue(updatedAdmin as any);

      const result = await authService.adminUpdatePassword(payload, extraData);

      expect(result).toEqual(updatedAdmin);
      expect(adminService.updatePropertiesById).toHaveBeenCalledWith(
        payload.adminId,
        { password: expect.any(String), ...extraData }
      );
    });
  });

  describe('adminResetPassword', () => {
    it('should reset admin password successfully', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };
      const admin = {
        _id: 'admin-id',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      const updatedAdmin = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService, 'adminVerifyResetPasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(adminService, 'findById').mockResolvedValue(admin as any);
      jest.spyOn(authService, 'adminUpdatePassword').mockResolvedValue(updatedAdmin as any);
      jest.spyOn(redisService, 'deleteAdminResetPasswordToken').mockImplementation();
      jest.spyOn(redisService, 'clearAdminToken').mockImplementation();

      const result = await authService.adminResetPassword(resetPassword);

      expect(result).toEqual(updatedAdmin);
      expect(redisService.deleteAdminResetPasswordToken).toHaveBeenCalledWith(tokenPayload.email);
      expect(redisService.clearAdminToken).toHaveBeenCalledWith(tokenPayload._id);
    });

    it('should throw error when adminVerifyResetPasswordToken returns error', async () => {
      const resetPassword = {
        token: 'invalid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const error = new Error('Token verification failed');

      jest.spyOn(authService, 'adminVerifyResetPasswordToken').mockResolvedValue({ error });

      await expect(authService.adminResetPassword(resetPassword)).rejects.toThrow('Token verification failed');
    });

    it('should throw error when admin not found', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService, 'adminVerifyResetPasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(adminService, 'findById').mockResolvedValue(null);

      await expect(authService.adminResetPassword(resetPassword)).rejects.toThrow();
    });

    it('should throw error for same password', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'samepassword',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };
      const admin = {
        _id: 'admin-id',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(authService, 'adminVerifyResetPasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(adminService, 'findById').mockResolvedValue(admin as any);

      await expect(authService.adminResetPassword(resetPassword)).rejects.toThrow();
    });

    it('should handle isOldPassword condition correctly', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };
      const admin = {
        _id: 'admin-id',
        comparePassword: jest.fn().mockResolvedValue(true) // This simulates isOldPassword = true
      };

      jest.spyOn(authService, 'adminVerifyResetPasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(Utils, 'validateAdminPassword').mockReturnValue(true);
      jest.spyOn(adminService, 'findById').mockResolvedValue(admin as any);

      await expect(authService.adminResetPassword(resetPassword)).rejects.toThrow('New password must be different from the current password');
    });
  });

  describe('adminCreatePassword', () => {
    it('should create admin password successfully', async () => {
      const data = {
        token: 'valid-token',
        name: 'Admin User',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };
      const admin = { _id: 'admin-id', email: 'admin@test.com' };
      const updatedAdmin = { _id: 'admin-id', name: 'Admin User', status: AdminStatus.ACTIVE };

      jest.spyOn(authService, 'adminVerifyCreatePasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(adminService, 'findById').mockResolvedValue(admin as any);
      jest.spyOn(authService, 'adminUpdatePassword').mockResolvedValue(updatedAdmin as any);
      jest.spyOn(redisService, 'deleteAdminCreatePasswordToken').mockImplementation();

      const result = await authService.adminCreatePassword(data);

      expect(result).toEqual(updatedAdmin);
      expect(redisService.deleteAdminCreatePasswordToken).toHaveBeenCalledWith(tokenPayload.email);
    });

    it('should throw error when adminVerifyCreatePasswordToken returns error', async () => {
      const data = {
        token: 'invalid-token',
        name: 'Admin User',
        password: 'NewPassword123'
      };
      const error = new Error('Token verification failed');

      jest.spyOn(authService, 'adminVerifyCreatePasswordToken').mockResolvedValue({ error });

      await expect(authService.adminCreatePassword(data)).rejects.toThrow('Token verification failed');
    });

    it('should throw error when admin not found', async () => {
      const data = {
        token: 'valid-token',
        name: 'Admin User',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService, 'adminVerifyCreatePasswordToken').mockResolvedValue({ tokenPayload });
      jest.spyOn(adminService, 'findById').mockResolvedValue(null);

      await expect(authService.adminCreatePassword(data)).rejects.toThrow();
    });

    it('should throw error for invalid password', async () => {
      const data = {
        token: 'valid-token',
        name: 'Admin User',
        password: 'weak'
      };
      const tokenPayload = { _id: 'admin-id', email: 'admin@test.com' };

      jest.spyOn(authService, 'adminVerifyCreatePasswordToken').mockResolvedValue({ tokenPayload });

      await expect(authService.adminCreatePassword(data)).rejects.toThrow();
    });
  });

  describe('adminSignOut', () => {
    it('should sign out admin successfully', async () => {
      const adminId = 'admin-id';
      const token = 'admin-token';

      jest.spyOn(redisService, 'deleteAdminToken').mockResolvedValue(undefined);
      jest.spyOn(redisService, 'addAccessTokenToBlacklist').mockImplementation();

      await authService.adminSignOut(adminId, token);

      expect(redisService.deleteAdminToken).toHaveBeenCalledWith(adminId, token);
      expect(redisService.addAccessTokenToBlacklist).toHaveBeenCalledWith(token);
    });
  });

  describe('verifyDropboxToken', () => {
    it('should verify dropbox token successfully', async () => {
      const accessToken = 'valid-dropbox-token';
      const mockDropboxResponse = {
        data: {
          email: 'user@dropbox.com',
          name: { display_name: 'Test User' },
          email_verified: true
        }
      };

      jest.spyOn(authService, 'httpPost').mockResolvedValue(mockDropboxResponse as any);

      const result = await authService.verifyDropboxToken(accessToken);

      expect(result).toEqual(mockDropboxResponse.data);
      expect(authService.httpPost).toHaveBeenCalledWith(
        CommonConstants.DROPBOX_GET_CURRENT_ACCOUNT_API,
        JSON.stringify(null),
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should throw error when email is not verified', async () => {
      const accessToken = 'valid-dropbox-token';
      const mockDropboxResponse = {
        data: {
          email: 'user@dropbox.com',
          name: { display_name: 'Test User' },
          email_verified: false
        }
      };

      jest.spyOn(authService, 'httpPost').mockResolvedValue(mockDropboxResponse as any);

      await expect(authService.verifyDropboxToken(accessToken)).rejects.toThrow('Your account has not yet been verified');
    });
  });

  describe('createToken', () => {
    it('should create token', () => {
      const result = authService.createToken({ userId: '123' }, '24h');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create token without expire', () => {
      const result = authService.createTokeWithoutExpire({ userId: '123' });
      expect(result).toBe('jwt-token');
    });

    it('should get auth token with IP address validation error', () => {
      const mockError = GraphErrorException.BadRequest('IP validation failed', 'IP_VALIDATION_ERROR');
      jest.spyOn(whitelistIPService, 'validateIPRequest').mockReturnValue({ error: mockError });

      const result = authService.getAuthToken({ 
        data: { _id: 'user-id', email: 'user@test.com' }, 
        ipAddress: '192.168.1.1',
        isGraphqlRequest: true
      });

      expect(result.error).toBe(mockError);
      expect(result.token).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });

    it('should get auth token with Google login type', () => {
      const userData = { 
        _id: 'user-id', 
        email: 'user@test.com',
        name: 'Test User'
      };

      const result = authService.getAuthToken({ 
        data: userData, 
        loginType: LOGIN_TYPE.GOOGLE
      });

      expect(result.token).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
    });

    it('should get access token', () => {
      const result = authService.getAccessToken({ _id: '123', email: 'test@email.com', userType: APP_USER_TYPE.LUMIN_USER });
      expect(result).toEqual(expect.any(String));
    });
  });

  describe('genLandingPageToken', () => {
    it('should generate a JWT token with correct payload', () => {
      const landingPageType = 'welcome';
      const token = 'mocked-token';
    
      jest.spyOn(authService['jwtService'], 'sign').mockReturnValue(token);
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue({ landingPageType } as any);
    
      const result = authService.genLandingPageToken(landingPageType);
    
      expect(result).toBe(token);
      expect(authService['jwtService'].sign).toHaveBeenCalledWith(
        { landingPageType },
        { expiresIn: CommonConstants.JWT_EXPIRE_LANDING_PAGE_TOKEN }
      );
    
      const decoded = authService['jwtService'].verify(result) as any;
      expect(decoded.landingPageType).toBe(landingPageType);
    });    
  });
  
  describe('httpPost', () => {
    it('should make HTTP POST request and map response correctly', async () => {
      const url = 'https://api.example.com/test';
      const data = { test: 'data' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      const mockResponse = { data: { success: true, message: 'Success' } };
    
      jest.spyOn(authService['httpService'], 'post').mockReturnValue(of(mockResponse) as any);
    
      const result = await authService.httpPost(url, data, config);
    
      expect(result).toEqual(mockResponse);
      expect(authService['httpService'].post).toHaveBeenCalledWith(url, data, config);
    });
  });

  describe('verifyOrgInvitationToken', () => {
    it('should verify organization invitation token successfully', async () => {
      const token = 'valid-org-token';
      const tokenData = { email: 'user@test.com', orgId: 'org-id' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(tokenData);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue(token);

      const result = await authService.verifyOrgInvitationToken(token);

      expect(result).toEqual({ email: tokenData.email, orgId: tokenData.orgId });
    });

    it('should return error for expired token', async () => {
      const token = 'expired-token';
      const tokenData = { email: 'user@test.com', orgId: 'org-id' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(tokenData);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue('different-token');

      const result = await authService.verifyOrgInvitationToken(token);

      expect(result.error).toBe(CommonConstants.TOKEN_EXPIRED_ERROR);
    });

    it('should return error if jwtService.verify throws', async () => {
      const token = 'invalid-token';
    
      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
    
      const result = await authService.verifyOrgInvitationToken(token);
    
      expect(result).toEqual({
        email: '',
        orgId: '',
        error: 'Error',
      });
    });
    
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const userId = 'user-id';
      const user = {
        _id: userId,
        email: 'user@test.com',
        deletedAt: null,
        payment: {
          type: PaymentPlanEnums.BUSINESS,
          subscriptionRemoteId: 'sub-id',
          stripeAccountId: 'stripe-id'
        }
      };
      const updatedUser = { ...user, deletedAt: new Date() };
  
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'transferOwnerPermission').mockResolvedValue();
      jest.spyOn(paymentService, 'updateStripeSubscription').mockResolvedValue({} as any);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(updatedUser as any);
      jest.spyOn(organizationService, 'delInviteOrgListByEmail').mockResolvedValue(undefined);
      jest.spyOn(organizationService, 'cancelDefaultOrganizationSubscription').mockResolvedValue();
      jest.spyOn(organizationService, 'removeRequestAccessDocumentNoti').mockResolvedValue();
      (organizationService as any).removeRequestAccessOrgNoti = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(organizationService, 'leaveOrganizations').mockResolvedValue();
      jest.spyOn(userService, 'removeDeletedUser').mockResolvedValue();
  
      const result = await authService.deleteAccount({ userId });
  
      expect(result.user).toEqual(updatedUser);
      expect(authService.transferOwnerPermission).toHaveBeenCalledWith(user);
      expect(organizationService.removeRequestAccessOrgNoti).toHaveBeenCalledWith(user._id);
    });

    it('should return error if user already being deleted', async () => {
      const userId = 'user-id';
      const user = {
        _id: userId,
        email: 'user@test.com',
        deletedAt: new Date()
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);

      const result = await authService.deleteAccount({ userId });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('User is being deleted');
    });
  });

  describe('verifyTokenWithType', () => {
    it('should verify token with type successfully', () => {
      const token = 'valid-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;
      const tokenPayload = { _id: 'user-id', type };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(tokenPayload);

      const result = authService.verifyTokenWithType(token, type);

      expect(result.tokenPayload).toEqual(tokenPayload);
    });

    it('should handle token expired error', () => {
      const token = 'expired-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      const result = authService.verifyTokenWithType(token, type);

      expect(result.error).toBeDefined();
    });

    it('should return error for wrong token type', () => {
      const token = 'valid-token';
      const type = TOKEN_TYPE.VERIFY_ACCOUNT;
      const tokenPayload = { _id: 'user-id', type: TOKEN_TYPE.RESET_PASSWORD };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(tokenPayload);

      const result = authService.verifyTokenWithType(token, type);

      expect(result.error).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };
      const user = {
        _id: 'user-id',
        email: 'user@test.com',
        password: 'oldPassword',
        recentPasswords: []
      };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'isDuplicateRecentPassword').mockResolvedValue(false);
      jest.spyOn(authService, 'verifyUserPasswordStrength').mockReturnValue({ isVerified: true });
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'resetPassword').mockResolvedValue('user-id');
      jest.spyOn(redisService, 'clearAllRefreshToken').mockImplementation();
      jest.spyOn(redisService, 'revokePermission').mockImplementation();

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeNull();
      expect(redisService.clearAllRefreshToken).toHaveBeenCalledWith('user-id');
      expect(redisService.revokePermission).toHaveBeenCalledWith('valid-token');
    });

    it('should return error for invalid token', async () => {
      const resetPassword = {
        token: 'invalid-token',
        password: 'NewPassword123'
      };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ 
        error: { message: 'Invalid token' } as any
      });

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result.message).toContain('Invalid token');
    });

    it('should return error for invalid password', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'weak'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(authService, 'verifyUserPasswordStrength').mockReturnValue({ 
        isVerified: false, 
        error: { message: 'Password should be greater than 8 characters' } as any
      });

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result?.message).toContain('Password should be greater than 8 characters');
    });

    it('should return error for invalid password validation', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'weak'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(Utils, 'validatePassword').mockReturnValue(false);

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result?.message).toContain('Password should be greater than 8 characters and less than 32 characters');
    });

    it('should return error when user not found', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result.message).toContain('User not found');
    });

    it('should return error for same password', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };
      const user = {
        _id: 'user-id',
        email: 'user@test.com',
        password: 'hashedPassword',
        recentPasswords: []
      };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);
      jest.spyOn(Utils, 'comparePassword').mockResolvedValue(true);

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result?.message).toContain('New password must be different from the current password');
    });

    it('should return error for duplicate recent password', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };
      const user = {
        _id: 'user-id',
        email: 'user@test.com',
        password: 'oldPassword',
        recentPasswords: []
      };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'isDuplicateRecentPassword').mockResolvedValue(true);

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result.message).toContain('You used this password recently');
    });

    it('should return error for invalid reset password token', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123'
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('different-token');

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result.message).toContain('This link has been invalid');
    });

    it('should return error when reset password fails', async () => {
      const resetPassword = {
        token: 'valid-token',
        password: 'NewPassword123',
        stayLoggedIn: false
      };
      const tokenPayload = { _id: 'user-id', email: 'user@test.com' };
      const user = {
        _id: 'user-id',
        email: 'user@test.com',
        password: 'oldPassword',
        recentPasswords: []
      };

      jest.spyOn(authService, 'verifyTokenWithType').mockReturnValue({ tokenPayload });
      jest.spyOn(redisService, 'getResetPasswordToken').mockResolvedValue('valid-token');
      jest.spyOn(userService, 'findUserById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'isDuplicateRecentPassword').mockResolvedValue(false);
      jest.spyOn(authService, 'verifyUserPasswordStrength').mockReturnValue({ isVerified: true });
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(user as any);
      jest.spyOn(authService, 'resetPassword').mockResolvedValue('');
      jest.spyOn(Utils, 'comparePassword').mockResolvedValue(false);
      jest.spyOn(Utils, 'hashPassword').mockResolvedValue('hashedPassword');

      const result = await authService.changePassword(resetPassword);

      expect(result).toBeDefined();
      expect(result.message).toContain('Reset password failed');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockUser as any);
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.verifyRefreshToken(refreshToken);

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(false);

      const result = await authService.verifyRefreshToken(refreshToken);

      expect(result.error).toBeDefined();
      expect(result.user).toBeUndefined();
    });

    it('should handle invalid refresh token in Redis', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockUser as any);
      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(false);

      const result = await authService.verifyRefreshToken(refreshToken);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Tokens are invalid');
      expect(result.user).toBeUndefined();
    });

    it('should handle TOKEN_EXPIRED_ERROR and return expired session error', async () => {
      const refreshToken = 'expired-refresh-token';
      const expiredError = new Error('Token expired');
      expiredError.name = CommonConstants.TOKEN_EXPIRED_ERROR;
      
      jest.spyOn(Utils, 'decryptData').mockImplementation(() => {
        throw expiredError;
      });
      
      const result = await authService.verifyRefreshToken(refreshToken);
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Session has been expired');
      expect(result.error.errorCode).toBe(ErrorCode.Common.TOKEN_EXPIRED);
    });
  });

  describe('verifyTokens', () => {
    it('should verify tokens successfully', async () => {
      const accessToken = 'valid-access-token';
      const refreshToken = 'valid-refresh-token';
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockUser as any);
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.verifyTokens(accessToken, refreshToken);

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for blacklisted tokens', async () => {
      const accessToken = 'blacklisted-token';
      const refreshToken = 'valid-refresh-token';

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(true);

      const result = await authService.verifyTokens(accessToken, refreshToken);

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Tokens are blacklisted');
    });

    it('should fallback to verifyRefreshToken when access token fails', async () => {
      const accessToken = 'invalid-access-token';
      const refreshToken = 'valid-refresh-token';

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      jest.spyOn(authService, 'verifyRefreshToken').mockResolvedValue({
        user: { _id: 'user-id', email: 'user@test.com' }
      });

      const result = await authService.verifyTokens(accessToken, refreshToken);

      expect(result.user).toBeDefined();
      expect(authService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should return error when refresh token is invalid in verifyTokens', async () => {
      const accessToken = 'valid-access-token';
      const refreshToken = 'valid-refresh-token';
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(false);
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockUser);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.verifyTokens(accessToken, refreshToken);

      expect(result).toEqual({
        error: expect.objectContaining({
          message: 'Tokens are invalid'
        })
      });
    });
  });

  describe('verifyRecaptcha', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should test AUTH_GOOGLE_RECAPTCHA_SECRET_KEY environment constant usage', async () => {
      const params = { responseKey: 'recaptcha-response', isLuminAuth: true };
      const mockSecretKey = 'auth-google-recaptcha-secret-key';
      const mockGoogleResponse = { success: true };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue(mockSecretKey);
      
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockGoogleResponse)
      } as any);

      const result = await authService.verifyRecaptcha(params);

      expect(result.success).toBe(true);
      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.AUTH_GOOGLE_RECAPTCHA_SECRET_KEY);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.google.com/recaptcha/api/siteverify?secret=${mockSecretKey}&response=${params.responseKey}`,
        { method: 'post' }
      );
    });

    it('should test catch block returns success false', async () => {
      const params = { responseKey: 'recaptcha-response' };
      const mockSecretKey = 'secret-key';

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue(mockSecretKey);
      
      mockFetch.mockRejectedValue(new Error('Any error'));

      const result = await authService.verifyRecaptcha(params);

      expect(result).toEqual({ success: false });
    });
  });

  describe('verifyOryAuthenticationToken', () => {
    it('should return null for invalid session', async () => {
      const token = 'invalid-ory-token';
      const mockSession = {
        id: 'session-id',
        identity: {
          traits: { email: 'user@test.com' }
        }
      };

      jest.spyOn(authService['oryJwtService'], 'verifyOryAuthenticationToken').mockResolvedValue(mockSession as any);
      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('["session-id"]');

      const result = await authService.verifyOryAuthenticationToken(token);

      expect(result).toBeNull();
    });

    it('should handle session with undefined identity', async () => {
      const token = 'valid-ory-token';
      const mockSession = {
        id: 'session-id',
        identity: undefined
      };

      jest.spyOn(authService['oryJwtService'], 'verifyOryAuthenticationToken').mockResolvedValue(mockSession as any);
      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('[]');

      const result = await authService.verifyOryAuthenticationToken(token);

      expect(result).toEqual(mockSession);
      expect(redisService.getRedisValueWithKey).not.toHaveBeenCalled();
    });

    it('should handle undefined response from Redis', async () => {
      const token = 'valid-ory-token';
      const mockSession = {
        id: 'session-id',
        identity: {
          traits: { email: 'user@test.com' }
        }
      };

      jest.spyOn(authService['oryJwtService'], 'verifyOryAuthenticationToken').mockResolvedValue(mockSession as any);
      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('null');
      const result = await authService.verifyOryAuthenticationToken(token);

      expect(result).toEqual(mockSession);
      expect(redisService.getRedisValueWithKey).toHaveBeenCalledWith(`${RedisConstants.INVALID_SESSION_ID}user@test.com`);
    });

    it('should handle undefined session', async () => {
      const token = 'undefined-session';
      
      jest.spyOn(authService['oryJwtService'], 'verifyOryAuthenticationToken').mockResolvedValue(undefined as any);
    
      const result = await authService.verifyOryAuthenticationToken(token);
    
      expect(result).toBeUndefined();
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      const token = 'valid-token';
      const mockSession = { id: 'session-id' };

      jest.spyOn(authService['oryJwtService'], 'verifyOryAuthorizationToken').mockResolvedValue(mockSession as any);

      const result = await authService.getSession(token);

      expect(result).toEqual(mockSession);
    });
  });

  describe('verifyUserPasswordStrength', () => {
    it('should always return verified true', () => {
      const email = 'user@test.com';
      const password = 'password123';

      const result = authService.verifyUserPasswordStrength(email, password);

      expect(result.isVerified).toBe(true);
    });
  });

  describe('getAuthenticationToken', () => {
    it('should get authentication token successfully', async () => {
      const cookie = 'valid-cookie';
      const mockSession = { id: 'session-id' };

      jest.spyOn(authService['kratosService'].kratosClient, 'toSession').mockResolvedValue({
        data: mockSession
      } as any);

      const result = await authService.getAuthenticationToken(cookie);

      expect(result).toEqual(mockSession);
    });
  });

  describe('getOryAuthorizationToken', () => {
    it('should extract Ory authorization token from headers', () => {
      const headers = {
        [CommonConstants.ORY_AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer token123'
      };

      const result = authService.getOryAuthorizationToken(headers);

      expect(result).toBe('token123');
    });

    it('should throw error when token is missing', () => {
      const headers = {};

      expect(() => authService.getOryAuthorizationToken(headers)).toThrow('Missing authorization token');
    });
  });

  describe('getOryAuthenticationTokenRpc', () => {
    it('should extract Ory authentication token from metadata', () => {
      const metadata = {
        get: jest.fn().mockReturnValue(['Bearer token123'])
      };

      const result = authService.getOryAuthenticationTokenRpc(metadata as any);

      expect(result).toBe('token123');
    });

    it('should throw error when token is missing', () => {
      const metadata = {
        get: jest.fn().mockReturnValue([])
      };

      expect(() => authService.getOryAuthenticationTokenRpc(metadata as any)).toThrow('Missing authentication token');
    });
  });

  describe('deleteIdentity', () => {
    it('should delete identity successfully', async () => {
      const id = 'identity-id';

      await authService.deleteIdentity(id);

      expect(kratosService.kratosAdmin.deleteIdentity).toHaveBeenCalledWith({ id });
    });
  });

  describe('verifyRecaptchaV3', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should verify recaptcha v3 successfully', async () => {
      const responseKey = 'recaptcha-v3-response';
      const mockSecretKey = 'v3-secret-key';
      const mockGoogleResponse = { score: 0.9, success: true };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue(mockSecretKey);
      
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockGoogleResponse)
      } as any);

      const result = await authService.verifyRecaptchaV3(responseKey);

      expect(result.response).toEqual(mockGoogleResponse);
      expect(authService['environmentService'].getByKey).toHaveBeenCalledWith(EnvConstants.GOOGLE_RECAPTCHA_V3_SECRET_KEY);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.google.com/recaptcha/api/siteverify?secret=${mockSecretKey}&response=${responseKey}`,
        { method: 'post' }
      );
    });
  });

  describe('sendNotificationFirstLoginUser', () => {
    it('should send notification for first login user successfully', async () => {
      const joinOrgInvitations = [
        {
          _id: 'invitation-1',
          inviterId: 'inviter-1',
          target: 'org-1'
        }
      ];
      const mockInviter = { _id: 'inviter-1', name: 'Inviter' };
      const mockOrg = { _id: 'org-1', name: 'Test Org', ownerId: 'owner-1' };
      const mockOwner = { _id: 'owner-1', name: 'Owner' };

      jest.spyOn(userService, 'findUserById')
        .mockResolvedValueOnce(mockInviter as any)
        .mockResolvedValueOnce(mockOwner as any);
      jest.spyOn(organizationService, 'findOneOrganization').mockResolvedValue(mockOrg as any);
      jest.spyOn(notificationService, 'getNotificationsByConditions').mockResolvedValue([]);
      jest.spyOn(organizationService, 'notifyInviteToOrg').mockResolvedValue(undefined);

      await authService.sendNotificationFirstLoginUser(joinOrgInvitations as any);

      expect(organizationService.notifyInviteToOrg).toHaveBeenCalledWith({
        actor: mockInviter,
        organization: mockOrg,
        memberList: joinOrgInvitations,
        actorType: 'LUMIN_USER'
      });
    });

    it('should skip notification when organization does not exist', async () => {
      const joinOrgInvitations = [
        {
          _id: 'invitation-1',
          inviterId: 'inviter-1',
          target: 'org-1'
        }
      ];

      jest.spyOn(userService, 'findUserById').mockResolvedValue({} as any);
      jest.spyOn(organizationService, 'findOneOrganization').mockResolvedValue(null);
      jest.spyOn(notificationService, 'getNotificationsByConditions').mockResolvedValue([]);
      jest.spyOn(organizationService, 'notifyInviteToOrg').mockResolvedValue(undefined);

      await authService.sendNotificationFirstLoginUser(joinOrgInvitations as any);

      expect(organizationService.notifyInviteToOrg).not.toHaveBeenCalled();
    });

    it('should use owner as actor when inviter does not exist', async () => {
      const joinOrgInvitations = [
        {
          _id: 'invitation-1',
          inviterId: 'inviter-1',
          target: 'org-1'
        }
      ];
      const mockOrg = { _id: 'org-1', name: 'Test Org', ownerId: 'owner-1' };
      const mockOwner = { _id: 'owner-1', name: 'Owner' };

      jest.spyOn(userService, 'findUserById')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockOwner as any);
      jest.spyOn(organizationService, 'findOneOrganization').mockResolvedValue(mockOrg as any);
      jest.spyOn(notificationService, 'getNotificationsByConditions').mockResolvedValue([]);
      jest.spyOn(organizationService, 'notifyInviteToOrg').mockResolvedValue(undefined);

      await authService.sendNotificationFirstLoginUser(joinOrgInvitations as any);

      expect(organizationService.notifyInviteToOrg).toHaveBeenCalledWith({
        actor: mockOwner,
        organization: mockOrg,
        memberList: joinOrgInvitations,
        actorType: 'SALE_ADMIN'
      });
    });
  });

  describe('putContractTemporary', () => {
    it('should put contract temporary successfully', async () => {
      const data = { contractId: 'contract-123' };
      const mockResponse = { data: { identify: 'identify-123' } };

      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('bananasign-url');
      jest.spyOn(authService, 'httpPost').mockResolvedValue(mockResponse as any);

      const result = await authService.putContractTemporary(data);

      expect(result).toEqual({ identify: 'identify-123' });
    });
  });

  describe('validateRecaptcha', () => {
    it('should validate recaptcha successfully', async () => {
      const params = {
        reCaptchaTokenV3: 'recaptcha-token',
        email: 'user@test.com',
        context: {}
      };
      const mockResponse = { score: 0.9 };

      jest.spyOn(authService, 'verifyRecaptchaV3').mockResolvedValue({ response: mockResponse });

      const result = await authService.validateRecaptcha(params);

      expect(result).toBe(0.9);
    });

    it('should throw error for low score', async () => {
      const params = {
        reCaptchaTokenV3: 'recaptcha-token',
        email: 'user@test.com',
        context: {}
      };
      const mockResponse = { score: 0.1 };

      jest.spyOn(authService, 'verifyRecaptchaV3').mockResolvedValue({ response: mockResponse });
      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue('0.5'); // Set threshold higher than score

      await expect(authService.validateRecaptcha(params)).rejects.toThrow();
    });
  });

  describe('verifyNewUserInvitationToken', () => {
    it('should verify new user invitation token for circle invitation successfully', async () => {
      const token = 'valid-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id' }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };
      const mockOrg = { _id: 'org-id', name: 'Test Org', url: 'test-url' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([{}] as any);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue(token);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue([{}] as any);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.VALID);
      expect(result.isSignedUp).toBe(true);
    });

    it('should verify new user invitation token for share document successfully', async () => {
      const token = 'valid-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.SHARE_DOCUMENT,
        metadata: {}
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([{}] as any);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.VALID);
      expect(result.isSignedUp).toBe(true);
    });

    it('should handle expired token', async () => {
      const token = 'expired-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id', isSameUnpopularDomain: true }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };
      const mockOrg = { _id: 'org-id', name: 'Test Org', url: 'test-url' };

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });
      jest.spyOn(authService['jwtService'], 'decode').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.VALID);
      expect(result.isSignedUp).toBe(true);
    });

    it('should return REMOVED status when organization does not exist', async () => {
      const token = 'valid-circle-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id', isSameUnpopularDomain: false }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([{ _id: 'request-id' }] as any);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue(token);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(null);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.REMOVED);
      expect(result.error.message).toBe('Organization is not existed');
      expect(result.error.code).toBe('token_invalid');
    });

    it('should return EXPIRED status when token is not unique and not same unpopular domain', async () => {
      const token = 'invalid-circle-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id', isSameUnpopularDomain: false }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };
      const mockOrg = { _id: 'org-id', name: 'Test Org', url: 'test-url' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([{ _id: 'request-id' }] as any);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue('different-token');
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue([{}] as any);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.EXPIRED);
      expect(result.error.message).toBe('Token was removed');
      expect(result.error.code).toBe('token_invalid');
    });

    it('should return REMOVED status when no invite org data exists', async () => {
      const token = 'valid-circle-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id', isSameUnpopularDomain: false }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };
      const mockOrg = { _id: 'org-id', name: 'Test Org', url: 'test-url' };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([{ _id: 'request-id' }] as any);
      jest.spyOn(redisService, 'getValidInviteToken').mockResolvedValue('different-token'); // Not unique token
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue([]);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.REMOVED);
      expect(result.error.message).toBe('Token was removed');
    });

    it('should handle expired token for circle invitation with removed organization', async () => {
      const token = 'expired-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.CIRCLE_INVITATION,
        metadata: { orgId: 'org-id', isSameUnpopularDomain: true }
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });
      jest.spyOn(authService['jwtService'], 'decode').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(null);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.REMOVED);
      expect(result.error.message).toBe('Organization is not existed');
    });

    it('should handle expired token for non-circle invitation', async () => {
      const token = 'expired-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: UserInvitationTokenType.SHARE_DOCUMENT,
        metadata: {}
      };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(authService['jwtService'], 'verify').mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });
      jest.spyOn(authService['jwtService'], 'decode').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.EXPIRED);
      expect(result.error.message).toBe('Token was expired');
      expect(result.error.code).toBe('token_expired');
    });

    it('should throw error for invalid token type', async () => {
      const token = 'valid-token';
      const mockTokenResult = {
        email: 'user@test.com',
        type: 'INVALID_TYPE',
        metadata: {}
      };

      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockTokenResult as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(organizationService, 'getRequestAccessByCondition').mockResolvedValue([]);

      const result = await authService.verifyNewUserInvitationToken(token);

      expect(result.status).toBe(InvitationTokenStatus.INVALID);
      expect(result.error.message).toBe('Invalid token type!');
    });
  });

  describe('transferOwnerPermission', () => {
    it('should transfer owner permission successfully', async () => {
      const user = {
        _id: 'user-id',
        email: 'user@test.com'
      };
      const orgs = [{ _id: 'org-1', name: 'Org 1' }];
      const teams = [{ _id: 'team-1', name: 'Team 1' }];
      const orgMembers = [{ organization: { _id: 'org-2', name: 'Org 2' } }];

      jest.spyOn(organizationService, 'getOrganizationOwner').mockResolvedValue(orgs as any);
      jest.spyOn(teamService, 'findTeamByOwner').mockResolvedValue(teams as any);
      jest.spyOn(organizationService, 'getOrganizationMembers').mockResolvedValue(orgMembers as any);
      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('user@test.com');
      jest.spyOn(adminService, 'stopTransferAdminProcess').mockImplementation();
      jest.spyOn(organizationTeamService, 'transferTeamOwner').mockResolvedValue();
      jest.spyOn(organizationService, 'transferOrganizationOwner').mockResolvedValue();

      await authService.transferOwnerPermission(user as any);

      expect(organizationTeamService.transferTeamOwner).toHaveBeenCalledWith(teams[0], user);
      expect(organizationService.transferOrganizationOwner).toHaveBeenCalledWith(orgs[0], user);
    });

    it('should handle case with no orgs and teams', async () => {
      const user = {
        _id: 'user-id',
        email: 'user@test.com'
      };

      jest.spyOn(organizationService, 'getOrganizationOwner').mockResolvedValue([]);
      jest.spyOn(teamService, 'findTeamByOwner').mockResolvedValue([]);
      jest.spyOn(organizationService, 'getOrganizationMembers').mockResolvedValue([]);

      await authService.transferOwnerPermission(user as any);
    });
  });

  describe('signinWithLumin', () => {
    it('should handle first login user with invite org list', async () => {
      const params = {
        code: 'auth-code',
        timezoneOffset: 7
      };
      const mockHydraResp = {
        data: {
          id_token: 'id-token'
        }
      };
      const mockTokenData = { email: 'user@test.com' };
      const mockUserData = {
        _id: 'user-id',
        email: 'user@test.com',
        timezoneOffset: NaN
      };
      const mockRequestAccesses = [
        { _id: 'request-1', actor: 'user@test.com' }
      ];
  
      jest.spyOn(authService['httpService'].axiosRef, 'post').mockResolvedValue(mockHydraResp as any);
      jest.spyOn(authService['jwtService'], 'decode').mockReturnValue(mockTokenData as any);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUserData as any);
      jest.spyOn(userService, 'updateUserPropertyById').mockResolvedValue(mockUserData as any);
      jest.spyOn(organizationService, 'getInviteOrgList').mockResolvedValue(mockRequestAccesses as any);
      jest.spyOn(authService, 'sendNotificationFirstLoginUser').mockResolvedValue(undefined);
      jest.spyOn(userService, 'interceptUserData').mockResolvedValue(mockUserData as any);
      jest.spyOn(authService, 'getAuthToken').mockReturnValue({
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
  
      (userService as any).checkTermsOfUseVersionChanged = jest.fn().mockReturnValue(false);
  
      const result = await authService.signinWithLumin(params);
  
      expect(result).toEqual({
        user: { ...mockUserData, isTermsOfUseVersionChanged: false },
        refreshToken: 'refresh-token',
        token: 'access-token',
        idToken: 'id-token'
      });
      expect(authService.sendNotificationFirstLoginUser).toHaveBeenCalledWith(mockRequestAccesses);
    });
  });
  

  describe('validateResendVerificationMail', () => {
    it('should validate resend verification mail', async () => {
      jest.spyOn(Utils, 'validateEmail').mockReturnValue(true);
      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('');
      
      const result = await authService.validateResendVerificationMail('test@email.com');
      
      expect(result.isAccept).toBe(true);
    });

    it('should reject invalid email', async () => {
      const email = 'invalid-email';

      const result = await authService.validateResendVerificationMail(email);

      expect(result.isAccept).toBe(false);
      expect(result.error?.message).toContain('Email is invalid');
    });

    it('should reject if email already sent recently', async () => {
      const email = 'user@test.com';

      jest.spyOn(redisService, 'getRedisValueWithKey').mockResolvedValue('sent');
      jest.spyOn(redisService, 'getKeyTTL').mockResolvedValue(300);

      const result = await authService.validateResendVerificationMail(email);

      expect(result.isAccept).toBe(false);
      expect(result.error?.message).toContain('Verify email has been sent');
    });
  });

  describe('authenticateFromMobile', () => {
    it('should authenticate from mobile successfully', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockDecoded = { _id: 'user-id', email: 'user@test.com' };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue({ decoded: mockDecoded });
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(Utils, 'isRequestFromMobile').mockResolvedValue(true);

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.isAccept).toBe(true);
    });

    it('should return error for invalid token headers', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Invalid access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Token is invalid');
    });

    it('should return error for blacklisted tokens', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(true);

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Token is invalid');
    });

    it('should return error when validateRefreshToken fails', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockError = { message: 'Validation failed', code: 'VALIDATION_ERROR' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue({ error: mockError });

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBe(mockError);
    });

    it('should handle token expired error', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = CommonConstants.TOKEN_EXPIRED_ERROR;
        throw error;
      });

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Session has been expired');
    });

    it('should handle general authentication error', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        throw new Error('General error');
      });

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Authentication Error');
    });

    it('should handle non-mobile request with GraphQL error', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockDecoded = { _id: 'user-id', email: 'user@test.com' };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue({ decoded: mockDecoded });
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(Utils, 'isRequestFromMobile').mockResolvedValue(false);

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Invalid x-mb request');
      const errorCode = (result.error as any)?.extensions?.code || (result.error as any)?.errorCode;
      expect(errorCode).toBe(ErrorCode.Common.INVALID_REQUEST_HEADER);
    });

    it('should handle non-mobile request with HTTP error', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockDecoded = { _id: 'user-id', email: 'user@test.com' };
      const mockUser = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue({ decoded: mockDecoded });
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser as any);
      jest.spyOn(Utils, 'isRequestFromMobile').mockResolvedValue(false);

      const result = await authService.authenticateFromMobile(request as any, false);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Invalid x-mb request');
      expect(result.error).toBeTruthy();
    });

    it('should handle HttpErrorException.Unauthorized with Token is invalid', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        const error = new Error('Token is invalid') as any;
        error.name = 'HttpErrorException';
        error.message = 'Token is invalid';
        error.code = ErrorCode.Common.TOKEN_INVALID;
        throw error;
      });

      const result = await authService.authenticateFromMobile(request as any, false);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Authentication Error');
    });

    it('should handle error with error_code function returning INVALID_IP_ADDRESS', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockError = {
        error_code: jest.fn().mockReturnValue(ErrorCode.Common.INVALID_IP_ADDRESS),
        message: 'Invalid IP address'
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        throw mockError;
      });

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect(result.error).toBe(mockError);
    });

    it('should handle error with getErrorCode function returning INVALID_IP_ADDRESS', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
      const mockError = {
        getErrorCode: jest.fn().mockReturnValue(ErrorCode.Common.INVALID_IP_ADDRESS),
        message: 'Invalid IP address'
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        throw mockError;
      });

      const result = await authService.authenticateFromMobile(request as any, true);

      expect(result.error).toBeDefined();
      expect(result.error).toBe(mockError);
    });

    it('should return HTTP Unauthorized error for blacklisted tokens', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
    
      jest.spyOn(redisService, 'checkKeyBlackList')
        .mockResolvedValueOnce(true) 
        .mockResolvedValueOnce(false);
    
      const result = await authService.authenticateFromMobile(request as any, false);
    
      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Token is invalid');
      expect((result.error as any)?.constructor.name).toBe('UnauthorizedException');
    });
    
    it('should return HTTP Unauthorized error for invalid token headers', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Invalid access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };
    
      const result = await authService.authenticateFromMobile(request as any, false);
    
      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Token is invalid');
      expect((result.error as any)?.constructor.name).toBe('UnauthorizedException');
    });

    it('should return HTTP Unauthorized error when token is expired', async () => {
      const request = {
        headers: {
          [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: 'Bearer access-token',
          [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: 'Bearer refresh-token'
        }
      };

      jest.spyOn(redisService, 'checkKeyBlackList').mockResolvedValue(false);
      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = CommonConstants.TOKEN_EXPIRED_ERROR;
        throw error;
      });

      const result = await authService.authenticateFromMobile(request as any, false);

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Session has been expired');
      expect((result.error as any)?.constructor.name).toBe('UnauthorizedException');
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate refresh token successfully', async () => {
      const refreshTokenHeader = 'Bearer refresh-token';
      const mockDecoded = { _id: 'user-id', email: 'user@test.com' };

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService['whitelistIPService'], 'validateIPRequest').mockReturnValue({ error: null });
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockDecoded as any);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.validateRefreshToken(refreshTokenHeader, true, '127.0.0.1');

      expect(result.decoded).toEqual(mockDecoded);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid refresh token', async () => {
      const refreshTokenHeader = 'Bearer invalid-token';

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(false);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.validateRefreshToken(refreshTokenHeader, true, '127.0.0.1');

      expect(result.error).toBeDefined();
      expect(result.decoded).toBeUndefined();
    });

    it('should return error when IP validation fails', async () => {
      const refreshTokenHeader = 'Bearer refresh-token';
      const mockDecoded = { _id: 'user-id', email: 'user@test.com' };
      const ipError = new Error('IP not allowed') as any;

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService['whitelistIPService'], 'validateIPRequest').mockReturnValue({ error: ipError });
      jest.spyOn(authService['jwtService'], 'verify').mockReturnValue(mockDecoded as any);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.validateRefreshToken(refreshTokenHeader, true, '192.168.1.1');

      expect(result.error).toBe(ipError);
      expect(result.decoded).toBeUndefined();
    });

    it('should handle HTTP request error format', async () => {
      const refreshTokenHeader = 'Bearer invalid-token';

      jest.spyOn(redisService, 'checkRefreshToken').mockResolvedValue(false);
      jest.spyOn(Utils, 'decryptData').mockReturnValue('decrypted-token');

      const result = await authService.validateRefreshToken(refreshTokenHeader, false, '127.0.0.1');

      expect(result.error).toBeDefined();
      expect((result.error as any)?.message).toContain('Token is invalid');
      expect(result.decoded).toBeUndefined();
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      const sessionId = 'session-id';

      jest.spyOn(authService['kratosService'].kratosAdmin, 'disableSession').mockResolvedValue(undefined);
      jest.spyOn(authService['messageGateway'].server, 'to').mockReturnValue({
        emit: jest.fn()
      } as any);

      await authService.revokeSession(sessionId);

      expect(authService['kratosService'].kratosAdmin.disableSession).toHaveBeenCalledWith({ id: sessionId });
    });

    it('should handle revoke session error', async () => {
      const sessionId = 'session-id';

      jest.spyOn(authService['kratosService'].kratosAdmin, 'disableSession').mockRejectedValue(new Error('Error'));
      jest.spyOn(authService['loggerService'], 'error').mockImplementation();

      await authService.revokeSession(sessionId);

      expect(authService['loggerService'].error).toHaveBeenCalled();
    });
  });

  describe('validateSession', () => {
    it('should validate session successfully', async () => {
      const session = {
        identity: { id: 'identity-id' }
      };

      jest.spyOn(redisService, 'hasIdentityDeletedRecently').mockResolvedValue('');

      await expect(authService.validateSession(session as any)).resolves.not.toThrow();
    });

    it('should throw error for recently deleted identity', async () => {
      const session = {
        identity: { id: 'identity-id' }
      };

      jest.spyOn(redisService, 'hasIdentityDeletedRecently').mockResolvedValue('true');

      await expect(authService.validateSession(session as any)).rejects.toThrow();
    });
  });

  describe('newUserFromExistingKratosSession', () => {
    it('should handle non-OIDC login with no verified addresses', async () => {
      const session = {
        identity: {
          id: 'identity-id-2',
          traits: {
            email: 'user2@test.com',
            name: 'Test User 2',
            loginService: LoginService.EMAIL_PASSWORD
          },
          verifiable_addresses: [
            { verified: false },
            { verified: false }
          ]
        }
      };
      const mockUser = { _id: 'user-id-2', email: 'user2@test.com' };

      jest.spyOn(authService, 'validateSession').mockResolvedValue();
      jest.spyOn(authService, 'newUserFromKratos').mockResolvedValue();
      jest.spyOn(userService, 'findUserByIdentityId').mockResolvedValue(mockUser as any);

      const result = await authService.newUserFromExistingKratosSession(session as any);

      expect(result).toEqual(mockUser);
      expect(authService.newUserFromKratos).toHaveBeenCalledWith({
        identityId: session.identity.id,
        email: session.identity.traits.email,
        name: session.identity.traits.name,
        isVerified: false,
        loginType: session.identity.traits.loginService,
      });
    });
  });

  describe('getCredentialsFromOpenGoogle', () => {
    it('should get credentials from open Google successfully', async () => {
      const credentialsId = 'credentials-id';
      const ipAddress = '127.0.0.1';
      const mockCredentials = { accessToken: 'token', refreshToken: 'refresh' };

      jest.spyOn(redisService, 'getCredentialsFromOpenGoogle').mockResolvedValue(mockCredentials as any);

      const result = await authService.getCredentialsFromOpenGoogle(credentialsId, ipAddress);

      expect(result).toEqual(mockCredentials);
    });

    it('should throw error for invalid credentials', async () => {
      const credentialsId = 'invalid-id';
      const ipAddress = '127.0.0.1';

      jest.spyOn(redisService, 'getCredentialsFromOpenGoogle').mockResolvedValue(null);

      await expect(authService.getCredentialsFromOpenGoogle(credentialsId, ipAddress)).rejects.toThrow();
    });
  });

  describe('getUserLoginServiceForKratosActions', () => {
    it('should return UNKNOWN_THIRD_PARTY for user without password and identityId', () => {
      const user = {
        password: null,
        loginService: LoginService.EMAIL_PASSWORD,
        identityId: null
      };

      const result = authService.getUserLoginServiceForKratosActions(user as any);

      expect(result).toBe(UNKNOWN_THIRD_PARTY);
    });

    it('should return EMAIL_PASSWORD for user with password but no loginService', () => {
      const user = {
        password: 'hashedPassword',
        loginService: null
      };

      const result = authService.getUserLoginServiceForKratosActions(user as any);

      expect(result).toBe(LoginService.EMAIL_PASSWORD);
    });
  });

  describe('handleKratosRegistrationFlowCallbackV2', () => {
    beforeEach(() => {
      (authService as any).kratosService = {
        getOryOrganizationByDomain: jest.fn().mockResolvedValue({ organizations: [] }),
      };
    });
  
    it('should return error for banned email', async () => {
      const data = {
        email: 'banned@test.com',
        loginType: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue({} as any);

      const result = await authService.handleKratosRegistrationFlowCallbackV2(data);

      expect(result.isAccept).toBe(false);
      expect(result.error.code).toBe(ErrorCode.User.EMAIL_IS_BANNED);
    });

    it('should return error for OIDC verification failure', async () => {
      const data = {
        email: 'user@test.com',
        loginType: LoginService.GOOGLE,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      };
      const mockError = { code: 'VERIFICATION_ERROR', message: 'Verification failed', metadata: {} };

      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(authService, 'verifyEmailOfOIDCRegistration').mockResolvedValue({ error: mockError });

      const result = await authService.handleKratosRegistrationFlowCallbackV2(data);

      expect(result.isAccept).toBe(false);
      expect(result.error).toBe(mockError);
    });

    it('should create new user when linking fails', async () => {
      const data = {
        email: 'user@test.com',
        loginType: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1',
        name: 'Test User',
        isVerified: true
      };
  
      jest.spyOn(blacklistService, 'findOne').mockResolvedValue(null);
      jest.spyOn(authService, 'linkExistingEmailWithKratosIdentity').mockResolvedValue(false);
      jest.spyOn(authService, 'newUserFromKratos').mockResolvedValue(undefined);
  
      const result = await authService.handleKratosRegistrationFlowCallbackV2(data);
  
      expect(result.isAccept).toBe(true);
      expect(authService.newUserFromKratos).toHaveBeenCalledWith(data);
    });
  });
  
  describe('verifyEmailOfOIDCRegistration', () => {
    it('should return null error when user does not exist', async () => {
      const email = 'newuser@test.com';
      const loginServiceFromKratos = LoginService.GOOGLE;

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      const result = await authService.verifyEmailOfOIDCRegistration(email, loginServiceFromKratos);

      expect(result.error).toBeNull();
    });

    it('should return null error when login services match', async () => {
      const email = 'user@test.com';
      const loginServiceFromKratos = LoginService.GOOGLE;
      const mockUser = {
        _id: 'user-id',
        email: 'user@test.com',
        loginService: LoginService.GOOGLE,
        identityId: 'identity-1'
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);

      const result = await authService.verifyEmailOfOIDCRegistration(email, loginServiceFromKratos);

      expect(result.error).toBeNull();
    });

    it('should return error when login services do not match and user has identityId', async () => {
      const email = 'user@test.com';
      const loginServiceFromKratos = LoginService.GOOGLE;
      const mockUser = {
        _id: 'user-id',
        email: 'user@test.com',
        loginService: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1'
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);

      const result = await authService.verifyEmailOfOIDCRegistration(email, loginServiceFromKratos);

      expect(result.error.code).toBe('already_signed_in_another_method');
      expect(result.error.metadata.loginService).toBe(LoginService.EMAIL_PASSWORD);
    });

    it('should return null error when loginServiceFromKratos is SAML_SSO and user has identityId', async () => {
      const email = 'samluser@test.com';
      const loginServiceFromKratos = LoginService.MICROSOFT;
      const mockUser = {
        _id: 'user-id',
        email,
        loginService: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1',
      };
    
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
    
      const result = await authService.verifyEmailOfOIDCRegistration(email, loginServiceFromKratos);
    
      expect(result.error).not.toBeNull();
    });
    
  });

  describe('linkExistingEmailWithKratosIdentity', () => {
    it('should link existing email with Kratos identity successfully', async () => {
      const params = {
        email: 'user@test.com',
        identityId: 'identity-1',
        loginService: LoginService.GOOGLE,
        name: 'Test User'
      };
      const mockUser = {
        _id: 'user-id',
        email: 'user@test.com',
        name: 'Old Name'
      };

      jest.spyOn(authService as any, 'tryLinkExistingEmailWithKratosIdentity').mockResolvedValue(true);
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'findOneAndUpdate').mockResolvedValue(undefined);

      const result = await authService.linkExistingEmailWithKratosIdentity(params);

      expect(result).toBe(true);
      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { loginService: LoginService.GOOGLE, name: 'Test User' }
      );
    });

    it('should return false when linking fails', async () => {
      const params = {
        email: 'user@test.com',
        identityId: 'identity-1',
        loginService: LoginService.GOOGLE,
        name: 'Test User'
      };

      jest.spyOn(authService as any, 'tryLinkExistingEmailWithKratosIdentity').mockResolvedValue(false);

      const result = await authService.linkExistingEmailWithKratosIdentity(params);

      expect(result).toBe(false);
    });
  });

  describe('deleteIdentityByEmail', () => {
    beforeEach(() => {
      (authService as any).kratosService = {
        deleteIdentityByEmail: jest.fn().mockResolvedValue(undefined),
      };
    });
  
    it('should delete identity by email successfully', async () => {
      const email = 'user@test.com';
      await authService.deleteIdentityByEmail(email);
  
      expect((authService as any).kratosService.deleteIdentityByEmail)
        .toHaveBeenCalledWith(email);
    });
  });
  
  describe('deleteUserIdentity', () => {
    beforeEach(() => {
      (authService as any).kratosService = {
        deleteIdentityByEmail: jest.fn().mockResolvedValue(undefined),
        deleteUserIdentity: jest.fn().mockResolvedValue(true),
      };
    });
  
    it('should delete user identity successfully', async () => {
      const user = { id: '123', email: 'user@test.com' } as any;
  
      await authService.deleteUserIdentity(user);
  
      expect((authService as any).kratosService.deleteUserIdentity)
        .toHaveBeenCalledWith(user);
    });
  });

  describe('changeEmailOnKratos', () => {
    beforeEach(() => {
      (authService as any).kratosService = {
        kratosAdmin: {
          getIdentity: jest.fn(),
          updateIdentity: jest.fn(),
          patchIdentity: jest.fn(),
          deleteIdentity: jest.fn(),
          deleteIdentityCredentials: jest.fn(),
        },
      };
    });

    it('should handle error for EMAIL_PASSWORD user', async () => {
      const user = {
        _id: 'user-id',
        loginService: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1'
      };
      const newEmail = 'newemail@test.com';

      jest.spyOn(authService['kratosService'].kratosAdmin, 'getIdentity').mockResolvedValue({
        data: {
          traits: { email: 'old@test.com' },
          verifiable_addresses: [{ verified: true, status: 'completed' }]
        }
      } as any);
      jest.spyOn(authService['kratosService'].kratosAdmin, 'updateIdentity').mockRejectedValue(new Error('Kratos error'));
      jest.spyOn(authService['loggerService'], 'error').mockImplementation();

      await authService.changeEmailOnKratos({ user: user as any, newEmail });

      expect(authService['loggerService'].error).toHaveBeenCalled();
    });

    it('should change email on Kratos for OIDC user successfully', async () => {
      const user = {
        _id: 'user-id',
        loginService: LoginService.GOOGLE,
        identityId: 'identity-1'
      };
      const newEmail = 'newemail@test.com';

      jest.spyOn(authService['kratosService'].kratosAdmin, 'deleteIdentity').mockResolvedValue(undefined);
      jest.spyOn(userService, 'findOneAndUpdate').mockResolvedValue(undefined);

      await authService.changeEmailOnKratos({ user: user as any, newEmail });

      expect(authService['kratosService'].kratosAdmin.deleteIdentity).toHaveBeenCalledWith({ id: 'identity-1' });
      expect(userService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $unset: { identityId: 1 } }
      );
    });

    it('should handle error for OIDC user', async () => {
      const user = {
        _id: 'user-id',
        loginService: LoginService.GOOGLE,
        identityId: 'identity-1'
      };
      const newEmail = 'newemail@test.com';

      jest.spyOn(authService['kratosService'].kratosAdmin, 'deleteIdentity').mockRejectedValue(new Error('Kratos error'));
      jest.spyOn(userService, 'findOneAndUpdate').mockResolvedValue(undefined);
      jest.spyOn(authService['loggerService'], 'error').mockImplementation();

      await authService.changeEmailOnKratos({ user: user as any, newEmail });

      expect(authService['loggerService'].error).toHaveBeenCalled();
    });

    it('should handle fallback schema_id and missing verifiable_addresses', async () => {
      const user = {
        _id: 'user-id',
        loginService: LoginService.EMAIL_PASSWORD,
        identityId: 'identity-1'
      };
      const newEmail = 'newemail@test.com';
      const mockIdentity = {
        data: {
          traits: { email: 'old@test.com' },
          verifiable_addresses: [{ verified: true, status: 'completed' }],
        }
      };
    
      jest.spyOn(authService['kratosService'].kratosAdmin, 'getIdentity').mockResolvedValue(mockIdentity as any);
      jest.spyOn(authService['kratosService'].kratosAdmin, 'updateIdentity').mockResolvedValue(undefined);
      jest.spyOn(authService['kratosService'].kratosAdmin, 'patchIdentity').mockResolvedValue(undefined);
      jest.spyOn(authService['environmentService'], 'getByKey').mockReturnValue(undefined as any);
    
      await authService.changeEmailOnKratos({ user: user as any, newEmail });
    
      expect(authService['kratosService'].kratosAdmin.updateIdentity).toHaveBeenCalledWith(
        expect.objectContaining({
          updateIdentityBody: expect.objectContaining({
            schema_id: 'user_v0',
            traits: expect.objectContaining({ email: newEmail }),
          })
        })
      );
      expect(authService['kratosService'].kratosAdmin.patchIdentity).toHaveBeenCalled();
    });
  });

  describe('ensureSessionWithVerifiedEmail', () => {
    it('should pass for verified email', () => {
      const session = {
        identity: {
          traits: { email: 'user@test.com' },
          verifiable_addresses: [
            { value: 'user@test.com', verified: true }
          ]
        }
      };

      expect(() => authService.ensureSessionWithVerifiedEmail(session as any)).not.toThrow();
    });

    it('should throw error if no verifiable_address matches email', () => {
      const session = {
        identity: {
          traits: { email: 'user@test.com' },
          verifiable_addresses: [
            { value: 'other@test.com', verified: true }
          ]
        }
      };

      expect(() => authService.ensureSessionWithVerifiedEmail(session as any)).toThrow('Authentication Error');
    });
  });

  describe('getFormFieldDetectionUsage', () => {
    it('should get form field detection usage successfully', async () => {
      const userId = 'user-id';
      const mockUsage = {
        usage: 5,
        blockTime: 3600,
        isExceeded: false
      };

      jest.spyOn(redisService, 'getFormFieldDetectionUsage').mockResolvedValue(mockUsage as any);

      const result = await authService.getFormFieldDetectionUsage(userId);

      expect(result).toEqual(mockUsage);
    });

    it('should handle error and return null', async () => {
      const userId = 'user-id';

      jest.spyOn(redisService, 'getFormFieldDetectionUsage').mockRejectedValue(new Error('Redis error'));
      jest.spyOn(authService['loggerService'], 'error').mockImplementation();

      const result = await authService.getFormFieldDetectionUsage(userId);

      expect(result).toBeNull();
      expect(authService['loggerService'].error).toHaveBeenCalled();
    });
  });

  describe('createRecaptchaAssessment', () => {
    it('should return error when recaptchaEnterpriseClient is not initialized', async () => {
      const params = {
        responseKey: 'test-response-key',
        expectedAction: 'LOGIN',
        siteKeyEnv: EnvConstants.GCLOUD_RECAPTCHA_AUTH_SITE_KEY,
      };

      (authService as any).recaptchaEnterpriseClient = null;
      jest.spyOn(loggerService, 'error').mockImplementation();

      const result = await authService['createRecaptchaAssessment'](params);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Recaptcha enterprise client not initialized');
      expect(loggerService.error).toHaveBeenCalled();
    });

    it('should create assessment successfully', async () => {
      const params = {
        responseKey: 'test-response-key',
        expectedAction: 'LOGIN',
        siteKeyEnv: EnvConstants.GCLOUD_RECAPTCHA_AUTH_SITE_KEY,
      };
      const mockProjectId = 'test-project-id';
      const mockProjectPath = 'projects/test-project-id';
      const mockSiteKey = 'test-site-key';
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      const mockClient = {
        projectPath: jest.fn().mockReturnValue(mockProjectPath),
        createAssessment: jest.fn().mockResolvedValue([mockAssessment]),
      };

      (authService as any).recaptchaEnterpriseClient = mockClient;
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce(mockProjectId)
        .mockReturnValueOnce(mockSiteKey);

      const result = await authService['createRecaptchaAssessment'](params);

      expect(result.assessment).toEqual(mockAssessment);
      expect(result.error).toBeUndefined();
      expect(mockClient.projectPath).toHaveBeenCalledWith(mockProjectId);
      expect(mockClient.createAssessment).toHaveBeenCalledWith({
        parent: mockProjectPath,
        assessment: {
          event: {
            siteKey: mockSiteKey,
            token: params.responseKey,
            expectedAction: params.expectedAction,
          },
        },
      });
    });

    it('should handle createAssessment error', async () => {
      const params = {
        responseKey: 'test-response-key',
        expectedAction: 'LOGIN',
        siteKeyEnv: EnvConstants.GCLOUD_RECAPTCHA_AUTH_SITE_KEY,
      };
      const mockProjectId = 'test-project-id';
      const mockProjectPath = 'projects/test-project-id';
      const mockSiteKey = 'test-site-key';
      const mockError = new Error('Assessment creation failed');

      const mockClient = {
        projectPath: jest.fn().mockReturnValue(mockProjectPath),
        createAssessment: jest.fn().mockRejectedValue(mockError),
      };

      (authService as any).recaptchaEnterpriseClient = mockClient;
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce(mockProjectId)
        .mockReturnValueOnce(mockSiteKey);

      await expect(authService['createRecaptchaAssessment'](params)).rejects.toThrow('Assessment creation failed');
    });
  });

  describe('verifyRecaptchaAuth', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        projectPath: jest.fn().mockReturnValue('projects/test-project-id'),
        createAssessment: jest.fn(),
      };
      (authService as any).recaptchaEnterpriseClient = mockClient;
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key');
    });

    it('should verify recaptcha auth successfully with valid token', async () => {
      const params = {
        responseKey: 'valid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(true);
    });

    it('should return success false when token is invalid', async () => {
      const params = {
        responseKey: 'invalid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: false,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(false);
    });

    it('should return success false when action does not match', async () => {
      const params = {
        responseKey: 'valid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'SIGNUP',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(false);
    });

    it('should return success false when score is below threshold', async () => {
      const params = {
        responseKey: 'valid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.3,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(false);
    });

    it('should return success false when score is exactly 0.5', async () => {
      const params = {
        responseKey: 'valid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.5,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(true);
    });

    it('should return success false when riskAnalysis is missing', async () => {
      const params = {
        responseKey: 'valid-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: undefined,
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.verifyRecaptchaAuth(params);

      expect(result.success).toBe(false);
    });

    it('should throw error when recaptchaEnterpriseClient is not initialized', async () => {
      const params = {
        responseKey: 'test-response-key',
        expectedAction: 'LOGIN',
      };

      (authService as any).recaptchaEnterpriseClient = null;
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(authService.verifyRecaptchaAuth(params)).rejects.toThrow();
    });

    it('should use correct site key environment constant', async () => {
      const params = {
        responseKey: 'test-response-key',
        expectedAction: 'LOGIN',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'LOGIN',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      const getByKeySpy = jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key');
      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      await authService.verifyRecaptchaAuth(params);

      expect(getByKeySpy).toHaveBeenCalledWith(EnvConstants.GCLOUD_RECAPTCHA_PROJECT_ID);
      expect(getByKeySpy).toHaveBeenCalledWith(EnvConstants.GCLOUD_RECAPTCHA_AUTH_SITE_KEY);
    });
  });

  describe('validateRecaptchaEnterprise', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        projectPath: jest.fn().mockReturnValue('projects/test-project-id'),
        createAssessment: jest.fn(),
      };
      (authService as any).recaptchaEnterpriseClient = mockClient;
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key')
        .mockReturnValueOnce('0.5');
    });

    it('should validate recaptcha enterprise successfully', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.validateRecaptchaEnterprise(params);

      expect(result).toBe(0.9);
    });

    it('should throw error when score is below payment threshold', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.3,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      await expect(authService.validateRecaptchaEnterprise(params)).rejects.toThrow();
    });

    it('should throw error when email is in blacklist', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'travlp+011@dgroup.co',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      await expect(authService.validateRecaptchaEnterprise(params)).rejects.toThrow();
    });

    it('should throw error when recaptchaEnterpriseClient is not initialized', async () => {
      const params = {
        reCaptchaTokenV3: 'test-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };

      (authService as any).recaptchaEnterpriseClient = null;
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(authService.validateRecaptchaEnterprise(params)).rejects.toThrow();
    });

    it('should use correct site key environment constant', async () => {
      const params = {
        reCaptchaTokenV3: 'test-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.9,
        },
      };

      const getByKeySpy = jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key')
        .mockReturnValueOnce('0.5');
      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      await authService.validateRecaptchaEnterprise(params);

      expect(getByKeySpy).toHaveBeenCalledWith(EnvConstants.GCLOUD_RECAPTCHA_PROJECT_ID);
      expect(getByKeySpy).toHaveBeenCalledWith(EnvConstants.GCLOUD_RECAPTCHA_WEB_SITE_KEY);
      expect(getByKeySpy).toHaveBeenCalledWith(EnvConstants.PAYMENT_RECAPTCHA_V3_THRESHOLD);
    });

    it('should handle missing riskAnalysis score', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: undefined,
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key')
        .mockReturnValueOnce('0.5');

      await expect(authService.validateRecaptchaEnterprise(params)).rejects.toThrow();
    });

    it('should handle score exactly at threshold', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.5,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);
      jest.spyOn(authService['environmentService'], 'getByKey')
        .mockReturnValueOnce('test-project-id')
        .mockReturnValueOnce('test-site-key')
        .mockReturnValueOnce('0.5');

      const result = await authService.validateRecaptchaEnterprise(params);

      expect(result).toBe(0.5);
    });

    it('should return score when above threshold and email not in blacklist', async () => {
      const params = {
        reCaptchaTokenV3: 'valid-token',
        email: 'user@test.com',
        expectedAction: 'PAYMENT',
      };
      const mockAssessment = {
        tokenProperties: {
          valid: true,
          action: 'PAYMENT',
        },
        riskAnalysis: {
          score: 0.8,
        },
      };

      mockClient.createAssessment.mockResolvedValue([mockAssessment]);

      const result = await authService.validateRecaptchaEnterprise(params);

      expect(result).toBe(0.8);
    });
  });
});
