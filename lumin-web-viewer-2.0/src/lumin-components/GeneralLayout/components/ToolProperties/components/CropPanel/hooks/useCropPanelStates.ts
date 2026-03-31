import { useState, useCallback, useEffect } from 'react';

import { PAGE_RANGE_OPTIONS } from '@new-ui/components/PageRangeSelection/constants';

import { initialContextValue } from '../CropPanelContext';
import { CropDimensionType } from '../types';
import { truncateDimensions } from '../utils/truncateDimensions';

export const useCropPanelStates = () => {
  const [unit, setUnit] = useState(initialContextValue.unit);
  const [preset, setPreset] = useState(initialContextValue.preset);
  const [cropType, setCropType] = useState(initialContextValue.cropType);
  const [cropMode, setCropMode] = useState(initialContextValue.cropMode);
  const [cropDimension, setCropDimension] = useState(initialContextValue.cropDimension);
  const [pageRangeValue, setPageRangeValue] = useState(initialContextValue.pageRangeValue);
  const [pageRangeError, setPageRangeError] = useState(initialContextValue.pageRangeError);
  const [isPageRangeValid, setIsPageRangeValid] = useState(false);

  useEffect(() => {
    if (cropMode === PAGE_RANGE_OPTIONS.ALL_PAGES || cropMode === PAGE_RANGE_OPTIONS.CURRENT_PAGE) {
      setIsPageRangeValid(true);
    } else if (cropMode === PAGE_RANGE_OPTIONS.SPECIFIC_PAGES) {
      setIsPageRangeValid(Boolean(pageRangeValue?.trim()));
    }
  }, [cropMode, pageRangeValue]);

  const handleSetCropDimension = useCallback((dimensions: CropDimensionType) => {
    setCropDimension(truncateDimensions(dimensions));
  }, []);

  const handlePageRangeValueChange = useCallback(
    (value: string, isValid: boolean) => {
      setPageRangeValue(value);
      setIsPageRangeValid(isValid);
      if (pageRangeError) {
        setPageRangeError('');
      }
    },
    [pageRangeError]
  );

  const handlePageRangeBlur = useCallback((value: string, isValid: boolean, errorMessage: string) => {
    setPageRangeValue(value);
    setIsPageRangeValid(isValid);
    setPageRangeError(errorMessage);
  }, []);

  return {
    contextValue: {
      unit,
      preset,
      cropType,
      cropMode,
      pageRangeValue,
      pageRangeError,
      isPageRangeValid,
      cropDimension,
      setUnit,
      setPreset,
      setCropType,
      setCropMode,
      setPageRangeValue: handlePageRangeValueChange,
      setPageRangeError,
      onPageRangeBlur: handlePageRangeBlur,
      setCropDimension: handleSetCropDimension,
    },
  };
};
