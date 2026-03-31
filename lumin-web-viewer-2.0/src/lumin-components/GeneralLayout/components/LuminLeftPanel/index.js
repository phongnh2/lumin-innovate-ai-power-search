import React from 'react';

import OutlineTreeProvider from 'features/Outline/components/OutlineTreeProvider';

import LuminLeftPanel from './LuminLeftPanel';

const LuminLeftPanelWithProviders = (props) => (
  <OutlineTreeProvider>
    <LuminLeftPanel {...props} />
  </OutlineTreeProvider>
);

export default LuminLeftPanelWithProviders;
