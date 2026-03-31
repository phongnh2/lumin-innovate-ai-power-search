import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';

import { IOrganization } from 'Organization/interfaces/organization.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';

import { ChatRequestDto } from './dtos/chat-request.dto';
import { OrganizationService } from '../Organization/organization.service';

@Injectable()
export class WebChatBotGuard implements CanActivate {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly teamService: TeamService,
    private readonly customRuleLoader: CustomRuleLoader,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: User } & { userTeamIds: string[], organization: IOrganization }>();

    const { orgId } = request.body as ChatRequestDto;
    const organization = await this.organizationService.getOrgById(orgId);

    const isWebChatbotFlagOn = await this.organizationService.isWebChatbotFlagOn({
      user: request.user,
      organization,
    });

    if (!isWebChatbotFlagOn) {
      throw HttpErrorException.Forbidden(
        'Web chatbot is not enabled for this organization',
      );
    }

    const rules = this.customRuleLoader.getRulesForUser(request.user);
    if (rules.ui.hideAiChatbot) {
      throw HttpErrorException.Forbidden('Target domain is restricted to this action', ErrorCode.User.RESTRICTED_ACTION);
    }

    const membership = await this.organizationService.getMembershipByOrgAndUser(
      orgId,
      request.user._id as string,
    );

    if (!membership) {
      throw HttpErrorException.Forbidden(
        'User is not a member of this organization',
        ErrorCode.Org.MEMBERSHIP_NOT_FOUND,
      );
    }

    const userTeams = await this.teamService.getUserTeamsByOrgMembership(membership);

    request.userTeamIds = userTeams.map((team) => team._id);
    request.organization = organization;

    return true;
  }
}
