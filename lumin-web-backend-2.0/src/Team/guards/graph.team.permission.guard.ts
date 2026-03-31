/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { TeamRoles, TeamConditions } from 'Document/enums/team.roles.enum';
import { MembershipService } from 'Membership/membership.service';
import { TeamService } from 'Team/team.service';

@Injectable()
export class TeamPermissionGuard implements CanActivate {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly teamService: TeamService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const { user: { _id }, body: { variables } } = request;
    const queryVariables = context.getArgs()[1];
    const teamId = (queryVariables?.input?.teamId || queryVariables?.teamId || variables?.teamId) as string;
    const team = await this.teamService.findOneById(teamId);
    if (!team) {
      throw GraphErrorException.NotFound('Team not found', ErrorCode.Common.NOT_FOUND);
    }
    Utils.appendMetadataToArgs(context, { team });
    // OWNER
    if (team?.ownerId?.toHexString() === _id) {
      return true;
    }
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    const conditions = this.reflector.get<string[]>('conditions', context.getHandler());
    if (permissions) {
      const membership = await this.membershipService.findOne({ teamId, userId: _id });
      if (membership
        && (permissions.includes(TeamRoles.ALL)
        || permissions.includes(membership.role))) {
        if (conditions && conditions.includes(TeamConditions.NEED_HIGHER_ROLE)) {
          const { userId } = queryVariables;
          // remove yourself after transfer team owner
          if (_id === userId) return true;
          const isHigherRole = await this.membershipService.isHigherRole(teamId, _id as string, userId as string);
          return isHigherRole;
        }
        return true;
      }
      throw GraphErrorException.Forbidden('You don\'t have permission to do this action', ErrorCode.Common.NO_PERMISSION);
    }
    return false;
  }
}
