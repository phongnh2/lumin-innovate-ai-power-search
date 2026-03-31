import {
  UseGuards, Inject,
} from '@nestjs/common';
import {
  Resolver, Args, Parent, ResolveField, Subscription, Context, Query,
} from '@nestjs/graphql';
import { PipelineStage, Types } from 'mongoose';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import {
  SUBSCRIPTION_UPDATE_TEAMS,
} from 'Common/constants/SubscriptionConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { CurrentTeam } from 'Common/decorators/team.decorator';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { EnvironmentService } from 'Environment/environment.service';
import {
  UserQueryInput, QueryOptionsInput, GetBelongsToOptions, BelongsToData, Folder, Team,
} from 'graphql.schema';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TeamPermissionGuard } from 'Team/guards/graph.team.permission.guard';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Resolver('Team')
export class TeamResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly teamService: TeamService,
    private readonly membershipService: MembershipService,
    private readonly userService: UserService,
    private readonly environmentService: EnvironmentService,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
  ) { }

  @Subscription(SUBSCRIPTION_UPDATE_TEAMS)
  updateTeams(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_TEAMS}.${input.clientId}`);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(TeamPermissionGuard)
  @UseGuards(GqlAuthGuard)
  @AcceptancePermissions(
    TeamRoles.ALL,
  )
  @Query('team')
  async getTeam(
    @CurrentTeam() team: ITeam,
    @Context('req') { user }: { user: User },
  ): Promise<ITeam> {
    await this.organizationTeamService.updateLastAccessedTeam({ userId: user._id, orgId: team.belongsTo.toHexString(), teamId: team._id });
    return team;
  }

  @ResolveField('owner')
  getOwner(@Parent() team): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.userService.findUserById(team.ownerId);
  }

  @ResolveField('members')
  getMembers(@Parent() team, @Args('input') userInput: UserQueryInput = {}, @Args('options') options: QueryOptionsInput = {}): Promise<User[]> {
    const optionsPipeline = this.membershipService.transformSortMembersOptionsPipeline(options.sort, options.offset, options.limit);

    const andConditions = this.membershipService.getPipelineLookupMembers(userInput);
    if (options.cursor) {
      andConditions.unshift({
        _id: { $gt: options.cursor },
      });
    }
    return this.membershipService.aggregateMembers([{
      $match: {
        teamId: new Types.ObjectId(team._id as string),
      },
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
    }, ...optionsPipeline, {
      $replaceRoot: { newRoot: '$user' },
    }] as PipelineStage[]);
  }

  @ResolveField('membersCount')
  async getMembersCount(@Parent() team, @Args('input') userInput: UserQueryInput = {}): Promise<number> {
    const andConditions: any[] = this.membershipService.getPipelineLookupMembers(userInput);

    const members = await this.membershipService.aggregateMembers([{
      $match: {
        teamId: new Types.ObjectId(team._id as string),
      },
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
    }]);
    return members.length;
  }

  @ResolveField('totalMembers')
  async getTotalMembers(@Parent() team): Promise<number> {
    const membershipLength = (await this.membershipService.find({ teamId: team._id })).length;
    const inviteUsersLength = (await this.organizationService.getInviteOrgList({ target: team._id, type: 'inviteOrganizationTeam' })).length;
    return Number(inviteUsersLength) + Number(membershipLength);
  }

  @ResolveField('totalActiveMembers')
  async getTotalActiveMembers(@Parent() team): Promise<number> {
    const membershipLength = (await this.membershipService.find({ teamId: team._id })).length;
    return membershipLength;
  }

  @ResolveField('roleOfUser')
  async getRoleOfUser(@Parent() team, @Context() context): Promise<string> {
    const { user } = context.req;
    const membership = await this.membershipService.findOne({
      userId: user._id,
      teamId: team._id,
    }, { role: 1 });
    if (membership) return membership.role;
    return '';
  }

  @ResolveField('belongsTo')
  async getBelongsToData(@Parent() team, @Args('options') options: GetBelongsToOptions = {}): Promise<BelongsToData> {
    const belongsTo: BelongsToData = {
      targetId: team.belongsTo,
      type: 'organization',
    };
    if (options.detail) {
      const organization = await this.organizationService.getOrgById(team.belongsTo as string);
      belongsTo.detail = organization;
    }
    return belongsTo;
  }

  @ResolveField('payment')
  async getPaymentOfTeam(@Parent() team): Promise<any> {
    const { payment } = await this.organizationService.getOrgById(team.belongsTo as string, { payment: 1 });
    return {
      type: payment.type,
    };
  }

  @ResolveField('folders')
  getOrgFolders(@Parent() team: Team): Promise<Folder[]> {
    return this.organizationService.getFolders(team._id);
  }
}
