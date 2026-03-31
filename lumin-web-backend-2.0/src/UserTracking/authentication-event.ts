import { Platforms } from 'Common/constants/Platform';

import { LoginService } from 'graphql.schema';
import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export const AuthenticationMethod = {
  [LoginService.GOOGLE]: 'Google',
  [LoginService.DROPBOX]: 'Dropbox',
  [LoginService.EMAIL_PASSWORD]: 'UsernamePassword',
  [LoginService.MICROSOFT]: 'Microsoft',
  [LoginService.XERO]: 'Xero',
  [LoginService.APPLE]: 'Apple',
};

export type TAuthenticationMethod = typeof AuthenticationMethod[keyof typeof AuthenticationMethod];

export type TAuthenticationEventAttributes = {
  LuminUserId: string;
  method: TAuthenticationMethod;
  platform?: Platforms;
  userAgent?: string;
  anonymousUserId?: string;
};

export const AuthenticationEventType = {
  ACCOUNT_CREATED: 'accountCreated',
};

export class AuthenticationEvent extends PinpointEvent<TAuthenticationEventAttributes> {
  protected construct(attributes: TAuthenticationEventAttributes, eventType: string): TConstructEvent {
    return {
      EventType: eventType,
      Attributes: this.standardize(attributes),
    };
  }
}
