import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString, Max, Min, IsInt,
} from 'class-validator';

export class GetReviewsInputDto {
  @ApiProperty({
    description: 'Filter reviews by tag',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
    tag?: string;

  @ApiProperty({
    description: 'Maximum number of reviews to return',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number;
}
