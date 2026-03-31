import { createContext, useContext } from 'react';

import { PAGE_RANGE_OPTIONS } from '@new-ui/components/PageRangeSelection/constants';
import { PageRangeType } from '@new-ui/components/PageRangeSelection/types';

import { CROP_TYPE_VALUE, PRESET_OPTIONS_VALUE, UNITS_VALUE } from './constants';
import { CropDimensionType, CropTypeOption, PresetType, UnitType } from './types';

type CropPanelContextType = {
  cropMode: PageRangeType;
  pageRangeValue: string;
  pageRangeError: string;
  isPageRangeValid: boolean;
  cropType: CropTypeOption;
  preset: PresetType;
  unit: UnitType;
  cropDimension: CropDimensionType;
  setCropMode: (cropMode: PageRangeType) => void;
  setPageRangeValue: (value: string, isValid: boolean) => void;
  setPageRangeError: (error: string) => void;
  onPageRangeBlur: (value: string, isValid: boolean, errorMessage: string) => void;
  setCropType: (cropType: CropTypeOption) => void;
  setPreset: (preset: PresetType) => void;
  setUnit: (unit: UnitType) => void;
  setCropDimension: (cropDimension: CropDimensionType) => void;
};

export const initialContextValue: CropPanelContextType = {
  cropMode: PAGE_RANGE_OPTIONS.ALL_PAGES,
  pageRangeValue: '',
  pageRangeError: '',
  isPageRangeValid: false,
  cropType: CROP_TYPE_VALUE.CROP_PAGE_BOX,
  preset: PRESET_OPTIONS_VALUE.CUSTOM,
  unit: UNITS_VALUE.INCH,
  cropDimension: {
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  setCropMode: () => {},
  setPageRangeValue: () => {},
  setPageRangeError: () => {},
  onPageRangeBlur: () => {},
  setCropType: () => {},
  setPreset: () => {},
  setUnit: () => {},
  setCropDimension: () => {},
};

export const CropPanelContext = createContext<CropPanelContextType>(initialContextValue);

export const CropPanelProvider = CropPanelContext.Provider;

export const useCropPanelContext = () => useContext(CropPanelContext);
