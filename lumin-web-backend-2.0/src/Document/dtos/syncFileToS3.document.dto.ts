/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  MaxLength, IsOptional, IsBoolean,
} from 'class-validator';

import { MongoId } from 'Common/validator/rest.validator';

export class SyncFileToS3Dto {
  @ApiProperty({
    description: 'ID of the document to sync',
    required: true,
  })
  @MongoId()
    documentId: string;

    @MaxLength(1000)
      encodedUploadData: string;

    @IsOptional()
    @IsBoolean()
      increaseVersion: boolean;
}

export class SyncFileToS3DtoMobile {
    @MongoId()
      documentId: string;

    @MaxLength(1000)
      remoteId: string;

    @IsOptional()
    @MaxLength(1000)
      thumbnailRemoteId: string;

  @ApiProperty({
    description: 'Encoded upload data containing document remote ID and version ID',
    required: true,
  })
  @MaxLength(1000)
    encodedUploadData: string;

  @IsOptional()
  @IsBoolean()
    increaseVersion: boolean;
}
