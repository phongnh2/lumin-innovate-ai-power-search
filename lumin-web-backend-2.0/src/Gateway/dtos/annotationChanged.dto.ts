/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  IsString, IsOptional, IsBoolean, IsEmail, IsEnum, IsNumber, ValidateNested,
  MaxLength,
} from 'class-validator';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { IsAnnotationId } from 'Common/validator/annotationId.validator';
import { ValidateIfNonEmptyString } from 'Common/validator/nonEmptyString.validator';
import { MongoId } from 'Common/validator/rest.validator';
import { IsXml } from 'Common/validator/xml.validator';

import {
  AnnotationAction, DocumentAnnotationSubTypeEnum, DocumentAnnotationTypeEnum, ReorderType,
} from 'Document/document.annotation.enum';
import { INPUT_CONTENT_MAX_LENGTH } from 'Document/documentConstant';
import { DocumentEventNames } from 'Event/enums/event.enum';

export class AnnotationComment {
  @MaxLength(INPUT_CONTENT_MAX_LENGTH)
  @IsString()
    content: string;

  @IsEnum(DocumentEventNames)
    commentInteractionEvent: DocumentEventNames;

  @IsOptional()
  @IsString()
    commentAuthor?: string;

  @IsOptional()
  @IsEmail({}, { each: true })
    mentionedEmails?: string[];
}

export class AnnotationChangedData {
  @MongoId()
    roomId: string;

  @IsEmail()
    email: string;

  @IsXml()
    xfdf: string;

  @ValidateIfNonEmptyString()
  @IsAnnotationId()
    annotationId: string;

  @IsOptional()
  @MaxLength(50) // can be DocumentAnnotationTypeEnum if created in Lumin or any other string if created in other WebViewer
  @IsString()
    annotationType: DocumentAnnotationTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => AnnotationComment)
    comment?: AnnotationComment;

  @ValidateIfNonEmptyString()
  @IsEnum(AnnotationAction)
    annotationAction: AnnotationAction;

  @IsOptional()
  @IsBoolean()
    shouldCreateEvent?: boolean;

  @ValidateIfNonEmptyString()
  @IsEnum(ReorderType)
    reorderType?: ReorderType;

  @IsOptional()
  @MaxLength(CommonConstants.S3_KEY_MAX_LENGTH) // Maximum s3 key length is 1024 bytes
  @IsString()
    imageRemoteId?: string;

  @ValidateIfNonEmptyString()
  @IsEnum(DocumentAnnotationSubTypeEnum)
    annotationSubType?:DocumentAnnotationSubTypeEnum;

  @IsOptional()
  @IsBoolean()
    isInternal?: boolean;

  @IsOptional()
  @IsNumber()
    pageIndex?: number;
}
