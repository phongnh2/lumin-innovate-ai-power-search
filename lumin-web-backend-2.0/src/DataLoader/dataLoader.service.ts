import { Injectable } from '@nestjs/common';

import { DocumentService } from 'Document/document.service';
import { FolderService } from 'Folder/folder.service';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

import { DataLoaderRegistry } from './dataLoader.registry';

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly folderService: FolderService,
  ) {}

  public get DataLoaderRegistry(): DataLoaderRegistry {
    // Return a new instance of the registry for each request
    return new DataLoaderRegistry(
      this.documentService,
      this.teamService,
      this.organizationService,
      this.userService,
      this.folderService,
    );
  }
}
