// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import {
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Mutation, Context, Args,
} from '@nestjs/graphql';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';
import { DocumentThumbnailPipe } from 'Common/validator/FileValidator/documentThumbnail.validator.pipe';
import { IDocument } from 'Document/interfaces/document.interface';
import {
  BasicResponse,
} from 'graphql.schema';
import { OrganizationValidationStrategy } from 'Organization/organization.enum';
import { Resource } from 'Organization/Policy/architecture/policy.enum';

import { OrganizationPermissionGuard } from 'Organization/guards/Gql/organization.permission.guard';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { DocumentOwnerTypeEnum } from 'Document/document.enum';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { Utils } from 'Common/utils/Utils';
import { OrganizationServiceMobile } from 'Organization/organization.service.mobile';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';

@UseInterceptors(DocumentPaymentInterceptor)
@Resolver()
@OrganizationPermissionGuard(OrganizationValidationStrategy.PUBLIC, Resource.ORGANIZATION_TEAM)
@UseInterceptors(SanitizeInputInterceptor)
export class OrganizationTeamPublicResolverMobile {
  constructor(
    private readonly organizationServiceMobile: OrganizationServiceMobile,
    private readonly organizationDocStackService: OrganizationDocStackService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @FolderPermissionGuard()
  @Mutation()
  async uploadDocumentToOrgTeam(
    @Context() context,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe(), DocumentThumbnailPipe({ optional: true }))
      uploadedFiles: [FileData],
    @Args('teamId') teamId: string,
    @Args('folderId') folderId: string,
  ): Promise<Partial<IDocument> & ExtendedDocumentIntercept & BasicResponse> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: 1,
    });
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    if (!hasRemainingDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('You currently reached Doc Stack limitation', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
    const documentUploaded = await this.organizationServiceMobile.uploadDocument({
      uploader: user,
      clientId: teamId,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
      files: uploadedFiles,
      context: organization,
      folderId,
    });
    return {
      ...documentUploaded,
      message: 'Upload organization document successfully',
      statusCode: HttpStatus.OK,
      interceptRequest: {
        documentIds: [documentUploaded._id],
        strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
      },
    };
  }
}
