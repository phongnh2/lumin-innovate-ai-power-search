import {
  Controller, Post, Body, Headers, UseGuards, Request, Response,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { Utils } from 'Common/utils/Utils';

import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { ChatMetadata } from 'GrpcClient/webchatbot/webChatbot.interface';
import { LoggerService } from 'Logger/Logger.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';

import { ChatRequestDto } from './dtos/chat-request.dto';
import { ChatbotRequestsLimiterGuard } from './guards/chatbot-requests-limiter-guard';
import { WebChatBotGuard } from './webChatbot.guard';
import { WebChatbotService } from './webChatbot.service';

@Controller('webchatbot')
export class WebChatbotController {
  constructor(
    private readonly webChatbotService: WebChatbotService,
    private readonly loggerService: LoggerService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Stream a chat message' })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(RestAuthGuard, WebChatBotGuard, ChatbotRequestsLimiterGuard)
  streamChat(
    @Body() chatRequest: ChatRequestDto,
    @Request() request: ExpressRequest & { user: User, userTeamIds: string[], organization: IOrganization },
    @Response() response: ExpressResponse,
    @Headers('X-Thread-Id') threadId?: string,
  ) {
    if (!threadId) {
      threadId = uuidv4();
      response.setHeader('X-Thread-Id', threadId);
    }
    const { user, organization } = request;

    const metadata: ChatMetadata = {
      luminLanguage: chatRequest.metadata.luminLanguage || 'English',
      browserLanguage: chatRequest.metadata.browserLanguage || 'English',
      orgId: organization._id,
      orgPaymentType: organization.payment.type,
      userEmailDomain: Utils.getEmailDomain(user.email as string),
    };

    const observable = this.webChatbotService.streamChat({
      chatRequest,
      user,
      userTeamIds: request.userTeamIds,
      threadId,
      metadata,
    });

    observable.subscribe({
      next: (chunk: Uint8Array) => {
        response.write(chunk);
      },
      error: (error) => {
        this.loggerService.error({
          context: WebChatbotController.name,
          error,
        });
        response.status(500).send({
          message: 'Internal server error',
        });
        response.end();
      },
      complete: () => {
        response.end();
      },
    });
  }
}
