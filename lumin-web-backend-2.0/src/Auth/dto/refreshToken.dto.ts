import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

// TODO: add validation
export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token to exchange for new tokens' })
  @IsOptional() // Temporary, we need this for the error handling inside the controller to work properly
    refreshToken?: string;
}
