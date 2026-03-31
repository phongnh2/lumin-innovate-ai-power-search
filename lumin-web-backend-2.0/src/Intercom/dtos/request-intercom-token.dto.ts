import { IsNotEmpty, IsString } from 'class-validator';

export class RequestIntercomTokenDto {
  @IsString()
  @IsNotEmpty()
    ipAddress: string;
}
