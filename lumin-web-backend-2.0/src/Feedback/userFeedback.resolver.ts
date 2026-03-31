import { HttpStatus, UseGuards } from '@nestjs/common';
import {
  Args, Context, Mutation, Resolver,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  BasicResponse, CreateFormDetectionFeedbackInput, CreateShareDocFeedbackInput, User,
  CreateMobileFeedbackInput,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { UserFeedbackService } from './services/userFeedback.service';

@UseGuards(GqlAuthGuard)
@Resolver()
export class UserFeedbackResolver {
  constructor(
    private readonly userFeedbackService: UserFeedbackService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('createShareDocFeedback')
  async createShareDocFeedback(
    @Args('input') input: CreateShareDocFeedbackInput,
  ): Promise<BasicResponse> {
    await this.userFeedbackService.createShareDocFeedback(input);

    return {
      message: 'Create share doc feedback successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('createFormDetectionFeedback')
  async createFormDetectionFeedback(
    @Args('input') input: CreateFormDetectionFeedbackInput,
    @Context() context: { req: { user: User} },
  ): Promise<BasicResponse> {
    const { score, content } = input;
    const { user } = context.req;
    const tagId = this.userFeedbackService.getTagIdByScore(score);
    await this.userFeedbackService.createFormFieldsFeedback({
      tagIds: [tagId],
      content,
      userEmail: user.email,
    });

    return {
      message: 'Create layout feedback successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('createMobileFeedback')
  async createMobileFeedback(
    @Args('input') input: CreateMobileFeedbackInput,
    @Context() context: { req: { user: User} },
  ): Promise<BasicResponse> {
    const { user } = context.req;
    const { title, content, imageURLs } = input;

    await this.userFeedbackService.createMobileFeedback({
      title, content, imageURLs, user,
    });
    return {
      message: 'Create mobile feedback successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
