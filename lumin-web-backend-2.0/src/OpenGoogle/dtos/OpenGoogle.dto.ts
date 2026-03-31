/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class IGoogleStateQuery {
  @IsNotEmpty()
  @Equals('open')
  @IsString()
    action: string;

  @IsDefined()
  @ArrayNotEmpty()
  @IsArray()
    ids: [string];

  @IsOptional()
  @IsString()
    userId?: string;

  @IsOptional()
  @IsBoolean()
    skipDriveInstall?: boolean;

  @IsOptional()
  @IsString()
    lm_action?: string;

  @IsOptional()
  @IsString()
    lm_from?: string;
}

export class IGoogleQueryDto {
  @ApiProperty({
    description: 'JSON stringified state object containing flow parameters',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Type(() => IGoogleStateQuery)
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    state!: IGoogleStateQuery;
}

export class IGoogleRedirectState {
  @IsDefined()
  @IsString()
    signature: string;

  @IsOptional()
  @IsBoolean()
    isSignedUp?: boolean;
}

export class IGoogleRedirectQueryDto {
  @ApiProperty({
    description: 'Authorization code from Google OAuth flow',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
    code?: string;

  @ApiProperty({
    description: 'Error code if authorization failed',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    error?: string;

  @ApiProperty({
    description: 'State object containing flow context',
    required: true,
    type: IGoogleRedirectState,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Type(() => IGoogleRedirectState)
  @Transform(({ value }: { value: string }) => JSON.parse(value), { toClassOnly: true })
    state!: IGoogleRedirectState;
}
