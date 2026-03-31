import { DataElements } from './dataElement';
import { TOOLS_NAME } from './toolsName';

export const numericCodeOfTools: Record<number, string> = {
  65: 'a',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  75: 'k',
  76: 'l',
  78: 'n',
  79: 'o',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
};

export const hotkeyToolMap: Record<string, { toolElement: string; subToolElement?: string; subTool?: string }> = {
  a: {
    toolElement: DataElements.SHAPE_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.ARROW_TOOL_BUTTON,
    subTool: TOOLS_NAME.ARROW,
  },
  e: { toolElement: DataElements.ERASER_TOOL_BUTTON, subTool: TOOLS_NAME.ERASER },
  f: { toolElement: DataElements.FREE_HAND_TOOL_GROUP_BUTTON, subTool: TOOLS_NAME.FREEHAND },
  g: {
    toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
    subTool: TOOLS_NAME.SQUIGGLY,
  },
  h: {
    toolElement: DataElements.HIGHLIGHT_TOOL_BUTTON,
    subToolElement: DataElements.HIGHLIGHT_TOOL_BUTTON,
    subTool: TOOLS_NAME.HIGHLIGHT,
  },
  i: { toolElement: DataElements.STAMP_TOOL_BUTTON },
  k: {
    toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.STRIKEOUT_TOOL_BUTTON,
    subTool: TOOLS_NAME.STRIKEOUT,
  },
  l: {
    toolElement: DataElements.SHAPE_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.LINE_TOOL_BUTTON,
    subTool: TOOLS_NAME.LINE,
  },
  n: { toolElement: DataElements.STICKY_TOOL_BUTTON, subTool: TOOLS_NAME.STICKY },
  o: {
    toolElement: DataElements.SHAPE_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.ELLIPSE_TOOL_BUTTON,
    subTool: TOOLS_NAME.ELLIPSE,
  },
  r: {
    toolElement: DataElements.SHAPE_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.RECTANGLE_TOOL_BUTTON,
    subTool: TOOLS_NAME.RECTANGLE,
  },
  s: { toolElement: DataElements.SIGNATURE_TOOL_BUTTON, subTool: TOOLS_NAME.SIGNATURE },
  t: { toolElement: DataElements.FREETEXT_TOOL_BUTTON, subTool: TOOLS_NAME.FREETEXT },
  u: {
    toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
    subToolElement: DataElements.UNDERLINE_TOOL_BUTTON,
    subTool: TOOLS_NAME.UNDERLINE,
  },
};
