import * as crypto from 'crypto';

import { SignedUrlConstants } from 'Common/constants/SignedUrlConstants';
import { Utils } from 'Common/utils/Utils';

export abstract class BaseSignedUrl {
  protected readonly dateTime: string;

  protected canonicalHeader: Record<string, string> = {};

  protected canonicalQuery: string = '';

  constructor() {
    this.dateTime = Utils.iso8601(new Date()).replace(/[\-:]/g, '');
  }

  abstract getCanonicalQuery(): string;

  abstract getCanonicalRequest(): string;

  createStringToSign(): string {
    const canonicalRequest = this.getCanonicalRequest();
    const hashedRequest = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex');
    return `${this.dateTime}\n${hashedRequest}`;
  }

  protected compareStringFunction = (a: string, b: string): number => a.localeCompare(b);

  setCanonicalHeader(headers: Record<string, string>): Record<string, string> {
    const newHeaders = {
      ...headers,
    };
    const canonical = {};
    if (Object.keys(newHeaders).length) {
      Object.keys(newHeaders)
        .sort(this.compareStringFunction)
        .forEach((headerName) => {
          if (!newHeaders[headerName]) {
            return;
          }
          const canonicalHeaderName = headerName.toLowerCase();
          if (
            SignedUrlConstants.PROXY_HEADER_PATTERN.test(canonicalHeaderName)
            || SignedUrlConstants.SEC_HEADER_PATTERN.test(canonicalHeaderName)
          ) {
            return;
          }
          canonical[canonicalHeaderName] = newHeaders[headerName]
            .trim()
            .replace(/\s+/g, ' ');
        });
    }

    this.canonicalHeader = canonical;
    return canonical;
  }

  protected createCanonicalQueryString = (query: Record<string, string>): string => {
    const keys: Array<string> = [];
    const serialized: Record<string, string> = {};
    Object.keys(query)
      .sort(this.compareStringFunction)
      .forEach((key) => {
        keys.push(key);
        const value = query[key];
        serialized[key] = `${Utils.escapeUri(key)}=${Utils.escapeUri(value)}`;
      });

    return keys
      .map((key) => serialized[key])
      .filter(Boolean) // omit any falsy values
      .join('&');
  };
}
