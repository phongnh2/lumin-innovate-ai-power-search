/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#rotatePages__anchor
 * @fires pagesUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/Core.DocumentViewer.html#event:pagesUpdated
 */
import { ManipulationPageResult } from './type';

export default async (
  docViewer: Core.DocumentViewer,
  pageArray: number[],
  rotation: Core.PageRotation
): Promise<ManipulationPageResult> =>
  (await docViewer.getDocument().rotatePages(pageArray, rotation)) as ManipulationPageResult;
