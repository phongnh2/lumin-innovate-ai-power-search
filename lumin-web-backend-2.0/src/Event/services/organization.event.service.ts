/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/require-await */
import {
  forwardRef, Inject, Injectable,
} from '@nestjs/common';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import EventConstants from 'Common/constants/EventConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { Utils } from 'Common/utils/Utils';

import {
  INonDocumentInsight,
  ITotalDailyNewResource,
  IOrgDocumentInsight,
  IOrgDocumentSummary,
  INonDocumentStat,
  IDocumentSummary,
} from 'Dashboard/interfaces/dashboard.interface';
import { DocumentAnnotationTypeEnum } from 'Document/document.annotation.enum';
import { DocumentRoleEnum, DocumentWorkspace } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import {
  EventNameType, EventScopes, NonDocumentEventNames, OrgActionEvent,
} from 'Event/enums/event.enum';
import {
  IEventBody,
  ICreateEventInput,
  IGetEventInput,
  IMonthlyDerivativeMembersStat,
  IEventOrganization,
  ICommonInsightInput,
  IElasticSearchResult,
} from 'Event/interfaces/event.interface';
import { GetBasicOrgQueryInput, IOrganizationEventService } from 'Event/interfaces/rolebase.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { RedisService } from 'Microservices/redis/redis.service';
import { OpenSearchSerivce } from 'Opensearch/openSearch.service';
import { OrganizationService } from 'Organization/organization.service';
import { UserService } from 'User/user.service';

@Injectable()
export class OrganizationEventService implements IOrganizationEventService {
  protected indexName: string;

