export type ShortcutsObject = {
  rotate: string;
  zoomOut: string;
  zoomIn: string;
  fitHeight: string;
  undo: string;
  redo: string;
  focusMode: string;
  escape: string;
  pan: string;
  arrowToolButton: string;
  callout: string;
  eraser: string;
  freeHand: string;
  stamp: string;
  lineToolButton: string;
  sticky: string;
  ellipseToolButton: string;
  rectangleToolButton: string;
  rubberStamp: string;
  freeText: string;
  overlay: string;
  squigglyToolButton: string;
  highlight: string;
  strikeoutToolButton: string;
  underlineToolButton: string;
  fullScreen: string;
  chatbot: string;
};

export type StaticShortcutType = {
  Sticky: string;
  Eraser: string;
  FreeHand: string;
  FreeText: string;
  HighLight: string;
  Default: string;
};

declare const StaticShortcutID: StaticShortcutType;

declare const shortcutsObject: ShortcutsObject;

export function getShortcut(target: keyof typeof shortcutsObject | string): string;

export const PaletteColorType: { Stroke: string; Fill: string; Text: string };

export function switchTool({
  toolName,
  toolGroup,
  isActive,
  eventElementName,
}: {
  toolName?: string;
  toolGroup?: string;
  isActive?: boolean;
  eventElementName?: string;
} & ({ toolName: string } | { toolGroup: string })): {
  next: boolean;
};
