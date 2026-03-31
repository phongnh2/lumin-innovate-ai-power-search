export default (docViewer: Core.DocumentViewer, visiblePages?: number[], currentPageNumber?: number): void =>
  docViewer.updateView(visiblePages, currentPageNumber);
