export const getTop = (top, windowSize) => {
  if (top < 0) {
    return 200;
  }
  if (windowSize && windowSize.height < 700 && top > 240) {
    return 240;
  }
  if (windowSize && windowSize.width < 1050 && top > 180) {
    return top - 50;
  }
  return top;
};

export const getLeft = (left, annotation, windowSize) => {
  const WIDTH_ANNOTATION_POPUP = 400;
  const rightAnnotation = Number(annotation.X + annotation.Width);
  const widthAnnotation = annotation.getWidth();
  if (windowSize && windowSize.width < 1050) {
    if (rightAnnotation > 490) {
      return Math.abs(left - WIDTH_ANNOTATION_POPUP);
    }
    return left + widthAnnotation / 2 + 45;
  }
  if (windowSize && windowSize.width < 1500 && rightAnnotation > 450) {
    return Math.abs(left - widthAnnotation - WIDTH_ANNOTATION_POPUP);
  }
  return left + widthAnnotation / 2 + 45;
};

export const getPosition = ({ left, top, annotation, windowSize }) => [
  getLeft(left, annotation, windowSize),
  getTop(top, windowSize),
];
