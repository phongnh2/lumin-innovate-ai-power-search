/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#setActiveSearchResult__anchor
 */

import { SearchResult } from './type';

export default (docViewer: Core.DocumentViewer, result: SearchResult): void => {
  docViewer.setActiveSearchResult(result);
};
