export const moveCursorToEnd = (contentElement: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  range.setStart(contentElement, contentElement.childNodes.length);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};
