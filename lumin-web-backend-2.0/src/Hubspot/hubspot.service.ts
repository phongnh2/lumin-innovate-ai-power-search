import * as hubspot from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/deals';
import { Injectable } from '@nestjs/common';

import { HubspotPropertyNameConstants } from 'Common/constants/HubspotPropertyNameConstants';

import { HubspotClientProvider } from 'Hubspot/hubspot-client.provider';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class HubspotService {
  private hubspotClient: hubspot.Client;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly hubspotClientProvider: HubspotClientProvider,
  ) {
    this.hubspotClient = this.hubspotClientProvider.getClient();
  }

  public async getHubspotPortalId(): Promise<string> {
    const path = '/integrations/v1/me';
    const res = await this.hubspotClient.apiRequest({
      method: 'GET',
      path,
    });
    const { portalId } = await res.json();
    return portalId;
  }

  public async getLatestDealByOrgId(orgId: string): Promise<{ dealName: string; dealId: string }> {
    let dealId = '';
    let dealName = '';
    try {
      const res = await this.hubspotClient.crm.deals.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                value: orgId,
                propertyName: HubspotPropertyNameConstants.ORGANIZATION_ID,
                operator: FilterOperatorEnum.Eq,
              },
            ],
          },
        ],
        sorts: ['-createdate'],
        properties: ['dealname'],
        limit: 1,
        after: '0',
      });
      if (res.total !== 0) {
        dealId = res.results[0].id;
        dealName = res.results[0].properties.dealname;
      }
    } catch (error) {
      this.loggerService.error({
        context: 'getLatestDealIdByOrgId',
        error,
      });
    }
    return {
      dealName,
      dealId,
    };
  }
}
