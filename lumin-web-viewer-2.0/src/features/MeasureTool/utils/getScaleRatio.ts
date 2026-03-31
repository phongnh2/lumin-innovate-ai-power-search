import { ScaleInfo } from '../interfaces';

export const getScaleRatio = (scaleInfo: ScaleInfo) => {
  const { scale, precision } = scaleInfo;
  const pageScaleStr = Core.Scale.getFormattedValue(
    Number(scale.pageScale.value),
    scale.pageScale.unit,
    precision,
    false
  );
  const worldScaleStr = Core.Scale.getFormattedValue(
    Number(scale.worldScale.value),
    scale.worldScale.unit,
    precision,
    false
  );
  return `${pageScaleStr} = ${worldScaleStr}`;
};
