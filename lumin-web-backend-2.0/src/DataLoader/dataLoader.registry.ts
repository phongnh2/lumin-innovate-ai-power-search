import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';

import { IEnterpriseInvoice } from 'Admin/interfaces/admin.interface';
import { DocumentService } from 'Document/document.service';
import { IDocumentPermission } from 'Document/interfaces/document.interface';
import { FolderService } from 'Folder/folder.service';
import { IFolder } from 'Folder/interfaces/folder.interface';
import { IMembership } from 'Membership/interfaces/membership.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { DocumentPermissionLoader } from './documentPermission.loader';
import { EnterpriseUpgradesLoader } from './enterpriseUpgrades.loader';
import { FolderLoader } from './folder.loader';
import { FolderPermissionLoader } from './folderPermissions.loader';
import { OrganizationLoader } from './organization.loader';
import { OrgMembershipLoader } from './orgMembership.loader';
import { OriginalDocumentPermissionsLoader } from './originalDocumentPermission.loader';
import { SharedDocumentPermissionsLoader } from './sharedDocumentPermissions.loader';
import { TeamLoader } from './team.loader';
import { TeamMembershipLoader } from './teamMembership.loader';
import { TeamsOfUserLoader } from './teamsOfUser.loader';
import { UsersLoader } from './users.loader';

@Injectable()
export class DataLoaderRegistry {
  constructor(
    private readonly documentService: DocumentService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly folderService: FolderService,
  ) {}

  private createdLoaders: Record<string, DataLoader<any, any>> = {};

  private get(name: string, fallback: () => DataLoader<any, any>) {
    if (!this.createdLoaders[name]) {
      this.createdLoaders[name] = fallback();
    }
    return this.createdLoaders[name];
  }

  public get documentPermissionLoader(): DataLoader<string, IDocumentPermission> {
    return this.get('documentPermissionLoader', () => DocumentPermissionLoader.create(this.documentService));
  }

  public get teamMembershipLoader(): DataLoader<string, IMembership> {
    return this.get('teamMembershipLoader', () => TeamMembershipLoader.create(this.teamService));
  }

  public get orgMembershipLoader(): DataLoader<string, IMembership> {
    return this.get('orgMembershipLoader', () => OrgMembershipLoader.create(this.organizationService));
  }

  public get originalDocumentPermissionsLoader(): DataLoader<string, IDocumentPermission> {
    return this.get('originalDocumentPermissionsLoader', () => OriginalDocumentPermissionsLoader.create(this.documentService));
  }

  public get usersLoader(): DataLoader<string, User> {
    return this.get('usersLoader', () => UsersLoader.create(this.userService));
  }

  public get enterpriseUpgradesLoader(): DataLoader<string, IEnterpriseInvoice> {
    return this.get('enterpriseUpgradesLoader', () => EnterpriseUpgradesLoader.create(this.organizationService));
  }

  public get teamsOfUserLoader(): DataLoader<string, ITeam[]> {
    return this.get('teamsOfUserLoader', () => TeamsOfUserLoader.create(this.teamService));
  }

  public get sharedDocumentPermissionsLoader(): DataLoader<string, IDocumentPermission> {
    return this.get('sharedDocumentPermissionsLoader', () => SharedDocumentPermissionsLoader.create(this.documentService));
  }

  public get folderPermissionsLoader(): DataLoader<string, IDocumentPermission[]> {
    return this.get('folderPermissionsLoader', () => FolderPermissionLoader.create(this.folderService));
  }

  public get organizationLoader(): DataLoader<string, IOrganization> {
    return this.get('organizationLoader', () => OrganizationLoader.create(this.organizationService));
  }

  public get teamLoader(): DataLoader<string, ITeam> {
    return this.get('teamLoader', () => TeamLoader.create(this.teamService));
  }

  public get folderLoader(): DataLoader<string, IFolder> {
    return this.get('folderLoader', () => FolderLoader.create(this.folderService));
  }
}
