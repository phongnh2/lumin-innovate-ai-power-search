import { Test, TestingModule } from '@nestjs/testing';
import * as ipRangeCheck from 'ip-range-check';

import { EnvConstants } from '../../Common/constants/EnvConstants';
import { ErrorCode } from '../../Common/constants/ErrorCode';
import { GraphErrorException } from '../../Common/errors/GraphqlErrorException';
import { HttpErrorException } from '../../Common/errors/HttpErrorException';
import { Utils } from '../../Common/utils/Utils';

import { EnvironmentService } from '../../Environment/environment.service';
import { LoggerService } from '../../Logger/Logger.service';

import { WhitelistIPService } from '../whitelistIP.sevice';

jest.mock('ip-range-check');
jest.mock('../../Common/utils/Utils');
jest.mock('../../Common/errors/GraphqlErrorException');
jest.mock('../../Common/errors/HttpErrorException');

describe('WhitelistIPService', () => {
  let service: WhitelistIPService;
  let environmentService: EnvironmentService;
  let loggerService: LoggerService;

  const mockEnvironmentService = {
    getByKey: jest.fn(),
    getWhiteIPsByDomain: jest.fn(),
  };

  const mockLoggerService = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (Utils.getEmailDomain as jest.Mock).mockImplementation((email: string) => {
      return email.split('@')[1];
    });

    mockEnvironmentService.getByKey.mockImplementation((key: string) => {
      if (key === EnvConstants.ENCRYPT_KEY) {
        return 'mock-encrypt-key';
      }
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhitelistIPService,
        {
          provide: EnvironmentService,
          useValue: mockEnvironmentService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<WhitelistIPService>(WhitelistIPService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with crypto key from environment', () => {
      expect(environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.ENCRYPT_KEY);
      expect(service.cryptoKey).toBe('mock-encrypt-key');
    });
  });

  describe('validateIPRequest', () => {
    const mockEmail = 'user@example.com';
    const mockIpAddress = '192.168.1.100';
    const mockDomain = 'example.com';

    beforeEach(() => {
      (Utils.getEmailDomain as jest.Mock).mockReturnValue(mockDomain);
    });

    describe('when domain has no whitelist IPs', () => {
      beforeEach(() => {
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue([]);
      });

      it('should allow access when no whitelist exists for domain', () => {
        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: mockIpAddress,
        });

        expect(Utils.getEmailDomain).toHaveBeenCalledWith(mockEmail);
        expect(environmentService.getWhiteIPsByDomain).toHaveBeenCalledWith(mockDomain);
        expect(result).toEqual({ isAccept: true });
        expect(ipRangeCheck).not.toHaveBeenCalled();
      });

      it('should allow access for GraphQL request when no whitelist exists', () => {
        const result = service.validateIPRequest({
          isGraphqlRequest: true,
          email: mockEmail,
          ipAddress: mockIpAddress,
        });

        expect(result).toEqual({ isAccept: true });
      });

      it('should allow access for HTTP request when no whitelist exists', () => {
        const result = service.validateIPRequest({
          isGraphqlRequest: false,
          email: mockEmail,
          ipAddress: mockIpAddress,
        });

        expect(result).toEqual({ isAccept: true });
      });
    });

    describe('when domain has whitelist IPs', () => {
      const whitelistIPs = ['192.168.1.0/24', '10.0.0.1'];

      beforeEach(() => {
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
      });

      describe('when IP is in whitelist', () => {
        beforeEach(() => {
          (ipRangeCheck as jest.Mock).mockReturnValue(true);
        });

        it('should allow access when IP is whitelisted', () => {
          const result = service.validateIPRequest({
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(ipRangeCheck).toHaveBeenCalledWith(mockIpAddress, whitelistIPs);
          expect(loggerService.info).toHaveBeenCalledWith({
            context: 'Validate IP request',
            extraInfo: {
              whiteListIp: whitelistIPs,
              email: mockEmail,
              enableAccess: true,
              ipAddress: mockIpAddress,
            },
          });
          expect(result).toEqual({ isAccept: true });
        });

        it('should allow access for GraphQL request when IP is whitelisted', () => {
          const result = service.validateIPRequest({
            isGraphqlRequest: true,
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(result).toEqual({ isAccept: true });
        });

        it('should allow access for HTTP request when IP is whitelisted', () => {
          const result = service.validateIPRequest({
            isGraphqlRequest: false,
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(result).toEqual({ isAccept: true });
        });
      });

      describe('when IP is not in whitelist', () => {
        beforeEach(() => {
          (ipRangeCheck as jest.Mock).mockReturnValue(false);
        });

        it('should reject GraphQL request when IP is not whitelisted', () => {
          const mockGraphQLError = { message: 'GraphQL Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
          (GraphErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockGraphQLError);

          const result = service.validateIPRequest({
            isGraphqlRequest: true,
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(ipRangeCheck).toHaveBeenCalledWith(mockIpAddress, whitelistIPs);
          expect(loggerService.info).toHaveBeenCalledWith({
            context: 'Validate IP request',
            extraInfo: {
              whiteListIp: whitelistIPs,
              email: mockEmail,
              enableAccess: false,
              ipAddress: mockIpAddress,
            },
          });

          expect(result.error).toBe(mockGraphQLError);
          expect(result.isAccept).toBeUndefined();

          expect(GraphErrorException.NotAcceptable).toHaveBeenCalledWith(
            'This ip is not acceptable, please try another email or move to another ip',
            ErrorCode.Common.INVALID_IP_ADDRESS,
            { email: mockEmail },
          );
        });

        it('should reject HTTP request when IP is not whitelisted', () => {
          const mockHTTPError = { message: 'HTTP Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
          (HttpErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockHTTPError);

          const result = service.validateIPRequest({
            isGraphqlRequest: false,
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(result.error).toBe(mockHTTPError);
          expect(result.isAccept).toBeUndefined();

          expect(HttpErrorException.NotAcceptable).toHaveBeenCalledWith(
            'This ip is not acceptable, please try another email or move to another ip',
            ErrorCode.Common.INVALID_IP_ADDRESS,
          );
        });

        it('should default to GraphQL request when isGraphqlRequest is not specified', () => {
          const mockGraphQLError = { message: 'Default GraphQL Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
          (GraphErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockGraphQLError);

          const result = service.validateIPRequest({
            email: mockEmail,
            ipAddress: mockIpAddress,
          });

          expect(result.error).toBe(mockGraphQLError);
          expect(GraphErrorException.NotAcceptable).toHaveBeenCalled();
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty email', () => {
        (Utils.getEmailDomain as jest.Mock).mockReturnValue('');
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue([]);

        const result = service.validateIPRequest({
          email: '',
          ipAddress: mockIpAddress,
        });

        expect(Utils.getEmailDomain).toHaveBeenCalledWith('');
        expect(result).toEqual({ isAccept: true });
      });

      it('should handle invalid email format', () => {
        (Utils.getEmailDomain as jest.Mock).mockReturnValue('');
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue([]);

        const result = service.validateIPRequest({
          email: 'invalid-email',
          ipAddress: mockIpAddress,
        });

        expect(Utils.getEmailDomain).toHaveBeenCalledWith('invalid-email');
        expect(result).toEqual({ isAccept: true });
      });

      it('should handle empty IP address', () => {
        const mockError = { message: 'Empty IP Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
        (GraphErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockError);
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(['192.168.1.0/24']);
        (ipRangeCheck as jest.Mock).mockReturnValue(false);

        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: '',
        });

        expect(ipRangeCheck).toHaveBeenCalledWith('', ['192.168.1.0/24']);
        expect(result.error).toBe(mockError);
      });

      it('should handle invalid IP address format', () => {
        const mockError = { message: 'Invalid IP Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
        (GraphErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockError);
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(['192.168.1.0/24']);
        (ipRangeCheck as jest.Mock).mockReturnValue(false);

        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: 'invalid-ip',
        });

        expect(ipRangeCheck).toHaveBeenCalledWith('invalid-ip', ['192.168.1.0/24']);
        expect(result.error).toBe(mockError);
      });

      it('should handle domain with special characters', () => {
        const specialEmail = 'user@sub-domain.example-company.com';
        const specialDomain = 'sub-domain.example-company.com';
        (Utils.getEmailDomain as jest.Mock).mockReturnValue(specialDomain);
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue([]);

        const result = service.validateIPRequest({
          email: specialEmail,
          ipAddress: mockIpAddress,
        });

        expect(Utils.getEmailDomain).toHaveBeenCalledWith(specialEmail);
        expect(environmentService.getWhiteIPsByDomain).toHaveBeenCalledWith(specialDomain);
        expect(result).toEqual({ isAccept: true });
      });

      it('should handle IPv6 addresses', () => {
        const ipv6Address = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
        const whitelistIPs = ['2001:db8::/32'];
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
        (ipRangeCheck as jest.Mock).mockReturnValue(true);

        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: ipv6Address,
        });

        expect(ipRangeCheck).toHaveBeenCalledWith(ipv6Address, whitelistIPs);
        expect(result).toEqual({ isAccept: true });
      });

      it('should handle localhost IP addresses', () => {
        const localhostIP = '127.0.0.1';
        const whitelistIPs = ['127.0.0.1', 'localhost'];
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
        (ipRangeCheck as jest.Mock).mockReturnValue(true);

        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: localhostIP,
        });

        expect(ipRangeCheck).toHaveBeenCalledWith(localhostIP, whitelistIPs);
        expect(result).toEqual({ isAccept: true });
      });

      it('should handle multiple IP ranges in whitelist', () => {
        const mockError = { message: 'Multiple Range Error', code: ErrorCode.Common.INVALID_IP_ADDRESS };
        (GraphErrorException.NotAcceptable as jest.Mock).mockReturnValue(mockError);
        const whitelistIPs = [
          '192.168.1.0/24',
          '10.0.0.0/8',
          '172.16.0.0/12',
          '203.0.113.1',
        ];
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
        (ipRangeCheck as jest.Mock).mockReturnValue(false);

        const result = service.validateIPRequest({
          email: mockEmail,
          ipAddress: '8.8.8.8',
        });

        expect(ipRangeCheck).toHaveBeenCalledWith('8.8.8.8', whitelistIPs);
        expect(result.error).toBe(mockError);
      });

      it('should log correct information for rejected requests', () => {
        const whitelistIPs = ['192.168.1.0/24'];
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
        (ipRangeCheck as jest.Mock).mockReturnValue(false);

        service.validateIPRequest({
          email: mockEmail,
          ipAddress: '8.8.8.8',
        });

        expect(loggerService.info).toHaveBeenCalledWith({
          context: 'Validate IP request',
          extraInfo: {
            whiteListIp: whitelistIPs,
            email: mockEmail,
            enableAccess: false,
            ipAddress: '8.8.8.8',
          },
        });
      });

      it('should handle ipRangeCheck throwing an error', () => {
        const whitelistIPs = ['invalid-range'];
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(whitelistIPs);
        (ipRangeCheck as jest.Mock).mockImplementation(() => {
          throw new Error('Invalid IP range format');
        });

        expect(() => {
          service.validateIPRequest({
            email: mockEmail,
            ipAddress: mockIpAddress,
          });
        }).toThrow('Invalid IP range format');
      });
    });

    describe('concurrent validation requests', () => {
      it('should handle multiple concurrent IP validations', () => {
        const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
        const ipAddresses = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
        
        (Utils.getEmailDomain as jest.Mock).mockReturnValue('example.com');
        mockEnvironmentService.getWhiteIPsByDomain.mockReturnValue(['192.168.1.0/24']);
        (ipRangeCheck as jest.Mock).mockReturnValue(true);

        const results = emails.map((email, index) =>
          service.validateIPRequest({
            email,
            ipAddress: ipAddresses[index],
          })
        );

        results.forEach(result => {
          expect(result).toEqual({ isAccept: true });
        });

        expect(ipRangeCheck).toHaveBeenCalledTimes(3);
        expect(loggerService.info).toHaveBeenCalledTimes(3);
      });
    });

    describe('cryptoKey property', () => {
      it('should expose cryptoKey property', () => {
        expect(service.cryptoKey).toBe('mock-encrypt-key');
      });

      it('should update cryptoKey when environment service returns different value', () => {
        mockEnvironmentService.getByKey.mockReturnValue('different-encrypt-key');
        
        const newService = new WhitelistIPService(
          environmentService as any,
          loggerService as any
        );

        expect(newService.cryptoKey).toBe('different-encrypt-key');
      });
    });
  });
});
