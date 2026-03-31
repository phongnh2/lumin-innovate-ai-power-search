import { ApiProperty } from '@nestjs/swagger';

import { LanguageEnum } from 'Blog/blogView.enum';

export class BlogViewResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the blog post',
    example: '60a1e2c3d4e5f6a7b8c9d0e1',
  })
    _id: string;

  @ApiProperty({
    description: 'URL of the blog post',
  })
    url: string;

  @ApiProperty({
    description: 'Number of views for the blog post',
    example: 1250,
    type: 'number',
  })
    views: number;

  @ApiProperty({
    description: 'Language of the blog post',
    enum: LanguageEnum,
    example: LanguageEnum.EN,
    enumName: 'LanguageEnum',
  })
    language: LanguageEnum;
}
