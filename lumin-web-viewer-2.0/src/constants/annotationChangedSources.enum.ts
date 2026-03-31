/**
 * @docs: https://docs.apryse.com/api/web/Core.AnnotationManager.html#.AnnotationChangedInfoObject:~:text=Core.AnnotationManager.AnnotationChangedSources-,AnnotationChangedSources,-Sources%20for%20what
 */
export const AnnotationChangedSources = {
  MOVE: 'move',
  RESIZE: 'resize',
  ROTATE: 'rotate',
  TEXT_CHANGED: 'textChanged',
  NOTE_CHANGED: 'noteChanged',
  DRAGGING_ACROSS_PAGES: 'draggingAcrossPages',
};

export type AnnotationChangedSourcesType = typeof AnnotationChangedSources[keyof typeof AnnotationChangedSources];
