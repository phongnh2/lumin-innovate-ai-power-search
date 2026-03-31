import {
  AcceptOAuth2LoginRequest,
  OAuth2LoginRequest,
  OAuth2LogoutRequest,
  OAuth2Api,
  AcceptOAuth2ConsentRequest,
  OAuth2RedirectTo,
  OAuth2ConsentRequest,
  RejectOAuth2Request
} from '@ory/client';

import { environment } from '@/configs/environment';
import { ExceptionHandler } from '@/lib/decorators/exception.decorator';
import { oryExceptionHandler } from '@/lib/exceptions/ory.exception';

import { OryRepository } from './ory-repository';

@ExceptionHandler(oryExceptionHandler)
class OAuth2ApiRepository extends OryRepository<OAuth2Api> {
  constructor() {
    super(OAuth2Api, {
      basePath: environment.public.host.hydraPublicUrl,
      baseOptions: {
        headers: {
          Authorization: `Bearer ${environment.internal.ory.adminApiKey}`
        }
      }
    });
  }

  public async getOAuth2ConsentRequest(challenge: string): Promise<OAuth2ConsentRequest> {
    const { data } = await this._repository.getOAuth2ConsentRequest({
      consentChallenge: challenge
    });
    return data;
  }

  public async getOAuth2LoginRequest(challenge: string): Promise<OAuth2LoginRequest> {
    const { data } = await this._repository.getOAuth2LoginRequest({
      loginChallenge: challenge
    });
    return data;
  }

  public async getOAuth2LogoutRequest(challenge: string): Promise<OAuth2LogoutRequest> {
    const { data } = await this._repository.getOAuth2LogoutRequest({
      logoutChallenge: challenge
    });
    return data;
  }

  public async acceptOAuth2LoginRequest(challenge: string, acceptOAuth2LoginRequest: AcceptOAuth2LoginRequest): Promise<OAuth2RedirectTo> {
    const { data } = await this._repository.acceptOAuth2LoginRequest({
      loginChallenge: challenge,
      acceptOAuth2LoginRequest
    });
    return data;
  }

  public async acceptOAuth2ConsentRequest(challenge: string, acceptOAuth2ConsentRequest: AcceptOAuth2ConsentRequest): Promise<OAuth2RedirectTo> {
    const { data } = await this._repository.acceptOAuth2ConsentRequest({
      consentChallenge: challenge,
      acceptOAuth2ConsentRequest
    });
    return data;
  }

  public async rejectOAuth2ConsentRequest(challenge: string, rejectOAuth2ConsentRequest: RejectOAuth2Request): Promise<OAuth2RedirectTo> {
    const { data } = await this._repository.rejectOAuth2ConsentRequest({
      consentChallenge: challenge,
      rejectOAuth2Request: rejectOAuth2ConsentRequest
    });
    return data;
  }

  public async acceptOAuth2LogoutRequest(challenge: string): Promise<OAuth2RedirectTo> {
    const { data } = await this._repository.acceptOAuth2LogoutRequest({
      logoutChallenge: challenge
    });
    return data;
  }

  public async rejectOAuth2LogoutRequest(challenge: string): Promise<void> {
    await this._repository.rejectOAuth2LogoutRequest({
      logoutChallenge: challenge
    });
  }
}

export const oauth2Api = new OAuth2ApiRepository();
