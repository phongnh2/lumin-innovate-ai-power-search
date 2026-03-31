import {
  CanActivate, ExecutionContext, Injectable, forwardRef, Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DocumentService } from 'Document/document.service';
import { MembershipService } from 'Membership/membership.service';

@Injectable()
export class WSOwnerPermissionGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    @Inject(forwardRef(() => MembershipService))
    protected readonly membershipService: MembershipService,
    protected readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const { userId: userData, _id } = data;
    const { user } = client;
    const userId = userData || _id;
    if (!userId || !user?._id || user?._id !== userId) {
      return false;
    }
    return true;
  }
}
