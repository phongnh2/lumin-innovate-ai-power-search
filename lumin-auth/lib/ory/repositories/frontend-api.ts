// Based on @ory/client@1.1.23
import { FrontendApiCreateBrowserLoginFlowRequest, FrontendApi as KratosFrontendApi, Session } from '@ory/client';
import axios, { AxiosResponse } from 'axios';

import { environment } from '@/configs/environment';
import { AUTH_JWT_TEMPLATE } from '@/constants/sessionKey';
import {
  GetSelfServiceFlowRequest,
  Identity,
  OryAxiosRequestConfig,
  OryGetErrorFlowBody,
  OryGetFlowBody,
  OryUpdateLoginFlowRequest,
  OryUpdateRecoveryFlowRequest,
  OryUpdateRegistrationFlowRequest,
  OryUpdateSettingsFlowRequest,
  OryUpdateVerificationFlowRequest
} from '@/interfaces/ory';
import { ExceptionHandler } from '@/lib/decorators/exception.decorator';
import { oryExceptionHandler } from '@/lib/exceptions/ory.exception';

import { OryRepository } from './ory-repository';
/**
 * FrontendApiRepository - Use this class to CRU user flow in browser.
 * https://www.ory.sh/docs/kratos/reference/api#tag/frontend
 * @class FrontendApiRepository
 * @extends {OryRepository<KratosFrontendApi>}
 */

// Get flow methods
const transformGetFlowBody = (data: OryGetFlowBody | OryGetErrorFlowBody): GetSelfServiceFlowRequest => {
  return {
    ...data,
    id: data.flowId
  };
};

@ExceptionHandler(oryExceptionHandler)
class FrontendApiRepository extends OryRepository<KratosFrontendApi> {
  async toSession(data?: { cookie?: string; tokenizeAs?: string }, options?: OryAxiosRequestConfig) {
    return await this._repository.toSession(data, options);
  }

  async getAuthenticationToken(): Promise<{ tokenized: string }> {
    const resp = await axios.get(environment.public.host.kratosUrl + '/sessions/whoami', {
      params: {
        tokenize_as: AUTH_JWT_TEMPLATE.AUTHENTICATION
      },
      withCredentials: true
    });
    return resp.data;
  }

  async getAuthorizationToken(): Promise<{ tokenized: string }> {
    const resp = await axios.get(environment.public.host.kratosUrl + '/sessions/whoami', {
      params: {
        tokenize_as: AUTH_JWT_TEMPLATE.AUTHORIZATION
      },
      withCredentials: true
    });
    return resp.data;
  }

  getLoginFlow(data: OryGetFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getLoginFlow(transformGetFlowBody(data), options);
  }

  getRegistrationFlow(data: OryGetFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getRegistrationFlow(transformGetFlowBody(data), options);
  }

  getFlowError(data: OryGetErrorFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getFlowError(transformGetFlowBody(data), options);
  }

  getRecoveryFlow(data: OryGetFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getRecoveryFlow(transformGetFlowBody(data), options);
  }

  getSettingsFlow(data: OryGetFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getSettingsFlow(transformGetFlowBody(data), options);
  }

  getVerificationFlow(data: OryGetFlowBody, options?: OryAxiosRequestConfig) {
    return this._repository.getVerificationFlow(transformGetFlowBody(data), options);
  }

  // Create flow methods
  createLoginFlow(data?: Partial<FrontendApiCreateBrowserLoginFlowRequest>, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserLoginFlow(data, options);
  }

  createLogoutFlow(data?: { cookie?: string; returnTo?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserLogoutFlow(data, options);
  }

  createRecoveryFlow(data?: { returnTo?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserRecoveryFlow(data, options);
  }

  createRegistrationFlow(data?: { returnTo?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserRegistrationFlow(data, options);
  }

  createSettingsFlow(data?: { returnTo?: string; cookie?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserSettingsFlow(data, options);
  }

  createVerificationFlow(data?: { returnTo?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.createBrowserVerificationFlow(data, options);
  }

  // Submit self-service flow methods
  updateLoginFlow(data: OryUpdateLoginFlowRequest, options?: OryAxiosRequestConfig): Promise<AxiosResponse<{ session: Session }>> {
    return this._repository.updateLoginFlow(
      {
        flow: data.flowId,
        cookie: data.cookie,
        updateLoginFlowBody: data.body
      },
      options
    );
  }

  updateLogoutFlow(data: { logoutToken: string; returnTo?: string; cookie?: string }, options?: OryAxiosRequestConfig) {
    return this._repository.updateLogoutFlow({ token: data.logoutToken, returnTo: data.returnTo, cookie: data.cookie }, options);
  }

  updateRecoveryFlow(data: OryUpdateRecoveryFlowRequest, options?: OryAxiosRequestConfig) {
    return this._repository.updateRecoveryFlow(
      {
        flow: data.flowId,
        cookie: data.cookie,
        updateRecoveryFlowBody: {
          ...data.body,
          // Currently we use magic link to create recovery link.
          method: 'link'
        }
      },
      options
    );
  }

  updateRegistrationFlow(data: OryUpdateRegistrationFlowRequest, options?: OryAxiosRequestConfig) {
    return this._repository.updateRegistrationFlow(
      {
        flow: data.flowId,
        cookie: data.cookie,
        updateRegistrationFlowBody: data.body
      },
      options
    );
  }

  updateSettingsFlow(data: OryUpdateSettingsFlowRequest, options?: OryAxiosRequestConfig): Promise<AxiosResponse<{ identity: Identity }>> {
    return this._repository.updateSettingsFlow(
      {
        flow: data.flowId,
        cookie: data.cookie,
        updateSettingsFlowBody: data.body
      },
      options
    );
  }

  updateVerificationFlow(data: OryUpdateVerificationFlowRequest, options?: OryAxiosRequestConfig) {
    return this._repository.updateVerificationFlow(
      {
        flow: data.flowId,
        cookie: data.cookie,
        updateVerificationFlowBody: {
          ...data.body,
          // Currently, Ory only supports `link` method: @ory/client@1.1.23
          method: 'link'
        }
      },
      options
    );
  }
}

const frontendApi = new FrontendApiRepository(KratosFrontendApi);
export { frontendApi };
