/* eslint-disable class-methods-use-this */
import { omit } from 'lodash';

import loggerServices, { LoggerService } from 'services/loggerServices';

import { filterSensitiveData } from 'utils/sensitiveDataFilter';

class DatadogAdaptor {
  logger: LoggerService;

  constructor(logger: LoggerService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.logger = logger;
  }

  send(params: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    this.logger.info(this.standardizedParam(params));
  }

  standardizedParam(params: any): { eventName: string; parameters: any } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const eventName = `pinpoint_${params.name as string}`;

    const filteredParams = filterSensitiveData(params) as Record<string, any>;

    const omittedParams = omit(filteredParams, ['attributes.anonymousUserId', 'attributes.LuminUserId']);

    return {
      eventName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parameters: omittedParams,
    };
  }
}

export default new DatadogAdaptor(loggerServices);
