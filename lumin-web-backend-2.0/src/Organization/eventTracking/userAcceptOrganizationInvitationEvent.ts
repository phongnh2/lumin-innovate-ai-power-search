import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type UserAcceptOrganizationInvitationEventAttributes = {
  targetOrganizationId: string;
  organizationUserInvitationId: string;
  LuminUserId: string;
  anonymousUserId?: string;
  userAgent?: string;
};

const USER_ACCEPT_ORGANIZATION_INVITATION_EVENT_TYPE = 'userAcceptOrganizationInvitation';

export class UserAcceptOrganizationInvitationEvent extends PinpointEvent<UserAcceptOrganizationInvitationEventAttributes> {
  constructor(attributes: UserAcceptOrganizationInvitationEventAttributes) {
    super(attributes, USER_ACCEPT_ORGANIZATION_INVITATION_EVENT_TYPE);
  }

  protected construct(
    attributes: UserAcceptOrganizationInvitationEventAttributes,
    eventType: string,
  ): TConstructEvent {
    return {
      EventType: eventType || USER_ACCEPT_ORGANIZATION_INVITATION_EVENT_TYPE,
      Attributes: this.standardize(attributes),
    };
  }
}
