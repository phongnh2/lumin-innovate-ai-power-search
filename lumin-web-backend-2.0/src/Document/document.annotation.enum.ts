export enum DocumentAnnotationTypeEnum {
  FREE_HAND = 'Free hand',
  FREE_TEXT = 'Free text',
  SIGNATURE = 'Signature',
  COMMENT = 'Comment',
  REMOVAL = 'Removal',
  INDEX = 'Index',
  HIGHLIGHT = 'Highlight',
  STICKY_NOTE = 'Sticky Note',
  ARROW = 'Arrow',
  CALLOUT = 'Callout',
  CARET = 'Caret',
  POLYGON_CLOUD = 'Cloud',
  CUSTOM = 'Custom',
  ELLIPSE = 'Ellipse',
  ERASER = 'Eraser',
  FILEATTACHMENT = 'File attachment',
  FREEHAND_HIGHLIGHT = 'Free Hand Highlight',
  LINE = 'Line',
  POLYGON = 'Polygon',
  POLYLINE = 'Polyline',
  RECTANGLE = 'Rectangle',
  REDACT = 'Redact',
  SQUIGGLY = 'Squiggly',
  STAMP = 'Stamp',
  STRIKEOUT = 'Strikeout',
  UNDERLINE = 'Underline',
  RUBBER_STAMP = 'Rubber Stamp',
  STAR = 'Star',
  TICK = 'Tick',
  CROSS = 'Cross',
  NO_NAME = 'Annotation',
  WIDGET = 'Widget',
  LINK = 'Link',
  DRAFT = 'Draft',
  DOT_STAMP = 'Dot Stamp',
  TICK_STAMP = 'Tick Stamp',
  CROSS_STAMP = 'Cross Stamp',
}

export enum DocumentAnnotationSubTypeEnum {
  HIGHLIGHT_COMMENT = 'Highlight Comment',
}
export enum AnnotationAction {
  ADD = 'add',
  MODIFY = 'modify',
  DELETE = 'delete',
}
export enum XfdfPageString {
  BOOKMARK = '"page":',
  HYPERLINK = 'Page='
}
export enum ReorderType {
  FRONT = 'front',
  BACK = 'back'
}

export enum FormFieldTypeEnum {
  TX = 'Tx',
  CH = 'Ch',
  BTN = 'Btn',
  SIG = 'Sig',
}
