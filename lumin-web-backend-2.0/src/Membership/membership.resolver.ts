/* eslint-disable max-classes-per-file */
import {
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Args, Query,
} from '@nestjs/graphql';
import { PipelineStage, Types } from 'mongoose';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import {
  UserQueryInput,
  QueryOptionsInput,
  Membership,
  MembershipInput,
} from 'graphql.schema';
import { MembershipService } from 'Membership/membership.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamPermissionGuard } from 'Team/guards/graph.team.permission.guard';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

@UseGuards(GqlAuthGuard)
@Resolver('Membership')
export class MembershipResolver {
  constructor(
    private readonly teamService: TeamService,
    private readonly membershipService: MembershipService,
    private readonly userService: UserService,
  ) { }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(TeamPermissionGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    TeamRoles.ALL,
  )
  @Query('memberships')
  async getMemberships(
    @Args('input') input: MembershipInput,
    @Args('options') options: QueryOptionsInput,
    @Args('userInput') userInput: UserQueryInput,
  ): Promise<Membership[]> {
    const team = input.teamId ? await this.teamService.findOneById(input.teamId) : null;
    const optionsPipeline = this.membershipService.transformSortMembersOptionsPipeline(options.sort, options.offset, options.limit);
    const andConditions: any[] = this.membershipService.getPipelineLookupMembers(userInput);
    const formattedInput: any = {
      teamId: new Types.ObjectId(input.teamId),
      ...(input.role ? { role: input.role } : undefined),
    };
    const roleValueCondition = this.membershipService.getSortRoleValueCondition(team.ownerId);
    const memberships = await this.membershipService.aggregateMembers([{
      $match: formattedInput,
    }, {
      $project: roleValueCondition,
    }, {
      $lookup: {
        from: 'users',
        let: {
          userId: '$userId',
        },
        pipeline: [{
          $match: {
            $and: andConditions,
          },
        }],
        as: 'user',
      },
    }, {
      $unwind: '$user',
    },
    ...optionsPipeline] as PipelineStage[]);
    return memberships;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(TeamPermissionGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @Query('membershipsCount')
  @AcceptancePermissions(
    TeamRoles.ALL,
  )
  async getMembershipsCount(
    @Args('input') input: MembershipInput,
    @Args('userInput') userInput: UserQueryInput,
  ): Promise<number> {
    const transformedQuery: any = {};
    if (userInput.notUserId) {
      transformedQuery._id = { $ne: new Types.ObjectId(userInput.notUserId) };
    }
    delete userInput.notUserId;
    if (userInput.searchText) {
      const searchRegex = Utils.transformToSearchRegex(userInput.searchText);
      transformedQuery.$or = [{
        email: { $regex: searchRegex, $options: 'i' },
      }, {
        name: { $regex: searchRegex, $options: 'i' },
      }];
    }
    delete userInput.searchText;

    const memberships = await this.membershipService.find(input);

    const andConditions = [{
      _id: { $in: memberships.map((m) => m.userId) },
    }, userInput, transformedQuery];

    return this.userService.countUsersByCustomConditions({
      $and: andConditions,
    });
  }
}
