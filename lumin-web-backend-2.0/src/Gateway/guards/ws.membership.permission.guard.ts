import {
  CanActivate, ExecutionContext, Injectable, forwardRef, Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DocumentService } from 'Document/document.service';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { MembershipService } from 'Membership/membership.service';
import { TeamService } from 'Team/team.service';

@Injectable()
export class WSMembershipPermissionGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => MembershipService))
    protected readonly membershipService: MembershipService,
    @Inject(forwardRef(() => TeamService))
    protected readonly teamService: TeamService,
    protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const { teamId } = data;
    const { user } = client;
    if (!user) {
      throw GraphErrorException.Unauthorized('You have no permission');
    }

    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!permissions) return true;

    // OWNER
    const team = await this.teamService.findOneById(teamId as string, { ownerId: 1 });
    if (team && team.ownerId.toHexString() === user._id) {
      return true;
    }

    const membership = await this.membershipService.findOne({ teamId, userId: user._id });
    if (membership && membership._id) {
      return (permissions.includes(TeamRoles.ALL)
            || permissions.includes(membership.role));
    }
    throw GraphErrorException.Unauthorized('You have no permission');
  }
}
