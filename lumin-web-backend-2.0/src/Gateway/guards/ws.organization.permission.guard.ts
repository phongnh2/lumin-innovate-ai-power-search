import {
  CanActivate, ExecutionContext, Injectable, applyDecorators, UseGuards, SetMetadata, forwardRef, Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';

import { WsErrorException } from 'Common/errors/WsException';

import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { WSAttachUserGuard } from 'Gateway/guards/ws.attachUser.guard';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

@Injectable()
export class WSOrganizationLevelGuardInstance implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => MembershipService))
    protected readonly membershipService: MembershipService,
    @Inject(forwardRef(() => OrganizationService))
    protected readonly organizationService: OrganizationService,
    protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (!permissions) return true;

    const requestData: IRequestData = this.getRequestData(context);

    return VerifyDocumentPermissionBase.Organization({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      nextFunc: () => {},
      errorCallback: () => this.getError(requestData),
      data: {
        requestData,
        permissions,
      },
    });
  }

  public getRequestData(context: ExecutionContext): IRequestData {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    return {
      _id: client.user?._id,
      clientId: null,
      documentId: data.roomId || data.documentId,
    };
  }

  public getError(requestData: IRequestData): WsException {
    return !requestData._id
      ? WsErrorException.Unauthorized('You have no permission')
      : WsErrorException.Forbidden('You have no permission');
  }
}

export function WSOrganizationLevelGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(WSAttachUserGuard, WSOrganizationLevelGuardInstance),
  );
}
