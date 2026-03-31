import { isNil, omitBy } from 'lodash';

import { AWSAnalyticsProps } from '@/interfaces/analytics';
import { convertToSnakeCase, toSnakeCaseKeys, truncateObject } from '@/utils/commonUtils';

import receive from '../ga4';

import { BaseAnalytics } from './base';
import { getAttributes } from './utils';

export const MAX_GA4_KEY_LENGTH = 40;
export const MAX_GA4_VALUE_LENGTH = 100;
export const GA4_RESERVED_PREFIX = {
  GOOGLE: 'google_'
};
export const GA4_RESERVED_PREFIX_MAP = {
  [GA4_RESERVED_PREFIX.GOOGLE]: 'gg_'
};

const mapObj = {
  PDF: 'Pdf',
  MS: 'Ms',
  MB: 'Mb',
  OS: 'Os'
};

type FileType = 'PDF' | 'MS' | 'MB' | 'OS';

export class GoogleAnalytics implements BaseAnalytics<any, any> {
  static providerName = 'ga4';
  private receive: ({ name, parameters }: { name: string; parameters: Record<string, string> }) => void;

  constructor() {
    this.receive = receive;
  }

  getInstance() {
    return this.receive;
  }

  private mapParamsKey(params: Record<string, any>): Record<string, any> {
    Object.keys(params).forEach(key => {
      const convertedKey = key.replace(/PDF|MS|MB|OS/g, matched => mapObj[matched as FileType]);
      if (convertedKey !== key) {
        params[convertedKey] = params[key];
        delete params[key];
      }
      const reservedPrefix = Object.keys(GA4_RESERVED_PREFIX_MAP).find(reservedKey => convertedKey.startsWith(reservedKey)) as string;
      if (reservedPrefix) {
        const mappedReservedKey = convertedKey.replace(reservedPrefix, GA4_RESERVED_PREFIX_MAP[reservedPrefix]);
        params[mappedReservedKey] = params[convertedKey];
        delete params[convertedKey];
      }
    });
    return params;
  }

  private standardizeParams(params: Record<string, any>): Record<string, any> {
    const truncateParams = truncateObject(params, MAX_GA4_KEY_LENGTH, MAX_GA4_VALUE_LENGTH);
    const mapParamsKey = this.mapParamsKey(truncateParams);
    return toSnakeCaseKeys(mapParamsKey);
  }

  record(params: AWSAnalyticsProps) {
    const { name, attributes } = params;
    const eventName = convertToSnakeCase(name);

    const mergedParams = omitBy(getAttributes(attributes), isNil);
    const parameters = this.standardizeParams(mergedParams);

    this.receive({
      name: `${eventName}_pinpoint`,
      parameters
    });
  }
}
