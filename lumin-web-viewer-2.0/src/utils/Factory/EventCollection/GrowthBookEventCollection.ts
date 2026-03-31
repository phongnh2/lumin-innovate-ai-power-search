import { Experiment, Result } from '@growthbook/growthbook-react';

import { AWS_EVENTS } from 'constants/awsEvents';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { EventCollection } from './EventCollection';

export class GrowthBookEventCollection extends EventCollection {
  trackVariationView({ experiment, result }: { experiment: Experiment<any>; result: Result<any> }): Promise<unknown> {
    const attributes = {
      experimentId: experiment.key,
      variationId: result.key,
      variationName: result.name,
    };

    if (result.hashAttribute === KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID) {
      Object.assign(attributes, { organizationId: result.hashValue });
    }

    return this.record({
      name: AWS_EVENTS.GROWTHBOOK.VARIATION_VIEW,
      attributes,
    });
  }
}

export const growthBookEvent = new GrowthBookEventCollection();
