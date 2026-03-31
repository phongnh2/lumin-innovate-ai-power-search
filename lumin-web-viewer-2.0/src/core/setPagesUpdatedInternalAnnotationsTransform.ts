/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#setPagesUpdatedInternalAnnotationsTransform__anchor
 */

import { PagesInternalAnnotationsTransformHandler } from './type';

export default (docViewer: Core.DocumentViewer, callback: PagesInternalAnnotationsTransformHandler): void => {
  docViewer.setPagesUpdatedInternalAnnotationsTransform(callback);
};
