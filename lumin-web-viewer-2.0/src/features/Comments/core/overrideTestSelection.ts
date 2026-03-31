export function testCommentAnnotationDimension(input: {
  annotation: Core.Annotations.StickyAnnotation,
  zoom: number,
  rotation: Core.PageRotation,
  x: number,
  y: number
}) {
  const { annotation, zoom, rotation, x, y } = input;
  let annotX = annotation.X;
  let annotY = annotation.Y;
  const size = annotation.Width / zoom;
  switch (rotation) {
    case window.Core.PageRotation.E_0: {
      annotY -= size;
      break;
    }
    case window.Core.PageRotation.E_90: {
      annotX -= size;
      annotY -= size;
      break;
    }
    case window.Core.PageRotation.E_180: {
      annotX -= size;
      break;
    }
    case window.Core.PageRotation.E_270: {
      break;
    }
    default: {
      break;
    }
  }
  const { x1, x2, y1, y2 } = new window.Core.Math.Rect(annotX, annotY, annotX + size, annotY + size);
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}
