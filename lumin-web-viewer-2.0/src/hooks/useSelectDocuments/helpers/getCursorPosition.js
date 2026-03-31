import { findIndex } from 'lodash';

const getStartCursor = ({ lastSelectedIndex, currentDocIndex }) =>
  Math.min(lastSelectedIndex, currentDocIndex) + (lastSelectedIndex <= currentDocIndex ? 1 : 0);

const getLastCursor = ({ lastSelectedIndex, currentDocIndex }) =>
  Math.max(lastSelectedIndex, currentDocIndex) - (lastSelectedIndex >= currentDocIndex ? 1 : 0);

const getCursorPosition = ({ documentList, lastSelectedDocId, currentDocumentId }) => {
  const lastSelectedIndex = findIndex(documentList, { _id: lastSelectedDocId });
  const currentDocIndex = findIndex(documentList, { _id: currentDocumentId });
  const start = getStartCursor({ lastSelectedIndex, currentDocIndex });
  const end = getLastCursor({ lastSelectedIndex, currentDocIndex });
  return { start, end };
};

export default getCursorPosition;
