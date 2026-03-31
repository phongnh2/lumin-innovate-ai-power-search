export function drawCommentSelectionOutline(input: {
  ctx: CanvasRenderingContext2D,
  annotation: Core.Annotations.StickyAnnotation,
  zoom: number
}) {
  const { ctx, annotation, zoom } = input;
  const rotationAngle = window.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(annotation.Rotation);
  const currentRect = annotation.getRect();
  const rect = new window.Core.Math.Rect(
    currentRect.x1,
    currentRect.y1 - annotation.Height,
    currentRect.x2,
    currentRect.y1
  );
  const unrotatedBoundingBox = window.Core.Annotations.RotationUtils.getUnrotatedDimensionsFromRectangularAnnotations(
    rect,
    rotationAngle
  );
  ctx.beginPath();
  ctx.translate(unrotatedBoundingBox.x, unrotatedBoundingBox.y);
  ctx.lineWidth = window.Core.Annotations.SelectionModel.selectionOutlineThickness / zoom;
  ctx.strokeStyle = window.Core.Annotations.SelectionModel.defaultSelectionOutlineColor.toString();
  ctx.rect(0, 0, unrotatedBoundingBox.width, unrotatedBoundingBox.height);
  ctx.stroke();
}
