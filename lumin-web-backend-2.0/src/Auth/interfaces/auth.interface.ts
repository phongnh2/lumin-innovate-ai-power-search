/* eslint-disable no-use-before-define */
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { AuthenType } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

export interface ILoginWithGoogleInput {
  idToken: string;
  platform: string;
  timezoneOffset: number;
  grpcClientIdentifier?: string;
  context?: AuthenType;
  invitationToken?: string;
  userOrigin?: string;
  browserLanguageCode?: string;
}

export interface ILoginWithGoogleV2Input {
  googleEmail: string;
  timezoneOffset: number;
}

export interface ISignUpWithDropBoxInput {
  code: string,
  timezoneOffset: number,
  context?: AuthenType,
  userOrigin?: string,
  invitationToken?: string,
  browserLanguageCode?: string;
}

export interface ISignUpWithThirdPartyInput {
  email: string,
  name: string,
  timezoneOffset: number,
  eventData: ICreateEventInput,
  context: AuthenType,
  loginType?: string,
  userOrigin?: string,
  invitationToken?: string,
}

export enum UserInvitationTokenType {
  CIRCLE_INVITATION = 'circle_invitation',
  SHARE_DOCUMENT = 'share_document',
}

export interface IVerifyUserInvitationResult {
  isSignedUp: boolean;
  status: InvitationTokenStatus;
  data: IUserInvitationToken & {
    metadata: {
      orgName?: string;
      orgUrl?: string;
      user?: Pick<User, 'isVerified' | 'identityId' | '_id'>;
      invitationId?: string;
    };
  };
  error: {
    message: string;
    code: string;
  }
}
// The payload of invitation token. Consider to add new field due to additional data in token.
export interface IUserInvitationToken {
  type: UserInvitationTokenType,
  email: string;
  metadata: {
    orgId?: string;
    documentId?: string;
    isSameUnpopularDomain?: boolean;
  }
}

export enum InvitationTokenStatus {
  EXPIRED = 'invitation_expired',
  VALID = 'invitation_valid',
  INVALID = 'invitation_invalid',
  REMOVED = 'invitation_removed',
}
