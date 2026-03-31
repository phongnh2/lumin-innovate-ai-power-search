import { Test, TestingModule } from '@nestjs/testing';
import { Session } from '@ory/client';
import { JWK, createLocalJWKSet, jwtVerify } from 'jose';

import { EnvConstants } from '../../Common/constants/EnvConstants';
import { EnvironmentService } from '../../Environment/environment.service';

import { OryJwtService } from '../ory.jwt.service';

jest.mock('jose', () => ({
  createLocalJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

describe('OryJwtService', () => {
  let service: OryJwtService;
  let environmentService: EnvironmentService;

  const mockEnvironmentService = {
    getByKey: jest.fn(),
  };

  const mockAuthenticationJWK = {
    kty: 'RSA',
    kid: 'auth-key-id',
    use: 'sig',
    n: 'mock-n-value',
    e: 'AQAB',
  };

  const mockAuthorizationJWK = {
    kty: 'RSA',
    kid: 'authz-key-id',
    use: 'sig',
    n: 'mock-n-value-2',
    e: 'AQAB',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const encodedAuthKey = Buffer.from(JSON.stringify(mockAuthenticationJWK)).toString('base64');
    const encodedAuthzKey = Buffer.from(JSON.stringify(mockAuthorizationJWK)).toString('base64');

    mockEnvironmentService.getByKey.mockImplementation((key: string) => {
      if (key === EnvConstants.JWT_AUTHENTICATION_PUBLIC_KEY) {
        return encodedAuthKey;
      }
      if (key === EnvConstants.JWT_AUTHORIZATION_PUBLIC_KEY) {
        return encodedAuthzKey;
      }
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OryJwtService,
        {
          provide: EnvironmentService,
          useValue: mockEnvironmentService,
        },
      ],
    }).compile();

    service = module.get<OryJwtService>(OryJwtService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with decoded JWK keys', () => {
      expect(environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.JWT_AUTHENTICATION_PUBLIC_KEY);
      expect(environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.JWT_AUTHORIZATION_PUBLIC_KEY);
      expect(service).toBeDefined();
    });

    it('should decode base64 encoded JWK keys correctly', () => {
      expect(service['oryAuthenticationJwk']).toEqual(mockAuthenticationJWK);
      expect(service['oryAuthorizationJwk']).toEqual(mockAuthorizationJWK);
    });
  });

  describe('verifyOryAuthenticationToken', () => {
    const mockToken = 'mock.jwt.token';
    const mockSession: Partial<Session> = {
      id: 'session-id',
      identity: {
        id: 'identity-id',
        traits: { email: 'user@test.com' },
        verifiable_addresses: [],
        recovery_addresses: [],
        schema_id: 'user_v0',
        schema_url: '',
        state: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const mockKeySet = { keys: [mockAuthenticationJWK] };
    const mockJwtPayload = {
      payload: {
        session: mockSession,
        iss: 'ory',
        sub: 'user-id',
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 3600,
      },
    };

    beforeEach(() => {
      (createLocalJWKSet as jest.Mock).mockReturnValue(mockKeySet);
      (jwtVerify as jest.Mock).mockResolvedValue(mockJwtPayload);
    });

    it('should verify authentication token successfully', async () => {
      const result = await service.verifyOryAuthenticationToken(mockToken);

      expect(createLocalJWKSet).toHaveBeenCalledWith({
        keys: [mockAuthenticationJWK],
      });
      expect(jwtVerify).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should throw error when token verification fails', async () => {
      const mockError = new Error('Invalid token');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthenticationToken(mockToken)).rejects.toThrow('Invalid token');
    });

    it('should handle token with missing session payload', async () => {
      const mockPayloadWithoutSession = {
        payload: {
          iss: 'ory',
          sub: 'user-id',
          iat: Date.now() / 1000,
          exp: Date.now() / 1000 + 3600,
        },
      };
      (jwtVerify as jest.Mock).mockResolvedValue(mockPayloadWithoutSession);

      const result = await service.verifyOryAuthenticationToken(mockToken);

      expect(result).toBeUndefined();
    });

    it('should handle empty token', async () => {
      const emptyToken = '';
      const mockError = new Error('Token is empty');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthenticationToken(emptyToken)).rejects.toThrow('Token is empty');
    });
  });

  describe('verifyOryAuthorizationToken', () => {
    const mockToken = 'mock.authz.jwt.token';
    const mockSession: Partial<Session> = {
      id: 'authz-session-id',
      identity: {
        id: 'authz-identity-id',
        traits: { email: 'admin@test.com' },
        verifiable_addresses: [],
        recovery_addresses: [],
        schema_id: 'admin_v0',
        schema_url: '',
        state: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const mockKeySet = { keys: [mockAuthorizationJWK] };
    const mockJwtPayload = {
      payload: {
        session: mockSession,
        iss: 'ory',
        sub: 'admin-id',
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 3600,
      },
    };

    beforeEach(() => {
      (createLocalJWKSet as jest.Mock).mockReturnValue(mockKeySet);
      (jwtVerify as jest.Mock).mockResolvedValue(mockJwtPayload);
    });

    it('should verify authorization token successfully', async () => {
      const result = await service.verifyOryAuthorizationToken(mockToken);

      expect(createLocalJWKSet).toHaveBeenCalledWith({
        keys: [mockAuthorizationJWK],
      });
      expect(jwtVerify).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should throw error when authorization token verification fails', async () => {
      const mockError = new Error('Invalid authorization token');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthorizationToken(mockToken)).rejects.toThrow('Invalid authorization token');
    });

    it('should handle malformed token', async () => {
      const malformedToken = 'invalid.token.format';
      const mockError = new Error('Malformed token');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthorizationToken(malformedToken)).rejects.toThrow('Malformed token');
    });

    it('should handle expired token', async () => {
      const expiredToken = 'expired.jwt.token';
      const mockError = new Error('Token expired');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthorizationToken(expiredToken)).rejects.toThrow('Token expired');
    });

    it('should handle token with different key', async () => {
      const differentKeyToken = 'different.key.token';
      const mockError = new Error('Key mismatch');
      (jwtVerify as jest.Mock).mockRejectedValue(mockError);

      await expect(service.verifyOryAuthorizationToken(differentKeyToken)).rejects.toThrow('Key mismatch');
    });
  });

  describe('JWK key initialization edge cases', () => {
    it('should handle invalid base64 encoded authentication key', async () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key === EnvConstants.JWT_AUTHENTICATION_PUBLIC_KEY) {
          return 'invalid-base64-string';
        }
        if (key === EnvConstants.JWT_AUTHORIZATION_PUBLIC_KEY) {
          return Buffer.from(JSON.stringify(mockAuthorizationJWK)).toString('base64');
        }
        return null;
      });

      expect(() => {
        new OryJwtService(environmentService);
      }).toThrow();
    });

    it('should handle invalid JSON in decoded authentication key', async () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key === EnvConstants.JWT_AUTHENTICATION_PUBLIC_KEY) {
          return Buffer.from('invalid-json').toString('base64');
        }
        if (key === EnvConstants.JWT_AUTHORIZATION_PUBLIC_KEY) {
          return Buffer.from(JSON.stringify(mockAuthorizationJWK)).toString('base64');
        }
        return null;
      });

      expect(() => {
        new OryJwtService(environmentService);
      }).toThrow();
    });

    it('should handle missing environment keys', async () => {
      mockEnvironmentService.getByKey.mockReturnValue(null);

      expect(() => {
        new OryJwtService(environmentService);
      }).toThrow();
    });
  });

  describe('concurrent token verification', () => {
    it('should handle multiple authentication token verifications concurrently', async () => {
      const mockSession1: Partial<Session> = { id: 'session-1' };
      const mockSession2: Partial<Session> = { id: 'session-2' };

      (createLocalJWKSet as jest.Mock).mockReturnValue({ keys: [mockAuthenticationJWK] });
      (jwtVerify as jest.Mock)
        .mockResolvedValueOnce({ payload: { session: mockSession1 } })
        .mockResolvedValueOnce({ payload: { session: mockSession2 } });

      const [result1, result2] = await Promise.all([
        service.verifyOryAuthenticationToken('token1'),
        service.verifyOryAuthenticationToken('token2'),
      ]);

      expect(result1).toEqual(mockSession1);
      expect(result2).toEqual(mockSession2);
      expect(jwtVerify).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed authentication and authorization token verifications', async () => {
      const mockAuthSession: Partial<Session> = { id: 'auth-session' };
      const mockAuthzSession: Partial<Session> = { id: 'authz-session' };

      (createLocalJWKSet as jest.Mock)
        .mockReturnValueOnce({ keys: [mockAuthenticationJWK] })
        .mockReturnValueOnce({ keys: [mockAuthorizationJWK] });

      (jwtVerify as jest.Mock)
        .mockResolvedValueOnce({ payload: { session: mockAuthSession } })
        .mockResolvedValueOnce({ payload: { session: mockAuthzSession } });

      const [authResult, authzResult] = await Promise.all([
        service.verifyOryAuthenticationToken('auth-token'),
        service.verifyOryAuthorizationToken('authz-token'),
      ]);

      expect(authResult).toEqual(mockAuthSession);
      expect(authzResult).toEqual(mockAuthzSession);
      expect(createLocalJWKSet).toHaveBeenCalledTimes(2);
      expect(jwtVerify).toHaveBeenCalledTimes(2);
    });
  });
});
