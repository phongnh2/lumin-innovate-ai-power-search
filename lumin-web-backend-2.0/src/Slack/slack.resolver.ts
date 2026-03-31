import { UseGuards, HttpStatus } from '@nestjs/common';
import {
  Context, Query, Resolver, Args,
  Mutation,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  BasicResponse, InitSlackOAuthResponse, SlackChannel, SlackRecipient, SlackTeam,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';

import { SlackService } from './slack.service';

@UseGuards(GqlAuthGuard)
@Resolver('Slack')
export class SlackResolver {
  constructor(
    private readonly slackService: SlackService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  initSlackOAuth(@Context() context): InitSlackOAuthResponse {
    const user = context.req.user as User;
    return this.slackService.initSlackOAuth(user);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSlackTeams(@Context() context): Promise<SlackTeam[]> {
    const { _id: userId } = context.req.user as User;
    return this.slackService.getSlackTeams(userId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSlackChannels(@Context() context, @Args('teamId') teamId: string): Promise<SlackChannel[]> {
    const { _id: userId } = context.req.user as User;
    return this.slackService.getSlackChannels(userId, teamId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async revokeSlackConnection(@Context() context, @Args('teamId') teamId: string): Promise<BasicResponse> {
    const { _id: userId } = context.req.user as User;
    await this.slackService.revokeSlackConnection(userId, teamId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Slack connection revoked successfully',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSlackRecipients(@Context() context, @Args('teamId') teamId: string): Promise<SlackRecipient[]> {
    const { _id: userId } = context.req.user as User;
    return this.slackService.getSlackRecipients(userId, teamId);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async countSlackChannelMembers(@Context() context, @Args('teamId') teamId: string, @Args('channelId') channelId: string): Promise<number> {
    const { _id: userId } = context.req.user as User;
    const channelMembers = await this.slackService.getSlackChannelMembers(userId, teamId, channelId);
    return channelMembers.length;
  }
}
