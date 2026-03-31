import { AdminEventNameType, EventScopeType, SourceActions } from 'Event/enums/event.enum';
import { IEventOrganization, IEventUser, IEventCommunityTemplate } from 'Event/interfaces/event.interface';
import { AdminEventMetadata } from 'graphql.schema';

export type IEventUserInput = {
  _id: string;
  name: string;
  email: string;
  avatarRemoteId: string;
}

export type BaseAdminEventBody = {
  eventName: AdminEventNameType;
  eventTime: Date;
  sourceAction?: SourceActions;
  sourceEventId?: string;
}

export type OrgEventBody = BaseAdminEventBody & {
  actor?: IEventUser;
  organization: Partial<IEventOrganization>;
  actorEventScope: EventScopeType[];
  metadata?: AdminEventMetadata;
}

export type AdminEventBody = BaseAdminEventBody & {
  actor: IEventUser;
  target: Partial<Omit<IEventUser, 'email'>> & { email: string };
  actorEventScope: EventScopeType[];
}

export type CommunityTemplateBody = BaseAdminEventBody & {
  actor: IEventUser;
  communityTemplate: IEventCommunityTemplate;
  actorEventScope: EventScopeType[];
};

export type UserEmailChangedEventMetadata = {
  newEmail: string;
  userId: string;
}

export type UserEventMetadata = {
  emailChanged: UserEmailChangedEventMetadata
}

export type UserEventBody = AdminEventBody & { metadata: UserEventMetadata }

export type EventBody = OrgEventBody | AdminEventBody | CommunityTemplateBody;
