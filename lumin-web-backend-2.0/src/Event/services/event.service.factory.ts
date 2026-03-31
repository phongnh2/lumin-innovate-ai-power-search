import {
  forwardRef, HttpStatus, Inject, Injectable,
} from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import EventConstants from 'Common/constants/EventConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { ITotalDailyNewResource } from 'Dashboard/interfaces/dashboard.interface';
import { DocumentService } from 'Document/document.service';
import { IDocumentPermission } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { DocumentEventNames, EventScopes, EventScopeType } from 'Event/enums/event.enum';
import {
  ICreateEventInput,
  IEventBody,
  IGetEventInput,
  ICommonInsightInput,
  IMonthlyDerivativeAnnotationsStat,
  IMonthlyDerivativeCommentsStat,
  IMonthlyDerivativeDocumentsStat,
  IMonthlyDerivativeSignaturesStat,
} from 'Event/interfaces/event.interface';
import { IEventService } from 'Event/interfaces/rolebase.interface';
import { OrganizationEventService } from 'Event/services/organization.event.service';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { TeamEventService } from 'Event/services/team.event.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OpenSearchSerivce } from 'Opensearch/openSearch.service';

@Injectable()
export class EventServiceFactory {
  protected indexName: string;

  protected minimumExperimentalUserId: string;

  constructor(
    protected readonly redisService: RedisService,
    private readonly personalEventService: PersonalEventService,
    private readonly teamEventService: TeamEventService,
    private readonly organizationEventService: OrganizationEventService,
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    protected readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
    private readonly openSearchService: OpenSearchSerivce,
  ) {
    this.indexName = EventConstants.EVENT_INDEX;
    this.minimumExperimentalUserId = this.environmentService.getByKey(EnvConstants.MINIMUM_EXPERIMENTAL_USER_ID_FOR_DATA_COLLECTION);
  }

  private resolveService(eventScope: EventScopeType): IEventService {
    const mapServiceToEventObj = {
      [EventScopes.PERSONAL]: this.personalEventService,
      [EventScopes.TEAM]: this.teamEventService,
      [EventScopes.ORGANIZATION]: this.organizationEventService,
    };
    return mapServiceToEventObj[eventScope];
  }

  async createElasticsearchEvent(eventBody: IEventBody): Promise<Record<string, any> | null> {
    try {
      // Transform properties from camelCase to snake_case
      const { body, statusCode } = await this.openSearchService
        .index({
          index: this.indexName,
          body: ElasticsearchUtil.convertToSnakeCase({ ...eventBody } as Record<string, unknown>) as Record<string, unknown>,
        });
      if (statusCode === HttpStatus.CREATED) {
        return body;
      }
      return null;
    } catch {
      // OpenSearchSerivce.index already logs; callers use fire-and-forget — must not reject
      return null;
    }
  }

  async createEvent(eventData: ICreateEventInput): Promise<void> {
    try {
      const eventService = this.resolveService(eventData.eventScope);
      const eventBody = await eventService.getEventBody(eventData);
      if (!eventBody) {
        return;
      }
      await this.createElasticsearchEvent(eventBody);
    } catch (error) {
      this.loggerService.error({
        context: 'EventServiceFactory:createEvent',
        extraInfo: {
          eventData,
        },
        stack: error.stack,
      });
      // createEvent is invoked without await across the codebase; do not rethrow
    }
  }

  async getUsersEventScope(eventData: ICreateEventInput, defaultEventScope: EventScopeType): Promise<Record<string, string[]>> {
    const { actor, target, document } = eventData;
    const actorEventScope : EventScopeType[] = [defaultEventScope];
    const targetEventScope : EventScopeType[] = [];
    const participantDocumentPermissions: Promise<IDocumentPermission>[] = [
      this.documentService.getOneDocumentPermission(actor._id, {
        documentId: document._id,
      }),
    ];
    /**
     * Check if there is target in the event
     * If yes, get target's document permission
     */
    if (target) {
      targetEventScope.push(defaultEventScope);
      participantDocumentPermissions.push(this.documentService.getOneDocumentPermission(
        target._id,
        {
          documentId: document._id,
        },
      ));
    }
    const [actorPermission, targetPermission] = await Promise.all(participantDocumentPermissions);
    if (actorPermission) {
      if (!actor.setting || actor.setting.dataCollection) {
        actorEventScope.push(EventScopes.PERSONAL);
      }
    }
    if (targetPermission) {
      if (!target.setting || target.setting.dataCollection) {
        targetEventScope.push(EventScopes.PERSONAL);
      }
    }

    const usersScope: Record<string, string[]> = {};

    if (actorEventScope.length) {
      usersScope.actorEventScope = actorEventScope;
    }

    if (targetEventScope.length) {
      usersScope.targetEventScope = targetEventScope;
    }

    return usersScope;
  }

