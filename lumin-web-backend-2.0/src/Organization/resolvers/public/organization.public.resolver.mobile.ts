/* eslint-disable dot-notation */
import {
  HttpStatus, UseInterceptors, UseGuards,
} from '@nestjs/common';
import {
  Context, Args, Resolver, Mutation,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { DocumentThumbnailPipe } from 'Common/validator/FileValidator/documentThumbnail.validator.pipe';
import {
  BasicResponse,
  UploadPersonalDocumentInput,
} from 'graphql.schema';

import {
  IDocument,
} from 'Document/interfaces/document.interface';

import { OrganizationPermissionGuard } from 'Organization/guards/Gql/organization.permission.guard';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';

import {
  OrganizationValidationStrategy,
} from 'Organization/organization.enum';

import { Resource } from 'Organization/Policy/architecture/policy.enum';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { DocumentOwnerTypeEnum } from 'Document/document.enum';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { LoggingInterceptor } from 'Common/interceptors/logging.interceptor';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { Utils } from 'Common/utils/Utils';
import { OrganizationServiceMobile } from 'Organization/organization.service.mobile';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { IOrganization } from 'Organization/interfaces/organization.interface';

@UseInterceptors(DocumentPaymentInterceptor)
@OrganizationPermissionGuard(OrganizationValidationStrategy.PUBLIC, Resource.ORGANIZATION)
@UseInterceptors(SanitizeInputInterceptor)
@Resolver('Organization')
export class OrganizationPublicResolverMobile {
  constructor(
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly organizationServiceMobile: OrganizationServiceMobile,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseInterceptors(LoggingInterceptor)
  @Mutation()
  async uploadDocumentToOrganization(
    @Context() context,
    @Args(
      { name: 'files', type: () => GraphQLUpload },
      DocumentFilePipe({ isRequestFromMobile: true }),
      DocumentThumbnailPipe({ optional: true }),
    )
      uploadedFiles: [FileData],
    @Args('isNotify') pushNotiOrg: boolean,
    @Args('folderId') folderId: string,
  ): Promise<Partial<IDocument> & ExtendedDocumentIntercept & BasicResponse> {
    const { organization, user }: { organization: IOrganization, user: any } = context.req;
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    const hasRemainingDocStack = await this.organizationDocStackService.validateIncreaseDocStack(organization, {
      totalNewDocument: 1,
    });
    if (!hasRemainingDocStack && !isRequestFromMobile) {
      throw GraphErrorException.BadRequest('You currently reached Doc Stack limitation', ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT);
    }
    const documentUploaded = await this.organizationServiceMobile.uploadDocument({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.ORGANIZATION,
      files: uploadedFiles,
      context: organization,
      folderId,
      isNotify: pushNotiOrg,
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

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard()
  @Mutation()
  uploadDocumentToPersonal(
    @Context() context,
    @Args('input') input: UploadPersonalDocumentInput,
    @Args({ name: 'files', type: () => GraphQLUpload }, DocumentFilePipe(), DocumentThumbnailPipe({ optional: true })) uploadedFiles: [FileData],
  ): Promise<IDocument> {
    const { user, organization } = context.req;
    const { documentId } = input;

    if (documentId) {
      return this.organizationServiceMobile.convertPersonalDocToLuminByUpload({
        uploader: user,
        files: uploadedFiles,
        documentId,
      });
    }

    return this.organizationServiceMobile.uploadDocument({
      uploader: user,
      clientId: organization._id,
      documentOwnerType: DocumentOwnerTypeEnum.PERSONAL,
      files: uploadedFiles,
      context: organization,
      folderId: input.folderId,
      isNotify: false,
    });
  }
}
