import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlacklistService } from 'Blacklist/blacklist.service';
import BlacklistSchema from 'Blacklist/schemas/blacklist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Blacklist', schema: BlacklistSchema },
    ]),
  ],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
