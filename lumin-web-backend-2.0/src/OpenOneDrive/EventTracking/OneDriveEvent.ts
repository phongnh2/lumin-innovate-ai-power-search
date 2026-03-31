import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type OneDriveEventAttributes = {
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

export const OpenOneDriveEventType = {
  DEFAULT: 'openOneDriveFlow',
  USER_SIGN_UP: 'userSignUp',
  USER_SIGN_IN: 'userSignIn',
};

export class OneDriveEvent extends PinpointEvent<OneDriveEventAttributes> {
  protected construct(attributes: OneDriveEventAttributes, eventType?: string): TConstructEvent {
    return {
      EventType: eventType || OpenOneDriveEventType.DEFAULT,
      Attributes: this.standardize(attributes),
    };
  }
}
