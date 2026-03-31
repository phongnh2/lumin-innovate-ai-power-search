import {
  Controller, Post, Body, UseGuards, HttpStatus,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { Utils } from 'Common/utils/Utils';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import {
  CreateConversationWithEmailInputDto,
} from 'Intercom/dtos/intercom.dto';
import { IntercomService } from 'Intercom/intercom.service';
import { IIntercomConversation, IIntercomEphemeralToken } from 'Intercom/interfaces/intercom.interface';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { IntercomConversationWithEmailDto, IntercomEphemeralTokenDto } from 'swagger/schemas';

import { SessionIntercomService } from './authentication/session-intercom.service';
import { SessionIntercomGuard } from './guards/session-intercom.guard';

@UsePipes(new ValidationPipeRest())
@Controller('intercom')
export class IntercomController {
  constructor(
    private readonly intercomService: IntercomService,
    private readonly sessionIntercomService: SessionIntercomService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @UseGuards(SessionIntercomGuard)
  @ApiOperation({
    summary: 'Create a conversation in Intercom using email',
    description: 'Searches for a contact by email, creates one if not found, then creates a conversation',
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: IntercomConversationWithEmailDto,
  })
  @Post('create-conversation')
  createConversationWithEmail(@Body() body: CreateConversationWithEmailInputDto): Promise<IIntercomConversation> {
    return this.intercomService.createConversationWithEmail(body);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @ApiOperation({
    summary: 'Get ephemeral token',
    description: 'Generate ephemeral token for intercom',
  })
  @ApiResponse({
    status: 200,
    description: 'Ephemeral token created successfully',
    type: IntercomEphemeralTokenDto,
  })
  @Post('generate-ephemeral-token')
  generateEphemeralToken(@Req() request): IIntercomEphemeralToken {
    const ipAddress = Utils.getIpRequest(request);

    const { token, level } = this.sessionIntercomService.generateEphemeralToken({ ipAddress });
    return { token, level };
  }

  @UseGuards(RestAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @ApiOperation({
    summary: 'Get JWT token',
    description: 'Generate JWT token for intercom conversation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'JWT token created successfully',
    type: 'string',
  })
  @Post('generate-jwt')
  async generateJwtToken(@Req() request): Promise<string> {
    const { user } = request;
    const { email, name, _id: id } = user;
    return this.intercomService.generateJwtToken({ email, name, id });
  }
}
