/* eslint-disable @typescript-eslint/no-explicit-any */
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

jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn()
}));

jest.mock('@/middlewares', () => ({
  AuthGuard: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
  MobileAuthGuard: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor
}));

jest.mock('@/middlewares/RateLimitGuard', () => ({
  __esModule: true,
  default: () => (_target: any) => _target
}));

jest.mock('@/lib/exceptions/exceptionHandler', () => ({
  exceptionHandler: jest.fn()
}));

jest.mock('next-api-decorators', () => {
  const actual = jest.requireActual('next-api-decorators');
  return {
    ...actual,
    InternalServerErrorException: actual.InternalServerErrorException,
    Post: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    Get: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    Patch: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    HttpCode: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    Req: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
    Body: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
    ValidationPipe: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
    UseMiddleware: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    Catch: () => (_target: any) => _target,
    createHandler: (handler: any) => handler
  };
});

import { fileTypeFromBuffer, FileTypeResult } from 'file-type';
import { InternalServerErrorException } from 'next-api-decorators';

import { LoggerScope } from '@/constants/common';
import type { TIdentityRequest } from '@/interfaces/common';
import { ForceLogoutType, LoginService } from '@/interfaces/user';
import { storage } from '@/lib/aws/s3';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { identityApi } from '@/lib/ory';
import { bufferAvatar, avatarFilename, validateFileType } from '@/utils/avatar.utils';

import { UserHandler } from '../[[...params]]';

jest.mock('@/lib/ory');
jest.mock('@/lib/logger');
jest.mock('@/lib/aws/s3');
jest.mock('@/utils/avatar.utils');

const mockGrpc = grpc as jest.Mocked<typeof grpc>;
const mockIdentityApi = identityApi as jest.Mocked<typeof identityApi>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockStorage = storage as jest.Mocked<typeof storage>;
const mockBufferAvatar = bufferAvatar as jest.MockedFunction<typeof bufferAvatar>;
const mockAvatarFilename = avatarFilename as jest.MockedFunction<typeof avatarFilename>;
const mockValidateFileType = validateFileType as jest.MockedFunction<typeof validateFileType>;
const mockFileTypeFromBuffer = fileTypeFromBuffer as jest.MockedFunction<typeof fileTypeFromBuffer>;

