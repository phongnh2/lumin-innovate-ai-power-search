import { SemanticBanner } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import { BannerPurpose, BannerName } from 'utils/Factory/EventCollection/BannerEventCollection';

const BillingWarningUnpaidBanner = () => {
  useTrackingBannerEvent({
    bannerName: BannerName.BILLING_WARNING_UNPAID,
    bannerPurpose: BannerPurpose[BannerName.BILLING_WARNING_UNPAID],
  });

  return (
    <SemanticBanner
      variant="critical"
      content={
        <Trans i18nKey="viewer.billingWarning.billingWarningUnpaid" components={{ b: <span className="bold" /> }} />
      }
    />
  );
};

export default BillingWarningUnpaidBanner;
