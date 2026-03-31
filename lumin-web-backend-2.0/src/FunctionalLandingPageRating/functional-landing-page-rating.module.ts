import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { FunctionalLandingPageRatingController } from './functional-landing-page-rating.controller';
import { FunctionalLandingPageRatingService } from './functional-landing-page-rating.service';
import { FunctionalLandingPageRatingSchema } from './schemas/functional-landing-page-rating.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'FunctionalLandingPageRating',
        schema: FunctionalLandingPageRatingSchema,
      },
    ]),
    UserModule,
    RateLimiterModule,
  ],
  controllers: [FunctionalLandingPageRatingController],
  providers: [FunctionalLandingPageRatingService],
})
export class FunctionalLandingPageRatingModule {}
