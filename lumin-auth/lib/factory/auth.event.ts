import { AWS_EVENTS } from '@/constants/awsEvents';
import { Plans } from '@/constants/plan';

import analyticContainer from './analytic.container';
import { AWSAnalytics } from './aws-analytics';
import { BaseEvent } from './base.event';
import { DatadogAnalytics } from './datadog-analytics';
import { GoogleAnalytics } from './google-analytics';

export type TAuthEvent = {
  method: string;
  planName?: string;
  oryIdentityId?: string;
  url?: string;
  from?: string;
  agGuest?: string | null;
};

export class AuthEventCollection extends BaseEvent {
  signIn({ method, url, from }: TAuthEvent) {
    return this.record({
      name: AWS_EVENTS.AUTH.USER_SIGN_IN,
      attributes: {
        method,
        url,
        queryString_from: from
      }
    });
  }

  signUp({ method, planName = Plans.FREE, oryIdentityId, url, from, agGuest }: TAuthEvent) {
    return this.record({
      name: AWS_EVENTS.AUTH.USER_SIGN_UP,
      attributes: {
        method,
        planName,
        oryIdentityId,
        url,
        queryString_from: from,
        ...(agGuest && { queryString_ag_guest: agGuest })
      }
    });
  }
}

export const authEvent = new AuthEventCollection(
  analyticContainer.get(AWSAnalytics.providerName),
  analyticContainer.get(DatadogAnalytics.providerName),
  analyticContainer.get(GoogleAnalytics.providerName)
);
