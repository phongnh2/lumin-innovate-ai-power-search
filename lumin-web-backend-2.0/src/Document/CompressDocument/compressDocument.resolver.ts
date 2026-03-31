import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DocumentService } from 'Document/document.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import { GetCompressDocumentPresignedUrlInput, ISignedUrl } from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { CompressDocumentService } from './compressDocument.service';

@Resolver('CompressDocument')
export class CompressDocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly compressDocumentService: CompressDocumentService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
    OrganizationDocumentRoles.ALL,
  )
  @Query()
  async getCompressDocumentPresignedUrl(@Args('input') input: GetCompressDocumentPresignedUrlInput): Promise<ISignedUrl> {
    const { documentId, compressOptions, sessionId } = input;
    const documentInfo = await this.documentService.findOneById(String(documentId));
    if (!documentInfo) {
      throw GraphErrorException.NotFound('Document not found');
    }
    return this.compressDocumentService.createCompressDocumentPresignedUrl({ documentId, compressOptions, sessionId });
  }
}
