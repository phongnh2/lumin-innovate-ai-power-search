export const computeAngle = (annotation: Core.Annotations.LineAnnotation) => {
  if (!annotation || !(annotation instanceof Core.Annotations.LineAnnotation)) {
    return 0;
  }
  let angleInRadians = annotation.getAngle();
  // Multiply by -1 to achieve 0-360 degrees counterclockwise
  angleInRadians *= -1;
  angleInRadians = angleInRadians < 0 ? angleInRadians + 2 * Math.PI : angleInRadians;
  return ((angleInRadians / Math.PI) * 180).toFixed(2);
};
