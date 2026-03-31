import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { OrganizationModule } from 'Organization/organization.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import TemplatePermissionSchema from 'Template/schemas/template.permission.schema';
import TemplateSchema from 'Template/schemas/template.schema';
import { TemplateResolver } from 'Template/template.resolver';
import { TemplateService } from 'Template/template.service';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema },
      { name: 'TemplatePermission', schema: TemplatePermissionSchema },
    ]),
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
    forwardRef(() => OrganizationModule),
    forwardRef(() => TeamModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => UserModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => AuthModule),
    AwsModule,
    RateLimiterModule,
    RedisModule,
  ],
  providers: [
    TemplateResolver,
    TemplateService,
    WhitelistIPService,
  ],
  exports: [TemplateService],
})

export class TemplateModule {}
