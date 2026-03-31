import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type TGoogleEventAttributes = {
  level: 'info' | 'error';
  context: string;
  anonymousUserId: string;
  userAgent: string;
  data: Record<string, any>;
  version: string;

  userId?: string;
  errorCode?: string;
  error?: string;
  stack?: string;
};

export const OpenGoogleEventType = {
  DEFAULT: 'openWithRedirectFlow',
  USER_SIGN_UP: 'userSignUp',
  USER_SIGN_IN: 'userSignIn',
};

export class OpenGoogleEvent extends PinpointEvent<TGoogleEventAttributes> {
  protected construct(attributes: TGoogleEventAttributes, eventType?: string): TConstructEvent {
    return {
      EventType: eventType || OpenGoogleEventType.DEFAULT,
      Attributes: this.standardize(attributes),
    };
  }
}
