import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import { loadRemote } from 'services/moduleFederation';

import SkeletonAppPanel from './components/SkeletonAppPanel/SkeletonAppPanel';
import { withPanelStyles } from './HOC/withPanelStyles';
import { BasePanelProps } from './types';

interface TranslatorPanelProps extends BasePanelProps {
  documentName?: string;
}

const TranslatorRemoteApp = createRemoteAppComponent<TranslatorPanelProps>({
  loader: () => loadRemote('appMarketplace/TranslatorPanel') as Promise<TranslatorPanelProps>,
  fallback: () => <div>error</div>,
  loading: <SkeletonAppPanel />,
});

const TranslatorPanel = withPanelStyles(TranslatorRemoteApp);

export default TranslatorPanel;
