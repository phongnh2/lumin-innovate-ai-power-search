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
    VerifyNewUserInvitationToken: jest.fn(),
    VerifyRegisterAccount: jest.fn(),
    KratosRegistrationFlow: jest.fn(),
    KratosVerificationFlow: jest.fn(),
    KratosSyncUpSettingsData: jest.fn(),
    VerifyFirstSignInWithOry: jest.fn(),
    SignOut: jest.fn(),
    ForceLogout: jest.fn(),
    KratosRegistrationFlowV2: jest.fn(),
    AfterSignUpInvitation: jest.fn()
  };

  const MockKratosService = jest.fn().mockImplementation(() => mockService);

  return {
    loader: {
      load: jest.fn().mockReturnValue({
        kratos: {
          KratosService: MockKratosService
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

import { KratosService } from '../kratos';

const mockLoader = loader as jest.Mocked<typeof loader>;
const mockPromisify = promisify as jest.MockedFunction<typeof promisify>;
const mockGrpcCredentials = grpc.credentials.createInsecure as jest.MockedFunction<typeof grpc.credentials.createInsecure>;

describe('KratosService', () => {
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      VerifyNewUserInvitationToken: jest.fn(),
      VerifyRegisterAccount: jest.fn(),
      KratosRegistrationFlow: jest.fn(),
      KratosVerificationFlow: jest.fn(),
      KratosSyncUpSettingsData: jest.fn(),
      VerifyFirstSignInWithOry: jest.fn(),
      SignOut: jest.fn(),
      ForceLogout: jest.fn(),
      KratosRegistrationFlowV2: jest.fn(),
      AfterSignUpInvitation: jest.fn()
    };
    mockLoader.load = jest.fn().mockReturnValue({
      kratos: {
        KratosService: jest.fn().mockImplementation(() => mockService)
      }
    });

    mockGrpcCredentials.mockReturnValue({} as any);
    mockPromisify.mockImplementation(() => {
      return jest.fn().mockResolvedValue({});
    });
  });

  describe('verifyUserInvitationToken', () => {
    it('should call VerifyNewUserInvitationToken service method', async () => {
      const mockData = { token: 'invitation-token' };
      const mockResponse = { valid: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.verifyUserInvitationToken(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return undefined when service returns undefined', async () => {
      const mockData = { token: 'invitation-token' };
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.verifyUserInvitationToken(mockData as any);

      expect(result).toBeUndefined();
    });
  });

  describe('verifyRegisterAccount', () => {
    it('should call VerifyRegisterAccount service method', async () => {
      const mockData = { email: 'test@example.com' };
      const mockResponse = { success: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.verifyRegisterAccount(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleKratosRegistrationFlowCallback', () => {
    it('should call KratosRegistrationFlow service method', async () => {
      const mockData = { identity: { id: 'identity-id' } };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleKratosRegistrationFlowCallback(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleKratosVerificationFlowCallback', () => {
    it('should call KratosVerificationFlow service method', async () => {
      const mockData = { identity: { id: 'identity-id' } };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleKratosVerificationFlowCallback(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleKratosSyncUpSettingsDataCallback', () => {
    it('should call KratosSyncUpSettingsData service method', async () => {
      const mockData = { identity: { id: 'identity-id' } };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleKratosSyncUpSettingsDataCallback(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyFirstSignInWithOry', () => {
    it('should call VerifyFirstSignInWithOry service method', async () => {
      const mockData = { email: 'test@example.com' };
      const mockResponse = { isAccept: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.verifyFirstSignInWithOry(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleSignOut', () => {
    it('should call SignOut service method', async () => {
      const mockData = { id: 'session-id' };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleSignOut(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleForceLogout', () => {
    it('should call ForceLogout service method', async () => {
      const mockData = { id: 'session-id' };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleForceLogout(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleKratosRegistrationFlowCallbackV2', () => {
    it('should call KratosRegistrationFlowV2 service method', async () => {
      const mockData = { identity: { id: 'identity-id' } };
      const mockResponse = { success: true };
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.handleKratosRegistrationFlowCallbackV2(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('afterSignUpInvitation', () => {
    it('should call AfterSignUpInvitation service method', async () => {
      const mockData = { email: 'test@example.com', token: 'invitation-token' };
      const mockResponse = {};
      const mockHandler = jest.fn().mockResolvedValue(mockResponse);
      mockPromisify.mockReturnValueOnce(mockHandler);

      const service = new KratosService();
      const result = await service.afterSignUpInvitation(mockData as any);

      expect(mockPromisify).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
