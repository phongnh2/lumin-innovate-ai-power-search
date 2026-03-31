export const parseMeasurementByAnnotation = (annotation: Core.Annotations.LineAnnotation) => {
  const { factor, unit } = annotation.Measure.axis[0];

  switch (unit) {
    case 'ft-in':
      return (annotation.getLineLength() * factor) / 12;
    case 'in':
    default:
      return annotation.getLineLength() * factor;
  }
};
