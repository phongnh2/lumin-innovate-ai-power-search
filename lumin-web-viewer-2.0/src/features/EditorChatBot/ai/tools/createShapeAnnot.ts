import core from 'core';

export async function createShapeAnnot(data: {
  page: number;
  shape: {
    type: 'rectangle' | 'circle';
    x: number;
    y: number;
    width: number;
    height: number;
  };
}) {
  const { page, shape } = data;
  const { type, x, y, width, height } = shape;
  const constructor =
    type === 'rectangle' ? window.Core.Annotations.RectangleAnnotation : window.Core.Annotations.EllipseAnnotation;
  const annot = new constructor({
    PageNumber: page,
    X: x,
    Y: y,
    Width: width,
    Height: height,
  });
  core.addAnnotations([annot]);
  await core.getAnnotationManager().drawAnnotationsFromList([annot]);
  return 'Create shape success';
}
