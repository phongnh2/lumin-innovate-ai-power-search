import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';

import { UrlSearchParam } from 'constants/UrlSearchParam';

/**
 * @deprecated since version luminweb-4.6.0
 */
class UrlUtils {
  static encodeContinue(url) {
    return url ? `${UrlSearchParam.CONTINUE_URL}=${encodeURIComponent(url)}` : '';
  }

  static decode(queryString, field) {
    const params = new URLSearchParams(queryString);
    const entries = params.entries();
    const queryObject = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of entries) {
      queryObject[key] = value;
    }
    const formatSearch = omitBy(queryObject, isNil);

    const data = formatSearch[field];

    return data ? decodeURIComponent(data) : null;
  }

  static decodeContinue(queryString) {
    return UrlUtils.decode(queryString, UrlSearchParam.CONTINUE_URL);
  }

  static decodeRedirectState(queryString) {
    return JSON.parse(UrlUtils.decode(queryString, UrlSearchParam.REDIRECT_STATE)) || {};
  }
}

export default UrlUtils;
