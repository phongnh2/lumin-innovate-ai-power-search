// eslint-disable-next-line max-classes-per-file
import { Type } from 'class-transformer';
import {
  IsBoolean, IsOptional, IsString, MaxLength,
  ValidateNested,
} from 'class-validator';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { MongoId } from 'Common/validator/rest.validator';

class User {
  @MaxLength(36) // The value can be a UUID (36 characters), a MongoDB ObjectId (24 characters)
  @IsString()
    _id: string;

  @MaxLength(256) // Need to set 256 as there are some old usernames have 256 characters
  @IsString()
    name: string;

  @IsOptional()
  @IsBoolean()
    isActive: boolean;

  @IsOptional()
  @MaxLength(CommonConstants.S3_KEY_MAX_LENGTH)
  @IsString()
    avatarRemoteId: string;
}

export class ConnectionData {
  @MongoId()
    roomId: string;

  @ValidateNested()
  @Type(() => User)
    user: User;
}

export class DisconnectionData extends ConnectionData {
  @MaxLength(CommonConstants.S3_KEY_MAX_LENGTH)
  @IsString()
    remoteId: string;
}
