import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { snakeCase } from 'lodash';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { IOrganization, IOrganizationProto } from 'Organization/interfaces/organization.interface';
import { IOrganizationMember } from 'Organization/interfaces/organization.member.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { IUser } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class IntegrationOrganizationService {
  constructor(
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly userService: UserService,
  ) {}

  async getOrganizationsOfUser(userId: string): Promise<IOrganizationProto[]> {
    const orgs = await this.organizationService.getOrgListByUser(userId, { limit: 0, sort: { createdAt: -1 } });
    const convertOrgToOrganizationProto = (organization: IOrganization): any => {
      const org = { ...organization, organizationId: organization._id } as IOrganization & { organizationId: string };
      delete org.ownerId;
      delete org._id;
      const camelCaseObject = (obj: { [s: string]: any }) => Object.fromEntries(
        // eslint-disable-next-line no-use-before-define
        Object.entries(obj).map(camelCaseEntry),
      );
      const camelCaseEntry = ([key, value]) => [
        snakeCase(key as string),
        typeof value === 'object'
        && !Array.isArray(value) && value !== null && !(value instanceof Date) ? camelCaseObject(value as { [s: string]: any; }) : value,
      ];
      return camelCaseObject(org);
    };
    return orgs.map(convertOrgToOrganizationProto);
  }

  async validateOrganizationAndMembership(
    organizationId: string,
    userId: string,
  ): Promise<{ organization: IOrganization; membership: IOrganizationMember; user: IUser }> {
    const [organization, user] = await Promise.all([this.organizationService.getOrgById(organizationId), this.userService.findUserById(userId)]);
    if (!user) {
      throw GrpcErrorException.NotFound(ErrorMessage.USER.USER_NOT_FOUND, ErrorCode.User.USER_NOT_FOUND);
    }
    if (!organization) {
      throw GrpcErrorException.NotFound(ErrorMessage.ORGANIZATION.ORGANIZATION_NOT_FOUND, ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }

    const membership = await this.organizationService.getMembershipByOrgAndUser(organizationId, userId);
    if (!membership) {
      throw GrpcErrorException.PermissionDenied(ErrorMessage.ORGANIZATION.MEMBERSHIP_NOT_FOUND, ErrorCode.Org.MEMBERSHIP_NOT_FOUND);
    }

    return { organization, membership, user };
  }

  async validateDocStackLimit(organization: IOrganization): Promise<void> {
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: 1,
    });
    if (!hasRemainingDocStack) {
      throw GrpcErrorException.PermissionDenied('You currently reached Doc Stack limitation', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
  }

  async validateOrganizationTeamAndMembership({ userId, organizationId, teamId }: { userId: string; organizationId: string; teamId: string }) {
    const team = await this.organizationTeamService.getOrgTeamById(teamId);
    if (!team || (team && team.belongsTo.toHexString() !== organizationId)) {
      throw GrpcErrorException.NotFound(ErrorMessage.ORGANIZATION_TEAM.TEAM_NOT_FOUND, ErrorCode.OrgTeam.ORGANIZATION_TEAM_NOT_FOUND);
    }
    const membership = await this.organizationTeamService.getOrgTeamMembershipOfUser(userId, teamId);
    if (!membership) {
      throw GrpcErrorException.PermissionDenied(ErrorMessage.ORGANIZATION_TEAM.MEMBERSHIP_NOT_FOUND, ErrorCode.OrgTeam.MEMBERSHIP_NOT_FOUND);
    }

    return { team, membership };
  }
}
