/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';

export class FilesUploadDto {
  @ApiProperty({
    description: 'Files to upload',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: true,
  })
    files: any[];
}
