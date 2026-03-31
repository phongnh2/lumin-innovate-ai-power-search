import { isNil, merge, omitBy } from 'lodash';

import { LoggerReason } from '@/constants/logger';
import { AWSAnalyticsProps } from '@/interfaces/analytics';
import { ClientLogger, TClientLogger, clientLogger } from '@/lib/logger/client';

import { BaseAnalytics } from './base';
import { getAttributes } from './utils';

export class DatadogAnalytics implements BaseAnalytics<ClientLogger, TClientLogger> {
  logger: ClientLogger;
  static providerName = 'DatadogAnalytics';

  constructor() {
    this.logger = clientLogger;
  }

  private standardizedParam(params: any): TClientLogger {
    const eventName = `pinpoint_${params.name as string}`;
    return {
      reason: LoggerReason.DATADOG_ADAPTOR,
      message: 'Datadog Adapter transfer pinpoint events.',
      attributes: {
        eventName,
        ...params
      }
    };
  }

  getInstance() {
    return this.logger;
  }

  public record(params: TClientLogger): void;
  public record(params: AWSAnalyticsProps): void;
  record(params: TClientLogger | AWSAnalyticsProps) {
    const mergedParams = omitBy(merge({}, { attributes: getAttributes(params.attributes) }, params), isNil) as AWSAnalyticsProps;
    let datadogParams: TClientLogger;
    if (mergedParams instanceof AWSAnalyticsProps) {
      datadogParams = this.standardizedParam(mergedParams);
    } else {
      datadogParams = mergedParams;
    }
    this.logger.info(datadogParams);
  }
}
