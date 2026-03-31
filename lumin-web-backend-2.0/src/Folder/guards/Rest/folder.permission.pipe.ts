import {
  PipeTransform, mixin, ArgumentMetadata, Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { FolderService } from 'Folder/folder.service';
import { FolderPermissionPipeBase } from 'Folder/guards/Rest/folder.permission.base.pipe';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

function createFolderPermissionPipe(permissions: string[]): any {
  class FolderPermissionPipeIntance extends FolderPermissionPipeBase implements PipeTransform<unknown> {
    constructor(
      protected readonly folderService: FolderService,
      protected readonly organizationService: OrganizationService,
      protected readonly organizationTeamService: OrganizationTeamService,
      @Inject(REQUEST)public request: any,
    ) {
      super(folderService, organizationService, organizationTeamService, request, permissions);
    }

    async transform(value: unknown, argument: ArgumentMetadata): Promise<unknown> {
      return super.transform(value, argument);
    }
  }
  return mixin(FolderPermissionPipeIntance);
}

export const FolderPermissionPipe = (...permissions: string[]) : PipeTransform => createFolderPermissionPipe(permissions);
