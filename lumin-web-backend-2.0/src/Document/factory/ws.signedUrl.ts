import { SignedUrlConstants } from 'Common/constants/SignedUrlConstants';

import { BaseSignedUrl } from './base.signedUrl';

export class WsSignedUrl extends BaseSignedUrl {
  constructor(
    private readonly host: string,
    private readonly patterns: string[],
    private readonly expires: number,
  ) {
    super();
  }

  getCanonicalQuery(): string {
    if (!this.canonicalQuery) {
      const query = {
        [SignedUrlConstants.EXPIRES_QUERY_PARAM]: this.expires.toString(),
        [SignedUrlConstants.LUMIN_DATE_QUERY_PARAM]: this.dateTime,
        [SignedUrlConstants.ALLOWED_SOCKET_PATTERNS_PARAM]: this.patterns.sort(this.compareStringFunction).join(';'),
        [SignedUrlConstants.SIGNED_HEADERS_QUERY_PARAM]: Object.keys(this.canonicalHeader).sort(this.compareStringFunction).join(';'),
      };
      this.canonicalQuery = this.createCanonicalQueryString(query);
    }
    return this.canonicalQuery;
  }

  getCanonicalRequest(): string {
    const sortedHeaders = Object.keys(this.canonicalHeader).sort(
      this.compareStringFunction,
    );
    return [
      this.patterns.join(';'),
      this.getCanonicalQuery(),
      sortedHeaders
        .map((name) => `${name}:${this.canonicalHeader[name]}`)
        .join('\n'),
      sortedHeaders.join(';'),
    ].join('\n');
  }
}
