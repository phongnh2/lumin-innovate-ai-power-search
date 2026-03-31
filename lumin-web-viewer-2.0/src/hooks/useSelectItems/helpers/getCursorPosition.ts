import { findIndex } from 'lodash';

const getStartCursor = ({ lastSelectedIndex, currentItemIndex }: { lastSelectedIndex: number, currentItemIndex: number }) =>
  Math.min(lastSelectedIndex, currentItemIndex) + (lastSelectedIndex <= currentItemIndex ? 1 : 0);

const getLastCursor = ({ lastSelectedIndex, currentItemIndex }: { lastSelectedIndex: number, currentItemIndex: number }) =>
  Math.max(lastSelectedIndex, currentItemIndex) - (lastSelectedIndex >= currentItemIndex ? 1 : 0);

const getCursorPosition = ({ items, lastSelectedDocId, currentItemId }: { items: unknown[], lastSelectedDocId: string, currentItemId: string }) => {
  const lastSelectedIndex = findIndex(items, { _id: lastSelectedDocId });
  const currentItemIndex = findIndex(items, { _id: currentItemId });
  const start = getStartCursor({ lastSelectedIndex, currentItemIndex });
  const end = getLastCursor({ lastSelectedIndex, currentItemIndex });
  return { start, end };
};

export default getCursorPosition;
