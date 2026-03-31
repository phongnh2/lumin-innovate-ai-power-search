export default (widgetAnnotation) => ({
  pageNumber: widgetAnnotation.PageNumber,
  x: widgetAnnotation.X + widgetAnnotation.Width / 2,
  y: widgetAnnotation.Y + widgetAnnotation.Height / 2,
});
