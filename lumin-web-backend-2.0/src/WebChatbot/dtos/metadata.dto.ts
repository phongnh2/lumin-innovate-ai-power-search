import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MetadataDto {
  @ApiProperty({
    description: 'Lumin language',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
    luminLanguage?: string;

  @ApiProperty({
    description: 'Browser language',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
    browserLanguage?: string;
}
