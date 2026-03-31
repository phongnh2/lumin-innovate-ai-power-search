import { cookieManager } from 'helpers/cookieManager';

import { IN_FLOW } from 'constants/commonConstant';
import { CookieStorageKey } from 'constants/cookieName';
import { LocalStorageKey } from 'constants/localStorageKey';

export const injectOnedriveToken = (accessTokenData: {
  accessToken: string;
  email: string;
  expiredAt: string;
  // oid: Immutable object identifier, this ID uniquely identifies the user across applications in microsoft
  oid: string;
}) => {
  const isFromOpenFileFlow = cookieManager.get(CookieStorageKey.IN_FLOW) === IN_FLOW.ONEDRIVE;
  if (isFromOpenFileFlow) {
    const { accessToken, email, expiredAt, oid } = accessTokenData;
    localStorage.setItem(
      LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN,
      JSON.stringify({ accessToken, email, expiredAt, oid })
    );
  }
};
