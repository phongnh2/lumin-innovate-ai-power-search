import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponse {
  @ApiProperty({ description: 'New access token' })
  accessToken: string;

  @ApiProperty({ description: 'New refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User data' })
  userData: any;
}

export class ContractTemporaryResponse {
  @ApiProperty({ description: 'Unique identifier for the stored contract information' })
  identify: string;
}
