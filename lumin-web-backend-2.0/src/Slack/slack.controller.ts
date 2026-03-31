import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation, ApiQuery, ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { HandleSlackOAuthCallbackQueryDto } from './dtos/slack.dto';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(
    private readonly slackService: SlackService,
  ) {}

  @ApiOperation({ summary: 'Get OAuth redirect URL for Slack authentication' })
  @ApiQuery({ name: 'jwt', description: 'JWT token for authentication', required: true })
  @ApiResponse({ status: 302, description: 'Redirects to Slack OAuth page' })
  @Get('/oauth/redirect')
  @Redirect()
  async getOAuthRedirectUrl(@Res() res: Response, @Query('jwt') jwtToken: string): Promise<{ url: string }> {
    const redirectUrl = await this.slackService.getOAuthRedirectUrl(jwtToken);
    return { url: redirectUrl };
  }

  @ApiOperation({
    summary: 'Handle OAuth callback from Slack after user authorization',
  })
  @ApiQuery({
    name: 'state',
    description: 'State parameter from Slack OAuth callback',
    required: true,
  })
  @ApiQuery({
    name: 'isCancelled',
    description: 'Whether the user cancelled the OAuth flow',
    required: false,
  })
  @ApiResponse({
    status: 204,
    description: 'OAuth callback processed successfully (No Content)',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('/oauth/callback')
  handleSlackOAuthCallback(
    @Query() query: HandleSlackOAuthCallbackQueryDto,
  ): void {
    this.slackService.handleSlackOAuthCallback(query.state, query.isCancelled === 'true');
  }
}
