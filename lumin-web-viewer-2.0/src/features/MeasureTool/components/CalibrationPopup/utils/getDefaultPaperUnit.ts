import { MetricUnit, PaperUnit, DisplayUnit } from 'features/MeasureTool/constants';

export const getDefaultPaperUnit = (displayUnit: DisplayUnit) => {
  if (displayUnit === DisplayUnit.pt) {
    return PaperUnit.pt;
  }

  if (MetricUnit.includes(displayUnit)) {
    return PaperUnit.mm;
  }

  return PaperUnit.in;
};
