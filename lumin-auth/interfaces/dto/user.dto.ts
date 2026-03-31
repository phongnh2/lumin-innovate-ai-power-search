import { SettingsFlow } from '@ory/client';
import { IsString, Length } from 'class-validator';

import { ValidatorRule } from '@/constants/validator-rule';

export class ChangePasswordDTO {
  @IsString()
  @Length(ValidatorRule.Password.MinLength, ValidatorRule.Password.MaxLength)
  newPassword: string;

  flow: SettingsFlow;
}

export class ChangeNameDTO {
  @IsString()
  @Length(1, 32)
  newName: string;
}
