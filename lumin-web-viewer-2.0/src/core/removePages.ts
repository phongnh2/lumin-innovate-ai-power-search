/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#removePages__anchor
 * @fires pagesUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/Core.DocumentViewer.html#event:pagesUpdated
 */
import { ManipulationPageResult } from './type';

export default async (docViewer: Core.DocumentViewer, arr: number[]): Promise<ManipulationPageResult> =>
  (await docViewer.getDocument().removePages(arr)) as ManipulationPageResult;
