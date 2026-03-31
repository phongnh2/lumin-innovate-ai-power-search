/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#drawAnnotations__anchor
 */

import { DrawAnnotationsOption } from './type';

export default async (docViewer: Core.DocumentViewer, options: DrawAnnotationsOption): Promise<void> =>
  (await docViewer.getAnnotationManager().drawAnnotations(options)) as unknown as void;
