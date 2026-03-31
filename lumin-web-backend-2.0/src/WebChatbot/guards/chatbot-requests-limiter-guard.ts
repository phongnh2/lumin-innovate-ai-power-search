import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';

import { RedisService } from 'Microservices/redis/redis.service';
import { User } from 'User/interfaces/user.interface';
import { ChatRequestDto } from 'WebChatbot/dtos/chat-request.dto';
import { MessageDto, MessageRole } from 'WebChatbot/dtos/message.dto';
import { WebChatbotService } from 'WebChatbot/webChatbot.service';

@Injectable()
export class ChatbotRequestsLimiterGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly webChatbotService: WebChatbotService,
  ) {}

  private getLatestUserMessageId(messages: MessageDto[]): string | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === MessageRole.USER) {
        return messages[i].id;
      }
    }

    return null;
  }

  private async checkRequestsLimit(
    { orgId, user }:
    { orgId: string; user: User },
  ): Promise<boolean> {
    const { dailyRequestsLimit } = await this.webChatbotService.validateRequestsLimit({ orgId, user });
    if (dailyRequestsLimit === 0) {
      await this.webChatbotService.countFreeRequestsUsage(user._id);
    } else {
      await this.webChatbotService.increaseDailyRequestsLimit(user._id);
    }
    return true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { body: ChatRequestDto; user: User }>();

    const { body, user } = request;
    const { id, messages, orgId } = body;

    const lastMessage = messages[messages.length - 1];
    const isAiResponse = lastMessage.role === MessageRole.ASSISTANT;
    const isUserMessage = lastMessage.role === MessageRole.USER;

    if (isUserMessage) {
      this.redisService.setRedisDataWithExpireTime({
        key: `${RedisConstants.WEB_CHATBOT_LATEST_MESSAGE_FROM_USER}${id}:${user._id}`,
        value: lastMessage.id,
        expireTime: CommonConstants.CHATBOT_DAILY_REQUESTS_LIMIT_EXPIRE_IN,
      });
      return this.checkRequestsLimit({ orgId, user });
    }

    // Check if the latest user message is the same as the latest user message in the redis
    // To avoid the case where the user edit the role = 'assistant' on body request
    const latestUserMessageId = this.getLatestUserMessageId(messages);
    const isSameUserMessage = await this.redisService.getRedisValueWithKey(`${RedisConstants.WEB_CHATBOT_LATEST_MESSAGE_FROM_USER}${id}:${user._id}`);
    if (isAiResponse && isSameUserMessage === latestUserMessageId) {
      return true;
    }
    return this.checkRequestsLimit({ orgId, user });
  }
}
