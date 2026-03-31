/* eslint-disable class-methods-use-this */

class PageOverlayUtil {
  private createPageOverlay(page: number) {
    const pageOverlayElement = document.createElement('div');
    pageOverlayElement.id = `pageOverlay-${page}`;
    pageOverlayElement.className = 'page-overlay';
    pageOverlayElement.style.position = 'absolute';
    pageOverlayElement.style.top = '0';
    pageOverlayElement.style.left = '0';
    pageOverlayElement.style.width = '100%';
    pageOverlayElement.style.height = '100%';
    pageOverlayElement.style.backgroundColor = 'var(--kiwi-colors-surface-surface)';
    pageOverlayElement.style.opacity = '0.5';
    pageOverlayElement.style.zIndex = '10';
    pageOverlayElement.style.pointerEvents = 'none';
    return pageOverlayElement;
  }

  private appendPageOverlay = (page: number) => {
    const pageContainer = document.getElementById(`pageWidgetContainer${page}`);
    if (!pageContainer) {
      return;
    }
    const pageOverlay = this.createPageOverlay(page);
    pageContainer.appendChild(pageOverlay);
  };

  applyPageOverlay = (page: number) => {
    this.appendPageOverlay(page);
  };

  removePageOverlay = (page: number) => {
    const pageOverlay = document.getElementById(`pageOverlay-${page}`);
    if (pageOverlay) {
      pageOverlay.remove();
    }
  };
}

export default new PageOverlayUtil();
