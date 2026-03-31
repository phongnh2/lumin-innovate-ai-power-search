import { ScaleInfo } from '../interfaces';

export const getScalesInfo = (scales: Core.Scale[]): ScaleInfo[] => {
  const scalesInfo: ScaleInfo[] = [];
  scales.forEach((scale) => {
    scalesInfo.push({
      scale,
      title: scale.toString(),
      precision: scale.precision,
    });
  });

  return scalesInfo;
};
