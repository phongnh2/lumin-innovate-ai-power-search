import { Session } from '@ory/client';
import dayjs from 'dayjs';

import { environment } from '@/configs/environment';
import { AUTH_JWT_TEMPLATE } from '@/constants/sessionKey';
import CookieUtils from '@/utils/cookie.utils';

import JWTService from '../jwt';
import { frontendApi } from '../ory';

class SessionManagement {
  async getSession(token: string, cookie: string): Promise<Partial<Session>> {
    const jwtService = new JWTService();
    try {
      return await jwtService.verifyAuthenticationToken(token);
    } catch (error) {
      const { data: session } = await frontendApi.toSession({
        cookie,
        tokenizeAs: AUTH_JWT_TEMPLATE.AUTHENTICATION
      });
      return session;
    }
  }

  async forceResetSession(): Promise<void> {
    const { tokenized } = await frontendApi.getAuthenticationToken();
    CookieUtils.setAuthenticationCookie(tokenized);
  }

  public setNewAuthorizedToken(token: string): { token: string; expiredAt: number } {
    const newToken = {
      token,
      expiredAt: dayjs(Date.now()).add(environment.public.jwt.authorization.expiredAt, 'ms').toDate().getTime()
    };
    localStorage.setItem('token', JSON.stringify(newToken));
    return newToken;
  }

  private async generateNewAuthorizedToken(): Promise<{ token: string; expiredAt: number }> {
    const { tokenized } = await frontendApi.getAuthorizationToken();
    return this.setNewAuthorizedToken(tokenized);
  }

  async getAuthorizeToken(option?: { forceNew: boolean }): Promise<string | null> {
    const { forceNew = false } = option || {};
    try {
      if (forceNew) {
        const { token } = await this.generateNewAuthorizedToken();
        return token;
      }
      const tokenString = localStorage.getItem('token');
      if (tokenString) {
        const tokenData = JSON.parse(tokenString);
        if (tokenData.expiredAt < Date.now()) {
          localStorage.removeItem('token');
          const { token } = await this.generateNewAuthorizedToken();
          return token;
        }
        return tokenData.token;
      } else {
        const { token } = await this.generateNewAuthorizedToken();
        return token;
      }
    } catch (e) {
      return null;
    }
  }
}

const sessionManagement = new SessionManagement();
export default sessionManagement;
