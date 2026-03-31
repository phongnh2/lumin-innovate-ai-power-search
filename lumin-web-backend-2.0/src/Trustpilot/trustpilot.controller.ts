import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { TrustpilotReviewDto } from 'swagger/schemas';
import { GetReviewsInputDto } from 'Trustpilot/dtos/trustpilot.dto';
import { ITrustpilotReview } from 'Trustpilot/interfaces/trustpilot.interface';
import { TrustpilotService } from 'Trustpilot/trustpilot.service';

@Controller('trustpilot')
export class TrustpilotController {
  constructor(
    private readonly trustpilotService: TrustpilotService,
  ) { }

  @ApiOperation({
    summary: 'Get Trustpilot reviews',
    description: 'Retrieves Trustpilot reviews with optional filtering by tag and limit',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: [TrustpilotReviewDto],
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Get('get-reviews')
  getReviews(@Query() query: GetReviewsInputDto): Promise<ITrustpilotReview[]> {
    const { tag, limit } = query;
    return this.trustpilotService.getReviews({ tag, limit });
  }
}
