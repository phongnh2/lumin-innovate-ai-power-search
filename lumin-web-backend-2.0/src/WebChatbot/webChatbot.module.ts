import { Module } from '@nestjs/common';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AuthModule } from 'Auth/auth.module';
import { FolderModule } from 'Folder/folder.module';
import { GrpcClientModule } from 'GrpcClient/grpcClient.module';
import { LoggerModule } from 'Logger/Logger.module';
import { OrganizationModule } from 'Organization/organization.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

import { WebChatbotGrpcController } from './webChatbot-grpc.controller';
import { WebChatbotGrpcService } from './webChatbot-grpc.service';
import { WebChatbotController } from './webChatbot.controller';
import { WebChatBotGuard } from './webChatbot.guard';
import { WebChatbotService } from './webChatbot.service';
import { WebChatbotClientService } from './webChatbotClient.service';

@Module({
  imports: [
    GrpcClientModule,
    LoggerModule,
    RateLimiterModule,
    TeamModule,
    UserModule,
    OrganizationModule,
    AuthModule,
    FolderModule,
    CustomRulesModule,
  ],
  controllers: [WebChatbotController, WebChatbotGrpcController],
  providers: [
    WebChatbotService,
    WebChatbotClientService,
    WebChatbotGrpcService,
    WebChatBotGuard,
  ],
  exports: [
    WebChatbotService,
    WebChatbotClientService,
    WebChatBotGuard,
  ],
})
export class WebChatbotModule {}
