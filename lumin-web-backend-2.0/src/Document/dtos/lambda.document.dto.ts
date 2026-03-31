import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendSignedUrlDto {
  @ApiProperty({
    description: 'Name of the converted file',
    required: true,
  })
  @IsString()
    fileName: string;

  @ApiProperty({
    description: 'Pre-signed URL for accessing the converted file',
    required: false,
  })
  @IsOptional()
  @IsString()
    preSignedUrl: string;

  @ApiProperty({
    description: 'Error message if conversion failed',
    required: false,
  })
  @IsOptional()
  @IsString()
    errorMessage: string;

  @ApiProperty({
    description: 'Position of the converted file',
    required: false,
  })
  @IsOptional()
  @IsString()
    position: number;
}
