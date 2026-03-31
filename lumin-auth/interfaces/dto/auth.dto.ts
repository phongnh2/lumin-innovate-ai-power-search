/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

import { SelfServiceFlow } from '@/interfaces/ory';
import { ReCaptchaAction } from '@/interfaces/user';

export class SignInDTO {
  @IsEmail()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  challenge: string;

  flow: SelfServiceFlow;
}

export class SignUpDTO {
  @IsEmail()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  password: string;

  @IsString()
  @MaxLength(32)
  name: string;

  flow: SelfServiceFlow;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  anonymousUserId?: string;
}

export class ForgotPasswordDTO {
  @IsEmail()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  token: string;

  flow: any;

  @IsEnum(ReCaptchaAction)
  action: ReCaptchaAction;
}

export class SignOutDTO {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  returnTo: string;
}

export class VerifyAccountDTO {
  @IsEmail()
  email: string;
}

export class SignUpInvitationDTO {
  @IsString()
  token: string;

  @IsString()
  @MaxLength(32)
  name: string;

  @IsString()
  password: string;

  flow: SelfServiceFlow;
}

export class VerifyMethodDTO {
  @IsString()
  flowId: string;
}

export class ResendVerificationDTO {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  flow: any;
}

export class VerifySSOEmailDTO {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
