/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { MongoId } from 'Common/validator/rest.validator';

export class UploadFileDto {
    @ApiProperty({
      description: 'Document ID (for updating an existing document)',
      required: false,
    })
    @IsOptional()
    @MongoId()
      documentId?: string;

    @ApiProperty({
      description: 'Client ID (must match the authenticated user ID for personal documents)',
      required: true,
    })
    @MongoId()
      clientId: string;

    @ApiProperty({
      description: 'Folder ID where the document should be stored',
      required: false,
    })
    @IsOptional()
    @MongoId()
      folderId?: string;

    @ApiProperty({
      description: 'Encoded upload data containing document and thumbnail remote IDs',
      required: true,
    })
    @MaxLength(1000)
      encodedUploadData: string;

    @ApiProperty({
      description: 'Name of the file (optional, will be auto-generated if not provided)',
      required: false,
    })
    @IsOptional()
    @MaxLength(CommonConstants.MAX_DOCUMENT_NAME_LENGTH)
      fileName: string;
}

export class UploadFileDtoMobile {
    @ApiProperty({ type: String, description: 'The ID of the document' })
    @IsOptional()
    @MongoId()
      documentId?: string;

    @ApiProperty({ type: String, description: 'The ID of the client' })
    @MongoId()
      clientId: string;

    @ApiProperty({ type: String, description: 'The ID of the folder' })
    @IsOptional()
    @MongoId()
      folderId?: string;
}

export class UploadFileDtoMobileWithFile extends UploadFileDtoMobile {
  @ApiProperty({ type: String, format: 'binary', description: 'The file to upload' })
    files: string;

  @ApiProperty({ type: String, format: 'binary', description: 'The thumbnail to upload' })
    thumbnails: string;
}

export class GetPresignedUrlDto {
  @ApiProperty({
    description: 'The MIME type of the document',
    type: 'string',
    required: true,
  })
  @IsString()
    documentMimeType: string;

  @ApiProperty({
    description: 'The MIME type of the document thumbnail',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
    thumbnailMimeType?: string;

  @ApiProperty({
    description: 'The key of the document thumbnail',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
    thumbnailKey?: string;

  @ApiProperty({
    description: 'The key of the document',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
    documentKey?: string;

  @ApiProperty({
    description: 'The name of the document',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(CommonConstants.MAX_DOCUMENT_NAME_LENGTH)
    documentName?: string;
}
