/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { IntercomMessageType, IntercomContactRole } from 'Intercom/intercom.enum';

export class SearchContactInputDto {
  @ApiProperty({
    description: 'Email to search for a contact',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;
}

export class FindOrCreateContactInputDto {
  @ApiProperty({
    description: 'Email of the user to search or create for a contact',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({
    description: 'Name to create for a contact',
    type: String,
  })
  @IsOptional()
  @IsString()
    name?: string;
}

export class CreateContactInputDto {
  @ApiProperty({
    description: 'Email of the contact to create',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({
    description: 'Role to create for a contact',
    enum: IntercomContactRole,
    example: IntercomContactRole.USER,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(IntercomContactRole)
    role: IntercomContactRole;

  @ApiProperty({
    description: 'Name to create for a contact',
    type: String,
  })
  @IsOptional()
  @IsString()
    name?: string;
}

export class UpdateContactInputDto {
  @ApiProperty({
    description: 'Id of the contact to update',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    id: string;

  @ApiProperty({
    description: 'Name to update for a contact',
    type: String,
  })
  @IsOptional()
  @IsString()
    name?: string;
}

export class ContactInfoDto {
  @ApiProperty({
    description: 'ContactId of the contact in Intercom',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    id: string;

  @ApiProperty({
    description: 'Role of the contact in Intercom',
    enum: IntercomContactRole,
    example: IntercomContactRole.USER,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(IntercomContactRole)
    role: IntercomContactRole;

  @ApiProperty({
    description: 'Email of the contact in Intercom',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({
    description: 'Name of the contact in Intercom',
    type: String,
  })
  @IsOptional()
  @IsString()
    name?: string;

  @ApiProperty({
    description: 'Created at of the contact in Intercom',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
    created_at?: number;
}

export class CreateConversationInputDto {
  @ApiProperty({
    description: 'Body/message of the conversation',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    body: string;

  @ApiProperty({
    description: 'Subject of the conversation',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    subject: string;

  @ApiProperty({
    description: 'Message type of the conversation',
    enum: IntercomMessageType,
    example: IntercomMessageType.EMAIL,
  })
    @IsOptional()
    @IsEnum(IntercomMessageType)
    messageType?: IntercomMessageType;

    @ApiProperty({
      description: 'The contact is creating the conversation',
      required: true,
      type: () => ContactInfoDto,
    })
    @IsNotEmpty()
      contactInfo: ContactInfoDto;
}

export class CreateConversationWithEmailInputDto {
  @ApiProperty({
    description: 'Email of the user for the conversation',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({
    description: 'Body/message of the conversation',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    body: string;

  @ApiProperty({
    description: 'Subject of the conversation',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    subject: string;

  @ApiProperty({
    description: 'Message type of the conversation',
    enum: IntercomMessageType,
    example: IntercomMessageType.EMAIL,
  })
    @IsOptional()
    @IsEnum(IntercomMessageType)
    messageType?: IntercomMessageType;

  @ApiProperty({
    description: 'Name of the user for the conversation',
    type: String,
  })
  @IsOptional()
  @IsString()
    name?: string;
}

export class GenerateIntercomJWTInputDto {
  @ApiProperty({
    description: 'Email of the user for the Intercom messenger',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty({
    description: 'Id of the user for the Lumin`s account is using Intercom messenger',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    id: string;

  @ApiProperty({
    description: 'Name of the user for the Lumin`s account is using Intercom messenger',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    name: string;
}

export class MergeLeadIntoUserContactInputDto {
  @ApiProperty({
    description: 'Lead contact Id to merge to User',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
    leadContactId: string;

  @ApiProperty({
    description: 'User contact Id to be merged into',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
    userContactId: string;
}

export class MergeLeadAndUserHasSameEmailInputDto {
  @ApiProperty({
    description: 'Email to search for a contact',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
    email: string;
}
