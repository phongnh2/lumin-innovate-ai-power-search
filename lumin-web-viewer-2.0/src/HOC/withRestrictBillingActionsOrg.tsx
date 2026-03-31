import React, { ComponentType } from 'react';

import RestrictedBillingActions from 'luminComponents/RestrictedBillingActions';

import { useEnableWebReskin, useGetCurrentOrganization } from 'hooks';

const withRestrictBillingActionsOrg =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const { isEnableReskin } = useEnableWebReskin();
    const { isRestrictedBillingActions } = useGetCurrentOrganization() || {};

    if (isEnableReskin && isRestrictedBillingActions) {
      return (
        <div
          style={{
            height: '100%',
            padding: 'var(--kiwi-spacing-6) 0',
          }}
        >
          <RestrictedBillingActions />
        </div>
      );
    }

    return <Component {...props} />;
  };

export default withRestrictBillingActionsOrg;
