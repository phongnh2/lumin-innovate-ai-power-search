function recalculateStickyElementsTop(stickyElements: HTMLElement[], zIndex: string): void {
  let top = 0;

  stickyElements.forEach((element) => {
    element.style.position = 'sticky';
    element.style.top = `${top}px`;
    element.style.zIndex = zIndex;

    const rect = element.getBoundingClientRect();
    top += rect.height;
  });
}

export function initializeStickyElements(
  containerElement: HTMLElement,
  stickySelector: string,
  options: { zIndex?: string } = {}
): void {
  const stickyElements: HTMLElement[] = Array.from(containerElement.querySelectorAll<HTMLElement>(stickySelector));
  const zIndex = options.zIndex || '100';

  recalculateStickyElementsTop(stickyElements, zIndex);

  window.addEventListener('resize', () => recalculateStickyElementsTop(stickyElements, zIndex));
}
