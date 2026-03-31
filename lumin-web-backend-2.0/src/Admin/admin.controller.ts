import {
  Controller,
  Sse,
  Query,
  UsePipes,
  Req,
  UnauthorizedException,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { AdminAuthGuard } from 'Auth/guards/admin.auth.guard';
import { PaymentService } from 'Payment/payment.service';
import { MemberMessageEvent } from 'SSE/interfaces/admin-sse.interface';
import { SseService } from 'SSE/sse.service';

import { AdminService } from './admin.service';
import { CreateOldPlanSubscriptionDto } from './dtos/admin.dto';

@Controller('admin')
@UsePipes(new ValidationPipeRest({ transform: true }))
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(
    private readonly sseService: SseService,
    private readonly adminService: AdminService,
    private readonly paymentService: PaymentService,
  ) {}

  @Sse('export-members')
  streamMembers(@Query('orgId') orgId: string, @Req() req: Request): Promise<Observable<MemberMessageEvent>> {
    const userId = req.user?._id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.sseService.streamMembers(orgId, userId as string);
  }

  @Post('recover-indexing-historical-documents')
  async addDocumentsToIndexBacklog(@Body() body: { orgId: string, userId: string, isPersonalDoc: boolean }) {
    const results = await this.adminService.recoverIndexingHistoricalDocuments(body);
    return results;
  }

  @Post('backfill-docstack-start-date-field')
  backfillDocstackStartDateField() {
    this.adminService.backfillDocstackStartDateField();
  }

  @Post('create-old-plan-subscription')
  async createOldPlanSubscription(@Body() body: CreateOldPlanSubscriptionDto[]) {
    const results = await Promise.all(
      body.map((item) => this.paymentService.createOldPlanSubscription(item)),
    );
    return results;
  }
}
