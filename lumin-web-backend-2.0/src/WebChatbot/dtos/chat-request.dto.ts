import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty, IsMongoId, IsEnum, IsOptional, IsString,
} from 'class-validator';

import { DocumentTab } from 'graphql.schema';

import { MessageDto } from './message.dto';
import { MetadataDto } from './metadata.dto';

export class ChatRequestDto {
  @ApiProperty({
    description: 'Array of messages in the conversation',
    type: [MessageDto],
  })
  @IsArray()
  @IsNotEmpty()
    messages: MessageDto[];

  @ApiProperty({
    description: 'Organization ID to filter the documents',
    type: String,
    required: true,
  })
  @IsMongoId()
    orgId: string;

  @ApiProperty({
    description: 'Team ID to filter the documents',
    type: String,
    required: false,
  })
  @IsMongoId()
  @IsOptional()
    currentTeamId?: string;

  @ApiProperty({
    description: 'Folder ID to filter the documents',
    type: String,
    required: false,
  })
  @IsMongoId()
  @IsOptional()
    folderId?: string;

  @ApiProperty({
    description: 'Document tab to filter the documents',
    type: String,
    required: false,
  })
  @IsEnum(DocumentTab)
  @IsOptional()
    documentTab?: DocumentTab;

  @ApiProperty({
    description: 'Metadata',
    type: MetadataDto,
    required: true,
  })
    metadata: MetadataDto;

  @ApiProperty({
    description: 'ID of the chat',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
    id: string;
}
