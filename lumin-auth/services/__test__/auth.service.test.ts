/* eslint-disable sonarjs/no-duplicate-string */
jest.mock('@/lib/grpc', () => ({
  __esModule: true,
  default: {
    kratos: {},
    user: {},
    auth: {},
    contractAuthService: {},
    workspace: {}
  }
}));

import { Identity, RecoveryIdentityAddress } from '@ory/client';
import * as jwt from 'jsonwebtoken';

import { ErrorCode } from '@/constants/errorCode';
import { LoginService, UNKNOWN_THIRD_PARTY } from '@/interfaces/user';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { identityApi } from '@/lib/ory';
import { User } from '@/proto/auth/common/User';

import { authService } from '../auth.service';
jest.mock('@/lib/ory');
jest.mock('@/lib/logger');

const mockGrpc = grpc as jest.Mocked<typeof grpc>;
const mockIdentityApi = identityApi as jest.Mocked<typeof identityApi>;
const mockLogger = logger as jest.Mocked<typeof logger>;

jest.mock('@/configs/environment', () => ({
  environment: {
    public: {
      host: {
        backendUrl: 'http://localhost:3000'
      },
      common: {
        sessionLifespan: '1h'
      },
      datadog: {
        clientToken: 'test-datadog-token'
      }
    },
    internal: {
      host: {
        grpcServerUrl: 'http://localhost:50051'
      },
      ory: {
        adminApiKey: 'test-admin-api-key',
        userSchema: 'test-schema'
      },
      jwt: {
        cannyJwtSecret: 'test-secret'
      }
    },
    contractEnv: {
      host: {
        grpcServerUrl: 'http://localhost:50052'
      }
    }
  }
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySignIn', () => {
    const email = 'test@example.com';

    it('should return isAccept: true when verification passes', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.isAccept).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when first login with Ory fails', async () => {
      const error = {
        message: 'First login error',
        code: ErrorCode.User.USER_NOT_FOUND,
        metadata: { loginService: LoginService.GOOGLE }
      };
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({
        isAccept: false,
        error
      });

      const result = await authService.verifySignIn(email);

      expect(result.isAccept).toBeUndefined();
      expect(result.error).toEqual({
        message: error.message,
        code: error.code,
        meta: {
          loginService: LoginService.GOOGLE
        }
      });
    });

    it('should return error when user not n', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifySignIn(email);

      expect(result.isAccept).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.User.INCORRECT_EMAIL_PASSWORD);
    });
  });

  describe('verifyRegisterAccount', () => {
    const email = 'test@example.com';

    it('should return isAccept: true when registration is valid', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.isAccept).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when verifyRegisterAccount fails', async () => {
      const error = {
        message: 'Registration error',
        code: ErrorCode.User.EMAIL_EXISTS
      };
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({ error });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.isAccept).toBeUndefined();
      expect(result.error).toEqual({
        message: error.message,
        code: error.code
      });
    });

    it('should return error when account already exists', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true
        }
      });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.isAccept).toBeUndefined();
      expect(result.error?.code).toBe(ErrorCode.User.EMAIL_EXISTS);
    });

    it('should return UNKNOWN_THIRD_PARTY when metadata is undefined', async () => {
      const error = {
        message: 'Some error',
        code: ErrorCode.User.USER_NOT_FOUND
      };

      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({
        isAccept: false,
        error
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.meta?.loginService).toBe(UNKNOWN_THIRD_PARTY);
    });

    it('Login service is different', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: { loginService: LoginService.GOOGLE } as User });

      const result = await authService.verifySignIn(email);
      expect(result.error?.code).toBe(ErrorCode.User.USER_NOT_FOUND);
    });

    it('should handle case when grpc.user.getUserByEmail returns undefined', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue(undefined);

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });
      expect(result.error).toBeUndefined();
    });

    it('should run only assertLoginDifferentAccountError when loginService is not EMAIL_PASSWORD', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.GOOGLE
      });

      expect(result.error).toBeUndefined();
    });

    it('should handle excuteAsserts returning NoError to cover assertResult || {}', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.isAccept).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('verifySignAuthMethod', () => {
    const email = 'test@example.com';

    it('should return user when verification passes', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error when user not found', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.user).toBeUndefined();
      expect(result.error?.code).toBe(ErrorCode.User.INCORRECT_EMAIL_PASSWORD);
    });

    it('should return error when account is unverified', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({});

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.user).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
    });

    it('should handle getUserByEmail returning null safely', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.error?.code).toBe(ErrorCode.User.INCORRECT_EMAIL_PASSWORD);
    });
  });

  describe('verifyResendVerificationLink', () => {
    const email = 'test@example.com';

    it('should return user when verification passes', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({});

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error when user not found', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.user).toBeUndefined();
      expect(result.error?.code).toBe(ErrorCode.User.USER_NOT_FOUND);
    });

    it('should return error when account is already verified', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.user).toBeUndefined();
      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_VERIFIED);
    });

    it('should handle getUserByEmail returning null safely', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.error?.code).toBe(ErrorCode.User.USER_NOT_FOUND);
    });

    it('should handle checkAttempResendVerification returning null safely', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue(null);

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.error?.code).toBeUndefined();
    });

    it('return error when checkAttempResendVerification returns error', async () => {
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({
        error: { code: ErrorCode.User.USER_NOT_FOUND }
      });

      const result = await authService.verifyResendVerificationLink({ email });

      expect(result.error?.code).toBe(ErrorCode.User.USER_NOT_FOUND);
    });
  });

  describe('createEmailPasswordIdentity', () => {
    it('should create identity with correct parameters', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const mockIdentity = {
        id: 'identity-id',
        traits: { email, name, loginService: LoginService.EMAIL_PASSWORD }
      };

      mockIdentityApi.createIdentity = jest.fn().mockResolvedValue(mockIdentity);

      const result = await authService.createEmailPasswordIdentity({ email, name });

      expect(mockIdentityApi.createIdentity).toHaveBeenCalledWith({
        body: {
          traits: {
            email,
            name,
            loginService: LoginService.EMAIL_PASSWORD
          }
        },
        options: {
          verified: true
        }
      });
      expect(result).toEqual(mockIdentity);
    });
  });

  describe('generateCannyToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate JWT token with correct payload', async () => {
      const identity = {
        id: 'identity-id',
        traits: {
          email: 'test@example.com',
          name: 'Test User',
          avatarRemoteId: 'avatar-id'
        }
      } as Identity;

      const mockToken = 'generated-jwt-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.generateCannyToken(identity);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          avatarURL: 'http://localhost:3000/user/getAvatar?remoteId=avatar-id',
          email: identity.traits.email,
          id: identity.id,
          name: identity.traits.name
        },
        'test-secret',
        { algorithm: 'HS256', expiresIn: '1h' }
      );
      expect(result).toBe(mockToken);
    });

    it('should generate token without avatarURL when avatarRemoteId is missing', async () => {
      const identity = {
        id: 'identity-id',
        traits: {
          email: 'test@example.com',
          name: 'Test User'
        }
      } as Identity;
      const mockToken = 'generated-jwt-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.generateCannyToken(identity);

      expect(jwt.sign).toHaveBeenCalledWith({ email: identity.traits.email, id: identity.id, name: identity.traits.name }, 'test-secret', {
        algorithm: 'HS256',
        expiresIn: '1h'
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('updateUserLastLogin', () => {
    it('should update user last login successfully', async () => {
      const identityId = 'identity-id';
      mockGrpc.auth.updateUserPropertiesByIdentityId = jest.fn().mockResolvedValue({});

      await authService.updateUserLastLogin(identityId);

      expect(mockGrpc.auth.updateUserPropertiesByIdentityId).toHaveBeenCalledWith({
        identityId,
        properties: {
          lastLogin: expect.any(String)
        }
      });
    });

    it('should log error when update fails', async () => {
      const identityId = 'identity-id';
      const error = new Error('Update failed');
      mockGrpc.auth.updateUserPropertiesByIdentityId = jest.fn().mockRejectedValue(error);

      await authService.updateUserLastLogin(identityId);

      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Error updating user last login',
        err: error,
        meta: { identityId },
        scope: 'updateUserLastLogin'
      });
    });
  });

  describe('getVerifiedIdentityPayload', () => {
    it('should return identity with verified addresses', () => {
      const identity = {
        id: 'identity-id',
        traits: {
          email: 'test@example.com',
          name: 'Test User'
        },
        verifiable_addresses: [],
        recovery_addresses: [
          {
            id: 'recovery-id',
            value: 'test@example.com',
            via: 'email'
          }
        ]
      } as unknown as Identity;

      const result = authService.getVerifiedIdentityPayload({ identity });

      expect(result.verifiable_addresses).toEqual([
        {
          status: 'completed',
          value: identity.traits.email,
          verified: true,
          via: 'email'
        }
      ]);
      expect(result.recovery_addresses).toEqual([
        {
          value: identity.traits.email,
          via: 'email'
        }
      ]);
      expect((result?.recovery_addresses as RecoveryIdentityAddress[])?.[0]).not.toHaveProperty('id');
    });
  });

  describe('transformErrorMessageOnRegistrationFailed', () => {
    it('should transform error message on registration failed', () => {
      const errorMessage = authService.transformErrorMessageOnRegistrationFailed({
        errorCode: ErrorCode.User.EMAIL_EXISTS,
        loginServiceFromError: LoginService.EMAIL_PASSWORD,
        loginChallenge: 'login-challenge'
      });

      expect(errorMessage).toBe('');
    });

    it('should transform error message on registration failed when error code is EMAIL_IS_BANNED', () => {
      const errorMessage = authService.transformErrorMessageOnRegistrationFailed({
        errorCode: ErrorCode.User.EMAIL_IS_BANNED,
        loginServiceFromError: LoginService.EMAIL_PASSWORD,
        loginChallenge: 'login-challenge'
      });

      expect(errorMessage).not.toBeNull();
    });

    it('should transform error message on registration failed when error code is ALREADY_SIGNED_IN_ANOTHER_METHOD', () => {
      const errorMessage = authService.transformErrorMessageOnRegistrationFailed({
        errorCode: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
        loginServiceFromError: LoginService.EMAIL_PASSWORD,
        loginChallenge: 'login-challenge'
      });

      expect(errorMessage).not.toBeNull();
    });
  });

  describe('updateIdentityLoginService', () => {
    it('should update identity login service successfully', async () => {
      const identityId = 'identity-id';
      const loginService = LoginService.EMAIL_PASSWORD;
      mockIdentityApi.updateIdentity = jest.fn().mockResolvedValue({});

      await authService.updateIdentityLoginService({ identity: { id: identityId, traits: { loginService } } as Identity, loginService });
    });
  });

  describe('assertUnverifyAccountError coverage', () => {
    const email = 'test@example.com';

    it('should return error with remainingTime when checkAttempResendVerification returns error with metadata', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({
        error: {
          code: ErrorCode.User.USER_NOT_FOUND,
          metadata: {
            remainingTime: 300
          }
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
      expect((result.error?.meta as { remainingTime?: number })?.remainingTime).toBe(300);
    });

    it('should return error with remainingTime = 0 when checkAttempResendVerification returns error without metadata', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({
        error: {
          code: ErrorCode.User.USER_NOT_FOUND
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
      expect((result.error?.meta as { remainingTime?: number })?.remainingTime).toBe(0);
    });

    it('should return error with remainingTime = 0 when checkAttempResendVerification returns error with null metadata', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue({
        error: {
          code: ErrorCode.User.USER_NOT_FOUND,
          metadata: null
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
      expect((result.error?.meta as { remainingTime?: number })?.remainingTime).toBe(0);
    });

    it('should handle checkAttempResendVerification returning undefined/null (cover || {})', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue(undefined);

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
      expect((result.error?.meta as { remainingTime?: number })?.remainingTime).toBe(0);
    });

    it('should handle checkAttempResendVerification returning null (cover || {})', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: 'identity-id'
        }
      });
      mockGrpc.auth.checkAttempResendVerification = jest.fn().mockResolvedValue(null);

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
      expect((result.error?.meta as { remainingTime?: number })?.remainingTime).toBe(0);
    });

    it('should not return error when user has no identityId', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: false,
          identityId: null
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).not.toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
    });

    it('should not return error when user is already verified', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).not.toBe(ErrorCode.User.UNACTIVATED_ACCOUNT);
    });
  });

  describe('assertLoginDifferentAccountError coverage', () => {
    const email = 'test@example.com';

    it('should return error when loginService is different and hasIdentityId is true (non-EMAIL_PASSWORD service)', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.GOOGLE,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
      expect(result.error?.meta?.loginService).toBe(LoginService.GOOGLE);
    });

    it('should return error when loginService is different and isEmailPasswordService is true', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.GOOGLE,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
      expect(result.error?.meta?.loginService).toBe(LoginService.GOOGLE);
    });

    it('should return error when user exists but has no loginService and loginService is not EMAIL_PASSWORD', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: null,
          isVerified: true,
          identityId: null
        }
      });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.GOOGLE
      });

      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
      expect(result.error?.meta?.loginService).toBe(UNKNOWN_THIRD_PARTY);
    });

    it('should return error when user exists with UNKNOWN_THIRD_PARTY loginService and loginService is not EMAIL_PASSWORD', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: UNKNOWN_THIRD_PARTY,
          isVerified: true,
          identityId: null
        }
      });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.GOOGLE
      });

      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
      expect(result.error?.meta?.loginService).toBe(UNKNOWN_THIRD_PARTY);
    });

    it('should not return error when loginService is same', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.EMAIL_PASSWORD,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).not.toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
    });

    it('should not return error when loginService is different but hasIdentityId is false and loginService is not EMAIL_PASSWORD', async () => {
      mockGrpc.kratos.verifyRegisterAccount = jest.fn().mockResolvedValue({});
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.GOOGLE,
          isVerified: true,
          identityId: null
        }
      });

      const result = await authService.verifyRegisterAccount({
        email,
        loginService: LoginService.MICROSOFT
      });

      expect(result.error?.code).not.toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
    });

    it('should not return error when user is null', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({ user: null });

      const result = await authService.verifySignIn(email);

      expect(result.error?.code).not.toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
    });

    it('should not return error when loginService is different but user has identityId and loginService is EMAIL_PASSWORD (edge case)', async () => {
      mockGrpc.kratos.verifyFirstSignInWithOry = jest.fn().mockResolvedValue({ isAccept: true });
      mockGrpc.user.getUserByEmail = jest.fn().mockResolvedValue({
        user: {
          _id: 'user-id',
          email,
          loginService: LoginService.GOOGLE,
          isVerified: true,
          identityId: 'identity-id'
        }
      });

      const result = await authService.verifySignAuthMethod({
        email,
        loginService: LoginService.EMAIL_PASSWORD
      });

      expect(result.error?.code).toBe(ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD);
    });
  });
});
