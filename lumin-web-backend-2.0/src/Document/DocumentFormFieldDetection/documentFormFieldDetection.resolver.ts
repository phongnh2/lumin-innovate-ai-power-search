import { UseGuards } from '@nestjs/common';
import {
  Args, Context, Query, Resolver,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';

import { DocumentFormFieldDetectionService } from 'Document/DocumentFormFieldDetection/documentFormFieldDetection.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import {
  OrgTeamDocumentRoles,
  OrganizationDocumentRoles,
} from 'Document/enums/organization.roles.enum';
import { DocumentGuestAuthLevelGuard } from 'Document/guards/Gql/document.guest.permission.guard';
import {
  BasicResponse,
  BatchCreatePresignedFormFieldDetectionUrlInput,
  CreatePresignedFormFieldDetectionUrlInput,
  CreatePresignedFormFieldDetectionUrlPayload,
  FormFieldDetectionTrigger,
  GetFormFieldDetectionUsagePayload,
  ProcessAppliedFormFieldsInput,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { User } from 'User/interfaces/user.interface';

@Resolver('DocumentFormFieldDetection')
export class DocumentFormFieldDetectionResolver {
  constructor(
    private readonly documentFormFieldDetectionService: DocumentFormFieldDetectionService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async createPresignedFormFieldDetectionUrl(
    @Args('input') input: CreatePresignedFormFieldDetectionUrlInput,
    @Context('req') { user }: { user: User },
  ): Promise<CreatePresignedFormFieldDetectionUrlPayload> {
    const { triggerAction } = input;
    if (triggerAction !== FormFieldDetectionTrigger.automatic) {
      if (!user.metadata.formFieldDetectionConsentGranted) {
        await this.documentFormFieldDetectionService.grantFormFieldDetectionConsent(
          user._id,
        );
      }

      await this.documentFormFieldDetectionService.checkFormFieldDetectionUsage(user._id);
    } else {
      await this.documentFormFieldDetectionService.checkAutoDetectionUsage(user._id);
    }

    return this.documentFormFieldDetectionService.createPresignedFormFieldDetectionUrl(user, input);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async batchCreatePresignedFormFieldDetectionUrl(
    @Args('inputs') inputs: BatchCreatePresignedFormFieldDetectionUrlInput,
    @Context('req') { user }: { user: User },
  ): Promise<CreatePresignedFormFieldDetectionUrlPayload[]> {
    const { pages } = inputs;
    if (!user.metadata.formFieldDetectionConsentGranted) {
      await this.documentFormFieldDetectionService.grantFormFieldDetectionConsent(
        user._id,
      );
    }
    await this.documentFormFieldDetectionService.checkFormFieldDetectionUsage(user._id);
    const result = pages.map((input) => this.documentFormFieldDetectionService.createPresignedFormFieldDetectionUrl(user, {
      documentId: inputs.documentId,
      fieldType: inputs.fieldType,
      pages: input,
    }));
    return Promise.all(result);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  async getFormFieldDetectionUsage(
    @Context('req') { user }: { user: User },
  ): Promise<GetFormFieldDetectionUsagePayload> {
    return this.documentFormFieldDetectionService.getFormFieldDetectionUsage(user._id);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @DocumentGuestAuthLevelGuard(
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    IndividualRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @Query()
  processAppliedFormFields(
    @Args('input') input: ProcessAppliedFormFieldsInput,
  ): BasicResponse {
    return this.documentFormFieldDetectionService.processAppliedFormFields(input);
  }
}
