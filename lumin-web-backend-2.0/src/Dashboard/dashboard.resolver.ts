import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Context, Resolver, Query, Args,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IPersonalDocumentInsight, ITeamDocumentInsight } from 'Dashboard/interfaces/dashboard.interface';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { TeamEventService } from 'Event/services/team.event.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamPermissionGuard } from 'Team/guards/graph.team.permission.guard';

@UseGuards(GqlAuthGuard)
@Resolver('Dashboard')
export class DashboardResolver {
  constructor(
        private readonly personalEventService: PersonalEventService,
        private readonly teamEventService: TeamEventService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query()
  async getPersonalDocumentSummary(
    @Context() context,
  ): Promise<IPersonalDocumentInsight> {
    const { user: { _id } } = context.req;
    return this.personalEventService.getDocumentInsightStats(_id as string);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(TeamPermissionGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    TeamRoles.ADMIN,
  )
  @Query()
  async getTeamDocumentSummary(
    @Args('teamId') teamId: string,
  ): Promise<ITeamDocumentInsight> {
    return this.teamEventService.getDocumentInsightStats(teamId);
  }
}
