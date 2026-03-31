import { SignedUrlConstants } from 'Common/constants/SignedUrlConstants';

import { BaseSignedUrl } from './base.signedUrl';

export class HttpSignedUrl extends BaseSignedUrl {
  constructor(
    private readonly host: string,
    private readonly path: string,
    private readonly method: string,
    private readonly expires: number,
  ) {
    super();
  }

  getCanonicalQuery(): string {
    if (!this.canonicalQuery) {
      const query = {
        [SignedUrlConstants.EXPIRES_QUERY_PARAM]: this.expires.toString(),
        [SignedUrlConstants.LUMIN_DATE_QUERY_PARAM]: this.dateTime,
        [SignedUrlConstants.SIGNED_HEADERS_QUERY_PARAM]: Object.keys(this.canonicalHeader)
          .sort(this.compareStringFunction)
          .join(';'),
      };
      this.canonicalQuery = this.createCanonicalQueryString(query);
    }
    return this.canonicalQuery;
  }

  getCanonicalRequest(): string {
    const payloadHash = SignedUrlConstants.UNSIGNED_PAYLOAD;
    const sortedHeaders = Object.keys(this.canonicalHeader).sort(
      this.compareStringFunction,
    );
    return [
      this.method,
      this.path,
      this.getCanonicalQuery(),
      sortedHeaders
        .map((name) => `${name}:${this.canonicalHeader[name]}`)
        .join('\n'),
      sortedHeaders.join(';'),
      payloadHash,
    ].join('\n');
  }
}
