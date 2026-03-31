import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { CHATBOT_FREE_REQUESTS_LIMIT } from 'Document/Chatbot/constants/chatbot.constant';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { ChatRequestDto } from './dtos/chat-request.dto';
import { WebChatbotClientService } from './webChatbotClient.service';
import { ChatMetadata, ChatRequest } from '../GrpcClient/webchatbot/webChatbot.interface';

@Injectable()
export class WebChatbotService {
  constructor(
    private readonly webChatbotClientService: WebChatbotClientService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly organizationService: OrganizationService,
  ) {}

  streamChat({
    chatRequest,
    user,
    userTeamIds,
    threadId,
    metadata,
  }: {
    chatRequest: ChatRequestDto,
    user: User,
    userTeamIds: string[],
    threadId?: string,
    metadata: ChatMetadata
  }): Observable<Uint8Array> {
    const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
    const filteredChatRequest = omit(chatRequest, ['messages', 'metadata']);
    const request: ChatRequest = {
      userId: user._id,
      context: { ...filteredChatRequest, teamIds: userTeamIds },
      message: {
        content: lastMessage.content,
      },
      threadId,
      metadata,
    };

    return this.webChatbotClientService.streamChat(request);
  }

  async countFreeRequestsUsage(userId: string) {
    await this.userService.findOneAndUpdate(
      { _id: userId },
      { $inc: { 'metadata.chatbotFreeRequests': 1 } },
    );
  }

  async increaseDailyRequestsLimit(userId: string): Promise<void> {
    return this.redisService.increaseDailyRequestsLimit(userId);
  }

  async validateRequestsLimit(
    { orgId, user }: { orgId: string; user: User },
  ): Promise<{ dailyRequestsLimit: number }> {
    const organization = await this.organizationService.getOrgById(orgId, {
      payment: 1,
    });
    if (!organization) {
      throw HttpErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }

    const { payment } = organization;
    const dailyRequestsLimit = planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getAIChatbotDailyLimit();
    if (dailyRequestsLimit === 0) {
      this.validateFreeRequestsLimit(user.metadata.chatbotFreeRequests);
    } else {
      await this.validateDailyRequestLimit({
        dailyRequestsLimit,
        userId: user._id,
      });
    }
    return {
      dailyRequestsLimit,
    };
  }

  private validateFreeRequestsLimit(freeRequestsUsed: number) {
    if (freeRequestsUsed < CHATBOT_FREE_REQUESTS_LIMIT) {
      return;
    }

    throw HttpErrorException.TooManyRequests(
      `AI Chatbot limit exceeded: ${freeRequestsUsed}/${CHATBOT_FREE_REQUESTS_LIMIT} free requests used. Please upgrade to continue.`,
    );
  }

  private async validateDailyRequestLimit({
    dailyRequestsLimit,
    userId,
  }: {
    dailyRequestsLimit: number;
    userId: string;
  }) {
    const usage = await this.redisService.getDailyRequestsLimit(userId);
    if (usage < dailyRequestsLimit) {
      return;
    }
    const blockTime = await this.redisService.getDailyRequestsLimitBlockTime(userId);
    throw HttpErrorException.TooManyRequests(
      "You've reached your quota limit for today. Please try again tomorrow.",
      undefined,
      {
        details: {
          blockTime,
        },
      },
    );
  }
}