  constructor(
    protected readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    protected readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => OrganizationService))
    protected readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => EventServiceFactory))
    protected readonly eventService: EventServiceFactory,
    private readonly openSearchService: OpenSearchSerivce,
  ) {
    this.indexName = EventConstants.EVENT_INDEX;
  }

  async getEventBody(eventData: ICreateEventInput): Promise<IEventBody> {
    const {
      eventName,
      team,
      organization,
      document,
      orgModification,
    } = eventData;
    let userScopes = {};
    let eventBody: IEventBody;
    let orgInfo: Partial<IEventOrganization>;
    if (eventName in NonDocumentEventNames) {
      eventBody = ElasticsearchUtil.createInitialNonDocumentEventBody(eventData);
    } else {
      eventBody = ElasticsearchUtil.createInitialDocumentEventBody(eventData);
      userScopes = await this.eventService.getUsersEventScope(eventData, EventScopes.ORGANIZATION);
    }
    if (team) {
      eventBody.team = {
        _id: team._id,
        name: team.name,
      };
    }
    // get organization info
    if (organization) {
      orgInfo = {
        _id: organization._id,
        name: organization.name,
      };
    } else {
      const orgPermission = await this.documentService.getOrganizationOwnerDocumentPermission({
        documentId: document._id,
        $or: [
          {
            role: DocumentRoleEnum.OWNER,
            'workspace.type': DocumentWorkspace.ORGANIZATION,
          },
          {
            role: DocumentRoleEnum.ORGANIZATION,
          }],
      });
      if (orgPermission) {
        if (orgPermission.role === DocumentRoleEnum.OWNER) {
          orgInfo = await this.organizationService.getOrgById(
            orgPermission.workspace.refId,
            { _id: 1, name: 1 },
          );
        } else {
          orgInfo = await this.organizationService.getOrgById(
            orgPermission.refId,
            { _id: 1, name: 1 },
          );
        }
      }
    }
    if (orgModification) {
      orgInfo.planModification = orgModification;
    }
    eventBody.organization = orgInfo;
    return { ...eventBody, ...userScopes };
  }

  getBasicFilterQuery(data: GetBasicOrgQueryInput): Record<string, unknown> {
    const {
      clientId: orgId,
      includedEvents,
      dateRange,
      memberIds,
    } = data;

    // Query events of organization, org team & members
    const basicFilterQuery = {
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      { terms: { actor_event_scope: [EventScopes.ORGANIZATION, EventScopes.PERSONAL] } },
                      { term: { 'organization._id': orgId } },
                      { terms: { 'actor._id': memberIds } },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      { term: { actor_event_scope: EventScopes.TEAM } },
                      { term: { 'team.belongs_to': orgId } },
                    ],
                  },
                },
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

  getNonDocumentFilterQuery({
    orgId,
    includedEvents,
  }: {
    orgId: string,
    includedEvents?: EventNameType[],
  }): Record<string, unknown> {
    const basicFilterQuery = {
      bool: {
        must: [
          {
            bool: {
              should: [
                { term: { 'organization._id.keyword': orgId } },
                { term: { 'organization._id': orgId } },
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
        ],
      },
    };
    return basicFilterQuery;
  }

  private async getDailyNewTeams(data: {
    orgId: string,
    memberIds: string[],
  }): Promise<ITotalDailyNewResource[]> {
    const { orgId, memberIds } = data;
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: this.getBasicFilterQuery({
          clientId: orgId,
          includedEvents: [NonDocumentEventNames.ORG_TEAM_CREATED],
          memberIds,
        }),
        aggs: {
          daily_teams_in_date_range: {
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
              daily_new_teams: {
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
        },
      },
    });
    const dailyNewTeams = body.aggregations.daily_teams_in_date_range.buckets[0].daily_new_teams.buckets;
    return dailyNewTeams.map((team: { key: string, doc_count: number }) => ({
      date: Utils.formatDate(new Date(team.key)),
      total: team.doc_count,
    }));
  }

  private async getDerivativeMemberStat(data: {
    orgId: string,
    memberIds: string[],
  }): Promise<IMonthlyDerivativeMembersStat> {
    const { orgId, memberIds } = data;
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: 0,
      body: {
        query: this.getBasicFilterQuery({
          clientId: orgId,
          includedEvents: [NonDocumentEventNames.ORG_MEMBER_ADDED],
          memberIds,
        }),
        aggs: {
          new_members_per_months_in_month_range: {
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
              new_members_per_month: {
                date_histogram: {
                  field: 'event_time',
                  calendar_interval: 'month',
                  extended_bounds: {
                    min: 'now-1M/M',
                    max: 'now',
                  },
                },
                aggs: {
                  derivative_members: {
                    derivative: {
                      buckets_path: '_count',
                      gap_policy: 'insert_zeros',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const lastMonthResponse = body.aggregations
      .new_members_per_months_in_month_range.buckets[0]
      .new_members_per_month.buckets[0];
    const currentMonthResponse = body.aggregations
      .new_members_per_months_in_month_range.buckets[0]
      .new_members_per_month.buckets[1];
    const lastMonthNewMemberTotal: number = lastMonthResponse.doc_count;
    const currentNewMemberTotal: number = currentMonthResponse.doc_count;
    const derivativeMemberNumber: number = currentMonthResponse.derivative_members.value;
    const derivativeRate = ElasticsearchUtil.getMonthlyDerivativeRate(
      lastMonthNewMemberTotal,
      currentNewMemberTotal,
      derivativeMemberNumber,
    );
    return {
      newMemberTotal: currentNewMemberTotal,
      derivativeMemberNumber,
      derivativeRate,
    };
  }

  async getDocumentInsightStats(orgId: string): Promise<IOrgDocumentInsight> {
    let documentInsight: IOrgDocumentInsight;
    /**
     * Check if there is derivative data in redis.
     * If yes, return data from redis instead of calling elasticsearch service
     */
    const [rawDocumentInsight] = await Promise.all([
      this.redisService.getRedisValueWithKey(`${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${orgId}`),
    ]);

    if (rawDocumentInsight) {
      documentInsight = JSON.parse(rawDocumentInsight);
      const { dailyNewDocuments, dailyNewSignatures, dailyNewAnnotations } = documentInsight.documentStat;
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewDocuments);
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewSignatures);
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewAnnotations);
    } else {
      const orgMembers = await this.organizationService.getActiveOrgMembers(orgId, { userId: 1 }) as Record<string, any>[];
      const memberIds = orgMembers.map((member) => member.userId.toHexString());
      const commonInputData = {
        clientId: orgId,
        memberIds,
      };

      const [
        monthlyDerivativeDocumentStat,
        monthlyDerivativeSignatureStat,
        monthlyDerivativeAnnotationStat,
        dailyNewDocuments,
        dailyNewSignatures,
        dailyNewAnnotations,
        documentSummary,
      ] = await Promise.all([
        this.eventService.getDerivativeDocumentStat(commonInputData, EventScopes.ORGANIZATION),
        this.eventService.getDerivativeSignatureStat(commonInputData, EventScopes.ORGANIZATION),
        this.eventService.getDerivativeAnnotationStat(commonInputData, EventScopes.ORGANIZATION),
        this.eventService.getDailyNewDocuments(commonInputData, EventScopes.ORGANIZATION),
        this.eventService.getDailyNewSignatures(commonInputData, EventScopes.ORGANIZATION),
        this.eventService.getDailyNewAnnotations(commonInputData, EventScopes.ORGANIZATION),
        this.getOrgDocumentSummary(commonInputData),
      ]);

      // Only store derivative rate in redis
      documentInsight = {
        documentStat: {
          derivativeDocumentRate: monthlyDerivativeDocumentStat.derivativeRate,
          derivativeSignatureRate: monthlyDerivativeSignatureStat.derivativeRate,
          derivativeAnnotationRate: monthlyDerivativeAnnotationStat.derivativeRate,
          dailyNewDocuments,
          dailyNewSignatures,
          dailyNewAnnotations,
          lastUpdated: new Date().getTime(),
        },
        documentSummary: documentSummary as IOrgDocumentSummary,
      };
      this.redisService.setDocumentStat(orgId, documentInsight);
    }

    return documentInsight;
  }

  async getNonDocumentInsightStats(orgId: string): Promise<INonDocumentInsight> {
    let nonDocumentStat: INonDocumentStat;
    /**
     * Check if there is derivative data in redis.
     * If yes, return data from redis instead of calling elasticsearch service
     */
    const rawNonDocumentStat = await this.redisService.getRedisValueWithKey(
      `${RedisConstants.NON_DOCUMENT_STAT_REDIS_PREFIX}${orgId}`,
    );
    if (rawNonDocumentStat) {
      nonDocumentStat = JSON.parse(rawNonDocumentStat);
    } else {
      const orgMembers = await this.organizationService.getActiveOrgMembers(orgId, { userId: 1 }) as Record<string, any>[];
      const memberIds = orgMembers.map((member) => member.userId.toHexString());

      const monthlyDerivativeMemberStat = await this.getDerivativeMemberStat({
        orgId,
        memberIds,
      });
      nonDocumentStat = {
        derivativeMemberRate: monthlyDerivativeMemberStat.derivativeRate,
        lastUpdated: new Date().getTime(),
      };
      this.redisService.setNonDocumentStat(orgId, nonDocumentStat);
    }
    return { nonDocumentStat };
  }

  async getOrgDocumentSummary(commonData: ICommonInsightInput): Promise<Partial<IDocumentSummary>> {
    const { clientId } = commonData;
    const countTotalParam = {
      commonData,
      eventScope: EventScopes.ORGANIZATION,
    };

    const [ownedDocumentTotal, signatureTotal, annotationTotal] = await Promise.all([
      this.eventService.countTotalDocument(countTotalParam),
      this.eventService.countTotalSignature(countTotalParam),
      this.documentService.countTotalAnnotationsByOrgId(
        clientId,
        [DocumentAnnotationTypeEnum.SIGNATURE],
      ),
    ]);

    return { ownedDocumentTotal, signatureTotal, annotationTotal };
  }

  private async deleteOrganizationEvents(orgId: string): Promise<boolean> {
    const result = await this.openSearchService.deleteByQuery({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    { term: { 'organization._id': orgId } },
                    { term: { 'team.belongs_to': orgId } },
                  ],
                },
              },
              {
                bool: {
                  must_not: [
                    {
                      bool: {
                        filter: [
                          { term: { event_name: OrgActionEvent.ORGANIZATION_DELETED } },
                          { terms: { actor_event_scope: [EventScopes.ADMIN] } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
    const { body, statusCode } = result;
    return statusCode === 200 && body.total === body.deleted;
  }

  async removeAllEvents(orgId: string): Promise<boolean> {
    const isDeleted = await this.deleteOrganizationEvents(orgId);
    this.redisService.removeNonDocumentStat(orgId);
    return isDeleted;
  }

  async sortOrgListByLatestActivity(orgIds: string[]): Promise<string[]> {
    try {
      const { body } = await this.openSearchService.search({
        index: this.indexName,
        body: {
          query: {
            terms: {
              'organization._id': orgIds,
            },
          },
          collapse: {
            field: 'organization._id',
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
      });

      const latestOrgEvents = ElasticsearchUtil.extractEventBody(body.hits.hits as IElasticSearchResult[]);
      return latestOrgEvents.map((event) => event.organization._id);
    } catch {
      return [];
    }
  }

  getEventByClientId(_data: IGetEventInput): Promise<IEventBody[]> {
    throw new Error('Method not implemented.');
  }
}
