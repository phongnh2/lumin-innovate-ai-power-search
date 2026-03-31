import { ApiProperty } from '@nestjs/swagger';

export class IntercomConversationWithEmailDto {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
  })
  id: string;

  @ApiProperty({
    description: 'When the conversation was created',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the conversation was last updated',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Body/message of the conversation',
  })
  body: string;
}

export class IntercomEphemeralTokenDto {
  @ApiProperty({
    description: 'Ephemeral token',
  })
  token: string;

  @ApiProperty({
    description: 'Ephemeral token level',
  })
  level: string;
}
