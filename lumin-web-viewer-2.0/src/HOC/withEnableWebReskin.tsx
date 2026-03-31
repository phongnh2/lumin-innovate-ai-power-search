import React from 'react';

import { useEnableWebReskin } from 'hooks';

const withEnableWebReskin =
  (Component: React.ComponentType<{ isEnableReskin: boolean }>) => (props: Record<string, unknown>) => {
    const { isEnableReskin } = useEnableWebReskin();
    return <Component isEnableReskin={isEnableReskin} {...props} />;
  };

export default withEnableWebReskin;
