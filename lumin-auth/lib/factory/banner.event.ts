import { AWS_EVENTS } from '@/constants/awsEvents';

import analyticContainer from './analytic.container';
import { AWSAnalytics } from './aws-analytics';
import { BaseEvent } from './base.event';
import { DatadogAnalytics } from './datadog-analytics';

export type TBannerEvent = {
  bannerName: string;
  bannerPurpose: string;
};

export class BannerEventCollection extends BaseEvent {
  getParams = ({ bannerName, bannerPurpose }: TBannerEvent) => {
    return { bannerName, bannerPurpose };
  };

  bannerViewed = ({ bannerName, bannerPurpose }: TBannerEvent) => {
    return this.record({
      name: AWS_EVENTS.BANNER.VIEWED,
      attributes: this.getParams({ bannerName, bannerPurpose })
    });
  };

  bannerDismiss({ bannerName, bannerPurpose }: TBannerEvent) {
    return this.record({
      name: AWS_EVENTS.BANNER.DISMISS,
      attributes: this.getParams({ bannerName, bannerPurpose })
    });
  }

  bannerConfirmation({ bannerName, bannerPurpose }: TBannerEvent) {
    return this.record({
      name: AWS_EVENTS.BANNER.CONFIRMATION,
      attributes: this.getParams({ bannerName, bannerPurpose })
    });
  }

  bannerHidden({ bannerName, bannerPurpose }: TBannerEvent) {
    return this.record({
      name: AWS_EVENTS.BANNER.HIDDEN,
      attributes: this.getParams({ bannerName, bannerPurpose })
    });
  }
}

export const bannerEvent = new BannerEventCollection(analyticContainer.get(AWSAnalytics.providerName), analyticContainer.get(DatadogAnalytics.providerName));
