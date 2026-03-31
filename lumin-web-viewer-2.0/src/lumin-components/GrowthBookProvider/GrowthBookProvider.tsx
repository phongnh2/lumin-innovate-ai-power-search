import { GrowthBookProvider as GrowthBookProviderBase } from '@growthbook/growthbook-react';
import React from 'react';

import { useSetupGrowthBook } from 'hooks/growthBook/useSetupGrowthBook';

interface IGrowthBookProviderProps {
  children: JSX.Element;
}

const GrowthBookProvider = ({ children }: IGrowthBookProviderProps): JSX.Element => {
  const growthbook = useSetupGrowthBook();

  return <GrowthBookProviderBase growthbook={growthbook}>{children}</GrowthBookProviderBase>;
};

export default GrowthBookProvider;
