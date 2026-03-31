import { FONT_STYLES, FONT_WEIGHTS, RICH_STYLE_KEYS, TEXT_DECORATIONS } from './constants';

export type FontWeightsTypes = typeof FONT_WEIGHTS[keyof typeof FONT_WEIGHTS];
export type FontStylesTypes = typeof FONT_STYLES[keyof typeof FONT_STYLES];
export type TextDecorationsTypes = typeof TEXT_DECORATIONS[keyof typeof TEXT_DECORATIONS];

export type RichStyleTypes = {
  [RICH_STYLE_KEYS.FONT_WEIGHT]: FontWeightsTypes;
  [RICH_STYLE_KEYS.FONT_STYLE]: FontStylesTypes;
  [RICH_STYLE_KEYS.TEXT_DECORATION]: TextDecorationsTypes;
};

export type RichFontStylesMap = {
  [RICH_STYLE_KEYS.FONT_WEIGHT]: FontWeightsTypes;
  [RICH_STYLE_KEYS.FONT_STYLE]: FontStylesTypes;
};
