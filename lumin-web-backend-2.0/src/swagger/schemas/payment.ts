import { ApiProperty } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({
    description: 'Response message',
    type: 'string',
  })
    message: string;

  @ApiProperty({
    description: 'HTTP status code',
    type: 'number',
  })
    status: number;
}
