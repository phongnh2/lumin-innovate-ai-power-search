// Based on @ory/client@1.1.23
import {
  IdentityApi as KratosIdentityApi,
  CreateIdentityBodyStateEnum,
  IdentityWithCredentialsPassword,
  VerifiableIdentityAddress,
  IdentityApiListIdentitiesRequest,
  JsonPatch,
  IdentityCredentialsOidcProvider,
  UpdateIdentityBodyStateEnum
} from '@ory/client';
import { AxiosRequestConfig } from 'axios';
import { merge } from 'lodash';
import { v4 as uuidV4 } from 'uuid';

import { environment } from '@/configs/environment';
import { Identity, OryAxiosRequestConfig, Traits } from '@/interfaces/ory';
import { ExceptionHandler } from '@/lib/decorators/exception.decorator';
import { oryExceptionHandler } from '@/lib/exceptions/ory.exception';
import sanitizedAxiosInstance from '@/lib/exceptions/sanitizedAxios';

import { OryAdminRepository } from './ory-admin-repository';

type TCreateIdentityOptions = {
  verified?: boolean;
  withPassword?: boolean;
};

type TCreateIdentity = {
  body: {
    traits: Traits & Required<Pick<Traits, 'loginService'>>;
    state?: CreateIdentityBodyStateEnum;
    password?: string;
  };
  options?: TCreateIdentityOptions;
};

type TPatchIdentity = {
  id: string;
  jsonPatch: JsonPatch[];
};

/**
 * IdentityApiRepository - (admin api)[https://www.ory.sh/docs/kratos/reference/api#tag/identity]
 * `IdentityApiRepository` will be used to manage identities by admin.
 * @class IdentityApiRepository
 * @extends {OryRepository<KratosIdentityApi>}
 */
@ExceptionHandler(oryExceptionHandler)
class IdentityApiRepository extends OryAdminRepository<KratosIdentityApi> {
  async getIdentity(
    payload: { identityId: string; includeCredential?: Array<'password' | 'totp' | 'oidc' | 'webauthn' | 'lookup_secret' | 'saml'> },
    options?: OryAxiosRequestConfig
  ): Promise<Identity> {
    const { identityId, includeCredential = [] } = payload;
    const { data: identity } = await this._repository.getIdentity(
      {
        id: identityId,
        includeCredential
      },
      options
    );
    return identity;
  }

  async updateIdentity(
    payload: { identityId: string; state?: UpdateIdentityBodyStateEnum; traits: Partial<Traits>; metadata_public?: Record<string, unknown> },
    options?: OryAxiosRequestConfig
  ): Promise<Identity> {
    const { identityId, state, traits, metadata_public } = payload;
    const { data: identity } = await this._repository.updateIdentity(
      {
        id: identityId,
        updateIdentityBody: {
          state: state || UpdateIdentityBodyStateEnum.Active,
          schema_id: environment.internal.ory.userSchema,
          traits: traits,
          ...(metadata_public && { metadata_public })
        }
      },
      options
    );

    return identity;
  }

  async createIdentity(payload: TCreateIdentity, options?: OryAxiosRequestConfig): Promise<Identity> {
    const { state, traits, password } = payload.body;

    const createOptions: TCreateIdentityOptions = merge({}, { verified: false, withPassword: false } as Required<TCreateIdentityOptions>, payload.options);

    let verifiable_addresses: VerifiableIdentityAddress[] | undefined;

    if (createOptions.verified) {
      verifiable_addresses = [
        {
          id: uuidV4(),
          value: traits.email,
          verified: true,
          via: 'email',
          status: 'completed'
        }
      ];
    }

    let credentials: { password: IdentityWithCredentialsPassword } | undefined;

    if (createOptions.withPassword) {
      credentials = {
        password: {
          config: {
            password
          }
        }
      };
    }

    const { data: identity } = await this._repository.createIdentity(
      {
        createIdentityBody: {
          state,
          schema_id: environment.internal.ory.userSchema,
          traits,
          verifiable_addresses,
          credentials
        }
      },
      options
    );

    return identity;
  }

  async revokeAllSession(identityId: string, options?: OryAxiosRequestConfig): Promise<void> {
    await this._repository.deleteIdentitySessions(
      {
        id: identityId
      },
      options
    );
  }

  listIdentities(query: IdentityApiListIdentitiesRequest, options?: AxiosRequestConfig) {
    return this._repository.listIdentities(query, options);
  }

  async listIdentitiesByEmail(email: string): Promise<Identity[]> {
    const { data: identities } = await this.listIdentities({ credentialsIdentifier: email });
    return identities;
  }

  async createRecoveryLink(identityId: string): Promise<string> {
    const {
      data: { recovery_link }
    } = await this._repository.createRecoveryLinkForIdentity({
      createRecoveryLinkForIdentityBody: {
        expires_in: '5m',
        identity_id: identityId
      }
    });
    return recovery_link;
  }

  async patchIdentity(payload: TPatchIdentity, options?: OryAxiosRequestConfig): Promise<Identity> {
    const { data: identity } = await this._repository.patchIdentity(
      {
        id: payload.id,
        jsonPatch: payload.jsonPatch
      },
      options
    );

    return identity;
  }

  async updateAvatarRemoteId(identityId: string, value: string, options?: OryAxiosRequestConfig): Promise<Identity> {
    return this.patchIdentity(
      {
        id: identityId,
        jsonPatch: [{ op: 'add', path: '/traits/avatarRemoteId', value }]
      },
      options
    );
  }

  /**
   *  Temporary method to delete identity credentials
   *  This method will be updated once the client package is updated
   */
  async deleteIdentityCredential(identityId: string, credentials: IdentityCredentialsOidcProvider) {
    const identifier = `${credentials.provider}:${credentials.subject}`;
    return sanitizedAxiosInstance.delete(`${environment.public.host.kratosUrl}/admin/identities/${identityId}/credentials/oidc?identifier=${identifier}`, {
      headers: {
        Authorization: `Bearer ${environment.internal.ory.adminApiKey}`
      }
    });
  }
}

export const identityApi = new IdentityApiRepository(KratosIdentityApi);
