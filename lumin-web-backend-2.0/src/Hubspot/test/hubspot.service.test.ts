import { Test, TestingModule } from '@nestjs/testing';

import { HubspotPropertyNameConstants } from '../../Common/constants/HubspotPropertyNameConstants';
import { LoggerService } from '../../Logger/Logger.service';
import { HubspotClientProvider } from '../hubspot-client.provider';
import { HubspotService } from '../hubspot.service';

describe('HubspotService', () => {
  let service: HubspotService;
  let loggerService: LoggerService;

  const mockApiRequest = jest.fn();
  const mockDoSearch = jest.fn();

  const mockHubspotClient = {
    apiRequest: mockApiRequest,
    crm: {
      deals: {
        searchApi: {
          doSearch: mockDoSearch,
        },
      },
    },
  };

  const mockHubspotClientProvider = {
    getClient: jest.fn().mockReturnValue(mockHubspotClient),
  };

  const mockLoggerService = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HubspotService,
        { provide: HubspotClientProvider, useValue: mockHubspotClientProvider },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<HubspotService>(HubspotService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('getHubspotPortalId', () => {
    it('should return portalId successfully', async () => {
      const mockPortalId = '12345678';
      mockApiRequest.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ portalId: mockPortalId }),
      });

      const result = await service.getHubspotPortalId();

      expect(result).toBe(mockPortalId);
      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/integrations/v1/me',
      });
    });

    it('should throw error when API fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('API Error'));

      await expect(service.getHubspotPortalId()).rejects.toThrow('API Error');
    });
  });

  describe('getLatestDealByOrgId', () => {
    const orgId = 'org-123';

    it('should return deal info when deal exists', async () => {
      const mockDealId = 'deal-123';
      const mockDealName = 'Test Deal';

      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [
          {
            id: mockDealId,
            properties: { dealname: mockDealName },
          },
        ],
      });

      const result = await service.getLatestDealByOrgId(orgId);

      expect(result).toEqual({
        dealId: mockDealId,
        dealName: mockDealName,
      });
      expect(mockDoSearch).toHaveBeenCalledWith({
        filterGroups: [
          {
            filters: [
              {
                value: orgId,
                propertyName: HubspotPropertyNameConstants.ORGANIZATION_ID,
                operator: 'EQ',
              },
            ],
          },
        ],
        sorts: ['-createdate'],
        properties: ['dealname'],
        limit: 1,
        after: '0',
      });
    });

    it('should return empty strings when no deals found', async () => {
      mockDoSearch.mockResolvedValue({
        total: 0,
        results: [],
      });

      const result = await service.getLatestDealByOrgId(orgId);

      expect(result).toEqual({
        dealId: '',
        dealName: '',
      });
    });

    it('should return empty strings and log error when API fails', async () => {
      const error = new Error('Search API Error');
      mockDoSearch.mockRejectedValue(error);

      const result = await service.getLatestDealByOrgId(orgId);

      expect(result).toEqual({
        dealId: '',
        dealName: '',
      });
      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'getLatestDealIdByOrgId',
        error,
      });
    });
  });
});

