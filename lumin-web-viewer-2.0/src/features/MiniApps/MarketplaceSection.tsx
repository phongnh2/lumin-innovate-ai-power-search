import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import { loadRemote } from 'services/moduleFederation';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { AppMarketplaceSource } from './types';

export interface MarketplaceSectionProps {
  userId: string;
  targetPortal?: string;
  source: AppMarketplaceSource;
  currentWorkspace?: IOrganization;
  onClickApp: ({ appId, appName }: { appId: string; appName: string }) => void;
}

const MarketplaceSection = createRemoteAppComponent<MarketplaceSectionProps>({
  loader: () => loadRemote('appMarketplace/MarketplaceSection') as Promise<MarketplaceSectionProps>,
  fallback: () => <div />,
  loading: null,
});

export default MarketplaceSection;
