/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#setInternalAnnotationsTransform__anchor
 */
import { InternalAnnotationsTransformHandler } from './type';

export default (docViewer: Core.DocumentViewer, callback: InternalAnnotationsTransformHandler): void => {
  docViewer.setInternalAnnotationsTransform(callback);
};
