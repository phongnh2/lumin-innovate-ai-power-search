/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getSelectedTextQuads__anchor
 */

import { Quad } from './type';

export default (docViewer: Core.DocumentViewer): Quad[] => docViewer.getSelectedTextQuads() as Quad[];
