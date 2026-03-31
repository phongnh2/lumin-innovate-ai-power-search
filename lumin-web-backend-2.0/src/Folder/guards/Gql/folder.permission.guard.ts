import {
  CanActivate, ExecutionContext, Injectable, applyDecorators, UseGuards, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { FolderService } from 'Folder/folder.service';
import { VerifyFolderPermissionBase } from 'Folder/guards/folder.verify.permission.base';
import { IRequestData } from 'Folder/guards/request.interface';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

@Injectable()
export class FolderPermissionGuardInstance implements CanActivate {
  constructor(
      protected readonly reflector: Reflector,
      protected readonly folderService: FolderService,
      protected readonly organizationService: OrganizationService,
      protected readonly organizationTeamService: OrganizationTeamService,
  ) { }

  private readonly verifyFolderPermissionBase = new VerifyFolderPermissionBase();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const permissions = this.reflector.get<string[]>('folderPermissions', context.getHandler());
    const requestData = this.getRequestData(request, context);

    // handle multiple folder IDs
    if (requestData.folderIds?.length) {
      // validate all folders belong to the same clientId
      const folderPermissionsCount = await this.folderService.countFolders({
        folderId: { $in: requestData.folderIds },
        refId: requestData.clientId,
      });

      if (folderPermissionsCount !== requestData.folderIds.length) {
        throw GraphErrorException.Forbidden('You have no permission to do this action');
      }

      // verify permission for first folder only (all folders share same refId)
      const canActivate = await this.verifyFolderPermissionBase.verify({
        requestData: { _id: requestData._id, folderId: requestData.folderIds[0] },
        permissions,
        folderService: this.folderService,
        organizationService: this.organizationService,
        organizationTeamService: this.organizationTeamService,
      });

      if (!canActivate) {
        throw GraphErrorException.Forbidden('You have no permission to do this action');
      }
      return true;
    }

    // handle single folder ID
    if (!requestData.folderId) {
      return true;
    }

    const canActivate = await this.verifyFolderPermissionBase.verify({
      requestData,
      permissions,
      folderService: this.folderService,
      organizationService: this.organizationService,
      organizationTeamService: this.organizationTeamService,
    });
    if (!canActivate) {
      throw GraphErrorException.Forbidden('You have no permission to do this action');
    }
    return true;
  }

  public getRequestData(request: IGqlRequest, context: ExecutionContext): IRequestData {
    const {
      folderId, parentId, input,
    } = context.getArgs()[1];
    const userId = request.user?._id;
    const targetFolderId = input ? input.folderId : folderId;
    const parentFolderId = input ? input.parentId : parentId;
    const folderIds = input?.folderIds as string[] | undefined;
    const clientId = input?.clientId as string | undefined;

    return {
      _id: userId,
      folderId: targetFolderId || parentFolderId,
      folderIds,
      clientId,
    };
  }
}

export function FolderPermissionGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('folderPermissions', permissions),
    UseGuards(FolderPermissionGuardInstance),
  );
}
