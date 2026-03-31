/**
 * https://docs.apryse.com/api/web/Core.MeasurementManager.html#deleteScale__anchor
 */
export default (docViewer: Core.DocumentViewer, scale: Core.Scale) => {
  docViewer.getMeasurementManager().deleteScale(scale);
};
