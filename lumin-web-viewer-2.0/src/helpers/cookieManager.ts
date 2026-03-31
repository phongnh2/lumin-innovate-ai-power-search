/* eslint-disable class-methods-use-this */
import { isNil, merge, omitBy } from 'lodash';

import LocalStorageUtils from 'utils/localStorage';

import { CookieStorageKey } from 'constants/cookieName';
import { LocalStorageKey } from 'constants/localStorageKey';

const isDevelopment = process.env.NODE_ENV === 'development';

interface ICookieOptions {
  domain: string;
  path: string;
  sameSite: 'none' | 'lax' | 'strict';
}

interface IBrowserCookieOptions {
  domain: string;
  path: string;
  samesite: 'none' | 'lax' | 'strict';
  expires: string;
}

export class CookieManager {
  get(name: string): string {
    const cookieName = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  /**
   * @param param[name] The cookie name
   * @param param[value] The cookie value
   * @param param[maxAge] The cookie max age in seconds
   * @param param[options] (optional) The cookie options
   */
  set({
    name,
    value,
    maxAge,
    options = {},
  }: {
    name: string;
    value: string;
    maxAge: number;
    options?: Partial<ICookieOptions>;
  }): void {
    const d = new Date();
    d.setTime(d.getTime() + maxAge * 1000);
    const defaultOptions: IBrowserCookieOptions = {
      expires: d.toUTCString(),
      path: '/',
      samesite: null,
      domain: null,
    };

    const cookieObj: IBrowserCookieOptions = {
      expires: d.toUTCString(),
      path: options.path,
      samesite: options.sameSite,
      domain: options.domain,
    };
    // Omit the field if it is null or undefined.
    // Therefore, we can set `null` to exclude the field.
    const mergedOptions = omitBy(merge({}, defaultOptions, cookieObj), isNil);
    const cookieOptionStr = Object.entries(mergedOptions)
      .map(([_key, _value]) => `${_key}=${_value as string}`)
      .join(';');
    const cookie = `${name}=${value};${cookieOptionStr}`;
    document.cookie = cookie;
  }

  delete(name: string, options?: Pick<ICookieOptions, 'domain'>): void {
    const value = this.get(name);
    if (!value) {
      return;
    }
    this.set({
      name,
      value: '',
      maxAge: this.daysToSeconds(-365),
      options: merge({
        domain: null,
        sameSite: null,
      }, isDevelopment ? {} : { domain: '.luminpdf.com' }, options),
    });
  }

  daysToSeconds(days: number): number {
    return days * 24 * 60 * 60;
  }

  get anonymousUserId(): string {
    this.delete(CookieStorageKey.ANONYMOUS_USER_ID, { domain: null });
    let _anonymousUserId = this.get(CookieStorageKey.ANONYMOUS_USER_ID);
    if (!_anonymousUserId) {
      _anonymousUserId = LocalStorageUtils.anonymousUserId;
      this.set({
        name: CookieStorageKey.ANONYMOUS_USER_ID,
        value: _anonymousUserId,
        maxAge: this.daysToSeconds(365),
        options: {
          sameSite: 'lax',
        },
      });
    } else {
      // sync anonymousUserId from cookie to localStorage if it does not exist.
      const existedId = LocalStorageUtils.get({ key: LocalStorageKey.ANONYMOUS_USER_ID });
      if (!existedId || existedId !== _anonymousUserId) {
        LocalStorageUtils.set({ key: LocalStorageKey.ANONYMOUS_USER_ID, value: _anonymousUserId });
      }
    }
    return _anonymousUserId;
  }
}

export const cookieManager = new CookieManager();
