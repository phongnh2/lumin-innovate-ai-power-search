/* eslint-disable max-classes-per-file */
import { HttpStatus, UseGuards } from '@nestjs/common';
import {
  Resolver, Args, Mutation, Context, Query,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  BasicResponse,
  CreateUserAnnotationInput,
  GetUserAnnotationInput,
  UpdateUserAnnotationPositionInput,
  GetUserAnnotationResponse,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { UserAnnotationService } from './userAnnotation.service';

@UseGuards(GqlAuthGuard)
@Resolver('UserAnnotation')
export class UserAnnotationResolver {
  constructor(
    private readonly userAnnotationService: UserAnnotationService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getUserAnnotations(
    @Context() context,
    @Args('input') input: GetUserAnnotationInput,
  ): Promise<GetUserAnnotationResponse> {
    const { _id: ownerId }: { _id: string } = context.req.user;
    const result = await this.userAnnotationService.getAnnotations(ownerId, input);
    return result;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async createUserAnnotation(
    @Context() context,
    @Args('input') input: CreateUserAnnotationInput,
  ): Promise<BasicResponse> {
    const { _id: ownerId } : { _id: string } = context.req.user;
    await this.userAnnotationService.createUserAnnotation({
      annotation: input,
      ownerId,
    });

    return {
      message: 'Create annotation successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async removeUserAnnotation(
    @Context() context,
    @Args('id') id: string,
  ): Promise<BasicResponse> {
    const { _id: ownerId } : { _id: string } = context.req.user;
    await this.userAnnotationService.removeUserAnnotation({ id, ownerId });
    return {
      message: 'Remove annotation successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateUserAnnotationPosition(
    @Context() context,
    @Args('input') input: UpdateUserAnnotationPositionInput,
  ): Promise<any> {
    const { _id: ownerId } : { _id: string } = context.req.user;
    await this.userAnnotationService.updateUserAnnotationPosition({ data: input, ownerId });

    return {
      message: "Update annotation's position successfully.",
      statusCode: HttpStatus.OK,
    };
  }
}
