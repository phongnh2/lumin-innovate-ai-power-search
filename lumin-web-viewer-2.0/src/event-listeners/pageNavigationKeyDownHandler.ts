import core from 'core';

const isActiveInput = (element: EventTarget) =>
  element instanceof window.HTMLInputElement || element instanceof window.HTMLTextAreaElement;

const isActiveContentEditable = (element: Element) =>
  element.hasAttribute('contenteditable') && element.classList.contains('ql-editor');

const isViewerElement = (element: Node) => {
  const scrollViewElement = core.getScrollViewElement();
  const isViewerHorizontalScrollable = scrollViewElement.scrollWidth > scrollViewElement.clientWidth;

  return isViewerHorizontalScrollable && element.isEqualNode(core.getViewerElement());
};

const shouldBlockNavigate = (e: KeyboardEvent) => {
  const activeElement = e.target;

  return (
    isActiveInput(activeElement) ||
    isActiveContentEditable(activeElement as Element) ||
    isViewerElement(activeElement as Node)
  );
};

export const pageNavigationKeyDownHandler = (e: KeyboardEvent) => {
  if (e.metaKey || e.ctrlKey) {
    return;
  }

  const isRightArrow = e.key === 'ArrowRight' || e.which === 39;
  const isLeftArrow = e.key === 'ArrowLeft' || e.which === 37;
  if ((!isRightArrow && !isLeftArrow) || shouldBlockNavigate(e)) {
    return;
  }

  e.preventDefault();
  const currentPage = core.getCurrentPage();
  const totalPages = core.getTotalPages();

  if (isRightArrow) {
    if (currentPage < totalPages) {
      core.setCurrentPage(currentPage + 1);
    }
    return;
  }

  if (currentPage > 1) {
    core.setCurrentPage(currentPage - 1);
  }
};
