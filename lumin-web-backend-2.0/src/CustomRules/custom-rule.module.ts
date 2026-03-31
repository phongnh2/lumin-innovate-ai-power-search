import { Module, forwardRef } from '@nestjs/common';

import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { FolderModule } from 'Folder/folder.module';
import { NotificationModule } from 'Notication/notification.module';
import { OrganizationModule } from 'Organization/organization.module';
import { UserModule } from 'User/user.module';

import { CustomRuleLoader } from './custom-rule.loader';
import { CustomRulesService } from './custom-rule.service';

@Module({
  imports: [
    EnvironmentModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => FolderModule),
    NotificationModule,
  ],
  providers: [
    CustomRulesService,
    CustomRuleLoader,
  ],
  exports: [CustomRulesService, CustomRuleLoader],
})
export class CustomRulesModule {}
