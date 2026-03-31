import { AnalyticsClass } from '@aws-amplify/analytics/lib-esm/Analytics';
import { isNil, merge, omitBy } from 'lodash';

import { AwsPinpointReason } from '@/constants/logger';
import { AWSAnalyticsProps } from '@/interfaces/analytics';
import { clientLogger } from '@/lib/logger';
import { getErrorMessage } from '@/utils/error.utils';

import { BaseAnalytics } from './base';
import { getAttributes } from './utils';

export class AWSAnalytics implements BaseAnalytics<AnalyticsClass, AWSAnalyticsProps> {
  static providerName = 'AWSAnalytics';

  private recordService: AnalyticsClass;
  async getInstance() {
    if (this.recordService) {
      return this.recordService;
    }
    try {
      const instance = await import('../aws-analytics');
      this.recordService = instance.default;
      return this.recordService;
    } catch (e) {
      clientLogger.error({
        message: getErrorMessage(e),
        reason: AwsPinpointReason.SETUP_FAILED,
        attributes: {}
      });
    }
  }

  record(params: AWSAnalyticsProps) {
    params.attributes = omitBy(params.attributes, isNil);
    const mergedParams = omitBy(merge({}, { attributes: getAttributes(params.attributes) }, params), isNil) as AWSAnalyticsProps;
    /**
     * Disable recording events on local development
     */
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return this.getInstance()
      .then(() => this.recordService.record(mergedParams as any))
      .catch(e => {
        clientLogger.error({
          message: getErrorMessage(e),
          reason: AwsPinpointReason.RECORD_FAILED,
          attributes: mergedParams as unknown as Record<string, unknown>
        });
      });
  }
}
