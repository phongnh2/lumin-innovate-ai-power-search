/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable no-bitwise */
import { Controller, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { MembershipService } from 'Membership/membership.service';
import { OrganizationService } from 'Organization/organization.service';

import { DocumentService } from './document.service';
import { DocumentPageToolsService } from './DocumentPageTools/documentPageTools.service';
import { IndividualRoles } from './enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from './enums/organization.roles.enum';
import { PermissionBitFlags } from './enums/permissionBitFlags';
import { VerifyDocumentPermissionBase } from './guards/document.verify.permission.base';
import { DocumentGuestLevelGuardRpc } from './guards/Grpc/document.guest.permission.guard';

@Controller('/document')
export class DocumentGrpcController {
  constructor(
    private readonly documentPageToolsService: DocumentPageToolsService,
    private readonly documentService: DocumentService,
    private readonly membershipService: MembershipService,
    private readonly organizationService: OrganizationService,
  ) {}

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('DocumentService', 'FindDocumentById')
  async findDocumentById(data: { documentId: string }) {
    const { documentId } = data;
    return this.documentPageToolsService.getDocumentInfo(documentId);
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('DocumentService', 'GetFormFieldsByDocumentId')
  async getFormFieldsByDocumentId(data: { documentId: string, skip: number, limit?: number }) {
    const { documentId, skip, limit } = data;
    return this.documentPageToolsService.getFormFieldByDocumentId(documentId, { skip, limit });
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('DocumentService', 'GetManipulateStepsByDocumentId')
  async getManipulateStepsByDocumentId(data: { documentId: string }) {
    const { documentId } = data;
    return this.documentService.getManipulateStepsByDocumentId(documentId);
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('DocumentService', 'GetOutlinesByDocumentId')
  async getOutlinesByDocumentId(data: { documentId: string, skip: number, limit?: number }) {
    const { documentId, skip, limit } = data;
    return this.documentPageToolsService.getOutlineByDocumentId(documentId, { skip, limit });
  }

  @GrpcMethod('DocumentService', 'GetOutlinesForIntegration')
  async getOutlinesForIntegration(data: { documentId: string, skip: number, limit?: number }) {
    const { documentId, skip, limit } = data;
    return this.documentPageToolsService.getOutlineByDocumentId(documentId, { skip, limit });
  }

  @GrpcMethod('DocumentService', 'GetFormFieldsForIntegration')
  async getFormFieldsForIntegration(data: { documentId: string, skip: number, limit?: number }) {
    const { documentId, skip, limit } = data;
    return this.documentPageToolsService.getFormFieldByDocumentId(documentId, { skip, limit });
  }

  @GrpcMethod('DocumentService', 'GetManipulateStepsForIntegration')
  async getManipulateStepsForIntegration(data: { documentId: string }) {
    const { documentId } = data;
    return this.documentService.getManipulateStepsByDocumentId(documentId);
  }

  @GrpcMethod('DocumentService', 'GetImageSignedUrlsByIdForIntegration')
  async getImageSignedUrls(data: { documentId: string }) {
    const { documentId } = data;
    const result = await this.documentService.getImageSignedUrlsById(documentId);
    return {
      imageSignedUrls: result,
    };
  }

  @GrpcMethod('DocumentService', 'VerifyDocumentPermission')
  async verifyDocumentPermission(data: {
    documentId: string;
    permissions: {
      IndividualRoles: number;
      OrganizationRoles: number;
      OrganizationTeamRoles: number;
    };
    userId: string;
  }) {
    const { documentId, permissions, userId } = data;
    const listPermission = [];
    Object.entries(permissions).forEach(([key, value]) => {
      // eslint-disable-next-line no-nested-ternary
      const type = {
        IndividualRoles,
        OrganizationRoles: OrganizationDocumentRoles,
        OrganizationTeamRoles: OrgTeamDocumentRoles,
      }[key];
      const isSpectator = value & PermissionBitFlags.SPECTATOR; // the first bit
      const isViewer = value & PermissionBitFlags.VIEWER; // the second bit
      const isEditor = value & PermissionBitFlags.EDITOR; // the second bit
      const isSharer = value & PermissionBitFlags.SHARER; // the fourth bit
      const isOwner = value & PermissionBitFlags.OWNER; // the third bit
      const isAll = value & PermissionBitFlags.ALL_PERMISSIONS; // all five bits are set
      if (isAll) {
        listPermission.push(type.ALL);
        return;
      }
      if (isSpectator) {
        listPermission.push(type.SPECTATOR);
      }
      if (isViewer) {
        listPermission.push(type.VIEWER);
      }
      if (isEditor) {
        listPermission.push(type.EDITOR);
      }
      if (isOwner) {
        listPermission.push(type.OWNER);
      }
      if (isSharer) {
        listPermission.push(type.SHARER);
      }
    });
    const input = {
      documentService: this.documentService,
      membershipService: this.membershipService,
      organizationService: this.organizationService,
      errorCallback: () => new RpcException(new UnauthorizedException()),
      data: {
        requestData: {
          _id: userId,
          documentId,
        },
        permissions: listPermission,
      },
      nextFunc: () => false,
    };
    const verifyPermissionCallbacks = [
      VerifyDocumentPermissionBase.Guest,
      VerifyDocumentPermissionBase.Personal,
      VerifyDocumentPermissionBase.Team,
      VerifyDocumentPermissionBase.Organization,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const callback of verifyPermissionCallbacks) {
      // eslint-disable-next-line no-await-in-loop
      const result = await callback(input);
      if (result) {
        return { isAllowed: true };
      }
    }

    return { isAllowed: false };
  }
}
