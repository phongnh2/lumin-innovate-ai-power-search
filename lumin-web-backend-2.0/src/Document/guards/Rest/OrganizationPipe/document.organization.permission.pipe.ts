import {
  PipeTransform, mixin, ArgumentMetadata, Inject, forwardRef,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { DocumentService } from 'Document/document.service';
import { DocumentOrganizationLevelPipeBase } from 'Document/guards/Rest/OrganizationPipe/organization.permission.base.pipe';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

function createOrganizationLevelPipe(permissions: string[]): any {
  class DocumentOrganizationLevelPipeIntance extends DocumentOrganizationLevelPipeBase implements PipeTransform<unknown> {
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
  return mixin(DocumentOrganizationLevelPipeIntance);
}

export const DocumentOrganizationLevelPipe = (...permissions: string[]) : PipeTransform => createOrganizationLevelPipe(permissions);
