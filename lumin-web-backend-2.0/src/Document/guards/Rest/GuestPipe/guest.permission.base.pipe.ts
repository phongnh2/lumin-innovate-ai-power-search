import {
  PipeTransform, ArgumentMetadata,
} from '@nestjs/common';

import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { DocumentPersonalLevelPipeBase } from 'Document/guards/Rest/PersonalPipe/personal.permission.base.pipe';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

export class DocumentGuestLevelPipeBase extends DocumentPersonalLevelPipeBase implements PipeTransform<unknown> {
  constructor(
    protected readonly documentService: DocumentService,
    protected readonly membershipService: MembershipService,
    protected readonly organizationService: OrganizationService,
    public request: any,
    protected permissions: string[],
  ) {
    super(documentService, membershipService, organizationService, request, permissions);
  }

  async transform(value: unknown, argument: ArgumentMetadata): Promise<unknown> {
    if (!this.permissions) return value;

    const requestData: IRequestData = this.getRequestData(this.request, value);

    const isVerifySuccess = await VerifyDocumentPermissionBase.Guest({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      nextFunc: () => super.transform(value, argument),
      errorCallback: () => HttpErrorException.BadRequest('you have no document'),
      data: {
        requestData,
        permissions: this.permissions,
      },
    });

    if (!isVerifySuccess) throw HttpErrorException.Forbidden('Forbidden Resource');
    return value;
  }
}
