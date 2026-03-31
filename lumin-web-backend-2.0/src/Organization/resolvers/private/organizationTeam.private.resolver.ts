import {
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Mutation, Context, Args,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { uniqBy, isNil, omitBy } from 'lodash';

import { ErrorCode } from 'Common/constants/ErrorCode';
import {
  SUBSCRIPTION_TRANSFER_TEAM_OWNER,
  SUBSCRIPTION_UPDATE_TEAMS,
  SUBSCRIPTION_SETTING_UPDATE,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';

import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FolderTypeEnum } from 'Folder/folder.enum';
import {
  AddMemberOrgTeamInput,
  BasicResponse,
  TeamInput,
  DeleteTeamPayload,
  CreateOrganizationTeamFolderInput,
  Folder,
  UpdateTeamSettingsInput,
} from 'graphql.schema';
import { OrganizationPermissionGuard } from 'Organization/guards/Gql/organization.permission.guard';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationTeamRoles, OrganizationValidationStrategy } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

@Resolver()
@OrganizationPermissionGuard(OrganizationValidationStrategy.PRIVATE, Resource.ORGANIZATION_TEAM)
@UseInterceptors(SanitizeInputInterceptor)
export class OrganizationTeamPrivateResolver {
  constructor(
      private readonly organizationTeamService: OrganizationTeamService,
      private readonly eventService: EventServiceFactory,
      private readonly userService: UserService,
      private readonly organizationService: OrganizationService,
      private readonly teamService: TeamService,
  ) {}

