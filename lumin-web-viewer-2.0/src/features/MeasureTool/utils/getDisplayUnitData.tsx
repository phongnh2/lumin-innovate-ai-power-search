import { DisplayUnitMapping } from 'features/MeasureTool/constants';

import { filterFractional } from '../components/ScaleConfigModal/utils/filterFractional';

export const getDisplayUnitData = (isFractional: boolean) => {
  if (isFractional) {
    return Object.values(DisplayUnitMapping).filter(filterFractional);
  }
  return Object.values(DisplayUnitMapping);
};
