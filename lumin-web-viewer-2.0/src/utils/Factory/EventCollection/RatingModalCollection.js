import { AWS_EVENTS } from 'constants/awsEvents';
import { PRICING_VERSION } from 'constants/plan';

import { EventCollection } from './EventCollection';

const getPriceVersion = (priceVersion) => {
  if (!Object.values(PRICING_VERSION).includes(priceVersion)) {
    return 0;
  }
  return parseInt(priceVersion.slice(1));
};

export class RatingModalCollection extends EventCollection {
  onRated({ ratedScore, userPlanType, priceVersion, isAutoSync = false }) {
    const attributes = {
      ratedScore,
      userPlanType,
      priceVersion: getPriceVersion(priceVersion),
      isAutoSync,
    };

    return this.record({
      name: AWS_EVENTS.APP_RATING,
      attributes,
    });
  }
}

export default new RatingModalCollection();
