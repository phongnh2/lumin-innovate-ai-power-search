import {
  PipeTransform, mixin, ArgumentMetadata, Inject, forwardRef,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { DocumentService } from 'Document/document.service';
import { DocumentGuestLevelPipeBase } from 'Document/guards/Rest/GuestPipe/guest.permission.base.pipe';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

function createGuestLevelPipe(permissions: string[]): any {
  class DocumentGuestLevelPipeInstance extends DocumentGuestLevelPipeBase implements PipeTransform<unknown> {
    constructor(
      @Inject(forwardRef(() => DocumentService))
      protected readonly documentService: DocumentService,
      @Inject(forwardRef(() => MembershipService))
      protected readonly membershipService: MembershipService,
      @Inject(forwardRef(() => OrganizationService))
      protected readonly organizationService: OrganizationService,
      @Inject(REQUEST)
      public request: any,
    ) {
      super(documentService, membershipService, organizationService, request, permissions);
    }

    async transform(value: unknown, argument: ArgumentMetadata): Promise<unknown> {
      return super.transform(value, argument);
    }
  }

  return mixin(DocumentGuestLevelPipeInstance);
}

export const DocumentGuestLevelPipe = (...permissions: string[]) : PipeTransform => createGuestLevelPipe(permissions);
