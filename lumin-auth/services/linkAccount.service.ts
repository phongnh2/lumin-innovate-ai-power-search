import { IdentityCredentialsOidcProvider } from '@ory/client';
import jwtDecode from 'jwt-decode';

import { OIDC_PROVIDER_TO_LOGIN_SERVICE } from '@/constants/auth';
import { AfterLinkAccountCallback } from '@/interfaces/auth';
import { Identity, OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { identityApi } from '@/lib/ory';

import { authService } from './auth.service';

class LinkAccountService {
  async verifyLinkedEmail(identity: Identity, credentials: IdentityCredentialsOidcProvider): Promise<void> {
    if (!credentials?.initial_id_token) {
      throw new Error('Initial id token not found');
    }

    const idTokenPayload = jwtDecode(credentials.initial_id_token) as { email: string; preferred_username: string };
    let email: string;
    switch (credentials.provider) {
      case OryProvider.Google:
        email = idTokenPayload.email;
        break;
      case OryProvider.Microsoft:
        email = idTokenPayload.preferred_username.toLowerCase();
        break;
      case OryProvider.Xero:
        email = idTokenPayload.email;
        break;
      default:
        email = idTokenPayload.email;
    }

    if (identity.traits.email !== email) {
      throw new Error('Wrong email linked');
    }
  }

  async adaptNewCredential({ identity, linkedCredential, currentCredential }: AfterLinkAccountCallback): Promise<void> {
    const newProvider = linkedCredential.provider as OryProvider;

    await this.verifyLinkedEmail(identity, linkedCredential);

    const currentLoginService = identity.traits.loginService;
    if (!currentLoginService) {
      throw new Error('Current login service is not set');
    }

    const newLoginService = OIDC_PROVIDER_TO_LOGIN_SERVICE[newProvider];
    if (!newLoginService) {
      throw new Error('Cannot determine new login service');
    }

    await authService.updateIdentityLoginService({ identity, loginService: newLoginService, updatedSub: linkedCredential.subject });

    switch (currentLoginService) {
      case LoginService.GOOGLE:
      case LoginService.DROPBOX:
      case LoginService.MICROSOFT:
      case LoginService.XERO: {
        if (!currentCredential) {
          throw new Error('Current credential not found');
        }
        await identityApi.deleteIdentityCredential(identity.id, currentCredential);
        break;
      }
      case LoginService.EMAIL_PASSWORD: {
        // No action needed
        break;
      }
    }
  }
}

export const linkAccountService = new LinkAccountService();
