/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@/configs/environment', () => ({
  environment: {
    internal: {
      host: {
        grpcServerUrl: 'http://localhost:50051'
      }
    }
  }
}));

jest.mock('@/lib/grpc/grpcPkgLoader', () => {
  const mockService = {
    getUserByEmail: jest.fn(),
    GetUserById: jest.fn(),
    UpdateUserPropertiesById: jest.fn(),
    VerifyToken: jest.fn(),
    SetAttempResendVerification: jest.fn(),
    CheckAttempResendVerification: jest.fn(),
    updateUserPropertiesByIdentityId: jest.fn()
  };

  const MockAuthService = jest.fn().mockImplementation(() => mockService);

  return {
    loader: {
      load: jest.fn().mockReturnValue({
        auth: {
          AuthService: MockAuthService
        }
      })
    }
  };
});

jest.mock('util', () => ({
  promisify: jest.fn()
}));

jest.mock('@grpc/grpc-js', () => ({
  credentials: {
    createInsecure: jest.fn().mockReturnValue({})
  }
}));

import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { loader } from '@/lib/grpc/grpcPkgLoader';

import { AuthService } from '../auth';

const mockLoader = loader as jest.Mocked<typeof loader>;
const mockPromisify = promisify as jest.MockedFunction<typeof promisify>;
const mockGrpcCredentials = grpc.credentials.createInsecure as jest.MockedFunction<typeof grpc.credentials.createInsecure>;

describe('AuthService', () => {
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      getUserByEmail: jest.fn(),
      GetUserById: jest.fn(),
      UpdateUserPropertiesById: jest.fn(),
      VerifyToken: jest.fn(),
      SetAttempResendVerification: jest.fn(),
      CheckAttempResendVerification: jest.fn(),
      updateUserPropertiesByIdentityId: jest.fn()
    };
    mockLoader.load = jest.fn().mockReturnValue({
      auth: {
        AuthService: jest.fn().mockImplementation(() => mockService)
      }
    });

    mockGrpcCredentials.mockReturnValue({} as any);
    mockPromisify.mockImplementation(() => {
      return jest.fn().mockResolvedValue({});
    });
  });

  describe('getUserByEmail', () => {
    it('should call getUserByEmail service method', async () => {
      const mockData = { email: 'test@example.com' };
      const mockResponse = { _id: 'user-id', email: 'test@example.com' };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      // Recreate service to use new mock
      const service = new AuthService();
      const result = await service.getUserByEmail(mockData);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return undefined when service returns undefined', async () => {
      const mockData = { email: 'test@example.com' };
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.getUserByEmail(mockData);

      expect(result).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should call GetUserById service method', async () => {
      const mockData = { _id: 'user-id' };
      const mockResponse = { _id: 'user-id', email: 'test@example.com' };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.getUserById(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUserPropertiesById', () => {
    it('should call UpdateUserPropertiesById service method', async () => {
      const mockData = { _id: 'user-id', properties: { name: 'New Name' } };
      const mockResponse = { _id: 'user-id', name: 'New Name' };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.updateUserPropertiesById(mockData);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyLuminToken', () => {
    it('should call VerifyToken service method', async () => {
      const mockData = { token: 'test-token' };
      const mockResponse = { valid: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.verifyLuminToken(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setAttempResendVerification', () => {
    it('should call SetAttempResendVerification service method', async () => {
      const mockData = { email: 'test@example.com' };
      const mockResponse = { success: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.setAttempResendVerification(mockData);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkAttempResendVerification', () => {
    it('should call CheckAttempResendVerification service method', async () => {
      const mockData = { email: 'test@example.com' };
      const mockResponse = { remainingTime: 300 };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.checkAttempResendVerification(mockData);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUserPropertiesByIdentityId', () => {
    it('should call updateUserPropertiesByIdentityId service method', async () => {
      const mockData = { identityId: 'identity-id', properties: { name: 'New Name' } };
      const mockResponse = { _id: 'user-id', name: 'New Name' };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new AuthService();
      const result = await service.updateUserPropertiesByIdentityId(mockData);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
