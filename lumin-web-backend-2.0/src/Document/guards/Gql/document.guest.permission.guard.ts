import {
  CanActivate, Injectable, UseGuards, SetMetadata, applyDecorators,
} from '@nestjs/common';

import { CustomRulesGuard } from 'CustomRules/custom.rules.guard';

import { GqlAttachUserGuard } from 'Auth/guards/graph.attachUser';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';

import { DocumentGuestLevelGuardBase } from '../Base/document.guest.permission.guard';

@Injectable()
class DocumentGuestLevelGuardInstance extends DocumentGuestLevelGuardBase implements CanActivate {}

export function DocumentGuestAuthLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(GqlAuthGuard, CustomRulesGuard, DocumentGuestLevelGuardInstance),
  );
}

export function RoleGuardForEditorAndHigherPermissions() {
  return DocumentGuestAuthLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.EDITOR,
    IndividualRoles.OWNER,
    IndividualRoles.SHARER,
    IndividualRoles.EDITOR,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.EDITOR,
  );
}

export function DocumentGuestLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(GqlAttachUserGuard, CustomRulesGuard, DocumentGuestLevelGuardInstance),
  );
}
