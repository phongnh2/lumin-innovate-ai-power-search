import { UseGuards } from '@nestjs/common';
import {
  Args, Query, Mutation, Resolver,
  Context,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { DocumentService } from 'Document/document.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrgTeamDocumentRoles, OrganizationDocumentRoles } from 'Document/enums/organization.roles.enum';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import {
  DocumentSummarization,
  GetDocSummarizationOptions,
  SummarizationAvailability,
  UpdateDocSummarizationInput,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';

import { DocumentSummarizationService } from './documentSummarization.service';
import { DocumentSummarizationError, GenerateRequiredError } from './documentSummarizationError.interface';

@DocumentGuestAuthLevelGuard(
  OrganizationDocumentRoles.ALL,
  IndividualRoles.ALL,
  OrgTeamDocumentRoles.ALL,
)
@Resolver('DocumentSummarization')
export class DocumentSummarizationResolver {
  constructor(
    private readonly documentSummarizationService: DocumentSummarizationService,
    private readonly documentService: DocumentService,
  ) {}

  private async getOrganizationDomains(documentId: string): Promise<string[]> {
    const { info } = await this.documentService.getTargetOwnedDocumentInfo(documentId);
    if (!info) {
      return [];
    }
    return info.associateDomains.concat(info.domain);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getDocumentSummarization(
    @Args('documentId') documentId: string,
    @Args('options') options: GetDocSummarizationOptions,
    @Context('req') { user }: { user: User },
  ): Promise<DocumentSummarization> {
    const domains = await this.getOrganizationDomains(documentId);
    if (!user.metadata.docSummarizationConsentGranted) {
      await this.documentSummarizationService.grantDocSummarizationConsent(user._id);
    }

    try {
      await this.documentSummarizationService.validateAvailability({
        domains,
        documentId,
        userId: user._id,
      });
      const response = await this.documentSummarizationService.getDocumentSummarization(user, documentId, options);
      await this.documentSummarizationService.updateSummarizationExploration({ userId: user._id, documentId, domains });
      return { ...response, availability: SummarizationAvailability.EXISTING };
    } catch (error) {
      if (error instanceof GenerateRequiredError) {
        return { availability: SummarizationAvailability.NONE };
      }
      if (error instanceof DocumentSummarizationError) {
        throw error.toGraphqlException();
      }

      throw error;
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async updateDocumentSummarization(
    @Args('documentId') documentId: string,
    @Args('input') input: UpdateDocSummarizationInput,
    @Context('req') { user }: { user: User },
  ): Promise<DocumentSummarization> {
    const domains = await this.getOrganizationDomains(documentId);
    await this.documentSummarizationService.validateAvailability({
      domains,
      documentId,
      userId: user._id,
    });
    return this.documentSummarizationService.updateDocumentSummarization(
      user._id,
      documentId,
      input,
    );
  }
}
