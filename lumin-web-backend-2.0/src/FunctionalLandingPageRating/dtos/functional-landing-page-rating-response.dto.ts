import { ApiProperty } from '@nestjs/swagger';

export class FunctionalLandingPageRatingResponseDto {
  @ApiProperty({ description: 'The action rated', example: 'pdf-split' })
    action: string;

  @ApiProperty({
    description: 'The number of votes for each star',
    example: {
      1: 0, 2: 0, 3: 0, 4: 1, 5: 1,
    },
  })
    stars: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };

  @ApiProperty({ description: 'The total number of votes', example: 2 })
    totalVotes: number;
}
