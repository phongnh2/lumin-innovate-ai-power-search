import {
  CanActivate, ExecutionContext, Injectable, applyDecorators, UseGuards, SetMetadata, forwardRef, Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { WSAttachUserGuard } from 'Gateway/guards/ws.attachUser.guard';
import { WSPersonalLevelGuardInstance } from 'Gateway/guards/ws.personal.permission.guard';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

@Injectable()
export class WSGuestLevelGuardInstance extends WSPersonalLevelGuardInstance implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => MembershipService))
    protected readonly membershipService: MembershipService,
    @Inject(forwardRef(() => OrganizationService))
    protected readonly organizationService: OrganizationService,
    protected readonly reflector: Reflector,
  ) {
    super(documentService, membershipService, organizationService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (!permissions) return true;

    const requestData: IRequestData = this.getRequestData(context);

    return VerifyDocumentPermissionBase.Guest({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      nextFunc: () => super.canActivate(context),
      errorCallback: () => this.getError(requestData),
      data: {
        requestData,
        permissions,
      },
    });
  }
}

export function WSGuestLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(WSAttachUserGuard, WSGuestLevelGuardInstance),
  );
}
