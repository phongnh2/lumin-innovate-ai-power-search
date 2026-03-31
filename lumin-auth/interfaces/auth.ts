import { IdentityCredentialsOidcProvider } from '@ory/client';

import { Identity, SelfServiceFlow } from './ory';

export interface SignUpWithInvitationPayload {
  flow: SelfServiceFlow;
  password: string;
  name: string;
  token: string;
}

export enum UserInvitationTokenType {
  CIRCLE_INVITATION = 'circle_invitation',
  SHARE_DOCUMENT = 'share_document'
}

export enum InvitationTokenStatus {
  EXPIRED = 'invitation_expired',
  VALID = 'invitation_valid',
  INVALID = 'invitation_invalid',
  REMOVED = 'invitation_removed'
}

export interface AfterLinkAccountCallback {
  identity: Identity;
  currentCredential?: IdentityCredentialsOidcProvider;
  linkedCredential: IdentityCredentialsOidcProvider;
}
