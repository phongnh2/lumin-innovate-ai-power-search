import { CROP_TYPE_VALUE, PRESET_OPTIONS_VALUE, UNITS_VALUE } from './constants';

export type CropTypeOption = keyof typeof CROP_TYPE_VALUE;

export type PresetType = keyof typeof PRESET_OPTIONS_VALUE;

export type UnitType = typeof UNITS_VALUE[keyof typeof UNITS_VALUE];

export type CropDimensionType = {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

export type GetCropDimensionsType = {
  pageInfo?: Core.Document.PageInfo;
  cropDimension?: CropDimensionType;
  validDimension?: CropDimensionType;
  currentAnnotation?: Core.Annotations.Annotation;
};
