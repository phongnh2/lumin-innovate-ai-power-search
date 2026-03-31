/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#displayAdditionalSearchResult__anchor
 */

import { SearchResult } from './type';

export default (docViewer: Core.DocumentViewer, result: SearchResult[]): void => {
  docViewer.displayAdditionalSearchResult(result);
};
