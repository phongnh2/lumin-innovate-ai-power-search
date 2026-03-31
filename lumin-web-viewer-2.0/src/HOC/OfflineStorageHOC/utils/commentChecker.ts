import { AnnotationSubjectMapping } from 'constants/documentConstants';

type TAnnotationCommand = {
  annotationId: string;
  annotationType: string;
  stickyLinkId?: string;
};

const isComment = ({ annotationType }: TAnnotationCommand): boolean =>
  annotationType === AnnotationSubjectMapping.stickyNote;

const isHighlightCommentWithComment = ({
  annotation,
  nextAnnotation = {} as TAnnotationCommand,
}: {
  annotation: TAnnotationCommand;
  nextAnnotation?: TAnnotationCommand;
}): boolean => {
  const { annotationType, stickyLinkId } = annotation;
  const { annotationId: nextAnnotationId } = nextAnnotation;
  return annotationType === AnnotationSubjectMapping.highlight && stickyLinkId && stickyLinkId === nextAnnotationId;
};

const isCommentOrHighlightComment = (
  annotation: TAnnotationCommand,
  index: number,
  annotations: TAnnotationCommand[]
) => isComment(annotation) || isHighlightCommentWithComment({ annotation, nextAnnotation: annotations[index + 1] });

export const isCommentOnlyInHandler = (annotations: TAnnotationCommand[]): boolean =>
  annotations.every(isCommentOrHighlightComment);

export const getCommentOnlyInHandler = (annotations: TAnnotationCommand[]): TAnnotationCommand[] =>
  annotations.filter(isCommentOrHighlightComment);
