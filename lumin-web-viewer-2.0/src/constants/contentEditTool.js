import { CUSTOM_FONTS_V2 } from '@new-ui/general-components/TextStylePalette/constants';

export const NEW_UI_CONTENT_EDIT_FONTS = [{ value: 'Font', name: '--', class: '' }, ...CUSTOM_FONTS_V2].map(
  (font) => ({
    value: font.value,
    label: font.label, // NOTE: New UI component use label
    style: {
      fontFamily: font.value,
    },
  })
);

export const MIN_FONT_SIZE = 5;
export const MAX_FONT_SIZE = 45;
export const DEBOUNCE_TIME = 700;
export const regexInputNumber = /^\d+$/;
export const regexInputFont = /\s+/g;
export const FONT_PLACEHOLDER = 'Font';
export const DEFAULT_FONT_SIZE_VALUE = 12;

export const CONTENT_EDIT_COLOR_BASE = [
  'rgba(255, 255, 255, 1)',
  'rgba(224, 243, 248, 1)',
  'rgba(254, 224, 144, 1)',
  'rgba(90, 180, 172, 1)',
  'rgba(69, 117, 180, 1)',
  'rgba(215, 48, 39, 1)',
  'rgba(0, 0, 0, 1)',
];
