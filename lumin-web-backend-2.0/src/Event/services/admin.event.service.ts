import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

import EventConstants from 'Common/constants/EventConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { EventBody } from 'Event/builders/event.builder.interface';
import {
  AdminActionEvent,
  AdminEventNameType,
  EventScopes,
  OrgActionEvent,
  PlanActionEvent,
  SourceActions,
  UserActionEvent,
} from 'Event/enums/event.enum';
import {
  IAdminEvent,
  IElasticSearchResult,
  IGetAdminEventInput,
} from 'Event/interfaces/event.interface';
import { AdminEventsConnection, IAdminEventService } from 'Event/interfaces/rolebase.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { AdminEventMetadata, SortStrategy, TargetFilter } from 'graphql.schema';
import { OpenSearchSerivce } from 'Opensearch/openSearch.service';

@Injectable()
export class AdminEventService implements IAdminEventService {
  protected indexName: string;

  constructor(
    protected readonly eventService: EventServiceFactory,
    private readonly openSearchService: OpenSearchSerivce,
  ) {
    this.indexName = EventConstants.EVENT_INDEX;
  }

  createEvent(eventData: EventBody): Promise<Record<string, any> | null> {
    return this.eventService.createElasticsearchEvent(eventData);
  }

  private getEventNamesByTargetFilter(targetFilterOptions: TargetFilter): AdminEventNameType[] {
    let includedEvents: AdminEventNameType[];
    const { orgId, adminId, userId } = targetFilterOptions;
    if (orgId) {
      includedEvents = [...Object.values(OrgActionEvent), ...Object.values(PlanActionEvent)];
    }
    if (adminId) {
      includedEvents = Object.values(AdminActionEvent);
    }
    if (userId) {
      includedEvents = Object.values(UserActionEvent);
    }
    return includedEvents;
  }

