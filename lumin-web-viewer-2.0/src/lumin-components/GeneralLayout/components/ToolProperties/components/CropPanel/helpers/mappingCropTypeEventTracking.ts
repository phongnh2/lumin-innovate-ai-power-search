import { CROP_TYPE_VALUE } from '../constants';
import { CropTypeOption } from '../types';

export const mappingCropTypeEventTracking = ({ cropType }: { cropType: CropTypeOption }) => {
  switch (cropType) {
    case CROP_TYPE_VALUE.CROP_MARGIN:
      return 'margins';
    case CROP_TYPE_VALUE.CROP_PAGE_BOX:
    default:
      return 'page box';
  }
};
