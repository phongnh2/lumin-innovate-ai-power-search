import {
  Inject, Injectable, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  InsertManyOptions,
  Model,
  PipelineStage,
  ProjectionType,
  Types,
  UpdateQuery,
} from 'mongoose';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { TEAM_SIZE_LIMIT_FOR_NOTI } from 'Common/constants/TeamConstant';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { Utils } from 'Common/utils/Utils';

import { Callback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';
import { MAX_MEMBERS_FOR_PARTIAL_MENTION } from 'constant';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import {
  MembershipInput,
  MembershipSortInput,
  UserQueryInput,
} from 'graphql.schema';
import { IAddTeamMember, IMembership, IMembershipModel } from 'Membership/interfaces/membership.interface';
import { INotification } from 'Notication/interfaces/notification.interface';
import { NotificationService } from 'Notication/notification.service';
import { SortStrategy } from 'Organization/organization.enum';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamProviderEnums } from 'Team/team.enum';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class MembershipService {
  constructor(
    @InjectModel('Membership') private readonly membershipModel: Model<IMembershipModel>,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EventServiceFactory))
    private readonly eventService: EventServiceFactory,
    @Callback(RedisConstants.REDIS_EXPIRED) private readonly redisExpiredCallback: CallbackService,
  ) {
    redisExpiredCallback.registerCallbacks([{
      // eslint-disable-next-line unused-imports/no-unused-vars
      run: ({ key }: { key: string}) => {
        // empty
      },
    }]);
  }

  public async createOne(membership: MembershipInput): Promise<IMembership> {
    const createdMembership = await this.membershipModel.create(membership as any);
    return { ...createdMembership.toObject(), _id: createdMembership._id.toHexString() };
  }

  public async createMany(memberships: MembershipInput[], options?: InsertManyOptions): Promise<IMembership[]> {
    const insertMemberships = await this.membershipModel.insertMany(memberships, options);
    return insertMemberships.map((membership) => ({ ...membership.toObject(), _id: membership._id.toHexString() }));
  }

  public async findOne(findConditions: FilterQuery<IMembership>, projection?: ProjectionType<IMembership>): Promise<IMembership> {
    const membership = await this.membershipModel.findOne(findConditions, projection).exec();
    return membership ? { ...membership.toObject(), _id: membership._id.toHexString() } : null;
  }

  // eslint-disable-next-line default-param-last
  public async find(findConditions: FilterQuery<IMembership>, options = {}, projection?: ProjectionType<IMembership>): Promise<IMembership[]> {
    const memberships = await this.membershipModel.find(findConditions, projection, options).exec();
    return memberships.map((membership) => ({ ...membership.toObject(), _id: membership._id.toHexString() }));
  }

  public async update(findConditions: FilterQuery<IMembership>, updateObj: UpdateQuery<IMembership>) {
    const updatedMembership = await this.membershipModel.findOneAndUpdate(findConditions, updateObj).exec();
    return updatedMembership ? { ...updatedMembership.toObject(), _id: updatedMembership._id.toHexString() } : null;
  }

  public deleteOne(findConditions: FilterQuery<IMembership>) {
    return this.membershipModel.deleteOne(findConditions);
  }

  public deleteMany(findConditions: FilterQuery<IMembership>, session: ClientSession = null) {
    return this.membershipModel.deleteMany(findConditions).session(session);
  }

  public countTeamMember(teamId: string): Promise<number> {
    return this.membershipModel.countDocuments({ teamId }).exec();
  }

  public getMembers(team: ITeam, searchText = '', filterRole = 'all', ...options) {
    const andConditions: any[] = [{ $expr: { $eq: ['$_id', '$$userId'] } }];
    const matchConditions = {} as any;
    if (filterRole !== 'all') matchConditions.role = filterRole;
    if (filterRole === 'owner') {
      matchConditions.userId = team.ownerId;
      matchConditions.role = TeamProviderEnums.ADMIN;
    }
    if (searchText) {
      andConditions.push({
        $or: [{
          email: new RegExp(searchText, 'i'),
        }, {
          name: new RegExp(searchText, 'i'),
        }],
      });
    }
    return this.aggregateMembers([
      {
        $match: {
          teamId: new Types.ObjectId(team._id),
          ...matchConditions,
        },
      },
      {
        $project: {
          userId: 1,
          role: 1,
          roleValue: {
            $cond: [
              { $eq: ['$role', TeamProviderEnums.ADMIN] },
              0,
              { $cond: [{ $eq: ['$role', TeamProviderEnums.MODERATOR] }, 1, 2] },
            ],
          },
          isOwner: {
            $eq: ['$userId', team.ownerId],
          },
        },
      },
      {
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
      },
      { $unwind: '$user' },
      ...options,
    ] as PipelineStage[]);
  }

  public async isHigherRole(
    teamId: string,
    higherId: string,
    lowerId: string,
  ): Promise<boolean> {
    const [higherMembership, lowerMembership] = await Promise.all([
      this.findOne({
        userId: higherId,
        teamId,
      }),
      this.findOne({
        userId: lowerId,
        teamId,
      }),
    ]);
    if (!higherMembership || !lowerMembership) return false;
    const { role: higherRole } = higherMembership;
    const { role: lowerRole } = lowerMembership;
    return (
      (higherRole === TeamProviderEnums.ADMIN && lowerRole === TeamProviderEnums.MODERATOR)
      || (higherRole === TeamProviderEnums.ADMIN && lowerRole === TeamProviderEnums.MEMBER)
      || (higherRole === TeamProviderEnums.MODERATOR && lowerRole === TeamProviderEnums.MEMBER)
    );
  }

  public aggregateMembers(pipeline: PipelineStage[]) {
    return this.membershipModel.aggregate(pipeline).exec();
  }

  public async checkUserInTeam(teamId: string, userId: string) {
    const checkUserInTeam = await this.membershipModel.findOne(
      { userId, teamId },
      { _id: 1, role: 1 },
    ).exec();
    return { ...checkUserInTeam.toObject(), _id: checkUserInTeam._id.toHexString() };
  }

  public async handleAddMemberToTeam({
    members,
    resource,
  } : IAddTeamMember): Promise<IMembership[]> {
    const { team } = resource;
    const membership = await this.createMany(
      members.map((member) => ({
        role: member.role,
        userId: member.userId,
        teamId: team._id,
      })) as MembershipInput[],
    );
    this.notificationService.sendNotificationAfterAddTeamMember({
      members, resource,
    });
    return membership;
  }

  public createAddMemberToTeamEvent(actor: User, team: ITeam, members: Record<string, any>[]): void {
    Promise.all(members.map(async (member) => {
      const eventData: ICreateEventInput = {
        eventName: NonDocumentEventNames.TEAM_MEMBER_ADDED,
        eventScope: EventScopes.TEAM,
        actor,
        team,
      };
      const { userId } = member;
      if (userId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        eventData.target = await this.userService.findUserById(userId);
      } else {
        eventData.nonLuminEmail = member.email;
      }
      this.eventService.createEvent(eventData);
    }));
  }

  async publishNotiToAllTeamMember(
    teamId: string,
    notification: NotiInterface,
    excludes: string[] = [],
    extraMembers: string[] = [],
  ): Promise<INotification> {
    const members = await this.find({ teamId }, {}, { _id: 1, userId: 1, role: 1 });
    let receiverIds: string[];
    if (members.length > TEAM_SIZE_LIMIT_FOR_NOTI) {
      receiverIds = members
        .filter((member) => member.role === TeamRoles.ADMIN && !excludes.includes(member.userId.toHexString()))
        .map((member) => member.userId.toHexString());
    } else {
      receiverIds = members
        .filter((member) => !excludes.includes(member.userId.toHexString()))
        .map((member) => member.userId.toHexString());
    }
    if (!receiverIds.length && !extraMembers.length) {
      return null;
    }
    return this.notificationService.createUsersNotifications(notification, [...receiverIds, ...extraMembers]);
  }

  transformSortMembersOptionsPipeline(sort: MembershipSortInput, offset: number, limit: number) : any {
    const optionsPipeline = [];
    let sortOptions : Record<string, unknown> = {};
    if (sort) {
      if (sort.email) {
        sortOptions['user.email'] = SortStrategy[sort.email];
      }
      if (sort.name) {
        sortOptions['user.name'] = SortStrategy[sort.name];
      }
    }
    if (!sort || !Object.keys(sortOptions).length) {
      sortOptions = {
        roleValue: SortStrategy[sort?.roleValue] || SortStrategy.ASC,
        _id: SortStrategy[sort?._id] || SortStrategy.ASC,
        isOwner: SortStrategy[sort?.isOwner] || SortStrategy.ASC,
      };
    }
    optionsPipeline.push({ $sort: sortOptions });

    if (offset) optionsPipeline.push({ $skip: offset });
    if (limit) optionsPipeline.push({ $limit: limit });

    return optionsPipeline;
  }

  getPipelineLookupMembers(userInput: UserQueryInput) : any[] {
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

    return [{
      $expr: {
        $eq: ['$_id', '$$userId'],
      },
    }, transformedQuery];
  }

  getSortRoleValueCondition(teamOwnerId: Types.ObjectId) : Record<string, any> {
    return {
      userId: 1,
      role: 1,
      roleValue: {
        $cond: [
          { $eq: ['$role', TeamProviderEnums.ADMIN] },
          0,
          { $cond: [{ $eq: ['$role', TeamProviderEnums.MODERATOR] }, 1, 2] },
        ],
      },
      isOwner: {
        $eq: ['$userId', teamOwnerId],
      },
    };
  }

  estimatedMembers(teamId: string, params?: { limit?: number }) {
    const { limit } = params || {};
    return this.membershipModel.countDocuments({
      teamId,
    }, { limit });
  }

  estimateMentionableMembers(teamId: string) {
    return this.estimatedMembers(teamId, { limit: MAX_MEMBERS_FOR_PARTIAL_MENTION });
  }
}
