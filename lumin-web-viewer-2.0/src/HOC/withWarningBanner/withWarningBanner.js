import React, { useMemo } from 'react';

import useCurrentBillingClient from 'hooks/useCurrentBillingClient';

import { WarningBannerType } from 'constants/banner';

export const WarningBannerContext = React.createContext({
  [WarningBannerType.BILLING_WARNING.value]: {
    targetId: null,
    targetType: null,
    refetch: (_id, _type) => {},
    checkHasWarning: () => {},
    isLoading: true,
    warnings: [],
  },
});

const withWarningBanner = (Component) =>
  function (props) {
    const { targetId, targetType, refetch, checkHasWarning, isLoading } = useCurrentBillingClient();
    const contextValue = useMemo(
      () => ({
        [WarningBannerType.BILLING_WARNING.value]: {
          targetId,
          targetType,
          refetch,
          checkHasWarning,
          isLoading,
        },
      }),
      [targetId, targetType, refetch, checkHasWarning, isLoading]
    );
    return (
      <WarningBannerContext.Provider value={contextValue}>
        <Component {...props} />
      </WarningBannerContext.Provider>
    );
  };

export default withWarningBanner;
