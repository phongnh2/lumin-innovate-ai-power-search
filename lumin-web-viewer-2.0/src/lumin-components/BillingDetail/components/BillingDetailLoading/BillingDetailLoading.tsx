import { Skeleton as KiwiSkeleton, Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useMobileMatch } from 'hooks';

import orgBillingDetailsStyles from '../OrgBillingDetail/OrgBillingDetail.module.scss';
import subscriptionSummaryStyles from '../SubscriptionSummary/SubscriptionSummary.module.scss';

function BillingDetailLoading() {
  const isMobile = useMobileMatch();

  return (
    <div className={orgBillingDetailsStyles.container}>
      <div className={subscriptionSummaryStyles.container}>
        <KiwiSkeleton width={200} height={32} radius="sm" />
        <div className={subscriptionSummaryStyles.orgInfo}>
          <KiwiSkeleton width={32} height={32} circle />
          <KiwiSkeleton width={140} height={16} radius="sm" />
        </div>
      </div>
      <Divider />
      <div>
        <KiwiSkeleton width={isMobile ? 250 : 500} height={16} radius="sm" mb="var(--kiwi-spacing-2)" />
        <KiwiSkeleton width={isMobile ? 150 : 300} height={16} radius="sm" />
      </div>
      <KiwiSkeleton width={isMobile ? '100%' : 122} height={40} radius="sm" />
    </div>
  );
}

export default BillingDetailLoading;
