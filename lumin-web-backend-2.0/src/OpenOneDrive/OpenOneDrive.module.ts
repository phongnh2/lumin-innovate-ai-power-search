import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AuthModule } from 'Auth/auth.module';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { GA4Module } from 'GA4/GA4.module';
import { LoggerModule } from 'Logger/Logger.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { UserModule } from 'User/user.module';

import { EventTrackingService } from './EventTracking/EventTracking.service';
import { OpenOneDriveController } from './OpenOneDrive.controller';
import { OpenOneDriveService } from './OpenOneDrive.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => DocumentModule),
    EnvironmentModule,
    LoggerModule,
    forwardRef(() => AuthModule),
    JwtModule,
    OrganizationModule,
    forwardRef(() => CustomRulesModule),
    PinpointModule,
    GA4Module,
    SocketIOModule,
  ],
  controllers: [OpenOneDriveController],
  exports: [OpenOneDriveService],
  providers: [OpenOneDriveService, EventTrackingService],
})
export class OpenOneDriveModule {}
