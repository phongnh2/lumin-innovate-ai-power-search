/* eslint-disable indent */
/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
 IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString,
 ValidateNested,
} from 'class-validator';

import { LoginService } from 'graphql.schema';

export class ChangeIndividualLoginServiceInput {
  @IsEmail()
  email: string;

  @IsEnum(LoginService)
  loginService: LoginService;
}

export class ChangeDomainLoginServiceInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(LoginService)
  loginService: LoginService;
}

export class ChangeGroupLoginServiceInput {
  @IsNotEmpty()
  @IsString()
  csvPath: string;

  @IsEnum(LoginService)
  loginService: LoginService;
}

export class ChangeUserLoginServiceInput {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChangeIndividualLoginServiceInput)
  individual: ChangeIndividualLoginServiceInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChangeDomainLoginServiceInput)
  domain: ChangeDomainLoginServiceInput;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChangeGroupLoginServiceInput)
  group: ChangeGroupLoginServiceInput;
}
