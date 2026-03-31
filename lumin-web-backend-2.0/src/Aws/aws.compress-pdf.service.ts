import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { CompressOptionsInput, ISignedUrl } from 'graphql.schema';

import { AwsServiceBase } from './aws.base.service';

@Injectable()
export class AwsCompressPdfService extends AwsServiceBase {
  private compressPdfBucket = this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);

  async getCompressDocumentPresignedUrl({
    sessionId,
    documentId,
    prefixEnv,
    compressOptions,
  }: {
    sessionId: string;
    documentId: string;
    prefixEnv: string;
    compressOptions: CompressOptionsInput;
  }): Promise<ISignedUrl> {
    const key = `compress/${prefixEnv}/${sessionId}/${documentId.toString()}`;
    const {
      compressLevel, isDownSample, dpiImage, isEmbedFont, isSubsetFont, removeAnnotation, removeDocInfo, documentPassword,
    } = compressOptions;

    const metadata = {
      compress_level: compressLevel.toString(),
      is_down_sample: isDownSample.toString(),
      dpi_image: dpiImage.toString(),
      is_embed_font: isEmbedFont.toString(),
      is_subset_font: isSubsetFont.toString(),
      remove_annotation: removeAnnotation.toString(),
      remove_doc_info: removeDocInfo.toString(),
      document_password: documentPassword,
    };

    return this.createUploadPresignedUrl({
      key,
      bucket: this.compressPdfBucket,
      options: { Metadata: metadata },
      s3Instance: this.getS3InstanceForDevelopment(),
    });
  }
}
