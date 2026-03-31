// https://docs.apryse.com/api/web/Core.Document.html#getTextPosition__anchor

export default (
  docViewer: Core.DocumentViewer,
  pageNumber: number,
  textStartIndex: number,
  textEndIndex: number
): Promise<object[]> => docViewer.getDocument().getTextPosition(pageNumber, textStartIndex, textEndIndex);
