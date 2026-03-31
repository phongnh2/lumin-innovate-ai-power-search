import core from 'core';

const isMeasurementTool = (toolMode?: Core.Tools.Tool) =>
  toolMode instanceof Core.Tools.DistanceMeasurementCreateTool ||
  toolMode instanceof Core.Tools.ArcMeasurementCreateTool ||
  toolMode instanceof Core.Tools.PerimeterMeasurementCreateTool;

export const getMeasureTools = () => {
  const toolModeMap = core.getToolModeMap();
  return Object.values(toolModeMap).filter(isMeasurementTool);
};
