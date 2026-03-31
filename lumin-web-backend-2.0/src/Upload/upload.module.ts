import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UploadService } from 'Upload/upload.service';
import { UserModule } from 'User/user.module';

import { UploadResolver } from './upload.resolver';

@Module({
  imports: [
    AwsModule,
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: CommonConstants.JWT_EXPIRE_IN,
        },
      }),
      inject: [EnvironmentService],
    }),
    RateLimiterModule,
    UserModule,
    AuthModule,
  ],
  providers: [UploadService, UploadResolver, GqlAuthGuard, RestAuthGuard, WhitelistIPService],
  exports: [UploadService, GqlAuthGuard, RestAuthGuard],
})
export class UploadModule {}
