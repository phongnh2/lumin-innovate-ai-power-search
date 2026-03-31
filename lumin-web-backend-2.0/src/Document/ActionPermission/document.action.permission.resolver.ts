import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Resolver,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import { DocumentCapabilities, UpdateDocumentActionPermissionSettingsInput, User } from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { DocumentActionPermissionService } from './document.action.permission.service';

@Resolver('DocumentActionPermission')
export class DocumentActionPermissionResolvers {
  constructor(private readonly documentActionPermissionService: DocumentActionPermissionService) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard()
  @Mutation('updateDocumentActionPermissionSettings')
  updateDocumentActionPermissionSettings(
    @Args('input') input: UpdateDocumentActionPermissionSettingsInput,
    @Context() context: { req: { user: User }; loaders: DataLoaderRegistry },
  ): Promise<DocumentCapabilities> {
    const { user } = context.req;
    return this.documentActionPermissionService.updateDocumentActionPermissionSettings({
      context,
      input,
      user,
    });
  }
}
