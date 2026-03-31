import { environment } from '@/configs/environment';
import { EventCookieKey } from '@/constants/cookieKey';
import { LUMIN_SESSION } from '@/constants/sessionKey';

const isDevelopment = process.env.NODE_ENV === 'development';

const EXPIRE_DAYS_DEFAULT = 360;

class CookieUtils {
  static get = (cname: string): string => {
    const name = `${cname}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };

  static set = ({ name, value, exdays, ext = {} }: { name: string; value: string; exdays?: number; ext?: Record<string, unknown> }) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays || EXPIRE_DAYS_DEFAULT) * 24 * 60 * 60 * 1000);
    const cookieObj = {
      [name]: value,
      domain: isDevelopment ? 'localhost' : '.luminpdf.com',
      expires: d.toUTCString(),
      path: '/',
      ...ext
    };
    const cookieStr = Object.entries(cookieObj)
      .map(([_key, _value]) => `${_key}=${_value}`)
      .join(';');
    document.cookie = cookieStr;
  };

  static delete = (name: string): void => {
    const value = this.get(name);
    if (value) {
      this.set({ name, value, exdays: -1 });
    }
  };

  static setAuthEventCookie = (method: string, extraInfo?: { from?: string | null; agGuest?: string | null }): void => {
    const params = { method, clickedAt: Date.now(), url: window.location.origin + window.location.pathname, ...extraInfo };
    this.set({ name: EventCookieKey.USER_AUTH, value: JSON.stringify(params) });
  };

  static setAuthenticationCookie = (value: string): void => {
    this.set({
      name: LUMIN_SESSION.AUTHENTICATION,
      value,
      exdays: environment.public.jwt.authentication.cookieExpiry,
      ext: {
        SameSite: 'Lax',
        Secure: true
      }
    });
  };
}

export default CookieUtils;
