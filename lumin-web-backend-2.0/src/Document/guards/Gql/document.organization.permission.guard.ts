import {
  CanActivate, Injectable, applyDecorators, UseGuards, SetMetadata,
} from '@nestjs/common';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';

import { DocumentOrganizationLevelGuardBase } from '../Base/document.organization.permission.guard';

@Injectable()
export class DocumentOrganizationLevelGuardInstance extends DocumentOrganizationLevelGuardBase implements CanActivate {}

export function DocumentOrganizationLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(GqlAuthGuard, DocumentOrganizationLevelGuardInstance),
  );
}
