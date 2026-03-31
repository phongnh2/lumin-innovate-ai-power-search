/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#textSearchInit__anchor
 */
export default (
  docViewer: Core.DocumentViewer,
  pattern: string,
  mode: number,
  searchOptions?: {
    fullSearch?: boolean;
    onResult?: (...params: unknown[]) => unknown;
    onPageEnd?: (...params: unknown[]) => unknown;
    onDocumentEnd?: (...params: unknown[]) => unknown;
    onError?: (...params: unknown[]) => unknown;
    startPage?: number;
    endPage?: number;
  }
): void => {
  docViewer.textSearchInit(pattern, mode, searchOptions);
};
