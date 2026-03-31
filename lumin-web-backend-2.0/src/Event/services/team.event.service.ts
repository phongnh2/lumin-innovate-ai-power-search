/* eslint-disable @typescript-eslint/require-await */
import {
  forwardRef, Inject, Injectable,
} from '@nestjs/common';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import EventConstants from 'Common/constants/EventConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { ITeamDocumentInsight, ITeamDocumentSummary } from 'Dashboard/interfaces/dashboard.interface';
import { DocumentService } from 'Document/document.service';
import {
  EventScopes, NonDocumentEventNames,
} from 'Event/enums/event.enum';
import {
  ICreateEventInput, IElasticSearchResult, IEventBody, IGetEventInput,
} from 'Event/interfaces/event.interface';
import { GetBasicFilterQueryInput, IEventService } from 'Event/interfaces/rolebase.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { RedisService } from 'Microservices/redis/redis.service';
import { OpenSearchSerivce } from 'Opensearch/openSearch.service';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

@Injectable()
export class TeamEventService implements IEventService {
  protected indexName: string;

  constructor(
    protected readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    protected readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => TeamService))
    protected readonly teamService: TeamService,
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
      eventName, document, team, teamModification,
    } = eventData;
    let userScopes = {};
    let teamInfo: any = {};
    let eventBody: IEventBody;
    if (eventName in NonDocumentEventNames) {
      eventBody = ElasticsearchUtil.createInitialNonDocumentEventBody(eventData);
    } else {
      eventBody = ElasticsearchUtil.createInitialDocumentEventBody(eventData);
      userScopes = await this.eventService.getUsersEventScope(eventData, EventScopes.TEAM);
    }
    // Get team info
    if (team) {
      teamInfo = {
        _id: team._id,
        name: team.name,
        belongsTo: team.belongsTo,
      };
    } else {
      const teamPermission = await this.documentService.getTeamOwnerDocumentPermission(
        document._id,
        { refId: 1 },
      );
      const foundTeam = teamPermission && await this.teamService.findOneById(
        teamPermission.refId,
        { _id: 1, name: 1, belongsTo: 1 },
      );
      teamInfo = foundTeam;
    }
    if (teamModification) {
      teamInfo.modification = teamModification;
    }
    eventBody = { ...eventBody, ...userScopes };
    eventBody.team = teamInfo;
    return eventBody;
  }

  getBasicFilterQuery(data: GetBasicFilterQueryInput): Record<string, unknown> {
    const {
      clientId: teamId,
      includedEvents,
      excludedEvents = [],
      dateRange,
    } = data;

    const basicFilterQuery = {
      bool: {
        must: [
          { term: { 'team._id': teamId } },
          {
            bool: {
              must_not: [
                { exists: { field: 'organization' } },
                { terms: { event_name: excludedEvents } },
                { terms: { 'event_name.keyword': excludedEvents } },
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
    const { clientId: teamId, limit, excludedEvents } = data;
    if (limit && !Utils.validateNumberRange(limit, EventConstants.MINIMUM_SEARCHED_EVENTS, EventConstants.MAXIMUM_SEARCHED_EVENTS)) {
      throw GraphErrorException.BadRequest('The limitation of event list must be between 0 and 101', ErrorCode.Event.INVALID_EVENT_LIMITATION);
    }
    // This search returns a set of comment events and a set of non-comment events
    const { body } = await this.openSearchService.search({
      index: this.indexName,
      size: limit || EventConstants.MAXIMUM_SEARCHED_EVENTS,
      body: {
        query: this.getBasicFilterQuery({ clientId: teamId, excludedEvents }),
        sort: [{ event_time: { numeric_type: 'date', order: 'desc' } }],
      },
    });
    return ElasticsearchUtil.extractEventBody(body.hits.hits as IElasticSearchResult[]) as IEventBody[];
  }

  async getDocumentInsightStats(teamId: string): Promise<ITeamDocumentInsight> {
    let documentInsight: ITeamDocumentInsight;
    /**
     * Check if there is derivative data in redis.
     * If yes, return data from redis instead of calling elasticsearch service
     */
    const rawDocumentStat = await this.redisService.getRedisValueWithKey(`${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${teamId}`);

    if (rawDocumentStat) {
      documentInsight = JSON.parse(rawDocumentStat);
      const { dailyNewComments, dailyNewDocuments } = documentInsight.documentStat;
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewComments);
      ElasticsearchUtil.attachCurrentDateDataToDailyStat(dailyNewDocuments);
    } else {
      const commonInputData = {
        clientId: teamId,
      };
      const [
        monthlyDerivativeDocumentStat,
        monthlyDerivativeCommentStat,
        dailyNewComments,
        dailyNewDocuments,
        documentSummary,
      ] = await Promise.all([
        this.eventService.getDerivativeDocumentStat(commonInputData, EventScopes.TEAM),
        this.eventService.getDerivativeCommentStat(commonInputData, EventScopes.TEAM),
        this.eventService.getDailyNewComments(commonInputData, EventScopes.TEAM),
        this.eventService.getDailyNewDocuments(commonInputData, EventScopes.TEAM),
        this.documentService.getNonOrgDocumentSummary(teamId, EventScopes.TEAM),
      ]);
      // Only store derivative rate in redis
      documentInsight = {
        documentStat: {
          derivativeDocumentRate: monthlyDerivativeDocumentStat.derivativeRate,
          derivativeCommentRate: monthlyDerivativeCommentStat.derivativeRate,
          dailyNewComments,
          dailyNewDocuments,
        },
        documentSummary: documentSummary as ITeamDocumentSummary,
      };
      this.redisService.setDocumentStat(teamId, documentInsight);
    }
    return documentInsight;
  }

  removeAllEvents(_clientId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
