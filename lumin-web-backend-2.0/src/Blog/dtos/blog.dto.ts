/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn, IsInt, IsOptional, IsString, Max, Min,
} from 'class-validator';

import { LanguageEnum } from 'Blog/blogView.enum';
import { MOST_VIEW_BLOG_MAX_NUMBER } from 'constant';

const BLOG_LANGUAGES = Object.values(LanguageEnum);

export class IBlogViewBodyDto {
  @ApiProperty({
    description: 'The URL of the blog post',
    type: 'string',
    required: true,
  })
  @IsString()
    url: string;

  @ApiProperty({
    description: 'The language of the blog post',
    type: 'string',
    required: true,
    enum: LanguageEnum,
  })
  @IsString()
  @IsIn(BLOG_LANGUAGES)
    language: LanguageEnum;

  @ApiProperty({
    description: 'The author of the blog post',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
    author: string;
}

export class IBlogMostViewDto {
  @ApiProperty({
    description: 'The number of blog posts to retrieve',
    type: 'number',
    required: false,
    minimum: 1,
    maximum: MOST_VIEW_BLOG_MAX_NUMBER,
  })
  @IsInt()
  @Min(1)
  @Max(MOST_VIEW_BLOG_MAX_NUMBER)
  @Transform(({ value }) => JSON.parse(value as string), { toClassOnly: true })
    number: number;

  @ApiProperty({
    description: 'The language of the blog post',
    type: 'string',
    required: false,
    enum: LanguageEnum,
  })
  @IsString()
  @IsIn(BLOG_LANGUAGES)
    language: LanguageEnum;

  @ApiProperty({
    description: 'The author of the blog post',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
    author: string;

  @ApiProperty({
    description: 'The number page of blog posts to retrieve',
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => JSON.parse(value as string), { toClassOnly: true })
    page: number = 1;
}
