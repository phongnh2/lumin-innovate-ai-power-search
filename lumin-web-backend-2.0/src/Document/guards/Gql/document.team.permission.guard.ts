import {
  CanActivate, Injectable, applyDecorators, UseGuards, SetMetadata,
} from '@nestjs/common';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';

import { DocumentTeamLevelGuardBase } from '../Base/document.team.permission.guard';

@Injectable()
export class DocumentTeamLevelGuardInstance extends DocumentTeamLevelGuardBase implements CanActivate {}

export function DocumentTeamLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(GqlAuthGuard, DocumentTeamLevelGuardInstance),
  );
}
