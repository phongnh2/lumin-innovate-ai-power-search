/* eslint-disable max-classes-per-file */
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { RedisModule } from 'Microservices/redis/redis.module';
import { TeamResolver } from '../team.resolver';
import { TeamService } from '../team.service';
import { TeamController } from '../team.controller';
import { UserModule } from './user.module.fake';
import { AwsModule } from '../../Aws/aws.module';
import { MembershipModule } from './MemberShip.module.fake';
import { pubSub } from '../../Notication/notification.pubsub';
import { GraphqlModule } from '../../Graphql/graphql.module';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

class MembershipModel { findAll: () => ['test']; }

@Module({
  imports: [
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
    forwardRef(() => UserModule),
    AwsModule,
    RedisModule,
    MembershipModule,
    GraphqlModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamResolver, pubSubProvider, MembershipModel, GraphqlModule],
  exports: [TeamService],
})
export class TeamModule { }