  private getMainSearchQuery(data: IGetAdminEventInput): Record<string, unknown> {
    const {
      filterOptions = {}, sortOptions, offset, limit,
    } = data;
    const {
      type, createdDateRange = {}, target = {}, actorId, isSystem,
    } = filterOptions;
    const { startDate, endDate = new Date() } = createdDateRange;
    const { orgId, adminId, userId } = target;
    const dateSortStrategy = sortOptions?.createdAt || SortStrategy.DESC;
    const eventScopes = [EventScopes.SYSTEM];
    const sourceActions = [
      SourceActions.CUSTOM_ORG_CONVERTED_TO_MAIN,
      SourceActions.ORGANIZATION_DELETED,
      SourceActions.USER_DELETED,
    ];
    const hasNonOrgTargetFilter = Boolean(adminId || userId);
    let includedEvents = this.getEventNamesByTargetFilter(target);

    if (!isSystem) {
      eventScopes.push(EventScopes.ADMIN);
    }
    if (type) {
      includedEvents = ElasticsearchUtil.mapAdminEventTypeToNameList(type).filter(
        (eventType) => !includedEvents || includedEvents.includes(eventType),
      );
    }

    const dateRangeFilterCondition = {
      lte: moment(endDate),
      ...(startDate && {
        gte: moment(startDate),
      }),
    };
    const mainSearchQuery = {
      index: this.indexName,
      from: offset || 0,
      size: limit || EventConstants.MAXIMUM_SEARCHED_EVENTS,
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    { terms: { 'actor_event_scope.keyword': eventScopes } },
                    { terms: { actor_event_scope: eventScopes } },
                  ],
                },
              },
              {
                // exclude events triggered by other events
                bool: {
                  must_not: [
                    { terms: { 'source_action.keyword': sourceActions } },
                    { terms: { source_action: sourceActions } },
                  ],
                },
              },
              (includedEvents ? {
                bool: {
                  should: [
                    { terms: { 'event_name.keyword': includedEvents } },
                    { terms: { event_name: includedEvents } },
                  ],
                },
              } : {
                bool: {},
              }),
              (actorId ? { term: { 'actor._id': actorId } } : { bool: {} }),
              (orgId ? { term: { 'organization._id': orgId } } : { bool: {} }),
              (hasNonOrgTargetFilter ? { term: { 'target._id': adminId || userId } } : { bool: {} }),
              {
                range: {
                  event_time: dateRangeFilterCondition,
                },
              },
            ],
          },
        },
        sort: [{ event_time: { numeric_type: 'date', order: dateSortStrategy.toLowerCase() } }],
      },
    };

    return mainSearchQuery;
  }

  async getAllAdminEvents(data: IGetAdminEventInput): Promise<AdminEventsConnection> {
    const { filterOptions = {}, limit } = data;
    const { type } = filterOptions;
    if (limit && !Utils.validateNumberRange(limit, EventConstants.MINIMUM_SEARCHED_EVENTS, EventConstants.MAXIMUM_SEARCHED_EVENTS)) {
      throw GraphErrorException.BadRequest('The limitation of event list must be between 0 and 101');
    }

    const mainSearchQuery = this.getMainSearchQuery(data);
    const { body: searchResults } = await this.openSearchService.search(mainSearchQuery);
    const extractedSearchResults = ElasticsearchUtil.extractEventBody(searchResults.hits.hits as IElasticSearchResult[]) as IAdminEvent[];

    // get events triggering side effect (create another event)
    const sourceEvents = extractedSearchResults.filter((result) => (result.eventName in SourceActions));
    const triggeredEvents = await this.getTriggeredEvents(sourceEvents);

    this.addMetadataToSearchResults(extractedSearchResults, triggeredEvents);

    return {
      eventList: extractedSearchResults.map((response) => ({
        ...response,
        type: type || ElasticsearchUtil.getAdminEventType(response.eventName),
      } as IAdminEvent)),
      total: searchResults.hits.total.value,
    };
  }

  private async getTriggeredEvents(sourceEvents: IAdminEvent[]): Promise<IAdminEvent[]> {
    const sourceEventIds = sourceEvents.map((event) => event._id);
    const searchTriggeredEventQuery = {
      index: this.indexName,
      body: {
        query: {
          bool: {
            // get events triggered by other events
            should: [
              { terms: { 'source_event_id.keyword': sourceEventIds } },
              { terms: { source_event_id: sourceEventIds } },
            ],
          },
        },
      },
    };

    const { body: searchResultMetadata } = await this.openSearchService.search(searchTriggeredEventQuery);

    return ElasticsearchUtil.extractEventBody(searchResultMetadata.hits.hits as IElasticSearchResult[]) as IAdminEvent[];
  }

  private addMetadataToSearchResults(
    searchResults: IAdminEvent[],
    metadataEvents: IAdminEvent[],
  ): void {
    metadataEvents.forEach((event) => {
      const {
        eventName, organization: metadataOrg, sourceAction, sourceEventId,
      } = event;
      let metadata: AdminEventMetadata;

      // this source action triggers converting main to custom organization
      if (eventName === OrgActionEvent.MAIN_ORG_CONVERTED_TO_CUSTOM
          && sourceAction === SourceActions.CUSTOM_ORG_CONVERTED_TO_MAIN) {
        metadata = { affectedOrg: metadataOrg };
      }

      // this source action triggers blacklisting organization
      if (eventName === OrgActionEvent.ORGANIZATION_BLACKLISTED
          && sourceAction === SourceActions.ORGANIZATION_DELETED) {
        metadata = { isBlacklisted: true };
      }

      // this source action triggers blacklisting user email
      if (eventName === UserActionEvent.USER_BLACKLISTED
          && sourceAction === SourceActions.USER_DELETED) {
        metadata = { isBlacklisted: true };
      }

      const updatedSearchResult = searchResults.find((result) => result._id === sourceEventId);
      if (updatedSearchResult) {
        updatedSearchResult.metadata = metadata;
      }
    });
  }
}
