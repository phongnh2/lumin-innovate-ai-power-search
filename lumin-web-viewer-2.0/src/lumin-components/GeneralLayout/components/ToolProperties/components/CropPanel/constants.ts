export const CROP_TYPE_VALUE = {
  CROP_PAGE_BOX: 'CROP_PAGE_BOX',
  CROP_MARGIN: 'CROP_MARGIN',
} as const;

export const CROP_TYPE_OPTIONS = [
  {
    label: 'viewer.cropPanel.cropType.cropPageBox',
    value: CROP_TYPE_VALUE.CROP_PAGE_BOX,
  },
  {
    label: 'viewer.cropPanel.cropType.cropMargin',
    value: CROP_TYPE_VALUE.CROP_MARGIN,
  },
];

export const PRESET_OPTIONS_VALUE = {
  CUSTOM: 'CUSTOM',
  LETTER: 'LETTER',
  HALF_LETTER: 'HALF_LETTER',
  LEGAL: 'LEGAL',
  A5: 'A5',
  A4: 'A4',
} as const;

export const PRESET_OPTIONS = [
  {
    label: 'common.custom',
    value: PRESET_OPTIONS_VALUE.CUSTOM,
  },
  {
    label: 'Letter',
    value: PRESET_OPTIONS_VALUE.LETTER,
  },
  {
    label: 'Half letter',
    value: PRESET_OPTIONS_VALUE.HALF_LETTER,
  },
  {
    label: 'Legal',
    value: PRESET_OPTIONS_VALUE.LEGAL,
  },
  {
    label: 'A5',
    value: PRESET_OPTIONS_VALUE.A5,
  },
  {
    label: 'A4',
    value: PRESET_OPTIONS_VALUE.A4,
  },
];

export const UNITS_VALUE = {
  CM: 'cm',
  MM: 'mm',
  INCH: 'in',
  PIXEL: 'px',
} as const;

export const UNITS_OPTIONS = [
  {
    label: 'Inches (in)',
    value: UNITS_VALUE.INCH,
  },
  {
    label: 'Centimeters (cm)',
    value: UNITS_VALUE.CM,
  },
  {
    label: 'Millimeters (mm)',
    value: UNITS_VALUE.MM,
  },
  {
    label: 'Pixel (px)',
    value: UNITS_VALUE.PIXEL,
  },
];

export const PRESET_DIMENSIONS = {
  [PRESET_OPTIONS_VALUE.LETTER]: { width: 612, height: 792 },
  [PRESET_OPTIONS_VALUE.HALF_LETTER]: { width: 306, height: 396 },
  [PRESET_OPTIONS_VALUE.LEGAL]: { width: 612, height: 1008 },
  [PRESET_OPTIONS_VALUE.A5]: { width: 420, height: 595 },
  [PRESET_OPTIONS_VALUE.A4]: { width: 595, height: 842 },
} as const;
