import { ApiProperty } from '@nestjs/swagger';

export class GetOAuthIdentityCallbackResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    type: 'boolean',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    type: 'string',
    example: 'Slack OAuth identity callback successful',
  })
    message: string;
}
