import {
  Module, OnModuleDestroy,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { BrazeModule } from 'Braze/braze.module';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { GA4Module } from 'GA4/GA4.module';
import { LoggerModule } from 'Logger/Logger.module';
import { LoggerService } from 'Logger/Logger.service';
import { EventTrackingService } from 'OpenGoogle/EventTracking.service';
import { OpenGoogleController } from 'OpenGoogle/OpenGoogle.controller';
import { OpenGoogleService } from 'OpenGoogle/OpenGoogle.service';
import { OrganizationModule } from 'Organization/organization.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    EnvironmentModule,
    UserModule,
    AuthModule,
    OrganizationModule,
    DocumentModule,
    PinpointModule,
    LoggerModule,
    PinpointModule,
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secretOrPrivateKey: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: environmentService.getByKey(
            EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN,
          ),
        },
      }),
      inject: [EnvironmentService],
    }),
    CustomRulesModule,
    GA4Module,
    SocketIOModule,
    BrazeModule,
  ],
  controllers: [OpenGoogleController],
  exports: [],
  providers: [OpenGoogleService, EventTrackingService, WhitelistIPService],
})
export class OpenGoogleModule implements OnModuleDestroy {
  constructor(
    private readonly pinpointService: PinpointService,
    private readonly loggerService: LoggerService,
  ) {}

  async onModuleDestroy() {
    this.loggerService.debug(`[Module] ${OpenGoogleModule.name} is destroying...`, { extraInfo: { timestamp: Date.now() } });
    await this.pinpointService.drain();
    this.loggerService.debug(`[Module] ${OpenGoogleModule.name} was destroyed...`, { extraInfo: { timestamp: Date.now() } });
  }
}
