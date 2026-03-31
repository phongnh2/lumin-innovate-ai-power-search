/**
 * https://www.pdftron.com/api/web/Core.DocumentViewer.html#getPDFCoordinatesFromMouseEvent__anchor
 */
import { PDFCoordinates } from './type';

export default (docViewer: Core.DocumentViewer, mouseEvent: MouseEvent): PDFCoordinates =>
  docViewer.getPDFCoordinatesFromMouseEvent(mouseEvent) as PDFCoordinates;
