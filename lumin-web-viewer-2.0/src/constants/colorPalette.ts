import { TOOLS_NAME, IToolName } from './toolsName';

export const PaletteType = {
  FILL_OR_STROKE: 'fillOrStroke',
  TEXT_STAMP: 'textStamp',
  HIGHLIGHT: 'highlight',
  COMMENT: 'comment',
  STAMP_BACKGROUND: 'stampBg',
  TYPE: 'type',
} as const;

export type TPaletteType = typeof PaletteType[keyof typeof PaletteType];

const WHITE_COLOR = 'rgba(255, 255, 255, 1)';

const TYPE_PALETTE = [
  'rgba(0, 0, 0, 1)', // #000000
  'rgba(215, 48, 39, 1)', // #D73027
  'rgba(69, 117, 180, 1)', // #4575B4
  'rgba(90, 180, 172, 1)', // #5AB4AC
  'rgba(254, 224, 144, 1)', // #FEE090
  'rgba(224, 243, 248, 1)', // #E0F3F8
  WHITE_COLOR, // #FFFFFF
];

const HIGHLIGHT_PALETTE = [
  'rgba(254, 224, 139, 1)', // #FEE08B
  'rgba(252, 141, 89, 1)', // #FC8D59
  'rgba(255, 255, 191, 1)', // #FFFFBF
  'rgba(230, 245, 152, 1)', // #E6F598
  'rgba(153, 213, 148, 1)', // #99D594
  'rgba(50, 136, 189, 1)', // #3288BD
  'rgba(213, 62, 79, 1)', // #D53E4F
];

const COMMENT_PALETTE = [
  'rgba(3, 89, 112, 1)', // #035970
  'rgba(69, 117, 180, 1)', // #4575B4
  'rgba(90, 180, 172, 1)', // #5AB4AC
  'rgba(127, 191, 123, 1)', // #7FBF7B
  'rgba(215, 48, 39, 1)', // #D73027
  'rgba(253, 174, 107, 1)', // #FDAE6B
  'rgba(175, 141, 195, 1)', // #AF8DC3
];

const TEXT_STAMP_PALETTE = [
  WHITE_COLOR, // #FFFFFF
  'rgba(0, 0, 0, 1)', // #000000
  'rgba(161, 34, 20, 1)', // #A12214
  'rgba(218, 141, 25, 1)', // #DA8D19
  'rgba(71, 119, 27, 1)', // #47771B
  'rgba(37, 80, 163, 1)', // #2550A3
  'rgba(30, 40, 123, 1)', // #1E287B
];

const STAMP_BACKGROUND_PALETTE = [
  'rgba(98, 151, 105, 1)', // #629769
  'rgba(195, 63, 63, 1)', // #C33F3F
  'rgba(35, 52, 138, 1)', // #23348A
  'rgba(213, 147, 48, 1)', // #D59330
  'rgba(226, 237, 250, 1)', // #E2EDFA
  'rgba(229, 245, 222, 1)', // #E5F5DE
  WHITE_COLOR, // #FFFFFF
];

export const DEFAULT_PALETTE = [
  'rgba(98, 151, 105, 1)',
  'rgba(195, 63, 63, 1)',
  'rgba(35, 52, 138, 1)',
  'rgba(213, 147, 48, 1)',
  'rgba(226, 237, 250, 1)',
  'rgba(229, 245, 222, 1)',
  'rgba(225, 225, 225, 1)',
];

export const PALETTE_MAPPER: Record<TPaletteType, string[]> = {
  [PaletteType.FILL_OR_STROKE]: TYPE_PALETTE,
  [PaletteType.TEXT_STAMP]: TEXT_STAMP_PALETTE,
  [PaletteType.HIGHLIGHT]: HIGHLIGHT_PALETTE,
  [PaletteType.COMMENT]: COMMENT_PALETTE,
  [PaletteType.STAMP_BACKGROUND]: STAMP_BACKGROUND_PALETTE,
  [PaletteType.TYPE]: TYPE_PALETTE,
};

export const PALETTE_TYPE_MAPPER: Partial<Record<IToolName, TPaletteType>> = {
  // Shape tools group
  [TOOLS_NAME.ELLIPSE]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.ARROW]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.POLYLINE]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.RECTANGLE]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.LINE]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.POLYGON]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.POLYGON_CLOUD]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.STAR]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.CROSS]: PaletteType.FILL_OR_STROKE,
  [TOOLS_NAME.TICK]: PaletteType.FILL_OR_STROKE,

  [TOOLS_NAME.FREEHAND]: PaletteType.FILL_OR_STROKE,

  // Highlight tools group
  [TOOLS_NAME.HIGHLIGHT]: PaletteType.HIGHLIGHT,
  [TOOLS_NAME.FREEHAND_HIGHLIGHT]: PaletteType.HIGHLIGHT,

  // Text tools group
  [TOOLS_NAME.STRIKEOUT]: PaletteType.TYPE,
  [TOOLS_NAME.SQUIGGLY]: PaletteType.TYPE,
  [TOOLS_NAME.UNDERLINE]: PaletteType.TYPE,

  [TOOLS_NAME.TEXT_FIELD]: PaletteType.TYPE,
  [TOOLS_NAME.FREETEXT]: PaletteType.TYPE,
  [TOOLS_NAME.SIGNATURE]: PaletteType.TYPE,
  [TOOLS_NAME.DATE_FREE_TEXT]: PaletteType.TYPE,
};
