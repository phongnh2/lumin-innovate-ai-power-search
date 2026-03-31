import React, { useMemo } from 'react';

import { MatchMediaLayoutContext } from '../contexts/MatchMediaLayout.context';
import useMatchMediaLayout from '../hooks/useMatchMediaLayout';

const MatchMediaLayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { isNarrowScreen } = useMatchMediaLayout();
  const contextValue = useMemo(
    () => ({
      isNarrowScreen,
    }),
    [isNarrowScreen]
  );

  return <MatchMediaLayoutContext.Provider value={contextValue}>{children}</MatchMediaLayoutContext.Provider>;
};

export default MatchMediaLayoutProvider;
