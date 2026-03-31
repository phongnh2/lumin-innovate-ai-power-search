import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { BlogViewController } from './blogView.controller';
import { BlogViewService } from './blogView.service';
import BlogViewSchema from './schemas/blogView.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BlogView', schema: BlogViewSchema },
    ]),
    HttpModule,
    UserModule,
    RateLimiterModule,
  ],
  controllers: [BlogViewController],
  providers: [BlogViewService],
  exports: [BlogViewService],
})
export class BlogViewModule {}
