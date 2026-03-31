/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';

export class PdfUploadRequest {
  @ApiProperty({
    description: 'PDF file to check',
    type: 'string',
    required: true,
  })
    remoteId: string;
}

export class SimplePdfCheckResponse {
  @ApiProperty({
    description: 'Whether the PDF is a simple PDF',
    type: 'boolean',
  })
    isSimplePdf: boolean;
}
