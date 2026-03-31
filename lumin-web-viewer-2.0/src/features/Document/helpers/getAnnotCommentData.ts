import core from 'core';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

type AnnotationCommentParams = {
  annotation: Core.Annotations.Annotation;
  annotationAction: string;
};

type AnnotationCommentData = {
  content: string;
  commentInteractionEvent: string;
  commentAuthor: string | null;
};

export default ({ annotation, annotationAction }: AnnotationCommentParams): AnnotationCommentData => {
  const annotManager = core.getAnnotationManager();
  const annotationContent = annotation.getContents();
  // Comment author is the one whose comment is replied or deleted
  let commentAuthor = null;
  let commentInteractionEvent = UserEventConstants.Events.DocumentEvents.DOCUMENT_COMMENTED;
  // Check if comment includes any mention
  if (annotationAction === ANNOTATION_ACTION.DELETE) {
    commentInteractionEvent = UserEventConstants.Events.DocumentEvents.COMMENT_DELETED;
    commentAuthor = annotation.Author;
  } else if (annotation.isReply()) {
    commentAuthor = annotManager.getAnnotationById(annotation.InReplyTo).Author; // This is the email of replied author
    commentInteractionEvent = UserEventConstants.Events.DocumentEvents.COMMENT_REPLIED;
  }
  return {
    content: annotationContent,
    commentInteractionEvent,
    commentAuthor,
  };
};
