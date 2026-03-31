import { AWSAnalytics } from './aws-analytics';
import { DatadogAnalytics } from './datadog-analytics';
import { GoogleAnalytics } from './google-analytics';

class AnalyticContainer {
  private providers: Map<string, unknown> = new Map();

  constructor() {
    const datadogAnalytics = new DatadogAnalytics();
    const awsAnalytics = new AWSAnalytics();
    const ga4 = new GoogleAnalytics();
    this.providers.set(AWSAnalytics.providerName, awsAnalytics);
    this.providers.set(DatadogAnalytics.providerName, datadogAnalytics);
    this.providers.set(GoogleAnalytics.providerName, ga4);
  }

  get<T>(provider: string): T {
    return this.providers.get(provider) as T;
  }
}

const analyticContainer = new AnalyticContainer();
export default analyticContainer;
