import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation, ApiBody, ApiResponse,
} from '@nestjs/swagger';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { BlogViewService } from 'Blog/blogView.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { BlogViewResponseDto } from 'swagger/schemas';

import { IBlogMostViewDto, IBlogViewBodyDto } from './dtos/blog.dto';

@UsePipes(new ValidationPipeRest({ transform: true }))
@Controller('blog-view')
export class BlogViewController {
  constructor(
      private readonly blogViewService: BlogViewService,
  ) { }

  @ApiOperation({
    summary: 'Increase blog view count',
    description: 'Records a view for a blog post. Creates a new record if the blog URL does not exist.',
  })
  @ApiBody({ type: IBlogViewBodyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'View count increased successfully',
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Post('increase-view')
  async increaseView(@Body() body: IBlogViewBodyDto) {
    const blog = await this.blogViewService.findBlogByUrl(body);
    if (blog) {
      await this.blogViewService.increaseBlogView(body);
    } else {
      await this.blogViewService.createBlogView(body);
    }
  }

  @ApiOperation({
    summary: 'Get most viewed blog posts',
    description: 'Retrieves a list of blog posts sorted by view count in descending order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of most viewed blog posts retrieved successfully',
    type: [BlogViewResponseDto],
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Get('get-blogs-most-view')
  async getBlogsMostView(@Query() query: IBlogMostViewDto) {
    const blogs = await this.blogViewService.getBlogsMostView(query);
    return blogs;
  }
}
