import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IntegrationOrganizationService } from 'Integration/Integration.organization.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

@Injectable()
export class DocumentTemplateWorkspaceGuardInstance implements CanActivate {
  constructor(
    private readonly documentService: DocumentService,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly integrationOrganizationService: IntegrationOrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const args = context.getArgs();

    const input = args[0] as {
      template_id: string;
      workspace_id: string;
      user_id: string;
    };

    const { template_id: templateId, workspace_id: organizationId, user_id: userId } = input;

    if (!templateId) {
      throw GrpcErrorException.InvalidArgument(
        'Template ID is required',
        ErrorCode.Common.INVALID_INPUT,
      );
    }

    const { organization, user } = await this.integrationOrganizationService.validateOrganizationAndMembership(
      organizationId,
      userId,
    );
    const isAccessible = await this.validateTemplatePermission(templateId, user._id, organization._id);

    if (!isAccessible) {
      throw GrpcErrorException.PermissionDenied(
        'User does not have access to this template',
        ErrorCode.Common.NO_PERMISSION,
      );
    }

    return true;
  }

  private async validateTemplatePermission(
    templateId: string,
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    const personalPermission = await this.documentService.getPersonalTemplatePermission(
      templateId,
    );

    if (personalPermission) {
      const workspaceRefId = personalPermission.workspace.refId.toHexString();
      const userRefId = personalPermission.refId.toHexString();
      return workspaceRefId === organizationId && userRefId === userId;
    }

    const [groupPermission] = await this.documentService.getDocumentPermissionsByDocId(
      templateId,
      { role: { $in: [DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.ORGANIZATION] } },
    );

    if (!groupPermission && !personalPermission) {
      throw GrpcErrorException.NotFound(
        'Document template not found',
        ErrorCode.Document.DOCUMENT_TEMPLATE_NOT_FOUND,
      );
    }

    const { refId } = groupPermission;
    const refIdString = refId.toHexString();

    switch (groupPermission.role) {
      case DocumentRoleEnum.ORGANIZATION: {
        if (refIdString !== organizationId) {
          return false;
        }
        const organizationMember = await this.organizationService.getMembershipByOrgAndUser(
          refIdString,
          userId,
        );
        return !!organizationMember;
      }

      case DocumentRoleEnum.ORGANIZATION_TEAM: {
        const team = await this.organizationTeamService.getOrgTeamById(refIdString);
        const { belongsTo: teamOrgId, _id: teamId } = team;
        const teamOrgIdString = teamOrgId.toString();
        if (teamOrgIdString !== organizationId) {
          return false;
        }
        const [teamMember] = await this.organizationTeamService.findMembershipsByCondition({
          userId,
          teamId,
        });
        return !!teamMember;
      }

      default:
        return false;
    }
  }
}

export function DocumentTemplateWorkspaceGuard() {
  return applyDecorators(UseGuards(DocumentTemplateWorkspaceGuardInstance));
}
