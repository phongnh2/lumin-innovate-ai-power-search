import { HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Context, Resolver, Query, Args, Mutation,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { AdminAuthGuard } from 'Auth/guards/admin.auth.guard';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { DocumentEventNames, EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { IEventBody } from 'Event/interfaces/event.interface';
import { AdminEventService } from 'Event/services/admin.event.service';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import {
  AdminEventsConnection, AdminEventsEdge, BasicResponse, GetAdminEventsInput,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamPermissionGuard } from 'Team/guards/graph.team.permission.guard';

@UseInterceptors(SanitizeInputInterceptor)
@Resolver()
export class EventResolver {
  constructor(
    private readonly eventService: EventServiceFactory,
    private readonly adminEventService: AdminEventService,
  ) {}

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getEventsByUserId(
    @Args('limit') limit: number,
    @Context() context,
  ): Promise<IEventBody[]> {
    const { user: { _id: userId } } = context.req;
    const events = await this.eventService.getEventByClientId(
      {
        clientId: userId,
        limit,
        excludedEvents: [
          NonDocumentEventNames.PERSONAL_PLAN_CHANGED,
          NonDocumentEventNames.PERSONAL_PLAN_RENEWED,
          NonDocumentEventNames.PERSONAL_PLAN_CANCELED,
          NonDocumentEventNames.PERSONAL_SIGNED_IN,
          NonDocumentEventNames.PERSONAL_SIGNED_OUT,
          NonDocumentEventNames.PERSONAL_ACCOUNT_CREATED,
          NonDocumentEventNames.TRANSACTIONAL_EMAIL_SENT,
          DocumentEventNames.DOCUMENT_USED,
          DocumentEventNames.TEMPLATE_USED,
        ],
      },
      EventScopes.PERSONAL,
    );
    return events;
  }

  @UseGuards(TeamPermissionGuard)
  @AcceptancePermissions(TeamRoles.ADMIN, TeamRoles.MODERATOR)
  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getEventsByTeamId(
    @Args('teamId') teamId: string,
    @Args('limit') limit: number,
  ): Promise<IEventBody[]> {
    const events = await this.eventService.getEventByClientId(
      {
        clientId: teamId,
        limit,
        excludedEvents: [DocumentEventNames.DOCUMENT_OPENED],
      },
      EventScopes.TEAM,
    );
    return events;
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('deletePersonalEvents')
  async deletePersonalEvents(
    @Context() context,
  ) : Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    await this.eventService.removeAllEvents(userId as string, EventScopes.PERSONAL);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your personal data was fully deleted',
    };
  }

  @UseGuards(AdminAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getAdminEvents(
    @Args('input') input: GetAdminEventsInput,
  ): Promise<AdminEventsConnection> {
    const { eventList, total } = await this.adminEventService.getAllAdminEvents(input);
    return {
      edges: eventList.map((event) => ({ node: event } as AdminEventsEdge)),
      total,
    };
  }
}
