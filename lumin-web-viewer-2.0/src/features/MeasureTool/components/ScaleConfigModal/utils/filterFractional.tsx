import { PaperUnit, DisplayUnit, FractionalUnitSupport } from 'features/MeasureTool/constants';

export const filterFractional = (unit: { value: PaperUnit | DisplayUnit }) =>
  FractionalUnitSupport.includes(unit.value);
