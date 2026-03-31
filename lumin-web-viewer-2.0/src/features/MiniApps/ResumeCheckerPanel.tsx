import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import { loadRemote } from 'services/moduleFederation';

import SkeletonAppPanel from './components/SkeletonAppPanel/SkeletonAppPanel';
import { withPanelStyles } from './HOC/withPanelStyles';
import { BasePanelProps } from './types';

type ResumeCheckerPanelProps = BasePanelProps;

const ResumeCheckerRemoteApp = createRemoteAppComponent<ResumeCheckerPanelProps>({
  loader: () => loadRemote('appMarketplace/ResumeCheckerPanel') as Promise<ResumeCheckerPanelProps>,
  // TODO: Add fallback component
  fallback: () => <div>error</div>,
  loading: <SkeletonAppPanel />,
});

const ResumeCheckerPanel = withPanelStyles(ResumeCheckerRemoteApp);

export default ResumeCheckerPanel;
