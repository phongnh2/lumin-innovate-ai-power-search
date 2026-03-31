import { ZoomToMouseInput } from './type';
/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#zoomToMouse__anchor
 * @fires fitModeUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#event:fitModeUpdated__anchor
 * @fires zoomUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#event:zoomUpdated__anchor
 */

export default (
  docViewer: Core.DocumentViewer,
  { zoomFactor, offsetX = 0, offsetY = 0, event }: ZoomToMouseInput
): void => {
  docViewer.zoomToMouse(zoomFactor, offsetX, offsetY, event);
};
