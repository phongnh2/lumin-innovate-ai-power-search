import { ApiProperty } from '@nestjs/swagger';

import { MongoId } from 'Common/validator/rest.validator';

export class GetFileDocumentDto {
  @ApiProperty({
    description: 'ID of the document to retrieve',
    required: true,
  })
  @MongoId()
    documentId: string;
}
