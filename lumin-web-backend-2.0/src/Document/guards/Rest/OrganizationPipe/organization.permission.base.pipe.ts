import {
  PipeTransform, ArgumentMetadata,
} from '@nestjs/common';

import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

export class DocumentOrganizationLevelPipeBase implements PipeTransform<unknown> {
  constructor(
      protected readonly documentService: DocumentService,
      protected readonly membershipService: MembershipService,
      protected readonly organizationService: OrganizationService,
      public request: any,
      protected permissions: string[],
  ) {}

  async transform(value: unknown, _argument: ArgumentMetadata): Promise<unknown> {
    if (!this.permissions) return value;

    const requestData: IRequestData = this.getRequestData(this.request, value);

    const isVerifySuccess = await VerifyDocumentPermissionBase.Organization({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      nextFunc: () => {},
      errorCallback: () => HttpErrorException.InternalServerError('Error'),
      data: {
        requestData,
        permissions: this.permissions,
      },
    });

    if (!isVerifySuccess) throw HttpErrorException.Forbidden('Forbidden Resource');
    return value;
  }

  public getRequestData(request: any, data: any): IRequestData {
    const { user } = request;
    const { clientId, documentId } = data;
    return {
      _id: user?._id,
      clientId,
      documentId,
    };
  }
}
