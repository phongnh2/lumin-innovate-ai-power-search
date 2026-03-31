import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

const hasCustomDataComment = (annotation) =>
  Boolean(annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key));

const isComment = (annotation) => Boolean(annotation && annotation instanceof window.Core.Annotations.StickyAnnotation);

const isCommentByHighLight = (annotation) => isComment(annotation) && hasCustomDataComment(annotation);

const isHighlightComment = (annotation) =>
  Boolean(annotation && annotation.Subject === AnnotationSubjectMapping.highlight && hasCustomDataComment(annotation));

const isNotReplyComment = (annotation) => isComment(annotation) && !annotation.isReply();

const isOpenComment = (annotation) =>
  isNotReplyComment(annotation) && annotation.getState() !== CommentState.Resolved.state;

export { isComment, isCommentByHighLight, isHighlightComment, isNotReplyComment, isOpenComment };
