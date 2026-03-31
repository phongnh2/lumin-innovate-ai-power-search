/* eslint-disable import/no-extraneous-dependencies */
import {
  Body,
  Controller, Post, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { PdfUploadRequest, SimplePdfCheckResponse } from 'swagger/schemas';

import { DocumentCheckerService } from './documentChecker.service';

@Controller('document-checker')
export class DocumentCheckerController {
  constructor(private readonly documentCheckerService: DocumentCheckerService) {}

  @ApiOperation({
    summary: 'Check if PDF is simple',
    description: 'Analyzes a PDF file to determine if it is a simple PDF document. Maximum file size is 10MB.',
  })
  @ApiBody({
    description: 'PDF file to check',
    type: PdfUploadRequest,
  })
  @ApiResponse({
    status: 200,
    description: 'PDF analysis completed successfully',
    type: SimplePdfCheckResponse,
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.ANONYMOUS_USER_ID)
  @Post('simple-pdf')
  async checkSimplePdf(@Body() body: { remoteId: string}) {
    const { remoteId } = body;

    const { isSimplePdf } = await this.documentCheckerService.checkSimplePdf(remoteId);

    return {
      isSimplePdf,
    };
  }
}
