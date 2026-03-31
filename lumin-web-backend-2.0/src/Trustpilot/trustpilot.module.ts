import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TrustpilotController } from 'Trustpilot/trustpilot.controller';
import { TrustpilotService } from 'Trustpilot/trustpilot.service';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    RateLimiterModule,
  ],
  controllers: [TrustpilotController],
  providers: [TrustpilotService],
})
export class TrustpilotModule {}
