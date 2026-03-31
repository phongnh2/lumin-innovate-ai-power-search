import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import { loadRemote } from 'services/moduleFederation';

import SkeletonAppPanel from './components/SkeletonAppPanel/SkeletonAppPanel';
import { withPanelStyles } from './HOC/withPanelStyles';
import { BasePanelProps } from './types';

interface InvoiceExtractorPanelProps extends BasePanelProps {
  userId: string;
  totalPages?: number;
}

const InvoiceExtractorRemoteApp = createRemoteAppComponent<InvoiceExtractorPanelProps>({
  loader: () => loadRemote('appMarketplace/InvoiceExtractorPanel') as Promise<InvoiceExtractorPanelProps>,
  // TODO: Add fallback component
  fallback: () => <div>error</div>,
  loading: <SkeletonAppPanel />,
});

const InvoiceExtractorPanel = withPanelStyles(InvoiceExtractorRemoteApp);

export default InvoiceExtractorPanel;
