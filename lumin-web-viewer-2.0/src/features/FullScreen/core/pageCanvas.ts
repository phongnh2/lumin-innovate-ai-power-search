import core from 'core';

// Define types for better reusability
type CanvasState = 'init' | 'processing' | 'complete';
type Rect = Record<'x1' | 'y1' | 'x2' | 'y2', number>;
type PartialCanvasItem = {
  canvas: HTMLCanvasElement;
  state: CanvasState;
  processId: number | string;
};

// Constants to avoid magic numbers
const SECTIONS_COUNT = 4;
const ROTATION_FULL_CIRCLE = 4; // 4rad = 360deg

/**
 * PageCanvas class handles the rendering of document pages by splitting them into sections
 * to improve performance. It manages canvas loading, drawing, and caching for a specific page.
 */
export class PageCanvas {
  /**
   * Splits a page into multiple rectangular sections for progressive loading
   * @param width - The width of the page
   * @param height - The height of the page
   * @returns An array of rectangular sections defined by their coordinates
   */
  static splitPage(width: number, height: number): Rect[] {
    // Calculate the height for each section and ensure it's an integer
    const baseHeight = Math.floor(height / SECTIONS_COUNT);

    // Calculate the remaining pixels to distribute
    const remainder = height - (baseHeight * SECTIONS_COUNT);

    // Create section heights array, distributing remainder pixels
    // to the first 'remainder' sections (adding 1 pixel to each)
    const sectionHeights = Array.from({ length: SECTIONS_COUNT })
      .fill(baseHeight)
      .map((h: number, i: number) => (i < remainder ? h + 1 : h));

    // Calculate y-coordinates for each section
    let currentY = 0;
    const sections: Rect[] = [];

    for (let i = 0; i < SECTIONS_COUNT; i++) {
      const sectionHeight = sectionHeights[i];
      sections.push({
        x1: 0,
        y1: currentY,
        x2: width,
        y2: currentY + sectionHeight,
      });
      currentY += sectionHeight;
    }

    return sections;
  }

  /** Array of canvas sections and their loading states */
  private partialCanvas: PartialCanvasItem[];

  private renderedPart = Array.from({ length: SECTIONS_COUNT }, () => false);

  /**
   * Creates a new PageCanvas instance for a specific page
   * @param page - The page number to render (1-based index)
   * @throws Error if page number is invalid
   */
  constructor(private page: number) {
    if (page <= 0) {
      throw new Error('Page number must be greater than 0');
    }

    this.partialCanvas = Array.from({ length: SECTIONS_COUNT }, () => ({
      canvas: undefined,
      processId: undefined,
      state: 'init',
    }));
  }

  /**
   * Calculates the dimensions for the canvas based on the page size and container size
   * @param width - Original page width
   * @param height - Original page height
   * @returns Canvas dimensions and zoom factor
   * @throws Error if width or height is invalid
   */
  // eslint-disable-next-line class-methods-use-this
  private calculateCanvasDimensions(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be greater than 0');
    }

