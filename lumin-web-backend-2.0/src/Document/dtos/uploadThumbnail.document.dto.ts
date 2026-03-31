/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

import { MongoId } from 'Common/validator/rest.validator';

export class UploadThumbnailDto {
    @ApiProperty({
      description: 'ID of the document to update with the new thumbnail',
      required: true,
    })
    @MongoId()
      documentId: string;

    @ApiProperty({
      description: 'Encoded upload data containing the thumbnail remote ID',
      required: true,
    })
    @MaxLength(1000)
      encodedUploadData: string;
}

export class UploadThumbnailDtoMobile {
  @ApiProperty({ type: String, description: 'The ID of the document' })
  @MongoId()
    documentId: string;
}

export class UploadThumbnailDtoMobileWithFile extends UploadThumbnailDtoMobile {
  @ApiProperty({ type: String, format: 'binary', description: 'The thumbnail file' })
    thumbnailFile: string;
}
