import { Global, Module } from '@nestjs/common';

import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { FolderModule } from 'Folder/folder.module';
import { OrganizationModule } from 'Organization/organization.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

import { DataLoaderRegistry } from './dataLoader.registry';
import { DataLoaderService } from './dataLoader.service';

@Global()
@Module({
  imports: [
    EnvironmentModule, UserModule, OrganizationModule, DocumentModule, TeamModule, FolderModule,
  ],
  providers: [DataLoaderService, DataLoaderRegistry],
  exports: [DataLoaderService],
})
export class DataLoaderModule { }
