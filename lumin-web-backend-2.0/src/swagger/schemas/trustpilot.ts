import { ApiProperty } from '@nestjs/swagger';

export class TrustpilotReviewDto {
  @ApiProperty({
    description: 'Name of the consumer who wrote the review',
    type: 'string',
  })
    consumerName: string;

  @ApiProperty({
    description: 'Title of the review',
    type: 'string',
  })
    title: string;

  @ApiProperty({
    description: 'Text content of the review',
    type: 'string',
  })
    text: string;

  @ApiProperty({
    description: 'Star rating (1-5)',
    type: 'number',
    minimum: 1,
    maximum: 5,
  })
    stars: number;

  @ApiProperty({
    description: 'URL link to the review on Trustpilot',
    type: 'string',
    format: 'uri',
  })
    href: string;

  @ApiProperty({
    description: 'Date when the review was created',
    type: 'string',
    format: 'date-time',
  })
    createdAt: Date;
}
