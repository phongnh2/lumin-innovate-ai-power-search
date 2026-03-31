/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#movePages__anchor
 * @fires pagesUpdated on DocumentViewer
 * @see https://www.pdftron.com/api/web/Core.DocumentViewer.html#event:pagesUpdated
 */
import { ManipulationPageResult } from './type';

export default async (docViewer: Core.DocumentViewer, pageArray: number[], insertBeforeThisPage: number): Promise<ManipulationPageResult> =>
  (await docViewer.getDocument().movePages(pageArray, insertBeforeThisPage)) as ManipulationPageResult;
