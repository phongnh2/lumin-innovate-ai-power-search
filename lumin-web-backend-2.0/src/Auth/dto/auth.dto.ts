import { Platforms } from 'Common/constants/Platform';

import { LoginService } from 'graphql.schema';

/* eslint-disable camelcase */
export interface Identity {
  id: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
  traits: {
    email: string
    name: string
    avatarRemoteId: string
    sub: string
    loginService: LoginService
    fromInvitation: boolean
  }
}
export interface KratosRegistrationCallbackDto {
  identity: Identity
  transientPayload?: Record<string, unknown>
}
/* eslint-enable camelcase */

export interface HandleKratosRegistrationCallbackDto {
  // kratos identity id
  identityId: string
  email: string
  name: string
  isVerified: boolean
  loginType?: LoginService
  appleUserId?: string
  userOrigin?: string
  platform?: Platforms
  userAgent?: string
  anonymousUserId?: string
}
