import { TOOLS_NAME } from 'constants/toolsName';

export const MeasureTools = [
  {
    icon: 'ph-arrows-horizontal',
    label: 'distance',
    toolName: TOOLS_NAME.DISTANCE_MEASUREMENT,
  },
  {
    icon: 'ph-angle',
    label: 'arc',
    toolName: TOOLS_NAME.ARC_MEASUREMENT,
  },
  {
    icon: 'lm-perimeter',
    label: 'perimeter',
    toolName: TOOLS_NAME.PERIMETER_MEASUREMENT,
  },
  {
    icon: 'lm-polygon-area',
    label: 'area',
    toolName: TOOLS_NAME.AREA_MEASUREMENT,
  },
  {
    icon: 'lm-rectangle-area',
    label: 'rectangular',
    toolName: TOOLS_NAME.RECTANGULAR_AREA_MEASUREMENT,
  },
  {
    icon: 'lm-circle-area',
    label: 'ellipse',
    toolName: TOOLS_NAME.ELLIPSE_MEASUREMENT,
  },
];
export * from './precision';
export * from './measure-unit';
