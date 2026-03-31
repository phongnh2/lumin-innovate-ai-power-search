/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#insertBlankPages__anchor
 */
import { ManipulationPageResult } from './type';

export default async (
  docViewer: Core.DocumentViewer,
  pageArray: number[],
  sizePage: Core.Document.PageInfo
): Promise<ManipulationPageResult> => {
  const { width, height }: Core.Document.PageInfo = sizePage || docViewer.getDocument().getPageInfo(0);
  return (await docViewer
    .getDocument()
    .insertBlankPages(pageArray, Math.min(width, height), Math.max(width, height))) as ManipulationPageResult;
};
