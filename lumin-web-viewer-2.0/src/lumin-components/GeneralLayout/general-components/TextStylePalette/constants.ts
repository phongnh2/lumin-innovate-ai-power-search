export const CUSTOM_FONTS_V2 = [
  { value: 'Arimo', label: 'Arimo' },
  { value: 'EBGaramond', label: 'EB Garamond' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'NotoSans', label: 'Noto Sans' },
  { value: 'NotoSansKR', label: 'Noto Sans Korean' },
  { value: 'NotoSansJP', label: 'Noto Sans Japanese' },
  { value: 'NotoSansSC', label: 'Noto Sans Simplified Chinese' },
  { value: 'NotoSansTC', label: 'Noto Sans Traditional Chinese' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'OpenSans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Spectral', label: 'Spectral' },
  { value: 'SourceSerif', label: 'Source Serif 4' },
  { value: 'SourceSans', label: 'Source Sans 3' },
  { value: 'Vollkorn', label: 'Vollkorn' },
];

export enum RICH_STYLE_TYPES {
  FONT_WEIGHT = 'fontWeight',
  FONT_STYLE = 'fontStyle',
  TEXT_DECORATION = 'textDecoration',
}

export enum RICH_STYLE_KEYS {
  FONT_WEIGHT = 'font-weight',
  FONT_STYLE = 'font-style',
  TEXT_DECORATION = 'text-decoration',
}

export enum RICH_STYLE_VALUES {
  NONE = 'none',
  BOLD = 'bold',
  WORD = 'word',
  NORMAL = 'normal',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  LINE_THROUGH = 'line-through',
}

export const FONT_WEIGHTS = {
  BOLD: RICH_STYLE_VALUES.BOLD,
  NORMAL: RICH_STYLE_VALUES.NORMAL,
} as const;

export const FONT_STYLES = {
  NORMAL: RICH_STYLE_VALUES.NORMAL,
  ITALIC: RICH_STYLE_VALUES.ITALIC,
} as const;

export const TEXT_DECORATIONS = {
  NONE: RICH_STYLE_VALUES.NONE,
  WORD: RICH_STYLE_VALUES.WORD,
  LINE_THROUGH: RICH_STYLE_VALUES.LINE_THROUGH,
} as const;

export const TEXT_DECORATORS = [
  {
    title: 'option.richText.bold',
    icon: 'md_bold',
    actionKey: RICH_STYLE_VALUES.BOLD,
    styleKey: RICH_STYLE_KEYS.FONT_WEIGHT,
  },
  {
    title: 'option.richText.italic',
    icon: 'md_italic',
    actionKey: RICH_STYLE_VALUES.ITALIC,
    styleKey: RICH_STYLE_KEYS.FONT_STYLE,
  },
  {
    title: 'option.richText.underline',
    icon: 'md_underline',
    actionKey: RICH_STYLE_VALUES.WORD,
    styleKey: RICH_STYLE_KEYS.TEXT_DECORATION,
  },
  {
    title: 'option.richText.strikeout',
    icon: 'md_strike_though',
    actionKey: RICH_STYLE_VALUES.LINE_THROUGH,
    styleKey: RICH_STYLE_KEYS.TEXT_DECORATION,
  },
];