  @Mutation()
  async inviteOrgTeamMember(
    @Context() context,
    @Args('teamId') teamId: string,
    @Args('members') members: AddMemberOrgTeamInput,
  ): Promise<BasicResponse> {
    const { user, organization } = context.req;
    if (!members.luminUsers.length) {
      throw GraphErrorException.BadRequest('Invitation is empty', ErrorCode.Common.INVALID_INPUT);
    }
    const actorInfo = await this.organizationTeamService.getUserById(user._id as string);
    const uniqMembers = uniqBy(members.luminUsers, 'userEmail');
    const uniqMemberIds = uniqBy(members.luminUsers, 'userId').map((member) => member.userId);
    const alreadyAddedMembers = await this.organizationTeamService.geMembershipByUsersAndTeam({ teamId, userIds: uniqMemberIds });
    const alreadyAddedMembersId = alreadyAddedMembers.map((membership) => membership.userId.toHexString());
    // check members are org member
    const memberInOrg = await this.organizationTeamService.validateMembershipsInOrganization(organization._id as string, uniqMembers);
    const memberInOrgExceptAdded = memberInOrg.filter((member) => !alreadyAddedMembersId.includes(member.userId));
    const addedMembers = await this.organizationTeamService.inviteMemberToOrgTeam(
      memberInOrgExceptAdded,
      actorInfo,
      teamId,
      organization as IOrganization,
    );
    const validAddedMembers = addedMembers.filter((member) => member);
    if (!validAddedMembers.length && !alreadyAddedMembers.length) {
      throw GraphErrorException.BadRequest('Can not invite members to team', ErrorCode.OrgTeam.CANNOT_ADD_MEMBER_TO_ORGANIZATION_TEAM);
    }
    this.organizationService.updateContactListWhenInviteMember(
      user._id as string,
      validAddedMembers.map((member) => member.userId.toHexString()),
    );
    if (validAddedMembers.length !== uniqMembers.length - alreadyAddedMembers.length) {
      return {
        message: 'Some members can not be invite',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    return {
      message: 'Add member successfully',
      statusCode: HttpStatus.OK,
    };
  }

  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async editOrgTeamInfo(
    @Context() context,
    @Args('teamId') teamId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      avatarData: { fileBuffer: Buffer; mimetype: string; filename: string },
    @Args('team') team: TeamInput,
  ): Promise<ITeam> {
    const { name, avatarRemoteId } = team;
    const { team: teamInfo } = context.req;
    const updateObj: any = {
      name,
    };
    let newAvatarRemoteId = '';
    const isRemoveAvatar = typeof avatarRemoteId === 'string';
    if (!isRemoveAvatar) {
      newAvatarRemoteId = avatarData
        ? await this.organizationTeamService.uploadTeamAvatarToS3(avatarData)
        : teamInfo.avatarRemoteId;
    }
    updateObj.avatarRemoteId = newAvatarRemoteId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updatedTeam = await this.organizationTeamService.updateTeamById(teamId, updateObj);

    return updatedTeam;
  }

  @Mutation()
  async transferTeamOwnership(
    @Context() context,
    @Args('teamId') teamId: string,
    @Args('userId') userId: string,
  ) : Promise<ITeam> {
    const { user, organization } = context.req;

    const [actorUser, targetUser, team] = await Promise.all([
      this.userService.findUserById(user._id as string),
      this.userService.findUserById(userId),
      this.organizationTeamService.getOrgTeamById(teamId),
    ]);

    if (!targetUser) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    if (targetUser._id.toString() === actorUser._id.toString()) {
      throw GraphErrorException.BadRequest('Cannot transfer ownership to yourself');
    }

    const updatedTeam = await this.organizationTeamService.transferTeamOwnership({
      actorUser,
      targetUser,
      team,
      organization,
    });

    this.teamService.publishUpdateTeams([user._id], {
      statusCode: 200,
      team: updatedTeam,
      type: SUBSCRIPTION_TRANSFER_TEAM_OWNER,
    }, SUBSCRIPTION_UPDATE_TEAMS);

    this.organizationTeamService.notifyTransferTeamOwnership({
      actor: actorUser,
      target: targetUser,
      team,
      organization,
    });

    this.organizationTeamService.sendEmailTransferTeamOwnership({
      actor: actorUser,
      target: targetUser,
      team: updatedTeam,
      organization,
    });

    return updatedTeam;
  }

  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async removeOrgTeamMember(
    @Context() context,
    @Args('teamId') teamId: string,
    @Args('userId') userId: string,
  ): Promise<BasicResponse> {
    const { organization, user } = context.req;
    const membership = await this.organizationTeamService.getOrgTeamMembershipOfUser(userId, teamId, { role: 1 });
    if (!membership) {
      throw GraphErrorException.NotFound('Member does not belong to team', ErrorCode.OrgTeam.USER_NOT_IN_ORGANIZATION_TEAM);
    }
    if (membership.role === OrganizationTeamRoles.ADMIN) {
      throw GraphErrorException.NotAcceptable('Can not remove team admin', ErrorCode.OrgTeam.CANNOT_REMOVE_TEAM_ADMIN);
    }
    const result = await this.organizationTeamService.removeMembershipInTeam(teamId, userId, organization._id as string);
    if (!result.deletedCount) {
      throw GraphErrorException.BadRequest('Can not remove this member', ErrorCode.OrgTeam.REMOVE_TEAM_MEMBER_FAIL);
    }
    const [actor, member, team] = await Promise.all([
      this.organizationTeamService.getUserById(user._id as string),
      this.organizationTeamService.getUserById(userId),
      this.organizationTeamService.getOrgTeamById(teamId),
    ]);
    const eventData: ICreateEventInput = {
      eventName: NonDocumentEventNames.TEAM_MEMBER_REMOVED,
      eventScope: EventScopes.TEAM,
      actor,
      target: member,
      team,
    };

    this.organizationTeamService.notifyRemoveMemberInTeam(actor, member, team);
    this.eventService.createEvent(eventData);
    return {
      message: 'Remove member successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Mutation()
  async deleteOrgTeam(
    @Context() context,
    @Args('teamId') teamId: string,
  ): Promise<DeleteTeamPayload> {
    const { user, organization } = context.req;
    const [team, actor, members] = await Promise.all([
      this.organizationTeamService.getOrgTeamById(teamId),
      this.organizationTeamService.getUserById(user._id as string),
      this.organizationTeamService.getOrgTeamMember({ teamId }, { userId: 1 }),
    ]);
    return this.organizationTeamService.deleteOrgTeam({
      team,
      actor,
      membersInTeam: members,
      organization,
    });
  }

  @Mutation()
  async createOrganizationTeamFolder(
    @Context() context,
    @Args('input') input: CreateOrganizationTeamFolderInput,
  ): Promise<Folder> {
    const { _id: ownerId } = context.req.user;
    const {
      name, parentId, color, teamId,
    } = input;
    return this.organizationService.createFolder({
      name, color, parentId, ownerId, refId: teamId, folderType: FolderTypeEnum.ORGANIZATION_TEAM,
    });
  }

  @Mutation()
  async updateTeamSettings(
    @Args('teamId') teamId: string,
    @Args('settings') settings: UpdateTeamSettingsInput,
  ): Promise<ITeam> {
    const updateSettings = omitBy(settings, isNil);
    const updatedTeam = await this.teamService.updateTeamProperty(teamId, { settings: updateSettings });
    const members = await this.teamService.getMembersFromTeam(updatedTeam);
    const receivedIds = members.map((member) => member?.toHexString()).filter(Boolean);
    this.teamService.publishUpdateTeams(receivedIds, {
      statusCode: 200,
      team: updatedTeam,
      type: SUBSCRIPTION_SETTING_UPDATE,
    }, SUBSCRIPTION_UPDATE_TEAMS);
    return updatedTeam;
  }
}
