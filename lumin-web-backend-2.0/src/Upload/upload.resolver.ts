import { UseInterceptors, UseGuards } from '@nestjs/common';
import {
  Resolver, Args, Query, Context,
} from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  GetPresignedUrlForUploadDocPayload,
  GetPresignedUrlForUploadDocInput,
  GetPresignedUrlForUploadThumbnailPayload,
  GetPresignedUrlForUploadThumbnailInput,
  GetPresignedUrlForLuminSignIntegrationInput,
  GetPresignedUrlForLuminSignIntegrationPayload,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { UploadService } from './upload.service';

@UseInterceptors(SanitizeInputInterceptor)
@Resolver('Upload')
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getPresignedUrlForUploadDoc(
    @Context() context,
    @Args('input') input: GetPresignedUrlForUploadDocInput,
  ): Promise<GetPresignedUrlForUploadDocPayload> {
    const { user } = context.req;
    const { document, thumbnail } = await this.uploadService.getPresignedUrlForUploadDoc(input);
    const s3VersionId = document.fields.versionId;

    const encodedUploadData = this.uploadService.createToken({
      userId: user._id,
      documentRemoteId: document.fields.key,
      ...thumbnail && { thumbnailRemoteId: thumbnail.fields.key },
      ...s3VersionId && { versionId: s3VersionId },
    });
    return {
      document,
      thumbnail,
      encodedUploadData,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getPresignedUrlForLuminSignIntegration(
    @Args('input') input: GetPresignedUrlForLuminSignIntegrationInput,
  ): Promise<GetPresignedUrlForLuminSignIntegrationPayload> {
    const {
      documentMimeType,
      documentKey,
    } = input;
    const documentPresignedResult = await this.uploadService.getDocumentUploadToLuminSignPresignedUrl({
      mimeType: documentMimeType,
      key: documentKey,
    });

    return {
      document: documentPresignedResult,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query()
  async getPresignedUrlForUploadThumbnail(
    @Context() context,
    @Args('input') input: GetPresignedUrlForUploadThumbnailInput,
  ): Promise<GetPresignedUrlForUploadThumbnailPayload> {
    const {
      thumbnailMimeType,
      thumbnailKey,
    } = input;
    const { user } = context.req;
    const presignedData = await this.uploadService.getThumbnailPresignedUrl({ mimeType: thumbnailMimeType, key: thumbnailKey });
    const encodedUploadData = this.uploadService.createToken({
      userId: user._id,
      thumbnailRemoteId: presignedData.fields.key,
    });
    return {
      thumbnail: presignedData,
      encodedUploadData,
    };
  }
}
