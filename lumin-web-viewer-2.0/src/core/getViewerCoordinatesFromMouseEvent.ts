/**
 * https://www.pdftron.com/api/web/Core.DocumentViewer.html#getViewerCoordinatesFromMouseEvent__anchor
 */

import { PDFCoordinates } from './type';

export default (docViewer: Core.DocumentViewer, mouseEvent: MouseEvent): PDFCoordinates =>
  docViewer.getViewerCoordinatesFromMouseEvent(mouseEvent) as PDFCoordinates;
