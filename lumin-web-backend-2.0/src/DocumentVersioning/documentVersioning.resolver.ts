import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args, Context, Query, Resolver,
} from '@nestjs/graphql';
import { Types } from 'mongoose';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { AwsDocumentVersioningService } from 'Aws/aws.document-versioning.service';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { DocumentService } from 'Document/document.service';
import { RoleGuardForEditorAndHigherPermissions } from 'Document/guards/Gql/document.guest.permission.guard';
import {
  GetBackupAnnotationPresignedUrlInput,
  GetDocumentVersionListInput,
  GetVersionListPayload,
  ISignedUrl,
  GetVersionPresignedUrlInput,
  GetVersionPresignedUrlPayload,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { DocumentVersioningService } from './documentVersioning.service';
import { DocumentVersioningStorageService } from './documentVersioning.storage.service';

@UseGuards(GqlAuthGuard)
@UseInterceptors(SanitizeInputInterceptor)
@RoleGuardForEditorAndHigherPermissions()
@Resolver('DocumentVersioning')
export class DocumentVersioningResolvers {
  constructor(
    private readonly documentVersioningService: DocumentVersioningService,
    private readonly awsDocumentVersioningService: AwsDocumentVersioningService,
    private readonly documentService: DocumentService,
    private readonly documentVersioningStorageService: DocumentVersioningStorageService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getDocumentVersionList(@Args('input') input: GetDocumentVersionListInput): Promise<GetVersionListPayload> {
    const { documentId } = input;
    const result = await this.documentVersioningService.getVersionList(new Types.ObjectId(documentId));
    return {
      data: result.data.map((item) => ({
        versionId: item.versionId,
        annotationSignedUrl: item.annotationPath,
        documentId: String(item.documentId),
        _id: String(item._id),
        createdAt: item.createdAt,
        modifiedBy: {
          _id: String(item.modifiedBy?._id),
          name: item.modifiedBy?.name,
          avatar: item.modifiedBy?.avatarRemoteId,
        },
      })),
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getBackupAnnotationPresignedUrl(
    @Args('input') input: GetBackupAnnotationPresignedUrlInput,
    @Context() context,
  ): Promise<ISignedUrl> {
    const { documentId } = input;
    const userId = context.req.user._id;
    const documentInfo = await this.documentService.findOneById(String(documentId));
    if (!documentInfo) {
      throw GraphErrorException.NotFound('Document not found');
    }

    const [currentVersion] = await this.awsDocumentVersioningService.getRecentDocumentFileVersions(documentInfo.remoteId);
    return this.documentVersioningStorageService.createUploadAnnotationPresignedUrl({
      versionId: currentVersion?.VersionId,
      documentId: new Types.ObjectId(documentId),
      userId: userId as Types.ObjectId,
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getVersionPresignedUrl(
    @Args('input') input: GetVersionPresignedUrlInput,
  ): Promise<GetVersionPresignedUrlPayload> {
    const { _id: documentVersionId } = input;
    const versionRecord = await this.documentVersioningService.getVersionById((new Types.ObjectId(documentVersionId)));
    if (!versionRecord) {
      throw GraphErrorException.NotFound('Version not found');
    }
    return this.documentVersioningStorageService.generateGetVersionPresignedUrl({
      versionId: versionRecord.versionId,
      documentId: versionRecord.documentId,
      annotationPath: versionRecord.annotationPath,
    });
  }
}
