/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';

import { DocumentStorageEnum } from 'Document/document.enum';
import { ShareSetting } from 'graphql.schema';

export class PresignedFields {
  @ApiProperty({
    description: 'The key identifier for the file in storage',
  })
    key: string;

  @ApiProperty({
    description: 'Version identifier for the file (if versioning is enabled)',
    nullable: true,
  })
    versionId?: string;
}

export class ISignedUrl {
  @ApiProperty({
    description: 'Pre-signed URL for uploading or downloading a file',
  })
    url: string;

  @ApiProperty({
    description: 'Additional fields required for the S3 operation',
    type: () => PresignedFields,
    nullable: true,
  })
    fields: PresignedFields;
}

export class GetPresignedUrlForStaticToolUploadResponse {
  @ApiProperty({
    description: 'Pre-signed URL information for the main document file',
    type: () => ISignedUrl,
  })
    document: ISignedUrl;

  @ApiProperty({
    description: 'Pre-signed URL information for the document thumbnail',
    type: () => ISignedUrl,
  })
    thumbnail: ISignedUrl;

  @ApiProperty({
    description: 'Base64 encoded metadata about the upload',
  })
    encodedUploadData: string;
}

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the document',
  })
  _id: string;

  @ApiProperty({
    description: 'Name of the document',
  })
  name: string;

  @ApiProperty({
    description: 'Remote ID of the document in storage',
  })
  remoteId: string;

  @ApiProperty({
    description: 'MIME type of the document',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Size of the document in bytes',
    type: 'number',
  })
  size: number;

  @ApiProperty({
    description: 'Storage service used for the document',
    enum: ['s3', 'google', 'onedrive', 'dropbox'],
  })
  service: DocumentStorageEnum;

  @ApiProperty({
    description: 'Whether this is a personal document',
    type: 'boolean',
  })
  isPersonal: boolean;

  @ApiProperty({
    description: 'ID of the user who last modified the document',
  })
  lastModifiedBy: string;

  @ApiProperty({
    description: 'ID of the document owner',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Document sharing settings',
  })
  shareSetting: ShareSetting;

  @ApiProperty({
    description: 'Remote ID of the document thumbnail',
  })
  thumbnail?: string;

  @ApiProperty({
    description: 'ID of the folder containing the document',
  })
  folderId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class SystemFileSyncResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    type: 'number',
  })
    statusCode: number;

  @ApiProperty({
    description: 'Success message',
    type: 'string',
  })
    message: string;
}
