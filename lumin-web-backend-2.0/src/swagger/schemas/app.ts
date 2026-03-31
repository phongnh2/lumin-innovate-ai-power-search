import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
    @ApiProperty({
      type: 'string',
      example: 'running',
      enum: ['running'],
      description: 'Current status of the API',
    })
    status: 'running';

    @ApiProperty({
      type: 'string',
      example: '1.0.0',
      description: 'Version number',
    })
    version: string;
}
