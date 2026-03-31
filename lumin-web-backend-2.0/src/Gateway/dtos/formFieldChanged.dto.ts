/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  IsString, MaxLength, IsOptional, IsBoolean, ValidateNested, IsEnum,
} from 'class-validator';

import { FormFieldChangedSource } from 'Common/constants/SocketConstants';
import { IsAnnotationId } from 'Common/validator/annotationId.validator';
import { ValidateIfNonEmptyString } from 'Common/validator/nonEmptyString.validator';
import { MongoId } from 'Common/validator/rest.validator';
import { IsXml } from 'Common/validator/xml.validator';

import { FormFieldTypeEnum } from 'Document/document.annotation.enum';
import { INPUT_CONTENT_MAX_LENGTH } from 'Document/documentConstant';

const MAXIMUM_FORM_FIELD_XFDF_SIZE = 100000; // 100KB

const MAXIMUM_FIELD_NAME_LENGTH = 1024;

class FormField {
  @IsOptional()
  @IsString()
  @MaxLength(MAXIMUM_FIELD_NAME_LENGTH)
    name?: string;

  @ValidateIfNonEmptyString()
  @IsEnum(FormFieldTypeEnum)
    type?: FormFieldTypeEnum;

  @IsOptional()
  @MaxLength(INPUT_CONTENT_MAX_LENGTH)
  @IsString()
    value?: string;

  @ValidateIfNonEmptyString()
  @MaxLength(MAXIMUM_FORM_FIELD_XFDF_SIZE)
  @IsXml()
    xfdf?: string;

  @IsOptional()
  @IsBoolean()
    isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
    isInternal?: boolean;

  @IsOptional()
  @IsAnnotationId()
    widgetId?: string;
}

export class FormFieldChangedData {
  @MongoId()
    roomId: string;

  @ValidateNested()
  @Type(() => FormField)
    data: FormField;

  @IsString()
  @MaxLength(MAXIMUM_FIELD_NAME_LENGTH)
    fieldName: string;

  @IsOptional()
  @IsEnum(FormFieldChangedSource)
    formFieldChangedSource: FormFieldChangedSource;
}
