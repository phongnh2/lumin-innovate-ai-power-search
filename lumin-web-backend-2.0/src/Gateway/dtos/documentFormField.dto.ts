import {
  IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, MaxLength,
} from 'class-validator';

import { MongoId } from 'Common/validator/rest.validator';
import { IsXml } from 'Common/validator/xml.validator';

import { FormFieldTypeEnum } from 'Document/document.annotation.enum';

export class DocumentFormFieldData {
  @MongoId()
    documentId: string;

  @IsEnum(FormFieldTypeEnum)
    type: string;

  @MaxLength(1024)
  @IsString()
    name: string;

  @IsString()
    widgetId: string;

  @IsInt()
    pageNumber: number;

  @IsOptional()
  @IsString()
    value?: string;

  @IsOptional()
  @IsXml()
    xfdf?: string;

  @IsOptional()
  @IsBoolean()
    isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
    isInternal?: boolean;

  @IsOptional()
  @IsDate()
    createdAt?: Date;

  @IsOptional()
  @IsDate()
    updatedAt?: Date;
}
