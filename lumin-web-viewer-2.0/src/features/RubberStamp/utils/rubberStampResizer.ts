const DEFAULT_PREVIEW_ELEMENT_HEIGHT = 40;

export const resizeRubberStampPreview = async ({
  rubberStampPreviewElement,
}: {
  rubberStampPreviewElement: HTMLElement;
}): Promise<void> => {
  rubberStampPreviewElement.dataset.isStandardStamp = 'true';
  const imageElement = rubberStampPreviewElement.querySelector('img');
  if (!imageElement.complete || imageElement.naturalWidth === 0) {
    await new Promise<void>((resolve) => {
      imageElement.onload = () => resolve();
    });
  }

  const aspectRatio: number = imageElement.naturalWidth / imageElement.naturalHeight;
  const maxWidth: number = DEFAULT_PREVIEW_ELEMENT_HEIGHT * aspectRatio;

  rubberStampPreviewElement.style.setProperty('--max-width', `${maxWidth}px`);
};

export default resizeRubberStampPreview;
