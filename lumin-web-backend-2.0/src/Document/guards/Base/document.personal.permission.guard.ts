import {
  CanActivate, ExecutionContext, Injectable, Inject, forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isArray } from 'lodash';

import { DocumentService } from 'Document/document.service';
import { VerifyDocumentPermissionBase, ValidationStrategy } from 'Document/guards/document.verify.permission.base';
import { IRequestData } from 'Document/guards/request.data.interface';
import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

import { DocumentTeamLevelGuardBase } from './document.team.permission.guard';

@Injectable()
export class DocumentPersonalLevelGuardBase extends DocumentTeamLevelGuardBase implements CanActivate {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    protected readonly documentService: DocumentService,
    protected readonly membershipService: MembershipService,
    protected readonly organizationService: OrganizationService,
    protected readonly reflector: Reflector,
  ) {
    super(documentService, membershipService, organizationService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.transformContext(context);
    const permissions = this.reflector.getAllAndOverride<string[]>('permissions', [context.getHandler(), context.getClass()]);

    if (!permissions) return true;

    const requestData: IRequestData | IRequestData[] = this.getRequestData(request, context);

    const validationStrategy = isArray(requestData) ? ValidationStrategy.MULTIPLE_DOCUMENT : ValidationStrategy.SINGLE_DOCUMENT;

    return VerifyDocumentPermissionBase.Personal({
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      nextFunc: () => super.canActivate(context),
      errorCallback: (type: string) => this.getError(type, context),
      data: {
        requestData,
        permissions,
      },
    }, validationStrategy);
  }
}
