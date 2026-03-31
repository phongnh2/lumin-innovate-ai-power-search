import {
  CanActivate, Injectable, applyDecorators, UseGuards, SetMetadata,
} from '@nestjs/common';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';

import { DocumentPersonalLevelGuardBase } from '../Base/document.personal.permission.guard';

@Injectable()
export class DocumentPersonalLevelGuardInstance extends DocumentPersonalLevelGuardBase implements CanActivate {}

export function DocumentPersonalLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(GqlAuthGuard, DocumentPersonalLevelGuardInstance),
  );
}
