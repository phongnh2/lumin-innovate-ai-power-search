import { useMarginDimensions } from './useMarginDimensions';
import { usePageBoxDimensions } from './usePageBoxDimensions';
import { CROP_TYPE_VALUE } from '../constants';
import { CropTypeOption } from '../types';

interface UseCropDimensionHandlersProps {
  cropType: CropTypeOption;
}

export const useCropDimensionHandlers = ({ cropType }: UseCropDimensionHandlersProps) => {
  const { validateMarginDimensions, getRectByMarginDimensions } = useMarginDimensions();
  const { validatePageBoxDimensions, getRectByPageBoxDimensions } = usePageBoxDimensions();

  if (cropType === CROP_TYPE_VALUE.CROP_MARGIN) {
    return { validateDimensions: validateMarginDimensions, getRectByDimensions: getRectByMarginDimensions };
  }

  return { validateDimensions: validatePageBoxDimensions, getRectByDimensions: getRectByPageBoxDimensions };
};
