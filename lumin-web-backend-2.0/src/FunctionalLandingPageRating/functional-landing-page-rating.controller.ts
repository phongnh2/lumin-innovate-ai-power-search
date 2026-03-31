import {
  Controller, Post, Body, UsePipes, Get, Query, UseGuards, UseInterceptors, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
} from '@nestjs/swagger';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import {
  UpsertFunctionalLandingPageRatingDto,
  GetFunctionalLandingPageRatingDto,
  FunctionalLandingPageRatingResponseDto,
} from './dtos';
import { FunctionalLandingPageRatingService } from './functional-landing-page-rating.service';
import { FunctionalLandingPageRatingInterceptor } from './interceptors/functional-landing-page-rating.interceptor';

@ApiTags('Functional Landing Page Rating')
@UsePipes(new ValidationPipeRest({ transform: true }))
@UseInterceptors(FunctionalLandingPageRatingInterceptor)
@Controller('functional-landing-page-rating')
export class FunctionalLandingPageRatingController {
  constructor(
    private readonly functionalLandingPageRatingService: FunctionalLandingPageRatingService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Post()
  @ApiOperation({ summary: 'Create or update a functional landing page rating' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The functional landing page rating has been successfully created or updated.',
    type: FunctionalLandingPageRatingResponseDto,
  })
  async upsert(
    @Body() body: UpsertFunctionalLandingPageRatingDto,
  ): Promise<FunctionalLandingPageRatingResponseDto> {
    const rating = await this.functionalLandingPageRatingService.upsert(body);
    return rating;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Get()
  @ApiOperation({ summary: 'Get a functional landing page rating' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The functional landing page rating.',
    type: FunctionalLandingPageRatingResponseDto,
  })
  async findOne(
    @Query() query: GetFunctionalLandingPageRatingDto,
  ): Promise<FunctionalLandingPageRatingResponseDto> {
    const rating = await this.functionalLandingPageRatingService.findOne(query);
    return rating;
  }
}
