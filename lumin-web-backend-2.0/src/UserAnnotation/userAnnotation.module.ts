import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisModule } from 'Microservices/redis/redis.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { RubberStampPropertySchema } from './schemas/rubberStampAnnotation.schema';
import { UserAnnotationSchema } from './schemas/userAnnotation.schema';
import { UserAnnotationType } from './userAnnotation.enum';
import { UserAnnotationResolver } from './userAnnotation.resolver';
import { UserAnnotationService } from './userAnnotation.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secretOrPrivateKey: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: CommonConstants.JWT_EXPIRE_IN,
        },
      }),
      inject: [EnvironmentService],
    }),
    MongooseModule.forFeature([{
      name: 'UserAnnotation',
      schema: UserAnnotationSchema,
      discriminators: [
        { name: UserAnnotationType.RUBBER_STAMP, schema: RubberStampPropertySchema },
      ],
    }]),
    RedisModule,
    RateLimiterModule,
    UserModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    UserAnnotationService, UserAnnotationResolver,
  ],
  exports: [UserAnnotationService],
})
export class UserAnnotationModule { }