    const pageRatio = width / height;
    const containerWidth = window.screen.width;
    const containerHeight = window.screen.height;
    const canvasDimension =
      pageRatio > 1
        ? { width: containerWidth, height: containerWidth / pageRatio }
        : { width: containerHeight * pageRatio, height: containerHeight };
    const zoom = canvasDimension.width / width;
    return { ...canvasDimension, zoom };
  }

  /**
   * Checks if all canvas sections are available for drawing
   * @returns True if all sections are complete, false otherwise
   */
  public isAvailableToDraw(): boolean {
    return this.partialCanvas.every((item) => item.state === 'complete');
  }

  /**
   * Renders the cached content to the target canvas
   * @param canvas - The target canvas element to render to
   * @throws Error if canvas is not provided or rendering fails
   */
  public renderCachedContent(canvas: HTMLCanvasElement): void {
    if (!canvas) {
      throw new Error('Canvas element is required');
    }

    const { width, height } = core.getPageInfo(this.page);
    const { width: canvasWidth, height: canvasHeight, zoom } = this.calculateCanvasDimensions(width, height);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    this.partialCanvas.forEach(({ canvas: sourceCanvas }, index) => {
      if (!sourceCanvas) {
        return;
      }

      this.draw({
        targetCanvas: canvas,
        location: { x: 0, y: (canvas.height / SECTIONS_COUNT) * index },
        sourceCanvas,
      });
    });
    this.drawAnnotation(canvas, zoom);
  }

  /**
   * Draws a source canvas onto a target canvas at the specified location
   * @param input - Object containing target canvas, source canvas, and location
   * @returns This instance for method chaining
   */
  public draw = (input: {
    targetCanvas: HTMLCanvasElement;
    location: { x: number; y: number };
    sourceCanvas: HTMLCanvasElement;
  }): this => {
    const { targetCanvas, location, sourceCanvas } = input;

    if (!targetCanvas || !sourceCanvas) {
      return this;
    }

    const context = targetCanvas.getContext('2d');
    context.drawImage(
      sourceCanvas,
      location.x,
      Math.round(location.y),
      targetCanvas.width,
      Math.round(targetCanvas.height / SECTIONS_COUNT)
    );
    return this;
  };

  /**
   * Draws annotations onto the target canvas
   * @param targetCanvas - The canvas to draw annotations on
   * @param zoom - The zoom level for the annotations
   */
  public drawAnnotation = (targetCanvas: HTMLCanvasElement, zoom: number): void => {
    if (!targetCanvas) {
      return;
    }

    const context = targetCanvas.getContext('2d');
    let rotation = core.getCompleteRotation(this.page) - core.getRotation(this.page);
    if (rotation < 0) {
      rotation += ROTATION_FULL_CIRCLE;
    }
    core.setAnnotationCanvasTransform(context, zoom / 2, rotation);
    core
      .drawAnnotations({
        pageNumber: this.page,
        overrideCanvas: targetCanvas,
        majorRedraw: false,
      })
      .catch(() => {});
  };

  /**
   * Draws a partial canvas to the target and finalizes if all sections are complete
   * @param params - Object containing all needed parameters
   */
  private drawAndFinalize(params: {
    targetCanvas: HTMLCanvasElement;
    sourceCanvas: HTMLCanvasElement;
    index: number;
    zoom: number;
    onFinishDraw: () => void;
  }): void {
    const { targetCanvas, sourceCanvas, index, zoom, onFinishDraw } = params;

    if (!targetCanvas || !sourceCanvas) {
      return;
    }

    this.draw({
      targetCanvas,
      location: { x: 0, y: (targetCanvas.height / SECTIONS_COUNT) * index },
      sourceCanvas,
    });

    this.renderedPart[index] = true;

    if (this.renderedPart.every((Boolean))) {
      this.drawAnnotation(targetCanvas, zoom);
      onFinishDraw();
    }
  }

  /**
   * Loads data for the page and renders it to the target canvas
   * @param targetCanvas - The canvas to render to
   * @param onFinishDraw - Callback function to be called when drawing is complete
   * @throws Error if targetCanvas or onFinishDraw is not provided
   */
  public loadData(targetCanvas: HTMLCanvasElement, onFinishDraw: () => void): void {
    this.renderedPart = Array.from({ length: SECTIONS_COUNT }, () => false);
    const { width, height } = core.getPageInfo(this.page);
    const { width: canvasWidth, height: canvasHeight, zoom } = this.calculateCanvasDimensions(width, height);
    targetCanvas.width = canvasWidth;
    targetCanvas.height = canvasHeight;

    PageCanvas.splitPage(width, height).forEach((section, index) => {
      if (this.partialCanvas[index].state === 'complete' && core.getCurrentPage() === this.page) {
        this.drawAndFinalize({
          targetCanvas,
          sourceCanvas: this.partialCanvas[index].canvas,
          index,
          zoom,
          onFinishDraw,
        });
        return;
      }

      this.partialCanvas[index].state = 'processing';
      this.partialCanvas[index].processId = core.getDocument().loadCanvas({
        pageNumber: this.page,
        allowUseOfOptimizedThumbnail: true,
        renderRect: section,
        zoom,
        drawComplete: (sourceCanvas: HTMLCanvasElement) => {
          this.partialCanvas[index].canvas = sourceCanvas;
          this.partialCanvas[index].state = 'complete';
          this.partialCanvas[index].processId = undefined;

          if (core.getCurrentPage() === this.page) {
            this.drawAndFinalize({
              targetCanvas,
              sourceCanvas,
              index,
              zoom,
              onFinishDraw,
            });
          }
        },
      });
    });
  }

  /**
   * Preloads canvas sections for the page without rendering
   * This improves performance when the page is viewed later
   */
  public preload(): void {
    const { width, height } = core.getPageInfo(this.page);
    const { zoom } = this.calculateCanvasDimensions(width, height);

    PageCanvas.splitPage(width, height).forEach((section, index) => {
      this.partialCanvas[index].state = 'processing';
      this.partialCanvas[index].processId = core.getDocument().loadCanvas({
        pageNumber: this.page,
        allowUseOfOptimizedThumbnail: true,
        renderRect: section,
        zoom,
        drawComplete: (sourceCanvas: HTMLCanvasElement) => {
          this.partialCanvas[index].canvas = sourceCanvas;
          this.partialCanvas[index].state = 'complete';
          this.partialCanvas[index].processId = undefined;
        },
      });
    });
  }

  /**
   * Cancels any in-progress canvas loading operations
   * Should be called when navigating away from the page
   */
  public cancelLoading(): void {
    this.partialCanvas.forEach(({ processId }) => {
      if (processId) {
        core.getDocument().cancelLoadCanvas(processId as number);
      }
    });
  }
}
