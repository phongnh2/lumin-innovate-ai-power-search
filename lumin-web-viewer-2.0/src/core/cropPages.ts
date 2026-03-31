/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#cropPages__anchor
 */

import { ManipulationPageResult } from './type';

export default async (
  docViewer: Core.DocumentViewer,
  pageArray: number[],
  topMargin: number,
  botMargin: number,
  leftMargin: number,
  rightMargin: number
): Promise<ManipulationPageResult> =>
  (await docViewer
    .getDocument()
    .cropPages(pageArray, topMargin, botMargin, leftMargin, rightMargin)) as ManipulationPageResult;
