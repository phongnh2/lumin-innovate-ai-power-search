// Based on @ory/client@1.1.23
import { FrontendApi as KratosFrontendApi } from '@ory/client';
import { AxiosError, AxiosInstance } from 'axios';

import { OryAxiosRequestConfig } from '@/interfaces/ory';

import { OryRepository } from './ory-repository';

const MOCK_FAIL_COOKIE = 'mock-fail-to-session';

function hasMockFailCookie(cookieHeader?: string): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(';').some(part => part.trim().split('=')[0].trim() === MOCK_FAIL_COOKIE);
}

export class EdgeFrontendApiRepository extends OryRepository<KratosFrontendApi> {
  constructor(axios: AxiosInstance) {
    super(KratosFrontendApi, undefined, axios);
  }

  toSession(data?: { cookie?: string }, options?: OryAxiosRequestConfig) {
    if (hasMockFailCookie(data?.cookie)) {
      throw new AxiosError(MOCK_FAIL_COOKIE, '403', undefined, undefined, {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: {} as never,
        data: { error: { code: 403 } }
      });
    }
    return this._repository.toSession(data, options);
  }
}
