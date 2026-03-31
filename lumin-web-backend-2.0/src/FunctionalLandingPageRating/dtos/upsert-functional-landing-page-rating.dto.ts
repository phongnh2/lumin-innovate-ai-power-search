import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ActionFunctionalLandingPageRatingEnums } from '../functional-landing-page-rating.enum';

export class UpsertFunctionalLandingPageRatingDto {
  @ApiProperty({
    description: 'The action the user is rating',
    example: 'pdf-split',
    enum: ActionFunctionalLandingPageRatingEnums,
  })
  @IsEnum(ActionFunctionalLandingPageRatingEnums)
  @IsString()
  @IsNotEmpty()
    action: ActionFunctionalLandingPageRatingEnums;

  @ApiProperty({ description: 'The number of stars given', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
    stars: number;
}
