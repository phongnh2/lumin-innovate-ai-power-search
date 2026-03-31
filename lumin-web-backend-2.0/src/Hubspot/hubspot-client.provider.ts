import * as hubspot from '@hubspot/api-client';
import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

export const HUBSPOT_CLIENT = 'HUBSPOT_CLIENT';

@Injectable()
export class HubspotClientProvider {
  private readonly client: hubspot.Client;

  constructor(private readonly environmentService: EnvironmentService) {
    const config: { numberOfApiCallRetries: number; accessToken?: string } = {
      numberOfApiCallRetries: 5,
    };
    config.accessToken = this.environmentService.getByKey(EnvConstants.HUBSPOT_ACCESS_TOKEN);
    this.client = new hubspot.Client(config);
  }

  getClient(): hubspot.Client {
    return this.client;
  }
}
