import core from 'core';

interface GetCroppedAnnotationsParams {
  pageNumbers: number[];
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const getCroppedAnnotations = (props: GetCroppedAnnotationsParams): Core.Annotations.Annotation[] => {
  const { pageNumbers, top, bottom, left, right } = props;

  const annotations = core
    .getAnnotationsList()
    .filter((annot) => annot.PageNumber === pageNumbers[0] && !annot.isReply() && annot.Subject !== 'LUnique');

  let annotInCroppedArea: Core.Annotations.Annotation[] = [];
  const pageRotate = core.getDocument().getPageRotation(pageNumbers[0]);
  const { height: pageHeight, width: pageWidth } = core.getPageInfo(parseInt(pageNumbers[0].toString()));

  switch (pageRotate) {
    case 0:
      annotInCroppedArea = annotations.filter(
        (annot) =>
          top > annot.Y + annot.Height ||
          left > annot.X + annot.Width ||
          right > pageWidth - annot.X ||
          bottom > pageHeight - annot.Y
      );
      break;
    case 90:
      annotInCroppedArea = annotations.filter(
        (annot) =>
          top > annot.X + annot.Width ||
          left > pageHeight - annot.Y ||
          right > annot.Y + annot.Height ||
          bottom > pageWidth - annot.X
      );
      break;
    case 180:
      annotInCroppedArea = annotations.filter(
        (annot) =>
          top > pageHeight - annot.Y ||
          left > pageWidth - annot.X ||
          right > annot.X + annot.Width ||
          bottom > annot.Y + annot.Height
      );
      break;
    case 270:
      annotInCroppedArea = annotations.filter(
        (annot) =>
          top > pageWidth - annot.X ||
          left > annot.Y + annot.Height ||
          right > pageHeight - annot.Y ||
          bottom > annot.X + annot.Width
      );
      break;
    default:
      break;
  }

  return annotInCroppedArea;
};
