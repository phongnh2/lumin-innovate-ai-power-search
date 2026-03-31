/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MongoId, UUID } from 'Common/validator/rest.validator';

import { OutlineActionEnum, OutlineMoveDirectionsEnum } from 'Document/documentConstant';

export class OutlineData {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
    name: string;

  @IsOptional()
  @UUID()
    parentId?: string;

  @UUID()
    pathId: string;

  @Min(0)
  @Max(100)
  @IsInt()
    level: number;

  @IsOptional()
  @Min(0)
  @Max(100000)
  @IsInt()
    pageNumber?: number;

  @IsNumber()
    verticalOffset: number;

  @IsNumber()
    horizontalOffset: number;

  @IsBoolean()
    hasChildren: boolean;
}

export class EditableOutlineData {
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @IsString()
    name?: string;

  @IsOptional()
  @Min(0)
  @Max(100000)
  @IsInt()
    pageNumber?: number;

  @IsOptional()
  @IsNumber()
    verticalOffset?: number;

  @IsOptional()
  @IsNumber()
    horizontalOffset?: number;
}

abstract class OutlineSocketData {
  @IsEnum(OutlineActionEnum)
    action: OutlineActionEnum;
}

export class OutlineInsertData extends OutlineSocketData {
  @Equals(OutlineActionEnum.INSERT)
    action: OutlineActionEnum.INSERT;

  @IsOptional()
  @UUID()
    refId?: string;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => OutlineData)
    outline: OutlineData;

  @IsBoolean()
    isSubOutline: boolean;
}

export class OutlineEditData extends OutlineSocketData {
  @Equals(OutlineActionEnum.EDIT)
    action: OutlineActionEnum.EDIT;

  @UUID()
    pathId: string;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => EditableOutlineData)
    outline: EditableOutlineData;
}

class OutlineDeleteData extends OutlineSocketData {
  @Equals(OutlineActionEnum.DELETE)
    action: OutlineActionEnum.DELETE;

  @UUID()
    pathId: string;
}

class OutlineMoveData extends OutlineSocketData {
  @Equals(OutlineActionEnum.MOVE)
    action: OutlineActionEnum.MOVE;

  @UUID()
    refId: string;

  @UUID()
    pathId: string;

  @IsEnum(OutlineMoveDirectionsEnum)
    movePosition: OutlineMoveDirectionsEnum;
}

export type TOutlineActionData = OutlineInsertData | OutlineEditData | OutlineDeleteData | OutlineMoveData;

export class OutlinesChangedData {
  @MongoId()
    roomId: string;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => OutlineSocketData, {
    discriminator: {
      property: 'action',
      subTypes: [
        { value: OutlineInsertData, name: OutlineActionEnum.INSERT },
        { value: OutlineEditData, name: OutlineActionEnum.EDIT },
        { value: OutlineDeleteData, name: OutlineActionEnum.DELETE },
        { value: OutlineMoveData, name: OutlineActionEnum.MOVE },
      ],
    },
    keepDiscriminatorProperty: true,
  })
    data: TOutlineActionData;
}
