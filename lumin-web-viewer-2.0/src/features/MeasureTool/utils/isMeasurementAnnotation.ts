import { ToolName } from 'core/type';

import { TOOLS_NAME } from 'constants/toolsName';

export const MEASURE_TOOLS = [
  TOOLS_NAME.ARC_MEASUREMENT,
  TOOLS_NAME.AREA_MEASUREMENT,
  TOOLS_NAME.RECTANGULAR_AREA_MEASUREMENT,
  TOOLS_NAME.DISTANCE_MEASUREMENT,
  TOOLS_NAME.ELLIPSE_MEASUREMENT,
  TOOLS_NAME.PERIMETER_MEASUREMENT,
];

export const isMeasurementAnnotation = (annotation?: Core.Annotations.Annotation) => annotation && annotation?.Measure;

export const isMeasurementCalibration = (annotation?: Core.Annotations.Annotation) =>
  annotation.ToolName === TOOLS_NAME.CALIBRATION_MEASUREMENT;

export const isMeasurementExcludedCalibration = (annotation?: Core.Annotations.Annotation) =>
  isMeasurementAnnotation(annotation) && !isMeasurementCalibration(annotation);

export const isSelectedToolMeasure = (activeToolName: ToolName) =>
  MEASURE_TOOLS.includes(activeToolName as typeof MEASURE_TOOLS[number]);

export const hasFillProperty = (activeToolName: ToolName) =>{
  const toolHasFillProperties = [
    TOOLS_NAME.AREA_MEASUREMENT,
    TOOLS_NAME.RECTANGULAR_AREA_MEASUREMENT,
    TOOLS_NAME.ELLIPSE_MEASUREMENT,
  ];
  return toolHasFillProperties.includes(activeToolName as typeof toolHasFillProperties[number]);
};
