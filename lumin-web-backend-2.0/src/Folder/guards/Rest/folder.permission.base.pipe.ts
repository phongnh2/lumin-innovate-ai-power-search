import {
  PipeTransform, ArgumentMetadata,
} from '@nestjs/common';

import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { FolderService } from 'Folder/folder.service';
import { VerifyFolderPermissionBase } from 'Folder/guards/folder.verify.permission.base';
import { IRequestData } from 'Folder/guards/request.interface';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

export class FolderPermissionPipeBase implements PipeTransform<unknown> {
  constructor(
      protected readonly folderService: FolderService,
      protected readonly organizationService: OrganizationService,
      protected readonly organizationTeamService: OrganizationTeamService,
      protected request: any,
      protected permissions: string[],
  ) {}

  private readonly verifyFolderPermissionBase = new VerifyFolderPermissionBase();

  async transform(value: unknown, _argument: ArgumentMetadata): Promise<unknown> {
    if (!this.permissions) return value;

    const requestData: IRequestData = this.getRequestData(this.request, value);

    if (!requestData.folderId) {
      return value;
    }

    const isVerifySuccess = await this.verifyFolderPermissionBase.verify({
      requestData,
      permissions: this.permissions,
      folderService: this.folderService,
      organizationService: this.organizationService,
      organizationTeamService: this.organizationTeamService,
    });

    if (!isVerifySuccess) throw HttpErrorException.Forbidden('Forbidden Resource');
    return value;
  }

  public getRequestData(request: any, data: Record<string, any>): IRequestData {
    const {
      folderId, parentId, input,
    } = data;
    const userId = request.user?._id;
    const targetFolderId = input ? input.folderId : folderId;
    const parentFolderId = input ? input.parentId : parentId;
    return {
      _id: userId,
      folderId: targetFolderId || parentFolderId,
    };
  }
}
