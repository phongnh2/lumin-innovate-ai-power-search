import { AWSAnalyticsProps } from '@/interfaces/analytics';

import { AWSAnalytics } from './aws-analytics';
import { DatadogAnalytics } from './datadog-analytics';
import { GoogleAnalytics } from './google-analytics';

export class BaseEvent {
  constructor(private readonly analyticClass: AWSAnalytics, private readonly datadogAnalytics: DatadogAnalytics, private readonly ga4?: GoogleAnalytics) {}

  record(props: AWSAnalyticsProps) {
    this.analyticClass.record(props);
    this.datadogAnalytics.record(props);
    this.ga4?.record(props);
  }
}
