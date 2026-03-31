export function getCommentDimension(annotation: Core.Annotations.StickyAnnotation) {
  const rect = annotation.getRect();
  return new window.Core.Math.Rect(rect.x1, rect.y1 - annotation.Height, rect.x2, rect.y1);
}
