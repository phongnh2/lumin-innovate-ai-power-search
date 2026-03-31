import { Session } from '@ory/kratos-client';
import axios from 'axios';
import dayjs from 'dayjs';

import logger from 'helpers/logger';

import { LocalStorageKey } from 'constants/localStorageKey';
import { KRATOS_PUBLIC_API } from 'constants/urls';

import LocalStorageUtils from './localStorage';

class SessionUtils {
  static async toSession(): Promise<Session & { tokenized: string }> {
    try {
      const resp = await axios.get(`${KRATOS_PUBLIC_API }/sessions/whoami`, {
        params: {
          tokenize_as: 'lumin_authorization_jwt',
        },
        withCredentials: true,
      });
      return resp.data as Session & { tokenized: string };
    } catch (error) {
      logger.logError({
        reason: 'ToSessionError:session',
        error: error as Error,
      });
      throw error;
    }
  }

  static setAuthorizedToken = (tokenized: string): void => {
    LocalStorageUtils.set({
      key: LocalStorageKey.ORY_ACCESS_TOKEN,
      value: JSON.stringify({
        token: tokenized,
        expiredAt: process.env.AUTHOR_JWT_EXPIRED_AT
          ? dayjs(Date.now()).add(Number(process.env.AUTHOR_JWT_EXPIRED_AT), 'ms').toDate().getTime()
          : dayjs(Date.now()).add(120000, 'ms').toDate().getTime(),
      }),
    });
  };

  static async generateNewAuthorizedToken(): Promise<string> {
    try {
      const { tokenized } = await SessionUtils.toSession();
      SessionUtils.setAuthorizedToken(tokenized);

      return tokenized;
    } catch (e) {
      return '';
    }
  }

  static getAuthorizedToken = async (options?: { forceNew: boolean }): Promise<string> => {
    const { forceNew = false } = options || {};
    try {
      if (forceNew) {
        return await SessionUtils.generateNewAuthorizedToken();
      }
      const tokenString = localStorage.getItem(LocalStorageKey.ORY_ACCESS_TOKEN);
      if (tokenString) {
        const tokenData = JSON.parse(tokenString) as { token: string; expiredAt: number };
        if (tokenData.expiredAt < Date.now()) {
          localStorage.removeItem(LocalStorageKey.ORY_ACCESS_TOKEN);
          return await SessionUtils.generateNewAuthorizedToken();
        }

        return tokenData.token;
      }
      return await SessionUtils.generateNewAuthorizedToken();
    } catch (e) {
      return await SessionUtils.generateNewAuthorizedToken();
    }
  };
}

export default SessionUtils;
