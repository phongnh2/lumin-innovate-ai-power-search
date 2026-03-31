import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';

export default () => (annotation) => {
  const isHighlightComment =
    annotation.annotation instanceof window.Core.Annotations.TextHighlightAnnotation &&
    annotation.annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key);
  if (annotation.annotation instanceof window.Core.Annotations.StickyAnnotation || isHighlightComment) {
    annotation.skipAnnotation();
  }
};
