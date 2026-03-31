import {
  Injectable, Inject, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionType,
  SortOrder,
  UpdateQuery,
} from 'mongoose';

import { EnvConstants } from 'Common/constants/EnvConstants';
import {
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
} from 'Common/constants/SubscriptionConstants';

import { AwsService } from 'Aws/aws.service';

import { ROLE } from 'constant';
import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { Team } from 'graphql.schema';
import { IMembershipModel } from 'Membership/interfaces/membership.interface';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { IMembership } from 'Team/interfaces/membership.interface';
import { ITeam, ITeamModel } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class TeamService {
  constructor(
    @Inject('Team') private readonly teamModel: Model<ITeamModel>,
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Membership') private readonly membershipModel: Model<IMembershipModel>,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => DocumentService)) private readonly documentService: DocumentService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) { }

  public async create(team: Partial<Team>): Promise<ITeam> {
    const createdTeam = await this.teamModel.create(team as any);
    return { ...createdTeam.toObject(), _id: createdTeam._id.toHexString() };
  }

  public aggregate(pipeline: PipelineStage[]): Promise<any> {
    return this.teamModel.aggregate(pipeline).exec();
  }

  public async edit(_id: string, updateObject: UpdateQuery<ITeam>): Promise<ITeam> {
    const updatedTeam = await this.teamModel.findOneAndUpdate({ _id }, updateObject, { new: true }).exec();
    return updatedTeam ? { ...updatedTeam.toObject(), _id: updatedTeam._id.toHexString() } : null;
  }

  public removeAvatarFromS3(avatarRemoteId: string): Promise<any> {
    if (!avatarRemoteId) return null;
    return this.awsService.removeFileFromBucket(avatarRemoteId, EnvConstants.S3_PROFILES_BUCKET);
  }

  public removeTeamWithoutPaymentChecking(teamId: string) : any {
    return this.teamModel.deleteOne({
      _id: teamId,
    });
  }

  public deleteOrgTeamsByConditions(conditions: unknown, session: ClientSession = null): any {
    return this.teamModel.deleteMany(conditions).session(session).exec();
  }

  public async findOneById(teamId: string, projection?: ProjectionType<ITeam>): Promise<ITeam> {
    const findConditions = {
      _id: teamId,
    };
    const team = await this.teamModel.findOne(findConditions, projection).exec();
    return team ? { ...team.toObject(), _id: team._id.toHexString() } : null;
  }

  public getOneMembershipOfUser(
    userId: string,
    condition?: Record<string, unknown>,
    projection?: Record<string, number>,
  ): Promise<IMembership> {
    return this.membershipService.findOne({ userId, ...condition }, projection);
  }

  public getMemberships(condition: FilterQuery<IMembership>, projection?: ProjectionType<IMembership>): Promise<IMembership[]> {
    return this.membershipService.find(condition, {}, projection);
  }

  public getAllMembersInTeam(teamId: string, projection?: ProjectionType<IMembership>): Promise<IMembership[]> {
    return this.membershipService.find({ teamId }, {}, projection);
  }

  public async find(findConditions: FilterQuery<ITeam>, projection?: ProjectionType<ITeam>): Promise<ITeam[]> {
    const teams = await this.teamModel.find(findConditions, projection).sort({ createdAt: -1 }).exec();
    return teams.map((team) => ({ ...team.toObject(), _id: team._id.toHexString() }));
  }

  public async findOne(findConditions: FilterQuery<ITeam>): Promise<ITeam> {
    const team = await this.teamModel.findOne(findConditions).exec();
    return team ? { ...team.toObject(), _id: team._id.toHexString() } : null;
  }

  public async findTeamByOwner(userId:string, conditions?: FilterQuery<ITeam>, projection?: ProjectionType<ITeam>) {
    const teams = await this.teamModel.find({ ownerId: userId, ...conditions }, projection);
    return teams.map((team) => ({ ...team.toObject(), _id: team._id.toHexString() }));
  }

  public async findTeamByCustomerId(customerRemoteId) {
    const team = await this.teamModel.findOne({ 'payment.customerRemoteId': customerRemoteId }).exec();
    return team ? { ...team.toObject(), _id: team._id.toHexString() } : null;
  }

  public async editPhoto(findConditions: FilterQuery<ITeam>, keyFile): Promise<ITeam> {
    const updatedTeam = await this.teamModel
      .findOneAndUpdate(findConditions, {
        avatarRemoteId: keyFile,
      }, { new: true })
      .exec();
    return updatedTeam ? { ...updatedTeam.toObject(), _id: updatedTeam._id.toHexString() } : null;
  }

  public async updateTeamProperty(_id, updateFields): Promise<ITeam> {
    const team = await this.teamModel
      .findOneAndUpdate({ _id }, { $set: { ...updateFields } }, { new: true })
      .exec();
    return team ? { ...team.toObject(), _id: team._id.toHexString() } : null;
  }

  public async getAdminEmails(teamId: string): Promise<string[]> {
    try {
      const memberships = await this.membershipModel.find({ teamId, role: ROLE.ADMIN });
      const users = await Promise.all<User>(memberships.map((membership) => this.userService.findUserById(membership.userId)));
      return users.map((user) => user.email);
    } catch (err) {
      return null;
    }
  }

  public async getTeamMemberByRole(teamId: string, roles: string[] = [ROLE.ADMIN]): Promise<User[]> {
    try {
      const memberships = await this.membershipModel.find({ teamId, role: { $in: roles } });
      const users = await Promise.all<User>(memberships.map((membership) => this.userService.findUserById(membership.userId)));
      return users;
    } catch (err) {
      return null;
    }
  }

  public async getMembersFromTeam(currentTeam: ITeam) {
    const teamMembers = await this.membershipService.getMembers(currentTeam);
    return teamMembers.map((member) => member.userId);
  }

  public async getAllPendingMembers(teamId: string): Promise<{ email: string, role: string }[]> {
    const inviteUsers = await this.redisService.getAllHsetData(`INS:${teamId}`);
    const pendingMembers = inviteUsers.map((user) => {
      const { key, value } = user;
      return {
        email: key,
        role: value,
      };
    });
    return pendingMembers;
  }

  public initTeamInfoForRealTime(currentTeam: ITeam) {
    const teamUpdated = JSON.parse(JSON.stringify(currentTeam));
    teamUpdated.payment = {
      currency: teamUpdated.payment.currency || null,
      period: teamUpdated.payment.period || null,
      quantity: teamUpdated.payment.quantity || null,
      status: teamUpdated.payment.status || null,
      type: teamUpdated.payment.type,
    };
    return teamUpdated;
  }

  public publishUpdateTeams(receiverIds, payload, publishType) {
    receiverIds.forEach((receiverId) => {
      this.pubSub.publish(`${publishType}.${receiverId}`, {
        [publishType]: {
          clientId: receiverId,
          ...payload,
        },
      });
    });
  }

  public async isTeamPremium(teamId: string): Promise<boolean> {
    const team = await this.findOneById(teamId, { payment: 1 });
    return team && team.payment.type !== PaymentPlanEnums.FREE;
  }

  public async getOnePremiumTeamOfUser(clientId: any): Promise<ITeam> {
    const [premiumTeam] = await this.membershipModel.aggregate([
      { $match: { userId: clientId } },
      { $project: { teamId: 1 } },
      {
        $lookup: {
          from: 'teams',
          let: {
            teamId: '$teamId',
          },
          pipeline: [{
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$teamId'] },
                ],
              },
            },
          }],
          as: 'team',
        },
      },
      { $unwind: '$team' },
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ['$team.payment.type', PaymentPlanEnums.FREE] },
            ],
          },
        },
      },
      { $replaceRoot: { newRoot: '$team' } },
      { $limit: 1 },
    ]);
    return premiumTeam;
  }

  public async removeAllDocumentsByTeamId(
    teamId: string,
    receiverIds: string[],
    docType: DocumentRoleEnum = DocumentRoleEnum.ORGANIZATION_TEAM,
  ): Promise<string[]> {
    try {
      const docs = await this.documentService.getDocumentPermission(teamId, { role: docType });
      const deletedDocs = await Promise.all(docs.map(async (doc) => {
        const document = await this.documentService.getDocumentByDocumentId(
          doc.documentId,
        );
        const ownerUser = await this.userService.findUserById(document.ownerId, { name: 1, avatarRemoteId: 1 });
        const cloneDocument = this.documentService.cloneDocument(
          JSON.stringify(document),
          {
            ownerName: ownerUser?.name || 'Anonymous',
            ownerAvatarRemoteId: ownerUser?.avatarRemoteId,
          },
        );
        const shareUsers = await this.userService.getShareUsers(doc.documentId, docType);
        const receivedUser = new Set([...shareUsers, ...receiverIds]);
        this.documentService.publishUpdateDocument(
          receivedUser,
          {
            document: cloneDocument,
            type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
          },
          SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
        );
        await Promise.all([
          this.documentService.deleteDocument(doc.documentId),
          this.documentService.deleteDocumentPermissions({
            documentId: doc.documentId,
          })]);
        return doc.documentId;
      }));
      return deletedDocs;
    } catch (error) {
      return [];
    }
  }

  getTotalTeam(condition: Record<string, any>): Promise<number> {
    return this.teamModel.countDocuments(condition).exec();
  }

  public async getTeamMemberShipByConditions({
    conditions,
    projection,
    sortOptions,
    limit = 0,
  }: {
    conditions: Record<string, unknown>,
    projection?: Record<string, string>,
    sortOptions?: Record<string, number>,
    limit?: number,
  }): Promise<IMembership[]> {
    const findMemberQuery = this.membershipModel.find(conditions, projection);
    let members;
    if (sortOptions) {
      members = await findMemberQuery.sort(sortOptions as unknown as { [key: string]: SortOrder }).limit(limit).exec();
    } else {
      members = await findMemberQuery.limit(limit).exec();
    }
    return members.map((member) => ({ ...member.toObject(), _id: member._id.toHexString() }));
  }

  public async getUserTeams(user: User, organization: IOrganization): Promise<ITeam[]> {
    const memberships = await this.membershipService.find({ userId: user._id });
    return this.find({ _id: { $in: memberships.map((membership) => membership.teamId) }, belongsTo: organization._id });
  }

  public async getUserTeamsByOrgMembership(orgMembership: IOrganizationMember): Promise<ITeam[]> {
    const memberships = await this.membershipService.find({ userId: orgMembership.userId });
    return this.find({
      _id: { $in: memberships.map((membership) => membership.teamId) },
      belongsTo: orgMembership.orgId,
    });
  }
}
