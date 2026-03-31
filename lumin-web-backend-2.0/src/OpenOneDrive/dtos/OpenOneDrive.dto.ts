/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined, IsEnum, IsNotEmptyObject, IsObject, IsOptional, IsString,
} from 'class-validator';

import { AuthenticationStatus } from 'Common/constants/OpenFlowFileConstants';

export class IOpenOneDriveDto {
  @ApiProperty({
    description: 'Culture name',
    required: true,
  })
  @IsString()
    cultureName: string;

  @ApiProperty({
    description: 'Array of OneDrive item IDs to open',
    type: [String],
    required: true,
  })
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    items!: [string];

  @ApiProperty({
    description: 'Client ID for authentication',
    required: false,
  })
  @IsString()
    client: string;

  @ApiProperty({
    description: 'Microsoft user ID for authentication',
    required: true,
  })
  @IsString()
    userId: string;

  @ApiProperty({
    description: 'Application ID for authentication',
    required: false,
  })
  @IsOptional()
  @IsString()
    appId?: string;
}

export class IOneDriveQuery {
  @ApiProperty({
    description: 'JSON stringified state object containing flow parameters',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Type(() => IOpenOneDriveDto)
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    signature!: IOpenOneDriveDto;
}

export class IOpenOneDriveQuery {
  @IsDefined()
  @ArrayNotEmpty()
  @IsArray()
    items: string[];

  @IsString()
    userId: string;
}

export class IOneDriveRedirectState {
  @IsDefined()
  @ArrayNotEmpty()
  @IsArray()
    items: string[];

  @IsString()
    userId: string;

  @IsString()
    flowId: string;

  @IsEnum(AuthenticationStatus)
    authStatus?: AuthenticationStatus;

  @IsString()
    host?: string;
}

export class IRedirectOneDriveDTO {
  @ApiProperty({
    description: 'Authorization code from Microsoft OAuth flow',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    code?: string;

  @ApiProperty({
    description: 'Client info',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    client_info?: string;

  @ApiProperty({
    description: 'Session state',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    session_state?: string;

  @ApiProperty({
    description: 'State parameter for CSRF protection and session restoration',
    required: true,
    type: IOneDriveRedirectState,
  })
  @IsDefined()
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    state!: IOneDriveRedirectState;

  @ApiProperty({
    description: 'Error code if authorization failed',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    error?: string;

  @ApiProperty({
    description: 'Error description if authorization failed',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    error_description?: string;
}

export class IOneDriveImportDocumentDTO {
  @ApiProperty({
    description: 'State object containing flow parameters',
    required: true,
    type: IOneDriveRedirectState,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Type(() => IOneDriveRedirectState)
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    state!: IOneDriveRedirectState;
}
