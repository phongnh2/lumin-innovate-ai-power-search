/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/require-await */
import {
  forwardRef, Inject, Injectable,
} from '@nestjs/common';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as moment from 'moment';
import { Readable } from 'stream';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import EventConstants from 'Common/constants/EventConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { IPersonalDocumentInsight, IPersonalDocumentSummary } from 'Dashboard/interfaces/dashboard.interface';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { EventExporterFactory } from 'Event/classes/EventExporter/EventExporterFactory';
import {
  DocumentEventNames, EventNameType, EventScopes, NonDocumentEventNames, EventScopeType,
} from 'Event/enums/event.enum';
import {
  IEventBody,
  ICreateEventInput,
  IGetEventInput,
  IEventBodyWithScrolling,
  IScrollingData,
  IElasticSearchResult,
} from 'Event/interfaces/event.interface';
import { GetBasicFilterQueryInput, IEventService } from 'Event/interfaces/rolebase.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { RedisService } from 'Microservices/redis/redis.service';
import { OpenSearchSerivce } from 'Opensearch/openSearch.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class PersonalEventService implements IEventService {
  protected indexName: string;

  constructor(
    protected readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    protected readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => EventServiceFactory))
    protected readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => EnvironmentService))
    private readonly environmentService: EnvironmentService,
    private readonly openSearchService: OpenSearchSerivce,
  ) {
    this.indexName = EventConstants.EVENT_INDEX;
  }

  protected getExactEventScopeQuery(userId: string, scopes: EventScopeType[], exact: boolean = false): Record<string, unknown> {
    return {
      bool: {
        should: [
          {
            bool: {
              must: [
                {
                  term: { 'actor._id': userId },
                },
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          should: [
                            { terms: { 'actor_event_scope.keyword': scopes } },
                            { terms: { actor_event_scope: scopes } },
                          ],
                        },
                      },
                      exact ? {
                        bool: {
                          filter: {
                            script: {
                              script: {
                                source: `doc['actor_event_scope'].length == ${scopes.length}`,
                                lang: 'painless',
                              },
                            },
                          },
                        },
                      } : {
                        bool: {},
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            bool: {
              must: [
                { term: { 'target._id': userId } },
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          should: [
                            { terms: { 'target_event_scope.keyword': scopes } },
                            { terms: { target_event_scope: scopes } },
                          ],
                        },
                      },
                      exact ? {
                        bool: {
                          filter: {
                            script: {
                              script: {
                                source: `doc['target_event_scope'].length == ${scopes.length}`,
                                lang: 'painless',
                              },
                            },
                          },
                        },
                      } : {
                        bool: {},
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  async getEventBody(eventData: ICreateEventInput): Promise<IEventBody> {
    const { eventName } = eventData;
    let eventBody: IEventBody;
    if (eventName in NonDocumentEventNames) {
      eventBody = ElasticsearchUtil.createInitialNonDocumentEventBody(eventData);
    } else {
      eventBody = ElasticsearchUtil.createInitialDocumentEventBody(eventData);
    }
    // Add user event scope
    const userScopes = this.getPersonalEventScope(eventData) as Record<string, unknown>;
    if (!userScopes) {
      return null;
    }
    return { ...eventBody, ...userScopes };
  }

  private getPersonalEventScope(eventData: ICreateEventInput): Record<string, string[]> {
    const { actor, target } = eventData;
    const actorEventScope : EventScopeType[] = [];
    const targetEventScope : EventScopeType[] = [];
    if (actor && (!actor.setting || actor.setting.dataCollection)) {
      actorEventScope.push(EventScopes.PERSONAL);
    }
    if (target && (!target.setting || target.setting.dataCollection)) {
      targetEventScope.push(EventScopes.PERSONAL);
    }

    const usersScope : Record<string, string[]> = {};
    if (!actorEventScope.length && !targetEventScope.length) {
      return null;
    }
    if (actorEventScope.length) {
      usersScope.actorEventScope = actorEventScope;
    }
    if (targetEventScope.length) {
      usersScope.targetEventScope = targetEventScope;
    }
    return usersScope;
  }

  getBasicFilterQuery(data: GetBasicFilterQueryInput): Record<string, unknown> {
    const {
      clientId: userId,
      includedEvents,
      excludedEvents = [],
      dateRange,
    } = data;

    const basicFilterQuery = {
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      {
                        term: { 'actor._id': userId },
                      },
                      {
                        bool: {
                          should: [
                            { term: { 'actor_event_scope.keyword': EventScopes.PERSONAL } },
                            { term: { actor_event_scope: EventScopes.PERSONAL } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      { term: { 'target._id': userId } },
                      {
                        bool: {
                          should: [
                            { term: { 'target_event_scope.keyword': EventScopes.PERSONAL } },
                            { term: { target_event_scope: EventScopes.PERSONAL } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            bool: {
              must_not: [
                { terms: { 'event_name.keyword': excludedEvents } },
                { terms: { event_name: excludedEvents } },
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
          {
            range: {
              event_time: { ...dateRange },
            },
          },
        ],
      },
    };
    return basicFilterQuery;
  }

  async getEventByClientId(data: IGetEventInput): Promise<IEventBody[]> {
    const { clientId: userId, limit, excludedEvents } = data;
    if (limit && !Utils.validateNumberRange(limit, EventConstants.MINIMUM_SEARCHED_EVENTS, EventConstants.MAXIMUM_SEARCHED_EVENTS)) {
      throw GraphErrorException.BadRequest('The limitation of event list must be between 0 and 101');
    }
    const commentEventQuery = {
      index: this.indexName,
      size: 0,
      body: {
        query: {
          function_score: {
            query: this.getBasicFilterQuery({ clientId: userId, excludedEvents }),
            // Double searched event's score if the event is either DOCUMENT_COMMENT or COMMENT_REPLIED
            functions: [
              {
                weight: 2,
                filter: {
                  term: { event_name: DocumentEventNames.DOCUMENT_COMMENTED },
                },
              },
              {
                weight: 2,
                filter: {
                  term: { event_name: DocumentEventNames.COMMENT_REPLIED },
                },
              },
            ],
          },
        },
        aggs: {
          comment_events: {
            terms: {
              field: 'document.comment._id',
              size: limit || EventConstants.MAXIMUM_SEARCHED_EVENTS,
              order: { time_value: 'desc' },
            },
            aggs: {
              deduplicated_event: { top_hits: { size: 1 } },
              // Get event_time of each top-hit bucket to sort in parent aggregation
              time_value: { max: { script: "doc['event_time'].value" } },
            },
          },
        },
      },
    };

    const nonCommentEventQuery = {
      index: this.indexName,
      size: limit || EventConstants.MAXIMUM_SEARCHED_EVENTS,
      body: {
        query: {
          bool: {
            must: [
              this.getBasicFilterQuery({ clientId: userId, excludedEvents }),
              {
                bool: {
                  must_not: [{ exists: { field: 'document.comment._id' } }],
                },
              },
            ],
          },
        },
        sort: [
          {
            event_time: {
              numeric_type: 'date',
              order: 'desc',
            },
          },
        ],
      },
    };
    // Returns a set of comment events and a set of non-comment events
    const [{ body: commentEventResponse }, { body: nonCommentEventResponse }] = await Promise.all([
      this.openSearchService.search(commentEventQuery),
      this.openSearchService.search(nonCommentEventQuery),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const commentEvents = ElasticsearchUtil.extractCommentEventList(commentEventResponse.aggregations.comment_events.buckets);
    const nonCommentEvents = ElasticsearchUtil.extractEventBody(nonCommentEventResponse.hits.hits as IElasticSearchResult[]) as IEventBody[];
    return [...commentEvents, ...nonCommentEvents]
      .sort((eventA, eventB) => (new Date(eventB.eventTime).getTime() - new Date(eventA.eventTime).getTime()))
      .slice(0, limit);
  }

  async getDocumentInsightStats(userId: string): Promise<IPersonalDocumentInsight> {
    let documentInsight: IPersonalDocumentInsight;
    /**
     * Check if there is derivative data in redis.
     * If yes, return data from redis instead of calling elasticsearch service
     */
    const rawDocumentInsight = await this.redisService.getRedisValueWithKey(`${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${userId}`);

    if (rawDocumentInsight) {
      documentInsight = JSON.parse(rawDocumentInsight);
      const { dailyNewComments } = documentInsight.documentStat;
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewComments);
    } else {
      const commonInputData = {
        clientId: userId,
      };
      const [
        monthlyDerivativeDocumentStat,
        monthlyDerivativeCommentStat,
        dailyNewComments,
        documentSummary,
      ] = await Promise.all([
        this.eventService.getDerivativeDocumentStat(commonInputData, EventScopes.PERSONAL),
        this.eventService.getDerivativeCommentStat(commonInputData, EventScopes.PERSONAL),
        this.eventService.getDailyNewComments(commonInputData, EventScopes.PERSONAL),
        this.documentService.getNonOrgDocumentSummary(userId, EventScopes.PERSONAL),
      ]);
      // Only store derivative rate in redis
      documentInsight = {
        documentStat: {
          derivativeDocumentRate: monthlyDerivativeDocumentStat.derivativeRate,
          derivativeCommentRate: monthlyDerivativeCommentStat.derivativeRate,
          dailyNewComments,
        },
        documentSummary: documentSummary as IPersonalDocumentSummary,
      };
      this.redisService.setDocumentStat(userId, documentInsight);
    }
    return documentInsight;
  }

  private async deletePersonalEvents(userId: string): Promise<boolean> {
    const query = this.getExactEventScopeQuery(userId, [EventScopes.PERSONAL], true);
    const result = await this.openSearchService.deleteByQuery({
      index: this.indexName,
      refresh: true,
      body: {
        query,
      },
    });
    const { body, statusCode } = result;
    return statusCode === 200 && body.total === body.deleted;
  }

  private async updateScopeInRelevantTeamEvents(userId: string) : Promise<boolean> {
    const query = this.getExactEventScopeQuery(userId, [EventScopes.PERSONAL]);
    const result = await this.openSearchService.updateByQuery({
      index: this.indexName,
      refresh: true,
      body: {
        query,
        script: {
          lang: 'painless',
          // eslint-disable-next-line max-len
          source: 'if (ctx._source.actor._id == params.user_id) {ctx._source.actor_event_scope.removeIf(scope -> scope == params.scope);} else if (ctx._source.target._id == params.user_id) {ctx._source.target_event_scope.removeIf(scope -> scope == params.scope);}',
          params: {
            user_id: userId,
            scope: EventScopes.PERSONAL,
          },
        },
      },
    });
    const { body, statusCode } = result;
    return statusCode === 200 && body.total === body.updated;
  }

  async removeAllEvents(userId: string): Promise<boolean> {
    // remove all event with scope [PERSONAL]
    const isDeleted = await this.deletePersonalEvents(userId);
    // update scope [PERSONAL]
    const isUpdated = await this.updateScopeInRelevantTeamEvents(userId);
    this.redisService.removeDocumentStat(userId);
    return isDeleted && isUpdated;
  }

  private async clearScroll(scrollIds: string[]): Promise<void> {
    if (scrollIds.length === 0) {
      return;
    }
    await this.openSearchService.clearScroll({
      scrollId: scrollIds.length > 1 ? scrollIds : scrollIds[0],
    });
  }

  private async getEventsInScroll(scrollPayload: IScrollingData) : Promise<IEventBodyWithScrolling> {
    const { body: eventsBody } = await this.openSearchService.scroll(scrollPayload);
    const events = ElasticsearchUtil.extractEventBody(eventsBody.hits.hits as IElasticSearchResult[]);
    return <IEventBodyWithScrolling>{
      scrollId: eventsBody._scroll_id,
      events,
    };
  }

  private async getSegmentedEventsByName(userId: string, eventNames: EventNameType[]) : Promise<IEventBodyWithScrolling> {
    const { body: segmentedEventsBody } = await this.openSearchService.search({
      index: this.indexName,
      size: EventConstants.MAXIMUM_SIZE_DOCUMENTS,
      scroll: EventConstants.SCROLL_ALIVE,
      body: {
        query: {
          bool: {
            must: [
              {
                term: { 'actor._id': userId },
              },
              {
                terms: { event_name: eventNames },
              },
            ],
          },
        },
        sort: [
          {
            event_time: {
              numeric_type: 'date',
              order: 'desc',
            },
          },
        ],
      },
    }, 'PersonalEventService.getSegmentedEventsByName');
    const events = ElasticsearchUtil.extractEventBody(segmentedEventsBody.hits.hits as IElasticSearchResult[]);
    const result = <IEventBodyWithScrolling>{
      events,
      scrollId: segmentedEventsBody._scroll_id,
    };
    return result;
  }

  private async exportDataByEventsName(user: User, eventNames: EventNameType | EventNameType[]) : Promise<string> {
    // get all data of this eventName
    const userId: string = user._id;
    let formatedEventNames: EventNameType[] = null;
    if (eventNames instanceof Array) {
      formatedEventNames = eventNames;
    } else {
      formatedEventNames = [eventNames];
    }
    const { scrollId, events } = await this.getSegmentedEventsByName(userId, formatedEventNames);
    const exporter = EventExporterFactory.getInstances(eventNames, user);
    if (!exporter) {
      return null;
    }
    await exporter.removeFileIfExist();
    const filePath = await exporter.export(events);
    const scrolls = [scrollId];

    if (events.length > 0) {
      let totalEvents: IEventBody[] = [];
      let nextScrollId = scrollId;
      while (true) {
        const { scrollId: secondScrollId, events: nextEvents } = await this.getEventsInScroll({
          scrollId: nextScrollId,
          scroll: EventConstants.SCROLL_ALIVE,
        });
        if (nextEvents.length === 0) {
          break;
        }
        nextScrollId = secondScrollId;
        scrolls.push(secondScrollId);
        totalEvents = totalEvents.concat(nextEvents);
      }
      await exporter.export(totalEvents);
    }

    this.clearScroll(scrolls);

    return filePath;
  }

  private async exportData(userId: string): Promise<string[]> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const exportedEventNames = new Set([
      DocumentEventNames.DOCUMENT_UPLOADED,
      DocumentEventNames.DOCUMENT_OPENED,
      NonDocumentEventNames.TEAM_MEMBER_ADDED,
      [NonDocumentEventNames.TEAM_PLAN_CHANGED, NonDocumentEventNames.PERSONAL_PLAN_CHANGED],
      NonDocumentEventNames.PERSONAL_SIGNED_IN,
      NonDocumentEventNames.PERSONAL_SIGNED_OUT,
    ]);
    const filePaths = await Promise.all(
      [...exportedEventNames].map((eventNames) => this.exportDataByEventsName(user, eventNames)),
    );
    return filePaths.filter((item) => !!item);
  }

  private getArchiverStreamFromMarketingData(filePaths: string[]) : Readable {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    archive.on('finish', () => {
      for (let i = 0; i < filePaths.length; i++) {
        Utils.removeFile(filePaths[i]);
      }
    });

    for (let i = 0; i < filePaths.length; i++) {
      const fileStream = fs.createReadStream(filePaths[i]);
      const fileName = filePaths[i].slice(filePaths[i].lastIndexOf('/'));
      archive.append(fileStream, { name: fileName });
    }
    archive.finalize();

    return archive;
  }

  async exportDataToStream(userId: string) : Promise<Readable> {
    const filePaths = await this.exportData(userId);
    // return the stream of the archiver
    return this.getArchiverStreamFromMarketingData(filePaths);
  }

  async createUserUseDocumentEvent(eventData: ICreateEventInput): Promise<void> {
    const { actor: { _id: userId }, document: { _id: documentId } } = eventData;
    const existedEvent = await this.isExistedUseDocumentEvent(userId, documentId);
    if (existedEvent) return;

    const eventBody = await this.getEventBody(eventData);
    if (!eventBody) {
      return;
    }
    await this.eventService.createElasticsearchEvent(eventBody);
  }

  public async isExistedUseDocumentEvent(userId: string, documentId: string): Promise<boolean> {
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must: [
              {
                term: { 'actor._id': userId },
              },
              {
                term: { 'document._id': documentId },
              },
              {
                term: { event_name: DocumentEventNames.DOCUMENT_USED },
              },
            ],
          },
        },
      },
    });

    return Boolean(body.hits.hits.length);
  }

  public async getAvgDocUserUsePerMonth(): Promise<number> {
    const endDate = moment().format();
    const startDate = moment().subtract(1, 'month').format();
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  event_name: DocumentEventNames.DOCUMENT_USED,
                },
              },
              {
                range: {
                  event_time: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          total_user_use_document: {
            composite: {
              size: 65535,
              sources: [
                {
                  unique_user_use_document: {
                    terms: {
                      field: 'actor._id',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    });

    const { buckets } = body.aggregations.total_user_use_document;
    const totalUsedDocuments = buckets.reduce((total, item) => Number(total) + Number(item.doc_count), 0);
    const totalUser = buckets.length;

    return Math.ceil(totalUsedDocuments / totalUser);
  }
}
