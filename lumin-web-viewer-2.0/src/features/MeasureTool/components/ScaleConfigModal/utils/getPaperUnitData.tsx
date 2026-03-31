import { PaperUnitMapping } from 'features/MeasureTool/constants';

import { filterFractional } from './filterFractional';

export const getPaperUnitData = (isFractional: boolean) => {
  if (isFractional) {
    return Object.values(PaperUnitMapping).filter(filterFractional);
  }
  return Object.values(PaperUnitMapping);
};
