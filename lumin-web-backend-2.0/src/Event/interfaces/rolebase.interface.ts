import { INonDocumentInsight, IDocumentInsight, IDocumentSummary } from 'Dashboard/interfaces/dashboard.interface';
import { OrgEventBody } from 'Event/builders/event.builder.interface';
import { EventNameType } from 'Event/enums/event.enum';
import {
  IEventBody,
  ICreateEventInput,
  IGetEventInput,
  IGetAdminEventInput,
  IAdminEvent,
  ICommonInsightInput,
} from 'Event/interfaces/event.interface';

export interface GetBasicFilterQueryInput {
  clientId: string;
  includedEvents?: EventNameType[];
  excludedEvents?: EventNameType[];
  dateRange?: Record<string, string>;
}

export interface GetBasicOrgQueryInput extends GetBasicFilterQueryInput {
  memberIds: string[];
}

export interface AdminEventsConnection {
  eventList: IAdminEvent[];
  total: number;
}

export interface IEventService {
  getEventBody(eventData: ICreateEventInput): Promise<IEventBody>;
  getBasicFilterQuery(data: GetBasicFilterQueryInput | GetBasicOrgQueryInput): Record<string, unknown>;
  getEventByClientId(data: IGetEventInput): Promise<IEventBody[]>;
  getDocumentInsightStats(clientId: string): Promise<IDocumentInsight>;
  removeAllEvents(clientId: string): Promise<boolean>;
}

export interface IPersonalEventService extends IEventService {
  exportData(userId: string): Promise<string[]>;
  isExistedUseDocumentEvent(userId: string, documentId: string): Promise<boolean>;
}

export interface IOrganizationEventService extends IEventService {
  getNonDocumentInsightStats(orgId: string): Promise<INonDocumentInsight>;
  getOrgDocumentSummary(data: ICommonInsightInput): Promise<Partial<IDocumentSummary>>;
  sortOrgListByLatestActivity(orgIds: string[]): Promise<string[]>;
}

export interface IAdminEventService {
  createEvent(eventData: OrgEventBody): Promise<Record<string, any> | null>;
  getAllAdminEvents(data: IGetAdminEventInput): Promise<AdminEventsConnection>;
}
