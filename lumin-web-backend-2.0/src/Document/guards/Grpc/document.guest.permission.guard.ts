import {
  applyDecorators, Injectable, SetMetadata, UseGuards,
} from '@nestjs/common';

import { RpcAttachUserGuard } from 'Auth/guards/rpc.auth.guard';

import { DocumentGuestLevelGuardBase } from '../Base/document.guest.permission.guard';

@Injectable()
export class DocumentGuestLevelGuardRpcInstance extends DocumentGuestLevelGuardBase {

}

export function DocumentGuestLevelGuardRpc(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(RpcAttachUserGuard, DocumentGuestLevelGuardRpcInstance),
  );
}
