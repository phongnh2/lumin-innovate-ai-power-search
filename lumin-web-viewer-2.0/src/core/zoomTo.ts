/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#zoomTo__anchor
 * @fires fitModeUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#event:fitModeUpdated__anchor
 * @fires zoomUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#event:zoomUpdated__anchor
 */
export default (docViewer: Core.DocumentViewer, zoomFactor: number, x?: number, y?: number): void => {
  docViewer.zoomTo(zoomFactor, x, y);
};
