import { HttpStatus } from '@nestjs/common';
import { CookieOptions } from 'express';
import { IncomingHttpHeaders } from 'http';

import { AuthenticationStatus } from 'Common/constants/OpenFlowFileConstants';

import {
  IGoogleQueryDto, IGoogleRedirectQueryDto, IGoogleRedirectState, IGoogleStateQuery,
} from 'OpenGoogle/dtos/OpenGoogle.dto';

export type OpenGoogleTokens = {
  google: {
    accessTokenData: string;
  };
}

export type TCookieValue = { value: string, options?: Omit<CookieOptions, 'maxAge' | 'sameSite'> & {
  maxAge: number, sameSite?: boolean | 'lax' | 'strict' | 'none' } };

export type TCookiesResult = Record<string, TCookieValue>;

export type OpenGoogleReturn = {
  nextUrl: string;
  statusCode: HttpStatus;
  cookies?: TCookiesResult;
}

export type TUserCredentials = {
  name?: string;
  email: string;
  accessToken: string;
  fileId: string;
  scope: string;
  expireAt: number;
  userRemoteId?: string;
}

export type TGoogleTokenPayload = {
  accessToken: string;
  scope: string;
  email: string;
  expireAt: number;
  userRemoteId: string;
}

export type TSignaturePayload = {
  state: IGoogleStateQuery,
  loginHint?: string
  flowId?: string;
  authStatus?: AuthenticationStatus;
  referer?: string;
}

export type TInitGoogleFlow = {
  anonymousUserId: string;
  query: IGoogleQueryDto;
  accessTokenData?: TGoogleTokenPayload;
  headers: IncomingHttpHeaders;
  flowId?: string;
}

export type TValidateTokenHandler = {
  headers: IncomingHttpHeaders;
  anonymousUserId: string;
  query: IGoogleQueryDto;
  accessToken: string;
  flowId: string;
}

export type TRedirectGoogleFlow = {
  anonymousUserId: string;
  query: IGoogleRedirectQueryDto
  accessTokenData?: TGoogleTokenPayload;
  headers: IncomingHttpHeaders;
}

export type TPostAuthHandler = {
  accessTokenData: TGoogleTokenPayload;
  anonymousUserId: string;
  state: IGoogleRedirectState;
  headers: IncomingHttpHeaders;
  loginHint?: string;
  flowId?: string;
}

export enum OpenGoogleVariant {
  Redirect = 'redirect',
  Popup = 'popup',
}
