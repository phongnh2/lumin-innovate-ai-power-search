import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export class MessageDto {
  @ApiProperty({
    description: 'Role of the message sender (only user role is supported)',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  @IsEnum(MessageRole)
  @IsNotEmpty()
    role: MessageRole = MessageRole.USER;

  @ApiProperty({
    description: 'Content of the message',
    type: String,
    example: 'What is the weather in Tokyo?',
  })
  @IsString()
  @IsNotEmpty()
    content: string;

  @ApiProperty({
    description: 'ID of the message',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
    id: string;
}
