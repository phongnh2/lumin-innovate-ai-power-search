import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { HubspotClientProvider } from 'Hubspot/hubspot-client.provider';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotService } from 'Hubspot/hubspot.service';
import { LoggerModule } from 'Logger/Logger.module';

@Module({
  imports: [EnvironmentModule, LoggerModule],
  controllers: [],
  providers: [
    HubspotClientProvider,
    HubspotWorkspaceService,
    HubspotService,
  ],
  exports: [
    HubspotClientProvider,
    HubspotService,
    HubspotWorkspaceService,
  ],
})
export class HubspotModule {}