  async getEventByClientId(data: IGetEventInput, eventScope: EventScopeType): Promise<IEventBody[]> {
    const eventService = this.resolveService(eventScope);
    const events = await eventService.getEventByClientId(data);
    return events;
  }

  async removeAllEvents(clientId: string, eventScope: EventScopeType): Promise<void> {
    const eventService = this.resolveService(eventScope);
    const isCompleted = await eventService.removeAllEvents(clientId);
    if (!isCompleted) {
      throw GraphErrorException.BadRequest("Can't delete data right now!");
    }
  }

  async getDailyNewDocuments(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<ITotalDailyNewResource[]> {
    const eventService = this.resolveService(eventScope);

    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_UPLOADED],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          daily_new_docs: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'day',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now/d',
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDailyNewDocuments');

    const dailyNewDocuments = body.aggregations.daily_new_docs.buckets;
    return dailyNewDocuments.map((document: { key: string, doc_count: number }) => ({
      date: Utils.formatDate(new Date(document.key)),
      total: document.doc_count,
    }));
  }

  async getDailyNewComments(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<ITotalDailyNewResource[]> {
    const eventService = this.resolveService(eventScope);
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              eventService.getBasicFilterQuery({
                ...commonData,
                dateRange: {
                  gte: 'now-1M/M',
                  lte: 'now',
                },
              }),
              { exists: { field: 'document.comment._id' } },
            ],
          },
        },
        aggs: {
          daily_new_comments: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'day',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now/d',
              },
            },
            aggs: {
              total_new_comments: {
                cardinality: { field: 'document.comment._id' },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDailyNewComments');
    const dailyNewComments = body.aggregations.daily_new_comments.buckets;
    return dailyNewComments.map((comment) => ({
      date: Utils.formatDate(new Date(comment.key as string)),
      total: comment.total_new_comments.value,
    }));
  }

  async getDailyNewSignatures(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<ITotalDailyNewResource[]> {
    const eventService = this.resolveService(eventScope);

    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_SIGNED],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          daily_new_signatures: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'day',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now/d',
              },
            },
            aggs: {
              total_new_signatures: {
                cardinality: {
                  field: 'document.annotation._id',
                  precision_threshold: 100,
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDailyNewSignatures');

    const dailyNewSignatures = body.aggregations.daily_new_signatures.buckets;
    return dailyNewSignatures.map((signature) => ({
      date: Utils.formatDate(new Date(signature.key as string)),
      total: signature.total_new_signatures.value,
    }));
  }

  async getDailyNewAnnotations(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<ITotalDailyNewResource[]> {
    const eventService = this.resolveService(eventScope);

    const annotationPromise = this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_ANNOTATED],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          daily_new_annotations: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'day',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now/d',
              },
            },
            aggs: {
              distinct_annotations: {
                cardinality: {
                  field: 'document.annotation._id',
                  precision_threshold: 100,
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDailyNewAnnotations.annotations');

    const commentPromise = this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [
            DocumentEventNames.DOCUMENT_COMMENTED,
            DocumentEventNames.COMMENT_REPLIED,
          ],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          daily_new_comments: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'day',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now/d',
              },
            },
            aggs: {
              distinct_comments: {
                cardinality: {
                  field: 'document.comment._id',
                  precision_threshold: 100,
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDailyNewAnnotations.comments');

    const [
      { body: annotationResponse },
      { body: commentResponse },
    ] = await Promise.all([annotationPromise, commentPromise]);

    const dailyNewAnnotations = annotationResponse.aggregations.daily_new_annotations.buckets;
    const dailyNewComments = commentResponse.aggregations.daily_new_comments.buckets;

    return dailyNewAnnotations.map((annotation, index) => {
      const totalAnnotation = annotation.distinct_annotations.value as number;
      const totalComments = dailyNewComments[index].distinct_comments.value as number;
      return {
        date: Utils.formatDate(new Date(annotation.key as string)),
        total: totalAnnotation + totalComments,
      };
    });
  }

  async getDerivativeDocumentStat(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<IMonthlyDerivativeDocumentsStat> {
    const eventService = this.resolveService(eventScope);

    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_UPLOADED],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          monthly_docs: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'month',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now',
              },
            },
            aggs: {
              // Get the derivative documents over the last month
              derivative_docs: {
                derivative: {
                  buckets_path: '_count',
                  gap_policy: 'insert_zeros',
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDerivativeDocumentStat');

    const lastMonthResponse = body.aggregations.monthly_docs.buckets[0];
    const currentMonthResponse = body.aggregations.monthly_docs.buckets[1];

    const lastMonthNewDocumentTotal: number = lastMonthResponse.doc_count;
    const currentNewDocumentTotal: number = currentMonthResponse.doc_count;
    const derivativeDocumentNumber: number = currentMonthResponse.derivative_docs.value;
    const derivativeRate = ElasticsearchUtil.getMonthlyDerivativeRate(
      lastMonthNewDocumentTotal,
      currentNewDocumentTotal,
      derivativeDocumentNumber,
    );
    return {
      newDocumentTotal: currentNewDocumentTotal,
      derivativeDocumentNumber,
      derivativeRate,
    };
  }

  async getDerivativeCommentStat(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<IMonthlyDerivativeCommentsStat> {
    const eventService = this.resolveService(eventScope);
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery(commonData),
        aggs: {
          monthly_comments_in_month_range: {
            date_range: {
              field: 'event_time',
              ranges: [
                {
                  from: 'now-1M/M',
                  to: 'now',
                },
              ],
            },
            aggs: {
              monthly_comments: {
                date_histogram: {
                  field: 'event_time',
                  calendar_interval: 'month',
                  extended_bounds: {
                    min: 'now-1M/M',
                    max: 'now',
                  },
                },
                aggs: {
                  distinct_comments: {
                    cardinality: { field: 'document.comment._id' },
                  },
                  // Get the derivative comments over the last month
                  derivative_comments: {
                    derivative: {
                      buckets_path: 'distinct_comments',
                      gap_policy: 'insert_zeros',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDerivativeCommentStat');
    const lastMonthResponse = body.aggregations
      .monthly_comments_in_month_range.buckets[0]
      .monthly_comments.buckets[0];
    const currentMonthResponse = body.aggregations
      .monthly_comments_in_month_range.buckets[0]
      .monthly_comments.buckets[1];
    const lastMonthNewCommentTotal: number = lastMonthResponse.distinct_comments.value;
    const currentNewCommentTotal: number = currentMonthResponse.distinct_comments.value;
    const derivativeCommentNumber: number = currentMonthResponse.derivative_comments.value;
    const derivativeRate = ElasticsearchUtil.getMonthlyDerivativeRate(
      lastMonthNewCommentTotal,
      currentNewCommentTotal,
      derivativeCommentNumber,
    );
    return {
      newCommentTotal: currentNewCommentTotal,
      derivativeCommentNumber,
      derivativeRate,
    };
  }

  async getDerivativeSignatureStat(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<IMonthlyDerivativeSignaturesStat> {
    const eventService = this.resolveService(eventScope);

    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_SIGNED],
          dateRange: {
            gte: 'now-1M/M',
            lte: 'now',
          },
        }),
        aggs: {
          monthly_signatures: {
            date_histogram: {
              field: 'event_time',
              calendar_interval: 'month',
              extended_bounds: {
                min: 'now-1M/M',
                max: 'now',
              },
            },
            aggs: {
              // Get the derivative signatures over the last month
              derivative_signatures: {
                derivative: {
                  buckets_path: '_count',
                  gap_policy: 'insert_zeros',
                },
              },
            },
          },
        },
      },
    }, 'EventServiceFactory.getDerivativeSignatureStat');

    const lastMonthResponse = body.aggregations.monthly_signatures.buckets[0];
    const currentMonthResponse = body.aggregations.monthly_signatures.buckets[1];

    const lastMonthNewSignatureTotal: number = lastMonthResponse.doc_count;
    const currentNewSignatureTotal: number = currentMonthResponse.doc_count;
    const derivativeSignatureNumber: number = currentMonthResponse.derivative_signatures.value;
    const derivativeRate = ElasticsearchUtil.getMonthlyDerivativeRate(
      lastMonthNewSignatureTotal,
      currentNewSignatureTotal,
      derivativeSignatureNumber,
    );
    return {
      newSignatureTotal: currentNewSignatureTotal,
      derivativeSignatureNumber,
      derivativeRate,
    };
  }

  private async countTotalAnnotationByDateRange(
    commonData: {
      clientId: string,
      dateRange: Record<string, string>,
      memberIds?: string[],
    },
    eventScope: EventScopeType,
  ): Promise<number> {
    const eventService = this.resolveService(eventScope);

    const annotationPromise = this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_ANNOTATED],
        }),
        aggs: {
          distinct_annotations: {
            cardinality: {
              field: 'document.annotation._id',
              precision_threshold: 100,
            },
          },
        },
      },
    });
    const commentPromise = this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [
            DocumentEventNames.DOCUMENT_COMMENTED,
            DocumentEventNames.COMMENT_REPLIED,
          ],
        }),
        aggs: {
          distinct_comments: {
            cardinality: {
              field: 'document.comment._id',
              precision_threshold: 100,
            },
          },
        },
      },
    });

    const [
      { body: annotationResponse },
      { body: commentResponse },
    ] = await Promise.all([annotationPromise, commentPromise]);

    const totalNewAnnotation = annotationResponse.aggregations.distinct_annotations.value as number;
    const totalNewComment = commentResponse.aggregations.distinct_comments.value as number;
    return totalNewAnnotation + totalNewComment;
  }

  async getDerivativeAnnotationStat(
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  ): Promise<IMonthlyDerivativeAnnotationsStat> {
    const { clientId, memberIds } = commonData;
    const commonCountInput = {
      clientId,
      ...(eventScope === EventScopes.ORGANIZATION && {
        memberIds,
      }),
    };

    const [lastMonthNewAnnotationTotal, currentMonthNewAnnotationTotal] = await Promise.all([
      this.countTotalAnnotationByDateRange({
        ...commonCountInput,
        dateRange: {
          gte: 'now-1M/M',
          lt: 'now/M',
        },
      }, eventScope),
      this.countTotalAnnotationByDateRange({
        ...commonCountInput,
        dateRange: {
          gte: 'now/M',
          lte: 'now',
        },
      }, eventScope),
    ]);

    const derivativeAnnotationNumber = currentMonthNewAnnotationTotal - lastMonthNewAnnotationTotal;
    const derivativeRate = ElasticsearchUtil.getMonthlyDerivativeRate(
      lastMonthNewAnnotationTotal,
      currentMonthNewAnnotationTotal,
      derivativeAnnotationNumber,
    );
    return {
      newAnnotationTotal: currentMonthNewAnnotationTotal,
      derivativeAnnotationNumber,
      derivativeRate,
    };
  }

  private async getTotalSegmentedAnnotationEvent(
    queryObject: Record<string, unknown>,
    afterKey?: Record<string, unknown>,
  ): Promise<number> {
    const { body: response } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: queryObject,
        aggs: {
          annotation_composite: {
            composite: {
              // Maximum returned composite buckets per response
              size: EventConstants.MAXIMUM_SEARCHED_EVENTS,
              sources: [
                {
                  new_annotations: {
                    terms: {
                      field: 'document.annotation._id',
                      missing_bucket: true,
                    },
                  },
                },
                {
                  new_comments: {
                    terms: {
                      field: 'document.comment._id',
                      missing_bucket: true,
                    },
                  },
                },
              ],
              ...(afterKey && { after: afterKey }),
            },
          },
        },
      },
    }, 'EventServiceFactory.getTotalSegmentedAnnotationEvent');

    const { buckets, after_key: newAfterKey } = response.aggregations.annotation_composite;
    const totalBuckets: number = buckets.length;

    if (totalBuckets) {
      return this.getTotalSegmentedAnnotationEvent(queryObject, newAfterKey as Record<string, unknown>)
        .then((subsequentTotal) => subsequentTotal + totalBuckets);
    }

    return 0;
  }

  async countTotalAnnotation(data: {
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  }): Promise<number> {
    const { commonData, eventScope } = data;
    const eventService = this.resolveService(eventScope);
    const queryObject = eventService.getBasicFilterQuery({
      ...commonData,
      includedEvents: [
        DocumentEventNames.DOCUMENT_ANNOTATED,
        DocumentEventNames.DOCUMENT_COMMENTED,
        DocumentEventNames.COMMENT_REPLIED,
      ],
    });

    return this.getTotalSegmentedAnnotationEvent(queryObject);
  }

  async countTotalDocument(data: {
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  }): Promise<number> {
    const { commonData, eventScope } = data;
    const eventService = this.resolveService(eventScope);
    const { body: response } = await this.openSearchService.count({
      index: this.indexName,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_UPLOADED],
        }),
      },
    });

    return response.count;
  }

  async countTotalComment(data: {
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  }): Promise<number> {
    const { commonData, eventScope } = data;
    const eventService = this.resolveService(eventScope);
    const { body: response } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [
            DocumentEventNames.DOCUMENT_COMMENTED,
            DocumentEventNames.COMMENT_REPLIED,
          ],
        }),
        aggs: {
          distinct_comments: {
            cardinality: { field: 'document.comment._id' },
          },
        },
      },
    });

    return response.aggregations.distinct_comments.value;
  }

  async countTotalSignature(data: {
    commonData: ICommonInsightInput,
    eventScope: EventScopeType,
  }): Promise<number> {
    const { commonData, eventScope } = data;
    const eventService = this.resolveService(eventScope);
    const { body: response } = await this.openSearchService.count({
      index: this.indexName,
      body: {
        query: eventService.getBasicFilterQuery({
          ...commonData,
          includedEvents: [DocumentEventNames.DOCUMENT_SIGNED],
        }),
      },
    });

    return response.count;
  }
}
