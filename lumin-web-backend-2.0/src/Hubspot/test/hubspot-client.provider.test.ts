import * as hubspot from '@hubspot/api-client';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvConstants } from '../../Common/constants/EnvConstants';
import { EnvironmentService } from '../../Environment/environment.service';
import { HubspotClientProvider } from '../hubspot-client.provider';

jest.mock('@hubspot/api-client');

describe('HubspotClientProvider', () => {
  let provider: HubspotClientProvider;

  const mockAccessToken = 'test-access-token';

  const mockEnvironmentService = {
    getByKey: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockEnvironmentService.getByKey.mockReturnValue(mockAccessToken);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HubspotClientProvider,
        { provide: EnvironmentService, useValue: mockEnvironmentService },
      ],
    }).compile();

    provider = module.get<HubspotClientProvider>(HubspotClientProvider);
  });

  describe('constructor', () => {
    it('should initialize HubSpot client with access token and retry config', () => {
      expect(mockEnvironmentService.getByKey).toHaveBeenCalledWith(
        EnvConstants.HUBSPOT_ACCESS_TOKEN,
      );
      expect(hubspot.Client).toHaveBeenCalledWith({
        numberOfApiCallRetries: 5,
        accessToken: mockAccessToken,
      });
    });
  });

  describe('getClient', () => {
    it('should return the HubSpot client instance', () => {
      const client = provider.getClient();

      expect(client).toBeDefined();
    });

    it('should return the same client instance on multiple calls', () => {
      const client1 = provider.getClient();
      const client2 = provider.getClient();

      expect(client1).toBe(client2);
    });
  });
});

