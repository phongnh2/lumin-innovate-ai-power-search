import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserMetricSchema } from './schemas/usermetric.schema';
import { UserMetricService } from './usermetric.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserMetric', schema: UserMetricSchema },
    ]),
  ],
  controllers: [],
  providers: [UserMetricService],
  exports: [UserMetricService],
})
export class UserMetricModule { }
