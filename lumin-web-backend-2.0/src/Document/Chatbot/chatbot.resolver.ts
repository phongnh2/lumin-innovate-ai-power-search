import { UseGuards } from '@nestjs/common';
import {
  Args, Mutation, Query, Resolver,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import {
  OrgTeamDocumentRoles,
  OrganizationDocumentRoles,
} from 'Document/enums/organization.roles.enum';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import {
  CheckAttachedFilesMetadataInput,
  GetPresignedUrlForAttachedFilesInput,
  ProcessDocumentForChatbotInput,
  SaveAttachedFilesMetadataInput,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { ChatbotService } from './chatbot.service';

@Resolver('Chatbot')
export class ChatbotResolver {
  constructor(
    private readonly chatbotService: ChatbotService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async processDocumentForChatbot(
    @Args('input') input: ProcessDocumentForChatbotInput,
  ) {
    return this.chatbotService.processDocumentForChatbot({
      documentId: input.documentId,
      requestNewPutObjectUrl: input.requestNewPutObjectUrl,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async getPresignedUrlForAttachedFiles(
    @Args('input') input: GetPresignedUrlForAttachedFilesInput,
  ) {
    return this.chatbotService.getPresignedUrlForAttachedFiles({
      documentId: input.documentId,
      attachedFileId: input.attachedFileId,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Query()
  async checkAttachedFilesMetadata(
    @Args('input') input: CheckAttachedFilesMetadataInput,
  ) {
    return this.chatbotService.checkAttachedFilesMetadata({
      chatSessionId: input.chatSessionId,
      etag: input.etag,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @Mutation()
  saveAttachedFilesMetadata(
    @Args('input') input: SaveAttachedFilesMetadataInput,
  ) {
    return this.chatbotService.saveAttachedFilesMetadata({
      chatSessionId: input.chatSessionId,
      s3RemoteId: input.s3RemoteId,
      etag: input.etag,
      totalPages: input.totalPages,
    });
  }
}