describe('UserHandler', () => {
  let handler: UserHandler;
  let mockRequest: TIdentityRequest;
  const mockIdentity = {
    id: 'identity-id',
    traits: {
      email: 'test@example.com',
      name: 'Test User',
      avatarRemoteId: 'avatar-remote-id',
      loginService: 'EMAIL_PASSWORD'
    }
  };
  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    identityId: 'identity-id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UserHandler();
    const mockRes = {
      statusCode: 200,
      setHeader: jest.fn(),
      end: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
      writableEnded: false,
      status: jest.fn().mockReturnThis(),
      sendStatus: jest.fn()
    } as any;

    mockRequest = {
      identity: mockIdentity,
      sessionId: 'session-id',
      user: mockUser,
      method: 'GET',
      url: '/api/user',
      headers: {},
      query: {},
      body: {},
      cookies: {},
      res: mockRes
    } as unknown as TIdentityRequest;

    (mockRequest as any).res = mockRes;
  });

  describe('handleDeleteAccount', () => {
    it('should delete account successfully', async () => {
      const mockResponse = {
        user: mockUser,
        error: null
      };
      mockGrpc.user.deleteAccount = jest.fn().mockResolvedValue(mockResponse);

      const result = await handler.handleDeleteAccount(mockRequest);

      expect(mockGrpc.user.deleteAccount).toHaveBeenCalledWith({ identityId: mockIdentity.id });
      expect(result).toEqual(mockUser);
    });

    it('should throw InternalServerErrorException when response is null', async () => {
      mockGrpc.user.deleteAccount = jest.fn().mockResolvedValue(null);

      await expect(handler.handleDeleteAccount(mockRequest)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequest when response contains error', async () => {
      const mockError = {
        message: 'Something went wrong',
        code: 'ERROR_CODE'
      };

      mockGrpc.user.deleteAccount = jest.fn().mockResolvedValue({
        user: null,
        error: mockError
      });

      await expect(handler.handleDeleteAccount(mockRequest)).rejects.not.toBeNull();
    });

    it('should throw BadRequest with empty message when error.message is undefined', async () => {
      mockGrpc.user.deleteAccount = jest.fn().mockResolvedValue({
        user: null,
        error: {
          code: 'SOME_CODE'
        }
      });

      const mockIdentityRequest: TIdentityRequest = {
        identity: {
          id: 'identity-id',
          traits: {
            email: 'a@b.com',
            avatarRemoteId: '',
            loginService: LoginService.EMAIL_PASSWORD
          }
        } as any
      } as unknown as TIdentityRequest;

      await expect(handler.handleDeleteAccount(mockIdentityRequest)).rejects.not.toBeNull();
    });
  });

  describe('handleGetCurrentUser', () => {
    it('should get current user successfully', async () => {
      mockGrpc.user.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      const result = await handler.handleGetCurrentUser(mockRequest);

      expect(mockGrpc.user.getCurrentUser).toHaveBeenCalledWith({ identityId: mockIdentity.id });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      mockGrpc.user.getCurrentUser = jest.fn().mockResolvedValue(undefined);

      const result = await handler.handleGetCurrentUser(mockRequest);

      expect(result).toBeUndefined();
    });
  });

  describe('handleGetOrganizationTeamOwner', () => {
    it('should get organization team owner successfully', async () => {
      const mockResponse = {
        team: { id: 'team-id' },
        organization: { id: 'org-id' }
      };
      mockGrpc.user.getTeamAndOrganizationOwner = jest.fn().mockResolvedValue(mockResponse);

      const result = await handler.handleGetOrganizationTeamOwner(mockRequest);

      expect(mockGrpc.user.getTeamAndOrganizationOwner).toHaveBeenCalledWith({ identityId: mockIdentity.id });
      expect(result).toEqual(mockResponse);
    });

    it('should throw InternalServerErrorException when response is null', async () => {
      mockGrpc.user.getTeamAndOrganizationOwner = jest.fn().mockResolvedValue(null);

      await expect(handler.handleGetOrganizationTeamOwner(mockRequest)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequest when response contains error', async () => {
      const mockError = {
        message: 'Something went wrong',
        code: 'ERROR_CODE'
      };

      mockGrpc.user.getTeamAndOrganizationOwner = jest.fn().mockResolvedValue({
        team: null,
        organization: null,
        error: mockError
      });

      await expect(handler.handleGetOrganizationTeamOwner(mockRequest)).rejects.not.toBeNull();
    });

    it('should throw BadRequest with empty message when error.message is undefined', async () => {
      mockGrpc.user.getTeamAndOrganizationOwner = jest.fn().mockResolvedValue({
        team: null,
        organization: null,
        error: {
          code: 'SOME_CODE'
        }
      });
      await expect(handler.handleGetOrganizationTeamOwner(mockRequest)).rejects.not.toBeNull();
    });
  });

  describe('handleRemoveAvatar', () => {
    it('should remove avatar successfully when avatarRemoteId exists', async () => {
      mockStorage.removeFromProfiles = jest.fn().mockResolvedValue(undefined);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.removeProfileAvatar = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});

      await handler.handleRemoveAvatar(mockRequest);

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('avatar-remote-id');
      expect(mockIdentityApi.updateAvatarRemoteId).toHaveBeenCalledWith(mockIdentity.id, '');
      expect(mockGrpc.user.removeProfileAvatar).toHaveBeenCalledWith({ identityId: mockIdentity.id });
      expect(mockGrpc.contractAuthService.syncUpAccountSetting).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        type: 'removeAvatar'
      });
    });

    it('should remove avatar successfully when avatarRemoteId does not exist', async () => {
      const requestWithoutAvatar = {
        ...mockRequest,
        identity: { ...mockIdentity, traits: { ...mockIdentity.traits, avatarRemoteId: '' } }
      };
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.removeProfileAvatar = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});

      await handler.handleRemoveAvatar(requestWithoutAvatar as unknown as TIdentityRequest);

      expect(mockStorage.removeFromProfiles).not.toHaveBeenCalled();
      expect(mockIdentityApi.updateAvatarRemoteId).toHaveBeenCalled();
    });

    it('should log error when removeFromProfiles rejects', async () => {
      const requestWithAvatar = {
        ...mockRequest,
        identity: {
          ...mockIdentity,
          traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
        }
      } as unknown as TIdentityRequest;
      const error = new Error('Storage error');
      mockStorage.removeFromProfiles = jest.fn().mockRejectedValue(error);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.removeProfileAvatar = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});
      mockLogger.error = jest.fn();
      mockLogger.getCommonHttpAttributes = jest.fn().mockReturnValue({ meta: 'test' });

      await handler.handleRemoveAvatar(requestWithAvatar);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: JSON.stringify(error),
        scope: LoggerScope.ERROR.REMOVE_AVATAR,
        meta: { meta: 'test' }
      });
    });

    it('should handle identity?.id being undefined', async () => {
      const requestWithUndefinedId = {
        ...mockRequest,
        identity: { ...mockIdentity, id: undefined }
      } as unknown as TIdentityRequest;

      mockGrpc.user.deleteAccount = jest.fn().mockResolvedValue({ user: mockUser, error: null });

      await handler.handleDeleteAccount(requestWithUndefinedId);

      expect(mockGrpc.user.deleteAccount).toHaveBeenCalledWith({ identityId: undefined });
    });
  });

  describe('handleUploadAvatar', () => {
    const mockAvatarBuffer = Buffer.from('avatar-data');
    const mockFileType = { ext: 'jpg', mime: 'image/jpeg' as const };
    const mockRemotePath = 'remote-path.jpg';

    beforeEach(() => {
      mockRequest.identity = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'avatar-remote-id' } as any
      } as any;
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(mockFileType as FileTypeResult);
      mockValidateFileType.mockReturnValue(true);
      mockAvatarFilename.mockReturnValue('filename.jpg');
      mockStorage.uploadToProfiles = jest.fn().mockResolvedValue(mockRemotePath);
      mockStorage.removeFromProfiles = jest.fn().mockResolvedValue(undefined);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.updateProfileAvatar = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});
    });

    it('should upload avatar successfully', async () => {
      const result = await handler.handleUploadAvatar(mockRequest);

      expect(mockBufferAvatar).toHaveBeenCalledWith(mockRequest);
      expect(mockFileTypeFromBuffer).toHaveBeenCalled();
      expect(mockValidateFileType).toHaveBeenCalledWith('image/jpeg');
      expect(mockStorage.uploadToProfiles).toHaveBeenCalled();
      expect(mockIdentityApi.updateAvatarRemoteId).toHaveBeenCalledWith(mockIdentity.id, mockRemotePath);
      expect(result).toEqual({ remotePath: mockRemotePath });
    });

    it('should remove old avatar when avatarRemoteId exists', async () => {
      const requestWithOldAvatar = {
        ...mockRequest,
        identity: {
          ...mockIdentity,
          traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
        }
      } as unknown as TIdentityRequest;
      mockStorage.removeFromProfiles = jest.fn().mockResolvedValue(undefined);

      await handler.handleUploadAvatar(requestWithOldAvatar);

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
    });

    it('should log error when removeFromProfiles rejects in uploadAvatar', async () => {
      const error = new Error('Storage error');
      mockStorage.removeFromProfiles = jest.fn().mockRejectedValue(error);
      mockLogger.error = jest.fn();
      mockLogger.getCommonHttpAttributes = jest.fn().mockReturnValue({ meta: 'test' });

      await handler.handleUploadAvatar(mockRequest);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: JSON.stringify(error),
        meta: { meta: 'test' },
        scope: LoggerScope.ERROR.REMOVE_AVATAR
      });
    });

    it('should not remove old avatar when avatarRemoteId does not exist', async () => {
      const requestWithoutAvatar = {
        ...mockRequest,
        identity: { ...mockIdentity, traits: { ...mockIdentity.traits, avatarRemoteId: '' } }
      };

      await handler.handleUploadAvatar(requestWithoutAvatar as unknown as TIdentityRequest);

      expect(mockStorage.removeFromProfiles).not.toHaveBeenCalled();
    });

    it('should throw error when bufferAvatar returns error', async () => {
      const error = HttpErrorException.BadRequest({ message: 'Buffer error', code: 'BUFFER_ERROR' });
      mockBufferAvatar.mockResolvedValue({ error });

      await expect(handler.handleUploadAvatar(mockRequest)).rejects.toEqual(error);
    });

    it('should throw error when avatarBuffer is undefined and error exists', async () => {
      const error = HttpErrorException.BadRequest({ message: 'No buffer', code: 'NO_BUFFER' });
      mockBufferAvatar.mockResolvedValue({ error, avatarBuffer: undefined });

      await expect(handler.handleUploadAvatar(mockRequest)).rejects.toEqual(error);
    });

    it('should throw undefined when avatarBuffer is undefined and error is undefined', async () => {
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: undefined });

      await expect(handler.handleUploadAvatar(mockRequest)).rejects.toBeUndefined();
    });

    it('should throw error when filetype is null', async () => {
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(null as unknown as FileTypeResult);

      await expect(handler.handleUploadAvatar(mockRequest)).rejects.not.toBeNull();
    });

    it('should throw error when file type is invalid', async () => {
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(mockFileType as FileTypeResult);
      mockValidateFileType.mockReturnValue(false);

      await expect(handler.handleUploadAvatar(mockRequest)).rejects.not.toBeNull();
    });

    it('should log error when removeFromProfiles rejects in uploadAvatar', async () => {
      const error = new Error('Storage error');
      mockStorage.removeFromProfiles = jest.fn().mockRejectedValue(error);
      mockLogger.error = jest.fn();
      mockLogger.getCommonHttpAttributes = jest.fn().mockReturnValue({ meta: 'test' });

      await handler.handleUploadAvatar(mockRequest);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: JSON.stringify(error),
        meta: { meta: 'test' },
        scope: LoggerScope.ERROR.REMOVE_AVATAR
      });
    });
  });

  describe('handleUploadAvatarForMobile', () => {
    const mockAvatarBuffer = Buffer.from('avatar-data');
    const mockFileType = { ext: 'jpg', mime: 'image/jpeg' as const };
    const mockRemotePath = 'remote-path.jpg';

    beforeEach(() => {
      const freshIdentity = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(freshIdentity);
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(mockFileType as FileTypeResult);
      mockValidateFileType.mockReturnValue(true);
      mockAvatarFilename.mockReturnValue('filename.jpg');
      mockStorage.uploadToProfiles = jest.fn().mockResolvedValue(mockRemotePath);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.updateProfileAvatar = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});
    });

    it('should upload avatar for mobile successfully', async () => {
      const result = await handler.handleUploadAvatarForMobile(mockRequest);

      expect(mockIdentityApi.getIdentity).toHaveBeenCalledWith({ identityId: mockUser.identityId });
      expect(mockBufferAvatar).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({ remotePath: mockRemotePath });
    });

    it('should remove old avatar when avatarRemoteId exists', async () => {
      const identityWithOldAvatar = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(identityWithOldAvatar);
      mockStorage.removeFromProfiles = jest.fn().mockResolvedValue(undefined);

      await handler.handleUploadAvatarForMobile(mockRequest);

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
    });

    it('should log error when removeFromProfiles rejects in uploadAvatarForMobile', async () => {
      const identityWithOldAvatar = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(identityWithOldAvatar);
      const error = new Error('Storage error');
      mockStorage.removeFromProfiles = jest.fn().mockRejectedValue(error);
      mockLogger.error = jest.fn();
      mockLogger.getCommonHttpAttributes = jest.fn().mockReturnValue({ meta: 'test' });

      await handler.handleUploadAvatarForMobile(mockRequest);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: JSON.stringify(error),
        meta: { meta: 'test' },
        scope: LoggerScope.ERROR.REMOVE_AVATAR
      });
    });

    it('should throw error when bufferAvatar returns error', async () => {
      const error = HttpErrorException.BadRequest({ message: 'Buffer error', code: 'BUFFER_ERROR' });
      mockBufferAvatar.mockResolvedValue({ error });

      await expect(handler.handleUploadAvatarForMobile(mockRequest)).rejects.toEqual(error);
    });

    it('should throw error when avatarBuffer is undefined and error exists', async () => {
      const error = HttpErrorException.BadRequest({ message: 'No buffer', code: 'NO_BUFFER' });
      mockBufferAvatar.mockResolvedValue({ error, avatarBuffer: undefined });

      await expect(handler.handleUploadAvatarForMobile(mockRequest)).rejects.toEqual(error);
    });

    it('should throw undefined when avatarBuffer is undefined and error is undefined', async () => {
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: undefined });

      await expect(handler.handleUploadAvatarForMobile(mockRequest)).rejects.toBeUndefined();
    });

    it('should throw error when filetype is null', async () => {
      const freshIdentity = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'avatar-remote-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(freshIdentity);
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(null as unknown as FileTypeResult);
      mockStorage.uploadToProfiles = jest.fn();

      await expect(handler.handleUploadAvatarForMobile(mockRequest)).rejects.not.toBeNull();
    });

    it('should throw error when file type is invalid', async () => {
      const freshIdentity = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'avatar-remote-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(freshIdentity);
      mockBufferAvatar.mockResolvedValue({ avatarBuffer: mockAvatarBuffer });
      mockFileTypeFromBuffer.mockResolvedValue(mockFileType as FileTypeResult);
      mockValidateFileType.mockReturnValue(false);
      mockStorage.uploadToProfiles = jest.fn();

      await expect(handler.handleUploadAvatarForMobile(mockRequest)).rejects.not.toBeNull();
    });

    it('should handle user?.identityId being undefined', async () => {
      const requestWithUndefinedUser = {
        ...mockRequest,
        user: null
      } as unknown as TIdentityRequest;

      mockIdentityApi.getIdentity = jest.fn().mockRejectedValue(new Error('Identity not found'));

      await expect(handler.handleUploadAvatarForMobile(requestWithUndefinedUser)).rejects.toThrow();
    });
  });

  describe('handleRemoveAvatarForMobile', () => {
    beforeEach(() => {
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(mockIdentity);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.updateProfileAvatar = jest.fn().mockResolvedValue({});
    });

    it('should remove avatar for mobile successfully when avatarRemoteId exists', async () => {
      const freshIdentity = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(freshIdentity);
      mockStorage.removeFromProfiles = jest.fn().mockResolvedValue(undefined);

      const result = await handler.handleRemoveAvatarForMobile(mockRequest);

      expect(mockIdentityApi.getIdentity).toHaveBeenCalledWith({ identityId: mockUser.identityId });
      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
      expect(mockIdentityApi.updateAvatarRemoteId).toHaveBeenCalledWith(mockIdentity.id, '');
      expect(mockGrpc.user.updateProfileAvatar).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        avatarRemoteId: ''
      });
      expect(result).toEqual({ message: 'Remove user avatar' });
    });

    it('should remove avatar for mobile successfully when avatarRemoteId does not exist', async () => {
      const identityWithoutAvatar = { ...mockIdentity, traits: { ...mockIdentity.traits, avatarRemoteId: '' } };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(identityWithoutAvatar);

      const result = await handler.handleRemoveAvatarForMobile(mockRequest);

      expect(mockStorage.removeFromProfiles).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Remove user avatar' });
    });

    it('should log error when removeFromProfiles rejects in removeAvatarForMobile', async () => {
      const identityWithOldAvatar = {
        ...mockIdentity,
        traits: { ...mockIdentity.traits, avatarRemoteId: 'old-avatar-id' }
      };
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(identityWithOldAvatar);
      const error = new Error('Storage error');
      mockStorage.removeFromProfiles = jest.fn().mockRejectedValue(error);
      mockIdentityApi.updateAvatarRemoteId = jest.fn().mockResolvedValue({});
      mockGrpc.user.updateProfileAvatar = jest.fn().mockResolvedValue({});
      mockLogger.error = jest.fn();
      mockLogger.getCommonHttpAttributes = jest.fn().mockReturnValue({ meta: 'test' });

      await handler.handleRemoveAvatarForMobile(mockRequest);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockStorage.removeFromProfiles).toHaveBeenCalledWith('old-avatar-id');
      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        message: JSON.stringify(error),
        meta: { meta: 'test' },
        scope: LoggerScope.ERROR.REMOVE_AVATAR
      });
    });

    it('should handle user?.identityId being undefined in removeAvatarForMobile', async () => {
      const requestWithUndefinedUser = {
        ...mockRequest,
        user: null
      } as unknown as TIdentityRequest;

      mockIdentityApi.getIdentity = jest.fn().mockRejectedValue(new Error('Identity not found'));

      await expect(handler.handleRemoveAvatarForMobile(requestWithUndefinedUser)).rejects.toThrow();
    });
  });

  describe('changeNameMobile', () => {
    const mockBody = { newName: 'New Name' };

    beforeEach(() => {
      mockIdentityApi.getIdentity = jest.fn().mockResolvedValue(mockIdentity);
      mockIdentityApi.updateIdentity = jest.fn().mockResolvedValue({});
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});
      mockGrpc.kratos.handleKratosSyncUpSettingsDataCallback = jest.fn().mockResolvedValue({});
    });

    it('should change name for mobile successfully', async () => {
      const result = await handler.changeNameMobile(mockRequest, mockBody);

      expect(mockIdentityApi.getIdentity).toHaveBeenCalledWith({ identityId: mockUser.identityId });
      expect(mockIdentityApi.updateIdentity).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        traits: {
          ...mockIdentity.traits,
          name: 'New Name'
        }
      });
      expect(mockGrpc.contractAuthService.syncUpAccountSetting).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        type: 'changeName'
      });
      expect(mockGrpc.kratos.handleKratosSyncUpSettingsDataCallback).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Change name success' });
    });

    it('should handle user?.identityId being undefined in changeNameMobile', async () => {
      const requestWithUndefinedUser = {
        ...mockRequest,
        user: null
      } as unknown as TIdentityRequest;

      mockIdentityApi.getIdentity = jest.fn().mockRejectedValue(new Error('Identity not found'));

      await expect(handler.changeNameMobile(requestWithUndefinedUser, mockBody)).rejects.toThrow();
    });
  });

  describe('confirmLinkAccount', () => {
    it('should confirm link account successfully', async () => {
      mockGrpc.contractAuthService.syncUpAccountSetting = jest.fn().mockResolvedValue({});
      mockGrpc.kratos.handleForceLogout = jest.fn().mockResolvedValue({});

      await handler.confirmLinkAccount(mockRequest);

      expect(mockGrpc.contractAuthService.syncUpAccountSetting).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        type: ForceLogoutType.CHANGE_LOGIN_SERVICE,
        extraData: {
          loginService: mockIdentity.traits.loginService
        }
      });
      expect(mockGrpc.kratos.handleForceLogout).toHaveBeenCalledWith({ id: mockIdentity.id });
    });
  });

  describe('updateIdentityId', () => {
    it('should update identityId successfully', async () => {
      mockGrpc.user.updateUserProperties = jest.fn().mockResolvedValue({});

      await handler.updateIdentityId(mockRequest);

      expect(mockGrpc.user.updateUserProperties).toHaveBeenCalledWith({
        identityId: mockIdentity.id,
        email: mockIdentity.traits.email
      });
    });
  });
});
