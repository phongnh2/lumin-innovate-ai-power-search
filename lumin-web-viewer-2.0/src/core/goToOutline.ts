/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#displayBookmark__anchor
 */
export default (docViewer: Core.DocumentViewer, outline: Core.Bookmark): void => {
  docViewer.displayBookmark(outline);
};
