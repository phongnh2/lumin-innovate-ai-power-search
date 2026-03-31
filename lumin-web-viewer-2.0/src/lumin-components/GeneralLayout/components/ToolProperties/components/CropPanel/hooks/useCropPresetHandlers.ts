import { useCallback, useEffect } from 'react';

import core from 'core';

import { CROP_TYPE_VALUE, PRESET_DIMENSIONS, PRESET_OPTIONS_VALUE } from '../constants';
import { CropDimensionType, CropTypeOption, PresetType } from '../types';

interface UseCropPresetHandlersProps {
  preset: PresetType;
  cropType: CropTypeOption;
  cropDimension: CropDimensionType;
  setCropDimension: (dimension: CropDimensionType) => void;
}

export const useCropPresetHandlers = (props: UseCropPresetHandlersProps) => {
  const { preset, cropType, cropDimension, setCropDimension } = props;

  const resetValues = { top: 0, left: 0, bottom: 0, right: 0 };

  const createCropDimension = useCallback(
    (dimensions: { width: number; height: number }): CropDimensionType => {
      const { width, height } = dimensions;

      if (cropType === CROP_TYPE_VALUE.CROP_MARGIN) {
        const cropAnnotation = core.getSelectedAnnotations()[0];
        const pageNumber = cropAnnotation.PageNumber;
        const pageInfo = core.docViewer.getDocument().getPageInfo(pageNumber);

        return {
          ...resetValues,
          right: pageInfo.width - width,
          bottom: pageInfo.height - height,
        };
      }

      return {
        ...resetValues,
        width,
        height,
      };
    },
    [cropType]
  );

  useEffect(() => {
    const presetDimension = PRESET_DIMENSIONS[preset as keyof typeof PRESET_DIMENSIONS];

    if (preset === PRESET_OPTIONS_VALUE.CUSTOM || !presetDimension) {
      setCropDimension(cropDimension);
      return;
    }

    const newCropDimension = createCropDimension(presetDimension);
    setCropDimension(newCropDimension);
  }, [preset, setCropDimension, createCropDimension]);
};
