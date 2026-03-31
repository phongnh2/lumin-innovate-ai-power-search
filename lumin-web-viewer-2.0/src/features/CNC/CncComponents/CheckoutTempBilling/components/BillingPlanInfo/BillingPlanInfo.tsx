import { capitalize } from 'lodash';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import TempBillingDescSkeleton from 'luminComponents/PaymentTempBilling/components/TempBillingDescSkeleton';

import { useTranslation } from 'hooks';

interface BillingPlanInfoProps {
  tempBillingText: {
    planName: string;
    orgPriceText?: string;
  };
  showNextBillingDesc: boolean;
  renderNextBillingDesc: () => React.ReactNode;
  isTrialing: () => boolean;
  nextBilling: {
    loading: boolean;
  };
}

function BillingPlanInfo({
  tempBillingText,
  showNextBillingDesc,
  renderNextBillingDesc,
  isTrialing,
  nextBilling,
}: BillingPlanInfoProps) {
  const { t } = useTranslation();

  if (nextBilling.loading) {
    return <TempBillingDescSkeleton />;
  }

  return (
    <>
      <Text type="headline" size="md">
        {capitalize(tempBillingText.planName)}
      </Text>
      {tempBillingText.orgPriceText && (
        <Text type="headline" size="sm" color="var(--kiwi-colors-core-primary)">
          {tempBillingText.orgPriceText}
        </Text>
      )}
      {showNextBillingDesc && (
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {renderNextBillingDesc()}
        </Text>
      )}
      {isTrialing() && (
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('payment.orgTrialDesc')}
        </Text>
      )}
    </>
  );
}

export default BillingPlanInfo;
