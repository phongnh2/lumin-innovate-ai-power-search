/* eslint-disable no-use-before-define */
import { DocumentAnnotationTypeEnum } from 'Document/document.annotation.enum';
import { IDocumentForm } from 'Document/interfaces/document.interface';
import {
  AdminEventNameType, EventNameType, EventScopeType, SourceActions,
} from 'Event/enums/event.enum';
import {
  AdminEventMetadata,
  AdminEventType,
  Document,
  EventFilterOptions,
  EventSortOptions,
  Team,
} from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { PaymentCurrencyEnums, PaymentPeriodEnums } from 'Payment/payment.enum';
import { TeamProviderType } from 'Team/team.enum';
import { User } from 'User/interfaces/user.interface';

/* eslint-disable camelcase */
export interface IEventUser {
  _id?: string;
  name?: string;
  email: string;
  avatarRemoteId?: string;
  modification?: IEventActorModification;
  transactionalEmail?: ITransactionalEmail;
}

export interface IDocumentComment {
  _id: string;
  content: string;
}

export interface IAnnotationData {
  _id: string;
  type: DocumentAnnotationTypeEnum;
}

export interface IEventDocument {
  _id: string;
  name: string;
  s3RemoteId?: string;
  comment?: IDocumentComment;
  annotation?: IAnnotationData;
}

export interface IEventActorModification {
  plan?: string;
  planCharge?: number;
  cancelPlanReason?: string;
  adminRole?: string,
}

export interface IEventTeamModification extends IEventActorModification {
  memberRole?: TeamProviderType;
}

export interface IEventOrgPlanModification {
  previousPlan?: string;
  previousCharge?: number;
  plan: string;
  planCharge?: number;
  cancelPlanReason?: string;
  currency?: PaymentCurrencyEnums;
  docStack?: number;
  period?: PaymentPeriodEnums;
}

export interface IEventTeam {
  _id: string;
  name: string;
  modification?: IEventTeamModification;
}

export interface IEventOrganization {
  _id: string;
  name: string;
  domain: string;
  planModification: IEventOrgPlanModification;
}

export interface IEventBody {
  _id?: string;
  eventName: EventNameType | AdminEventNameType;
  eventTime: Date;
  actor?: IEventUser;
  target?: IEventUser;
  document?: IEventDocument;
  team?: IEventTeam;
  organization?: Partial<IEventOrganization>;
  communityTemplate?: IEventCommunityTemplate;
  actorEventScope?: EventScopeType[];
  targetEventScope?: EventScopeType[];
  sourceAction?: SourceActions;
  template?: IEventTemplate;
}

export interface IElasticSearchCreateEvent {
  index: string;
  body: IEventBody;
}

export interface ICreateEventInput {
  eventName: EventNameType;
  eventScope: EventScopeType;
  actor?: Partial<User>;
  target?: Partial<User>;
  nonLuminEmail?: string;
  document?: Document;
  template?: IDocumentForm;
  documentComment?: IDocumentComment;
  annotationData?: IAnnotationData;
  team?: Team;
  actorModification?: IEventActorModification;
  teamModification?: IEventTeamModification;
  orgModification?: IEventOrgPlanModification;
  organization?: Partial<IOrganization>;
  transactionalEmail?: ITransactionalEmail;
  sourceAction?: SourceActions;
}

export interface ITransactionalEmail {
  subject: string;
}

export interface IGetEventInput {
  clientId: string;
  limit?: number;
  excludedEvents?: EventNameType[];
}

export interface IAdminEvent extends Omit<IEventBody, 'eventName'> {
  eventName: AdminEventNameType;
  sourceEventId: string;
  type: AdminEventType;
  metadata?: AdminEventMetadata;
}

export type IGetAdminEventInput = Partial<{
  filterOptions: EventFilterOptions;
  sortOptions: EventSortOptions;
  offset: number;
  limit: number;
  excludedEvents: EventNameType[];
}>

export interface IElasticSearchResult {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: IEventBody;
}

export interface IMonthlyDerivativeDocumentsStat {
  newDocumentTotal: number;
  derivativeDocumentNumber: number;
  derivativeRate: number;
}

export interface IMonthlyDerivativeCommentsStat {
  newCommentTotal: number;
  derivativeCommentNumber: number;
  derivativeRate: number;
}

export interface IMonthlyDerivativeSignaturesStat {
  newSignatureTotal: number;
  derivativeSignatureNumber: number;
  derivativeRate: number;
}

export interface IMonthlyDerivativeAnnotationsStat {
  newAnnotationTotal: number;
  derivativeAnnotationNumber: number;
  derivativeRate: number;
}

export interface IMonthlyDerivativeMembersStat {
  newMemberTotal: number;
  derivativeMemberNumber: number;
  derivativeRate: number;
}

export interface IMonthlyDerivativeTeamsStat {
  newTeamTotal: number;
  derivativeTeamNumber: number;
  derivativeRate: number;
}

export interface IEventBodyWithScrolling {
  scrollId: string;
  events: IEventBody[];
}

export interface IScrollingData {
  scrollId: string;
  scroll: string;
}

export interface ICommonInsightInput {
  clientId: string;
  memberIds?: string[];
}

export interface IEventCommunityTemplate {
  _id: string;
  name: string;
  type?: string;
}

export interface IEventTemplate {
  luminDocumentformId: string;
  prismicId: string;
  url: string;
  prismicCategories: string[];
  s3RemoteId: string;
}
