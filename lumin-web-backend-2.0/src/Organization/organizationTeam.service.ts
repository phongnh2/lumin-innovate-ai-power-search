import {
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PipelineStage,
  ProjectionType,
  Types,
} from 'mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import {
  NotiOrgTeam,
  NotiDocument,
  MAX_TEAM_MEMBERS_FOR_ALL_NOTI,
} from 'Common/constants/NotificationConstants';
import {
  SUBSCRIPTION_UPDATE_TEAMS, SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_MANAGER, SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_LUMIN_ADMIN,
} from 'Common/constants/SubscriptionConstants';
import { TEAM_SIZE_LIMIT_FOR_NOTI } from 'Common/constants/TeamConstant';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiOrgFactory, notiDocumentFactory } from 'Common/factory/NotiFactory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { notiFirebaseTeamFactory } from 'Common/factory/NotiFirebaseFactory';

import { AwsService } from 'Aws/aws.service';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { IDocument } from 'Document/interfaces/document.interface';
import { EmailService } from 'Email/email.service';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FolderService } from 'Folder/folder.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  FindUserPayload, MembershipInput, SearchUserStatus, TransferTeamsOwnershipInput, Document, Team,
} from 'graphql.schema';
import { IAddTeamMember } from 'Membership/interfaces/membership.interface';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { IOrganizationGroupPermission } from 'Organization/interfaces/organization.group.permission.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { AccessTypeOrganization, OrganizationTeamRoles } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { IMembership } from 'Team/interfaces/membership.interface';
import { CreateTeamInput, ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class OrganizationTeamService {
  constructor(
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => EventServiceFactory))
    private readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => EventsGateway))
    private readonly messageGateway: EventsGateway,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly redisService: RedisService,
  ) {
  }

  getUserById(userId: string): Promise<User> {
    return this.userService.findUserById(userId);
  }

  getUserByIds(userIds: string[]): Promise<User[]> {
    return this.userService.findUserByIds(userIds);
  }

  getUserByEmail(email: string): Promise<User> {
    return this.userService.findUserByEmail(email);
  }

  findMembershipsByCondition(conditions: Record<string, any>, projection?: ProjectionType<IMembership>): Promise<IMembership[]> {
    return this.membershipService.find(conditions, {}, projection);
  }

  createTeam(teamInput: CreateTeamInput): Promise<ITeam> {
    return this.teamService.create(teamInput);
  }

  createMembershipInTeam(membershipInput: Record<string, unknown>): Promise<IMembership> {
    return this.membershipService.createOne(membershipInput);
  }

  async removeMembershipInTeam(teamId: string, userId: string, orgId: string): Promise<any> {
    const memberGroup = await this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.MEMBER, { _id: 1 });
    const team = await this.getOrgTeamById(teamId);
    if (memberGroup) {
      await Promise.all([
        this.organizationService.updateOrganizationMemberPermission(userId, orgId, {
          $pull: { groups: memberGroup._id },
        }),
        this.documentService.updateDocumentOwnerId({
          refId: teamId,
          oldOwnerId: userId,
          ownerId: team.ownerId.toHexString(),
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
        }),
      ]);
    }
    return this.membershipService.deleteOne({ teamId, userId }).exec();
  }

  async removeMembershipInTeams(teamIds: string[], userId: string, orgId: string): Promise<any> {
    return Promise.all(teamIds.map((teamId) => this.removeMembershipInTeam(teamId, userId, orgId)));
  }

  removeAllMembershipInTeam(teamId: string): Promise<any> {
    return this.membershipService.deleteMany({ teamId }).exec();
  }

  updateTeamById(teamId: string, updateObj: Record<string, unknown>): Promise<ITeam> {
    return this.teamService.edit(teamId, updateObj);
  }

  uploadTeamAvatarToS3({
    fileBuffer,
    mimetype,
  }: { fileBuffer: Buffer; mimetype: string; filename: string }): Promise<string> {
    return this.awsService.uploadTeamAvatarWithBuffer(
      fileBuffer,
      mimetype,
    );
  }

  getOrgTeamById(teamId: string): Promise<ITeam> {
    return this.teamService.findOneById(teamId);
  }

  getOrgTeamMembershipOfUser(userId: string, teamId: string, projection?: Record<string, number>): Promise<IMembership> {
    return this.teamService.getOneMembershipOfUser(userId, { teamId }, projection);
  }

  getOrgMembershipOfUser(userId: string, orgId: string, projection?: Record<string, number>): Promise<IOrganizationMember> {
    return this.organizationService.getMembershipByOrgAndUser(orgId, userId, projection);
  }

  getOrgTeamMember(conditions: FilterQuery<IMembership>, projection?: Record<string, number>): Promise<IMembership[]> {
    return this.membershipService.find(conditions, null, projection);
  }

  getOrgTeams(orgId: string): Promise<ITeam[]> {
    return this.teamService.find({ belongsTo: orgId });
  }

  async getOrgOfTeam(teamId: string) : Promise<IOrganization> {
    const team = await this.getOrgTeamById(teamId);
    if (!team) {
      return null;
    }

    return this.organizationService.getOrgById(team.belongsTo as string);
  }

  async getOrgTeamIdsOfUser(orgId: string, userId: string): Promise<string[]> {
    const orgTeams = await this.getOrgTeams(orgId);
    const teamIds = orgTeams.map((team) => team._id);
    if (teamIds.length) {
      const orgTeamIdsOfUser = await Promise.all(teamIds.map((teamId) => this.membershipService.findOne({ userId, teamId })));
      return orgTeamIdsOfUser.filter(Boolean).map((item) => item && item.teamId.toHexString());
    }
    return [];
  }

  async getOrgTeamsByUserId(orgId: string, userId: string, teamRole?: OrganizationTeamRoles): Promise<ITeam[]> {
    const teams = await this.teamService.find({
      belongsTo: new Types.ObjectId(orgId),
    });

    const membershipTeams = await Promise.all(
      teams.map((team) => this.membershipService.find({
        teamId: team._id,
        userId,
        ...(teamRole ? { role: teamRole } : undefined),
      })),
    );

    return teams.filter((_, index) => membershipTeams[index].length);
  }

  async inviteMemberWhenCreateOrgTeam(
    params: {
      members: MembershipInput[], actorInfo: User, team: ITeam, organization: IOrganization, groupPermissions: IOrganizationGroupPermission[]
    },
  ): Promise<IMembership[]> {
    const {
      members, actorInfo, team, organization, groupPermissions,
    } = params;
    if (!members.length) {
      return [];
    }
    const memberGroupPermission = groupPermissions.find((group) => group.name === OrganizationTeamRoles.MEMBER);
    const addTeamMemberData = {
      members: members.map((member) => ({ ...member, role: OrganizationTeamRoles.MEMBER })),
      resource: { actor: actorInfo, team, organization },
    } as IAddTeamMember;
    const addedMembers = await this.membershipService.handleAddMemberToTeam(addTeamMemberData);
    const memberIds = addedMembers.map((member) => member.userId.toHexString());
    this.organizationService.updateOrganizationPermission(
      { userId: { $in: memberIds }, orgId: organization._id },
      { $push: { groups: memberGroupPermission._id } },
    );
    members.forEach((member) => this.organizationService.sendEmailInviteOrgTeam(member.userEmail, actorInfo, organization, team));
    this.membershipService.createAddMemberToTeamEvent(actorInfo, team, members);
    return addedMembers;
  }

  async inviteMemberToOrgTeam(luminUsers: MembershipInput[], actorInfo: User, teamId: string, organization: IOrganization): Promise<IMembership[]> {
    const [team, memberGroup] = await Promise.all([
      this.teamService.findOneById(teamId),
      this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.MEMBER, { _id: 1 }),
    ]);

    // handle add member and send noti
    let membership: IMembership[] = [];
    if (luminUsers?.length) {
      const memberShips = await this.membershipService.find({ teamId });
      const listMemberIds = memberShips.map((teamMember) => teamMember.userId.toHexString());
      membership = await Promise.all(luminUsers.map(async (member) => {
        const memberEmail = member.userEmail;
        if ((listMemberIds).includes(member.userId)) {
          return null;
        }
        const addTeamMemberData = {
          members: [{ ...member, role: OrganizationTeamRoles.MEMBER }],
          resource: { actor: actorInfo, team, organization },
        } as IAddTeamMember;
        const [addedMember] = await this.membershipService.handleAddMemberToTeam(addTeamMemberData);
        if (addedMember) {
          this.getUserByEmail(member.userEmail)
            .then((user) => this.organizationService.updateOrganizationMemberPermission(user._id, organization._id, {
              $push: { groups: memberGroup._id },
            }));
          this.documentService.removeRequestAccessDocumentWhenAddedInTeam(teamId, [member]);
          this.organizationService.sendEmailInviteOrgTeam(memberEmail, actorInfo, organization, team);
        }
        return addedMember;
      }));
      this.membershipService.createAddMemberToTeamEvent(actorInfo, team, luminUsers);

      const userIds = luminUsers.map((user) => user.userId);
      const addedUsers = await this.getUserByIds(userIds);

      addedUsers.forEach((addedUser) => {
        const notication = notiOrgFactory.create(NotiOrgTeam.TEAM_MEMBER_INVITED, {
          actor: { user: actorInfo },
          entity: { team, organization },
          target: { user: { _id: addedUser._id, name: addedUser.name } },
        });

        if (listMemberIds.length > MAX_TEAM_MEMBERS_FOR_ALL_NOTI) {
          this.notificationService.createUsersNotifications(notication, [team.ownerId.toHexString()]);
        } else {
          const invitedUserIds = luminUsers.map((user) => user.userId);
          this.membershipService.publishNotiToAllTeamMember(team._id, notication, invitedUserIds);
        }
      });
    }
    return membership;

    // handle add non lumin user
    // if (nonLuminUsers?.length) {
    //   nonLuminUsers.forEach(async (nonUser) => {
    //     const nonUserEmail = nonUser.email;
    //     const isExist = await this.organizationService.findMemberInRequestAccessWithType(
    //       nonUserEmail, organization._id, AccessTypeOrganization.INVITE_ORGANIZATION, { _id: 1 },
    //     );
    //     if (!isExist) {
    //       const memberInvitedOrgBuilder = new InviteOrganizationConcreteBuilder()
    //         .setActor(nonUserEmail)
    //         .setTarget(organization._id)
    //         .setEntity({
    //           role: OrganizationRoleEnums.MEMBER,
    //         });
    //       this.organizationService.createRequestAccess(memberInvitedOrgBuilder.build());
    //     }
    //     const memberInvitedTeamBuilder = new InviteOrganizationTeamConcreteBuilder()
    //       .setActor(nonUserEmail)
    //       .setTarget(team._id)
    //       .setEntity({
    //         role: TeamRoles.MEMBER,
    //         invitee: actorInfo._id,
    //       });
    //     this.organizationService.createRequestAccess(memberInvitedTeamBuilder.build());
    //     this.organizationService.sendEmailInviteOrgTeam(nonUserEmail, actorInfo, organization, team);
    //   });
    // }

    // handle send mail to org admin and billing moderator
    // const listLuminUserNotInOrg = (await Promise.all(luminUsers.map(async (luminUser) => {
    //   const memberFound = await this.organizationService.getMembershipByOrgAndUser(organization._id, luminUser.userId);
    //   if (memberFound) {
    //     return null;
    //   }
    //   return luminUser.userEmail;
    // }))).filter((item) => !!item);
    // const listOrgAdminAndBillingModerator = await this.organizationService.getOrganizationMemberByRole(
    //   organization._id, [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN],
    // );
    // const listUserReceiveEmail = listOrgAdminAndBillingModerator.map((luminUser) => {
    //   if (luminUser.email !== actorInfo.email) {
    //     return luminUser.email;
    //   }
    //   return null;
    // }).filter((item) => !!item);
    // this.organizationService.sendEmailAddedMemberToOrg(
    //   listUserReceiveEmail, actorInfo, organization, [...listLuminUserNotInOrg, ...nonLuminUsers.map((item) => item.email)],
    // );
  }

  async isAdmin(userId: string, organizationId: string): Promise<boolean> {
    const [membership] = await this.teamService.aggregate([
      { $match: { belongsTo: new Types.ObjectId(organizationId) } },
      { $project: { _id: 1 } },
      {
        $lookup: {
          from: 'memberships',
          let: {
            teamId: '$_id',
          },
          pipeline: [{
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$teamId', '$$teamId'] },
                  { $eq: ['$userId', new Types.ObjectId(userId)] },
                  { $eq: ['$role', 'admin'] },
                ],
              },
            },
          }],
          as: 'membership',
        },
      },
      { $unwind: '$membership' },
      { $limit: 1 },
    ]);

    return Boolean(membership);
  }

  async transferTeamOwnership(data: {actorUser: User, targetUser: User, team: ITeam, organization: IOrganization}): Promise<ITeam> {
    const {
      team, organization, actorUser, targetUser,
    } = data;
    const actorId = actorUser._id;
    const teamId = team._id;
    const targetId = targetUser._id;
    const [targetMembership, groupAdmin, groupMember] = await Promise.all([
      this.membershipService.findOne({
        userId: targetId,
        teamId,
      }),
      this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.ADMIN, { _id: 1 }),
      this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.MEMBER, { _id: 1 }),
    ]);

    if (!targetMembership) {
      throw GraphErrorException.BadRequest('Target user is not a team member');
    }

    // set team admin for target
    // set userId to member
    // change owner of team
    const [updatedTeam] = await Promise.all([
      this.teamService.updateTeamProperty(teamId, {
        ownerId: targetId,
      }),
      this.membershipService.update({
        teamId,
        userId: targetId,
      }, { role: TeamRoles.ADMIN }),
      this.membershipService.update({
        teamId,
        userId: actorId,
      }, { role: TeamRoles.MEMBER }),
      this.organizationService.updateOneOrganizationPermission({
        userId: targetId,
        orgId: organization._id,
        groups: groupMember._id,
      }, {
        $set: { 'groups.$': groupAdmin._id },
      }),
      this.organizationService.updateOneOrganizationPermission({
        userId: actorId,
        orgId: organization._id,
        groups: groupAdmin._id,
      }, {
        $set: { 'groups.$': groupMember._id },
      }),
    ]);

    return updatedTeam;
  }

  sendEmailTransferTeamOwnership(data: {actor: User, target: User, team: ITeam, organization: IOrganization}): void {
    const {
      actor, team, organization, target,
    } = data;
    const emailData = {
      actorName: actor.name,
      teamName: team.name,
      teamId: team._id,
      orgId: organization._id,
      subject: SUBJECT[EMAIL_TYPE.TRANSFER_TEAM_ADMIN.description]
        .replace('#{actorName}', actor.name)
        .replace('#{teamName}', team.name),
    };
    this.emailService.sendEmailHOF(EMAIL_TYPE.TRANSFER_TEAM_ADMIN, [target.email], emailData);
  }

  async notifyRemoveMemberInTeam(actor: User, deletedMember: User, team: ITeam): Promise<void> {
    const organization = await this.organizationService.getOrgById(team.belongsTo as string);
    const notification: NotiInterface = notiOrgFactory.create(NotiOrgTeam.REMOVE_MEMBER, {
      actor: { user: actor },
      target: { user: deletedMember },
      entity: { team, organization },
    });
    this.membershipService.publishNotiToAllTeamMember(
      team._id,
      notification,
      [actor._id],
      [deletedMember._id],
    );

    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
      notificationContentForTargetUser: firebaseNotificationContentExtra,
    } = notiFirebaseTeamFactory.create(NotiOrgTeam.REMOVE_MEMBER, {
      organization,
      team,
      actor,
      targetUser: deletedMember,
    });

    this.organizationService.publishFirebaseNotiToAllTeamMember({
      teamId: team._id,
      firebaseNotificationData,
      firebaseNotificationContent,
      excludes: [actor._id, deletedMember._id],
      firebaseNotificationContentExtra,
      extraMembers: [deletedMember._id],
    });
  }

  async notifyLeaveOrganizationTeam(actor: User, team: ITeam): Promise<void> {
    const organization = await this.organizationService.getOrgById(team.belongsTo as string);
    const notification: NotiInterface = notiOrgFactory.create(NotiOrgTeam.LEAVE_ORG_TEAM, {
      actor: { user: actor },
      entity: { team, organization },
    });
    this.membershipService.publishNotiToAllTeamMember(team._id, notification, [actor._id]);
    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseTeamFactory.create(NotiOrgTeam.LEAVE_ORG_TEAM, {
      organization,
      team,
      actor,
    });

    this.organizationService.publishFirebaseNotiToAllTeamMember({
      teamId: team._id,
      firebaseNotificationData,
      firebaseNotificationContent,
      excludes: [actor._id],
    });
  }

  async deleteOrgTeam(data: {
    team: ITeam,
    actor: User,
    membersInTeam: IMembership[],
    organization: IOrganization,
    actorType?: APP_USER_TYPE,
  }): Promise<Record<string, string[] | ITeam>> {
    const {
      team, actor, membersInTeam, organization, actorType = APP_USER_TYPE.LUMIN_USER,
    } = data;
    const members = membersInTeam.map((member) => member.userId);
    const notification: NotiInterface = notiOrgFactory.create(NotiOrgTeam.DELETE_TEAM, {
      actor: { user: actor, actorData: { type: actorType } },
      entity: { team },
      target: { organization },
    });
    const [documents] = await Promise.all([
      this.teamService.removeAllDocumentsByTeamId(team._id, members, DocumentRoleEnum.ORGANIZATION_TEAM),
      this.membershipService.publishNotiToAllTeamMember(team._id, notification, [actor._id]),
    ]);
    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
    } = notiFirebaseTeamFactory.create(NotiOrgTeam.DELETE_TEAM, {
      organization,
      team,
    });
    this.organizationService.publishFirebaseNotiToAllTeamMember({
      teamId: team._id,
      firebaseNotificationData,
      firebaseNotificationContent,
      excludes: [actor._id],
    });
    const memberGroups = await this.organizationService.getGroupPermissionByCondition({ refId: team._id }, { _id: 1 });
    this.organizationService.deleteGroupPermissionByRefId(team._id);
    this.organizationService.updateOrganizationPermission({ userId: { $in: members }, orgId: organization._id }, {
      $pullAll: { groups: memberGroups.map((group) => group._id) },
    });
    this.organizationService.removeRequestAccess({ target: team._id, type: AccessTypeOrganization.INVITE_ORGANIZATION_TEAM });
    this.teamService.removeAvatarFromS3(team.avatarRemoteId);
    await this.teamService.removeTeamWithoutPaymentChecking(team._id);
    this.eventService.createEvent({
      eventName: NonDocumentEventNames.ORG_TEAM_DELETED,
      eventScope: EventScopes.ORGANIZATION,
      actor,
      team,
      organization,
    });
    return {
      team,
      documents,
      members,
    };
  }

  async deleteOrgTeamsResource(teamIds: string[], session?: ClientSession): Promise<any[]> {
    return Promise.all([
      this.organizationService.deleteGroupPermissionsByCondition({ refId: { $in: teamIds } }, {}, session),
      this.teamService.deleteOrgTeamsByConditions({ _id: { $in: teamIds } }, session),
    ]);
  }

  async validateMembershipsInOrganization(
    organizationId: string,
    members: MembershipInput[],
  ): Promise<MembershipInput[]> {
    const userIds = members.map((member) => member.userId);
    const conditions = {
      userId: { $in: userIds },
      orgId: organizationId,
    };
    const memberInOrg = await this.organizationService.getOrgMembershipByConditions({ conditions });
    const memberInOrgIds = memberInOrg.map((member) => member.userId.toHexString());
    return members.filter((member) => memberInOrgIds.includes(member.userId));
  }

  async getMembershipsInOrgTeam(orgId: string, userId: string): Promise<IMembership[]> {
    const teamsOfOrganization = await this.teamService.find({ belongsTo: orgId });
    const teamIdsOfOrganization = teamsOfOrganization.map((team) => team._id);
    return this.membershipService.find({ userId, teamId: { $in: teamIdsOfOrganization } });
  }

  async createDefaultPermissionWhenCreateTeam(orgTeam: ITeam, createdUserId: string): Promise<IOrganizationGroupPermission[]> {
    const groupPermissions = await this.organizationService.createDefaultPermission(orgTeam._id, Resource.ORGANIZATION_TEAM);
    const adminGroupPermission = groupPermissions.find((group) => group.name === OrganizationTeamRoles.ADMIN);
    const organizationId = orgTeam.belongsTo;
    await this.organizationService.updateOrganizationMemberPermission(createdUserId, organizationId as string, {
      $push: { groups: adminGroupPermission._id },
    });
    return groupPermissions;
  }

  async getLatestActiveMembers(teamId: string, limit?: number): Promise<(
    Partial<IMembership> & { userData: User }
  )[]> {
    const lookupExpression = {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    };
    const aggregatePipeline: Record<string, any>[] = [
      {
        $match: {
          $and: [
            { teamId: new Types.ObjectId(teamId) },
            { role: { $ne: TeamRoles.ADMIN } },
          ],
        },
      },
      {
        $lookup: lookupExpression,
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: 1,
          user: 1,
        },
      },
      {
        $sort: {
          'user.lastAccess': -1,
        },
      },
    ];
    if (limit) {
      aggregatePipeline.push({ $limit: limit });
    }
    const members = await this.membershipService.aggregateMembers(aggregatePipeline as PipelineStage[]);
    return members.map((member) => {
      const {
        userId,
        user,
      } = member;
      return {
        userId,
        teamId,
        userData: user,
      };
    });
  }

  async transferAdminToActiveMember(team: ITeam): Promise<boolean> {
    const { _id: teamId, ownerId } = team;
    const [targetMember] = await this.getLatestActiveMembers(teamId, 1);
    // This case happens when team contains only 1 member
    if (!targetMember) {
      return false;
    }

    const { userId, userData: targetData } = targetMember;
    const [currentOwner, organization, groupAdmin, groupMember] = await Promise.all([
      this.userService.findUserById(ownerId, {
        _id: 1, name: 1, email: 1, avatarRemoteId: 1,
      }),
      this.organizationService.getOrgById(team.belongsTo as string),
      this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.ADMIN, { _id: 1 }),
      this.organizationService.getGroupPermissionInTeamByIdAndName(teamId, OrganizationTeamRoles.MEMBER, { _id: 1 }),
    ]);

    // Set team admin for target
    await Promise.all([
      this.membershipService.update({
        teamId,
        userId,
      }, { role: TeamRoles.ADMIN }),
      this.membershipService.update({
        teamId,
        userId: ownerId,
      }, { role: TeamRoles.MEMBER }),
      this.teamService.updateTeamProperty(teamId, {
        ownerId: userId,
      }),
      this.organizationService.updateOneOrganizationPermission({
        userId,
        orgId: organization._id,
        groups: groupMember._id,
      }, {
        $set: { 'groups.$': groupAdmin._id },
      }),
      this.organizationService.updateOneOrganizationPermission({
        userId: ownerId,
        orgId: organization._id,
        groups: groupAdmin._id,
      }, {
        $set: { 'groups.$': groupMember._id },
      }),
    ]);

    // send notification team members
    this.notifyTransferTeamOwnership({
      actor: currentOwner,
      target: targetData,
      team,
      organization,
      actorType: APP_USER_TYPE.SALE_ADMIN,
    });

    // send email to granted
    const { name: teamName } = team;
    const saleAdminName = CommonConstants.LUMIN_ADMIN;
    const emailData = {
      actorName: saleAdminName,
      teamName,
      teamId,
      orgId: organization._id,
      subject: SUBJECT[EMAIL_TYPE.TRANSFER_TEAM_ADMIN.description]
        .replace('#{actorName}', saleAdminName)
        .replace('#{teamName}', teamName),
    };
    this.emailService.sendEmailHOF(EMAIL_TYPE.TRANSFER_TEAM_ADMIN, [targetData.email], emailData);

    // send subscription to opening team detail page
    this.teamService.publishUpdateTeams([userId], {
      statusCode: 200,
      team,
      type: SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_LUMIN_ADMIN,
    }, SUBSCRIPTION_UPDATE_TEAMS);

    return true;
  }

  notifyTransferTeamOwnership({
    actor,
    target,
    team,
    organization,
    actorType = APP_USER_TYPE.LUMIN_USER,
  }: {
    actor: User,
    target: Partial<User>,
    team: ITeam,
    organization: IOrganization,
    actorType?: APP_USER_TYPE,
  }): void {
    const notification = notiOrgFactory.create(NotiOrgTeam.TRANSFER_OWNER, {
      actor: {
        user: actor,
        actorData: { type: actorType },
      },
      entity: {
        user: {
          _id: target._id,
          name: target.name,
        },
      },
      target: {
        team,
        organization,
      },
    });
    this.membershipService.publishNotiToAllTeamMember(team._id, notification, [actor._id]);
    // send out-app noti for mobile
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
      notificationContentForTargetUser: firebaseNotificationContentExtra,
    } = notiFirebaseTeamFactory.create(NotiOrgTeam.TRANSFER_OWNER, {
      organization,
      team,
      targetUser: target,
      actor,
      actorType,
    });

    this.organizationService.publishFirebaseNotiToAllTeamMember({
      teamId: team._id,
      firebaseNotificationData,
      firebaseNotificationContent,
      excludes: [actor._id, target._id],
      firebaseNotificationContentExtra,
      extraMembers: [target._id],
    });
  }

  async deleteOrgTeamAndPublishSocket(data: {
    organization: IOrganization, team: ITeam, actorUser: User, memberships: IMembership[]
  }): Promise<void> {
    const {
      organization, team, memberships, actorUser,
    } = data;
    // remove this team and documents
    const { members, documents: documentIds } = await this.deleteOrgTeam({
      team,
      actor: actorUser,
      membersInTeam: memberships,
      organization,
    });

    // emit socket delete team
    const type = 'updateTeam';
    this.documentService.emitSocketDeleteDocuments(documentIds as string[]);
    (documentIds as string[]).forEach((documentId) => {
      this.messageGateway.server.to(`document-room-${documentId}`).emit('deleteTeam', { type, members });
    });
    (members as string[]).forEach((memberId) => {
      this.messageGateway.server.to(`user-room-${memberId}`).emit('updateTeam', {
        teamId: team._id,
        type: 'DELETE_TEAM',
        targetOrgId: organization._id,
        targetOrgUrl: organization.url,
        actorName: null,
        actorId: null,
        teamName: team.name,
      });
    });
  }

  async handleTransferOrgTeam(data: {
    organization: IOrganization,
    team: ITeam,
    actorUser: User,
    teamAdmin: User,
    targetId: string
  }): Promise<void> {
    const {
      actorUser, organization, team, teamAdmin, targetId,
    } = data;
    const { _id: teamId } = team;
    const memberships = await this.membershipService.find({ teamId });
    if (memberships.length === 1) {
      // remove this team and documents
      await this.deleteOrgTeamAndPublishSocket({
        organization,
        team,
        memberships,
        actorUser,
      });
    } else {
      const targetUser = await this.userService.findUserById(targetId);
      if (!targetUser) {
        throw GraphErrorException.NotFound('Target user not found');
      }
      const updatedTeam = await this.transferTeamOwnership({
        actorUser: teamAdmin,
        targetUser,
        team,
        organization,
      });

      this.teamService.publishUpdateTeams([teamAdmin._id, targetId], {
        statusCode: 200,
        team,
        type: SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_MANAGER,
      }, SUBSCRIPTION_UPDATE_TEAMS);

      this.notifyTransferTeamOwnership({
        actor: actorUser,
        target: targetUser,
        team,
        organization,
      });

      this.sendEmailTransferTeamOwnership({
        actor: actorUser,
        target: targetUser,
        team: updatedTeam,
        organization,
      });
    }
  }

  async transferListTeamOwnership(actorUser: User, teamAdmin: User, input: TransferTeamsOwnershipInput): Promise<string[]> {
    const { orgId, teams } = input;
    const adminId = teamAdmin._id;

    const [organization, allUserTeams] = await Promise.all([
      this.organizationService.getOrgById(orgId),
      this.getOrgTeamsByUserId(
        orgId,
        adminId,
        OrganizationTeamRoles.ADMIN,
      ),
    ]);
    if (!allUserTeams.length) {
      throw GraphErrorException.BadRequest('Teams of user are not found!');
    }

    const teamsFailed = [];

    const promises = allUserTeams.map((async (team) => {
      try {
        const target = teams.find(({ teamId }) => teamId === team._id) || { teamId: null, targetUserId: null };
        await this.handleTransferOrgTeam({
          actorUser,
          organization,
          team,
          teamAdmin,
          targetId: target?.targetUserId,
        });
      } catch (e) {
        teamsFailed.push(team._id);
      }
    }));

    await Promise.all(promises);

    return teamsFailed;
  }

  async canCreateTeam(organization: IOrganization): Promise<{canCreateTeam: boolean, maxTeam: number}> {
    const totalTeamsInOrg = await this.getTotalTeamByOrgId(organization._id);
    const organizationTeamLimit = planPoliciesHandler
      .from({ plan: organization.payment.type, period: organization.payment.period })
      .getOrganizationTeamLimit();

    return { canCreateTeam: totalTeamsInOrg < organizationTeamLimit, maxTeam: organizationTeamLimit };
  }

  async findUserToCreate(email: string, orgId: string): Promise<FindUserPayload> {
    const userFound = await this.userService.findVerifiedUserByEmail(email, null);
    if (!userFound) {
      return {
        email,
        status: SearchUserStatus.USER_NOT_BELONG_TO_ORG,
      };
    }

    if (userFound.deletedAt) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_DELETING,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const memberInOrg = await this.organizationService.getMembershipByOrgAndUser(orgId, userFound._id, { _id: 1 });
    return {
      ...userFound,
      status: memberInOrg ? SearchUserStatus.USER_VALID : SearchUserStatus.USER_NOT_BELONG_TO_ORG,
    };
  }

  async findUserToInvite(email: string, teamId: string): Promise<FindUserPayload> {
    const userFound = await this.userService.findUserByEmail(email, null);
    if (!userFound) {
      return {
        email,
        status: SearchUserStatus.USER_NOT_BELONG_TO_ORG,
      };
    }

    if (userFound.deletedAt) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_DELETING,
      };
    }

    const memberFound = await this.getOrgTeamMembershipOfUser(userFound._id, teamId, { _id: 1 });
    if (memberFound) {
      return {
        ...userFound,
        status: SearchUserStatus.USER_ADDED,
      };
    }
    const team = await this.getOrgTeamById(teamId);
    const orgMembership = await this.organizationService.getMembershipByOrgAndUser(team.belongsTo as string, userFound._id, { _id: 1 });
    return {
      ...userFound,
      status: orgMembership ? SearchUserStatus.USER_VALID : SearchUserStatus.USER_NOT_BELONG_TO_ORG,
    };
  }

  getTotalTeamByOrgId(organizationId: string): Promise<number> {
    return this.teamService.getTotalTeam({
      belongsTo: organizationId,
    });
  }

  async sendNotiUploadDocument({
    target,
    uploader,
    document,
  }:{
    target: ITeam,
    uploader: User,
    document: Document
  }): Promise<void> {
    const [organization, totalMember] = await Promise.all([
      this.getOrgOfTeam(target._id),
      this.membershipService.countTeamMember(target._id),
    ]);
    const notification = notiDocumentFactory.create(
      NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM,
      {
        actor: { user: uploader },
        entity: { document: document as unknown as Partial<IDocument> },
        target: { team: target, organization },
      },
    );
    if (totalMember > TEAM_SIZE_LIMIT_FOR_NOTI) {
      const [teamAdmin] = await this.teamService.getTeamMemberByRole(target._id, [TeamRoles.ADMIN]);
      if (uploader._id !== teamAdmin._id) {
        this.notificationService.createUsersNotifications(notification, [teamAdmin._id]);
      }
    } else {
      this.membershipService.publishNotiToAllTeamMember(
        target._id,
        notification,
        [uploader._id],
      );
    }
  }

  async transferTeamOwner(team: ITeam, teamAdmin: User): Promise<void> {
    const [members, organization] = await Promise.all([
      this.getOrgTeamMember({ teamId: team._id }, { userId: 1 }),
      this.organizationService.getOrgById(team.belongsTo as string),
    ]);
    const memberIds = members.map(({ userId }) => userId).filter((memberId) => memberId.toHexString() !== teamAdmin._id);
    const [targetUser] = await this.userService.findUsers({ _id: { $in: memberIds } });
    if (!targetUser) {
      await this.deleteOrgTeamAndPublishSocket({
        organization,
        team,
        memberships: members,
        actorUser: teamAdmin,
      });
      return;
    }
    const updatedTeam = await this.transferTeamOwnership({
      actorUser: teamAdmin,
      targetUser,
      team,
      organization,
    });

    this.teamService.publishUpdateTeams([teamAdmin._id, targetUser._id], {
      statusCode: 200,
      team,
      type: SUBSCRIPTION_TRANSFER_TEAM_OWNER_BY_MANAGER,
    }, SUBSCRIPTION_UPDATE_TEAMS);

    this.notifyTransferTeamOwnership({
      actor: teamAdmin,
      target: targetUser,
      team,
      organization,
    });

    this.sendEmailTransferTeamOwnership({
      actor: teamAdmin,
      target: targetUser,
      team: updatedTeam,
      organization,
    });
  }

  async leaveOrgTeams({
    teams,
    actor,
    orgId,
  } : { teams: ITeam[], actor: User, orgId: string }): Promise<void> {
    const promises = [];
    teams.map((team) => promises.push(...[this.notifyLeaveOrganizationTeam(actor, team),
      this.folderService.transferAllFoldersInTeamWorkspace({ actorId: actor._id, teamId: team._id, targetId: team.ownerId }),
    ]));
    await Promise.all(promises);
    const teamIds = teams.map(({ _id }) => _id);
    this.removeMembershipInTeams(teamIds, actor._id, orgId);
  }

  async geMembershipByUsersAndTeam({ teamId, userIds }: {teamId: string, userIds: string[]}): Promise<IMembership[]> {
    return this.membershipService.find({ teamId, userId: { $in: userIds } });
  }

  async getJoinedTeams({ userId }: { userId: string }): Promise<Team[]> {
    const memberships = await this.membershipService.find({ userId });
    if (!memberships.length) {
      return [];
    }
    return this.teamService.find({ _id: { $in: memberships.map((m) => m._id) } });
  }

  getLastAccessedTeams(userId: string, orgId: string) {
    return this.redisService.getUserLastAccessedTeams(userId, orgId);
  }

  updateLastAccessedTeam({ userId, orgId, teamId }: { userId: string, orgId: string, teamId: string }) {
    return this.redisService.setUserLastAccessedTeam(userId, orgId, teamId);
  }
}
