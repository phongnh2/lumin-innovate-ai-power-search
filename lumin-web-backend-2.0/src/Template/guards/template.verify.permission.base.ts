/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

import { OrganizationRoles } from 'Document/enums/organization.roles.enum';
import { TemplateOwnerType } from 'graphql.schema';
import { OrganizationTeamRoles } from 'Organization/organization.enum';
import { IRequestTemplateData } from 'Template/guards/request.template.data.interface';
import {
  PersonalTemplateRoles, TemplateRole, OrganizationTemplateRoles, OrgTeamTemplateRoles,
} from 'Template/template.enum';

interface IVerifyTemplateInput {
  requestData: IRequestTemplateData | IRequestTemplateData[];
  permissions?: string[];
}

interface IVerifyData {
  templateService: any;
  organizationService: any;
  membershipService: any;
  error: GraphqlException | CustomHttpException | Error;
  data: IVerifyTemplateInput;
}

export enum ValidationStrategy {
  SINGLE_TEMPLATE,
  MULTIPLE_TEMPLATE,
}

function verifyPersonalPermission({ templatePermission, permissions }): boolean {
  return permissions.includes(PersonalTemplateRoles.ALL)
    || templatePermission.role === TemplateRole.OWNER
    || permissions.includes(templatePermission.role);
}

function verifyOrganizationPermission({
  userId, templatePermission, permissions, isOwnerOfTemplate,
}): boolean {
  return permissions.includes(OrganizationTemplateRoles.ALL)
    || permissions.includes(OrganizationTemplateRoles.OWNER) && isOwnerOfTemplate
    || permissions.includes(`organization_${templatePermission.groupPermissions[userId]}`);
}

function verifyOrgTeamPermission({
  userId, templatePermission, permissions, isOwnerOfTemplate,
}): boolean {
  return permissions.includes(OrgTeamTemplateRoles.ALL)
  || permissions.includes(OrgTeamTemplateRoles.OWNER) && isOwnerOfTemplate
  || permissions.includes(`org_team${templatePermission.groupPermissions[userId]}`);
}

async function verifySingleTemplatePermission(verifyData: IVerifyData): Promise<boolean> {
  const {
    data, templateService, organizationService, membershipService,
  } = verifyData;
  const { requestData, permissions } = data;
  const { userId, templateId } = requestData as IRequestTemplateData;
  const template = await templateService.findById(templateId);
  if (!template) {
    throw GraphErrorException.NotFound('Template not found', ErrorCode.Template.TEMPLATE_NOT_FOUND);
  }
  const [
    personalTemplatePermission,
    organizationTemplatePermission,
    teamTemplatePermission,
  ] = await templateService.getSpecificTemplatePermissions(templateId, userId);

  switch (template.ownerType) {
    case TemplateOwnerType.ORGANIZATION: {
      if (!organizationTemplatePermission) {
        break;
      }
      const { refId: orgId } = organizationTemplatePermission;
      const orgMembership = await organizationService.getMembershipByOrgAndUser(orgId, userId);
      const isOrgManager = [OrganizationRoles.ORGANIZATION_ADMIN, OrganizationRoles.BILLING_MODERATOR].includes(orgMembership.role);
      return isOrgManager
        || (orgMembership && verifyOrganizationPermission({
          userId,
          templatePermission: organizationTemplatePermission,
          permissions,
          isOwnerOfTemplate: template.ownerId.toHexString() === userId,
        }));
    }
    case TemplateOwnerType.ORGANIZATION_TEAM: {
      if (!teamTemplatePermission) {
        break;
      }
      const { refId: teamId } = teamTemplatePermission;
      const teamMembership = await membershipService.findOne({ userId, teamId });
      const isTeamAdmin = teamMembership.role === OrganizationTeamRoles.ADMIN;
      return isTeamAdmin
        || teamMembership && verifyOrgTeamPermission({
          userId,
          templatePermission: teamTemplatePermission,
          permissions,
          isOwnerOfTemplate: template.ownerId.toHexString() === userId,
        });
    }
    default: {
      return personalTemplatePermission && verifyPersonalPermission({ templatePermission: personalTemplatePermission, permissions });
    }
  }
  return false;
}
export class VerifyTemplatePermissionBase {
  static async All(verifyData: IVerifyData, strategy: ValidationStrategy = ValidationStrategy.SINGLE_TEMPLATE): Promise<boolean> {
    switch (strategy) {
      case ValidationStrategy.SINGLE_TEMPLATE: {
        return verifySingleTemplatePermission(verifyData);
      }
      case ValidationStrategy.MULTIPLE_TEMPLATE: {
        return false;
      }
      default: return false;
    }
  }
}
