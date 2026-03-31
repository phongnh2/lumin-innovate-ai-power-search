import core from 'core';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';

export const isStickyAnnotation = ({ annotation }: { annotation: Core.Annotations.Annotation }) =>
  annotation instanceof window.Core.Annotations.StickyAnnotation;

export const isHighlightComment = ({ annotation }: { annotation: Core.Annotations.Annotation }) =>
  annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key) ===
  CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.truthyValue;

export const isComment = ({ annotation }: { annotation: Core.Annotations.Annotation }) =>
  isStickyAnnotation({ annotation }) || isHighlightComment({ annotation });

export const getHighlightCommentStickyId = ({ annotation }: { annotation: Core.Annotations.Annotation }) => annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key);

export const isResolvedHighlightComment = ({ annotation }: { annotation: Core.Annotations.Annotation }) => {
  if (!isHighlightComment({ annotation })) {
    return false;
  }

  const commentAnnotId = annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key);
  if (!commentAnnotId) {
    return false;
  }

  const annotManager = core.getAnnotationManager();
  const commentAnnotation = annotManager.getAnnotationById(commentAnnotId) as Core.Annotations.StickyAnnotation;
  if (!commentAnnotation) {
    return false;
  }

  return commentAnnotation.getState() === CommentState.Resolved.state;
};

export const isResolvedComment = ({ annotation }: { annotation: Core.Annotations.Annotation }) => {
  if (!isStickyAnnotation({ annotation })) {
    return false;
  }

  return (annotation as Core.Annotations.StickyAnnotation).getState() === CommentState.Resolved.state;
};
