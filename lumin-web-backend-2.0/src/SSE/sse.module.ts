import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrganizationModule } from 'Organization/organization.module';
import OrganizationMemberSchema from 'Organization/schemas/organization.member.schema';

import { SseService } from './sse.service';

@Module({
  imports: [
    OrganizationModule,
    MongooseModule.forFeature([{ name: 'OrganizationMember', schema: OrganizationMemberSchema }]),
  ],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}
