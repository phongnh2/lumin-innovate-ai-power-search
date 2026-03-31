import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerModule } from 'Logger/Logger.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { UserModule } from 'User/user.module';

import SlackConnection from './schemas/slack.connection.schema';
import { SlackConnectionService } from './slack.connection.service';
import { SlackController } from './slack.controller';
import { SlackResolver } from './slack.resolver';
import { SlackService } from './slack.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SlackConnection', schema: SlackConnection },
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
    forwardRef(() => AuthModule),
    RateLimiterModule,
    RedisModule,
    forwardRef(() => UserModule),
    LoggerModule,
    forwardRef(() => SocketIOModule),
  ],
  controllers: [SlackController],
  providers: [
    SlackService,
    SlackResolver,
    SlackConnectionService,
  ],
  exports: [SlackService],
})
export class SlackModule {}
