import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

import { ActionFunctionalLandingPageRatingEnums } from '../functional-landing-page-rating.enum';

export class GetFunctionalLandingPageRatingDto {
  @ApiProperty({
    description: 'The action to get the rating for',
    example: 'pdf-split',
    enum: ActionFunctionalLandingPageRatingEnums,
  })
  @IsEnum(ActionFunctionalLandingPageRatingEnums)
  @IsString()
  @IsNotEmpty()
    action: ActionFunctionalLandingPageRatingEnums;
}
