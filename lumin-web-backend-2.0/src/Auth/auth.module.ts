/* eslint-disable @typescript-eslint/require-await */
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AdminModule } from 'Admin/admin.module';
import { AuthController } from 'Auth/auth.controller';
import { AuthResolver } from 'Auth/auth.resolver';
import { AuthService } from 'Auth/auth.service';
import { AdminAuthGuard } from 'Auth/guards/admin.auth.guard';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { BlacklistModule } from 'Blacklist/blacklist.module';
import { BrazeModule } from 'Braze/braze.module';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { KratosModule } from 'Kratos/kratos.module';
import { LoggerModule } from 'Logger/Logger.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

import { AuthGrpcController } from './auth-grpc.controller';
import { OryJwtService } from './ory.jwt.service';
import { WhitelistIPService } from './whitelistIP.sevice';

@Module({
  imports: [
    forwardRef(() => EmailModule),
    forwardRef(() => UserModule),
    forwardRef(() => TeamModule),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
        },
      }),
      inject: [EnvironmentService],
    }),
    RedisModule,
    HttpModule,
    UserTrackingModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => EventModule),
    RateLimiterModule,
    forwardRef(() => NotificationModule),
    LoggerModule,
    forwardRef(() => AdminModule),
    BlacklistModule,
    KratosModule,
    forwardRef(() => CustomRulesModule),
    forwardRef(() => SocketIOModule),
    BrazeModule,
    PaymentModule,
    RabbitMqModule,
  ],
  controllers: [AuthController, AuthGrpcController],
  providers: [
    AuthService,
    AuthResolver,
    GqlAuthGuard,
    RestAuthGuard,
    AdminAuthGuard,
    WhitelistIPService,
    OryJwtService,
  ],
  exports: [AuthService, GqlAuthGuard, RestAuthGuard, AdminAuthGuard, WhitelistIPService, OryJwtService],
})

export class AuthModule { }
