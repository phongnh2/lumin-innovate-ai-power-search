import { useState } from 'react';

import { DisplayUnitMapping, PaperUnitMapping } from '../../../constants';
import { ScaleUnits, ScaleDistances } from '../../../interfaces';
import { getCommonScaleFactors, getPrecisionData } from '../constants';

export const useScaleState = () => {
  const initialIsFractional = false;
  const initialPrecisionData = getPrecisionData(initialIsFractional);
  const initialScaleFactor = getCommonScaleFactors(initialIsFractional);

  const [units, setUnits] = useState<ScaleUnits>({
    displayUnit: DisplayUnitMapping.in.value,
    paperUnit: PaperUnitMapping.in.value,
  });

  const [isFractional, setIsFractional] = useState<boolean>(initialIsFractional);

  const [precision, setPrecision] = useState<number>(initialPrecisionData[0].value);

  const [presetScale, setPresetScale] = useState<string>(initialScaleFactor[0].value.toString());

  const [distances, setDistances] = useState<ScaleDistances>({
    paperDistance: '1',
    displayDistance: '1',
  });

  return {
    units,
    setUnits,
    isFractional,
    setIsFractional,
    precision,
    setPrecision,
    presetScale,
    setPresetScale,
    distances,
    setDistances,
  };
};
